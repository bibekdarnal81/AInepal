
import {
    PenTool,
    Languages,
    Bot,
    FileText,
    Search,
    ShieldAlert,
    Mic,
    Wrench,
    BookOpen,
    Sheet,
    BrainCircuit,
    StickyNote,
    UserCheck,
    FileType,
    Sparkles,
    LayoutTemplate
} from "lucide-react"

export type ToolCategory = 'Writing & Editing' | 'Productivity & Organization' | 'Analysis & Content'

export interface Tool {
    id: string
    name: string
    description: string
    icon: React.ElementType
    href: string
    category: ToolCategory
    isNew?: boolean
}

export const TOOLS: Tool[] = [
    // Writing & Editing
    {
        id: 'grammar',
        name: 'Grammar Fixer',
        description: 'Correct grammar and spelling errors instantly.',
        icon: PenTool,
        href: '/chat/tools/grammar',
        category: 'Writing & Editing'
    },
    {
        id: 'humanizer',
        name: 'AI Humanizer',
        description: 'Make AI-generated text sound more natural and human-like.',
        icon: UserCheck,
        href: '/chat/tools/humanizer',
        category: 'Writing & Editing'
    },
    {
        id: 'write',
        name: 'Creative Writer',
        description: 'Generate creative content, stories, and articles.',
        icon: Sparkles,
        href: '/chat/tools/write',
        category: 'Writing & Editing'
    },
    {
        id: 'writing-agent',
        name: 'Writing Agent',
        description: 'Advanced agent for long-form writing tasks.',
        icon: Bot,
        href: '/chat/tools/writing-agent',
        category: 'Writing & Editing'
    },
    {
        id: 'translate',
        name: 'Translator',
        description: 'Translate text between languages with context.',
        icon: Languages,
        href: '/chat/tools/translate',
        category: 'Writing & Editing'
    },

    // Productivity & Organization
    {
        id: 'memo',
        name: 'Smart Memo',
        description: 'Organize your thoughts and create quick memos.',
        icon: StickyNote,
        href: '/chat/tools/memo',
        category: 'Productivity & Organization'
    },
    {
        id: 'form',
        name: 'Form Builder',
        description: 'Generate structure and fields for any type of form.',
        icon: LayoutTemplate,
        href: '/chat/tools/form',
        category: 'Productivity & Organization'
    },
    {
        id: 'sheet',
        name: 'Spreadsheet Helper',
        description: 'Generate formulas and organize data for spreadsheets.',
        icon: Sheet,
        href: '/chat/tools/sheet',
        category: 'Productivity & Organization'
    },
    {
        id: 'mindmap',
        name: 'Mind Map',
        description: 'Brainstorm and visualize ideas in a structure.',
        icon: BrainCircuit,
        href: '/chat/tools/mindmap',
        category: 'Productivity & Organization'
    },

    // Analysis & Content
    {
        id: 'chatpdf',
        name: 'Chat PDF',
        description: 'Upload PDF and ask questions about its content.',
        icon: FileType,
        href: '/chat/tools/chatpdf',
        category: 'Analysis & Content'
    },
    {
        id: 'read',
        name: 'Read Assistant',
        description: 'Summarize and explain complex texts.',
        icon: BookOpen,
        href: '/chat/tools/read',
        category: 'Analysis & Content'
    },
    {
        id: 'search',
        name: 'Smart Search',
        description: 'Deep search focused on finding specific answers.',
        icon: Search,
        href: '/chat/tools/search',
        category: 'Analysis & Content'
    },
    {
        id: 'detector',
        name: 'AI Detector',
        description: 'Analyze text to detect if it was written by AI.',
        icon: ShieldAlert,
        href: '/chat/tools/detector',
        category: 'Analysis & Content'
    },
    {
        id: 'bots',
        name: 'Specialized Bots',
        description: 'Access specific bots for niche tasks.',
        icon: Bot,
        href: '/chat/tools/bots',
        category: 'Analysis & Content'
    },
    {
        id: 'podcast',
        name: 'Podcast Generator',
        description: 'Convert text or ideas into podcast scripts.',
        icon: Mic,
        href: '/chat/tools/podcast',
        category: 'Analysis & Content'
    },
    {
        id: 'toolbox',
        name: 'Toolbox Recommender',
        description: 'Find the right tools for your specific problem.',
        icon: Wrench,
        href: '/chat/tools/toolbox',
        category: 'Analysis & Content'
    }
]
