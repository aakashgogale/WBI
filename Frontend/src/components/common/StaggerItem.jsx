import React from 'react';
import { motion } from 'framer-motion';

const StaggerItem = ({ children, className = '', yOffset = 30, ...props }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: yOffset },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default StaggerItem;
