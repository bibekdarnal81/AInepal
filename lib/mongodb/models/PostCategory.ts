import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPostCategory extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    slug: string
    description?: string
    createdAt: Date
    updatedAt: Date
}

const PostCategorySchema = new Schema<IPostCategory>(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

// Index


export const PostCategory: Model<IPostCategory> =
    mongoose.models.PostCategory ||
    mongoose.model<IPostCategory>('PostCategory', PostCategorySchema)

export default PostCategory
