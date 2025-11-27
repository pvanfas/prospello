import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { Rocket, Users, Target, Zap, TrendingUp, Award, ArrowRight } from "lucide-react";


const AccelerationStudio = () => {
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
                            isDark ? "bg-red-500/20" : "bg-red-500/10"
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
                            isDark ? "bg-orange-500/20" : "bg-orange-500/10"
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
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 mb-8">
                            <Rocket className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 font-semibold text-sm">TWT Venture Studio</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                            Acceleration Studio
                        </h1>

                        <p className={`text-xl md:text-2xl mb-8 ${
                            isDark ? "text-gray-300" : "text-gray-600"
                        }`}>
                            Where Hustle Meets Structure. Where Vision Gets Fueled.
                        </p>

                        <p className={`text-lg leading-relaxed ${
                            isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                            At TWT Venture Studio, our Acceleration Studio is not an educational course or learning program.
                            It's a high-touch strategic consultancy platform tailored for early-stage startups that need more than advice — they need direction, systems, and execution.This is where high-potential founders
                            partner with us to scale fast, build strong, and avoid the common traps of early-stage chaos.
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
                            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                Acceleration Studio?
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
                            <p className={`text-lg leading-relaxed ${
                                isDark ? "text-gray-300" : "text-gray-700"
                            }`}>
                                The Acceleration Studio is a founder-first, consultancy-driven launchpad. We don't hand out certificates or give lectures — we build alongside you.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-2xl border ${
                                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <p className={`text-lg leading-relaxed ${
                                isDark ? "text-gray-300" : "text-gray-700"
                            }`}>
                                This is a bespoke, strategic growth support system for early-stage startups ready to transition from MVP to scale-up mode.
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`p-8 rounded-2xl border ${
                            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                        }`}
                    >
                        <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                            We work in cohort-based formats where founders receive:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Tactical support from our in-house team of strategists, operators, and creatives",
                                "Personalised consultancy on product, growth, fundraising, and org-building",
                                "Access to our execution stack, capital networks, and partner ecosystem",
                                "Expert-led sprints focused on outcome, not theory"
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <Zap className={`w-5 h-5 mt-1 flex-shrink-0 ${
                                        isDark ? "text-red-400" : "text-red-500"
                                    }`} />
                                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className={`mt-8 text-lg font-medium italic ${
                            isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
                            It's not a bootcamp. It's not mentorship theater. It's a consultancy-meets-venture-building hybrid for serious founders.
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
                            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                for?
                            </span>
                        </h2>
                        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            The Acceleration Studio is designed for:
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {[
                            { icon: <Target className="w-6 h-6" />, text: "Founders who need strategic clarity" },
                            { icon: <TrendingUp className="w-6 h-6" />, text: "Startups stuck between MVP and PMF" },
                            { icon: <Users className="w-6 h-6" />, text: "Founders seeking lean execution partners" },
                            { icon: <Award className="w-6 h-6" />, text: "Teams preparing for funding or scale" }
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
                                <div className={`p-3 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white`}>
                                    {item.icon}
                                </div>
                                <span className={`text-lg font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
                        <p className={`text-lg mb-6 leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
                            If you're past the ideation phase and ready to run — we become your growth consultants, your
                            operations team, your sounding board, and your partner in the trenches.
                        </p>
                        <p className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                            This is for those who:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                "Are obsessed with solving real problems",
                                "Move fast and avoid costly mistakes",
                                "Need a studio that behaves like a co-founder"
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <Zap className={`w-5 h-5 mt-1 flex-shrink-0 ${
                                        isDark ? "text-red-400" : "text-red-500"
                                    }`} />
                                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* What Do You Get Section */}
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
                            What Do You Get?
                        </h2>
                        <p className={`text-xl ${
                            isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                            Our Strategic Offering
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {[
                            {
                                title: "Strategic Consultancy, Not Coaching",
                                description: "Every startup receives a tailored action plan, created by our core team of former founders, product leaders, GTM experts, and brand architects. We go deep into:",
                                items: [
                                    "Market validation",
                                    "Business model iteration",
                                    "Growth mapping",
                                    "Investor strategy",
                                    "Revenue architecture"
                                ],
                                footer: "We don't give generic advice. We audit, we plan, we execute."
                            },
                            {
                                title: "Founder Cohorts with Output-Driven Sprints",
                                description: "Startups are placed into curated cohorts that run for 10–14 weeks, each structured around measurable business milestones.",
                                items: [
                                    "Weekly OKR alignment sessions",
                                    "Strategy & execution sprints",
                                    "Private founder strategy circles",
                                    "Tactical problem-solving rooms"
                                ],
                                footer: "This format enables accountability, momentum, and real-time progress."
                            },
                            {
                                title: "Deep Execution Support",
                                description: "Think of us as your interim strategy team with on-ground operators. You get:",
                                items: [
                                    "Business & Ops Strategy: Process mapping, KPI frameworks, scalable workflows",
                                    "Product Advisory: Feature prioritisation, roadmap planning, UX guidance",
                                    "GTM Acceleration: Channel strategy, campaigns, positioning",
                                    "Investor Deck Advisory: Crafting narratives that align with your next fundraise",
                                    "Hiring & Team Structure: Org design for scale, first hires, advisory board formation"
                                ],
                                footer: "We get into your business with you."
                            },
                            {
                                title: "Ecosystem Advantage",
                                description: "Leverage our full-stack ecosystem:",
                                items: [
                                    "Warm intros to active angels and pre-seed funds",
                                    "Access to our trusted network of lawyers, CAs, developers, brand studios",
                                    "Over $200K worth of SaaS credits and service perks",
                                    "Entry into our broader TWT founder tribe"
                                ],
                                footer: "This isn't just a program — it's a growth environment."
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
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold`}>
                                        {index + 1}
                                    </div>
                                    <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {offering.title}
                                    </h3>
                                </div>
                                <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    {offering.description}
                                </p>
                                <ul className="space-y-2 mb-4">
                                    {offering.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                                isDark ? "text-red-400" : "text-red-500"
                                            }`} />
                                            <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className={`italic font-medium ${
                                    isDark ? "text-gray-400" : "text-gray-600"
                                }`}>
                                    {offering.footer}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Philosophy, Results, Why TWT - Combined */}
            <section className={`py-20 ${isDark ? "bg-gray-950" : "bg-white"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Philosophy */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-2xl border ${
                                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <h3 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                                Our Founder-Centric Philosophy
                            </h3>
                            <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                At TWT, we know founders are the single point of leverage. That's why we focus on helping founders become
                                sharper decision-makers, better strategists, and more effective builders.
                            </p>
                            <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                We coach through execution, not theory. You don't just talk to mentors — you work with people who've done it.
                            </p>
                            <ul className="space-y-2">
                                {[
                                    "One-on-one strategic audits",
                                    "Access to battle-tested startup playbooks",
                                    "Real-time feedback on critical decisions",
                                    "Founder mental fitness check-ins"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                            isDark ? "text-red-400" : "text-red-500"
                                        }`} />
                                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className={`mt-6 italic ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                We help you unlock momentum while staying aligned with your long-term vision.
                            </p>
                        </motion.div>

                        {/* Results */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className={`p-8 rounded-2xl border ${
                                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <h3 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                                Real Results: What Happens Post-Studio
                            </h3>
                            <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Startups that work with our Acceleration Studio go on to:
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Achieve PMF within 6–12 months",
                                    "Raise high-conviction early capital",
                                    "Build a solid growth engine",
                                    "Create strong brand positioning",
                                    "Reduce operational chaos"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                            isDark ? "text-red-400" : "text-red-500"
                                        }`} />
                                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className={`mt-6 italic font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                This isn't a "quick tips" model. It's operational depth, fast.
                            </p>
                        </motion.div>

                        {/* Why TWT */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className={`p-8 rounded-2xl border ${
                                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <h3 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                                Why TWT Acceleration Studio?
                            </h3>
                            <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Because we're not educators. We're builders and consultants. We sit inside your business with you, challenge your roadmap,
                                reframe your strategy, and help you execute sharper.
                            </p>
                            <p className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                We offer:
                            </p>
                            <ul className="space-y-2 mb-6">
                                {[
                                    "Deep operator experience",
                                    "Functional expertise across brand, growth, tech, and ops",
                                    "Access to infrastructure, team, and network",
                                    "Co-founder-style obsession without taking over your cap table"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                            isDark ? "text-red-400" : "text-red-500"
                                        }`} />
                                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                Most importantly, we value:
                            </p>
                            <ul className="space-y-2">
                                {[
                                    "Clarity over complexity",
                                    "Truth over fluff",
                                    "Results over noise"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Zap className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                            isDark ? "text-red-400" : "text-red-500"
                                        }`} />
                                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Apply Section & CTA */}
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
                            Apply to Join
                        </h2>
                        <p className={`text-lg mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            We run highly selective cohorts, typically once every quarter. Each cohort accepts only 8–10 startups to ensure deep support.
                        </p>

                        <div className={`p-6 rounded-xl mb-8 ${
                            isDark ? "bg-gray-900/50" : "bg-gray-50"
                        }`}>
                            <p className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                                Apply if:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    "You've got a real product or service",
                                    "You need strategy, not schooling",
                                    "You want operators, not passive mentors"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Zap className={`w-5 h-5 mt-1 flex-shrink-0 ${
                                            isDark ? "text-red-400" : "text-red-500"
                                        }`} />
                                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            The Acceleration Studio isn't here to teach. It's here to do. We exist for founders who want clarity,
                            support, speed, and sharpness — not another certificate.
                        </p>
                        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            If you're looking for true strategic backing with tactical execution, <strong>TWT is your unfair advantage.</strong>
                        </p>

                        <p className={`text-lg font-semibold italic mb-8 ${
                            isDark ? "text-gray-200" : "text-gray-800"
                        }`}>
                            Welcome to The Workoholic Tribe. Let's scale your vision together.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-10 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl"
                        >
                            Join the Tribe
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AccelerationStudio;
