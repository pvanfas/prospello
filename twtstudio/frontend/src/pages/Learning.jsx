import React from "react";
import { motion } from "framer-motion";
import {
    Brain,
    Rocket,
    Laptop,
    BookOpen,
    Users,
    Target,
    ArrowRight,
    CheckCircle,
    Zap,
    Sparkles,
    TrendingUp,
    Award,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import Typography from "../components/Typography";

const programs = [
    {
        icon: <Brain className="h-8 w-8" />,
        title: "The Founders Crucible",
        desc: "A deep-dive academy where future leaders are forged, mastering the strategic clarity and execution rigor needed to transition from concept to venture architect.",
        bullets: [
            "Vision articulation & business model design",
            "Investor pitch mastery & boardroom presence",
            "Building & leading high-performing teams",
            "Founder mindset, resilience & decision-making",
            "Strategic thinking & systems for scale",
        ],
    },
    {
        icon: <Rocket className="h-8 w-8" />,
        title: "The Navigator Academy",
        desc: "Training dedicated to scaling leaders, providing advanced frameworks in governance, organizational design, and high-velocity strategy required to sustain market dominance.",
        bullets: [
            "Organizational design & governance frameworks",
            "Growth strategy & market positioning",
            "Go-to-market planning & execution",
            "Performance metrics & data-driven decisions",
            "Scaling operations & team structures",
        ],
    },
    {
        icon: <Laptop className="h-8 w-8" />,
        title: "The Operator Cadre",
        desc: "Focused on tactical mastery and team alignment, this program transforms managers into high-velocity operators capable of driving daily execution and delivering measurable outcomes.",
        bullets: [
            "Agile execution & sprint planning",
            "Cross-functional team coordination",
            "Product development & user experience design",
            "Process optimization & workflow automation",
            "Stakeholder management & communication",
        ],
    }
];

const LearningStudio = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${
                isDark ? "bg-gray-950 text-white" : "bg-white text-gray-900"
            }`}
        >
            {/* Hero Section with Programs - Combined */}
            <section className={`relative py-24 pt-32 overflow-hidden ${
                isDark ? "bg-gray-950" : "bg-white"
            }`}>
                {/* Animated Grid Background */}
                <div className="absolute inset-0">
                    <div className={`absolute inset-0 ${
                        isDark 
                            ? "bg-[linear-gradient(rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.02)_1px,transparent_1px)]" 
                            : "bg-[linear-gradient(rgba(239,68,68,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.015)_1px,transparent_1px)]"
                    } bg-[size:80px_80px]`} />
                    
                    {/* Gradient Orbs */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.15, 0.25, 0.15],
                        }}
                        transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`absolute top-20 right-20 w-[500px] h-[500px] rounded-full blur-3xl ${
                            isDark ? "bg-red-500/20" : "bg-red-500/10"
                        }`}
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{ 
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                        className={`absolute bottom-20 left-20 w-[600px] h-[600px] rounded-full blur-3xl ${
                            isDark ? "bg-orange-500/20" : "bg-orange-500/10"
                        }`}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Content */}
                    <motion.div
                        className="text-center max-w-5xl mx-auto mb-20"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 mb-8"
                        >
                            <BookOpen className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 font-semibold text-sm">Learning Studio</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Typography variant="h1">
                                The Tribe's{" "}
                                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                                    Command Academy
                                </span>
                            </Typography>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className={`text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed ${
                                isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            The Tribe's Learning Studio is our dedicated leadership foundry, replacing passive education with deep, experiential academies for future-ready founders and elite teams.
                        </motion.p>

                        
                    </motion.div>

                    {/* Programs Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="programs">
                        {programs.map((program, index) => (
                            <motion.div
                                key={program.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                                className={`group relative rounded-3xl p-8 border transition-all duration-500 ${
                                    isDark
                                        ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600"
                                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-2xl"
                                }`}
                            >
                                <div className="relative">
                                    <div className={`inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br ${
                                        index === 0 
                                            ? "from-red-500 to-pink-500" 
                                            : index === 1 
                                            ? "from-orange-500 to-red-500" 
                                            : "from-yellow-500 to-orange-500"
                                    } text-white shadow-lg transition-transform duration-300`}>
                                        {program.icon}
                                    </div>

                                    <h3 className={`text-2xl font-bold mb-4 ${
                                        isDark ? "text-white" : "text-gray-900"
                                    }`}>
                                        {program.title}
                                    </h3>

                                    <p className={`mb-8 leading-relaxed ${
                                        isDark ? "text-gray-400" : "text-gray-600"
                                    }`}>
                                        {program.desc}
                                    </p>

                                    <div className="space-y-3">
                                        {program.bullets.map((bullet, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3"
                                            >
                                                <CheckCircle className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                                    isDark ? "text-red-400" : "text-red-500"
                                                }`} />
                                                <span className={`text-sm leading-relaxed ${
                                                    isDark ? "text-gray-300" : "text-gray-700"
                                                }`}>
                                                    {bullet}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Philosophy & Who Joins */}
            <section className={`relative py-32 overflow-hidden ${isDark ? "bg-gray-950" : "bg-white"}`}>
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{ 
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 ${
                            isDark ? "bg-red-500/30" : "bg-red-500/20"
                        }`} 
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.15, 1],
                            x: [0, -40, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{ 
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 ${
                            isDark ? "bg-orange-500/30" : "bg-orange-500/20"
                        }`} 
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1],
                            x: [0, 50, 0],
                        }}
                        transition={{ 
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                        className={`absolute top-1/3 right-10 w-80 h-80 rounded-full blur-3xl opacity-15 ${
                            isDark ? "bg-pink-500/30" : "bg-pink-500/20"
                        }`} 
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.25, 1],
                            y: [0, -30, 0],
                        }}
                        transition={{ 
                            duration: 16,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 3
                        }}
                        className={`absolute bottom-1/4 left-10 w-72 h-72 rounded-full blur-3xl opacity-15 ${
                            isDark ? "bg-yellow-500/30" : "bg-yellow-500/20"
                        }`} 
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Philosophy Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 mb-6">
                            <Zap className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 font-semibold text-sm">Our Approach</span>
                        </div>

                        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}>
                            Our Learning{" "}
                            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                Philosophy
                            </span>
                        </h2>

                        <p className={`text-lg max-w-3xl mx-auto mb-16 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                            We believe in action-driven learning that transforms knowledge into results
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {[
                                {
                                    icon: <TrendingUp className="w-6 h-6" />,
                                    title: "Startup Speed",
                                    desc: "No fluff, just tools and execution"
                                },
                                {
                                    icon: <Award className="w-6 h-6" />,
                                    title: "Practitioner-Led",
                                    desc: "Learn from doers, not talkers"
                                },
                                {
                                    icon: <Zap className="w-6 h-6" />,
                                    title: "Real-Time Execution",
                                    desc: "Assignments linked to your work"
                                },
                                {
                                    icon: <Users className="w-6 h-6" />,
                                    title: "Peer Learning",
                                    desc: "Learn with a driven tribe"
                                },
                                {
                                    icon: <Sparkles className="w-6 h-6" />,
                                    title: "Blended Formats",
                                    desc: "Cohorts, mentorship, on-demand"
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
                                        isDark 
                                            ? "bg-gray-900/50 border-gray-800 hover:bg-gray-900 hover:border-gray-700" 
                                            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg"
                                    }`}
                                >
                                    <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br from-red-500 to-orange-500 text-white group-hover:scale-110 transition-transform duration-300`}>
                                        {item.icon}
                                    </div>
                                    <h4 className={`font-bold text-lg mb-2 ${
                                        isDark ? "text-white" : "text-gray-900"
                                    }`}>
                                        {item.title}
                                    </h4>
                                    <p className={`text-sm leading-relaxed ${
                                        isDark ? "text-gray-400" : "text-gray-600"
                                    }`}>
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Who Joins Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`rounded-3xl p-12 border relative overflow-hidden ${
                            isDark ? "bg-gray-900/50 border-gray-800" : "bg-gray-50 border-gray-200"
                        }`}
                    >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
                        
                        <div className="relative">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 mb-6">
                                    <Users className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500 font-semibold text-sm">Who Joins</span>
                                </div>

                                <h3 className={`text-4xl md:text-5xl font-bold mb-4 ${
                                    isDark ? "text-white" : "text-gray-900"
                                }`}>
                                    Who Should{" "}
                                    <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                        Join?
                                    </span>
                                </h3>

                                <p className={`text-lg max-w-2xl mx-auto ${
                                    isDark ? "text-gray-400" : "text-gray-600"
                                }`}>
                                    We accept learners who are committed to growth and excellence
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                <div>
                                    <h4 className={`text-xl font-bold mb-6 ${
                                        isDark ? "text-white" : "text-gray-900"
                                    }`}>
                                        Ideal Participants
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            "Already building, leading, or managing in startup environments",
                                            "Want to gain mastery — not just certificates",
                                            "Learn by doing and applying, not passively consuming",
                                            "Value real feedback from operators, founders, and CXOs"
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-start gap-3"
                                            >
                                                <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                                    isDark ? "text-red-400" : "text-red-500"
                                                }`} />
                                                <span className={`leading-relaxed ${
                                                    isDark ? "text-gray-300" : "text-gray-700"
                                                }`}>
                                                    {item}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className={`text-xl font-bold mb-6 ${
                                        isDark ? "text-white" : "text-gray-900"
                                    }`}>
                                        Target Roles
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { role: "Founders", icon: <Rocket className="w-5 h-5" /> },
                                            { role: "Growth Leads", icon: <TrendingUp className="w-5 h-5" /> },
                                            { role: "Product Teams", icon: <Laptop className="w-5 h-5" /> },
                                            { role: "New Managers", icon: <Users className="w-5 h-5" /> },
                                            { role: "CXOs", icon: <Award className="w-5 h-5" /> },
                                            { role: "Team Leads", icon: <Target className="w-5 h-5" /> }
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                                                    isDark 
                                                        ? "bg-gray-950/50 border-gray-800 hover:bg-gray-900 hover:border-gray-700" 
                                                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                                                }`}
                                            >
                                                <div className="text-red-500">
                                                    {item.icon}
                                                </div>
                                                <span className={`font-medium ${
                                                    isDark ? "text-gray-300" : "text-gray-700"
                                                }`}>
                                                    {item.role}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Access & CTA - Redesigned */}
            <section className={`relative py-32 overflow-hidden ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                {/* Background Blurred Circles */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            x: [0, -30, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{ 
                            duration: 14,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
                            isDark ? "bg-red-500/25" : "bg-red-500/15"
                        }`} 
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1],
                            x: [0, 20, 0],
                            y: [0, -25, 0],
                        }}
                        transition={{ 
                            duration: 17,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.5
                        }}
                        className={`absolute bottom-10 right-10 w-80 h-80 rounded-full blur-3xl opacity-20 ${
                            isDark ? "bg-orange-500/25" : "bg-orange-500/15"
                        }`} 
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.15, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ 
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2.5
                        }}
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 ${
                            isDark ? "bg-gradient-to-r from-red-500/30 to-pink-500/30" : "bg-gradient-to-r from-red-500/20 to-pink-500/20"
                        }`} 
                    />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 mb-8">
                            <Target className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 font-semibold text-sm">Get Started</span>
                        </div>

                        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}>
                            How to Access
                        </h2>

                        <p className={`text-lg mb-16 max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Programs delivered in hybrid formats: online sprints, in-person residencies, and intensive bootcamps.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            {[
                                { 
                                    title: "Open Cohorts", 
                                    desc: "Scheduled group programs",
                                    icon: <Users className="w-6 h-6" />,
                                    gradient: "from-red-500 to-pink-500"
                                },
                                { 
                                    title: "Custom Training", 
                                    desc: "Team-specific interventions",
                                    icon: <Target className="w-6 h-6" />,
                                    gradient: "from-orange-500 to-red-500"
                                },
                                { 
                                    title: "On-Demand", 
                                    desc: "Self-paced learning",
                                    icon: <BookOpen className="w-6 h-6" />,
                                    gradient: "from-yellow-500 to-orange-500"
                                }
                            ].map((option, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`group p-8 rounded-2xl border transition-all duration-300 ${
                                        isDark 
                                            ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600" 
                                            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl"
                                    }`}
                                >
                                    <div className={`inline-flex p-4 rounded-xl mb-6 bg-gradient-to-br ${option.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {option.icon}
                                    </div>
                                    <h4 className={`font-bold text-xl mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {option.title}
                                    </h4>
                                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        {option.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                to="/appointment"
                                className="group inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-12 py-5 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Book Appointment
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LearningStudio;
