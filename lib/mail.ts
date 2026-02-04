import { Resend } from 'resend';
import dbConnect from '@/lib/mongodb/client';
import { SiteSettings } from '@/lib/mongodb/models';

export async function sendVerificationEmail(email: string, token: string) {
    try {
        await dbConnect();
        const settings = await SiteSettings.findOne({ key: 'main' });

        const apiKey = settings?.email?.resendApiKey || process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error('Resend API key is missing in both database and environment variables.');
            return { success: false, error: 'Configuration error: Missing API Key' };
        }

        const resend = new Resend(apiKey);
        const fromName = settings?.email?.fromName || "AINepal";
        const fromEmail = settings?.email?.fromEmail || "onboarding@resend.dev";

        await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: email,
            subject: `Verify your email - ${fromName}`,
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h2 style="color: #111827; margin-bottom: 16px;">Welcome to ${fromName}!</h2>
                <p style="color: #4b5563; margin-bottom: 24px;">Please use the following verification code to complete your registration:</p>
                
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                    <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${token}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">This code will expire in 24 hours.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, you can ignore this email.</p>
            </div>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return { success: false, error };
    }
}
