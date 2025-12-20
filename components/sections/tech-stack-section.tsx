'use client';

import { Code2, Database, Boxes, Container, Workflow, Cloud } from 'lucide-react';

const technologies = [
    { name: 'Next.js', icon: Code2, category: 'Frameworks' },
    { name: 'React', icon: Code2, category: 'Frameworks' },
    { name: 'Node.js', icon: Boxes, category: 'Runtime' },
    { name: 'Python', icon: Code2, category: 'Languages' },
    { name: 'PostgreSQL', icon: Database, category: 'Databases' },
    { name: 'MySQL', icon: Database, category: 'Databases' },
    { name: 'MongoDB', icon: Database, category: 'Databases' },
    { name: 'Redis', icon: Database, category: 'Cache' },
    { name: 'Docker', icon: Container, category: 'Infrastructure' },
    { name: 'GitHub', icon: Workflow, category: 'Version Control' },
    { name: 'GitLab', icon: Workflow, category: 'Version Control' },
    { name: 'Kubernetes', icon: Cloud, category: 'Infrastructure' },
];

export function TechStackSection() {
    return (
        <section className="relative py-24 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Works with your{' '}
                        <span className="text-gradient">favorite stack</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Deploy any application, written in any language, using any framework.  NextNepal supports them all.
                    </p>
                </div>

                {/* Tech grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {technologies.map((tech) => {
                        const Icon = tech.icon;
                        return (
                            <div
                                key={tech.name}
                                className="group glass glass-hover rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer"
                            >
                                <Icon className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                    {tech.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Additional info */}
                <div className="mt-12 text-center">
                    <p className="text-gray-400">
                        And many more...  NextNepal supports any Dockerfile or Nixpacks buildpack.
                    </p>
                </div>
            </div>
        </section>
    );
}
