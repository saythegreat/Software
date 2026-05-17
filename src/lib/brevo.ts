/**
 * Brevo transactional email sender — server-side only.
 * Uses the Brevo REST API directly via fetch (avoids ESM bundler incompatibilities).
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@freshtrack.app';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'FreshTrack';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(
  toEmail: string,
  toName: string,
  token: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify your FreshTrack account</title>
    </head>
    <body style="margin:0;padding:0;background:#F8FAF9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAF9;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr>
                <td style="background:linear-gradient(135deg,#059669 0%,#10b981 100%);padding:40px 48px;text-align:center;">
                  <div style="font-size:32px;margin-bottom:8px;">🌿</div>
                  <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">FreshTrack</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;">Smart Food Expiry Tracker</p>
                </td>
              </tr>
              <tr>
                <td style="padding:48px;">
                  <h2 style="margin:0 0 12px;color:#1f2937;font-size:22px;font-weight:700;">Welcome, ${toName}! 👋</h2>
                  <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
                    Thanks for signing up for FreshTrack. Enter the verification code below to verify your email address and start managing your kitchen smarter.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <div style="display:inline-block;background:#F0FDF4;color:#065F46;font-size:32px;font-weight:800;letter-spacing:6px;padding:20px 40px;border-radius:12px;border:2px dashed #34D399;">
                          ${token}
                        </div>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.5;">
                    This code expires in <strong style="color:#374151;">10 minutes</strong>.<br/>
                    If you didn't sign up, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 48px;border-top:1px solid #f3f4f6;text-align:center;">
                  <p style="margin:0;color:#d1d5db;font-size:12px;">
                    © 2025 FreshTrack · Reducing food waste, one fridge at a time 🌱
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail, name: toName }],
      subject: 'Verify your FreshTrack account',
      htmlContent,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Brevo API error: ${response.status} — ${err}`);
  }
}
