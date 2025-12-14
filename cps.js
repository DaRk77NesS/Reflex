import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, Zap, MousePointer2 } from "lucide-react";

// --- SHARED COMPONENTS ---

// Physics-based Particle System
const ParticleSystem = ({ icon: Icon, color, count = 60 }) => {
    const containerRef = useRef(null);
    const particleRefs = useRef([]);
    const particlesData = useRef([]);

    useEffect(() => {
        // Initialize particles
        particlesData.current = Array.from({ length: count }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 20 + 10,
            rotation: Math.random() * 360,
            vRotation: (Math.random() - 0.5) * 2
        }));

        let animationFrameId;

        const animate = () => {
            particlesData.current.forEach((p, i) => {
                const el = particleRefs.current[i];
                if (!el) return;

                // Move
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.vRotation;

                // Wrap around screen
                if (p.x < -50) p.x = window.innerWidth + 50;
                if (p.x > window.innerWidth + 50) p.x = -50;
                if (p.y < -50) p.y = window.innerHeight + 50;
                if (p.y > window.innerHeight + 50) p.y = -50;

                // Mouse repulsion (simple version)
                // Assuming mouse position is tracked globally or passed down (skipping heavy logic here for perf)

                el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [count]);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    ref={el => particleRefs.current[i] = el}
                    className="absolute opacity-30 transition-colors duration-500"
                    style={{ color: color }}
                >
                    <Icon size={24} />
                </div>
            ))}
        </div>
    );
};

// Custom Mouse Trail Component
const MouseGlow = ({ color }) => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 400 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };
        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-screen"
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: '-50%',
                translateY: '-50%'
            }}
        >
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-90 blur-[2px]" />
            <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-xl" style={{ background: color }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl" style={{ background: color }} />
        </motion.div>
    );
};

// Hyperspace Effect Component (Reverse L->R for "Back")
const HyperspaceLines = ({ color, isActive }) => {
    // Data Stream Effect: Horizontal lines accelerating R -> L (Reverse)
    const lines = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100 + '%',
        delay: Math.random() * 0.5,
        duration: Math.random() * 0.5 + 0.3,
        height: Math.random() * 2 + 1,
    }));

    return (
        <AnimatePresence>
            {isActive && (
                <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none bg-black">
                    {/* Central Flash to mask transition */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 z-20"
                        style={{ background: color, mixBlendMode: 'screen' }}
                    />

                    {/* Horizontal Data Streams (Reversed R -> L) */}
                    {lines.map((line) => (
                        <motion.div
                            key={line.id}
                            className="absolute bg-white rounded-full"
                            initial={{
                                x: '200vw',
                                width: '100px',
                                opacity: 0
                            }}
                            animate={{
                                x: '-100vw',
                                width: ['100px', '500px', '200px'],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: line.duration,
                                repeat: Infinity,
                                ease: "easeIn",
                                delay: line.delay
                            }}
                            style={{
                                top: line.top,
                                height: line.height,
                                boxShadow: `0 0 ${line.height * 2}px ${color}, 0 0 ${line.height}px white`
                            }}
                        />
                    ))}

                    {/* Tunnel Vignette */}
                    <motion.div
                        className="absolute inset-0 z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: `radial-gradient(circle, transparent 40%, black 100%)`
                        }}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

// --- CPS GAME LOGIC ---

const THEME_COLOR = '#00f0ff'; // Electric Cyber Blue

const CPSTest = () => {
    const [gameState, setGameState] = useState('IDLE'); // IDLE, COUNTDOWN, RUNNING, FINISHED
    const [timeMode, setTimeMode] = useState(5); // 1, 5, 10
    const [timeLeft, setTimeLeft] = useState(5);
    const [countDown, setCountDown] = useState(3); // 3, 2, 1
    const [clicks, setClicks] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [isWarping, setIsWarping] = useState(false);
    const [ripples, setRipples] = useState([]);

    // Timer Refs
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const countdownIntervalRef = useRef();
    const gameStateRef = useRef('IDLE'); // Ref to track state in loops

    // Sync Ref with State
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // Reset Game (Accepts optional explicit mode to avoid stale state)
    const resetGame = (explicitMode = null) => {
        setGameState('IDLE');
        setClicks(0);
        const modeToSet = explicitMode || timeMode; // Use explicit if provided
        setTimeLeft(modeToSet);
        setCountDown(3);
        setRipples([]);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    // Change Mode
    const handleModeChange = (mode) => {
        setTimeMode(mode);
        // Pass explicit mode to resetGame to ensure it uses the new value immediately
        resetGame(mode);
    };

    // Start Countdown
    const startCountdown = () => {
        setGameState('COUNTDOWN');
        setCountDown(3);

        countdownIntervalRef.current = setInterval(() => {
            setCountDown(prev => {
                const next = prev - 1;
                if (next < 1) { // Stop when reaching 0 (virtually)
                    clearInterval(countdownIntervalRef.current);
                    startGame();
                    return 0;
                }
                return next;
            });
        }, 1000);
    };

    // Start Game (After Countdown)
    const startGame = () => {
        setGameState('RUNNING');
        // We do NOT set clicks to 0 here because we want to capture the click that triggered it? 
        // No, user waits for countdown. Clicks starts at 0.
        // But logic is: Click Tile -> Start Countdown -> Wait -> Go -> Click.

        setStartTime(performance.now());
        previousTimeRef.current = performance.now();

        // Start Loop
        requestRef.current = requestAnimationFrame(animateTimer);
    };

    // Handle Click
    const handleInteraction = (e) => {
        if (isWarping) return;
        if (gameState === 'FINISHED' || gameState === 'COUNTDOWN') return; // No clicking during countdown/finished

        // Visual Feedback (Ripple) - Allow ripples in IDLE too for fun
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { id: Date.now(), x, y };
        setRipples(prev => [...prev.slice(-10), newRipple]);

        // Start Logic
        if (gameState === 'IDLE') {
            startCountdown();
        } else if (gameState === 'RUNNING') {
            setClicks(prev => prev + 1);
        }
    };

    // Timer Loop
    const animateTimer = (time) => {
        if (gameStateRef.current !== 'RUNNING') return; // Stop if not running

        if (previousTimeRef.current !== undefined) {
            const deltaTime = (time - previousTimeRef.current) / 1000;

            setTimeLeft(prev => {
                const newTime = prev - deltaTime;
                if (newTime <= 0) {
                    setGameState('FINISHED'); // This triggers ref update via effect
                    return 0;
                }
                return newTime;
            });
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animateTimer);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
            clearInterval(countdownIntervalRef.current);
        };
    }, []);

    // Handle Back Button with Warp
    const handleBack = (e) => {
        e.preventDefault();
        setIsWarping(true);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    };

    // Calculate CPS
    const currentCPS = clicks > 0 && timeMode - timeLeft > 0
        ? (clicks / (timeMode - timeLeft)).toFixed(1)
        : "0.0";

    const finalCPS = (clicks / timeMode).toFixed(2);

    return (
        <div className="relative w-screen h-screen overflow-hidden text-white flex items-center justify-center bg-black font-rajdhani selection:bg-cyan-500/30">
            <MobileGuard />

            {/* Hyperspace Lines - Reverse for Back */}
            <HyperspaceLines color={THEME_COLOR} isActive={isWarping} />

            {/* Mouse Glow Effect */}
            <MouseGlow color={THEME_COLOR} />

            {/* Particle System */}
            <ParticleSystem icon={MousePointer2} color={THEME_COLOR} count={60} />

            {/* Background Gradient */}
            <motion.div
                className="absolute inset-0 z-0"
                animate={{
                    background: `radial-gradient(circle at center, ${THEME_COLOR}15 0%, #000000 90%)`
                }}
                transition={{ duration: 0.8 }}
            />

            {/* Overlay Transition (Simulate enter from black hole) */}
            <AnimatePresence>
                {!isWarping && (
                    <motion.div
                        className="absolute inset-0 bg-black z-50 pointer-events-none"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                )}
            </AnimatePresence>

            {/* HUD: Back Button */}
            <motion.a
                href="index.html"
                onClick={handleBack}
                className="absolute top-8 left-8 z-30 glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
                animate={{ opacity: isWarping ? 0 : 1 }}
            >
                <ArrowLeft size={20} />
                <span className="text-sm font-mono">BACK</span>
            </motion.a>

            {/* HUD: Time/Score Display */}
            <div className="absolute top-8 right-8 z-30 glass px-6 py-3 rounded-lg flex flex-col items-end">
                <div className="text-xs font-mono text-gray-400 tracking-widest">CPS</div>
                <div className="text-3xl font-black font-mono" style={{ color: THEME_COLOR }}>
                    {gameState === 'FINISHED' ? finalCPS : currentCPS}
                </div>
            </div>

            {/* CONTROLS & GAME AREA */}
            <AnimatePresence>
                {!isWarping && (
                    <motion.div
                        className="relative z-10 w-full h-full flex items-center justify-center" // Full screen container for perfect centering
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    >

                        {/* Control Panel (Absolute Left) */}
                        <div className="absolute left-8 md:left-24 top-1/2 -translate-y-1/2 flex flex-col gap-4 glass p-4 rounded-2xl z-20">
                            {[1, 5, 10].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => handleModeChange(mode)}
                                    className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl transition-all duration-300 ${timeMode === mode ? 'bg-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.4)] border-cyan-400' : 'hover:bg-white/5 border-transparent'}`}
                                    style={{
                                        color: timeMode === mode ? THEME_COLOR : '#6B7280',
                                        borderWidth: '1px'
                                    }}
                                >
                                    {mode}s
                                </button>
                            ))}
                        </div>

                        {/* Interaction Tile */}
                        <div className="relative">

                            {/* Timer Header causing tile look - Refined */}
                            <div className="absolute -top-32 left-1/2 -translate-x-1/2">
                                <motion.div
                                    className="glass px-6 py-2 rounded-xl border border-white/10 shadow-lg min-w-[160px] text-center"
                                    animate={{
                                        borderColor: `hsl(${timeLeft / timeMode * 120}, 100%, 50%)`,
                                        boxShadow: `0 0 15px hsl(${timeLeft / timeMode * 120}, 100%, 20%)`
                                    }}
                                >
                                    <div className="text-[10px] uppercase tracking-[0.3em] mb-1 opacity-70 font-sans">Time Left</div>
                                    <span
                                        className="font-orbitron text-4xl font-black tracking-widest tabular-nums"
                                        style={{
                                            // HSL Transition: 120 (Green) -> 0 (Red)
                                            color: `hsl(${timeLeft / timeMode * 120}, 100%, 60%)`,
                                            textShadow: `0 0 15px hsl(${timeLeft / timeMode * 120}, 100%, 50%)`
                                        }}
                                    >
                                        {timeLeft.toFixed(2)}s
                                    </span>
                                </motion.div>
                            </div>

                            <motion.div
                                className="relative w-[80vw] md:w-96 h-96 glass rounded-3xl flex flex-col items-center justify-center cursor-pointer select-none border border-white/10 overflow-hidden"
                                onMouseDown={handleInteraction}
                                animate={{
                                    borderColor: gameState === 'RUNNING' ? THEME_COLOR : 'rgba(255,255,255,0.1)',
                                    boxShadow: gameState === 'RUNNING'
                                        ? `0 0 ${Math.min(clicks * 2, 60)}px ${THEME_COLOR}40` // Dynamic Glow
                                        : '0 0 0px transparent'
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Ripple Effects */}
                                <AnimatePresence>
                                    {ripples.map(ripple => (
                                        <motion.div
                                            key={ripple.id}
                                            initial={{ scale: 0, opacity: 0.8 }}
                                            animate={{ scale: 4, opacity: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.6 }}
                                            className="absolute rounded-full pointer-events-none"
                                            style={{
                                                left: ripple.x,
                                                top: ripple.y,
                                                width: '50px',
                                                height: '50px',
                                                background: THEME_COLOR,
                                                translateX: '-50%',
                                                translateY: '-50%'
                                            }}
                                        />
                                    ))}
                                </AnimatePresence>

                                {/* Main Text / Content */}
                                <AnimatePresence mode="wait">

                                    {/* IDLE */}
                                    {gameState === 'IDLE' && (
                                        <motion.h1
                                            key="idle"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="text-4xl font-black font-orbitron text-center px-4 leading-tight pointer-events-none"
                                        >
                                            CLICK TO<br /><span style={{ color: THEME_COLOR }}>START</span>
                                        </motion.h1>
                                    )}

                                    {/* COUNTDOWN */}
                                    {gameState === 'COUNTDOWN' && (
                                        <motion.div
                                            key="countdown"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 2, opacity: 0 }}
                                            className="text-8xl font-black font-mono pointer-events-none"
                                            style={{ color: THEME_COLOR }}
                                        >
                                            {countDown === 0 ? "GO!" : countDown}
                                        </motion.div>
                                    )}

                                    {/* RUNNING */}
                                    {gameState === 'RUNNING' && (
                                        <motion.div
                                            key="running"
                                            className="text-8xl font-black font-mono pointer-events-none select-none"
                                        >
                                            {clicks}
                                        </motion.div>
                                    )}

                                    {/* FINISHED */}
                                    {gameState === 'FINISHED' && (
                                        <motion.div
                                            key="finished"
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center gap-2 z-20 pointer-events-auto"
                                        >
                                            <div className="text-lg text-gray-400 font-bold uppercase tracking-widest">CPS Score</div>
                                            <div className="text-7xl font-black font-orbitron" style={{ color: THEME_COLOR, textShadow: `0 0 30px ${THEME_COLOR}` }}>
                                                {finalCPS}
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <div className="text-sm font-mono text-white/50 bg-white/5 px-3 py-1 rounded">
                                                    CLICKS: <span className="text-white font-bold">{clicks}</span>
                                                </div>
                                                <div className="text-sm font-mono text-white/50 bg-white/5 px-3 py-1 rounded">
                                                    TIME: <span className="text-white font-bold">{timeMode}s</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); resetGame(); }}
                                                className="mt-6 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-bold tracking-wider border border-white/20"
                                            >
                                                TRY AGAIN
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </motion.div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<CPSTest />);
