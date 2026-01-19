import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5 } : {}}
            className={`
        glass-card rounded-2xl border border-white/5 p-6
        ${hover ? 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-brand-500/30 transition-all duration-500' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
