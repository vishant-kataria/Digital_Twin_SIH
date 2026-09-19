import React from 'react';

export default function CircularGauge({
  value = 0,
  max = 100,
  size = 140,
  strokeWidth = 10,
  label = 'Overall Health',
  sublabel,
  unit = '%',
  color = 'cyan', // 'cyan' | 'green' | 'amber' | 'red'
  showStatusDot = true,
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#38bdf8';
  let glowColor = 'rgba(56, 189, 248, 0.4)';

  if (percentage >= 85 || color === 'green') {
    strokeColor = '#10b981';
    glowColor = 'rgba(16, 185, 129, 0.4)';
  } else if (percentage >= 60 || color === 'amber') {
    strokeColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  } else {
    strokeColor = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.5)';
  }

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '10px',
        }}
      >
        <span
          style={{
            fontSize: size > 120 ? '1.8rem' : '1.3rem',
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1,
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {typeof value === 'number' ? value.toFixed(0) : value}
          <span style={{ fontSize: '0.9rem', color: strokeColor, marginLeft: '2px' }}>{unit}</span>
        </span>
        {label && (
          <span
            style={{
              fontSize: '0.68rem',
              color: '#94a3b8',
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            style={{
              fontSize: '0.62rem',
              color: strokeColor,
              marginTop: '2px',
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
