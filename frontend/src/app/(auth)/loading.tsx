/**
 * Auth-shell loading — covers cold compile of /login, /forgot-password,
 * /reset-password. The auth layout is a centered card so we render a
 * matching card placeholder.
 */
export default function AuthLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--color-surface-soft)',
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--color-canvas)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-hairline)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          style={{
            height: 28,
            width: '60%',
            margin: '0 auto var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface)',
          }}
        />
        <div
          style={{
            height: 14,
            width: '80%',
            margin: '0 auto var(--space-8)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface)',
          }}
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 44,
              marginBottom: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
