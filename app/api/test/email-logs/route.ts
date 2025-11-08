import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logFile = path.join(process.cwd(), 'logs', 'emails.log');
    
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({
        success: true,
        logs: 'No emails sent yet. Send a test email to see logs here.',
      });
    }

    const logs = fs.readFileSync(logFile, 'utf-8');
    
    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
