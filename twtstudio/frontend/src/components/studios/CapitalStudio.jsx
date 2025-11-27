import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { DollarSign, TrendingUp, Target, Users, Briefcase, Award, ArrowRight, Zap, FileText, Globe } from "lucide-react";

const CapitalStudio = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-white"}`}>
            {/* Hero Section */}
            <section className={`relative py-24 overflow-hidden ${isDark ? "bg-gray-950" : "bg-white"}`}>
                {/* Animated Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.15, 0.25, 0.15],
                        }}
                        transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`absolute top-20 right-20 w-[500px] h-[500px] rounded-full blur-3xl ${
                            isDark ? "bg-purple-500/20" : "bg-purple-500/10"
                        }`}
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{ 
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                        className={`absolute bottom-20 left-20 w-[600px] h-[600px] rounded-full blur-3xl ${
                            isDark ? "bg-pink-500/20" : "bg-pink-500/10"
                        }`}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-8">
                            <DollarSign className="w-4 h-4 text-purple-500" />
                            <span className="text-purple-500 font-semibold text-sm">TWT Venture Studio</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Capital Studio
                        </h1>

                        <p className={`text-xl md:text-2xl mb-8 ${
                            isDark ? "text-gray-300" : "text-gray-600"
                        }`}>
                            Where Capital Meets Clarity. Where Ambition Gets Funded.
                        </p>

                        <p className={`text-lg leading-relaxed ${
                            isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                            TWT Venture Studio's Capital Studio is not a funding accelerator or a matchmaking platform.
                            It's a strategic investment and M&A advisory arm built for high-growth ventures and scale-ready founders.
                            Whether you're raising your first cheque or preparing for acquisition, we help you structure, position,
                            and close the deals that move the needle.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* What is it Section */}
            <section className={`py-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}>
                            What is the{" "}
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Capital Studio?
                            </span>
                        </h2>
                        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            TWT's dedicated platform for strategic capital partnerships
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {[
                            { icon: <TrendingUp className="w-6 h-6" />, text: "Strategic fundraising support" },
                            { icon: <Target className="w-6 h-6" />, text: "Investor readiness and pitch engineering" },
                            { icon: <Users className="w-6 h-6" />, text: "Capital syndication and introductions" },
                            { icon: <Globe className="w-6 h-6" />, text: "Cross-border expansion funding" },
                            { icon: <Briefcase className="w-6 h-6" />, text: "Mergers, acquisitions, and exits" },
                            { icon: <Award className="w-6 h-6" />, text: "Strategic investor alignment" }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center gap-4 p-6 rounded-xl border ${
                                    isDark ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800" : "bg-white border-gray-200 hover:shadow-lg"
                                } transition-all duration-300`}
                            >
                                <div className={`p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex-shrink-0`}>
                                    {item.icon}
                                </div>
                                <span className={`text-base font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    {item.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`p-8 rounded-2xl border ${
                            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                        }`}
                    >
                        <p className={`text-lg mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            We sit with you not just as advisors, but as capital partners aligning business strategy with capital strategy.
                        </p>
                        <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Our mission: Help founders raise smart, structured capital and close high-leverage partnerships.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Who is it for Section */}
            <section className={`py-20 ${isDark ? "bg-gray-950" : "bg-white"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}>
                            Who is it{" "}
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                for?
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-2xl border ${
                                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <Target className="w-6 h-6 text-purple-500" />
                                Capital Studio is designed for:
                            </h3>
                            <div className="space-y-3">
                                {[
                                    "Founders raising Pre-Seed to Series A rounds",
                                    "Ventures preparing for acquisition, consolidation, or joint ventures",
                                    "Fast-growing companies ready to enter new markets or scale operations",
                                    "Early-stage companies seeking strategic investors over blind cheques"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                            isDark ? "text-purple-400" : "text-purple-500"
                                        }`} />
                                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-2xl border ${
                                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <Users className="w-6 h-6 text-pink-500" />
                                We're the capital partner for:
                            </h3>
                            <div className="space-y-3">
                                {[
                                    "First-time founders navigating their first raise",
                                    "Growth-stage startups structuring a complex round",
                                    "Founders preparing to exit or attract acquirers"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                            isDark ? "text-pink-400" : "text-pink-500"
                                        }`} />
                                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* What Makes Us Different */}
            <section className={`py-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}>
                            What Makes Us Different?
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Founder-Led, Strategy-Backed",
                                description: "We've raised capital, exited companies, and sat on both sides of the table.",
                                icon: <Award className="w-6 h-6" />
                            },
                            {
                                title: "No Fluff, Just Deals",
                                description: "We don't promise pitch days. We deliver smart deals.",
                                icon: <Target className="w-6 h-6" />
                            },
                            {
                                title: "End-to-End Advisory",
                                description: "From data room setup to post-funding execution, we stay till the close.",
                                icon: <FileText className="w-6 h-6" />
                            },
                            {
                                title: "Cross-Border Expertise",
                                description: "We understand the cultural and regulatory nuances of fundraising across regions.",
                                icon: <Globe className="w-6 h-6" />
                            },
                            {
                                title: "Aligned Incentives",
                                description: "We win when you do. No success, no fee models available in select cases.",
                                icon: <TrendingUp className="w-6 h-6" />
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-8 rounded-2xl border ${
                                    isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                                }`}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {item.title}
                                        </h3>
                                        <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who We Work With */}
            <section className={`py-20 ${isDark ? "bg-gray-950" : "bg-white"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`p-8 rounded-2xl border ${
                            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                        }`}
                    >
                        <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                            Who We Work With
                        </h2>
                        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            We selectively work with:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Mission-aligned founders",
                                "Companies with a validated product or revenue traction",
                                "Startups solving large, clear market problems",
                                "Founders who value strategic capital over random cheques"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Zap className={`w-5 h-5 mt-1 flex-shrink-0 ${
                                        isDark ? "text-purple-400" : "text-purple-500"
                                    }`} />
                                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className={`mt-6 text-lg font-medium italic ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            If you want more than funding, if you want strategic partnership — we're your tribe.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Apply Section */}
            <section className={`py-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`p-10 rounded-2xl border ${
                            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                        } text-center`}
                    >
                        <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}>
                            Apply to Join Capital Studio
                        </h2>
                        <p className={`text-lg mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            We work with only a handful of companies each quarter. If you're looking to:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {[
                                "Raise a round",
                                "Prepare for acquisition",
                                "Explore a strategic merger",
                                "Enter a new region with capital backing"
                            ].map((item, i) => (
                                <div key={i} className={`flex items-start gap-3 p-4 rounded-lg ${
                                    isDark ? "bg-gray-900/50" : "bg-gray-50"
                                }`}>
                                    <Zap className={`w-5 h-5 mt-1 flex-shrink-0 ${
                                        isDark ? "text-purple-400" : "text-purple-500"
                                    }`} />
                                    <span className={`text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Capital Studio isn't about raising money for the sake of it. It's about raising smart capital with sharp intent.
                        </p>
                        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            We don't chase VCs. We build businesses investors want to chase.
                        </p>

                        <p className={`text-lg font-semibold italic mb-8 ${
                            isDark ? "text-gray-200" : "text-gray-800"
                        }`}>
                            Welcome to The Workoholic Tribe. Let's make your next raise a weapon, not a struggle.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl"
                        >
                            Book Appointment
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default CapitalStudio;
