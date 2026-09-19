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
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      case 'nominal':
        return '#10B981';
      default:
        return '#E2E8F0';
    }
  };

  return (
    <div
      className={`tactical-card ${className}`}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${getStatusBorder()}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: status === 'critical'
          ? '0 1px 3px rgba(239, 68, 68, 0.2), 0 0 0 1px #EF4444'
          : status === 'warning'
            ? '0 1px 3px rgba(245, 158, 11, 0.2), 0 0 0 1px #F59E0B'
            : '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
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
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icon && <Icon size={16} color="#1E40AF" />}
            <div>
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0F172A',
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
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
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
