// AI Prompt Templates for each tool
// These templates are used to generate AI prompts based on user inputs

import type { ToolConfig } from './tool-config'

export interface PromptContext {
    toolId: string
    inputs: Record<string, any>
}

export function generatePrompt(context: PromptContext): string {
    const { toolId, inputs } = context

    const promptTemplates: Record<string, (inputs: Record<string, any>) => string> = {
        // Code Generator
        'code-generator': (inputs) => {
            const taskActions: Record<string, string> = {
                generate: 'Generate clean, well-commented code for',
                debug: 'Debug and fix the following code',
                explain: 'Explain the following code in detail',
                optimize: 'Optimize the following code for better performance',
                convert: 'Convert the following code to',
            }

            return `You are an expert ${inputs.language} programmer. ${taskActions[inputs.taskType]} the following requirements:

${inputs.description}

Language: ${inputs.language}

Provide clean, well-commented code following best practices. Include explanations where necessary.`
        },

        // SQL Query Architect
        'sql-query-architect': (inputs) => {
            return `You are an expert ${inputs.databaseType} database architect. Convert the following natural language query to SQL:

"${inputs.description}"

Database Type: ${inputs.databaseType}
${inputs.queryType ? `Query Type: ${inputs.queryType.toUpperCase()}` : ''}

Provide the SQL query with comments explaining each part. Follow ${inputs.databaseType} best practices.`
        },

        // Website Builder
        'website-builder': (inputs) => {
            return `You are an expert web developer. Create a ${inputs.pageType} using ${inputs.framework}.

Requirements: ${inputs.description}

Generate complete, production-ready code including:
- HTML structure
- CSS styling (modern, responsive, beautiful)
- JavaScript functionality (if needed)

Make it visually appealing with modern design principles. Ensure it's fully responsive.`
        },

        // Content Writer
        'content-writer': (inputs) => {
            return `You are a professional content writer. Create a ${inputs.contentType} about "${inputs.topic}".

${inputs.keywords ? `Keywords to include: ${inputs.keywords}` : ''}
Tone: ${inputs.tone}
Target length: ~${inputs.wordCount} words

Make the content:
- Engaging and well-structured
- SEO-optimized ${inputs.keywords ? 'with natural keyword placement' : ''}
- Easy to read with proper headings and paragraphs
- Original and informative`
        },

        // Email Writer
        'email-writer': (inputs) => {
            return `You are a professional email writer. Create a ${inputs.emailType} email.

Purpose: ${inputs.purpose}
Recipient: ${inputs.recipient || 'Professional contact'}
Tone: ${inputs.tone}

Include:
- Compelling subject line
- Well-structured email body
- Professional sign-off

Make it effective and appropriate for the context.`
        },

        // Social Media Post
        'social-media-post': (inputs) => {
            return `You are a social media expert. Create an engaging ${inputs.platform} post about "${inputs.topic}".

Tone: ${inputs.tone}
${inputs.includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}

Make it:
- Platform-appropriate in length and style
- Engaging and likely to get interactions
- ${inputs.tone} in tone
- Authentic and conversational`
        },

        // Resume Builder
        'resume-builder': (inputs) => {
            return `You are a professional resume writer. Create an ATS-friendly ${inputs.format} resume for a ${inputs.experienceLevel} ${inputs.jobTitle} position in the ${inputs.industry} industry.

Include these sections:
- Professional Summary
- Key Skills
- Work Experience (with achievements and metrics)
- Education
- Certifications (if relevant)

Format:
- Use bullet points and action verbs
- Quantify achievements where possible
- Optimize for ATS scanning
- Keep it professional and concise`
        },

        // Document Summarizer
        'document-summarizer': (inputs) => {
            return `Summarize the following document with a ${inputs.summaryLength} summary, focusing on ${inputs.focus}.

Document:
${inputs.document}

Provide:
- Clear summary
${inputs.focus === 'keypoints' || inputs.focus === 'both' ? '- Key points in bullet format' : ''}
${inputs.focus === 'actionitems' || inputs.focus === 'both' ? '- Action items (if any)' : ''}

Keep the summary concise but comprehensive.`
        },

        // Meeting Minutes
        'meeting-minutes': (inputs) => {
            return `Create structured meeting minutes for a ${inputs.meetingType} meeting.

Include: ${inputs.includes}

Meeting transcript/notes:
${inputs.transcript}

Format the minutes with:
- Date and attendees (if available)
- Key discussion points
- Decisions made
- Action items with owners (if mentioned)
- Next steps

Use a professional, organized format.`
        },

        // Image Generator
        'image-generator': (inputs) => {
            return `${inputs.prompt}

Style: ${inputs.style}
${inputs.style === 'realistic' ? 'Make it photorealistic with high detail.' : ''}
${inputs.style === 'artistic' ? 'Make it artistic and creative with unique composition.' : ''}
${inputs.style === 'cartoon' ? 'Make it cartoon-style with vibrant colors.' : ''}
${inputs.style === '3d' ? 'Create a high-quality 3D render.' : ''}

High quality, professional composition, good lighting.`
        },

        // OCR / Image to Text
        'ocr-image-to-text': (inputs) => {
            return `Extract all text from the provided image.

Language: ${inputs.language === 'auto' ? 'Auto-detect' : inputs.language}
Output format: ${inputs.outputFormat}

${inputs.outputFormat === 'structured' ? 'Organize the extracted text in a structured JSON format with sections if applicable.' : 'Provide the extracted text as plain text, maintaining the original layout where possible.'}

Be accurate and preserve formatting.`
        },

        // Language Translator
        'language-translator': (inputs) => {
            return `Translate the following text from ${inputs.sourceLanguage === 'auto' ? 'auto-detected language' : inputs.sourceLanguage} to ${inputs.targetLanguage}.

Text to translate:
${inputs.text}

Provide:
- Accurate translation maintaining the original tone and meaning
- Natural phrasing in the target language
- Cultural adaptation where appropriate

Keep the translation professional and contextually accurate.`
        },

        // Sentiment Analyst
        'sentiment-analyst': (inputs) => {
            return `Analyze the sentiment and emotions in the following text with ${inputs.analysisDepth} detail.

Text to analyze:
${inputs.text}

Provide:
${inputs.includes}

Use a sentiment scale from -1.0 (very negative) to +1.0 (very positive).

Include:
- Overall sentiment score and classification
- Dominant emotions detected
- Key phrases that influenced the sentiment
${inputs.analysisDepth === 'advanced' ? '- Tone analysis and nuances' : ''}`
        },

        // Story Weaver
        'story-weaver': (inputs) => {
            return `Write a ${inputs.genre} story (~${inputs.length} words) based on this theme:

${inputs.prompt}

Writing style: ${inputs.style}

Make it:
- Engaging with compelling characters
- ${inputs.style === 'descriptive' ? 'Rich in vivid descriptions and sensory details' : ''}
- ${inputs.style === 'action' ? 'Fast-paced with exciting action sequences' : ''}
- ${inputs.style === 'dialogue' ? 'Character-driven with meaningful dialogues' : ''}
- Well-structured with a clear beginning, middle, and end
- Appropriate for the ${inputs.genre} genre`
        },

        // Grammar Guardian
        'grammar-guardian': (inputs) => {
            return `Proofread and correct the following text (${inputs.dialect} English):

${inputs.text}

Check for: ${inputs.checkFor}

Provide:
1. Corrected version of the text
2. List of changes made with explanations
3. Suggestions for improvement

Be thorough but maintain the original meaning and style.`
        },

        // Interview Coach
        'interview-coach': (inputs) => {
            return `Generate ${inputs.questionCount} ${inputs.interviewType} interview questions for a ${inputs.jobRole} position in the ${inputs.industry} industry.

For each question provide:
- The question
- Expected answer/talking points
- What the interviewer is looking for
- Tips for the candidate

Make the questions:
- Relevant to the role and industry
- Challenging but fair
- Diverse in topic coverage`
        },

        // Quiz Master
        'quiz-master': (inputs) => {
            return `Create a ${inputs.difficulty} quiz about "${inputs.topic}" with ${inputs.questionCount} ${inputs.questionType} questions.

${inputs.questionType === 'multiple' ? 'For multiple choice questions, provide 4 options (A, B, C, D) with one correct answer.' : ''}
${inputs.questionType === 'truefalse' ? 'For true/false questions, provide the statement and correct answer.' : ''}
${inputs.questionType === 'short' ? 'For short answer questions, provide the question and a sample correct answer.' : ''}

Include:
- Clear, unambiguous questions
- Correct answers marked
- Brief explanations for each answer

Difficulty: ${inputs.difficulty}
- Easy: Basic knowledge
- Medium: Moderate understanding required
- Hard: Advanced knowledge needed`
        },

        // Smart Recipe
        'smart-recipe': (inputs) => {
            return `Create a ${inputs.cuisine || 'delicious'} ${inputs.dietary !== 'none' ? inputs.dietary : ''} recipe for ${inputs.servings} servings using these ingredients:

${inputs.ingredients}

${inputs.cuisine ? `Cuisine type: ${inputs.cuisine}` : ''}
${inputs.dietary !== 'none' ? `Dietary restriction: ${inputs.dietary}` : ''}

Provide:
- Recipe name
- Complete ingredient list with measurements
- Step-by-step cooking instructions
- Estimated prep and cook time
- Basic nutritional information
- Serving suggestions

Make it practical and easy to follow.`
        },

        // Personal Finance
        'personal-finance': (inputs) => {
            return `Provide personal finance advice for ${inputs.queryType}.

Financial situation:
${inputs.income ? `Monthly Income: $${inputs.income}` : ''}
${inputs.expenses ? `Monthly Expenses: $${inputs.expenses}` : ''}
${inputs.goals ? `Financial Goals: ${inputs.goals}` : ''}

Based on this information, provide:
- Detailed analysis of the current situation
- Specific, actionable recommendations
- Budget breakdown or savings plan
- Tips for achieving financial goals
- Risk considerations

Make the advice practical, realistic, and personalized to the situation.`
        },
    }

    const template = promptTemplates[toolId]
    if (!template) {
        throw new Error(`No prompt template found for tool: ${toolId}`)
    }

    return template(inputs)
}

// Calculate actual token cost based on inputs
export function calculateTokenCost(toolId: string, inputs: Record<string, any>, baseTokenCost: number): number {
    let multiplier = 1.0

    // Adjust cost based on tool-specific factors
    switch (toolId) {
        case 'content-writer':
        case 'story-weaver':
            // Higher word count = more tokens
            const wordCount = parseInt(inputs.wordCount || inputs.length || '1000')
            multiplier = wordCount / 1000
            break

        case 'image-generator':
            // More images = more cost
            const count = parseInt(inputs.count || '1')
            multiplier = count
            break

        case 'code-generator':
        case 'website-builder':
            // Complex tasks cost more
            if (inputs.taskType === 'convert' || inputs.pageType === 'dashboard') {
                multiplier = 1.5
            }
            break

        case 'interview-coach':
        case 'quiz-master':
            // More questions = more cost
            const questionCount = parseInt(inputs.questionCount || '10')
            multiplier = questionCount / 10
            break
    }

    return Math.ceil(baseTokenCost * multiplier)
}
