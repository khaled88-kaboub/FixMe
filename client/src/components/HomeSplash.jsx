import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/rmc.png';
import logoSecondaire from '../assets/FixMe.png'; // 👈 Remplacez par le chemin de votre deuxième logo

const HomeSplash = () => {
  const [step, setStep] = useState(1); // Étape 1 : Logo 1 (RMC), Étape 2 : Logo 2, Étape 3 : FadeOut global
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Après 4 secondes, on passe au deuxième logo (en douceur)
    const timerLogo2 = setTimeout(() => {
      setStep(2);
    }, 4000);

    // 2. Après 6 secondes, on déclenche le fondu de sortie (fade out)
    const timerFadeOut = setTimeout(() => {
      setFadeOut(true);
    }, 6000);

    // 3. Après 6.5 secondes, on redirige vers /login
    const redirectTimer = setTimeout(() => {
      navigate('/login');
    }, 6500);

    return () => {
      clearTimeout(timerLogo2);
      clearTimeout(timerFadeOut);
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
      {/* Conteneur central avec transition fluide entre les logos */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          animation: 'fadeInOutLogo 0.5s ease-in-out'
        }}
        key={step} // Force le re-rendu et l'animation lors du changement d'étape
      >
        {step === 1 ? (
          <img
            src={logo}
            alt="Logo RMC"
            style={{
              width: '480px',
              height: 'auto',
              animation: 'pulse 2s infinite ease-in-out',
            }}
          />
        ) : (
          <img
            src={logoSecondaire}
            alt="Deuxième Logo"
            style={{
              width: '400px', // Vous pouvez ajuster la taille si besoin
              height: 'auto',
              animation: 'scaleUp 2s ease-in-out forwards',
              borderRadius: '10%'
            }}
          />
        )}
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

        @keyframes scaleUp {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeInOutLogo {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default HomeSplash;