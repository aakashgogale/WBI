import React from 'react';
import { motion } from 'framer-motion';

const StaggerContainer = ({ children, className = '', delay = 0.08, ...props }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delay
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
