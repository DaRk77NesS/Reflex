import { Zap, Crosshair, MousePointer2, Keyboard } from "lucide-react";

export const EXPERIENCES = [
    {
        id: 'reaction',
        name: 'Reaction',
        theme: 'reflex-yellow',
        hex: '#FACC15',
        icon: Zap,
        description: 'Test your reflexes.'
    },
    {
        id: 'aim',
        name: 'Aim Training',
        theme: 'reflex-red',
        hex: '#DC2626',
        icon: Crosshair,
        description: 'Precision matters.'
    },
    {
        id: 'cps',
        name: 'CPS Test',
        theme: 'reflex-blue',
        hex: '#2563EB',
        icon: MousePointer2,
        description: 'Click per second.'
    },
    {
        id: 'typing',
        name: 'Typing Speed',
        theme: 'reflex-green',
        hex: '#16A34A',
        icon: Keyboard,
        description: 'Words per minute.'
    }
];
