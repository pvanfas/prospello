import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const CapitalStudio = () => {
    const { theme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`py-30 px-6 sm:px-10 md:px-20 max-w-5xl mx-auto ${theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
        >
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-8">
                Capital Studio | TWT Venture Studio
            </h1>

            <p className="text-lg font-semibold mb-6">
                Where Capital Meets Clarity. Where Ambition Gets Funded.
            </p>

            <p className="mb-6 leading-relaxed">
                TWT Venture Studio’s Capital Studio is not a funding accelerator or a matchmaking platform.
                It’s a strategic investment and M&A advisory arm built for high-growth ventures and scale-ready founders.
                Whether you’re raising your first cheque or preparing for acquisition, we help you structure, position,
                and close the deals that move the needle.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">What is the Capital Studio?</h2>
            <p className="mb-4">The Capital Studio is TWT's dedicated platform for: </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Strategic fundraising support</li>
                <li>Investor readiness and pitch engineering</li>
                <li>Capital syndication and introductions</li>
                <li>Cross-border expansion funding</li>
                <li>Mergers, acquisitions, and exits</li>
            </ul>

            <p className="mb-6">
                We sit with you not just as advisors, but as capital partners aligning business strategy with capital strategy.
                <br />
                <strong>Our mission:</strong> Help founders raise smart, structured capital and close high-leverage partnerships.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">Who is it for?</h2>
            <p className="mb-4">Capital Studio is designed for:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Founders raising Pre-Seed to Series A rounds</li>
                <li>Ventures preparing for acquisition, consolidation, or joint ventures</li>
                <li>Fast-growing companies ready to enter new markets or scale operations</li>
                <li>Early-stage companies seeking strategic investors over blind cheques</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">We’re the capital partner for:</h2>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>First-time founders navigating their first raise</li>
                <li>Growth-stage startups structuring a complex round</li>
                <li>Founders preparing to exit or attract acquirers</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">What Makes Us Different?</h2>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Founder-Led, Strategy-Backed:</strong> We’ve raised capital, exited companies, and sat on both sides of the table.</li>
                <li><strong>No Fluff, Just Deals:</strong> We don’t promise pitch days. We deliver smart deals.</li>
                <li><strong>End-to-End Advisory:</strong> From data room setup to post-funding execution, we stay till the close.</li>
                <li><strong>Cross-Border Expertise:</strong> We understand the cultural and regulatory nuances of fundraising across regions.</li>
                <li><strong>Aligned Incentives:</strong> We win when you do. No success, no fee models available in select cases.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">Who We Work With</h2>
            <p className="mb-4">We selectively work with:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Mission-aligned founders</li>
                <li>Companies with a validated product or revenue traction</li>
                <li>Startups solving large, clear market problems</li>
                <li>Founders who value strategic capital over random cheques</li>
            </ul>
            <p>If you want more than funding, if you want strategic partnership — we’re your tribe.</p>
            <h2 className="text-2xl font-bold mt-10 mb-4">Apply to Join Capital Studio</h2>
            <p className="mb-6">
                We work with only a handful of companies each quarter. If you’re looking to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Raise a round</li>
                <li>Prepare for acquisition</li>
                <li>Explore a strategic merger</li>
                <li>Enter a new region with capital backing</li>
            </ul>

            <p className="mb-6 leading-relaxed">
                Capital Studio isn’t about raising money for the sake of it. It’s about raising smart capital with sharp intent.
                We don’t chase VCs. We build businesses investors want to chase.
                <br />
                Welcome to The Workoholic Tribe. Let’s make your next raise a weapon, not a struggle.
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

export default CapitalStudio;
