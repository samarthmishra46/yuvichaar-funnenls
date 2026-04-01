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
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Yuvichaar!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${organizationName}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We're excited to have you on board! To complete your onboarding, please follow these steps:
          </p>
          
          <ol style="font-size: 16px; margin-bottom: 25px; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Review the Statement of Work (SOW) and Memorandum of Understanding (MOU)</li>
            <li style="margin-bottom: 10px;">Sign the documents electronically</li>
            <li style="margin-bottom: 10px;">Complete the minimum payment</li>
            <li style="margin-bottom: 10px;">Set up your account password</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${onboardingLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Complete Onboarding
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
