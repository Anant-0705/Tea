import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject } = body;

    const result = await sendEmail({
      to: to || 'anantsinghal2134@gmail.com',
      subject: subject || 'Test Email from Meeting App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎉 Test Email Success!</h2>
          <p>This is a test email from your automated meeting actions system.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>To:</strong> ${to}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            If you're seeing this in the logs, your email system is working! ✅
          </p>
        </div>
      `,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
