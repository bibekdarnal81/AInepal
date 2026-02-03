import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import bcrypt from 'bcrypt'
import dbConnect from '@/lib/mongodb/client'
import { Membership, User } from '@/lib/mongodb/models'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            image?: string | null
            isAdmin: boolean
            credits: number
        }
    }

    interface User {
        id: string
        email: string
        isAdmin: boolean
        displayName?: string
        avatarUrl?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        isAdmin: boolean
        credits: number
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required')
                }

                await dbConnect()

                const user = await User.findOne({
                    email: credentials.email.toLowerCase(),
                })

                if (!user) {
                    throw new Error('Invalid credentials')
                }

                // If user has no password (e.g. OAuth only), deny credential login
                if (!user.password) {
                    throw new Error('Please sign in with your social account')
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials')
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    isAdmin: user.isAdmin,
                    displayName: user.displayName,
                    avatarUrl: user.avatarUrl,
                    credits: user.credits || 0,
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/register',
        error: '/auth/error',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'credentials') {
                return true
            }

            // Handle OAuth sign-in
            try {
                console.log('OAuth SignIn initiated for:', user.email, 'Provider:', account?.provider)
                await dbConnect()
                console.log('DB Connected')

                const existingUser = await User.findOne({ email: user.email?.toLowerCase() })
                console.log('User found:', !!existingUser)

                if (existingUser) {
                    // Update avatar if not set
                    if (!existingUser.avatarUrl && user.image) {
                        existingUser.avatarUrl = user.image
                        await existingUser.save()
                    }

                    // Attach ID to user object for subsequent callbacks
                    user.id = existingUser._id.toString()
                    return true
                }

                console.log('Creating new user...')

                if (!user.email) {
                    throw new Error('Email is required for sign up')
                }

                const freeMembership = await Membership.findOne({ slug: 'free', isActive: true }).select('durationDays advancedCredits').lean()
                const membershipExpiresAt = freeMembership?.durationDays
                    ? new Date(Date.now() + freeMembership.durationDays * 86400000)
                    : undefined

                // Create new user for OAuth
                const newUser = await User.create({
                    email: user.email?.toLowerCase(),
                    displayName: user.name || undefined,
                    avatarUrl: user.image || undefined,
                    isAdmin: false,
                    emailVerified: new Date(),
                    membershipId: freeMembership?._id,
                    membershipStatus: freeMembership ? 'active' : 'none',
                    membershipExpiresAt,
                    credits: 50, // Default basic credits
                    advancedCredits: freeMembership?.advancedCredits || 50, // Default advanced credits
                })
                console.log('New user created:', newUser._id)

                user.id = newUser._id.toString()
                return true
            } catch (error) {
                console.error('Error in signIn callback:', error)
                return false
            }
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id

                // Fetch latest user data to get isAdmin status accurately
                if (!token.isAdmin) {
                    try {
                        await dbConnect()
                        const dbUser = await User.findById(user.id)
                        if (dbUser) {
                            token.isAdmin = dbUser.isAdmin
                        }
                    } catch (e) {
                        console.error('Error fetching user in jwt:', e)
                    }
                }
            }

            // Sync credits from DB on every session check
            if (token.id) {
                try {
                    await dbConnect()
                    const dbUser = await User.findById(token.id).select('credits')
                    if (dbUser) {
                        token.credits = dbUser.credits || 0
                    }
                } catch (e) {
                    console.error('Error fetching credits in jwt:', e)
                }
            }

            // Allow updating session from client
            if (trigger === "update" && session?.name) {
                token.name = session.name
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id
                session.user.isAdmin = token.isAdmin
                session.user.credits = token.credits
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}
