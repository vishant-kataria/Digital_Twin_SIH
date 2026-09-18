import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Activity } from 'lucide-react';

export default function LiveTelemetryChart({ data }) {
  // `data` is an array of the last N telemetry points
  
  return (
    <div className="tactical-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity color="var(--accent-cyan)" size={20} />
        <h2 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Real-Time Engine Diagnostics
        </h2>
      </div>

      <div style={{ flex: 1, minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickFormatter={(val) => val.split(':').slice(1).join(':')} />
            <YAxis yAxisId="left" stroke="var(--accent-cyan)" fontSize={10} domain={['dataMin - 10', 'dataMax + 10']} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--accent-amber)" fontSize={10} domain={['dataMin - 50', 'dataMax + 50']} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(11, 14, 20, 0.9)', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: '"JetBrains Mono", monospace' }}
              itemStyle={{ fontSize: '0.8rem' }}
              labelStyle={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem', fontFamily: '"JetBrains Mono", monospace' }} />
            <Line yAxisId="left" type="monotone" dataKey="cht" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} isAnimationActive={false} name="CHT (°C)" />
            <Line yAxisId="right" type="monotone" dataKey="rpm" stroke="var(--accent-amber)" strokeWidth={2} dot={false} isAnimationActive={false} name="RPM" />
            <Line yAxisId="left" type="monotone" dataKey="egt" stroke="var(--accent-red)" strokeWidth={1} dot={false} isAnimationActive={false} name="EGT (°C)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
