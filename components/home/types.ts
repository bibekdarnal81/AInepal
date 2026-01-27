export interface AIModel {
    _id: string
    provider: string
    modelName: string
    displayName: string
    modelId: string
    supportsStreaming: boolean
    supportsVision: boolean
    supportsImageGeneration?: boolean
    supportsVideoGeneration?: boolean
    description?: string
    image?: string
    isActive: boolean
}

export interface ModelSelectorProps {
    isOpen: boolean
    onClose: () => void
    availableModels: AIModel[]
    selectedModels: AIModel[]
    onSelectModels: (models: AIModel[]) => void
}
