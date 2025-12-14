import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";

// Physics-based Particle System
const ParticleSystem = ({ icon: Icon, color, count = 60 }) => {
    const containerRef = useRef(null);
    const particleRefs = useRef([]);
    const particlesData = useRef([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const particleCount = count;
        const data = [];

        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            data.push({
                x, y,
                originX: x, // Remember starting position
                originY: y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 1,
                size: Math.random() * 20 + 10
            });
        }
        particlesData.current = data;

        // Mouse tracker
        const handleMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMove);

        // Animation Loop
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

                // Return to Origin (Spring Force)
                const returnForce = 0.008; // Gentle pull back
                p.vx += (p.originX - p.x) * returnForce;
                p.vy += (p.originY - p.y) * returnForce;

                // Interaction
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const radius = 250; // Interaction radius

                if (dist < radius) {
                    const force = (radius - dist) / radius;
                    const angle = Math.atan2(dy, dx);
                    // Push away
                    p.vx += Math.cos(angle) * force * 1.5;
                    p.vy += Math.sin(angle) * force * 1.5;
                }

                // Drag/Friction to stabilize
                p.vx *= 0.90; // Higher friction to prevent endless bouncing
                p.vy *= 0.90;

                // Apply transform
                el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
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
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Render placeholders that will be moved by JS */}
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
                <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none bg-black/20">
                    {/* Central Flash to mask transition */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2, times: [0, 0.4, 0.6, 1] }}
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

const THEME_COLOR = '#FACC15'; // Yellow for Reaction

const ReactionTest = () => {
    const [gameState, setGameState] = useState('IDLE'); // IDLE, WAITING, READY, RESULT, EARLY
    const [reactionTime, setReactionTime] = useState(null);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('reactionHS');
        return saved ? parseInt(saved) : null;
    });
    const [startTime, setStartTime] = useState(null);
    const [isWarping, setIsWarping] = useState(false); // New warping state
    const timeoutRef = useRef(null);

    // State color mapping
    const stateColors = {
        IDLE: {
            bg: 'rgba(255, 255, 255, 0.03)',
            glow: '#9CA3AF',
            shadow: '0 0 30px rgba(156, 163, 175, 0.1), inset 0 0 20px rgba(156, 163, 175, 0.05)' // Subtle gray glow
        },
        WAITING: { bg: 'rgba(220, 38, 38, 0.3)', glow: '#DC2626', shadow: '0 0 60px #DC2626, inset 0 0 30px #DC2626' },
        READY: { bg: 'rgba(16, 185, 129, 0.3)', glow: '#10B981', shadow: '0 0 80px #10B981, inset 0 0 30px #10B981' }, // Stronger glow
        RESULT: { bg: 'rgba(6, 182, 212, 0.3)', glow: '#06B6D4', shadow: '0 0 60px #06B6D4, inset 0 0 30px #06B6D4' },
        EARLY: { bg: 'rgba(245, 158, 11, 0.3)', glow: '#F59E0B', shadow: '0 0 60px #F59E0B, inset 0 0 30px #F59E0B' }
    };

    const currentColor = stateColors[gameState];

    // Handle tile click
    const handleTileClick = () => {
        if (isWarping) return; // Disable interaction during warp

        if (gameState === 'IDLE' || gameState === 'RESULT' || gameState === 'EARLY') {
            // Start the game
            setGameState('WAITING');
            const randomDelay = Math.random() * 3000 + 2000; // 2-5 seconds

            timeoutRef.current = setTimeout(() => {
                setGameState('READY');
                setStartTime(performance.now());
            }, randomDelay);
        } else if (gameState === 'WAITING') {
            // Clicked too early
            clearTimeout(timeoutRef.current);
            setGameState('EARLY');
        } else if (gameState === 'READY') {
            // Calculate reaction time
            const endTime = performance.now();
            const time = Math.round(endTime - startTime);
            setReactionTime(time);
            setGameState('RESULT');

            // Update high score
            if (!highScore || time < highScore) {
                setHighScore(time);
                localStorage.setItem('reactionHS', time.toString());
            }
        }
    };

    // Handle Back Button with Warp
    const handleBack = (e) => {
        e.preventDefault();
        setIsWarping(true);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Get display text
    const getDisplayText = () => {
        switch (gameState) {
            case 'IDLE':
                return { main: ['CLICK', 'TO START'], sub: 'Test your reflexes' };
            case 'WAITING':
                return { main: ['WAIT', 'FOR GREEN'], sub: 'Get ready...' };
            case 'READY':
                return { main: ['CLICK', 'NOW!'], sub: '' };
            case 'RESULT':
                return { main: [`${reactionTime}ms`], sub: 'Click to try again' };
            case 'EARLY':
                return { main: ['TOO', 'EARLY!'], sub: 'Wait for green. Click to retry' };
            default:
                return { main: [], sub: '' };
        }
    };

    const displayText = getDisplayText();

    return (
        <div className="relative w-screen h-screen overflow-hidden text-white flex items-center justify-center bg-black">
            <MobileGuard />

            {/* Hyperspace Lines - Reverse for Back */}
            <HyperspaceLines color={THEME_COLOR} isActive={isWarping} />

            {/* Mouse Glow Effect */}
            <MouseGlow color={gameState === 'IDLE' ? THEME_COLOR : currentColor.glow} />

            {/* Particle System */}
            <ParticleSystem icon={Zap} color={THEME_COLOR} count={60} />

            {/* Background Gradient */}
            <motion.div
                className="absolute inset-0 z-0"
                animate={{
                    background: `radial-gradient(circle at center, ${THEME_COLOR}20 0%, #000000 80%)` // Reduced opacity for cleaner look
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

            {/* HUD: High Score */}
            {highScore && (
                <motion.div
                    className="absolute top-8 right-8 z-30 glass px-4 py-2 rounded-lg"
                    animate={{ opacity: isWarping ? 0 : 1 }}
                >
                    <div className="text-xs font-mono text-gray-400">BEST TIME</div>
                    <div className="text-2xl font-bold font-mono" style={{ color: THEME_COLOR }}>
                        {highScore}ms
                    </div>
                </motion.div>
            )}

            {/* Main Reaction Tile - Resized to Wide Rectangle & Font Update */}
            <AnimatePresence>
                {!isWarping && (
                    <motion.div
                        className="relative z-10 w-[95vw] max-w-6xl h-96 glass rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none border-2"
                        onClick={handleTileClick}
                        initial={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.5 } }} // Zoom out on exit
                        animate={{
                            backgroundColor: currentColor.bg,
                            boxShadow: currentColor.shadow,
                            borderColor: currentColor.glow
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: gameState === 'READY' && gameState !== 'IDLE' ? 0 : 0.3 }}
                    >
                        {/* Main Text - Single Line Orbitron */}
                        <motion.div
                            className="text-5xl md:text-8xl font-black tracking-widest uppercase font-orbitron text-center"
                            animate={{
                                color: currentColor.glow,
                                textShadow: `0 0 40px ${currentColor.glow}60`
                            }}
                        >
                            {displayText.main.map((line, index) => (
                                <div key={index}>{line}</div>
                            ))}
                        </motion.div>

                        {/* Subtitle */}
                        {displayText.sub && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0.6, y: 0 }}
                                className="mt-6 text-xl md:text-2xl font-mono text-gray-400 font-bold tracking-widest uppercase"
                            >
                                {displayText.sub}
                            </motion.div>
                        )}

                        {/* New High Score Indicator */}
                        {gameState === 'RESULT' && reactionTime === highScore && highScore < 999 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute bottom-10 px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-base font-bold shadow-lg"
                            >
                                🏆 NEW RECORD!
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions Hint */}
            {!isWarping && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-center opacity-30 pointer-events-none">
                    <p className="text-xs font-mono tracking-[0.5em]">CLICK WHEN THE TILE TURNS GREEN</p>
                </div>
            )}
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<ReactionTest />);
