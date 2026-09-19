import React from 'react';

export default function LinearProgressBar({
  label,
  value = 0,
  max = 100,
  unit = '%',
  color = 'cyan', // 'cyan' | 'green' | 'amber' | 'red' | 'blue'
  height = 8,
  showLabel = true,
  showValue = true,
  status,
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let gradient = 'linear-gradient(90deg, #0284c7, #38bdf8)';
  let glowColor = 'rgba(56, 189, 248, 0.4)';

  if (color === 'green' || status === 'nominal' || status === 'normal') {
    gradient = 'linear-gradient(90deg, #059669, #10b981)';
    glowColor = 'rgba(16, 185, 129, 0.4)';
  } else if (color === 'amber' || status === 'warning') {
    gradient = 'linear-gradient(90deg, #d97706, #f59e0b)';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  } else if (color === 'red' || status === 'critical') {
    gradient = 'linear-gradient(90deg, #dc2626, #ef4444)';
    glowColor = 'rgba(239, 68, 68, 0.4)';
  } else if (color === 'emerald') {
    gradient = 'linear-gradient(90deg, #047857, #34d399)';
    glowColor = 'rgba(52, 211, 153, 0.4)';
  }

  return (
    <div style={{ width: '100%', marginBottom: '10px' }}>
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
            <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{label}</span>
          )}
          {showValue && (
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 600,
                color: '#f8fafc',
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
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
            boxShadow: `0 0 10px ${glowColor}`,
            transition: 'width 0.4s ease, background 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
