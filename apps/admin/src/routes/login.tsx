import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, type LoginRequest } from '@org/contracts';
import { useLogin } from '@org/api-client';
import { Button, Card, Input, Label } from '@org/ui';
import { useSessionStore } from '../lib/session-store.js';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const login = useLogin({
    onSuccess: (result) => {
      if (result.user.role !== 'ADMIN') {
        setFormError('This account does not have admin access.');
        return;
      }
      setSession(result.user, result.accessToken);
      navigate({ to: '/' });
    },
  });

  const {
    register,
    handleSubmit,
    setError: setFormErrorRaw,
    formState: { errors },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequestSchema) });

  function setFormError(message: string) {
    setFormErrorRaw('root', { message });
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <h1 className="text-xl font-semibold text-brand-900">Admin sign in</h1>
      <p className="mt-1 text-sm text-brand-500">LuxeRetail management console</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))}>
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
        {(login.isError || errors.root) && (
          <p className="text-sm text-red-600">{errors.root?.message ?? login.error?.message}</p>
        )}
        <Button type="submit" className="w-full" size="lg" loading={login.isPending}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-xs text-brand-400">Demo admin: admin@luxeretail.dev / Password123!</p>
    </Card>
  );
}
