import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`space-y-1 ${className}`}>
            {label && <label className="text-sm font-medium text-brand-300 ml-1">{label}</label>}
            <div className="relative group">
                <div className={`
          absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none
          ${isFocused ? 'bg-brand-500/10 ring-1 ring-brand-500/50' : 'bg-brand-900/20 hover:bg-brand-900/30'}
        `} />

                <div className="relative flex items-center">
                    {Icon && (
                        <div className={`absolute left-4 transition-colors duration-300 ${isFocused ? 'text-brand-400' : 'text-slate-500'}`}>
                            <Icon size={20} />
                        </div>
                    )}

                    <input
                        {...props}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        className={`
              w-full bg-transparent border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-500
              focus:outline-none focus:border-brand-500/50 transition-all duration-300
              ${Icon ? 'pl-12' : ''}
              ${error ? 'border-red-500/50 focus:border-red-500' : ''}
            `}
                    />
                </div>
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input;
