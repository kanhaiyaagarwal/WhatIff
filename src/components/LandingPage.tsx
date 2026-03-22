import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion } from 'motion/react';

const SIPCalculator = lazy(() => import('./calculators/SIPCalculator'));

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (screen: any) => void;
}

export default function LandingPage({ onStart, onNavigate }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Animation objects
    const coins = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 20,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: ['#10b981', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 3)]
    }));

    const shapes = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 15 + Math.random() * 25,
      type: ['triangle', 'square', 'hexagon'][Math.floor(Math.random() * 3)],
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
    }));

    const orbs = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3, color: '#10b981', size: 300 },
      { x: canvas.width * 0.8, y: canvas.height * 0.7, color: '#8b5cf6', size: 350 },
      { x: canvas.width * 0.5, y: canvas.height * 0.5, color: '#06b6d4', size: 250 }
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Orbs
      orbs.forEach(orb => {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size);
        gradient.addColorStop(0, orb.color + '15'); // Very low opacity
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw Graph Line
      ctx.beginPath();
      ctx.strokeStyle = '#10b98120';
      ctx.lineWidth = 2;
      ctx.moveTo(0, canvas.height * 0.8);
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.lineTo(i, canvas.height * (0.8 - (i / canvas.width) * 0.5 + Math.sin(i * 0.01) * 0.05));
      }
      ctx.stroke();

      // Draw Coins
      coins.forEach(coin => {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);
        ctx.strokeStyle = coin.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = `${coin.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = coin.color;
        ctx.fillText('₹', 0, 0);
        ctx.restore();

        coin.x = (coin.x + coin.vx + canvas.width) % canvas.width;
        coin.y = (coin.y + coin.vy + canvas.height) % canvas.height;
        coin.rotation += coin.rotationSpeed;
      });

      // Draw Shapes
      shapes.forEach(shape => {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (shape.type === 'triangle') {
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size, shape.size);
          ctx.lineTo(-shape.size, shape.size);
          ctx.closePath();
        } else if (shape.type === 'square') {
          ctx.rect(-shape.size/2, -shape.size/2, shape.size, shape.size);
        } else {
          for (let i = 0; i < 6; i++) {
            ctx.lineTo(shape.size * Math.cos(i * Math.PI / 3), shape.size * Math.sin(i * Math.PI / 3));
          }
          ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();

        shape.x = (shape.x + shape.vx + canvas.width) % canvas.width;
        shape.y = (shape.y + shape.vy + canvas.height) % canvas.height;
        shape.rotation += shape.rotationSpeed;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const [sipValues, setSipValues] = useState({ monthlyInvestment: 5000, annualRate: 12, years: 10, stepUp: 0 });

  const handleFullBreakdown = () => {
    localStorage.setItem('sipPreFill', JSON.stringify({
      monthlyInvestment: sipValues.monthlyInvestment,
      expectedReturn: sipValues.annualRate,
      timePeriod: sipValues.years,
      stepUp: sipValues.stepUp ?? 0,
      source: 'landing'
    }));
    onNavigate('sip');
  };

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] as any }
  };

  return (
    <div style={{ background: '#09090b', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.4s ease',
        background: scrolled ? 'rgba(9,9,11,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none'
      }}>
        <div style={{ color: '#10b981', fontWeight: 900, fontSize: '20px' }}>WhatIff</div>
        <button 
          onClick={onStart}
          style={{
            background: '#10b981',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Open App
        </button>
      </header>

      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px'
      }}>
        <canvas 
          ref={canvasRef} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} 
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'radial-gradient(circle at center, rgba(9,9,11,0.3) 0%, rgba(9,9,11,0.85) 100%)',
          zIndex: 1 
        }} />
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '99px',
            padding: '4px 12px',
            color: '#52525b',
            fontSize: '10px',
            letterSpacing: '0.12em',
            fontWeight: 700,
            marginBottom: '24px'
          }}>
            NO LOGIN · NO SIGN UP · NO BS
          </motion.div>

          <motion.h1 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} style={{
            fontSize: 'clamp(24px, 4.5vw, 44px)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            minHeight: '2.2em'
          }}>
            Every finance calculator is either behind a paywall, full of ads, built in 2009, or <span style={{
              background: 'linear-gradient(90deg, #10b981, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>not intelligent</span>.
          </motion.h1>

          <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 800,
            marginBottom: '16px'
          }}>
            WhatIff fixes that.
          </motion.h2>

          <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }} style={{
            fontSize: '15px',
            color: '#71717a',
            marginBottom: '40px'
          }}>
            One place to run your numbers and actually understand them.
          </motion.p>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.5 }}>
            <button 
              onClick={onStart}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#000',
                border: 'none',
                borderRadius: '14px',
                padding: '16px 40px',
                fontWeight: 800,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(16,185,129,0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Start Calculating
            </button>
            <p style={{ color: '#3f3f46', fontSize: '12px', marginTop: '16px' }}>
              No login required. Your numbers stay on your device.
            </p>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ 
            position: 'absolute', 
            bottom: '40px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            color: '#3f3f46',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.1em'
          }}
        >
          ↓ SCROLL
        </motion.div>
      </section>

      {/* Live Calculator Section */}
      <section style={{ 
        padding: '40px 24px 40px', 
        background: 'linear-gradient(to bottom, #09090b, #0a140e, #09090b)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '680px', width: '100%', textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ color: '#52525b', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '8px' }}>LIVE DEMO</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, marginBottom: '12px' }}>Try it right now.</h2>
          <p style={{ color: '#52525b', fontSize: '14px' }}>No login. No sign up. See exactly what WhatIff does — live.</p>
        </div>

        <div style={{ 
          maxWidth: '680px', 
          width: '100%',
          background: 'rgba(16,185,129,0.04)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '20px',
          padding: '32px 28px',
          boxShadow: '0 0 40px rgba(16,185,129,0.08)',
          minHeight: '400px', // Add min-height to prevent layout shift
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          }>
            <SIPCalculator isEmbedded={true} onBack={() => {}} onValuesChange={setSipValues} />
          </Suspense>
          
          <button 
            onClick={handleFullBreakdown}
            style={{
              width: '100%',
              background: '#10b981',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontWeight: 800,
              fontSize: '14px',
              marginTop: '24px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(16,185,129,0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            See Full Breakdown →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '40px 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ color: '#52525b', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '8px' }}>THE DIFFERENCE</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800 }}>WhatIff is different.</h2>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '16px', 
          maxWidth: '1000px', 
          margin: '0 auto', 
          overflowX: 'auto', 
          padding: '20px 4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Card 1: Privacy */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.07)', 
            borderRadius: '20px', 
            padding: '28px 24px', 
            position: 'relative', 
            overflow: 'hidden',
            minWidth: '280px',
            flex: '1 0 0'
          }}>
            <div style={{ 
              position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', 
              background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)' 
            }} />
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Privacy</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '16px' }}>Your numbers never leave your device.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {["No Login", "No Account", "No Data Collection", "Free to Use"].map(p => (
                <span key={p} style={{ 
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', 
                  color: '#10b981', borderRadius: '99px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 
                }}>{p}</span>
              ))}
            </div>
          </div>

          {/* Card 2: Intelligence */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.07)', 
            borderRadius: '20px', 
            padding: '28px 24px', 
            position: 'relative', 
            overflow: 'hidden',
            minWidth: '280px',
            flex: '1 0 0'
          }}>
            <div style={{ 
              position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', 
              background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' 
            }} />
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🤖</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Intelligence</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '16px' }}>AI that explains what your numbers mean.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {["🤖 AI Insights", "📊 Export to Excel", "📲 Share Your Vision"].map(p => (
                <span key={p} style={{ 
                  background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', 
                  color: '#8b5cf6', borderRadius: '99px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 
                }}>{p}</span>
              ))}
            </div>
          </div>

          {/* Card 3: Action */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.07)', 
            borderRadius: '20px', 
            padding: '28px 24px', 
            position: 'relative', 
            overflow: 'hidden',
            minWidth: '280px',
            flex: '1 0 0'
          }}>
            <div style={{ 
              position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', 
              background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)' 
            }} />
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Action</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '16px' }}>From insight to action in one tap.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {["⚡ Compare Scenarios", "🏦 Execute Your Plan"].map(p => (
                <span key={p} style={{ 
                  background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', 
                  color: '#06b6d4', borderRadius: '99px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 
                }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{ 
        padding: '40px 24px 100px 24px', 
        textAlign: 'center', 
        position: 'relative',
        background: 'linear-gradient(to bottom, #09090b, #020d06, #09090b)'
      }}>
        <div style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '300px', height: '300px', background: 'rgba(16,185,129,0.1)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '40px' }}>
            <div>Your numbers.</div>
            <div style={{
              background: 'linear-gradient(90deg, #10b981, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Your decisions.</div>
          </div>

          <button 
            onClick={onStart}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#000',
              border: 'none',
              borderRadius: '14px',
              padding: '18px 48px',
              fontWeight: 800,
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(16,185,129,0.4)',
              transition: 'transform 0.2s',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Open WhatIff
          </button>
          <p style={{ color: '#3f3f46', fontSize: '13px' }}>No login required. Start in seconds.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        padding: '40px 24px', 
        textAlign: 'center' 
      }}>
        <div style={{ color: '#52525b', fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>WhatIff</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: '#3f3f46', fontSize: '12px', marginBottom: '16px' }}>
          <a 
            href="#privacy" 
            style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} 
            onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}
          >
            Privacy Policy
          </a>
          <span>·</span>
          <a 
            href="#terms" 
            style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} 
            onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}
          >
            Terms of Use
          </a>
        </div>
        <div style={{ marginTop: 12 }}>
          <a 
            href="mailto:hello.whatiff@gmail.com"
            style={{
              color: '#52525b',
              fontSize: 12,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = '#10b981'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = '#52525b'}
          >
            Contact: hello.whatiff@gmail.com
          </a>
        </div>
        <p style={{ color: '#27272a', fontSize: '11px', marginBottom: '8px' }}>© 2026 WhatIff. All rights reserved.</p>
        <p style={{ color: '#27272a', fontSize: '10px', maxWidth: '400px', margin: '0 auto' }}>
          All calculations are for educational purposes only. Not financial advice. Not SEBI registered.
        </p>
      </footer>
    </div>
  );
}
