'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ToolInput, InputField } from '@/components/tools/ToolInput'
import { ToolOutput } from '@/components/tools/ToolOutput'
import { getToolBySlug } from '@/lib/tools/tool-config'
import { calculateTokenCost } from '@/lib/tools/prompts'

export default function ContentWriterPage() {
    const tool = getToolBySlug('content-writer')!

    const [inputs, setInputs] = useState({
        contentType: '',
        topic: '',
        keywords: '',
        tone: 'professional',
        wordCount: '1000'
    })
    const [output, setOutput] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [tokenCost, setTokenCost] = useState(tool.baseTokenCost)

    useEffect(() => {
        if (inputs.contentType && inputs.topic) {
            const cost = calculateTokenCost(tool.id, inputs, tool.baseTokenCost)
            setTokenCost(cost)
        }
    }, [inputs])

    const handleInputChange = (name: string, value: any) => {
        setInputs(prev => ({ ...prev, [name]: value }))
    }

    const handleGenerate = async () => {
        if (!inputs.contentType || !inputs.topic) {
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
            alert(error instanceof Error ? error.message : 'Failed to generate content')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ToolLayout
            toolName={tool.name}
            toolDescription={tool.description}
            icon={<FileText className="h-6 w-6" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ToolInput onGenerate={handleGenerate} generating={loading} tokenCost={tokenCost}>
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

                <ToolOutput output={output} loading={loading} outputType="text" />
            </div>
        </ToolLayout>
    )
}
