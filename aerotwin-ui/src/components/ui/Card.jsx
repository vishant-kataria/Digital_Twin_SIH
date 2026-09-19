import React from 'react';

export default function Card({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = '',
  style = {},
  status = 'default', // 'default' | 'nominal' | 'warning' | 'critical'
}) {
  const getStatusBorder = () => {
    switch (status) {
      case 'warning':
        return 'rgba(245, 158, 11, 0.4)';
      case 'critical':
        return 'rgba(239, 68, 68, 0.5)';
      case 'nominal':
        return 'rgba(16, 185, 129, 0.3)';
      default:
        return 'rgba(30, 58, 102, 0.5)';
    }
  };

  return (
    <div
      className={`tactical-card ${className}`}
      style={{
        background: 'rgba(13, 20, 36, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${getStatusBorder()}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: status === 'critical'
          ? '0 0 15px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : status === 'warning'
          ? '0 0 15px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || Icon || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            paddingBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icon && <Icon size={16} color="var(--accent-cyan, #38bdf8)" />}
            <div>
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {title}
              </h3>
              {subtitle && (
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
