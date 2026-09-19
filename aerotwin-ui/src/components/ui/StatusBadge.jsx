import React from 'react';

export default function StatusBadge({ status = 'normal', label, size = 'sm' }) {
  const normalized = (status || '').toLowerCase();

  let bg = '#F0FDF4';
  let border = '#BBF7D0';
  let text = '#15803D';
  let dot = '#16A34A';

  if (['warning', 'amber', 'medium', 'pending', 'degraded'].includes(normalized)) {
    bg = '#FFFBEB';
    border = '#FDE68A';
    text = '#B45309';
    dot = '#D97706';
  } else if (['critical', 'danger', 'red', 'high', 'active_fault', 'fail'].includes(normalized)) {
    bg = '#FEF2F2';
    border = '#FECACA';
    text = '#B91C1C';
    dot = '#DC2626';
  } else if (['info', 'blue', 'cyan'].includes(normalized)) {
    bg = '#EFF6FF';
    border = '#BFDBFE';
    text = '#1D4ED8';
    dot = '#2563EB';
  } else if (['resolved', 'neutral', 'gray'].includes(normalized)) {
    bg = '#F1F5F9';
    border = '#E2E8F0';
    text = '#475569';
    dot = '#64748B';
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
        }}
      />
      {displayLabel}
    </span>
  );
}
