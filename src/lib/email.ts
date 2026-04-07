export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.EMAIL_FROM) {
    console.warn('EMAIL_FROM not configured, skipping email send');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email send failed:', error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export function getOnboardingEmailTemplate({
  organizationName,
  onboardingLink,
}: {
  organizationName: string;
  onboardingLink: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Yuvichaar!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${organizationName}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We're excited to partner with you on your growth journey! Please review and accept our proposal to get started.
          </p>
          
          <ol style="font-size: 16px; margin-bottom: 25px; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Review the proposal and deliverables</li>
            <li style="margin-bottom: 10px;">Accept the pricing and sign the agreement</li>
            <li style="margin-bottom: 10px;">Complete the advance payment</li>
            <li style="margin-bottom: 10px;">Set up your dashboard password</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${onboardingLink}" style="display: inline-block; background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Proposal
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            If you have any questions, please don't hesitate to reach out to our team.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Yuvichaar. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export function getTaskCompletionEmailTemplate({
  organizationName,
  taskTitle,
  dayNumber,
  staffName,
  proofOfWork,
}: {
  organizationName: string;
  taskTitle: string;
  dayNumber: number;
  staffName?: string;
  proofOfWork?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✓ Task Completed</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${organizationName}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! A task from your roadmap has been completed.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0 0 10px 0;"><strong>Day ${dayNumber}</strong></p>
            <p style="margin: 0 0 10px 0; font-size: 18px; color: #111;">${taskTitle}</p>
            ${staffName ? `<p style="margin: 0; color: #666; font-size: 14px;">Completed by: ${staffName}</p>` : ''}
          </div>
          
          ${
            proofOfWork
              ? `
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151;">Proof of Work:</p>
            <p style="margin: 0; color: #4b5563;">${proofOfWork}</p>
          </div>
          `
              : ''
          }
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            You can view all your roadmap progress in your client dashboard.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Yuvichaar. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export function getNewVideoEmailTemplate({
  organizationName,
  videoTitle,
  dashboardLink,
}: {
  organizationName: string;
  videoTitle: string;
  dashboardLink: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎬 New Video Ready!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${organizationName}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            A new video has been uploaded to your dashboard and is ready for review!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <p style="margin: 0; font-size: 18px; color: #111;">📹 ${videoTitle}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Video
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Log in to your dashboard to watch and provide feedback.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Yuvichaar. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export function getClientTaskEmailTemplate({
  organizationName,
  taskTitle,
  taskDescription,
  dashboardLink,
}: {
  organizationName: string;
  taskTitle: string;
  taskDescription?: string;
  dashboardLink: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📋 Action Required</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${organizationName}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We need your input! A new task has been assigned to you.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0 0 10px 0; font-size: 18px; color: #111; font-weight: 600;">${taskTitle}</p>
            ${taskDescription ? `<p style="margin: 0; color: #666; font-size: 14px;">${taskDescription}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Complete Task
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Please complete this task at your earliest convenience to keep your project on track.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Yuvichaar. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export function getRequestStatusEmailTemplate({
  organizationName,
  requestTitle,
  oldStatus,
  newStatus,
  adminNote,
  dashboardLink,
}: {
  organizationName: string;
  requestTitle: string;
  oldStatus: string;
  newStatus: string;
  adminNote?: string;
  dashboardLink: string;
}) {
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    rejected: '#ef4444',
  };
  const statusColor = statusColors[newStatus] || '#6b7280';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Request Update</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${organizationName}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Your request status has been updated.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
            <p style="margin: 0 0 10px 0; font-size: 18px; color: #111; font-weight: 600;">${requestTitle}</p>
            <p style="margin: 0;">
              <span style="color: #666;">Status:</span> 
              <span style="display: inline-block; background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                ${newStatus.replace('_', ' ').toUpperCase()}
              </span>
            </p>
          </div>
          
          ${adminNote ? `
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151;">Note from team:</p>
            <p style="margin: 0; color: #4b5563;">${adminNote}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Details
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Yuvichaar. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export function getNewSectionEmailTemplate({
  organizationName,
  sectionTitle,
  sectionDescription,
  dashboardLink,
}: {
  organizationName: string;
  sectionTitle: string;
  sectionDescription?: string;
  dashboardLink: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #e91e8c 0%, #be185d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✨ New Content Added</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${organizationName}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            New content has been added to your dashboard!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e91e8c;">
            <p style="margin: 0 0 10px 0; font-size: 18px; color: #111; font-weight: 600;">${sectionTitle}</p>
            ${sectionDescription ? `<p style="margin: 0; color: #666; font-size: 14px;">${sectionDescription}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #e91e8c 0%, #be185d 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Content
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Log in to your dashboard to explore the new content.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Yuvichaar. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export function getMilestoneEmailTemplate({
  organizationName,
  milestoneName,
  dayNumber,
  dashboardLink,
}: {
  organizationName: string;
  milestoneName: string;
  dayNumber: number;
  dashboardLink: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Milestone Reached!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${organizationName}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Congratulations! You've reached an important milestone in your 60-Day Growth Marathon!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Day ${dayNumber}</p>
            <p style="margin: 0; font-size: 24px; color: #111; font-weight: 700;">⭐ ${milestoneName}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Progress
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Keep up the great work! Your growth journey is progressing well.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Yuvichaar. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}
