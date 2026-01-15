'use client'

import { useState, useEffect } from 'react'
import { Code2 } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ToolInput, InputField } from '@/components/tools/ToolInput'
import { ToolOutput } from '@/components/tools/ToolOutput'
import { getToolBySlug } from '@/lib/tools/tool-config'
import { calculateTokenCost } from '@/lib/tools/prompts'

export default function CodeGeneratorPage() {
    const tool = getToolBySlug('code-generator')!

    const [inputs, setInputs] = useState({
        taskType: '',
        language: '',
        description: ''
    })
    const [output, setOutput] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [tokenCost, setTokenCost] = useState(tool.baseTokenCost)

    // Update token cost when inputs change
    useEffect(() => {
        if (inputs.taskType && inputs.language && inputs.description) {
            const cost = calculateTokenCost(tool.id, inputs, tool.baseTokenCost)
            setTokenCost(cost)
        }
    }, [inputs])

    const handleInputChange = (name: string, value: any) => {
        setInputs(prev => ({ ...prev, [name]: value }))
    }

    const handleGenerate = async () => {
        if (!inputs.taskType || !inputs.language || !inputs.description) {
            alert('Please fill in all required fields')
            return
        }

        setLoading(true)
        setOutput(null)

        try {
            const response = await fetch(`/api/tools/${tool.slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.details || error.error || 'Generation failed')
            }

            const data = await response.json()
            setOutput(data.output)
        } catch (error) {
            console.error('Generation error:', error)
            alert(error instanceof Error ? error.message : 'Failed to generate code')
        } finally {
            setLoading(false)
        }
    }

    // Determine language for syntax highlighting
    const getOutputLanguage = () => {
        const langMap: Record<string, string> = {
            javascript: 'javascript',
            typescript: 'typescript',
            python: 'python',
            java: 'java',
            csharp: 'csharp',
            php: 'php',
            rust: 'rust',
            go: 'go',
            sql: 'sql',
        }
        return langMap[inputs.language] || 'javascript'
    }

    return (
        <ToolLayout
            toolName={tool.name}
            toolDescription={tool.description}
            icon={<Code2 className="h-6 w-6" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <ToolInput
                    onGenerate={handleGenerate}
                    generating={loading}
                    tokenCost={tokenCost}
                >
                    {tool.inputs.map((input) => (
                        <InputField
                            key={input.name}
                            label={input.label}
                            name={input.name}
                            type={input.type}
                            value={inputs[input.name as keyof typeof inputs]}
                            onChange={(value) => handleInputChange(input.name, value)}
                            placeholder={input.placeholder}
                            required={input.required}
                            options={input.options}
                        />
                    ))}
                </ToolInput>

                {/* Output Panel */}
                <ToolOutput
                    output={output}
                    loading={loading}
                    outputType="code"
                    language={getOutputLanguage()}
                />
            </div>
        </ToolLayout>
    )
}
