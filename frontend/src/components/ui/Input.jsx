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
            {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
            <div className="relative group">
                <div className="relative flex items-center">
                    {Icon && (
                        <div className={`absolute left-4 transition-colors duration-300 ${isFocused ? 'text-brand-600' : 'text-slate-400'}`}>
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
              w-full bg-white border rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400
              transition-all duration-300 shadow-sm
              ${Icon ? 'pl-12' : ''}
              ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'}
            `}
                    />
                </div>
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 ml-1 font-medium"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input;
