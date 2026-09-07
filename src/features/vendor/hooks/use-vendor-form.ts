import { useForm } from '@refinedev/antd';
import type { HttpError } from '@refinedev/core';
import type { FormRule } from 'antd';

import type { Vendor, VendorFormValues } from '../types';

/**
 * Validation rules, exported separately from the form component so they can be
 * unit-tested without rendering anything.
 */
export const vendorFormRules = {
  code: [{ required: true, message: 'Code is required' }] as FormRule[],
  name: [{ required: true, message: 'Name is required' }] as FormRule[],
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Enter a valid email address' },
  ] as FormRule[],
  phone: [] as FormRule[],
  city: [{ required: true, message: 'City is required' }] as FormRule[],
};

/**
 * Wraps Refine's form for both create and edit. The page picks the action;
 * everything else is identical, so the form component is shared.
 */
export function useVendorForm(action: 'create' | 'edit') {
  const { formProps, saveButtonProps, formLoading } = useForm<Vendor, HttpError, VendorFormValues>({
    resource: 'vendor',
    action,
    redirect: 'list',
  });

  return { formProps, saveButtonProps, formLoading };
}
