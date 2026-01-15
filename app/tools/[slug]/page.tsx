// Universal Tool Page Generator
// This creates tool pages dynamically for all tools

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import * as Icons from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ToolInput, InputField } from '@/components/tools/ToolInput'
import { ToolOutput } from '@/components/tools/ToolOutput'
import { getToolBySlug } from '@/lib/tools/tool-config'
import { calculateTokenCost } from '@/lib/tools/prompts'

export default function UniversalToolPage() {
    const params = useParams()
    const toolSlug = params.slug as string

    console.log('Tool Slug:', toolSlug)
    console.log('Params:', params)

    const tool = getToolBySlug(toolSlug)

    console.log('Found tool:', tool?.name || 'NOT FOUND')

    const [inputs, setInputs] = useState<Record<string, any>>({})
    const [output, setOutput] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [tokenCost, setTokenCost] = useState(tool?.baseTokenCost || 50)

    useEffect(() => {
        if (tool) {
            // Initialize inputs with default values
            const initialInputs: Record<string, any> = {}
            tool.inputs.forEach(input => {
                initialInputs[input.name] = input.defaultValue || ''
            })
            setInputs(initialInputs)
        }
    }, [tool])

    useEffect(() => {
        if (tool && Object.keys(inputs).length > 0) {
            const cost = calculateTokenCost(tool.id, inputs, tool.baseTokenCost)
            setTokenCost(cost)
        }
    }, [inputs, tool])

    const handleInputChange = (name: string, value: any) => {
        setInputs(prev => ({ ...prev, [name]: value }))
    }

    const handleGenerate = async () => {
        if (!tool) return

        // Check required fields
        const missingFields = tool.inputs
            .filter(input => input.required && !inputs[input.name])
            .map(input => input.label)

        if (missingFields.length > 0) {
            alert(`Please fill in required fields: ${missingFields.join(', ')}`)
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
            alert(error instanceof Error ? error.message : 'Failed to generate')
        } finally {
            setLoading(false)
        }
    }

    if (!tool) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Tool Not Found</h1>
                    <p className="text-slate-600">The requested tool does not exist.</p>
                </div>
            </div>
        )
    }

    const getIcon = () => {
        const IconComponent = (Icons as any)[tool.icon]
        return IconComponent ? <IconComponent className="h-6 w-6" /> : <Icons.Sparkles className="h-6 w-6" />
    }

    // Determine output language for code tools
    const getOutputLanguage = () => {
        if (tool.outputType !== 'code') return 'javascript'

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
        return langMap[inputs.language || 'javascript'] || 'javascript'
    }

    return (
        <ToolLayout
            toolName={tool.name}
            toolDescription={tool.description}
            icon={getIcon()}
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
                            value={inputs[input.name]}
                            onChange={(value) => handleInputChange(input.name, value)}
                            placeholder={input.placeholder}
                            required={input.required}
                            options={input.options}
                            min={input.min}
                            max={input.max}
                        />
                    ))}
                </ToolInput>

                {/* Output Panel */}
                <ToolOutput
                    output={output}
                    loading={loading}
                    outputType={tool.outputType}
                    language={getOutputLanguage()}
                />
            </div>
        </ToolLayout>
    )
}
