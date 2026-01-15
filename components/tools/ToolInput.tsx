'use client'

import { ReactNode } from 'react'
import * as Icons from 'lucide-react'

interface ToolInputProps {
    children: ReactNode
    onGenerate?: () => void
    generating?: boolean
    tokenCost?: number
}

export function ToolInput({ children, onGenerate, generating, tokenCost }: ToolInputProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Input Settings</h2>
                {tokenCost && (
                    <div className="flex items-center gap-2 text-sm">
                        <Icons.Coins className="h-4 w-4 text-yellow-500" />
                        <span className="text-slate-600">{tokenCost} tokens</span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {children}
            </div>

            {onGenerate && (
                <button
                    onClick={onGenerate}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <>
                            <Icons.Loader2 className="h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Icons.Sparkles className="h-5 w-5" />
                            Generate
                        </>
                    )}
                </button>
            )}
        </div>
    )
}

// Individual input components
interface InputFieldProps {
    label: string
    name: string
    type?: 'text' | 'textarea' | 'select' | 'number' | 'file' | 'checkbox'
    value?: any
    onChange?: (value: any) => void
    placeholder?: string
    required?: boolean
    options?: { value: string; label: string }[]
    min?: number
    max?: number
}

export function InputField({ label, name, type = 'text', value, onChange, placeholder, required, options, min, max }: InputFieldProps) {
    const handleChange = (e: any) => {
        if (type === 'checkbox') {
            onChange?.(e.target.checked)
        } else {
            onChange?.(e.target.value)
        }
    }

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
                />
            ) : type === 'select' ? (
                <select
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={handleChange}
                    required={required}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                >
                    <option value="">Select an option</option>
                    {options?.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : type === 'checkbox' ? (
                <div className="flex items-center gap-2">
                    <input
                        id={name}
                        name={name}
                        type="checkbox"
                        checked={value || false}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                    />
                    <label htmlFor={name} className="text-sm text-slate-600">
                        {placeholder || label}
                    </label>
                </div>
            ) : type === 'file' ? (
                <input
                    id={name}
                    name={name}
                    type="file"
                    onChange={(e) => onChange?.(e.target.files?.[0])}
                    required={required}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    min={min}
                    max={max}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
            )}
        </div>
    )
}
