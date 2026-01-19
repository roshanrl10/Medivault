import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -4 } : {}}
            className={`
        bg-white rounded-xl border border-slate-200 p-6 shadow-sm
        ${hover ? 'hover:shadow-md transition-shadow duration-300' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
