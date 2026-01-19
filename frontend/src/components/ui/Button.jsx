import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg border-transparent",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300",
    outline: "bg-transparent border-2 border-brand-600 text-brand-600 hover:bg-brand-50",
    ghost: "bg-transparent hover:bg-brand-50 text-brand-600 hover:text-brand-700 border-transparent",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
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
        relative flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 border
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
