'use client';

import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
};

const tweets = [
    {
        name: "Jonah Seguin",
        handle: "@jonahseguin",
        content: "We went from $2000 on AWS to <$200 on @ Dunzo.",
        avatar: "J"
    },
    {
        name: "Daniel Moretti",
        handle: "@dmorettiv",
        content: "@ Dunzo streamlines and accelerates our entire operation. It gives us instant observability into our services and makes spinning up self-hosted third-party tools almost effortless.",
        avatar: "D"
    },
    {
        name: "Pingback Inc",
        handle: "@pingbackoficial",
        content: "As CTO at Pingback, speed of iteration is everything for us. @ Dunzo has become our go-to platform for rapid experimentation and testing new ideas.",
        avatar: "P"
    },
    {
        name: "Aaron S",
        handle: "@aaronShaki",
        content: "Typically, I avoid using PaaS but the team at @ Dunzo is boosting development velocity so significantly that it's hard to ignore",
        avatar: "A"
    },
    {
        name: "John Nunemaker",
        handle: "@jnunemaker",
        content: "I've moved $4.5k/mo from AWS and $1k/mo from Heroku in the past month and my @ Dunzo bill is like $300/mo.",
        avatar: "J"
    },
    {
        name: "Juan Manuel Pérez",
        handle: "@juanmapfont",
        content: "Tracking changes, scaling when needed, and handling infrastructure has never been simpler. @ Dunzo is exactly what I had been looking for over the years.",
        avatar: "J"
    },
    {
        name: "Common",
        handle: "@commondotxyz",
        content: "We cut our hosting costs by 75% migrating from Heroku to @ Dunzo. 1. autoscaling key services 2. transient PR environments 3. running fewer instances",
        avatar: "C"
    },
    {
        name: "Teo",
        handle: "@teodor_io",
        content: "@ Dunzo is really really good. Being able to deploy straight from a Github repo, detecting a root Dockerfile and using that to build, no need for any complex cicd.",
        avatar: "T"
    }
];

const TweetCard = ({ tweet, delay }: { tweet: typeof tweets[0]; delay: number }) => (
    <motion.div
        className="bg-card border border-border/60 rounded-xl p-4 hover:border-border transition-all"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
    >
        <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {tweet.avatar}
            </div>
            <div className="min-w-0">
                <p className="text-primary font-medium text-sm">{tweet.name}</p>
                <p className="text-muted text-xs">{tweet.handle}</p>
            </div>
            {/* Twitter/X icon */}
            <svg className="w-4 h-4 text-muted ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        </div>
        <p className="text-secondary text-sm leading-relaxed">{tweet.content}</p>
    </motion.div>
);

export function TweetsSection() {
    return (
        <section className="relative py-32 px-6 overflow-hidden bg-background">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 dot-grid" />
            </div>

            <div className="mx-auto max-w-7xl relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    {...fadeInUp}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        …and loved by developers
                    </h2>
                    <motion.a
                        href="#"
                        className="inline-flex items-center gap-2 text-teal-500 font-medium hover:text-teal-400 transition-colors"
                        {...fadeInUp}
                        transition={{ delay: 0.2 }}
                    >
                        Join nearly 2M developers building with  Dunzo →
                    </motion.a>
                </motion.div>

                {/* Tweet grid - responsive columns */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tweets.map((tweet, i) => (
                        <TweetCard key={i} tweet={tweet} delay={i * 0.05} />
                    ))}
                </div>
            </div>
        </section>
    );
}
