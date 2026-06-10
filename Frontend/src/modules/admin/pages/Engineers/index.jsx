import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiClock, FiActivity, FiDollarSign } from 'react-icons/fi';

// Import sub-components
// Import sub-components
import AllEngineers from './AllEngineers';
import EngineerJobs from './EngineerJobs';
import EngineerAnalytics from './EngineerAnalytics';

const Engineers = () => {
  const location = useLocation();

  const navTabs = [
    { name: 'All Engineers', path: '/admin/engineers/all', icon: FiUsers },
    { name: 'Engineer Jobs', path: '/admin/engineers/jobs', icon: FiClock },
    { name: 'Engineer Analytics', path: '/admin/engineers/analytics', icon: FiActivity },
  ];

  const getPageTitle = () => {
    const currentTab = navTabs.find(tab => location.pathname === tab.path);
    return currentTab ? currentTab.name : 'Engineer Management';
  };

  return (
    <div className="space-y-6">
      {/* Content Area */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="all" replace />} />
          <Route path="all" element={<AllEngineers />} />
          <Route path="jobs" element={<EngineerJobs />} />
          <Route path="analytics" element={<EngineerAnalytics />} />
        </Routes>
      </motion.div>
    </div>
  );
};

export default Engineers;
