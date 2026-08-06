'use server';

import { redirect } from 'next/navigation';

import { createCustomer } from '@/lib/customers.server';

export async function createCustomerAction(
  formData: FormData,
) {
  await createCustomer({
    code: String(formData.get('code') ?? ''),
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
  });

  redirect('/customers');
}
