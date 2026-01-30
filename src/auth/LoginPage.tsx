import { useState, type FormEvent } from 'react';
import { useAuth } from './store';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const login = useAuth(s => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(username, password);
    if (!success) setError('Usuario o contraseña incorrectos');
    setLoading(false);
  };

  const quickLogin = (u: string) => {
    setUsername(u);
    setPassword('demo');
  };

  return (
    <div className={styles.container}>
      {/* Left panel — branding */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <img
            src="/logo-total-cleaner.jpeg"
            alt="Total Cleaner"
            className={styles.logo}
          />
          <div className={styles.brandInfo}>
            <h1 className={styles.brandName}>Plus Makers</h1>
            <p className={styles.brandDesc}>
              Sistema de Control de Manufactura
            </p>
          </div>
          <div className={styles.brandDetails}>
            <div className={styles.brandDetail}>
              <span className={styles.detailLabel}>Plataforma</span>
              <span className={styles.detailValue}>Manufacturing ERP</span>
            </div>
            <div className={styles.brandDetail}>
              <span className={styles.detailLabel}>Industria</span>
              <span className={styles.detailValue}>Productos Químicos de Limpieza</span>
            </div>
            <div className={styles.brandDetail}>
              <span className={styles.detailLabel}>Versión</span>
              <span className={styles.detailValue}>v0.1.0 — Desarrollo</span>
            </div>
          </div>
        </div>
        <div className={styles.brandFooter}>
          <span>&copy; 2026 Plus Makers. Todos los derechos reservados.</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Iniciar Sesión</h2>
            <p className={styles.formSubtitle}>
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                className={styles.input}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="nombre.usuario"
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className={styles.error}>
                <span className={styles.errorIcon}>!</span>
                {error}
              </div>
            )}

            <button
              className={styles.submit}
              type="submit"
              disabled={loading || !username || !password}
            >
              {loading ? 'Autenticando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          <div className={styles.quickAccess}>
            <div className={styles.quickHeader}>
              <span className={styles.quickLine} />
              <span className={styles.quickLabel}>Acceso rápido (demo)</span>
              <span className={styles.quickLine} />
            </div>
            <div className={styles.quickGrid}>
              {[
                { u: 'rmorales', label: 'Gerente Planta', role: 'plant_manager', color: 'var(--status-info)' },
                { u: 'acastro', label: 'Supervisora', role: 'prod_supervisor', color: 'var(--status-caution)' },
                { u: 'jlopez', label: 'Operador', role: 'operator', color: 'var(--status-warning)' },
                { u: 'mreyes', label: 'QC Técnico', role: 'qc_tech', color: 'var(--status-hold)' },
                { u: 'cflores', label: 'Bodega', role: 'warehouse', color: 'var(--status-normal)' },
                { u: 'lmartinez', label: 'Ventas', role: 'sales', color: 'var(--brand-accent)' },
                { u: 'phernandez', label: 'Contabilidad', role: 'accounting', color: 'var(--text-tertiary)' },
              ].map(({ u, label, role, color }) => (
                <button
                  key={u}
                  className={styles.quickBtn}
                  type="button"
                  onClick={() => quickLogin(u)}
                >
                  <span className={styles.quickDot} style={{ background: color }} />
                  <span className={styles.quickInfo}>
                    <span className={styles.quickName}>{label}</span>
                    <span className={styles.quickRole}>{role}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
