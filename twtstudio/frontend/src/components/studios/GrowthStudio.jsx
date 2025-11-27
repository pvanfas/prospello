import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const GrowthStudio = () => {
    const { theme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`py-30 px-6 sm:px-10 md:px-20 max-w-5xl mx-auto text-gray-800 dark:text-gray-100 ${theme === "dark" ? "text-white" : "bg-white text-gray-900"
                }`}
        >
            <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-8"
            >
                Growth Studio  | TWT Venture Studio
            </motion.h1>
            <p className="text-lg font-semibold mb-6">
                Where Scale Meets Precision. Where Chaos Turns into Compound Growth.
            </p>

            <p className="mb-4">
                At TWT Venture Studio, Growth Studio is our high-impact consulting arm for fast-moving startups.
                We embed deep operational, marketing, finance, legal, and CXO-level expertise into your business —
                not just to help you grow, but to help you scale sustainably, profitably, and smartly.
            </p>
            <p className="mb-6">
                This is not advisory. This is executional consulting for founders who want sharper processes,
                higher performance, and strategic infrastructure to fuel their next stage.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-2">What is the Growth Studio?</h2>
            <p className="mb-4">
                Growth Studio is a full-spectrum business scaling engine. It combines hands-on consulting with
                operational execution across:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-6">
                <li>Business Operations</li>
                <li>Marketing & Brand Strategy</li>
                <li>Sales Growth Systems</li>
                <li>Finance & Compliance</li>
                <li>Technology Stack Planning</li>
                <li>Legal Structuring & IP</li>
                <li>C-Level Talent Strategy & Hiring</li>
            </ul>

            <p className="mb-6">
                Our team works with founders and core teams to unlock bottlenecks, set up scalable systems, and
                build a business that's ready for scale, whether that means 10x users, revenue, or team.
            </p>
            <p className="mb-4">We’re your embedded growth partner, the tribe that plugs in where you need the most leverage.</p>
            <h2 className="text-xl font-bold mt-6 mb-2">Who is it for?</h2>
            <p className="mb-4">Growth Studio is designed for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-6">
                <li>Startups that have launched but are now hitting operational ceilings</li>
                <li>Founders ready to professionalise their internal systems</li>
                <li>Teams that need help setting up performance-led marketing and sales funnels</li>
                <li>Ventures preparing for scale, fundraising, or acquisition</li>
            </ul>
            <p className="mb-4">Ideal for companies that:</p>
            <ul className="list-disc pl-6 space-y-1 mb-6">
                <li>Companies that have traction but are leaking efficiency</li>
                <li>Teams needing cross-department support but can’t yet afford a full-time C-suite</li>
                <li>Founders seeking clarity and systems before expanding fast</li>
            </ul>
            <h2 className="text-xl font-bold mt-6 mb-2">What We Offer</h2>
            <ol className="list-decimal pl-6 space-y-4 mb-6">
                <li>
                    <strong>Operational Excellence</strong>
                    <p className="mt-1">
                        We help you:
                    </p>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>Design SOPs and internal playbooks</li>
                        <li>Implement agile team structures and reporting lines</li>
                        <li>Set KPIs and build dashboards</li>
                        <li>Transition from founder-led chaos to team-led execution</li>
                    </ul>
                </li>

                <li>
                    <strong>Marketing & Brand Consulting</strong>
                    <p className="mt-1">
                        We embed brand and marketing advisors who:
                    </p>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>Define your core positioning and customer journey</li>
                        <li>Set up content, paid, and influencer strategies</li>
                        <li>Audit and relaunch your brand architecture</li>
                        <li>Install growth loops that align with CAC-LTV economics</li>
                    </ul>
                </li>

                <li>
                    <strong>Sales Engine Design</strong>
                    <p className="mt-1">
                        We support:
                    </p>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>B2B and B2C sales funnel architecture</li>
                        <li>CRM implementation and automation</li>
                        <li>Sales hiring and incentive planning</li>
                        <li>Building GTM (go-to-market) battle plans</li>
                    </ul>
                </li>

                <li>
                    <strong>Finance & Legal Setup</strong>
                    <p className="mt-1">
                        We provide:
                    </p>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>Financial health checks and forecasting tools</li>
                        <li>Cap table reviews, ESOP planning, and investor reporting systems</li>
                        <li>Legal structuring, IP protection, founder agreements</li>
                        <li>Vendor, customer, and team contract frameworks</li>
                    </ul>
                </li>

                <li>
                    <strong>Tech & Product Strategy</strong>
                    <p className="mt-1">
                        We work with your tech teams to:
                    </p>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>Audit existing tech stack</li>
                        <li>Align product roadmap to business strategy</li>
                        <li>Set up lean dev ops systems</li>
                        <li>Build scalability into your platform or architecture</li>
                    </ul>
                </li>

                <li>
                    <strong>CXO-Level Hiring Support</strong>
                    <p className="mt-1">
                        You don’t need a full-time C-suite yet, but you need their thinking. We help with:
                    </p>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                        <li>Interim leadership (fractional CMO, CTO, COO, CFO)</li>
                        <li>Hiring playbooks for senior roles</li>
                        <li>Candidate evaluation and onboarding frameworks</li>
                    </ul>
                </li>
            </ol>


            <h2 className="text-xl font-bold mt-6 mb-2">What Makes Growth Studio Different?</h2>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                    <strong>Depth Over Decks –</strong> We don’t just audit and leave. We co-build systems with your team.
                </li>
                <li>
                    <strong>Real Operators –</strong> Our consultants have scaled startups, built GTM engines, and led teams across India, MENA, and UK.
                </li>
                <li>
                    <strong>Cross-Functional Integration –</strong> We don’t look at one part of the business in isolation. We align brand, growth, ops, finance, and tech into one cohesive engine.
                </li>
                <li>
                    <strong>Founder-First Flexibility –</strong> We work on sprint-based retainers, so you get the help you need, when you need it.
                </li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-2">Who We Work With</h2>
            <p className="mb-2">We work with:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Early-stage to growth-stage startups post-launch</li>
                <li>Founder-led teams preparing for scale</li>
                <li>Companies that need 360° strategic support but want to stay lean</li>
            </ul>
            <p className="mb-6">
                We don’t do advisory for the sake of slides. We roll up our sleeves and build with you.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-2">Ready to Scale?</h2>
            <p className="mb-2">If you're:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Scaling but stuck</li>
                <li>Growing without clear systems</li>
                <li>Preparing to raise capital or expand markets</li>
                <li>Tired of DIY ops, sales, and hiring hacks</li>
            </ul>
            <p className="mb-6">
                Then <strong>Growth Studio</strong> is for you.
            </p>


            <motion.div
                variants={fadeInUp}
                className="flex justify-center"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-red-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl"
                >
                    Book Appointment
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default GrowthStudio;
