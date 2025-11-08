import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/google/firestore';
import { sendEmail } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { task, assignee, priority } = body;

    // Create test task
    const taskRef = await db.collection('action-items').add({
      task: task || 'Test task from automation system',
      assignee: assignee || 'anantsinghal2134@gmail.com',
      priority: priority || 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      createdAt: new Date().toISOString(),
      createdBy: session?.user?.email || 'test@example.com',
      isTest: true,
    });

    // Send notification to assignee
    const assigneeEmail = assignee || 'anantsinghal2134@gmail.com';
    
    await sendEmail({
      to: assigneeEmail,
      subject: `New Task Assigned: ${task || 'Test task'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">✅ New Task Assigned</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Task:</strong> ${task || 'Test task from automation system'}</p>
            <p><strong>Priority:</strong> <span style="color: ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#3b82f6'};">${priority || 'medium'}</span></p>
            <p><strong>Due Date:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            <p><strong>Assigned by:</strong> ${session?.user?.email || 'test@example.com'}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            This is a test task created by the automated actions system.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      taskId: taskRef.id,
      message: `Task created and assigned to ${assigneeEmail}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
