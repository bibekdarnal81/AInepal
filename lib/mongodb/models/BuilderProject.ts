import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilderProject extends Document {
    name: string;
    ownerId: mongoose.Types.ObjectId;
    updatedAt: number;
    importStatus?: 'importing' | 'completed' | 'failed';
    exportStatus?: 'exporting' | 'completed' | 'failed' | 'cancelled';
    exportRepoUrl?: string;
    settings?: {
        installCommand?: string;
        devCommand?: string;
    };
    createdAt: Date;
}

const BuilderProjectSchema = new Schema<IBuilderProject>({
    name: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedAt: { type: Number, default: () => Date.now() },
    importStatus: { type: String, enum: ['importing', 'completed', 'failed'] },
    exportStatus: { type: String, enum: ['exporting', 'completed', 'failed', 'cancelled'] },
    exportRepoUrl: { type: String },
    settings: {
        installCommand: String,
        devCommand: String,
    }
}, { timestamps: true });

export const BuilderProject = mongoose.models.BuilderProject || mongoose.model<IBuilderProject>('BuilderProject', BuilderProjectSchema);
