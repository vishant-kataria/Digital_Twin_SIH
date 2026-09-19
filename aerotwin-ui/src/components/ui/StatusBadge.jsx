import React from 'react';

export default function StatusBadge({ status = 'normal', label, size = 'sm' }) {
  const normalized = (status || '').toLowerCase();

  let bg = 'rgba(16, 185, 129, 0.15)';
  let border = 'rgba(16, 185, 129, 0.3)';
  let text = '#34d399';
  let dot = '#10b981';

  if (['warning', 'amber', 'medium', 'pending', 'degraded'].includes(normalized)) {
    bg = 'rgba(245, 158, 11, 0.15)';
    border = 'rgba(245, 158, 11, 0.3)';
    text = '#fbbf24';
    dot = '#f59e0b';
  } else if (['critical', 'danger', 'red', 'high', 'active_fault', 'fail'].includes(normalized)) {
    bg = 'rgba(239, 68, 68, 0.18)';
    border = 'rgba(239, 68, 68, 0.4)';
    text = '#f87171';
    dot = '#ef4444';
  } else if (['info', 'blue', 'cyan'].includes(normalized)) {
    bg = 'rgba(56, 189, 248, 0.15)';
    border = 'rgba(56, 189, 248, 0.3)';
    text = '#38bdf8';
    dot = '#0284c7';
  } else if (['resolved', 'neutral', 'gray'].includes(normalized)) {
    bg = 'rgba(148, 163, 184, 0.15)';
    border = 'rgba(148, 163, 184, 0.25)';
    text = '#94a3b8';
    dot = '#64748b';
  }

  const displayLabel = label || (status.charAt(0).toUpperCase() + status.slice(1));
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 8px' : '4px 12px',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.68rem' : '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '7px',
          height: isSmall ? '5px' : '7px',
          borderRadius: '50%',
          backgroundColor: dot,
          boxShadow: `0 0 6px ${dot}`,
        }}
      />
      {displayLabel}
    </span>
  );
}
