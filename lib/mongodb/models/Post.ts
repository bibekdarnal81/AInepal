import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPost extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    content?: string
    excerpt?: string
    thumbnailUrl?: string
    categoryId?: mongoose.Types.ObjectId
    published: boolean
    createdAt: Date
    updatedAt: Date
}

const PostSchema = new Schema<IPost>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        content: {
            type: String,
        },
        excerpt: {
            type: String,
        },
        thumbnailUrl: {
            type: String,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'PostCategory',
        },
        published: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes

PostSchema.index({ published: 1 })
PostSchema.index({ categoryId: 1 })
PostSchema.index({ createdAt: -1 })

export const Post: Model<IPost> =
    mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)

export default Post
