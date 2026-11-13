import { JWT } from 'google-auth-library';
import MailComposer from 'nodemailer/lib/mail-composer';
import type Mail from 'nodemailer/lib/mailer';
import {
  GMAIL_SENDER,
  GOOGLE_SA_CLIENT_EMAIL,
  GOOGLE_SA_PRIVATE_KEY,
} from 'astro:env/server';

const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

let client: JWT | undefined;

function getClient(): JWT {
  if (!GOOGLE_SA_CLIENT_EMAIL || !GOOGLE_SA_PRIVATE_KEY) {
    throw new Error('GOOGLE_SA_CLIENT_EMAIL / GOOGLE_SA_PRIVATE_KEY are not set');
  }
  client ??= new JWT({
    email: GOOGLE_SA_CLIENT_EMAIL,
    // Tolerate a PEM stored with literal "\n" sequences.
    key: GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    // Domain-wide delegation: act as this Workspace user.
    subject: GMAIL_SENDER,
  });
  return client;
}

/** Send a message as GMAIL_SENDER via the Gmail API. */
export async function sendMail(message: Omit<Mail.Options, 'from'>): Promise<void> {
  const raw = await new MailComposer({
    ...message,
    from: { name: 'Tellan Website', address: GMAIL_SENDER },
  })
    .compile()
    .build();

  await getClient().request({
    url: SEND_URL,
    method: 'POST',
    data: { raw: raw.toString('base64url') },
  });
}
