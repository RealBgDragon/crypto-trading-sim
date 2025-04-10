import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, Moon, Sun, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function AuthPage() {
    const [darkMode, setDarkMode] = useState(true);
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [authSuccess, setAuthSuccess] = useState(false);
    const [authError, setAuthError] = useState('');

    // Theme-based style variables
    const themeColors = darkMode ? {
        background: "bg-gray-900",
        card: "bg-gray-800",
        cardHighlight: "bg-gray-700",
        text: "text-gray-100",
        textSecondary: "text-gray-300",
        textMuted: "text-gray-400",
        border: "border-gray-700",
        borderAccent: "border-blue-800",
        input: "bg-gray-700 border-gray-600 focus:border-blue-500",
        buttonPrimary: "bg-blue-600 hover:bg-blue-700",
        buttonSecondary: "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white",
        focus: "focus:ring-blue-500"
    } : {
        background: "bg-gray-50",
        card: "bg-white",
        cardHighlight: "bg-gray-100",
        text: "text-gray-800",
        textSecondary: "text-gray-600",
        textMuted: "text-gray-500",
        border: "border-gray-200",
        borderAccent: "border-blue-300",
        input: "bg-gray-50 border-gray-300 focus:border-blue-500",
        buttonPrimary: "bg-blue-600 hover:bg-blue-700",
        buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900",
        focus: "focus:ring-blue-500"
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        let valid = true;
        const errors = {
            email: '',
            password: '',
            confirmPassword: '',
            username: ''
        };

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
            valid = false;
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
            valid = false;
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
            valid = false;
        }

        // Registration validations
        if (!isLogin) {
            if (!formData.username) {
                errors.username = 'Username is required';
                valid = false;
            }

            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Please confirm your password';
                valid = false;
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
                valid = false;
            }
        }

        setFormErrors(errors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const endpoint = isLogin ? 'http://localhost:8080/api/login' : 'http://localhost:8080/api/register';
            console.log(endpoint);

            await axios.post(endpoint, {
                email: formData.email,
                password: formData.password,
                ...(isLogin ? {} : { username: formData.username })
            }).then(res => {
                if (res.status != 200) {
                    setAuthError(isLogin
                        ? 'Invalid email or password. Please try again.'
                        : 'Register error. Please try again.'
                    );
                }
                else {
                    setAuthSuccess(true)
                }
            }

            )
                .catch(err => {
                    console.log(err);
                    if (err.code.includes("ERR_NETWORK")) {
                        setAuthError('Connection error. Please try again later.');
                    } else if (err.status == 500) {
                        setAuthError('Server error. Please contact support.');
                    } else {
                        setAuthError(err.response.data);
                    }
                }
                );

            console.log(`${isLogin ? 'Login' : 'Registration'} successful`);

            //TODO Redirect to dashboard after successful auth
            // setTimeout(() => {
            //     window.location.href = '/';
            // }, 1500);

        } catch (error) {
            console.error('Authentication error:', error);


        } finally {
            setIsLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setFormErrors({
            email: '',
            password: '',
            confirmPassword: '',
            username: ''
        });
        setAuthError('');
    };

    return (
        <div className={`min-h-screen ${themeColors.background} ${themeColors.text} transition-colors duration-200 flex flex-col`}>
            {/* Header */}
            <header className={`${themeColors.card} ${themeColors.borderAccent} border-b fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-opacity-90`}>
                <div className="container mx-auto flex justify-between items-center py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <a href='http://localhost:5173/'>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                Crypto<strong>Vision</strong>
                            </h1>
                        </a>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-full ${themeColors.cardHighlight} focus:outline-none shadow-md`}
                    >
                        {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-600" size={20} />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center pt-20 pb-8 px-4">
                <div className="w-full max-w-md">
                    {authSuccess ? (
                        <div className={`${themeColors.card} rounded-xl shadow-xl p-8 text-center animate-fade-in`}>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {isLogin ? "Login Successful!" : "Registration Complete!"}
                            </h2>
                            <p className={`${themeColors.textSecondary} mb-4`}>
                                {isLogin
                                    ? "Welcome back! Redirecting you to your dashboard..."
                                    : "Your account has been created. Redirecting to dashboard..."}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div className="bg-blue-600 h-2 rounded-full animate-progress"></div>
                            </div>
                        </div>
                    ) : (
                        <div className={`${themeColors.card} rounded-xl shadow-xl overflow-hidden`}>
                            {/* Card Header */}
                            <div className="flex">
                                <button
                                    className={`flex-1 py-4 font-medium text-center transition-colors ${isLogin ? 'bg-blue-600 text-white' : themeColors.cardHighlight}`}
                                    onClick={() => setIsLogin(true)}
                                >
                                    Login
                                </button>
                                <button
                                    className={`flex-1 py-4 font-medium text-center transition-colors ${!isLogin ? 'bg-blue-600 text-white' : themeColors.cardHighlight}`}
                                    onClick={() => setIsLogin(false)}
                                >
                                    Register
                                </button>
                            </div>

                            {/* Auth Form */}
                            <div className="p-8">
                                <h2 className="text-2xl font-bold mb-6">
                                    {isLogin ? "Welcome Back" : "Create Account"}
                                </h2>

                                {authError && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded mb-4">
                                        {authError}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Username Field - Only for Register */}
                                    {!isLogin && (
                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium mb-1">
                                                Username
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User size={18} className={themeColors.textMuted} />
                                                </div>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    placeholder="johndoe"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-4 py-2 rounded-md ${themeColors.input} focus:outline-none focus:ring-2 ${themeColors.focus}`}
                                                />
                                            </div>
                                            {formErrors.username && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {formErrors.username}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail size={18} className={themeColors.textMuted} />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="name@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2 rounded-md ${themeColors.input} focus:outline-none focus:ring-2 ${themeColors.focus}`}
                                            />
                                        </div>
                                        {formErrors.email && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {formErrors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={18} className={themeColors.textMuted} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-10 py-2 rounded-md ${themeColors.input} focus:outline-none focus:ring-2 ${themeColors.focus}`}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} className={themeColors.textMuted} />
                                                ) : (
                                                    <Eye size={18} className={themeColors.textMuted} />
                                                )}
                                            </button>
                                        </div>
                                        {formErrors.password && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {formErrors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password Field - Only for Register */}
                                    {!isLogin && (
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock size={18} className={themeColors.textMuted} />
                                                </div>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    placeholder="••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-10 py-2 rounded-md ${themeColors.input} focus:outline-none focus:ring-2 ${themeColors.focus}`}
                                                />
                                            </div>
                                            {formErrors.confirmPassword && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {formErrors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Remember Me & Forgot Password - Only for Login */}
                                    {isLogin && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    id="remember-me"
                                                    name="remember-me"
                                                    type="checkbox"
                                                    className={`h-4 w-4 rounded border-gray-300 ${themeColors.focus}`}
                                                />
                                                <label htmlFor="remember-me" className={`ml-2 block text-sm ${themeColors.textSecondary}`}>
                                                    Remember me
                                                </label>
                                            </div>
                                            <div className="text-sm">
                                                <a href="#" className="text-blue-500 hover:text-blue-400">
                                                    Forgot password?
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full ${themeColors.buttonPrimary} text-white py-2 px-4 rounded-md font-medium shadow-md flex items-center justify-center gap-2 transition-colors mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                {isLogin ? 'Signing in...' : 'Creating account...'}
                                            </>
                                        ) : (
                                            <>
                                                {isLogin ? 'Sign In' : 'Create Account'}
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    {/* Toggle between Login and Register */}
                                    <div className="text-center mt-4">
                                        <button
                                            type="button"
                                            onClick={toggleAuthMode}
                                            className={`text-blue-500 hover:text-blue-400 text-sm font-medium`}
                                        >
                                            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className={`${themeColors.card} ${themeColors.borderAccent} border-t py-4`}>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mr-3">
                                <TrendingUp className="text-white" size={16} />
                            </div>
                            <span className="font-medium">CryptoVision</span>
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