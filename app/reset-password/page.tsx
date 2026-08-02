'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkToken = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setIsValidToken(true);
      }
      setCheckingToken(false);
    };

    checkToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Por favor, ingresa una contraseña');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <p>Verificando...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <h1 style={styles.title}>Enlace Inválido</h1>
          <p>El enlace de recuperación ha expirado o es inválido.</p>
          <p>
            Por favor,{' '}
            <button
              onClick={() => router.push('/login')}
              style={styles.link}
            >
              solicita un nuevo enlace de recuperación
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>Cambiar Contraseña</h1>

        {success ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>✓ Contraseña cambiada exitosamente</p>
            <p style={styles.redirectText}>Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Nueva Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                style={styles.input}
                disabled={loading}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}

        <p style={styles.helpText}>
          ¿Problemas? Intenta{' '}
          <button
            onClick={() => router.push('/login')}
            style={styles.link}
          >
            solicitar un nuevo enlace
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#faf8f3',
    fontFamily: '"DM Sans", sans-serif',
  } as React.CSSProperties,
  box: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  title: {
    fontSize: '1.8rem',
    fontWeight: 600,
    color: '#964146',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  label: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#666',
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  input: {
    padding: '0.85rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontFamily: '"DM Sans", sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  button: {
    padding: '0.85rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#964146',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  error: {
    color: '#d32f2f',
    fontSize: '0.9rem',
    marginTop: '-0.5rem',
  } as React.CSSProperties,
  successBox: {
    padding: '1.5rem',
    backgroundColor: '#e8f5e9',
    borderRadius: '6px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  successText: {
    color: '#2e7d32',
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 0.5rem 0',
  } as React.CSSProperties,
  redirectText: {
    color: '#558b2f',
    fontSize: '0.9rem',
    margin: 0,
  } as React.CSSProperties,
  helpText: {
    textAlign: 'center' as const,
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '1.5rem',
  } as React.CSSProperties,
  link: {
    background: 'none',
    border: 'none',
    color: '#964146',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
    padding: 0,
    fontFamily: 'inherit',
  } as React.CSSProperties,
};
