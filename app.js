import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

import { ChevronLeft, User, Ghost, Sparkles } from "lucide-react";
import { EXPERIENCES } from "./experiences.js";


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

// Custom Mouse Trail Component - Now with Bright GLOW
const MouseGlow = ({ color }) => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 400 }; // Softer spring for fluid feel
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
            {/* Inner Core (Brightest) */}
            <div
                className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-90 blur-[2px]"
            />

            {/* Primary Glow */}
            <div
                className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-xl"
                style={{ background: color }}
            />

            {/* Secondary Wide Glow */}
            <div
                className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
                style={{ background: color }}
            />
        </motion.div>
    );
};

// Helper for Parallax Layers
const MouseParallaxLayer = ({ depth, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for fluid "floating" feel
    const smoothX = useSpring(x, { damping: 40, stiffness: 200 });
    const smoothY = useSpring(y, { damping: 40, stiffness: 200 });

    useEffect(() => {
        const handleMove = (e) => {
            // Normalize mouse from -1 to 1
            const normX = (e.clientX / window.innerWidth) * 2 - 1;
            const normY = (e.clientY / window.innerHeight) * 2 - 1;
            x.set(normX * depth);
            y.set(normY * depth);
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, [depth, x, y]);

    return (
        <motion.div
            className={className}
            style={{ x: smoothX, y: smoothY, scale: 1.1 }} // Scale up slightly to avoid edge clipping
        />
    );
};

// Hyperspace Effect Component
const HyperspaceLines = ({ color, isActive }) => {
    // Data Stream Effect: Horizontal lines accelerating L -> R
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

                    {/* Horizontal Data Streams */}
                    {lines.map((line) => (
                        <motion.div
                            key={line.id}
                            className="absolute bg-white rounded-full"
                            initial={{
                                x: '-100vw',
                                width: '100px',
                                opacity: 0
                            }}
                            animate={{
                                x: '200vw',
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

// --- CREATOR PROFILE MODULE (THE VOID) ---

const VoidParticles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = 300; // Fixed card width
        let height = canvas.height = 160;

        const particles = [];
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vy: - (Math.random() * 0.5 + 0.2), // Upward drift
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
                life: Math.random() * 100
            });
        }

        let animationFrameId;

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.y += p.vy;
                p.life--;

                // Respawn at bottom
                if (p.y < 0 || p.life < 0) {
                    p.y = height;
                    p.x = Math.random() * width;
                    p.life = Math.random() * 100 + 50;
                    p.alpha = 0; // Fade in
                }

                // Fade in/out logic
                if (p.y > height - 20) p.alpha += 0.02;
                else if (p.y < 20) p.alpha -= 0.02;

                ctx.fillStyle = `rgba(147, 51, 234, ${Math.max(0, p.alpha)})`; // Purple hex #9333ea
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 pointer-events-none mix-blend-screen" />;
};

const CreatorProfile = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* TRIGGER BUTTON (Bottom Right) */}
            <motion.div
                className="fixed bottom-8 right-8 z-[100] cursor-pointer group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="relative w-12 h-12 rounded-full bg-black/60 border border-purple-500/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] group-hover:border-purple-400">
                    <Ghost size={20} className="text-purple-400 group-hover:text-white transition-colors" />

                    {/* Pulse Effect */}
                    <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping opacity-75 duration-[3000ms]" />
                </div>
            </motion.div>

            {/* PROFILE CARD MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-24 right-8 z-[100] w-[320px] h-[160px] rounded-2xl overflow-hidden border border-purple-500/30 bg-black/80 backdrop-blur-xl shadow-[0_0_40px_rgba(147,51,234,0.2)]"
                    >
                        {/* Custom Void Particles Background */}
                        <VoidParticles />

                        {/* Content */}
                        <div className="relative z-10 w-full h-full flex flex-col items-start justify-center p-6 select-none">
                            {/* Accent Line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-fuchsia-500 to-transparent opacity-80" />

                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <Sparkles size={16} className="text-purple-300" />
                                </div>
                                <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-bold">System Architect</span>
                            </div>

                            <div className="space-y-1">
                                <p className="text-gray-400 text-sm font-rajdhani tracking-wide">
                                    Forged in the Void by
                                </p>
                                <h2 className="text-2xl font-black text-white tracking-widest font-orbitron drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                                    DARKNESS
                                </h2>
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute top-4 right-4 opacity-20">
                                <User size={48} className="text-purple-500" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const App = () => {
    // rotationIndex is the master counter. It can go negative or positive indefinitely.
    const [rotationIndex, setRotationIndex] = useState(0);
    const [isWarping, setIsWarping] = useState(false);

    // Derived activeIndex: Always 0-3
    const activeIndex = ((rotationIndex % EXPERIENCES.length) + EXPERIENCES.length) % EXPERIENCES.length;
    const activeExp = EXPERIENCES[activeIndex];

    const triggerWarp = React.useCallback(() => {
        setIsWarping(true);
        // Navigate to the active experience page after warp animation
        setTimeout(() => {
            const pageMap = {
                'reaction': 'reaction.html',
                'aim': 'aim.html',
                'cps': 'cps.html',
                'typing': 'typing.html'
            };
            window.location.href = pageMap[activeExp.id] || 'reaction.html';
        }, 2000); // Increased to 2.0s for hyperspace feel
    }, [activeExp]);

    // Scroll & Key interactions
    useEffect(() => {
        const handleWheel = (e) => {
            if (isWarping) return;
            // Invert delta so scroll down = clockwise (next item)
            if (e.deltaY > 0) {
                setRotationIndex((prev) => prev + 1);
            } else {
                setRotationIndex((prev) => prev - 1);
            }
        };

        const handleKeyDown = (e) => {
            if (isWarping) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                setRotationIndex((prev) => prev + 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                setRotationIndex((prev) => prev - 1);
            } else if (e.key === 'Enter') {
                triggerWarp();
            }
        };

        window.addEventListener('wheel', handleWheel);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isWarping, triggerWarp]);

    const radius = 340;

    return (
        <div className="relative w-screen h-screen overflow-hidden text-white flex items-center justify-center bg-black">
            <MobileGuard />

            <MouseGlow color={activeExp.hex} />

            {/* Physics Particle System - Below UI, Above Background */}
            <ParticleSystem icon={activeExp.icon} color={activeExp.hex} count={60} />

            {/* Immersive Background Color */}
            <motion.div
                className="absolute inset-0 z-0"
                animate={{
                    background: `radial-gradient(circle at center, ${activeExp.hex}40 0%, #000000 80%)`
                }}
                transition={{ duration: 0.8 }}
            />

            {/* Holographic Parallax Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeExp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                    >
                        {/* Layer 1: Base (Stable) */}
                        <motion.div
                            className={`absolute inset-0 bg-${activeExp.id} opacity-60`}
                            style={{ scale: 1.05 }}
                        />

                        {/* Layer 2: Mid (Drift) */}
                        <MouseParallaxLayer depth={50} className={`absolute inset-0 bg-${activeExp.id} opacity-50 mix-blend-screen`} />

                        {/* Layer 3: Top (Glitch/Break) */}
                        <MouseParallaxLayer depth={100} className={`absolute inset-0 bg-${activeExp.id} opacity-30 mix-blend-screen`} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Rotating Ring Visualization (Static background ring) */}
            <motion.div
                className="absolute z-0 opacity-20 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
                <div className="w-[800px] h-[800px] rounded-full border border-white/10 border-dashed"
                    style={{ borderColor: activeExp.hex }}
                ></div>
            </motion.div>

            {/* Scanning Grid */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* Main Content Container */}
            <AnimatePresence>
                {!isWarping && (
                    <motion.div
                        className="relative z-10 flex items-center justify-center"
                        exit={{ scale: 0.8, opacity: 0 }} // Zoom OUT slightly before warp
                        transition={{ duration: 0.5 }}
                    >
                        {/* REVOLVER NAVIGATION LAYER */}
                        <motion.div
                            className="absolute flex items-center justify-center pointer-events-none"
                            animate={{ rotate: -rotationIndex * 90 }} // Rotate based on continuous index
                            transition={{ type: "spring", stiffness: 60, damping: 15 }} // Tweaked for satisfying spin
                            style={{ width: radius * 2, height: radius * 2 }}
                        >
                            {EXPERIENCES.map((exp, index) => {
                                const isActive = index === activeIndex;
                                const Icon = exp.icon;

                                // Base angle
                                const angle = index * 90;

                                return (
                                    <motion.div
                                        key={exp.id}
                                        className="absolute flex flex-col items-center justify-center pointer-events-auto cursor-pointer"
                                        style={{
                                            // Position on the circle border
                                            transform: `rotate(${angle}deg) translate(${radius}px)`
                                        }}
                                        onClick={() => {
                                            if (isActive) {
                                                triggerWarp();
                                            } else {
                                                // Calculate shortest rotational path
                                                let diff = index - activeIndex;
                                                if (diff > 2) diff -= 4;
                                                if (diff < -2) diff += 4;
                                                setRotationIndex(prev => prev + diff);
                                            }
                                        }}
                                    >
                                        {/* Counter-rotate: Need to compensate for the continuous rotationIndex */}
                                        <motion.div
                                            // rotationIndex * 90 reverses the container. 
                                            // -angle reverses the initial placement.
                                            // Net result: Icon is always upright.
                                            animate={{ rotate: (rotationIndex * 90) - angle }}
                                            transition={{ type: "spring", stiffness: 60, damping: 15 }}
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: isActive ? 1.5 : 1,
                                                    backgroundColor: isActive ? `${exp.hex}20` : `${exp.hex}00`, // Fix: non-transparent start
                                                    borderColor: isActive ? exp.hex : `${exp.hex}00`, // Fix: non-transparent start
                                                    boxShadow: isActive ? `0 0 30px ${exp.hex}60` : `0 0 0px ${exp.hex}00` // Fix: animatable shadow
                                                }}
                                                className="p-4 rounded-full border transition-colors duration-300"
                                            >
                                                <Icon size={28} color={isActive ? exp.hex : '#4B5563'} strokeWidth={isActive ? 2 : 1.5} />
                                            </motion.div>

                                            {/* Floating Text Label */}
                                            {isActive && (
                                                <motion.span
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="absolute top-16 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap"
                                                >
                                                    {exp.name}
                                                </motion.span>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>


                        {/* STATIC CENTER CONTENT */}
                        <div className="text-center z-20 pointer-events-none relative group flex flex-col items-center">
                            <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase select-none cursor-pointer whitespace-nowrap font-orbitron" onClick={triggerWarp}>
                                <span
                                    className="bg-clip-text text-transparent bg-contain animate-text-shine"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, #4B5563 0%, ${activeExp.hex} 50%, #4B5563 100%)`, // Gray -> Color -> Gray wave
                                        backgroundSize: '200% auto',
                                        textShadow: `0 0 30px ${activeExp.hex}40`
                                    }}
                                >
                                    ENTER THE EXPERIENCE
                                </span>
                            </h1 >

                            <motion.div
                                key={activeIndex} // activeIndex is 0-3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-4 flex flex-col items-center space-y-1"
                            >
                                <div className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-white font-rajdhani">
                                    // {activeExp.name}
                                </div>
                                <div
                                    className="text-xs md:text-sm tracking-widest uppercase font-rajdhani opacity-60"
                                    style={{ color: activeExp.hex }}
                                >
                                    [{activeExp.description}]
                                </div>
                            </motion.div>
                        </div>


                        {/* STATIC POINTER (RIGHT SIDE) */}
                        <motion.div
                            className="absolute"
                            style={{ right: -radius - 30 }}
                            animate={{ x: [-5, 5, -5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <ChevronLeft size={48} color={activeExp.hex} strokeWidth={3} />
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>


            {/* Warp Effect Overlay */}
            <AnimatePresence>
                {isWarping && (
                    <motion.div
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }} // Fade to black at end of warp
                    >
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hyperspace Lines Effect */}
            <HyperspaceLines color={activeExp.hex} isActive={isWarping} />

            {/* Hints */}
            <div className="absolute top-10 right-10 z-20 text-right space-y-2 opacity-30 text-xs font-mono hidden md:block select-none">
                <p>SCROLL / ARROWS TO ROTATE</p>
                <p>ENTER TO ENGAGE</p>
            </div>

            {/* Creator Profile Widget */}
            <CreatorProfile />
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
