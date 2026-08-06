import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterRequestSchema, type RegisterRequest } from '@org/contracts';
import { useRegister } from '@org/api-client';
import { Button, Input, Label } from '@org/ui';
import { useSessionStore } from '../lib/session-store.js';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const registerAccount = useRegister({
    onSuccess: (result) => {
      setSession(result.user, result.accessToken);
      navigate({ to: '/' });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({ resolver: zodResolver(RegisterRequestSchema) });

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-semibold text-brand-900">Create an account</h1>
      <p className="mt-1 text-sm text-brand-500">
        Already have one? <Link to="/login" className="font-medium text-brand-700 underline">Sign in</Link>
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit((values) => registerAccount.mutate(values))}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" error={errors.firstName?.message} {...register('firstName')} />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" error={errors.lastName?.message} {...register('lastName')} />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
        {registerAccount.isError && <p className="text-sm text-red-600">{registerAccount.error.message}</p>}
        <Button type="submit" className="w-full" size="lg" loading={registerAccount.isPending}>
          Create account
        </Button>
      </form>
    </div>
  );
}
