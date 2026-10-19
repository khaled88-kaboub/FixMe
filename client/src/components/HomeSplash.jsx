import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/rmc.png';

const HomeSplash = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Déclenche le fondu (fade out) après 2 secondes
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 5000);

    // Redirige vers /login après la fin de la transition (2.5 secondes au total)
    const redirectTimer = setTimeout(() => {
      navigate('/login');
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      {/* Conteneur central pour le logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src={logo}
          alt="Logo RMC"
          style={{
            width: '480px',
            height: 'auto',
            animation: 'pulse 4.5s infinite ease-in-out',
          }}
        />
      </div>

      {/* Signature élégante fixée en bas */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          fontSize: '12px',
          fontWeight: 300,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#6b7280',
          fontFamily: 'sans-serif',
          opacity: 0.85,
        }}
      >
        Powered by <span style={{ fontWeight: 600, color: '#374151' }}>KABOUB Khaled</span> @2026
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 0.85;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomeSplash;