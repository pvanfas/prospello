
import React from "react";
import { motion } from "framer-motion";
import {
    Brain,
    Rocket,
    Laptop,
    Compass,
    Target,
    ArrowRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.2, duration: 0.6 },
    }),
};

const programs = [
    {
        icon: <Brain className="h-8 w-8 text-red-500" />,
        title: "Founders Academy",
        desc: "A cohort-based, immersive experience for startup founders ready to move beyond hustle. It focuses on leadership, capital strategy, hiring, and startup systems to lead like a CEO.",
        bullets: [
            "Vision & business model alignment",
            "Investor & boardroom readiness",
            "Hiring your first 10 key people",
            "Founder psychology & resilience",
            "Systems thinking for scale",
        ],
    },
    {
        icon: <Rocket className="h-8 w-8 text-red-500" />,
        title: "Marketing School",
        desc: "An operator-led program for data-literate, creative marketers. Learn revenue-driven marketing: funnels, campaigns, storytelling, and retention.",
        bullets: [
            "Positioning and narrative design",
            "Performance & retention marketing",
            "GTM and funnel building",
            "Real campaigns and ROI tracking",
            "Brand systems that scale",
        ],
    },
    {
        icon: <Laptop className="h-8 w-8 text-red-500" />,
        title: "Tech School",
        desc: "Turns coders into product creators. Learn to build user-focused, startup-ready tech — whether you're a dev, designer, or PM.",
        bullets: [
            "Lean MVP development",
            "Communication with founders & business teams",
            "Product thinking & UX",
            "DevOps & cross-functional planning",
            "No-code/low-code prototyping",
        ],
    },
    {
        icon: <Compass className="h-8 w-8 text-red-500" />,
        title: "Manager Development Program",
        desc: "Built for first-time managers and team leads in startups. Learn how to manage, delegate, and drive performance in fast-moving teams.",
        bullets: [
            "Leading with clarity and accountability",
            "Feedback systems and reviews",
            "Delegation, decision-making, and time leverage",
            "Meeting rhythms and culture building",
            "Driving performance in small, fast teams",
        ],
    },
    {
        icon: <Target className="h-8 w-8 text-red-500" />,
        title: "CXO Development Track",
        desc: "For emerging CXOs or leaders ready for the role. Sharpen strategic decision-making, executive presence, and scaling leadership.",
        bullets: [
            "Investor management and governance",
            "Strategic capital allocation",
            "Talent architecture & OKRs",
            "Public communication and executive presence",
            "Systems for scale and sustainability",
        ],
    },
];


const LearningStudio = () => {
    const { theme } = useTheme();

    return (
        <div
            className={`py-20 px-4 md:px-16 transition-all duration-300 ${theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-[#f7f9f7] text-gray-900"
                }`}
        >
            {/* Header */}
            <section className="studio-section py-28 px-4 md:px-6">
                <motion.div
                    className="text-center max-w-6xl mx-auto"
                    initial={{ opacity: 0, y: 80 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <motion.p
                        className="text-4xl uppercase tracking-widest text-red-500"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Learning Studio
                    </motion.p>

                    <motion.h1
                        className="mt-4 text-2xl md:text-4xl font-extrabold leading-tight tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Where Learning Meets Leadership. <br /> Where Knowledge Powers Execution.
                    </motion.h1>

                    <motion.p
                        className={`mt-8 text-lg md:text-2xl font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        TWT Venture Studio’s Learning Studio is our dedicated vertical to shape
                        future-ready leaders, startup teams, and scale-stage talent. Through
                        deep, experiential learning academies, we equip founders, operators,
                        and teams to lead with clarity, skill, and confidence.
                    </motion.p>

                    <motion.p
                        className={`mt-6 text-md md:text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                            }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        This isn’t generic upskilling. It’s startup-centric, tribe-driven education for real-world execution.
                    </motion.p>
                </motion.div>
            </section>
            {/* Program Cards */}
            <h1 className="text-3xl font-bold mb-8 text-center">Our Flagship Programs
            </h1>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map((program, i) => (
                    <motion.div
                        key={program.title}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={cardVariants}
                        className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                        <div className="mb-4">{program.icon}</div>
                        <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-black' : ''}`}>{program.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {program.desc}
                        </p>
                        <ul className="text-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                            {program.bullets.map((point, j) => (
                                <li key={j}>{point}</li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* Unified Info Section */}
            <div className="mt-28 max-w-5xl mx-auto px-4 md:px-0 space-y-16">
                {/* Philosophy */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-left">Our Learning Philosophy</h2>
                    <ul className={`ml-6 text-md space-y-2 list-disc ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        <li>Built for Startup Speed – No fluff, just tools and execution</li>
                        <li>Practitioner-Led – Learn from doers, not talkers</li>
                        <li>Real-Time Execution – Assignments linked to your real work</li>
                        <li>Peer Learning – Learn with and from a driven tribe</li>
                        <li>Blended Formats – Cohorts, 1:1 mentorship, on-demand, live cases</li>
                    </ul>
                </div>

                {/* Who Should Join */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-left">Who Should Join?</h2>
                    <p className={`text-md mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        We accept learners who:
                    </p>
                    <ul className={`ml-6 text-md space-y-2 list-disc ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        <li>Are already building, leading, or managing in startup environments</li>
                        <li>Want to gain mastery — not just certificates</li>
                        <li>Learn by doing and applying, not passively consuming</li>
                        <li>Value real feedback from operators, founders, and CXOs</li>
                    </ul>
                    <p className={`text-md mt-6 mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        We serve:
                    </p>
                    <ul className={`ml-6 text-md space-y-2 list-disc ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        <li>Founders and co-founders</li>
                        <li>Marketing/growth leads</li>
                        <li>Product and tech teams</li>
                        <li>New managers</li>
                        <li>CXOs in scaling startups</li>
                    </ul>
                </div>

                {/* How to Access */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-left">How to Access</h2>
                    <p className={`text-md mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}> 
                        Programs are delivered in hybrid formats: online sprints, in-person residencies, and intensive bootcamps.
                    </p>
                    <ul className={`ml-6 text-md space-y-2 list-disc ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        <li>Join open cohorts</li>
                        <li>Request team-specific custom interventions</li>
                        <li>Access on-demand tracks as part of the TWT ecosystem</li>
                    </ul>
                </div>
            </div>


            {/* CTA */}
            <div className="mt-20 text-center">
                <Link
                    to="/book"
                    className="inline-flex items-center bg-red-500 text-white font-semibold px-6 py-3 rounded-md shadow hover:bg-red-600 transition"
                >
                    Book Appointment <span className="ml-2"><ArrowRight /></span>
                </Link>
            </div>
        </div>
    );
};

export default LearningStudio;
