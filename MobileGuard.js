import React, { useState, useEffect, useRef } from "react";
import { Zap, MousePointer2, Target, Terminal, Ban } from "lucide-react";

// --- THEME CONFIGURATION ---
const THEMES = [
    { color: '#ef4444', icon: Target },       // Aim (Red)
    { color: '#06b6d4', icon: MousePointer2 },// CPS (Blue)
    { color: '#eab308', icon: Zap },          // Reaction (Yellow)
    { color: '#22c55e', icon: Terminal }      // Typing (Green)
];

// --- MULTI-COLOR PARTICLE SYSTEM ---
const MultiParticleSystem = () => {
    const containerRef = useRef(null);
    const particleRefs = useRef([]);
    const particlesData = useRef([]);

    useEffect(() => {
        // Initialize particles with mixed themes
        particlesData.current = Array.from({ length: 60 }).map(() => {
            const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;

            return {
                x, y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 20 + 10,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 2,
                theme: theme
            };
        });

        let raF;
        const animate = () => {
            particlesData.current.forEach((p, i) => {
                const el = particleRefs.current[i];
                if (!el) return;

                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotSpeed;

                // Wrap edges
                if (p.x < -50) p.x = window.innerWidth + 50;
                if (p.x > window.innerWidth + 50) p.x = -50;
                if (p.y < -50) p.y = window.innerHeight + 50;
                if (p.y > window.innerHeight + 50) p.y = -50;

                el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
            });
            raF = requestAnimationFrame(animate);
        };
        animate();

        return () => cancelAnimationFrame(raF);
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particlesData.current.map((p, i) => {
                const Icon = p?.theme?.icon || Ban;
                const color = p?.theme?.color || '#fff';
                return (
                    <div
                        key={i}
                        ref={el => particleRefs.current[i] = el}
                        className="absolute opacity-40"
                        style={{ color: color }}
                    >
                        <Icon size={24} />
                    </div>
                );
            })}
            {/* Initial Render Placeholder since Ref is empty on first pass */}
            {Array.from({ length: 60 }).map((_, i) => {
                const theme = THEMES[i % THEMES.length];
                return (
                    <div
                        key={`placeholder-${i}`}
                        ref={el => particleRefs.current[i] = el} // This actually binds the ref for the animate loop
                        className="absolute opacity-40 transition-colors"
                        style={{ color: theme.color }}
                    >
                        <theme.icon size={24} />
                    </div>
                )
            })}
        </div>
    );
};

// --- MAIN GUARD COMPONENT ---
const MobileGuard = () => {
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            // Screen Width < 1024px ( Tablets/Mobiles )
            const isSmallScreen = window.innerWidth < 1024;

            // UA Check (Optional backup, but width is usually enough for layout)
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            setIsBlocked(isSmallScreen || isMobileUA);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    if (!isBlocked) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-8 text-white select-none touch-none overscroll-none font-mono">
            {/* Background Particles Check */}
            <MultiParticleSystem />

            <div className="relative z-10 glass p-10 rounded-3xl border border-red-500/20 bg-black/80 backdrop-blur-xl max-w-lg text-center shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse">
                        <Ban size={32} className="text-red-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-black mb-4 tracking-[0.2em] text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] font-orbitron">
                    SYSTEM LOCKOUT
                </h1>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900 to-transparent my-6" />

                <p className="text-gray-400 text-sm leading-7 tracking-wide font-bold">
                    MOBILE ARCHITECTURE DETECTED.
                    <br />
                    ACCESS IS RESTRICTED TO DESKTOP TERMINALS.
                </p>

                <div className="mt-8 text-xs text-gray-600 uppercase tracking-widest border border-gray-800 px-4 py-2 rounded inline-block">
                    Target Resolution: 1024px+
                </div>
            </div>

            <div className="absolute bottom-8 text-[10px] text-gray-700 font-mono tracking-[0.5em] animate-pulse">
                SECURE CONNECTION REQUIRED
            </div>
        </div>
    );
};

window.MobileGuard = MobileGuard;
