import type { APIRoute } from 'astro';
import { CONTACT_TO } from 'astro:env/server';
import { CONTACT_LIMITS } from '../../consts';
import { sendMail } from '../../lib/gmail';

export const prerender = false;

const SUCCESS = '/contact/thanks';
const FAILURE = '/contact#send-error';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Submission {
  name: string;
  company: string;
  email: string;
  message: string;
}

/** Collapse whitespace, including CR/LF, so values are safe in headers. */
function singleLine(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function parse(form: FormData): Submission | null {
  const message = form.get('message');
  const s: Submission = {
    name: singleLine(form.get('name')),
    company: singleLine(form.get('company')),
    email: singleLine(form.get('email')),
    message: typeof message === 'string' ? message.trim() : '',
  };
  const fits = (Object.keys(CONTACT_LIMITS) as (keyof Submission)[]).every(
    (key) => s[key].length > 0 && s[key].length <= CONTACT_LIMITS[key],
  );
  return fits && EMAIL_RE.test(s.email) ? s : null;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData().catch(() => null);
  if (!form) return new Response('Bad request', { status: 400 });

  // Honeypot: hidden from people. Pretend success so bots don't retry.
  if (singleLine(form.get('website'))) return redirect(SUCCESS, 303);

  // The form's required/maxlength/type=email attributes catch bad input first;
  // anything reaching here invalid was scripted.
  const submission = parse(form);
  if (!submission) return redirect(FAILURE, 303);

  const { name, company, email, message } = submission;
  try {
    await sendMail({
      to: CONTACT_TO,
      replyTo: { name, address: email },
      subject: `Website inquiry: ${name} (${company})`,
      text: `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${message}\n`,
    });
  } catch (error) {
    // Log the submission so the lead can be recovered from function logs.
    console.error('Contact form send failed', { error, submission });
    return redirect(FAILURE, 303);
  }

  return redirect(SUCCESS, 303);
};
