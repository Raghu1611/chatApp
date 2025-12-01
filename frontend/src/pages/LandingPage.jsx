import { Link } from 'react-router-dom';
import { MessageSquare, Shield, Zap, Globe, Smartphone, Heart, ArrowRight, Check, Star, Menu, X, Users, Lock, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Simple hook for scroll reveal animation
function useOnScreen(ref, rootMargin = "0px") {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIntersecting(entry.isIntersecting),
            { rootMargin }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, rootMargin]);
    return isIntersecting;
}

const Reveal = ({ children, delay = 0 }) => {
    const ref = useRef();
    const onScreen = useOnScreen(ref, "-50px");
    return (
        <div ref={ref} className={`transition-all duration-1000 transform ${onScreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const [typingText, setTypingText] = useState('');

    // Typing effect for hero
    useEffect(() => {
        const text = "Hey! Have you tried the new ChatApp? 🚀";
        let i = 0;
        const interval = setInterval(() => {
            setTypingText(text.slice(0, i + 1));
            i++;
            if (i > text.length) {
                setTimeout(() => { i = 0; setTypingText(''); }, 2000);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const faqs = [
        { q: "Is ChatApp really free?", a: "Yes! Our core features are 100% free for personal use. We believe in open communication for everyone." },
        { q: "How secure is my data?", a: "We use state-of-the-art end-to-end encryption. Your messages are encrypted on your device and can only be read by the recipient." },
        { q: "Can I use it on multiple devices?", a: "Absolutely. Your chats sync instantly across all your devices - phone, tablet, and desktop." },
        { q: "Do you support group chats?", a: "Yes, you can create groups with up to 1000 members with advanced admin controls." }
    ];

    return (
        <div className="min-h-screen font-sans selection:bg-emerald-500/30 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden">

            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">ChatApp</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">How it Works</a>
                        <a href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Pricing</a>
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
                        <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Log In</Link>
                        <Link to="/signup" className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 p-6 flex flex-col gap-4 shadow-xl animate-slideUp">
                        <a href="#features" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                        <a href="#how-it-works" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
                        <a href="#pricing" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                        <Link to="/login" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                        <Link to="/signup" className="w-full py-3 bg-emerald-500 text-white rounded-xl text-center font-bold" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-float" />
                    <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-float-delayed" />
                    <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-slideUp">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            New: Voice Messages are here!
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                            Connect with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 animate-shimmer bg-[length:200%_auto]">anyone, anywhere.</span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                            Experience the future of messaging. End-to-end encryption, crystal clear audio, and a design that feels like magic.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/signup" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                                Start Chatting Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/login" className="px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2">
                                <Play className="w-5 h-5 fill-current" />
                                Watch Demo
                            </Link>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 pt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by <span className="font-bold text-slate-900 dark:text-white">10,000+</span> users</p>
                        </div>
                    </div>

                    {/* Mock UI */}
                    <div className="relative animate-slideUp" style={{ animationDelay: '0.2s' }}>
                        <div className="relative z-10 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border-8 border-slate-900 dark:border-slate-700 overflow-hidden max-w-sm mx-auto rotate-[-2deg] hover:rotate-0 transition-transform duration-500 group">
                            {/* Mock Header */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 flex items-center justify-center text-xs text-white font-bold">JD</div>
                                    <div>
                                        <div className="text-sm font-bold">John Doe</div>
                                        <div className="text-xs text-emerald-500">Online</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                                </div>
                            </div>
                            {/* Mock Messages */}
                            <div className="p-4 space-y-4 h-[400px] bg-white dark:bg-slate-800 flex flex-col justify-end">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm">
                                        Hey! How's the new project coming along?
                                    </div>
                                </div>
                                <div className="flex gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 shrink-0 flex items-center justify-center text-white text-xs">Me</div>
                                    <div className="bg-emerald-500 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] text-sm shadow-lg shadow-emerald-500/20">
                                        It's going great! Just finishing up the landing page.
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm">
                                        <span className="inline-block min-h-[1.2em]">{typingText}<span className="animate-pulse">|</span></span>
                                    </div>
                                </div>
                            </div>
                            {/* Mock Input */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
                                <div className="h-10 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-white/10 flex items-center px-4 text-xs text-slate-400">
                                    Type a message...
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute top-1/2 -right-12 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl animate-float-delayed hidden lg:block border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Message Sent</p>
                                    <p className="text-xs text-slate-500">Just now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <Reveal>
                <div className="py-12 border-y border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Active Users", value: "50K+" },
                            { label: "Messages Sent", value: "10M+" },
                            { label: "Countries", value: "120+" },
                            { label: "Uptime", value: "99.9%" },
                        ].map((stat, i) => (
                            <div key={i} className="hover:scale-105 transition-transform duration-300">
                                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{stat.value}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </Reveal>

            {/* Features Grid */}
            <div id="features" className="py-24 max-w-7xl mx-auto px-6">
                <Reveal>
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <br /> connect better.</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            We've thought of everything so you don't have to. Powerful features wrapped in a beautiful interface.
                        </p>
                    </div>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Zap, title: "Lightning Fast", desc: "Built on modern infrastructure for instant message delivery worldwide." },
                        { icon: Lock, title: "End-to-End Encrypted", desc: "Your conversations are private. Only you and the recipient can read them." },
                        { icon: Globe, title: "Global Scale", desc: "Servers distributed across the globe to ensure low latency everywhere." },
                        { icon: Smartphone, title: "Cross Platform", desc: "Seamlessly switch between your phone, tablet, and desktop computer." },
                        { icon: MessageSquare, title: "Rich Media", desc: "Share high-quality photos, videos, and documents without compression." },
                        { icon: Heart, title: "Built with Love", desc: "Crafted with attention to detail for the best possible user experience." }
                    ].map((feature, i) => (
                        <Reveal key={i} delay={i * 100}>
                            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 h-full">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-900 dark:text-white mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* How it Works */}
            <div id="how-it-works" className="py-24 bg-slate-50 dark:bg-black/20">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Get started in 3 simple steps</h2>
                    </Reveal>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connector Line */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 border-t-2 border-dashed border-slate-300 dark:border-slate-700" />

                        {[
                            { step: "01", title: "Create Account", desc: "Sign up for free in less than 30 seconds. No credit card required." },
                            { step: "02", title: "Add Friends", desc: "Sync your contacts or search for friends by username." },
                            { step: "03", title: "Start Chatting", desc: "Send messages, photos, and connect instantly." }
                        ].map((s, i) => (
                            <Reveal key={i} delay={i * 200}>
                                <div className="relative text-center">
                                    <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-800 rounded-full border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center text-3xl font-bold text-emerald-500 mb-6 shadow-lg relative z-10">
                                        {s.step}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400">{s.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pricing */}
            <div id="pricing" className="py-24 max-w-7xl mx-auto px-6">
                <Reveal>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Choose the plan that's right for you.</p>
                    </div>
                </Reveal>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Reveal>
                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 shadow-lg relative overflow-hidden">
                            <h3 className="text-2xl font-bold mb-2">Personal</h3>
                            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-slate-500 font-normal">/forever</span></div>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">Perfect for connecting with friends and family.</p>
                            <ul className="space-y-4 mb-8">
                                {["Unlimited Messages", "1GB Storage", "Mobile & Desktop App", "Basic Support"].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-emerald-500" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/signup" className="block w-full py-3 px-6 text-center rounded-xl border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">Get Started Free</Link>
                        </div>
                    </Reveal>

                    <Reveal delay={200}>
                        <div className="p-8 rounded-3xl bg-slate-900 dark:bg-white border border-slate-900 dark:border-white shadow-xl relative overflow-hidden text-white dark:text-slate-900 transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-emerald-400 to-cyan-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                            <h3 className="text-2xl font-bold mb-2">Pro</h3>
                            <div className="text-4xl font-bold mb-6">$4.99<span className="text-lg opacity-70 font-normal">/month</span></div>
                            <p className="opacity-80 mb-8">For power users who want more.</p>
                            <ul className="space-y-4 mb-8">
                                {["Everything in Personal", "Unlimited Storage", "HD Video Calls", "Priority Support", "Custom Themes"].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="p-1 bg-emerald-500 rounded-full"><Check className="w-3 h-3 text-white" /></div>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/signup" className="block w-full py-3 px-6 text-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all">Start 14-Day Trial</Link>
                        </div>
                    </Reveal>
                </div>
            </div>

            {/* FAQ */}
            <div id="faq" className="py-24 bg-slate-50 dark:bg-black/20">
                <div className="max-w-3xl mx-auto px-6">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    </Reveal>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <Reveal key={i} delay={i * 100}>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        className="w-full p-6 flex items-center justify-between text-left font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        {faq.q}
                                        {activeFaq === i ? <ChevronUp className="w-5 h-5 text-emerald-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>
                                    <div className={`px-6 text-slate-600 dark:text-slate-400 overflow-hidden transition-all duration-300 ${activeFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {faq.a}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div id="testimonials" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Loved by thousands</h2>
                    </Reveal>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Johnson", role: "Product Designer", text: "The cleanest chat app I've ever used. The dark mode is simply stunning." },
                            { name: "Michael Chen", role: "Developer", text: "Finally, a chat app that doesn't feel bloated. Fast, secure, and does exactly what it needs to." },
                            { name: "Emma Wilson", role: "Marketing Lead", text: "I use this for my team every day. The reliability is unmatched." }
                        ].map((t, i) => (
                            <Reveal key={i} delay={i * 100}>
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-colors">
                                    <div className="flex gap-1 text-yellow-400 mb-4">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="text-lg mb-6 leading-relaxed">"{t.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} alt={t.name} />
                                        </div>
                                        <div>
                                            <div className="font-bold">{t.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 px-6">
                <Reveal>
                    <div className="max-w-5xl mx-auto bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-500/30">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to get started?</h2>
                            <p className="text-xl text-emerald-50 max-w-2xl mx-auto font-medium">Join the fastest growing messaging platform today. No credit card required.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                                <Link to="/signup" className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-lg hover:scale-105">
                                    Create Free Account
                                </Link>
                                <Link to="/login" className="px-8 py-4 bg-emerald-600/50 backdrop-blur-sm text-white border border-white/30 rounded-2xl font-bold hover:bg-emerald-600/70 transition-all">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <MessageSquare className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-bold">ChatApp</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Making the world smaller, one message at a time. Built with modern web technologies for the best experience.
                            </p>
                        </div>

                        {[
                            { title: "Product", links: ["Features", "Pricing", "Download", "Integrations"] },
                            { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
                            { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] }
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="font-bold mb-6">{col.title}</h4>
                                <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                                    {col.links.map((l, j) => (
                                        <li key={j}><a href="#" className="hover:text-emerald-500 transition-colors">{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <p>© 2025 ChatApp Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Discord</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
