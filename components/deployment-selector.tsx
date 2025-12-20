'use client'

import { Github, Database, FileCode, Box, Zap, FolderOpen, Globe, Network } from 'lucide-react'
import Link from 'next/link'

interface DeploymentOption {
    id: string
    title: string
    icon: React.ReactNode
    description?: string
    href?: string
}

interface DeploymentSelectorProps {
    type: 'project' | 'service'
}

const projectOptions: DeploymentOption[] = [
    {
        id: 'github',
        title: 'GitHub Repository',
        icon: <Github className="w-5 h-5" />,
        description: 'Deploy from your GitHub repository',
        href: '/projects/deploy/github'
    },
    {
        id: 'database',
        title: 'Database',
        icon: <Database className="w-5 h-5" />,
        description: 'PostgreSQL, MySQL, MongoDB, Redis',
        href: '/projects/deploy/database'
    },
    {
        id: 'template',
        title: 'Template',
        icon: <FileCode className="w-5 h-5" />,
        description: 'Start from a template',
        href: '/projects/deploy/template'
    },
    {
        id: 'docker',
        title: 'Docker Image',
        icon: <Box className="w-5 h-5" />,
        description: 'Deploy from Docker registry',
        href: '/projects/deploy/docker'
    },
    {
        id: 'function',
        title: 'Function',
        icon: <Zap className="w-5 h-5" />,
        description: 'Serverless functions',
        href: '/projects/deploy/function'
    },
    {
        id: 'hosting',
        title: 'Web Hosting',
        icon: <Globe className="w-5 h-5" />,
        description: 'Host your website or application',
        href: '/projects/deploy/hosting'
    },
    {
        id: 'domain',
        title: 'Domain Registration',
        icon: <Network className="w-5 h-5" />,
        description: 'Register and manage domains',
        href: '/projects/deploy/domain'
    },
    {
        id: 'empty',
        title: 'Empty Project',
        icon: <FolderOpen className="w-5 h-5" />,
        description: 'Start with an empty project',
        href: '/projects/deploy/empty'
    }
]

const serviceOptions: DeploymentOption[] = [
    {
        id: 'github',
        title: 'GitHub Repository',
        icon: <Github className="w-5 h-5" />,
        href: '/services/deploy/github'
    },
    {
        id: 'database',
        title: 'Database',
        icon: <Database className="w-5 h-5" />,
        href: '/services/deploy/database'
    },
    {
        id: 'template',
        title: 'Template',
        icon: <FileCode className="w-5 h-5" />,
        href: '/services/deploy/template'
    },
    {
        id: 'docker',
        title: 'Docker Image',
        icon: <Box className="w-5 h-5" />,
        href: '/services/deploy/docker'
    },
    {
        id: 'function',
        title: 'Function',
        icon: <Zap className="w-5 h-5" />,
        href: '/services/deploy/function'
    },
    {
        id: 'bucket',
        title: 'Bucket',
        icon: <FolderOpen className="w-5 h-5" />,
        href: '/services/deploy/bucket'
    },
    {
        id: 'hosting',
        title: 'Web Hosting',
        icon: <Globe className="w-5 h-5" />,
        href: '/services/deploy/hosting'
    },
    {
        id: 'domain',
        title: 'Domain',
        icon: <Network className="w-5 h-5" />,
        href: '/services/deploy/domain'
    },
    {
        id: 'empty',
        title: 'Empty Service',
        icon: <FolderOpen className="w-5 h-5" />,
        href: '/services/deploy/empty'
    }
]

export function DeploymentSelector({ type }: DeploymentSelectorProps) {
    const options = type === 'project' ? projectOptions : serviceOptions

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mb-8 text-center">
                <p className="text-sm text-muted-foreground">
                    What would you like to deploy today?
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {options.map((option, index) => (
                    <Link
                        key={option.id}
                        href={option.href || '#'}
                        className={`
                            flex items-center justify-between px-6 py-4
                            hover:bg-secondary/50 transition-colors
                            ${index !== options.length - 1 ? 'border-b border-border' : ''}
                            group cursor-pointer
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                                {option.icon}
                            </div>
                            <div>
                                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                    {option.title}
                                </div>
                                {option.description && (
                                    <div className="text-sm text-muted-foreground">
                                        {option.description}
                                    </div>
                                )}
                            </div>
                        </div>
                        <svg
                            className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                ))}
            </div>
        </div>
    )
}
