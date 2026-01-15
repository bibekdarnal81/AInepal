// Tool Configurations
// Defines all 20 AI tools with their metadata and settings

export const TOOL_CATEGORIES = {
    DEVELOPMENT: 'Development',
    CORE: 'Core',
    CONTENT: 'Content',
    WRITING: 'Writing',
    LANGUAGE: 'Language',
    CAREER: 'Career',
    DOCUMENT: 'Document',
    IMAGE: 'Image',
    SPECIALIZED: 'Specialized',
} as const

export type ToolCategory = typeof TOOL_CATEGORIES[keyof typeof TOOL_CATEGORIES]

export interface ToolConfig {
    id: string
    name: string
    slug: string
    description: string
    category: ToolCategory
    icon: string
    baseTokenCost: number
    inputs: ToolInput[]
    outputType: 'text' | 'code' | 'image' | 'structured'
}

export interface ToolInput {
    name: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'number' | 'file' | 'checkbox'
    placeholder?: string
    required?: boolean
    options?: { value: string; label: string }[]
    defaultValue?: any
    min?: number
    max?: number
}

export const TOOLS: ToolConfig[] = [
    // Development Tools
    {
        id: 'code-generator',
        name: 'Code Generator',
        slug: 'code-generator',
        description: 'Generate, debug, explain, or optimize code in any language',
        category: TOOL_CATEGORIES.DEVELOPMENT,
        icon: 'Code2',
        baseTokenCost: 50,
        outputType: 'code',
        inputs: [
            {
                name: 'taskType',
                label: 'Task Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'generate', label: 'Generate Code' },
                    { value: 'debug', label: 'Debug Code' },
                    { value: 'explain', label: 'Explain Code' },
                    { value: 'optimize', label: 'Optimize Code' },
                    { value: 'convert', label: 'Convert Language' },
                ],
            },
            {
                name: 'language',
                label: 'Programming Language',
                type: 'select',
                required: true,
                options: [
                    { value: 'javascript', label: 'JavaScript' },
                    { value: 'typescript', label: 'TypeScript' },
                    { value: 'python', label: 'Python' },
                    { value: 'java', label: 'Java' },
                    { value: 'csharp', label: 'C#' },
                    { value: 'php', label: 'PHP' },
                    { value: 'rust', label: 'Rust' },
                    { value: 'go', label: 'Go' },
                    { value: 'sql', label: 'SQL' },
                ],
            },
            {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                placeholder: 'Describe what you want to create or the problem you want to solve...',
                required: true,
            },
        ],
    },

    {
        id: 'sql-query-architect',
        name: 'SQL Query Architect',
        slug: 'sql-query-architect',
        description: 'Convert natural language to SQL queries',
        category: TOOL_CATEGORIES.DEVELOPMENT,
        icon: 'Database',
        baseTokenCost: 30,
        outputType: 'code',
        inputs: [
            {
                name: 'databaseType',
                label: 'Database Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'mysql', label: 'MySQL' },
                    { value: 'postgresql', label: 'PostgreSQL' },
                    { value: 'sqlserver', label: 'SQL Server' },
                    { value: 'sqlite', label: 'SQLite' },
                ],
            },
            {
                name: 'queryType',
                label: 'Query Type',
                type: 'select',
                options: [
                    { value: 'select', label: 'SELECT' },
                    { value: 'insert', label: 'INSERT' },
                    { value: 'update', label: 'UPDATE' },
                    { value: 'delete', label: 'DELETE' },
                    { value: 'create', label: 'CREATE TABLE' },
                ],
            },
            {
                name: 'description',
                label: 'Query Description',
                type: 'textarea',
                placeholder: 'Describe what you want to query in plain English...',
                required: true,
            },
        ],
    },

    {
        id: 'website-builder',
        name: 'Website Builder',
        slug: 'website-builder',
        description: 'Generate complete website code from text descriptions',
        category: TOOL_CATEGORIES.DEVELOPMENT,
        icon: 'LayoutTemplate',
        baseTokenCost: 100,
        outputType: 'code',
        inputs: [
            {
                name: 'pageType',
                label: 'Page Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'landing', label: 'Landing Page' },
                    { value: 'dashboard', label: 'Dashboard' },
                    { value: 'portfolio', label: 'Portfolio' },
                    { value: 'blog', label: 'Blog' },
                    { value: 'ecommerce', label: 'E-commerce' },
                ],
            },
            {
                name: 'framework',
                label: 'Framework',
                type: 'select',
                options: [
                    { value: 'html', label: 'Vanilla HTML/CSS/JS' },
                    { value: 'react', label: 'React' },
                    { value: 'vue', label: 'Vue' },
                    { value: 'nextjs', label: 'Next.js' },
                ],
            },
            {
                name: 'description',
                label: 'Website Description',
                type: 'textarea',
                placeholder: 'Describe the website you want to create...',
                required: true,
            },
        ],
    },

    // Content Tools
    {
        id: 'content-writer',
        name: 'Content Writer',
        slug: 'content-writer',
        description: 'Generate SEO-optimized blog posts and articles',
        category: TOOL_CATEGORIES.CONTENT,
        icon: 'FileText',
        baseTokenCost: 75,
        outputType: 'text',
        inputs: [
            {
                name: 'contentType',
                label: 'Content Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'blog', label: 'Blog Post' },
                    { value: 'article', label: 'Article' },
                    { value: 'product', label: 'Product Description' },
                    { value: 'marketing', label: 'Marketing Copy' },
                ],
            },
            {
                name: 'topic',
                label: 'Topic',
                type: 'text',
                placeholder: 'Main subject of the content',
                required: true,
            },
            {
                name: 'keywords',
                label: 'Keywords (Optional)',
                type: 'text',
                placeholder: 'SEO keywords, comma-separated',
            },
            {
                name: 'tone',
                label: 'Tone',
                type: 'select',
                options: [
                    { value: 'professional', label: 'Professional' },
                    { value: 'friendly', label: 'Friendly' },
                    { value: 'creative', label: 'Creative' },
                    { value: 'formal', label: 'Formal' },
                ],
                defaultValue: 'professional',
            },
            {
                name: 'wordCount',
                label: 'Word Count',
                type: 'select',
                options: [
                    { value: '500', label: '500 words' },
                    { value: '1000', label: '1000 words' },
                    { value: '1500', label: '1500 words' },
                    { value: '2000', label: '2000 words' },
                ],
                defaultValue: '1000',
            },
        ],
    },

    {
        id: 'email-writer',
        name: 'Email Writer',
        slug: 'email-writer',
        description: 'Create professional and marketing emails',
        category: TOOL_CATEGORIES.CONTENT,
        icon: 'Mail',
        baseTokenCost: 40,
        outputType: 'text',
        inputs: [
            {
                name: 'emailType',
                label: 'Email Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'professional', label: 'Professional' },
                    { value: 'marketing', label: 'Marketing' },
                    { value: 'followup', label: 'Follow-up' },
                    { value: 'outreach', label: 'Cold Outreach' },
                ],
            },
            {
                name: 'purpose',
                label: 'Purpose',
                type: 'text',
                placeholder: 'Brief description of email purpose',
                required: true,
            },
            {
                name: 'recipient',
                label: 'Recipient Type',
                type: 'text',
                placeholder: 'e.g., Client, Colleague, Customer',
            },
            {
                name: 'tone',
                label: 'Tone',
                type: 'select',
                options: [
                    { value: 'formal', label: 'Formal' },
                    { value: 'casual', label: 'Casual' },
                    { value: 'persuasive', label: 'Persuasive' },
                ],
                defaultValue: 'formal',
            },
        ],
    },

    {
        id: 'social-media-post',
        name: 'Social Media Post',
        slug: 'social-media-post',
        description: 'Generate viral social media content',
        category: TOOL_CATEGORIES.CONTENT,
        icon: 'Share2',
        baseTokenCost: 30,
        outputType: 'text',
        inputs: [
            {
                name: 'platform',
                label: 'Platform',
                type: 'select',
                required: true,
                options: [
                    { value: 'twitter', label: 'Twitter' },
                    { value: 'linkedin', label: 'LinkedIn' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'instagram', label: 'Instagram' },
                ],
            },
            {
                name: 'topic',
                label: 'Topic',
                type: 'text',
                placeholder: 'What is the post about?',
                required: true,
            },
            {
                name: 'tone',
                label: 'Tone',
                type: 'select',
                options: [
                    { value: 'viral', label: 'Viral' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'casual', label: 'Casual' },
                    { value: 'inspirational', label: 'Inspirational' },
                ],
                defaultValue: 'viral',
            },
            {
                name: 'includeHashtags',
                label: 'Include Hashtags',
                type: 'checkbox',
                defaultValue: true,
            },
        ],
    },

    // Document Tools
    {
        id: 'resume-builder',
        name: 'Resume Builder',
        slug: 'resume-builder',
        description: 'Create ATS-friendly professional resumes',
        category: TOOL_CATEGORIES.DOCUMENT,
        icon: 'FileSearch',
        baseTokenCost: 60,
        outputType: 'structured',
        inputs: [
            {
                name: 'format',
                label: 'Format',
                type: 'select',
                required: true,
                options: [
                    { value: 'chronological', label: 'Chronological' },
                    { value: 'functional', label: 'Functional' },
                    { value: 'combination', label: 'Combination' },
                ],
            },
            {
                name: 'experienceLevel',
                label: 'Experience Level',
                type: 'select',
                options: [
                    { value: 'entry', label: 'Entry Level' },
                    { value: 'mid', label: 'Mid Level' },
                    { value: 'senior', label: 'Senior Level' },
                ],
            },
            {
                name: 'industry',
                label: 'Industry',
                type: 'text',
                placeholder: 'Tech, Finance, Healthcare, etc.',
                required: true,
            },
            {
                name: 'jobTitle',
                label: 'Target Job Title',
                type: 'text',
                placeholder: 'The position you are applying for',
                required: true,
            },
        ],
    },

    {
        id: 'document-summarizer',
        name: 'Document Summarizer',
        slug: 'document-summarizer',
        description: 'Summarize documents and extract key points',
        category: TOOL_CATEGORIES.DOCUMENT,
        icon: 'Scan',
        baseTokenCost: 40,
        outputType: 'text',
        inputs: [
            {
                name: 'summaryLength',
                label: 'Summary Length',
                type: 'select',
                options: [
                    { value: 'brief', label: 'Brief' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'detailed', label: 'Detailed' },
                ],
                defaultValue: 'medium',
            },
            {
                name: 'focus',
                label: 'Focus',
                type: 'select',
                options: [
                    { value: 'keypoints', label: 'Key Points' },
                    { value: 'actionitems', label: 'Action Items' },
                    { value: 'both', label: 'Both' },
                ],
                defaultValue: 'both',
            },
            {
                name: 'document',
                label: 'Document Text',
                type: 'textarea',
                placeholder: 'Paste your document text here...',
                required: true,
            },
        ],
    },

    {
        id: 'meeting-minutes',
        name: 'Meeting Minutes',
        slug: 'meeting-minutes',
        description: 'Generate structured meeting notes and action items',
        category: TOOL_CATEGORIES.DOCUMENT,
        icon: 'ClipboardList',
        baseTokenCost: 50,
        outputType: 'structured',
        inputs: [
            {
                name: 'meetingType',
                label: 'Meeting Type',
                type: 'select',
                options: [
                    { value: 'team', label: 'Team Meeting' },
                    { value: 'client', label: 'Client Meeting' },
                    { value: 'board', label: 'Board Meeting' },
                    { value: 'standup', label: 'Standup' },
                ],
            },
            {
                name: 'includes',
                label: 'Include',
                type: 'text',
                placeholder: 'Attendees, Action Items, Decisions',
                defaultValue: 'Attendees, Action Items, Decisions',
            },
            {
                name: 'transcript',
                label: 'Meeting Transcript/Notes',
                type: 'textarea',
                placeholder: 'Paste meeting transcript or notes here...',
                required: true,
            },
        ],
    },

    // Image Tools
    {
        id: 'image-generator',
        name: 'Image Generator',
        slug: 'image-generator',
        description: 'Create AI-generated images from text',
        category: TOOL_CATEGORIES.IMAGE,
        icon: 'Image',
        baseTokenCost: 150,
        outputType: 'image',
        inputs: [
            {
                name: 'prompt',
                label: 'Image Description',
                type: 'textarea',
                placeholder: 'Describe the image you want to create in detail...',
                required: true,
            },
            {
                name: 'aspectRatio',
                label: 'Aspect Ratio',
                type: 'select',
                options: [
                    { value: '1:1', label: '1:1 Square' },
                    { value: '16:9', label: '16:9 Landscape' },
                    { value: '9:16', label: '9:16 Portrait' },
                    { value: '4:3', label: '4:3 Classic' },
                ],
                defaultValue: '1:1',
            },
            {
                name: 'style',
                label: 'Style',
                type: 'select',
                options: [
                    { value: 'realistic', label: 'Realistic' },
                    { value: 'artistic', label: 'Artistic' },
                    { value: 'cartoon', label: 'Cartoon' },
                    { value: '3d', label: '3D' },
                ],
                defaultValue: 'realistic',
            },
            {
                name: 'count',
                label: 'Number of Images',
                type: 'select',
                options: [
                    { value: '1', label: '1 image' },
                    { value: '2', label: '2 images' },
                    { value: '3', label: '3 images' },
                    { value: '4', label: '4 images' },
                ],
                defaultValue: '1',
            },
        ],
    },

    {
        id: 'ocr-image-to-text',
        name: 'OCR / Image to Text',
        slug: 'ocr-image-to-text',
        description: 'Extract text from images',
        category: TOOL_CATEGORIES.IMAGE,
        icon: 'FileText',
        baseTokenCost: 50,
        outputType: 'text',
        inputs: [
            {
                name: 'image',
                label: 'Upload Image',
                type: 'file',
                required: true,
            },
            {
                name: 'language',
                label: 'Language',
                type: 'select',
                options: [
                    { value: 'auto', label: 'Auto-detect' },
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' },
                ],
                defaultValue: 'auto',
            },
            {
                name: 'outputFormat',
                label: 'Output Format',
                type: 'select',
                options: [
                    { value: 'text', label: 'Plain Text' },
                    { value: 'structured', label: 'Structured JSON' },
                ],
                defaultValue: 'text',
            },
        ],
    },

    // Language Tools
    {
        id: 'language-translator',
        name: 'Language Translator',
        slug: 'language-translator',
        description: 'Translate text between 15+ languages',
        category: TOOL_CATEGORIES.LANGUAGE,
        icon: 'Languages',
        baseTokenCost: 30,
        outputType: 'text',
        inputs: [
            {
                name: 'sourceLanguage',
                label: 'Source Language',
                type: 'select',
                options: [
                    { value: 'auto', label: 'Auto-detect' },
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' },
                    { value: 'zh', label: 'Chinese' },
                    { value: 'ja', label: 'Japanese' },
                    { value: 'ko', label: 'Korean' },
                ],
                defaultValue: 'auto',
            },
            {
                name: 'targetLanguage',
                label: 'Target Language',
                type: 'select',
                required: true,
                options: [
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' },
                    { value: 'zh', label: 'Chinese' },
                    { value: 'ja', label: 'Japanese' },
                    { value: 'ko', label: 'Korean' },
                ],
            },
            {
                name: 'text',
                label: 'Text to Translate',
                type: 'textarea',
                placeholder: 'Enter text to translate...',
                required: true,
            },
        ],
    },

    {
        id: 'sentiment-analyst',
        name: 'Sentiment Analyst',
        slug: 'sentiment-analyst',
        description: 'Analyze sentiment and emotions in text',
        category: TOOL_CATEGORIES.LANGUAGE,
        icon: 'Activity',
        baseTokenCost: 35,
        outputType: 'structured',
        inputs: [
            {
                name: 'text',
                label: 'Text to Analyze',
                type: 'textarea',
                placeholder: 'Enter text to analyze...',
                required: true,
            },
            {
                name: 'analysisDepth',
                label: 'Analysis Depth',
                type: 'select',
                options: [
                    { value: 'basic', label: 'Basic' },
                    { value: 'detailed', label: 'Detailed' },
                    { value: 'advanced', label: 'Advanced' },
                ],
                defaultValue: 'detailed',
            },
            {
                name: 'includes',
                label: 'Include',
                type: 'text',
                defaultValue: 'Sentiment Score, Emotions, Key Phrases',
            },
        ],
    },

    // Writing Tools
    {
        id: 'story-weaver',
        name: 'Story Weaver',
        slug: 'story-weaver',
        description: 'Generate creative fiction and stories',
        category: TOOL_CATEGORIES.WRITING,
        icon: 'BookOpen',
        baseTokenCost: 100,
        outputType: 'text',
        inputs: [
            {
                name: 'genre',
                label: 'Genre',
                type: 'select',
                required: true,
                options: [
                    { value: 'fantasy', label: 'Fantasy' },
                    { value: 'scifi', label: 'Sci-Fi' },
                    { value: 'romance', label: 'Romance' },
                    { value: 'mystery', label: 'Mystery' },
                    { value: 'horror', label: 'Horror' },
                ],
            },
            {
                name: 'length',
                label: 'Length',
                type: 'select',
                options: [
                    { value: '500', label: 'Short (500 words)' },
                    { value: '1500', label: 'Medium (1500 words)' },
                    { value: '3000', label: 'Long (3000 words)' },
                ],
                defaultValue: '1500',
            },
            {
                name: 'prompt',
                label: 'Story Seed/Theme',
                type: 'textarea',
                placeholder: 'Describe the story theme or provide a seed...',
                required: true,
            },
            {
                name: 'style',
                label: 'Writing Style',
                type: 'select',
                options: [
                    { value: 'descriptive', label: 'Descriptive' },
                    { value: 'action', label: 'Action-Packed' },
                    { value: 'dialogue', label: 'Dialogue-Heavy' },
                ],
                defaultValue: 'descriptive',
            },
        ],
    },

    {
        id: 'grammar-guardian',
        name: 'Grammar Guardian',
        slug: 'grammar-guardian',
        description: 'Advanced proofreading and grammar checking',
        category: TOOL_CATEGORIES.WRITING,
        icon: 'CheckCircle2',
        baseTokenCost: 40,
        outputType: 'text',
        inputs: [
            {
                name: 'text',
                label: 'Text to Proofread',
                type: 'textarea',
                placeholder: 'Paste your text here for proofreading...',
                required: true,
            },
            {
                name: 'checkFor',
                label: 'Check For',
                type: 'text',
                defaultValue: 'Grammar, Spelling, Style, Punctuation',
            },
            {
                name: 'dialect',
                label: 'English Dialect',
                type: 'select',
                options: [
                    { value: 'us', label: 'US English' },
                    { value: 'uk', label: 'UK English' },
                    { value: 'au', label: 'Australian English' },
                ],
                defaultValue: 'us',
            },
        ],
    },

    // Career Tools
    {
        id: 'interview-coach',
        name: 'Interview Coach',
        slug: 'interview-coach',
        description: 'Generate mock interview questions and answers',
        category: TOOL_CATEGORIES.CAREER,
        icon: 'Users',
        baseTokenCost: 60,
        outputType: 'structured',
        inputs: [
            {
                name: 'jobRole',
                label: 'Job Role',
                type: 'text',
                placeholder: 'e.g., Software Engineer',
                required: true,
            },
            {
                name: 'industry',
                label: 'Industry',
                type: 'text',
                placeholder: 'e.g., Tech, Finance',
                required: true,
            },
            {
                name: 'interviewType',
                label: 'Interview Type',
                type: 'select',
                options: [
                    { value: 'technical', label: 'Technical' },
                    { value: 'behavioral', label: 'Behavioral' },
                    { value: 'case', label: 'Case Study' },
                ],
            },
            {
                name: 'questionCount',
                label: 'Number of Questions',
                type: 'select',
                options: [
                    { value: '5', label: '5 questions' },
                    { value: '10', label: '10 questions' },
                    { value: '15', label: '15 questions' },
                ],
                defaultValue: '10',
            },
        ],
    },

    // Specialized Tools
    {
        id: 'quiz-master',
        name: 'Quiz Master',
        slug: 'quiz-master',
        description: 'Generate quizzes from any topic',
        category: TOOL_CATEGORIES.SPECIALIZED,
        icon: 'ListChecks',
        baseTokenCost: 50,
        outputType: 'structured',
        inputs: [
            {
                name: 'topic',
                label: 'Topic',
                type: 'text',
                placeholder: 'What is the quiz about?',
                required: true,
            },
            {
                name: 'difficulty',
                label: 'Difficulty',
                type: 'select',
                options: [
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                ],
                defaultValue: 'medium',
            },
            {
                name: 'questionCount',
                label: 'Number of Questions',
                type: 'select',
                options: [
                    { value: '5', label: '5 questions' },
                    { value: '10', label: '10 questions' },
                    { value: '15', label: '15 questions' },
                    { value: '20', label: '20 questions' },
                ],
                defaultValue: '10',
            },
            {
                name: 'questionType',
                label: 'Question Type',
                type: 'select',
                options: [
                    { value: 'multiple', label: 'Multiple Choice' },
                    { value: 'truefalse', label: 'True/False' },
                    { value: 'short', label: 'Short Answer' },
                ],
                defaultValue: 'multiple',
            },
        ],
    },

    {
        id: 'smart-recipe',
        name: 'Smart Recipe',
        slug: 'smart-recipe',
        description: 'Create recipes from ingredients',
        category: TOOL_CATEGORIES.SPECIALIZED,
        icon: 'ChefHat',
        baseTokenCost: 45,
        outputType: 'structured',
        inputs: [
            {
                name: 'ingredients',
                label: 'Available Ingredients',
                type: 'textarea',
                placeholder: 'List your available ingredients, comma-separated',
                required: true,
            },
            {
                name: 'cuisine',
                label: 'Cuisine Type',
                type: 'select',
                options: [
                    { value: 'italian', label: 'Italian' },
                    { value: 'chinese', label: 'Chinese' },
                    { value: 'mexican', label: 'Mexican' },
                    { value: 'indian', label: 'Indian' },
                    { value: 'american', label: 'American' },
                ],
            },
            {
                name: 'dietary',
                label: 'Dietary Restrictions',
                type: 'select',
                options: [
                    { value: 'none', label: 'None' },
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'vegan', label: 'Vegan' },
                    { value: 'glutenfree', label: 'Gluten-Free' },
                ],
                defaultValue: 'none',
            },
            {
                name: 'servings',
                label: 'Number of Servings',
                type: 'number',
                min: 1,
                max: 12,
                defaultValue: 4,
            },
        ],
    },

    {
        id: 'personal-finance',
        name: 'Personal Finance',
        slug: 'personal-finance',
        description: 'Get personalized financial advice',
        category: TOOL_CATEGORIES.SPECIALIZED,
        icon: 'Wallet',
        baseTokenCost: 50,
        outputType: 'structured',
        inputs: [
            {
                name: 'queryType',
                label: 'Query Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'budget', label: 'Budget Planning' },
                    { value: 'expense', label: 'Expense Analysis' },
                    { value: 'savings', label: 'Savings Goals' },
                    { value: 'investment', label: 'Investment Advice' },
                ],
            },
            {
                name: 'income',
                label: 'Monthly Income',
                type: 'number',
                placeholder: 'Your monthly income',
                min: 0,
            },
            {
                name: 'expenses',
                label: 'Monthly Expenses',
                type: 'number',
                placeholder: 'Your monthly expenses',
                min: 0,
            },
            {
                name: 'goals',
                label: 'Financial Goals',
                type: 'textarea',
                placeholder: 'Describe your financial goals',
            },
        ],
    },
]

// Helper functions
export function getToolBySlug(slug: string): ToolConfig | undefined {
    return TOOLS.find(tool => tool.slug === slug)
}

export function getToolsByCategory(category: ToolCategory): ToolConfig[] {
    return TOOLS.filter(tool => tool.category === category)
}

export function getAllCategories(): ToolCategory[] {
    return Object.values(TOOL_CATEGORIES)
}
