import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: "bg-brand-500 hover:bg-brand-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] border-transparent",
    secondary: "bg-brand-900/50 hover:bg-brand-800/50 text-brand-100 border-brand-700/50 hover:border-brand-500",
    outline: "bg-transparent border-brand-700 text-brand-300 hover:border-brand-500 hover:text-white",
    ghost: "bg-transparent hover:bg-white/5 text-brand-300 hover:text-white border-transparent",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20 hover:border-red-500/50"
};

const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5",
    lg: "px-6 py-3 text-lg"
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    icon: Icon,
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
        relative flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 border
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <div className="w-5 h-5 border-2 border-inherit border-t-transparent rounded-full animate-spin mr-2" />
            )}
            {!isLoading && Icon && <Icon size={18} className="stroke-[2.5]" />}
            {children}
        </motion.button>
    );
};

export default Button;
