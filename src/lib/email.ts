// Address check and sign-up messages, shared by the form script (browser) and /api/subscribe.
// No Node imports here: this module ends up in the client bundle.

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/** Conservative check; the real validation happens when the confirmation mail is delivered. */
// No `|`: it separates address and timestamp in the signed confirmation token (src/lib/subscribe.ts).
export const isValidEmail = (email: string): boolean => /^[^\s@|]+@[^\s@|]+\.[^\s@|]{2,}$/.test(email) && email.length <= 254;

export const SUBSCRIBE_MESSAGES = {
  sent: 'Fast geschafft: Bitte bestätige die Anmeldung über den Link in deiner E-Mail.',
  invalid: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  failed: 'Das hat nicht geklappt. Bitte versuch es später noch einmal.',
} as const;
