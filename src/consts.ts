export const SITE_NAME = 'Tellan';
export const HOME_TITLE = 'Tellan | AI Consulting';
// TODO: final meta description.
export const SITE_DESCRIPTION =
  'Tellan is an AI consulting firm. We help operating teams find where AI pays off, build it, and put it into production.';

/** Max lengths for contact form fields; used by the form and the handler. */
export const CONTACT_LIMITS = { name: 200, company: 200, email: 254, message: 5000 } as const;

export const NAV_LINKS = [
  { href: '/team', label: 'Team' },
  { href: '/merch', label: 'Merch' },
  { href: '/contact', label: 'Contact' },
] as const;
