import { describe, expect, it } from 'vitest';
import { vendorFormRules } from './use-vendor-form';

/**
 * The rules are a plain object, so they are testable without rendering a form.
 * That is why they live outside the component.
 */
describe('vendorFormRules', () => {
  it('requires a code and a name', () => {
    expect(vendorFormRules.code[0]).toMatchObject({ required: true });
    expect(vendorFormRules.name[0]).toMatchObject({ required: true });
  });

  it('validates the email format', () => {
    expect(vendorFormRules.email).toContainEqual(expect.objectContaining({ type: 'email' }));
  });

  it('leaves phone optional', () => {
    expect(vendorFormRules.phone).toHaveLength(0);
  });
});
