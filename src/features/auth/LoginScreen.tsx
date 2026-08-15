import { useState, type FormEvent } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
// import { Button } from '../../components/ui/Button';
// import { TextField } from '../../components/ui/TextField';
import './LoginScreen.css';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: { email?: string; password?: string } = {};
    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    // setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      // setIsSubmitting(true);
      await login({ email, password });
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      // setIsSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-screen__card" onSubmit={handleSubmit} noValidate>
        <h1 className="login-screen__title">Welcome back</h1>
        <p className="login-screen__subtitle">Sign in to continue to Tedix Hunt.</p>

        <div className="login-screen__form">
          <input
            // label="Email"
            type="email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            // error={errors.email}
          />
          <input
            // label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            // error={errors.password}
          />
          {submitError ? <p className="login-screen__error">{submitError}</p> : null}
          <button type="submit" >Log in</button>
        </div>
      </form>
    </div>
  );
}
