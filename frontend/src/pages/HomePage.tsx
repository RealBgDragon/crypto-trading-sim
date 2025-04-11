import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Moon, Search, Sun, ExternalLink, Clock, AlertCircle } from 'lucide-react';
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
    Dogecoin: "DOGE_USD",
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
    { name: "Dogecoin", symbol: "DOGE", color: "#C2A633" },
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

const mockChartData = Array.from({ length: 24 }, (_, i) => ({
    date: `${i * 5} s`,
    price: 0
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
    const [chartData, setChartData] = useState(mockChartData);
    const [timeframe, setTimeframe] = useState("2min");
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [showNotification, setShowNotification] = useState(false);
    const [apiStatus, setApiStatus] = useState(false);
    const [topCurrencies, setTopCurrencies] = useState(cryptoList);
    const [accountBalance, setAccountBalance] = useState(0);

    // const user = JSON.parse(sessionStorage.getItem("user"));

    // const [topCurrencyPrices, setTopCurrencyPrices] = useState({});


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
        chartGrid: "#334155"
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
        chartGrid: "#e2e8f0"
    };

    useEffect(() => {
        // Connect api on page load
        axios.get(`http://localhost:8080/api/start`)
            .then(() => setApiStatus(true))
            .catch(err => console.log('Error connecting to API: ', err));

        // Pick random top currencies excluding selected one
        const nonCurrentCryptos = cryptoList.filter(crypto => crypto.name !== selectedCrypto);
        const randomTopCurrencies = getRandomElements(nonCurrentCryptos, 6);
        setTopCurrencies(randomTopCurrencies);
        // console.log(randomTopCurrencies);
    }, [selectedCrypto]);

    useEffect(() => {
        axios.post("http://localhost:8080/api/user/balance",
            {

            }
        )
            .then(res => setAccountBalance(res.data))
            .catch(() => setAccountBalance(0))
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            //setIsLoading(true);
            // const selectedCryptoObj = cryptoList.find(c => c.name === selectedCrypto);
            const pair = krakenSymbolMap[selectedCrypto];

            try {
                console.log(topCurrencies);
                const res = await axios.get(`http://localhost:8080/api/price/${pair}`);
                console.log(res);

                const lastPrice = res.data.price;


                setChartData(prevData => {
                    const newPoint = {
                        date: `${prevData.length * 5} s`, // Ensure the date is a string, e.g., "Day 1", "Day 2"
                        price: lastPrice,
                    };

                    const updatedChart = [...prevData, newPoint];
                    if (updatedChart.length > 30) {
                        updatedChart.shift(); // Remove the first element if there are more than 30 points
                    }
                    return updatedChart;
                });


                setLastUpdated(new Date());
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
            } catch (err) {
                console.error(err);
            }
            //setIsLoading(false);
        };

        fetchData();

        // adding 5 second update interval
        const intervalId = setInterval(fetchData, 5000);

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
        // fetchData();
    }, [selectedCrypto, timeframe]);

    const filteredCryptos = cryptoList.filter(crypto =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const priceChange = chartData[chartData.length - 1]?.price - chartData[0]?.price;
    const positiveChange = priceChange >= 0;
    const changePercent = ((priceChange / chartData[0]?.price) * 100).toFixed(2);
    const currentCrypto = cryptoList.find(c => c.name === selectedCrypto);
    const chartColor = currentCrypto?.color || "#3b82f6";
    const isLoggedIn = true

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
                        {isLoggedIn && (
                            <div className={`${themeColors.card} px-4 py-2 rounded-lg border ${themeColors.border} shadow-md hidden md:block`}>
                                <div className="text-xs uppercase font-semibold opacity-70">Balance</div>
                                <div className="font-mono font-bold text-lg">
                                    ${accountBalance.toLocaleString()}
                                    <span className="text-xs ml-1 opacity-60">$</span>
                                </div>
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
                        <a
                            href='http://localhost:5173/login'
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300`}
                        >
                            {/* <LogIn size={18} /> */}
                            <span>Login</span>
                        </a>
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

                                        }
                                        }
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
                                                {/* //! Fix */}
                                                <span className="text-2xl font-semibold">${chartData[chartData.length - 1]?.price.toFixed(2)}</span>
                                                <div className={`ml-3 flex items-center ${positiveChange ? 'text-green-500' : 'text-red-500'}`}>
                                                    {positiveChange ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    <span className="ml-1 text-lg">{changePercent}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex bg-gray-800/30 rounded-lg p-1">
                                            {['24h', '7d', '30d'].map((tf) => (
                                                <button
                                                    key={tf}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${timeframe === tf ? `${themeColors.selectedBg} text-white` : ''}`}
                                                    onClick={() => setTimeframe(tf)}
                                                >
                                                    {tf}
                                                </button>
                                            ))}
                                        </div>
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

                        {/* Mini Charts */}
                        <div>
                            <h3 className="text-2xl font-semibold mt-4 mb-2 flex items-center gap-2">
                                Top Performing Cryptocurrencies
                                <span className={`text-xs py-1 px-3 rounded ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                    Last 24 hours
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cryptoList.slice(1, 7).map((crypto, index) => {
                                    const randomPrice = (1000 + Math.random() * 3000).toFixed(2);
                                    const randomChange = (Math.random() * 10 - 3).toFixed(2);
                                    const isPositive = parseFloat(randomChange) >= 0;
                                    const miniChartData = Array.from({ length: 20 }, () => ({
                                        date: '',
                                        price: Math.random() * 100
                                    }));

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
                                                    {randomChange}%
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-xl font-bold">${randomPrice}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <ExternalLink size={14} />
                                                    <span>Details</span>
                                                </div>
                                            </div>
                                            <div className="h-16 mt-2">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={miniChartData}>
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
