import React from 'react';

export default function LinearProgressBar({
  label,
  value = 0,
  max = 100,
  unit = '%',
  color = 'cyan', // 'cyan' | 'green' | 'amber' | 'red' | 'blue'
  height = 7,
  showLabel = true,
  showValue = true,
  status,
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let gradient = 'linear-gradient(90deg, #1E40AF, #2563EB)';

  if (color === 'green' || status === 'nominal' || status === 'normal') {
    gradient = 'linear-gradient(90deg, #15803D, #16A34A)';
  } else if (color === 'amber' || status === 'warning') {
    gradient = 'linear-gradient(90deg, #B45309, #D97706)';
  } else if (color === 'red' || status === 'critical') {
    gradient = 'linear-gradient(90deg, #B91C1C, #DC2626)';
  } else if (color === 'emerald') {
    gradient = 'linear-gradient(90deg, #047857, #10B981)';
  }

  return (
    <div style={{ width: '100%', marginBottom: '8px' }}>
      {(showLabel || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
            fontSize: '0.75rem',
          }}
        >
          {showLabel && (
            <span style={{ color: '#475569', fontWeight: 500 }}>{label}</span>
          )}
          {showValue && (
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 600,
                color: '#0F172A',
              }}
            >
              {typeof value === 'number' ? value.toFixed(0) : value}
              {unit}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: '#E2E8F0',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: gradient,
            borderRadius: '999px',
            transition: 'width 0.4s ease, background 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
