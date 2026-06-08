import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { TrendingUp, Zap, Target, BarChart, DollarSign, Code, Scale, Users, ArrowRight, Briefcase, Building, ChartBar } from "lucide-react";

const GrowthStudio = () => {
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
                            isDark ? "bg-blue-500/20" : "bg-blue-500/10"
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
                            isDark ? "bg-cyan-500/20" : "bg-cyan-500/10"
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
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-8">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-500 font-semibold text-sm">TWT Venture Studio</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                            Growth Studio
                        </h1>

                        <p className={`text-xl md:text-2xl mb-8 ${
                            isDark ? "text-gray-300" : "text-gray-600"
                        }`}>
                            Where Scale Meets Precision. Where Chaos Turns into Compound Growth.
                        </p>

                        <p className={`text-lg leading-relaxed ${
                            isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                            At TWT Venture Studio, Growth Studio is our high-impact consulting arm for fast-moving startups.
                            We embed deep operational, marketing, finance, legal, and CXO-level expertise into your business —
                            not just to help you grow, but to help you scale sustainably, profitably, and smartly.
                            This is not advisory. This is executional consulting for founders who want sharper processes,
                            higher performance, and strategic infrastructure to fuel their next stage.
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
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                Growth Studio?
                            </span>
                        </h2>
                        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            A full-spectrum business scaling engine combining hands-on consulting with operational execution
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { icon: <Briefcase className="w-6 h-6" />, text: "Business Operations", color: "blue" },
                            { icon: <Target className="w-6 h-6" />, text: "Marketing & Brand Strategy", color: "cyan" },
                            { icon: <TrendingUp className="w-6 h-6" />, text: "Sales Growth Systems", color: "blue" },
                            { icon: <DollarSign className="w-6 h-6" />, text: "Finance & Compliance", color: "cyan" },
                            { icon: <Code className="w-6 h-6" />, text: "Technology Stack Planning", color: "blue" },
                            { icon: <Scale className="w-6 h-6" />, text: "Legal Structuring & IP", color: "cyan" },
                            { icon: <Users className="w-6 h-6" />, text: "C-Level Talent Strategy", color: "blue" },
                            { icon: <Building className="w-6 h-6" />, text: "Organizational Design", color: "cyan" }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex flex-col items-center gap-4 p-6 rounded-xl border ${
                                    isDark ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800" : "bg-white border-gray-200 hover:shadow-lg"
                                } transition-all duration-300 text-center`}
                            >
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${
                                    item.color === "blue" ? "from-blue-500 to-cyan-500" : "from-cyan-500 to-blue-500"
                                } text-white`}>
                                    {item.icon}
                                </div>
                                <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
                            Our team works with founders and core teams to unlock bottlenecks, set up scalable systems, and
                            build a business that's ready for scale, whether that means 10x users, revenue, or team.
                        </p>
                        <p className={`text-lg font-semibold italic ${isDark ? "text-white" : "text-gray-900"}`}>
                            We're your embedded growth partner, the tribe that plugs in where you need the most leverage.
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
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                for?
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-2xl border ${
                                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                                Growth Studio is designed for:
                            </h3>
                            <div className="space-y-3">
                                {[
                                    "Startups that have launched but are now hitting operational ceilings",
                                    "Founders ready to professionalise their internal systems",
                                    "Teams that need help setting up performance-led marketing and sales funnels",
                                    "Ventures preparing for scale, fundraising, or acquisition"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                            isDark ? "text-blue-400" : "text-blue-500"
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
                            <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                                Ideal for companies that:
                            </h3>
                            <div className="space-y-3">
                                {[
                                    "Have traction but are leaking efficiency",
                                    "Need cross-department support but can't yet afford a full-time C-suite",
                                    "Are seeking clarity and systems before expanding fast"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                            isDark ? "text-cyan-400" : "text-cyan-500"
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

            {/* What We Offer Section */}
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
                            What We Offer
                        </h2>
                    </motion.div>

                    <div className="space-y-8">
                        {[
                            {
                                title: "Operational Excellence",
                                icon: <Briefcase className="w-6 h-6" />,
                                items: [
                                    "Design SOPs and internal playbooks",
                                    "Implement agile team structures and reporting lines",
                                    "Set KPIs and build dashboards",
                                    "Transition from founder-led chaos to team-led execution"
                                ]
                            },
                            {
                                title: "Marketing & Brand Consulting",
                                icon: <Target className="w-6 h-6" />,
                                items: [
                                    "Define your core positioning and customer journey",
                                    "Set up content, paid, and influencer strategies",
                                    "Audit and relaunch your brand architecture",
                                    "Install growth loops that align with CAC-LTV economics"
                                ]
                            },
                            {
                                title: "Sales Engine Design",
                                icon: <TrendingUp className="w-6 h-6" />,
                                items: [
                                    "B2B and B2C sales funnel architecture",
                                    "CRM implementation and automation",
                                    "Sales hiring and incentive planning",
                                    "Building GTM (go-to-market) battle plans"
                                ]
                            },
                            {
                                title: "Finance & Legal Setup",
                                icon: <DollarSign className="w-6 h-6" />,
                                items: [
                                    "Financial health checks and forecasting tools",
                                    "Cap table reviews, ESOP planning, and investor reporting systems",
                                    "Legal structuring, IP protection, founder agreements",
                                    "Vendor, customer, and team contract frameworks"
                                ]
                            },
                            {
                                title: "Tech & Product Strategy",
                                icon: <Code className="w-6 h-6" />,
                                items: [
                                    "Audit existing tech stack",
                                    "Align product roadmap to business strategy",
                                    "Set up lean dev ops systems",
                                    "Build scalability into your platform or architecture"
                                ]
                            },
                            {
                                title: "CXO-Level Hiring Support",
                                icon: <Users className="w-6 h-6" />,
                                items: [
                                    "Interim leadership (fractional CMO, CTO, COO, CFO)",
                                    "Hiring playbooks for senior roles",
                                    "Candidate evaluation and onboarding frameworks"
                                ]
                            }
                        ].map((offering, index) => (
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
                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white`}>
                                        {offering.icon}
                                    </div>
                                    <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {offering.title}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {offering.items.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                                isDark ? "text-blue-400" : "text-blue-500"
                                            }`} />
                                            <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What Makes Us Different */}
            <section className={`py-20 ${isDark ? "bg-gray-950" : "bg-white"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-3xl md:text-4xl font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}>
                            What Makes Growth Studio Different?
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Depth Over Decks",
                                description: "We don't just audit and leave. We co-build systems with your team."
                            },
                            {
                                title: "Real Operators",
                                description: "Our consultants have scaled startups, built GTM engines, and led teams across India, MENA, and UK."
                            },
                            {
                                title: "Cross-Functional Integration",
                                description: "We don't look at one part of the business in isolation. We align brand, growth, ops, finance, and tech into one cohesive engine."
                            },
                            {
                                title: "Founder-First Flexibility",
                                description: "We work on sprint-based retainers, so you get the help you need, when you need it."
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
                                <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {item.title}
                                </h3>
                                <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
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
                            Ready to Scale?
                        </h2>
                        
                        <p className={`text-lg mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            If you're:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {[
                                "Scaling but stuck",
                                "Growing without clear systems",
                                "Preparing to raise capital or expand markets",
                                "Tired of DIY ops, sales, and hiring hacks"
                            ].map((item, i) => (
                                <div key={i} className={`flex items-start gap-3 p-4 rounded-lg ${
                                    isDark ? "bg-gray-900/50" : "bg-gray-50"
                                }`}>
                                    <Zap className={`w-5 h-5 mt-1 flex-shrink-0 ${
                                        isDark ? "text-blue-400" : "text-blue-500"
                                    }`} />
                                    <span className={`text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className={`text-lg mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            We don't do advisory for the sake of slides. We roll up our sleeves and build with you.
                        </p>

                        <p className={`text-lg font-semibold italic mb-8 ${
                            isDark ? "text-gray-200" : "text-gray-800"
                        }`}>
                            Then Growth Studio is for you.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-10 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl"
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

export default GrowthStudio;
