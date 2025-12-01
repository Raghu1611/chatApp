import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Layout({ children }) {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
            {/* Theme Toggle Button - Hidden on Home page */}
            {location.pathname !== '/home' && (
                <button
                    onClick={toggleTheme}
                    className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg hover:bg-slate-100 dark:hover:bg-white/20 transition-all group"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-90 transition-transform" />
                    ) : (
                        <Moon className="w-5 h-5 text-slate-600 group-hover:-rotate-12 transition-transform" />
                    )}
                </button>
            )}

            {/* Page Content with Transition */}
            <div key={location.pathname} className="animate-fadeIn">
                {children}
            </div>
        </div>
    );
}
