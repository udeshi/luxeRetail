import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, type LoginRequest } from '@org/contracts';
import { useLogin } from '@org/api-client';
import { Button, Input, Label } from '@org/ui';
import { useSessionStore } from '../lib/session-store.js';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const login = useLogin({
    onSuccess: (result) => {
      setSession(result.user, result.accessToken);
      navigate({ to: '/' });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequestSchema) });

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-semibold text-brand-900">Sign in</h1>
      <p className="mt-1 text-sm text-brand-500">
        No account? <Link to="/register" className="font-medium text-brand-700 underline">Create one</Link>
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
        {login.isError && <p className="text-sm text-red-600">{login.error.message}</p>}
        <Button type="submit" className="w-full" size="lg" loading={login.isPending}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-xs text-brand-400">
        Demo account: customer@luxeretail.dev / Password123!
      </p>
    </div>
  );
}
