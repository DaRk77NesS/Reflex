import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, RefreshCw, Terminal, Code, Hash, ChevronRight } from "lucide-react";

// --- SHARED COMPONENTS (Refined for Typing) ---

// Physics-based Particle System (Customized for Matrix)
const ParticleSystem = ({ color, count = 40 }) => {
    const containerRef = useRef(null);
    const particleRefs = useRef([]);
    const particlesData = useRef([]);
    // Matrix symbols
    const symbols = ['{', '}', '<', '>', '/', ';', '#', '0', '1', '[', ']', '*', '?', '$'];

    useEffect(() => {
        particlesData.current = Array.from({ length: count }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.2, // Slower, floating
            vy: (Math.random() * 0.5) + 0.2, // Falling down (Matrix style)
            size: Math.random() * 14 + 10,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            opacity: Math.random() * 0.6 + 0.4
        }));

        let raF;
        const animate = () => {
            particlesData.current.forEach((p, i) => {
                const el = particleRefs.current[i];
                if (!el) return;

                p.x += p.vx;
                p.y += p.vy;

                // Wrap
                if (p.y > window.innerHeight + 20) p.y = -20;
                if (p.x > window.innerWidth + 20) p.x = -20;
                if (p.x < -20) p.x = window.innerWidth + 20;

                el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
                el.innerText = p.symbol;
            });
            raF = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(raF);
    }, [count]);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0 font-mono">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    ref={el => particleRefs.current[i] = el}
                    className="absolute font-bold blur-[1px] transition-colors duration-500"
                    style={{ color: color, fontSize: '14px' }}
                />
            ))}
        </div>
    );
};

const MouseGlow = ({ color }) => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springConfig = { damping: 25, stiffness: 300 };
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
            style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
        >
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-80 blur-[1px]" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-2xl" style={{ background: color }} />
        </motion.div>
    );
};

const HyperspaceLines = ({ color, isActive }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none bg-black">
                    {/* Flash */}
                    <motion.div
                        className="absolute inset-0 bg-green-500"
                        initial={{ opacity: 0 }} animate={{ opacity: [0, 0.2, 0] }} transition={{ duration: 0.5 }}
                        style={{ mixBlendMode: 'screen' }}
                    />
                    {/* Horizontal Streaks - Dense and Green */}
                    {Array.from({ length: 60 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-green-400 rounded-full h-[3px]"
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

// --- TYPING LOGIC ---

// Difficulty Configuration
const DIFFICULTY_CONFIG = {
    LOW: { color: '#22c55e', label: 'LOW' },     // Green
    MEDIUM: { color: '#eab308', label: 'MEDIUM' }, // Yellow/Gold
    HIGH: { color: '#ef4444', label: 'HIGH' }      // Red
};

const THEME_COLOR = '#22c55e'; // FIXED MATRIX GREEN

const WORD_LISTS = {
    LOW: [
        "code", "hack", "data", "byte", "node", "java", "ruby", "perl", "bash", "root", "user", "sudo", "grep", "echo", "ping", "host", "bios", "cmos",
        "ipv4", "ipv6", "html", "css", "json", "ajax", "soap", "rest", "api", "sdk", "ide", "gui", "cli", "ssh", "ssl", "tls", "key", "map", "set", "get",
        "put", "del", "void", "null", "int", "char", "bool", "long", "float", "double", "if", "else", "for", "while", "do", "switch", "case", "break",
        "return", "try", "catch", "throw", "final", "static", "public", "class", "import", "from", "export", "const", "let", "var", "async", "await"
    ],
    MEDIUM: [
        "The quick brown fox jumps over the lazy dog.",
        "To be or not to be, that is the question.",
        "All your base are belong to us.",
        "Hello, world! Welcome to the matrix.",
        "Function execution context implies stack frame.",
        "Recursive algorithms scale logarithmically.",
        "Distributed systems require consensus protocols.",
        "Cybersecurity analysts monitor network traffic.",
        "Artificial intelligence is transforming the landscape of modern computing.",
        "Deep learning models require vast amounts of labeled data for training.",
        "Quantum superposition allows particles to exist in multiple states simultaneously.",
        "Blockchain technology enables decentralized and immutable ledger systems.",
        "Cloud computing provides scalable infrastructure for global applications.",
        "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live."
    ],
    HIGH: [
        "function debounce(func, wait) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }",
        "SELECT * FROM users WHERE status = 'active' AND last_login > DATE_SUB(NOW(), INTERVAL 7 DAY);",
        "<div className='container' style={{ display: 'flex' }}>Content</div>",
        "git commit -m 'Refactor authentication middleware' --no-verify",
        "sudo apt-get update && sudo apt-get install -y python3-pip",
        "const memoize = (fn) => { const cache = {}; return (...args) => { const key = JSON.stringify(args); return cache[key] || (cache[key] = fn(...args)); }; };",
        "docker run -d -p 80:80 --name webserver nginx:latest",
        "margin: 0 auto; width: 100%; max-width: 1200px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));",
        "import { useState, useEffect } from 'react'; export default function App() { const [count, setCount] = useState(0); return <button onClick={() => setCount(c => c + 1)}>{count}</button>; }"
    ]
};

// Helper: Generate Random Text
const generateText = (difficulty) => {
    if (difficulty === 'LOW') {
        const words = [];
        for (let i = 0; i < 20; i++) words.push(WORD_LISTS.LOW[Math.floor(Math.random() * WORD_LISTS.LOW.length)]);
        return words.join(" ");
    }
    if (difficulty === 'MEDIUM') {
        // Concatenate 2-3 sentences
        let text = [];
        for (let i = 0; i < 3; i++) text.push(WORD_LISTS.MEDIUM[Math.floor(Math.random() * WORD_LISTS.MEDIUM.length)]);
        return text.join(" ");
    }
    // HIGH: Pick one complex code block
    return WORD_LISTS.HIGH[Math.floor(Math.random() * WORD_LISTS.HIGH.length)];
};

const TypingTest = () => {
    const [difficulty, setDifficulty] = useState('MEDIUM'); // LOW, MEDIUM, HIGH
    const [targetText, setTargetText] = useState("");
    const [inputText, setInputText] = useState("");
    const [gameState, setGameState] = useState('IDLE'); // IDLE, ACTIVE, COMPLETED
    const [startTime, setStartTime] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isWarping, setIsWarping] = useState(false);

    // Stats
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);

    const timerRef = useRef();
    const inputRef = useRef(null);

    // Initialize
    useEffect(() => {
        setTargetText(generateText(difficulty));
    }, [difficulty]);

    // Focus Input
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
        const keepFocus = () => inputRef.current && inputRef.current.focus();
        document.addEventListener('click', keepFocus);
        return () => document.removeEventListener('click', keepFocus);
    }, []);

    // Change Difficulty
    const handleDifficulty = (d) => {
        setDifficulty(d);
        resetGame();
        setTargetText(generateText(d));
    };

    const resetGame = () => {
        setGameState('IDLE');
        setInputText("");
        setTimeElapsed(0);
        setWpm(0);
        setAccuracy(100);
        setStartTime(null);
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };

    // Calculate Stats
    useEffect(() => {
        if (gameState === 'ACTIVE' && startTime) {
            // Stats Loop
            const updateStats = () => {
                const now = performance.now();
                const totalSeconds = (now - startTime) / 1000;
                setTimeElapsed(totalSeconds);

                // WPM = (Characters / 5) / Time(min)
                const charCount = inputText.length;
                const minutes = Math.max(totalSeconds / 60, 0.001); // Prevent div by zero
                const w = Math.round((charCount / 5) / minutes);
                setWpm(w);

                // Accuracy
                let errors = 0;
                for (let i = 0; i < inputText.length; i++) {
                    if (inputText[i] !== targetText[i]) errors++;
                }
                const acc = inputText.length > 0 ? Math.max(0, 100 - ((errors / inputText.length) * 100)) : 100;
                setAccuracy(Math.round(acc));

                timerRef.current = requestAnimationFrame(updateStats);
            };
            timerRef.current = requestAnimationFrame(updateStats);
        } else {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
        }
        return () => cancelAnimationFrame(timerRef.current);
    }, [gameState, startTime, inputText, targetText]);

    // Handle Input
    const handleInput = (e) => {
        if (gameState === 'COMPLETED') return;

        const val = e.target.value;
        const currentLength = val.length;

        // Start Game
        if (gameState === 'IDLE' && currentLength > 0) {
            setGameState('ACTIVE');
            setStartTime(performance.now());
        }

        setInputText(val);

        // Check Completion
        if (val.length >= targetText.length) {
            setGameState('COMPLETED');
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
        }
    };

    // Handle Back
    const handleBack = (e) => {
        e.preventDefault();
        setIsWarping(true);
        setTimeout(() => window.location.href = 'index.html', 2000);
    };

    // Render Text Logic (Grouped by Words to prevent bad breaking)
    const renderChars = useMemo(() => {
        const words = targetText.split(' ');
        let charIndex = 0;

        return words.map((word, wIndex) => {
            const wordChars = word.split('').map((char, cIndexInWord) => {
                const absoluteIndex = charIndex;
                const typedChar = inputText[absoluteIndex];

                let status = 'pending'; // pending, correct, incorrect, current
                if (absoluteIndex === inputText.length) status = 'current';
                else if (absoluteIndex < inputText.length) status = typedChar === char ? 'correct' : 'incorrect';

                charIndex++; // Increment for next char

                // Color based on status - Content always Green or Red
                const textColor = status === 'correct' ? THEME_COLOR :
                    status === 'incorrect' ? '#ef4444' : 'rgba(255,255,255,0.2)';

                return (
                    <span key={cIndexInWord} className="relative inline-block text-2xl md:text-3xl leading-relaxed">
                        <span style={{
                            color: textColor,
                            textShadow: status === 'correct' ? `0 0 10px ${THEME_COLOR}` : 'none',
                        }}>
                            {char}
                        </span>

                        {/* Error Underline */}
                        {status === 'incorrect' && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500" />
                        )}

                        {/* Cursor */}
                        {status === 'current' && (
                            <motion.span
                                className="absolute inset-0 bg-green-500/50 block"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                style={{ width: '100%', height: '100%', left: 0, top: 0, zIndex: -1 }}
                            />
                        )}
                    </span>
                );
            });

            // Add Space after word (unless last word)
            const spaceNeeded = wIndex < words.length - 1;
            let spaceStatus = 'pending';

            if (spaceNeeded) {
                const spaceIndex = charIndex;
                if (spaceIndex === inputText.length) spaceStatus = 'current';
                else if (spaceIndex < inputText.length) spaceStatus = inputText[spaceIndex] === ' ' ? 'correct' : 'incorrect';
                charIndex++; // Increment for space
            }

            return (
                <span key={wIndex} className="inline-block whitespace-nowrap mr-3 mb-2">
                    {wordChars}
                    {spaceNeeded && (
                        <span className="relative inline-block text-2xl md:text-3xl leading-relaxed">
                            <span style={{ opacity: 0.2 }}>&nbsp;</span>
                            {spaceStatus === 'current' && (
                                <motion.span
                                    className="absolute inset-0 bg-green-500/50 block"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    style={{ width: '100%', height: '100%', left: 0, top: 0, zIndex: -1 }}
                                />
                            )}
                            {spaceStatus === 'incorrect' && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500" />
                            )}
                        </span>
                    )}
                </span>
            );
        });
    }, [targetText, inputText, difficulty]);


    return (
        <div className="relative w-screen h-screen overflow-hidden text-white flex flex-col items-center justify-center bg-black font-mono selection:bg-green-900">
            <MobileGuard />
            {/* Background - STRICTLY GREEN */}
            <HyperspaceLines color={THEME_COLOR} isActive={isWarping} />
            <MouseGlow color={THEME_COLOR} />
            <ParticleSystem color={THEME_COLOR} count={80} />

            <motion.div
                className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,50,0,0.3)_0%,#000000_100%)]"
                // Fixed Green Background
                style={{ background: `radial-gradient(circle at center, ${THEME_COLOR}20 0%, #000000 100%)` }}
            />

            {/* Hidden Input for capturing typing */}
            <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={handleInput}
                className="absolute opacity-0 top-0 left-0 h-0 w-0"
                autoFocus
                autoComplete="off"
            />

            {/* HUD: Back */}
            <motion.a
                href="index.html"
                onClick={handleBack}
                className="absolute top-8 left-8 z-30 glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer group"
                animate={{ opacity: isWarping ? 0 : 1 }}
                style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" color={THEME_COLOR} />
                <span className="text-sm font-bold tracking-widest text-green-400">BACK</span>
            </motion.a>

            {/* HUD: Difficulty Selection */}
            <div className="absolute top-8 right-8 z-30 flex gap-4">
                {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => handleDifficulty(key)}
                        className={`px-6 py-2 rounded-full text-xs font-black tracking-widest transition-all duration-300 border ${difficulty === key ? 'text-black shadow-[0_0_20px_currentColor] scale-105' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}
                        style={{
                            backgroundColor: difficulty === key ? config.color : 'transparent',
                            borderColor: difficulty === key ? config.color : 'transparent',
                            color: difficulty === key ? '#000' : config.color
                        }}
                    >
                        {config.label}
                    </button>
                ))}
            </div>

            {/* HUD: Stats (Floating) - Keeping it Green for Consistency */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-8 md:gap-16 z-20">
                <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">WPM</div>
                    <div className="text-4xl font-black font-orbitron" style={{ color: THEME_COLOR }}>{wpm}</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Time</div>
                    <div className="text-4xl font-bold text-white font-orbitron tabular-nums">{timeElapsed.toFixed(1)}s</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Accuracy</div>
                    <div className="text-4xl font-bold text-white font-orbitron">{accuracy}%</div>
                </div>
            </div>

            {/* Main Interaction Area */}
            <AnimatePresence>
                {!isWarping && (
                    <motion.div
                        className="relative z-10 w-full max-w-5xl px-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        {/* Text Container - GLOW changes with Difficulty, CONTENT stays Green */}
                        <motion.div
                            className="glass p-8 md:p-12 rounded-2xl border min-h-[300px] flex flex-wrap content-start items-start gap-y-2 cursor-text"
                            animate={{
                                borderColor: `${DIFFICULTY_CONFIG[difficulty].color}60`, // Stronger Border Color
                                boxShadow: gameState === 'ACTIVE'
                                    ? `0 0 ${Math.min(wpm, 60)}px ${DIFFICULTY_CONFIG[difficulty].color}50` // Stronger Glow Color
                                    : `0 0 20px ${DIFFICULTY_CONFIG[difficulty].color}20`
                            }}
                            onClick={() => inputRef.current && inputRef.current.focus()}
                        >
                            {renderChars}
                        </motion.div>

                        {/* Result Overlay */}
                        {gameState === 'COMPLETED' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl"
                            >
                                <div className="text-center">
                                    <div className="text-green-500 font-bold text-2xl mb-2 tracking-widest">SYSTEM SUCCESS</div>
                                    <div className="text-6xl font-black font-orbitron text-white mb-4 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">
                                        {wpm}
                                    </div>
                                    <div className="text-sm text-gray-400 mb-6 font-mono">WORDS PER MINUTE</div>

                                    {/* Accuracy Display with Dynamic Color */}
                                    <div className="mb-8">
                                        <div className="text-4xl font-bold font-orbitron drop-shadow-md"
                                            style={{
                                                color: accuracy < 25 ? '#ef4444' : accuracy < 75 ? '#eab308' : '#22c55e',
                                                textShadow: `0 0 15px ${accuracy < 25 ? '#ef4444' : accuracy < 75 ? '#eab308' : '#22c55e'}`
                                            }}
                                        >
                                            {accuracy}%
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Accuracy</div>
                                    </div>

                                    <button
                                        onClick={() => { resetGame(); setTargetText(generateText(difficulty)); }}
                                        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg tracking-widest transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                                    >
                                        RESTART
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* IDLE Prompt */}
                        {gameState === 'IDLE' && (
                            <div className="absolute top-full left-0 w-full text-center mt-4">
                                <span className="text-green-500/50 text-sm animate-pulse">&lt; START TYPING TO BEGIN /&gt;</span>
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<TypingTest />);
