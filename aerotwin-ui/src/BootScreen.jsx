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
      /* Professional Blue/Black Stripes Background */
      background: 'repeating-linear-gradient(-45deg, #050810, #050810 40px, #0a1224 40px, #0a1224 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter", sans-serif'
    }}>
      
      {/* Clean Corporate Login Card */}
      <div style={{
        background: 'rgba(11, 14, 20, 0.95)',
        border: '1px solid rgba(0, 100, 255, 0.2)',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        
        {/* Branding Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #0033cc 0%, #0099ff 100%)', 
            borderRadius: '50%', 
            padding: '14px',
            boxShadow: '0 0 20px rgba(0, 100, 255, 0.4)'
          }}>
            <Shield color="#fff" size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.4rem', color: '#ffffff', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 5px 0' }}>
              DRDO AeroTwin
            </h1>
            <div style={{ fontSize: '0.75rem', color: '#8b9bb4', letterSpacing: '1px' }}>
              SECURE UAV COMMAND PORTAL
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div style={{
              background: 'rgba(255, 0, 51, 0.1)',
              border: '1px solid #ff0033',
              color: '#ff0033',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {error}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <User size={18} color="#8b9bb4" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Operator ID" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                background: '#050810',
                border: '1px solid #1f2937',
                borderRadius: '4px',
                padding: '12px 15px 12px 45px',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0099ff'}
              onBlur={(e) => e.target.style.borderColor = '#1f2937'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#8b9bb4" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" 
              placeholder="Passcode" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: '#050810',
                border: '1px solid #1f2937',
                borderRadius: '4px',
                padding: '12px 15px 12px 45px',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0099ff'}
              onBlur={(e) => e.target.style.borderColor = '#1f2937'}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              background: loading ? '#0033cc' : 'linear-gradient(90deg, #0044ff 0%, #0088ff 100%)',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              letterSpacing: '1px',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(0, 100, 255, 0.3)',
              transition: 'background 0.3s'
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
