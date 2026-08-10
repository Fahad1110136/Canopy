import nodemailer from 'nodemailer'

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD
const APP_URL = process.env.APP_URL || 'http://localhost:5173'

const transporter = (EMAIL_USER && EMAIL_APP_PASSWORD)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
    })
  : null

if (!transporter) {
  console.warn(
    '⚠️  EMAIL_USER / EMAIL_APP_PASSWORD are not set in server/.env. ' +
    'Verification emails will be logged to the console instead of actually ' +
    'sent — signup/verification will still work for local testing, but no ' +
    'real email will go out.'
  )
}

export async function sendVerificationEmail(user, token) {
  const verifyUrl = `${APP_URL}/verify?token=${token}`

  // Dev fallback: no Gmail credentials configured, so just log the link
  // instead of failing signup outright. Lets the app be tested end-to-end
  // before real credentials are added.
  if (!transporter) {
    console.log(`\n📧 [DEV] Verification link for ${user.email}:\n${verifyUrl}\n`)
    return { devMode: true, verifyUrl }
  }

  await transporter.sendMail({
    from: `Canopy <${EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify your Canopy account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1f3d2b;">Welcome to Canopy, ${user.name}</h2>
        <p>Confirm this is your email address to activate your account.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;background:#1f3d2b;color:#fff;
             padding:10px 20px;border-radius:999px;text-decoration:none;">
            Verify email
          </a>
        </p>
        <p style="color:#666;font-size:13px;">
          Or paste this link into your browser: ${verifyUrl}
        </p>
        <p style="color:#999;font-size:12px;">This link expires in 24 hours.</p>
      </div>
    `,
  })

  return { devMode: false }
}