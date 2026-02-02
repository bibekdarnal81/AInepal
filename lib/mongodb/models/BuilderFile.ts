import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilderFile extends Document {
    projectId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    storageId?: string;
    updatedAt: number;
}

const BuilderFileSchema = new Schema<IBuilderFile>({
    projectId: { type: Schema.Types.ObjectId, ref: 'BuilderProject', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'BuilderFile', index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['file', 'folder'], required: true },
    content: { type: String },
    storageId: { type: String },
    updatedAt: { type: Number, default: () => Date.now() },
});

BuilderFileSchema.index({ projectId: 1, parentId: 1 });

export const BuilderFile = mongoose.models.BuilderFile || mongoose.model<IBuilderFile>('BuilderFile', BuilderFileSchema);
