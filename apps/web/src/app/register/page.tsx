import { BackButton } from '@/components/navigation/back-button';

import { Suspense } from 'react';

import RegisterForm from './register-form';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterForm />
    </Suspense>
  );
}
