import { Resend } from "resend";

const getResend = () => new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string;
  name?: string | null;
}) {
  const firstName = name?.split(" ")[0] || null;
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  await getResend().emails.send({
    from: "Richard at Learn Agent Architecture <support@learnagentarchitecture.com>",
    to: email,
    replyTo: "support@learnagentarchitecture.com",
    subject: "Welcome to Learn Agent Architecture 👋",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo / Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="display:inline-block;background-color:#7c3aed;border-radius:8px;padding:8px 18px;font-size:13px;color:white;font-weight:700;">
                Learn Agent Architecture
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#13131f;border:1px solid #1e1b2e;border-radius:16px;padding:40px;">

              <p style="margin:0 0 20px;font-size:16px;color:#e2e8f0;line-height:1.6;">
                ${greeting}
              </p>

              <p style="margin:0 0 20px;font-size:16px;color:#e2e8f0;line-height:1.6;">
                Thanks for signing up — I really appreciate it.
              </p>

              <p style="margin:0 0 20px;font-size:16px;color:#e2e8f0;line-height:1.6;">
                Learn Agent Architecture started as a weekend project. I wanted a focused way to study the Anthropic Architecture Certification and couldn't find one, so I built it. The fact that you're here means a lot.
              </p>

              <p style="margin:0 0 20px;font-size:16px;color:#e2e8f0;line-height:1.6;">
                Right now the site covers all 8 domains with practice questions and AI-powered explanations. It's a solid foundation, but I know there's a lot more it could be.
              </p>

              <p style="margin:0 0 8px;font-size:16px;color:#e2e8f0;line-height:1.6;">
                That's where you come in.
              </p>

              <!-- Highlight box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background-color:#1e1b2e;border:1px solid #4c1d95;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0;font-size:15px;color:#a78bfa;line-height:1.6;">
                      I'm actively collecting feedback before deciding what to build next — more questions, new study modes, better explanations, whatever would actually help you pass. <strong>The easiest way to share your thoughts is to reply directly to this email.</strong> I read every response.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:15px;color:#94a3b8;line-height:1.6;">A few things worth knowing:</p>
              <ul style="margin:0 0 24px;padding-left:20px;color:#94a3b8;font-size:15px;line-height:1.8;">
                <li>Practice exams are free to start</li>
                <li>AI explanations are available on the upgrade plan</li>
                <li>New questions are added regularly</li>
              </ul>

              <p style="margin:0 0 32px;font-size:16px;color:#e2e8f0;line-height:1.6;">
                Good luck with your prep. And seriously — hit reply if anything comes to mind, good or bad.
              </p>

              <!-- Signature -->
              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.8;">
                Richard<br/>
                Founder, Learn Agent Architecture<br/>
                <a href="https://www.learnagentarchitecture.com" style="color:#a78bfa;text-decoration:none;">learnagentarchitecture.com</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#334155;line-height:1.6;">
                You're receiving this because you signed up at learnagentarchitecture.com.<br/>
                Reply to this email to reach Richard directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
