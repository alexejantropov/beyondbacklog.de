import { expect, it } from 'vitest';
import { isValidEmail } from '../src/lib/subscribe';
it('rejects addresses with the token separator', () => {
  expect(isValidEmail('a|b@example.de')).toBe(false);
  expect(isValidEmail('a@exam|ple.de')).toBe(false);
});
