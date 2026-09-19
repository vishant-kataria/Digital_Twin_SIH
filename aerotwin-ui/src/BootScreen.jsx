import React, { useState } from 'react';
import { Shield, Lock, User, LogIn } from 'lucide-react';

export default function BootScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (username === '123456' && password === '123456') {
        onLogin();
      } else {
        setError('AUTHORISATION FAIL');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter", sans-serif'
    }}>
      
      {/* Clean Enterprise Defense Portal Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px'
      }}>
        
        {/* Branding Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            background: '#1E40AF', 
            borderRadius: '50%', 
            padding: '14px',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield color="#FFFFFF" size={30} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.35rem', color: '#0F172A', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 4px 0', fontWeight: 700 }}>
              DRDO AeroTwin
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#64748B', letterSpacing: '1px', fontWeight: 600 }}>
              SECURE UAV COMMAND PORTAL
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              padding: '10px',
              borderRadius: '6px',
              textAlign: 'center',
              fontSize: '0.82rem',
              letterSpacing: '0.5px',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {error}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <User size={18} color="#64748B" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Operator ID" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '12px 15px 12px 45px',
                color: '#0F172A',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#64748B" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" 
              placeholder="Passcode" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '12px 15px 12px 45px',
                color: '#0F172A',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              background: loading ? '#3B82F6' : '#1E40AF',
              border: 'none',
              borderRadius: '6px',
              color: '#FFFFFF',
              padding: '12px',
              fontSize: '0.92rem',
              fontWeight: '600',
              letterSpacing: '0.5px',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(30, 64, 175, 0.2)',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'AUTHENTICATING...' : (
              <>
                SECURE LOGIN <LogIn size={18} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
