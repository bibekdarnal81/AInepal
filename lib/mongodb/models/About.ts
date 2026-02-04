import mongoose, { Schema, Document } from 'mongoose';

export interface IAbout extends Document {
    hero: {
        title: string;
        description: string;
    };
    story: {
        title: string;
        content: string[]; // Handled as array of paragraphs
    };
    values: {
        title: string;
        description: string;
        icon: string;
    }[];
    seo: {
        title: string;
        description: string;
    };
    updatedAt: Date;
}

const AboutSchema = new Schema<IAbout>({
    hero: {
        title: { type: String, required: true },
        description: { type: String, required: true }
    },
    story: {
        title: { type: String, required: true },
        content: [{ type: String, required: true }]
    },
    values: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true }
    }],
    seo: {
        title: { type: String, default: 'About Us' },
        description: { type: String, default: 'Learn more about us.' }
    }
}, {
    timestamps: true
});

// Prevent model overwrite in development
export const About = mongoose.models.About || mongoose.model<IAbout>('About', AboutSchema);
