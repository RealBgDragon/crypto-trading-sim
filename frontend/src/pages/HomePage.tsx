import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Moon, Search, Sun, ExternalLink, Clock, AlertCircle, LogOut, User, LogIn, RefreshCcw, Check } from 'lucide-react';
import axios from 'axios';

// Map of crypto names to Kraken symbols
const krakenSymbolMap: { [key: string]: string } = {
    Bitcoin: "XBT_USD",
    Ethereum: "ETH_USD",
    Tether: "USDT_USD",
    Tron: "TRX_USD",
    Solana: "SOL_USD",
    XRP: "XRP_USD",
    USDC: "USDC_USD",
    Cardano: "ADA_USD",
    Avalanche: "AVAX_USD",
    Akash: "AKT_USD",
    Polkadot: "DOT_USD",
    "Shiba Inu": "SHIB_USD",
    Polygon: "MATIC_USD",
    Dai: "DAI_USD",
    Litecoin: "LTC_USD",
    Chainlink: "LINK_USD",
    Cosmos: "ATOM_USD",
    Stellar: "XLM_USD",
    Uniswap: "UNI_USD",
    Monero: "XMR_USD"
};

// Crypto list with additional metadata
const cryptoList = [
    { name: "Bitcoin", symbol: "BTC", color: "#F7931A" },
    { name: "Ethereum", symbol: "ETH", color: "#627EEA" },
    { name: "Tether", symbol: "USDT", color: "#26A17B" },
    { name: "Tron", symbol: "TRX", color: "#EF0027" },
    { name: "Solana", symbol: "SOL", color: "#00FFA3" },
    { name: "XRP", symbol: "XRP", color: "#00AAE4" },
    { name: "USDC", symbol: "USDC", color: "#2775CA" },
    { name: "Cardano", symbol: "ADA", color: "#0033AD" },
    { name: "Avalanche", symbol: "AVAX", color: "#E84142" },
    { name: "Akash", symbol: "AKT", color: "#00D1FF" },
    { name: "Polkadot", symbol: "DOT", color: "#E6007A" },
    { name: "Shiba Inu", symbol: "SHIB", color: "#FFA409" },
    { name: "Polygon", symbol: "MATIC", color: "#8247E5" },
    { name: "Dai", symbol: "DAI", color: "#F5AC37" },
    { name: "Litecoin", symbol: "LTC", color: "#345D9D" },
    { name: "Chainlink", symbol: "LINK", color: "#2A5ADA" },
    { name: "Cosmos", symbol: "ATOM", color: "#2E3148" },
    { name: "Stellar", symbol: "XLM", color: "#7D00FF" },
    { name: "Uniswap", symbol: "UNI", color: "#FF007A" },
    { name: "Monero", symbol: "XMR", color: "#FF6600" }
];

const initialChartData = Array.from({ length: 25 }, (_, i) => ({
    date: `${120 - i * 5}s`,
    price: 0,
}));



const getRandomElements = (array: { name: string; symbol: string; color: string; }[], n: number | undefined) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

export default function CryptoDashboard() {
    const [darkMode, setDarkMode] = useState(true);
    const [selectedCrypto, setSelectedCrypto] = useState("Bitcoin");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState(initialChartData);
    const [timeframe, setTimeframe] = useState("24h");
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [showNotification, setShowNotification] = useState(false);
    const [apiStatus, setApiStatus] = useState(false);
    const [topCurrencies, setTopCurrencies] = useState(cryptoList);
    const [accountBalance, setAccountBalance] = useState<number | string>(0);
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [balanceResetStatus, setBalanceResetStatus] = useState<string | null>(null);
    const [buyAmount, setBuyAmount] = useState("");
    const [tradeStatus, setTradeStatus] = useState<string | null>(null);
    const [holdings, setHoldings] = useState<any[]>([]);
    const [sellAmount, setSellAmount] = useState("");

    type PricePoint = {
        date: string;
        price: number;
    };

    const [topCurrencyPrices, setTopCurrencyPrices] = useState<Record<string, PricePoint[]>>({});

    // Theme-based style variables
    const themeColors = darkMode ? {
        background: "bg-gray-900",
        card: "bg-gray-800",
        cardHover: "hover:bg-gray-700",
        text: "text-gray-100",
        textSecondary: "text-gray-300",
        textMuted: "text-gray-400",
        border: "border-gray-700",
        borderAccent: "border-blue-800",
        buttonBg: "bg-gray-700",
        buttonHover: "hover:bg-gray-600",
        selectedBg: "bg-blue-600/80",
        chartGrid: "#334155",
        input: "bg-gray-700 text-gray-100"
    } : {
        background: "bg-gray-50",
        card: "bg-white",
        cardHover: "hover:bg-gray-100",
        text: "text-gray-800",
        textSecondary: "text-gray-600",
        textMuted: "text-gray-500",
        border: "border-gray-200",
        borderAccent: "border-blue-300",
        buttonBg: "bg-gray-200",
        buttonHover: "hover:bg-gray-300",
        selectedBg: "bg-blue-500/80",
        chartGrid: "#e2e8f0",
        input: "bg-gray-100 text-gray-800"
    };

    useEffect(() => {
        // Check if user is logged in
        const user = sessionStorage.getItem("user");

        if (user) {
            try {
                const userData = JSON.parse(user);
                setUsername(userData.username || "User");
                setUserId(userData.userId);
                setIsLoggedIn(userData.isLoggedIn);
            } catch (e) {
                setUsername(user);
            }
        }

        // Connect api on page load
        axios.get(`http://localhost:8080/api/status`)
            .then(() => setApiStatus(true))
            .catch(err => console.log('Error connecting to API: ', err));

        const nonCurrentCryptos = cryptoList.filter(crypto => crypto.name !== selectedCrypto);
        const randomTopCurrencies = getRandomElements(nonCurrentCryptos, 6);
        setTopCurrencies(randomTopCurrencies);
    }, [selectedCrypto, username]);

    useEffect(() => {
        if (userId) {
            axios.post("http://localhost:8080/api/user/balance", { userId: userId })
                .then(res => {
                    if (typeof res.data === 'number') {
                        setAccountBalance(res.data);
                    } else {
                        setAccountBalance("Error getting balance");
                    }
                })
                .catch(() => setAccountBalance(0));

            // Fetch user holdings when user ID is available
            fetchUserHoldings();
        }
    }, [userId]);

    const getItemPrice = async (pair: string) => {
        const res = await axios.get(`http://localhost:8080/api/price/${pair}`);
        return res;
    }

    const [startTime, setStartTime] = useState(Date.now());

    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const pair = krakenSymbolMap[selectedCrypto];

            try {
                const res = await getItemPrice(pair);
                const lastPrice = res.data.price;

                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

                setChartData(prevData => {
                    const newPoint = {
                        date: `0s`,
                        price: lastPrice,
                    };

                    const updatedChart = [...prevData.slice(1), newPoint]; // remove first, push new

                    // Update timestamps counting down from 120s
                    const updatedWithTime = updatedChart.map((point, idx) => ({
                        ...point,
                        date: `${(updatedChart.length - 1 - idx) * 5}s`,
                    }));

                    return updatedWithTime;
                });


                const topCurrencyData = await Promise.all(
                    topCurrencies.map(async (c) => {
                        const symbol = krakenSymbolMap[c.name];
                        const price = await getItemPrice(symbol);
                        return price;
                    })
                );

                setTopCurrencyPrices(prevPrices => {
                    const updated = { ...prevPrices };
                    topCurrencyData.forEach((currency) => {
                        const symbol = currency.data.pair;
                        const price = currency.data.price;

                        const prev = updated[symbol] || [];
                        const newPoint = {
                            date: `${elapsedSeconds}s`,
                            price: price,
                        };

                        const updatedPoints = [...prev, newPoint];
                        if (updatedPoints.length > 30) updatedPoints.shift();

                        updated[symbol] = updatedPoints;
                    });
                    return updated;
                });

                setLastUpdated(new Date());
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();

        // adding 5 second update interval
        const intervalId = setInterval(fetchData, 5000);

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, [selectedCrypto, timeframe, topCurrencies]);

    const filteredCryptos = cryptoList.filter(crypto =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.reload();
    }

    const handleResetBalance = async () => {
        if (!userId) {
            setBalanceResetStatus("Error: You must be logged in");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post("http://localhost:8080/api/user/balance/recover", {
                userId: userId
            });

            if (response.status === 200) {
                // Refresh the balance after reset
                const balanceResponse = await axios.post("http://localhost:8080/api/user/balance", {
                    userId: userId
                });

                if (typeof balanceResponse.data === 'number') {
                    setAccountBalance(balanceResponse.data);
                }

                setBalanceResetStatus("Balance successfully reset!");
                setTimeout(() => setBalanceResetStatus(null), 3000);
            }
        } catch (error) {
            console.error("Error resetting balance:", error);
            setBalanceResetStatus("Failed to reset balance");
            setTimeout(() => setBalanceResetStatus(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const buyCrypto = async (cryptoSymbol: string, amount: string, currentPrice: number) => {
        if (!userId) {
            setTradeStatus("Error: You must be logged in");
            return;
        }

        try {
            setIsLoading(true);

            // Format the amount as a number with limited decimal places
            const parsedAmount = parseFloat(parseFloat(amount).toFixed(8));

            const response = await axios.post("http://localhost:8080/api/trade/buy", {
                userId: userId,
                cryptoSymbol: cryptoSymbol,
                amount: parsedAmount,
                priceAtTransaction: currentPrice
            });

            if (response.status === 200) {
                // Update the account balance
                setAccountBalance(response.data.newBalance);

                // Update the holdings display if needed
                await fetchUserHoldings();

                setTradeStatus(`Successfully purchased ${parsedAmount} ${cryptoSymbol}!`);
                setBuyAmount(""); // Clear the input field
                setTimeout(() => setTradeStatus(null), 3000);
            }
        } catch (error: any) {
            console.error("Error buying crypto:", error);
            const errorMessage = error.response?.data || "Failed to process purchase";
            setTradeStatus(`Error: ${errorMessage}`);
            setTimeout(() => setTradeStatus(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserHoldings = async () => {
        if (!userId) return;

        try {
            const response = await axios.get(`http://localhost:8080/api/trade/holdings/${userId}`);
            if (response.status === 200) {
                setHoldings(response.data);
            }
        } catch (error) {
            console.error("Error fetching holdings:", error);
        }
    };

    const sellCrypto = async (cryptoSymbol, amount, currentPrice) => {
        if (!userId) {
            setTradeStatus("Error: You must be logged in");
            return;
        }

        try {
            setIsLoading(true);

            const parsedAmount = parseFloat(parseFloat(amount).toFixed(8));

            const response = await axios.post("http://localhost:8080/api/trade/sell", {
                userId: userId,
                cryptoSymbol: cryptoSymbol,
                amount: parsedAmount,
                priceAtTransaction: currentPrice
            });

            if (response.status === 200) {
                // Update the account balance
                setAccountBalance(response.data.newBalance);

                await fetchUserHoldings();

                const profitLoss = response.data.profitLoss;
                const isProfitable = profitLoss.isProfitable;
                const profitLossAmount = profitLoss.profitLoss.toFixed(2);
                const profitLossPercentage = profitLoss.profitLossPercentage.toFixed(2);

                const statusMessage = isProfitable
                    ? `Successfully sold ${parsedAmount} ${cryptoSymbol}! Profit: $${profitLossAmount} (${profitLossPercentage}%)`
                    : `Successfully sold ${parsedAmount} ${cryptoSymbol}! Loss: $${Math.abs(profitLossAmount).toFixed(2)} (${Math.abs(profitLossPercentage).toFixed(2)}%)`;

                setTradeStatus(statusMessage);
                setSellAmount(""); // Clear the input field
                setTimeout(() => setTradeStatus(null), 5000);
            }
        } catch (error) {
            console.error("Error selling crypto:", error);
            const errorMessage = error.response?.data || "Failed to process sale";
            setTradeStatus(`Error: ${errorMessage}`);
            setTimeout(() => setTradeStatus(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const priceChange = chartData[chartData.length - 1]?.price - chartData[0]?.price;
    const positiveChange = priceChange >= 0;
    const changePercent = ((priceChange / chartData[0]?.price) * 100).toFixed(2);
    const currentCrypto = cryptoList.find(c => c.name === selectedCrypto);
    const chartColor = currentCrypto?.color || "#3b82f6";

    return (
        <div className={`min-h-screen ${themeColors.background} ${themeColors.text} transition-colors duration-200`}>
            {/* Header */}
            <header className={`${themeColors.card} ${themeColors.borderAccent} border-b fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-opacity-90`}>
                <div className="container mx-auto flex justify-between items-center py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Crypto<strong>Vision</strong>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Account Balance */}
                        {username && (
                            <div className="flex items-center gap-2">
                                <div className={`${themeColors.card} px-4 py-2 rounded-lg border ${themeColors.border} shadow-md hidden md:block`}>
                                    <div className="text-xs uppercase font-semibold opacity-70">Balance</div>
                                    <div className="font-mono font-bold text-lg">
                                        {accountBalance.toLocaleString()}
                                        <span className="text-xs ml-1 opacity-60">$</span>
                                    </div>
                                </div>

                                {/* Reset Balance Button */}
                                <button
                                    onClick={handleResetBalance}
                                    disabled={isLoading}
                                    className={`hidden md:flex items-center gap-1 px-3 py-2 rounded-lg border ${themeColors.border} 
                                ${themeColors.card} ${themeColors.cardHover} shadow-md transition-colors hover:text-blue-400`}
                                    title="Reset to starting balance"
                                >
                                    <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
                                    <span className="text-sm font-medium">Reset</span>
                                </button>
                            </div>
                        )}

                        {/* API Status Indicator */}
                        <div
                            className={`text-xs px-3 py-1 rounded ${apiStatus
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' // When connected
                                : 'bg-red-500/10 text-red-400 border border-red-500/20' // When not connected
                                } hidden md:block`}
                        >
                            {apiStatus ? 'API Connected' : 'API Not Connected'}
                        </div>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-full ${themeColors.buttonBg} ${themeColors.buttonHover} focus:outline-none shadow-md`}
                        >
                            {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-600" size={20} />}
                        </button>

                        {/* Improved Login Button */}
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300`}
                            >
                                <User size={18} />
                                <span>Hello, {username}</span>
                                <LogOut size={18} />
                            </button>
                        ) : (
                            <a
                                href='http://localhost:5173/login'
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300`}
                            >
                                <LogIn size={18} />
                                <span>Login</span>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* Notification */}
            {showNotification && (
                <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out flex items-center">
                    <RefreshCw size={16} className="mr-2" />
                    Data updated successfully
                </div>
            )}

            {/* Main Content */}
            <main className="container mx-auto pt-24 pb-8 px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <aside className={`lg:col-span-1 ${themeColors.card} rounded-xl shadow-md ${themeColors.border} overflow-hidden`}>
                        <div className="p-4 border-b border-gray-800">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${themeColors.text} pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">Assets</h3>
                                <div className="text-xs flex items-center gap-1">
                                    <Clock size={14} />
                                    <span className="text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {filteredCryptos.length > 0 ? (
                                filteredCryptos.map((crypto) => (
                                    <button
                                        key={crypto.name}
                                        className={`w-full text-left p-3 transition-colors flex items-center ${selectedCrypto === crypto.name
                                            ? `${themeColors.selectedBg} text-white`
                                            : `${themeColors.cardHover}`}`}
                                        onClick={() => {
                                            setSelectedCrypto(crypto.name);
                                            setChartData(mockChartData);
                                        }}
                                    >
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3"
                                            style={{ backgroundColor: crypto.color }}
                                        >
                                            {crypto.symbol.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{crypto.name}</div>
                                            <div className={`text-xs ${themeColors.textMuted}`}>{crypto.symbol}</div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400">
                                    <AlertCircle size={24} className="mx-auto mb-2" />
                                    No assets found for "{searchQuery}"
                                </div>
                            )}
                        </div>
                        {/* User Holdings Section */}
                        {isLoggedIn && holdings.length > 0 && (
                            <div className="p-4 border-t border-gray-700">
                                <h3 className="text-lg font-semibold mb-3">Your Holdings</h3>
                                <div className="space-y-3">
                                    {holdings.map((holding, index) => {
                                        const cryptoInfo = cryptoList.find(c => c.symbol === holding.crypto_symbol);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-md bg-opacity-20 hover:bg-opacity-30 bg-blue-900">
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2"
                                                        style={{ backgroundColor: cryptoInfo?.color || '#3b82f6' }}
                                                    >
                                                        {holding.crypto_symbol.charAt(0)}
                                                    </div>
                                                    <span className="font-medium">{holding.crypto_symbol}</span>
                                                </div>
                                                <span className="font-mono">{parseFloat(holding.amount).toFixed(8)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </aside>

                    {/* Main Chart & Info */}
                    <section className="lg:col-span-3 space-y-6">
                        {/* Chart Card */}
                        <div className={`${themeColors.card} rounded-xl shadow-md ${themeColors.border} overflow-hidden`}>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: currentCrypto?.color }}
                                        >
                                            {currentCrypto?.symbol.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold flex items-center gap-2">
                                                {selectedCrypto}
                                                <span className={`text-lg ${themeColors.textMuted}`}>{currentCrypto?.symbol}</span>
                                            </h2>
                                            <div className="flex items-center mt-1">
                                                <span className="text-2xl font-semibold">${chartData[chartData.length - 1]?.price.toFixed(2)}</span>
                                                <div className={`ml-3 flex items-center ${positiveChange ? 'text-green-500' : 'text-red-500'}`}>
                                                    {positiveChange ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    <span className="ml-1 text-lg">{changePercent}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            className="p-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition focus:outline-none shadow"
                                            onClick={() => {
                                                setIsLoading(true);
                                                setTimeout(() => {
                                                    setIsLoading(false);
                                                    setLastUpdated(new Date());
                                                    setShowNotification(true);
                                                    setTimeout(() => setShowNotification(false), 3000);
                                                }, 800);
                                            }}
                                        >
                                            <RefreshCw size={22} className={isLoading ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                </div>
                                <div className="h-72 md:h-96">
                                    {isLoading ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="flex flex-col items-center">
                                                <RefreshCw size={30} className="animate-spin text-blue-500 mb-4" />
                                                <div className="text-blue-400">Fetching market data...</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.chartGrid} vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke={darkMode ? "#94a3b8" : "#64748b"}
                                                    tick={{ fill: darkMode ? "#94a3b8" : "#64748b" }}
                                                    tickLine={{ stroke: darkMode ? "#475569" : "#cbd5e1" }}
                                                    axisLine={{ stroke: darkMode ? "#475569" : "#cbd5e1" }}
                                                />
                                                <YAxis
                                                    stroke={darkMode ? "#94a3b8" : "#64748b"}
                                                    tick={{ fill: darkMode ? "#94a3b8" : "#64748b" }}
                                                    tickLine={{ stroke: darkMode ? "#475569" : "#cbd5e1" }}
                                                    axisLine={{ stroke: darkMode ? "#475569" : "#cbd5e1" }}
                                                    domain={['auto', 'auto']}
                                                    width={60}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                                        borderColor: chartColor,
                                                        borderRadius: '0.375rem',
                                                        color: darkMode ? '#f1f5f9' : '#1e293b',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                    itemStyle={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}
                                                    labelStyle={{ color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold', marginBottom: '5px' }}
                                                    formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Price']}
                                                    labelFormatter={(value) => `Day ${value}`}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="price"
                                                    stroke={chartColor}
                                                    strokeWidth={2}
                                                    fill="url(#colorPrice)"
                                                    activeDot={{ r: 6, fill: chartColor, strokeWidth: 2, stroke: darkMode ? '#1e293b' : '#ffffff' }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Buy Widget - ADDED FROM FIRST SNIPPET */}
                        <div className={`${themeColors.card} rounded-xl shadow-md ${themeColors.border} overflow-hidden`}>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: currentCrypto?.color }}
                                        >
                                            {currentCrypto?.symbol.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold flex items-center gap-2">
                                                {selectedCrypto}
                                                <span className={`text-lg ${themeColors.textMuted}`}>{currentCrypto?.symbol}</span>
                                            </h2>
                                            <div className="flex items-center mt-1">
                                                <span className="text-2xl font-semibold">${chartData[chartData.length - 1]?.price.toFixed(2)}</span>
                                                <div className={`ml-3 flex items-center ${positiveChange ? 'text-green-500' : 'text-red-500'}`}>
                                                    {positiveChange ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    <span className="ml-1 text-lg">{changePercent}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full md:w-auto">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center rounded-md overflow-hidden border ${themeColors.border}`}>
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={buyAmount}
                                                    onChange={(e) => setBuyAmount(e.target.value)}
                                                    className={`p-2 w-full focus:outline-none ${themeColors.input}`}
                                                    min="0.00000001"
                                                    step="0.00000001"
                                                />
                                                <span className={`px-2 ${themeColors.textMuted}`}>{currentCrypto?.symbol}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className={`text-sm ${themeColors.textMuted}`}>
                                                Total: ${buyAmount ? (buyAmount * chartData[chartData.length - 1]?.price).toFixed(2) : '0.00'}
                                            </div>
                                        </div>

                                        <button
                                            className="p-3 rounded-md bg-green-600 hover:bg-green-700 text-white transition focus:outline-none shadow w-full md:w-auto"
                                            onClick={() => {
                                                if (!buyAmount || buyAmount <= 0) {
                                                    setTradeStatus("Please enter a valid amount");
                                                    setTimeout(() => setTradeStatus(null), 3000);
                                                    return;
                                                }

                                                buyCrypto(
                                                    currentCrypto?.symbol,
                                                    buyAmount,
                                                    chartData[chartData.length - 1]?.price
                                                );
                                            }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : (
                                                <span>Buy {currentCrypto?.symbol}</span>
                                            )}
                                        </button>

                                        {tradeStatus && (
                                            <div className={`mt-2 p-2 rounded text-center ${tradeStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {tradeStatus}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-3 w-full md:w-auto">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center rounded-md overflow-hidden border ${themeColors.border}`}>
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={sellAmount}
                                                    onChange={(e) => setSellAmount(e.target.value)}
                                                    className={`p-2 w-full focus:outline-none ${themeColors.input}`}
                                                    min="0.00000001"
                                                    step="0.00000001"
                                                />
                                                <span className={`px-2 ${themeColors.textMuted}`}>{currentCrypto?.symbol}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className={`text-sm ${themeColors.textMuted}`}>
                                                Total: ${sellAmount ? (sellAmount * chartData[chartData.length - 1]?.price).toFixed(2) : '0.00'}
                                            </div>

                                            {/* Show current holding if any */}
                                            {holdings && holdings.some(h => h.crypto_symbol === currentCrypto?.symbol) && (
                                                <div className={`text-sm ${themeColors.textMuted}`}>
                                                    Your holding: {holdings.find(h => h.crypto_symbol === currentCrypto?.symbol)?.amount} {currentCrypto?.symbol}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="p-3 rounded-md bg-red-600 hover:bg-red-700 text-white transition focus:outline-none shadow w-full md:w-auto"
                                            onClick={() => {
                                                if (!sellAmount || sellAmount <= 0) {
                                                    setTradeStatus("Please enter a valid amount");
                                                    setTimeout(() => setTradeStatus(null), 3000);
                                                    return;
                                                }

                                                // Check if user has enough of the crypto
                                                const currentHolding = holdings.find(h => h.crypto_symbol === currentCrypto?.symbol);
                                                const currentAmount = currentHolding ? parseFloat(currentHolding.amount) : 0;

                                                if (!currentHolding || currentAmount < parseFloat(sellAmount)) {
                                                    setTradeStatus(`Error: Insufficient ${currentCrypto?.symbol} balance`);
                                                    setTimeout(() => setTradeStatus(null), 3000);
                                                    return;
                                                }

                                                sellCrypto(
                                                    currentCrypto?.symbol,
                                                    sellAmount,
                                                    chartData[chartData.length - 1]?.price
                                                );
                                            }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : (
                                                <span>Sell {currentCrypto?.symbol}</span>
                                            )}
                                        </button>

                                        {tradeStatus && (
                                            <div className={`mt-2 p-2 rounded text-center ${tradeStatus.includes('Error')
                                                ? 'bg-red-100 text-red-700'
                                                : tradeStatus.includes('Loss')
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {tradeStatus}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mini Charts */}
                        <div>
                            <h3 className="text-2xl font-semibold mt-4 mb-2 flex items-center gap-2">
                                Top Performing Cryptocurrencies
                                <span className={`text-xs py-1 px-3 rounded ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                    Last 24 hours
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topCurrencies.slice(0, 6).map((crypto, index) => {
                                    const pair = krakenSymbolMap[crypto.name].replace("_", "/");

                                    const priceArray = topCurrencyPrices[pair];

                                    const latestPrice = priceArray?.[priceArray.length - 1]?.price;
                                    const previousPrice = priceArray?.[priceArray.length - 2]?.price;

                                    let changePercentage = "0.00";
                                    let isPositive = true;

                                    if (latestPrice !== undefined && previousPrice !== undefined && previousPrice !== 0) {
                                        const change = ((latestPrice - previousPrice) / previousPrice) * 100;
                                        changePercentage = change.toFixed(2);
                                        isPositive = change >= 0;
                                    }

                                    return (
                                        <div key={index} className={`${themeColors.card} rounded-xl p-4 ${themeColors.border} shadow-sm transition-transform hover:shadow-lg hover:-translate-y-1 cursor-pointer`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3"
                                                        style={{ backgroundColor: crypto.color }}
                                                    >
                                                        {crypto.symbol.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{crypto.name}</div>
                                                        <div className={`text-xs ${themeColors.textMuted}`}>{crypto.symbol}</div>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center font-medium text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                                                    {changePercentage}%
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-xl font-bold">
                                                        {latestPrice !== undefined ? `$${latestPrice}` : "Loading..."}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <ExternalLink size={14} />
                                                    <span>Details</span>
                                                </div>
                                            </div>

                                            {/* Use fetched priceArray for chart */}
                                            <div className="h-16 mt-2">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={priceArray}>
                                                        <defs>
                                                            <linearGradient id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <Area
                                                            type="monotone"
                                                            dataKey="price"
                                                            stroke={isPositive ? "#10b981" : "#ef4444"}
                                                            fill={`url(#color${index})`}
                                                            strokeWidth={1.5}
                                                            dot={false}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className={`${themeColors.card} ${themeColors.borderAccent} border-t mt-12 py-6`}>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mr-3">
                                <TrendingUp className="text-white" size={20} />
                            </div>
                            <span className="font-medium text-xl">CryptoVision Dashboard</span>
                        </div>
                        <div className={`${themeColors.textMuted} text-sm`}>
                            © {new Date().getFullYear()} Martin Mihaylov. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}