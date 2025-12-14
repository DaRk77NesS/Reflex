import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, Crosshair, Target as TargetIcon, Zap, Clock } from "lucide-react";

// --- SHARED COMPONENTS (Tactical Red) ---

// Particles: Tactical Crosshairs with Physics
const ParticleSystem = ({ color, count = 100 }) => {
    const containerRef = useRef(null);
    const particleRefs = useRef([]);
    const particlesData = useRef([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const icons = ['+', '⌖', '×', '∙'];

    useEffect(() => {
        // Initialize with Origin for Spring Physics
        particlesData.current = Array.from({ length: count }).map(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            return {
                x, y,
                originX: x,
                originY: y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 1,
                size: Math.random() * 20 + 15,
                icon: icons[Math.floor(Math.random() * icons.length)],
                opacity: Math.random() * 0.6 + 0.4
            };
        });

        // Mouse Tracker
        const handleMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMove);

        let raF;
        const animate = () => {
            const mouse = mouseRef.current;

            particlesData.current.forEach((p, i) => {
                const el = particleRefs.current[i];
                if (!el) return;

                // Physics
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotSpeed;

                // Spring Return to Origin (Floating effect)
                const returnForce = 0.005;
                p.vx += (p.originX - p.x) * returnForce;
                p.vy += (p.originY - p.y) * returnForce;

                // Mouse Interaction (Repulsion)
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const radius = 300; // Interaction radius

                if (dist < radius) {
                    const force = (radius - dist) / radius;
                    const angle = Math.atan2(dy, dx);
                    // Push away
                    p.vx += Math.cos(angle) * force * 0.5;
                    p.vy += Math.sin(angle) * force * 0.5;
                }

                // Friction
                p.vx *= 0.92;
                p.vy *= 0.92;

                el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
                el.style.fontSize = `${p.size}px`;
                el.style.opacity = p.opacity;
                el.innerText = p.icon;
            });
            raF = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMove);
            cancelAnimationFrame(raF);
        };
    }, [count]);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0 font-mono select-none">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    ref={el => particleRefs.current[i] = el}
                    className="absolute font-bold transition-colors duration-500"
                    style={{ color: color }}
                />
            ))}
        </div>
    );
};

const HyperspaceLines = ({ color, isActive }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none bg-black">
                    {/* Flash */}
                    <motion.div
                        className="absolute inset-0 bg-red-500"
                        initial={{ opacity: 0 }} animate={{ opacity: [0, 0.2, 0] }} transition={{ duration: 0.5 }}
                        style={{ mixBlendMode: 'screen' }}
                    />
                    {/* Horizontal Streaks - Dense and Red */}
                    {Array.from({ length: 60 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-red-500 rounded-full h-[3px]"
                            initial={{ x: '100vw', width: 100, opacity: 0 }}
                            animate={{ x: '-100vw', width: 800, opacity: [0, 1, 0] }}
                            transition={{ duration: Math.random() * 0.4 + 0.2, repeat: Infinity, delay: Math.random() * 0.2 }}
                            style={{ top: Math.random() * 100 + '%', boxShadow: `0 0 15px ${color}` }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
};

// --- AIM GAME LOGIC ---

const THEME_COLOR = '#ef4444'; // Crimson Red

const Cursor = () => {
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);

    useEffect(() => {
        const update = (e) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        window.addEventListener('mousemove', update);
        return () => window.removeEventListener('mousemove', update);
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 z-[100] pointer-events-none mix-blend-difference"
            style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        >
            <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute w-[1px] h-full bg-red-500 shadow-[0_0_2px_red]"></div>
                <div className="absolute w-full h-[1px] bg-red-500 shadow-[0_0_2px_red]"></div>
                <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_4px_white]"></div>
            </div>
        </motion.div>
    );
};

const AimTest = () => {
    const [gameState, setGameState] = useState('IDLE');
    const [timeMode, setTimeMode] = useState(60);
    const [timeLeft, setTimeLeft] = useState(60);
    const [targets, setTargets] = useState([]);
    const [score, setScore] = useState(0);
    const [clicks, setClicks] = useState(0);
    const [misses, setMisses] = useState(0);
    const [isWarping, setIsWarping] = useState(false);

    // Debris & Ripples
    const [debris, setDebris] = useState([]);
    const [ripples, setRipples] = useState([]);

    const playAreaRef = useRef(null);
    const requestRef = useRef();
    const lastTimeRef = useRef();
    const targetIdCounter = useRef(0);

    // Spawn Logic
    const spawnTarget = (currentTargets) => {
        let attempts = 0;
        let x, y, size;
        let isValid = false;

        while (!isValid && attempts < 20) {
            size = 50;

            x = 8 + Math.random() * 84;
            y = 8 + Math.random() * 84;

            isValid = true;
            for (let t of currentTargets) {
                // Approximate collision check for spawn placement (keep using percent approximation for spacing)
                const dx = t.x - x;
                const dy = t.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 15) {
                    isValid = false;
                    break;
                }
            }
            attempts++;
        }

        const id = targetIdCounter.current++;
        return { id, x, y, size: 50 };
    };

    // Initialize Targets
    useEffect(() => {
        if (gameState === 'RUNNING') {
            const initialTargets = [];
            for (let i = 0; i < 3; i++) {
                initialTargets.push(spawnTarget(initialTargets));
            }
            setTargets(initialTargets);
        }
    }, [gameState]);

    // Timer Loop
    useEffect(() => {
        if (gameState !== 'RUNNING') {
            lastTimeRef.current = null;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const animate = (time) => {
            if (lastTimeRef.current != undefined) {
                const deltaTime = (time - lastTimeRef.current) / 1000;
                setTimeLeft(prev => {
                    const newTime = Math.max(0, prev - deltaTime);
                    if (newTime <= 0) {
                        setGameState('FINISHED');
                        return 0;
                    }
                    return newTime;
                });
            }
            lastTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState]);


    const handleStart = (e) => {
        if (e) e.stopPropagation();
        setGameState('RUNNING');
        setScore(0);
        setClicks(0);
        setMisses(0);
        setTimeLeft(timeMode);
        setTargets([]);
        setDebris([]);
        setRipples([]);
    };

    const handleModeChange = (mode) => {
        if (gameState === 'RUNNING') return;
        setTimeMode(mode);
        setTimeLeft(mode);
    };

    // PRECISE TARGET CLICK HANDLER
    // Uses getBoundingClientRect to ensure we know EXACTLY where the circular target is on screen,
    // unrelated to CSS transform/offset logic.
    const handlePreciseTargetClick = (e, id) => {
        if (gameState !== 'RUNNING') return;

        // 1. Get exact position of the target element
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 2. Calculate distance from mouse to center
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        const radius = rect.width / 2;

        // 3. Strict Circular Check
        if (dist <= radius) {
            // HIT!
            e.stopPropagation(); // Stop bubbling, so it doesn't count as a background click
            handleHit(e, id);
        } else {
            // Corner Click (MISS)
            // Do NOT stop propagation. Let it bubble to the container 'handleBackgroundClick'
            // This ensures clicking the square corner registers as a miss.
        }
    };

    const handleHit = (e, id) => {
        // Visual Debris
        const newDebris = Array.from({ length: 8 }).map((_, i) => ({
            id: Math.random(),
            x: e.clientX,
            y: e.clientY,
            rotation: Math.random() * 360,
            velocity: { x: (Math.random() - 0.5) * 150, y: (Math.random() - 0.5) * 150 },
            color: i % 2 === 0 ? '#ef4444' : '#ffffff'
        }));
        setDebris(prev => [...prev, ...newDebris]);
        setTimeout(() => setDebris(prev => prev.filter(d => !newDebris.includes(d))), 600);

        setScore(s => s + 1);
        setClicks(c => c + 1);

        setTargets(prev => {
            const temp = prev.filter(t => t.id !== id);
            while (temp.length < 3) {
                temp.push(spawnTarget(temp));
            }
            return temp;
        });
    };

    const handleBackgroundClick = (e) => {
        if (gameState !== 'RUNNING') return;
        setMisses(m => m + 1);
        setClicks(c => c + 1);

        const rect = playAreaRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Ripple using relative coords
        const newRipple = { id: Math.random(), x, y };
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 500);

        // Flash Border
        const area = document.getElementById('play-area');
        if (area) {
            area.animate([
                { borderColor: 'rgb(239 68 68)', boxShadow: '0 0 0 rgba(239, 68, 68, 0)' },
                { borderColor: 'rgb(255 255 255)', boxShadow: 'inset 0 0 50px rgba(239, 68, 68, 0.5)' },
                { borderColor: 'rgb(239 68 68)', boxShadow: '0 0 0 rgba(239, 68, 68, 0)' }
            ], { duration: 100 });
        }
    };


    const handleBack = (e) => {
        e.preventDefault();
        setIsWarping(true);
        setTimeout(() => window.location.href = 'index.html', 2000);
    };

    const accuracy = clicks > 0 ? Math.round(((clicks - misses) / clicks) * 100) : 100;

    return (
        <div className="relative w-screen h-screen overflow-hidden text-white flex flex-col items-center justify-center bg-black font-mono select-none cursor-none">
            <MobileGuard />
            {/* GLOBAL CURSOR COMPONENT - Only one instance */}
            <Cursor />

            <HyperspaceLines color={THEME_COLOR} isActive={isWarping} />

            <motion.div
                className="absolute inset-0 z-0"
                style={{ background: `radial-gradient(circle at center, ${THEME_COLOR}10 0%, #000000 100%)` }}
            />

            <ParticleSystem color={THEME_COLOR} count={100} />

            {/* Debris Layer */}
            {debris.map(d => (
                <motion.div
                    key={d.id}
                    className="fixed w-2 h-2 rounded-sm z-50 pointer-events-none"
                    style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}` }}
                    initial={{ x: d.x, y: d.y, opacity: 1, scale: 1 }}
                    animate={{ x: d.x + d.velocity.x, y: d.y + d.velocity.y, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            ))}

            {/* HUD: Back */}
            <motion.a
                href="index.html"
                onClick={handleBack}
                className="absolute top-8 left-8 z-30 glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors cursor-none group"
                animate={{ opacity: isWarping ? 0 : 1 }}
                style={{ borderColor: `${THEME_COLOR}40` }}
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" color={THEME_COLOR} />
                <span className="text-sm font-bold tracking-widest" style={{ color: THEME_COLOR }}>ABORT</span>
            </motion.a>

            {/* HUD: Time Mode Selector */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
                {[15, 30, 60].map(mode => (
                    <button
                        key={mode}
                        onClick={() => handleModeChange(mode)}
                        className={`w-12 h-12 rounded flex items-center justify-center text-xs font-bold transition-all duration-300 relative group cursor-none ${timeMode === mode
                            ? 'bg-red-600 text-black shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110'
                            : 'glass text-gray-400 hover:text-white hover:border-red-500/50'
                            }`}
                        disabled={gameState === 'RUNNING'}
                    >
                        {mode}s
                    </button>
                ))}
            </div>

            {/* HUD: Stats */}
            <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-30 flex gap-8 md:gap-12 bg-black/60 backdrop-blur-md px-8 py-2 md:py-3 rounded-full border border-red-900/50 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div>
                    <div className="text-[8px] md:text-[10px] text-red-500 uppercase tracking-widest opacity-70">Remaining</div>
                    <div className="text-xl md:text-2xl font-bold font-orbitron tabular-nums text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">{timeLeft.toFixed(1)}s</div>
                </div>
                <div>
                    <div className="text-[8px] md:text-[10px] text-red-500 uppercase tracking-widest opacity-70">Score</div>
                    <div className="text-xl md:text-2xl font-black font-orbitron text-red-500">{score}</div>
                </div>
                <div>
                    <div className="text-[8px] md:text-[10px] text-red-500 uppercase tracking-widest opacity-70">Accuracy</div>
                    <div className="text-xl md:text-2xl font-bold font-orbitron" style={{ color: accuracy > 90 ? '#4ade80' : accuracy > 70 ? '#facc15' : '#ef4444' }}>{accuracy}%</div>
                </div>
            </div>

            {/* GAME PLAY AREA */}
            <AnimatePresence>
                {!isWarping && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative z-10 mt-16 md:mt-0"
                    >
                        <div
                            id="play-area"
                            className="relative w-[90vw] h-[60vh] max-w-[800px] max-h-[600px] bg-black/20 backdrop-blur-[2px] border border-red-500/30 rounded-lg overflow-hidden cursor-none shadow-[0_0_50px_rgba(239,68,68,0.05)]"
                            onMouseDown={handleBackgroundClick} /* Default: Miss */
                            ref={playAreaRef}
                        >
                            {/* Grid pulsing background */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{
                                    backgroundImage: `linear-gradient(${THEME_COLOR} 1px, transparent 1px), linear-gradient(90deg, ${THEME_COLOR} 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-red-500/10"
                                    animate={{ opacity: [0, 0.2, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                />
                            </div>

                            {/* Ripples on Miss */}
                            {ripples.map(r => (
                                <motion.div
                                    key={r.id}
                                    className="absolute rounded-full border border-red-500/50 pointer-events-none"
                                    style={{ left: r.x, top: r.y, width: 20, height: 20, x: '-50%', y: '-50%' }}
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: 4, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                />
                            ))}

                            {/* Targets - Precise Click Handling */}
                            <AnimatePresence>
                                {targets.map(t => (
                                    <motion.div
                                        key={t.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 1.5, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-none group" // pointer-events-auto by default
                                        style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.size, height: t.size }}
                                        onMouseDown={(e) => handlePreciseTargetClick(e, t.id)}
                                    >
                                        {/* Target Visuals */}
                                        <div className="w-full h-full rounded-full border-2 border-red-500 bg-red-500/20 flex items-center justify-center relative shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                                            <div className="w-[30%] h-[30%] bg-white rounded-full shadow-[0_0_10px_white]" />
                                            <div className="absolute w-[140%] h-[140%] border border-red-500/30 rounded-full animate-ping opacity-20" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Start Overlay - Needs stopPropagation */}
                            {gameState === 'IDLE' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20" onMouseDown={(e) => e.stopPropagation()}>
                                    <motion.button
                                        onClick={handleStart}
                                        whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${THEME_COLOR}` }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-red-600 text-white font-black text-xl tracking-[0.2em] rounded border border-red-400 cursor-none"
                                    >
                                        CLICK TO ENGAGE
                                    </motion.button>
                                </div>
                            )}

                            {/* Result Overlay */}
                            {gameState === 'FINISHED' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20" onMouseDown={(e) => e.stopPropagation()}>
                                    <div className="text-center">
                                        <div className="text-xs text-red-500 font-bold tracking-[0.3em] uppercase mb-4">Mission Debrief</div>

                                        <div className="flex items-center justify-center gap-12 mb-8">
                                            <div className="text-center">
                                                <div className="text-6xl font-black font-orbitron text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">{score}</div>
                                                <div className="text-xs text-gray-500 uppercase mt-1">Confirmed Kills</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-6xl font-black font-orbitron" style={{ color: accuracy > 80 ? '#4ade80' : '#ef4444' }}>{accuracy}%</div>
                                                <div className="text-xs text-gray-500 uppercase mt-1">Accuracy</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-8 mb-10 text-center border-t border-white/10 pt-6">
                                            <div>
                                                <div className="text-2xl font-bold text-white">{clicks}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total Shots</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-red-500">{misses}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Misses</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-500">{score}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Hits</div>
                                            </div>
                                        </div>

                                        <motion.button
                                            onClick={handleStart}
                                            whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-3 bg-red-700 text-white font-bold rounded tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-none"
                                        >
                                            RETRY MISSION
                                        </motion.button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<AimTest />);
