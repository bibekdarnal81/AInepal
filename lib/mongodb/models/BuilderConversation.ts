import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilderConversation extends Document {
    projectId: mongoose.Types.ObjectId;
    title: string;
    updatedAt: number;
}

const BuilderConversationSchema = new Schema<IBuilderConversation>({
    projectId: { type: Schema.Types.ObjectId, ref: 'BuilderProject', required: true, index: true },
    title: { type: String, required: true },
    updatedAt: { type: Number, default: () => Date.now() },
});

export const BuilderConversation = mongoose.models.BuilderConversation || mongoose.model<IBuilderConversation>('BuilderConversation', BuilderConversationSchema);
