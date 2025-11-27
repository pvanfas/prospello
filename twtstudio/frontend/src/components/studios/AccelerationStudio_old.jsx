import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const AccelerationStudio = () => {
    const { theme } = useTheme();

    return (
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`py-30 px-6 sm:px-10 md:px-20 ${
          theme === "dark" ? "text-gray-100" : "text-gray-900"
        }`}
        >
            {/* Title & Intro */}
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-8">
                Acceleration Studio | TWT Venture Studio
            </h1>

            <p className="text-xl font-semibold mb-4">
                Where Hustle Meets Structure. Where Vision Gets Fueled.
            </p>

            <p className={`text-lg mb-12 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
                At TWT Venture Studio, our Acceleration Studio is not an educational course or learning program.
                It's a high-touch strategic consultancy platform tailored for early-stage startups that need more than advice — they need direction, systems, and execution.This is where high-potential founders
                partner with us to scale fast, build strong, and avoid the common traps of early-stage chaos.
            </p>

            {/* Section: What is it */}
            <section className="mb-14">
                <h2 className="text-3xl font-bold mb-4">What is the Acceleration Studio?</h2>
                <p className="mb-4">
                    The Acceleration Studio is a founder-first, consultancy-driven launchpad. We don’t hand out certificates or give lectures — we build alongside you.
                </p>
                <p className="mb-4">
                    This is a bespoke, strategic growth support system for early-stage startups ready to transition from MVP to scale-up mode.
                </p>
                <p className="mb-4">
                    We work in cohort-based formats where founders receive:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Tactical support from our in-house team of strategists, operators, and creatives</li>
                    <li>Personalised consultancy on product, growth, fundraising, and org-building</li>
                    <li>Access to our execution stack, capital networks, and partner ecosystem</li>
                    <li> Expert-led sprints focused on outcome, not theory</li>
                </ul>
                <p className="mb-8">
                    It’s not a bootcamp. It’s not mentorship theater. It’s a consultancy-meets-venture-building hybrid
                    for serious founders.

                </p>
            </section>

            {/* Section: Who is it for */}
            <section className="mb-14">
                <h2 className="text-3xl font-bold mb-4">Who is it for?</h2>
                <p className="mb-2">The Acceleration Studio is designed for:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Founders who need strategic clarity</li>
                    <li>Startups stuck between MVP and PMF</li>
                    <li>Founders seeking lean execution partners</li>
                    <li>Teams preparing for funding or scale</li>
                </ul>
                <p className="mb-4">If you’re past the ideation phase and ready to run — we become your growth consultants, your
                    operations team, your sounding board, and your partner in the trenches.
                </p>
                <p className="mb-2">This is for those who:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Are obsessed with solving real problems</li>
                    <li>Move fast and avoid costly mistakes</li>
                    <li>Need a studio that behaves like a co-founder</li>
                </ul>
            </section>

            {/* Section: What Do You Get */}
            <section className="mb-14">
                <h2 className="text-3xl font-bold mb-4">What Do You Get? | Our Strategic Offering</h2>
                <p className="mb-6">Here’s what startups gain when they enter the Acceleration Studio:</p>
                <ol className="list-decimal pl-6 space-y-6">
                    <li>
                        <strong>Strategic Consultancy, Not Coaching</strong>
                        <p className="mt-2">
                            Every startup receives a tailored action plan, created by our core team of former founders, product leaders, GTM experts, and brand architects. We go deep into:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Market validation</li>
                            <li>Business model iteration</li>
                            <li>Growth mapping</li>
                            <li>Investor strategy</li>
                            <li>Revenue architecture</li>
                        </ul>
                        <p className="mt-2">We don't give generic advice. We audit, we plan, we execute.</p>
                    </li>
                    <li>
                        <strong>Founder Cohorts with Output-Driven Sprints</strong>
                        <p className="mt-2">
                            Startups are placed into curated cohorts that run for 10–14 weeks, each structured around measurable business milestones.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Weekly OKR alignment sessions</li>
                            <li>Strategy & execution sprints</li>
                            <li>Private founder strategy circles</li>
                            <li>Tactical problem-solving rooms</li>
                        </ul>
                        <p className="mt-2">This format enables accountability, momentum, and real-time progress.</p>
                    </li>
                    <li>
                        <strong>Deep Execution Support</strong>
                        <p className="mt-2">Think of us as your interim strategy team with on-ground operators. You get:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Business & Ops Strategy:</strong> Process mapping, KPI frameworks, scalable workflows</li>
                            <li><strong>Product Advisory:</strong> Feature prioritisation, roadmap planning, UX guidance</li>
                            <li><strong>GTM Acceleration:</strong> Channel strategy, campaigns, positioning</li>
                            <li><strong>Investor Deck Advisory:</strong> Crafting narratives that align with your next fundraise</li>
                            <li><strong>Hiring & Team Structure:</strong> Org design for scale, first hires, advisory board formation</li>
                        </ul>
                        <p className="mt-2">We get into your business with you.</p>
                    </li>
                    <li>
                        <strong>Ecosystem Advantage</strong>
                        <p className="mt-2">Leverage our full-stack ecosystem:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Warm intros to active angels and pre-seed funds</li>
                            <li>Access to our trusted network of lawyers, CAs, developers, brand studios</li>
                            <li>Over $200K worth of SaaS credits and service perks</li>
                            <li>Entry into our broader TWT founder tribe</li>
                        </ul>
                        <p className="mt-2">This isn’t just a program — it’s a growth environment.</p>
                    </li>
                </ol>
            </section>


            {/* Section: Philosophy */}
            <section className="mb-14">
                <h2 className="text-3xl font-bold mb-4">Our Founder-Centric Philosophy</h2>
                <p className="mb-4">
                    At TWT, we know founders are the single point of leverage. That’s why we focus on helping founders become
                    sharper decision-makers, better strategists, and more effective builders.
                </p>
                <p className="mb-4">
                    We coach through execution, not theory. You don’t just talk to mentors — you work with people who’ve done it.
                </p>
                <p className="mb-4">You get:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>One-on-one strategic audits</li>
                    <li>Access to battle-tested startup playbooks</li>
                    <li>Real-time feedback on critical decisions</li>
                    <li>Founder mental fitness check-ins</li>
                </ul>
                <p className="mt-4">
                    We help you unlock momentum while staying aligned with your long-term vision.
                </p>
            </section>


            {/* Section: Results */}
            <section className="mb-14">
                <h2 className="text-3xl font-bold mb-4">Real Results: What Happens Post-Studio</h2>
                <p className="mb-4">
                    Startups that work with our Acceleration Studio go on to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Achieve PMF within 6–12 months</li>
                    <li>Raise high-conviction early capital</li>
                    <li>Build a solid growth engine</li>
                    <li>Create strong brand positioning</li>
                    <li>Reduce operational chaos</li>
                </ul>
                <p className="mt-4">
                    This isn’t a "quick tips" model. It’s operational depth, fast.
                </p>
            </section>


            {/* Section: Why TWT */}
            <section className="mb-14">
                <h2 className="text-3xl font-bold mb-4">Why TWT Acceleration Studio?</h2>
                <p className="mb-4">
                    Because we’re not educators. We’re builders and consultants. We sit inside your business with you, challenge your roadmap,
                    reframe your strategy, and help you execute sharper.
                </p>

                <p className="mb-2">We offer:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Deep operator experience</li>
                    <li>Functional expertise across brand, growth, tech, and ops</li>
                    <li>Access to infrastructure, team, and network</li>
                    <li>Co-founder-style obsession without taking over your cap table</li>
                </ul>

                <p className="mt-6 font-semibold">Most importantly, we value:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Clarity over complexity</li>
                    <li>Truth over fluff</li>
                    <li>Results over noise</li>
                </ul>
            </section>


            {/* Section: Apply */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-4">Apply to Join</h2>
                <p className="mb-4">
                    We run highly selective cohorts, typically once every quarter. Each cohort accepts only 8–10 startups to ensure deep support.
                </p>

                <p className="mb-2">Apply if:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>You’ve got a real product or service</li>
                    <li>You need strategy, not schooling</li>
                    <li>You want operators, not passive mentors</li>
                </ul>

                <p className="mt-4">
                    The Acceleration Studio isn’t here to teach. It’s here to do. We exist for founders who want clarity,
                    support, speed, and sharpness — not another certificate.
                </p>
                <p className="mt-2">
                    If you’re looking for true strategic backing with tactical execution, <strong>TWT is your unfair advantage.</strong>
                </p>

                <p className="mt-4 font-semibold italic">
                    Welcome to The Workoholic Tribe. Let’s scale your vision together.
                </p>
            </section>


            {/* CTA Button */}
            <motion.div
                variants={fadeInUp}
                className="flex justify-center"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-red-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl"
                >
                    Join the Tribe →
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default AccelerationStudio;
