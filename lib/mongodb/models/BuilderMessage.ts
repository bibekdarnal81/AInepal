import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilderMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    role: 'user' | 'assistant';
    content: string;
    status?: 'processing' | 'completed' | 'cancelled';
}

const BuilderMessageSchema = new Schema<IBuilderMessage>({
    conversationId: { type: Schema.Types.ObjectId, ref: 'BuilderConversation', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'BuilderProject', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['processing', 'completed', 'cancelled'] },
}, { timestamps: true });

export const BuilderMessage = mongoose.models.BuilderMessage || mongoose.model<IBuilderMessage>('BuilderMessage', BuilderMessageSchema);
