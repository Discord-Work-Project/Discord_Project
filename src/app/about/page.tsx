"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageCircle, Flame, Shield, Zap, Globe } from "lucide-react";
import Footer from "@/components/Footer";

export default function AboutPage() {
    const [active, setActive] = useState<number | null>(null);

    const cards = [
        {
            title: "Real-Time Communication",
            icon: <Zap size={40} />,
            desc: "Ultra-low latency messaging platform.",
            content:
                "Experience lightning-fast real-time communication with our optimized infrastructure. Messages, voice, and video calls with minimal delay for seamless conversations.",
        },
        {
            title: "Privacy & Security",
            icon: <Shield size={40} />,
            desc: "Enterprise-grade security standards.",
            content:
                "Your data is protected with end-to-end encryption and advanced security measures. We prioritize your privacy and ensure safe communication across all channels.",
        },
        {
            title: "Global Connectivity",
            icon: <Globe size={40} />,
            desc: "Connect with users worldwide.",
            content:
                "Join a truly global platform with users from every corner of the world. Break geographical barriers and build meaningful connections across cultures.",
        },
        {
            title: "Modern Features",
            icon: <Flame size={40} />,
            desc: "Cutting-edge technology stack.",
            content:
                "Built with the latest technologies including WebRTC for voice/video, Socket.io for real-time messaging, and responsive design for all devices.",
        },
        {
            title: "Active Community",
            icon: <Users size={40} />,
            desc: "Thousands of daily active users.",
            content:
                "Join our vibrant community of developers, creators, and professionals. Share knowledge, collaborate on projects, and grow together.",
        },
        {
            title: "Developer Friendly",
            icon: <MessageCircle size={40} />,
            desc: "APIs and tools for integration.",
            content:
                "Comprehensive APIs and developer tools to integrate OpenTL into your applications. Extensive documentation and community support.",
        },
    ];

    const features = [
        "Real-time messaging with typing indicators",
        "Voice and video calling with screen sharing",
        "File sharing and media support",
        "Custom emoji and reactions",
        "Threaded conversations",
        "Cross-platform synchronization"
    ];

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden">

            {/* 🕸 Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff000020_1px,transparent_1px),linear-gradient(to_bottom,#ff000020_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* 🔥 Red + Blue Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/30 blur-[150px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">

                {/* 🕷 Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                        About OpenTL
                    </h1>

                    <p className="mt-6 text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                        OpenTL is a next-generation communication platform designed for modern communities. 
                        Built with cutting-edge technology to provide seamless real-time experiences, 
                        privacy-first approach, and unmatched performance for teams and communities worldwide.
                    </p>

                    <motion.div className="mt-8 flex flex-wrap justify-center gap-4">
                        <div className="px-6 py-3 bg-red-600/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium">
                            Real-time
                        </div>
                        <div className="px-6 py-3 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
                            Secure
                        </div>
                        <div className="px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium">
                            Global
                        </div>
                    </motion.div>
                </motion.div>

                {/* 🕷 Features Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-red-500/40 transition-all"
                        >
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-gray-300">{feature}</span>
                        </motion.div>
                    ))}
                </div>

                {/* 🕸 Expandable Cards Section */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            layout
                            onClick={() =>
                                setActive(active === index ? null : index)
                            }
                            whileHover={{ y: -5 }}
                            className={`relative cursor-pointer rounded-2xl p-8 backdrop-blur-xl border transition-all duration-300
                                    ${active === index
                                    ? "bg-gradient-to-br from-red-600/20 to-blue-600/20 border-red-500 shadow-2xl shadow-red-500/20"
                                    : "bg-white/5 border-white/10 hover:border-red-500"
                                }`}
                        >
                            {/* Icon */}
                            <div className="text-red-500 mb-4">
                                {card.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-semibold">
                                {card.title}
                            </h3>

                            {/* Short Description */}
                            <p className="mt-4 text-gray-400">
                                {card.desc}
                            </p>

                            {/* Expandable Content */}
                            <AnimatePresence>
                                {active === index && (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-6 text-gray-300 text-sm leading-relaxed overflow-hidden"
                                    >
                                        {card.content}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* 🕷 Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-20 text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-12">
                        Platform <span className="text-red-500">Statistics</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="text-3xl font-bold text-red-500">99.9%</div>
                            <div className="mt-2 text-gray-400">Uptime</div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="text-3xl font-bold text-blue-500">&lt;50ms</div>
                            <div className="mt-2 text-gray-400">Latency</div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="text-3xl font-bold text-green-500">256-bit</div>
                            <div className="mt-2 text-gray-400">Encryption</div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="text-3xl font-bold text-purple-500">24/7</div>
                            <div className="mt-2 text-gray-400">Support</div>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer/>
        </div>

    );
}
