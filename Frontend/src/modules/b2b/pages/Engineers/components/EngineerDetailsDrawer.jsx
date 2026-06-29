import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiUser, FiMapPin, FiBriefcase, FiPhone, FiMail, 
  FiClock, FiCheckCircle, FiStar, FiActivity, FiTool
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../../services/api';

const EngineerDetailsDrawer = ({ engineerId, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const { data: engData, isLoading: engLoading } = useQuery({
    queryKey: ['b2bEngineerDetails', engineerId],
    queryFn: async () => {
      if (!engineerId) return null;
      const res = await api.get(`/b2b/engineers/${engineerId}`);
      return res.data?.data;
    },
    enabled: !!engineerId
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['b2bEngineerTimeline', engineerId],
    queryFn: async () => {
      if (!engineerId) return [];
      const res = await api.get(`/b2b/engineers/${engineerId}/timeline`);
      return res.data?.data || [];
    },
    enabled: !!engineerId && activeTab === 'timeline'
  });

  const { data: perfData, isLoading: perfLoading } = useQuery({
    queryKey: ['b2bEngineerPerf', engineerId],
    queryFn: async () => {
      if (!engineerId) return null;
      const res = await api.get(`/b2b/engineers/${engineerId}/performance`);
      return res.data?.data;
    },
    enabled: !!engineerId && activeTab === 'performance'
  });

  if (!engineerId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              {engLoading ? (
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              ) : (
                <img 
                  src={engData?.profilePhoto || 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {engLoading ? 'Loading...' : engData?.name}
                </h2>
                {engData && (
                  <p className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-2">
                    <span className="text-yellow-500 flex items-center gap-1">
                      <FiStar className="fill-current" /> {engData.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span>• ID: {engData._id?.slice(-6).toUpperCase()}</span>
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex border-b border-gray-100 px-6 gap-6">
            {['profile', 'performance', 'timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-semibold capitalize border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-[#10AFA5] text-[#10AFA5]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
            {engLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-[#10AFA5] border-t-transparent rounded-full" />
              </div>
            ) : engData ? (
              <div className="space-y-6">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiUser className="text-[#10AFA5]" /> Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><FiPhone /> Phone</p>
                          <p className="font-semibold text-gray-800">{engData.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><FiMail /> Email</p>
                          <p className="font-semibold text-gray-800">{engData.email || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><FiMapPin /> Base City</p>
                          <p className="font-semibold text-gray-800">{engData.address?.city || 'Not Provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Skills & Verification */}
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiTool className="text-[#10AFA5]" /> Skills & Compliance
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-500 text-xs mb-2">Service Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {engData.serviceCategories?.length > 0 ? engData.serviceCategories.map((sc, i) => (
                              <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-lg border border-gray-200">
                                {sc}
                              </span>
                            )) : <span className="text-sm text-gray-400">None mapped</span>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-100">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">KYC Status</p>
                            <p className="font-semibold text-green-600 flex items-center gap-1">
                              <FiCheckCircle /> Verified
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Experience</p>
                            <p className="font-semibold text-gray-800">{engData.experienceLevel || 'Not stated'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Job (If Any) */}
                    {engData.currentJob && (
                      <div className="bg-[#F0FDFA] rounded-xl p-5 border border-[#10AFA5]/20 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <FiBriefcase className="text-[#10AFA5]" /> Current Active Job
                        </h3>
                        <p className="text-sm text-gray-700 font-medium">Job: <span className="font-bold text-[#10AFA5]">{engData.currentJob.jobId}</span></p>
                        <p className="text-xs text-gray-500 mt-1">{engData.currentJob.service} • {engData.currentJob.city}</p>
                      </div>
                    )}

                  </div>
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && (
                  <div className="space-y-6 animate-fade-in">
                    {perfLoading ? (
                      <div className="text-center py-10"><div className="animate-pulse h-4 w-24 bg-gray-200 rounded mx-auto" /></div>
                    ) : perfData ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                            <p className="text-xs text-gray-500 font-semibold mb-1">Completed for you</p>
                            <p className="text-2xl font-black text-gray-900">{perfData.completed}</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                            <p className="text-xs text-gray-500 font-semibold mb-1">This Month</p>
                            <p className="text-2xl font-black text-gray-900">{perfData.completedThisMonth}</p>
                          </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiActivity className="text-[#10AFA5]" /> SLA Metrics
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">Acceptance Rate</span>
                              <span className="font-bold text-gray-900">{perfData.acceptanceRate}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-[#10AFA5] h-1.5 rounded-full" style={{ width: perfData.acceptanceRate }}></div></div>

                            <div className="flex justify-between items-center text-sm pt-2">
                              <span className="text-gray-500">Completion Rate</span>
                              <span className="font-bold text-gray-900">{perfData.completionRate}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-[#10AFA5] h-1.5 rounded-full" style={{ width: perfData.completionRate }}></div></div>

                            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 mt-2">
                              <span className="text-gray-500">Avg Response Time</span>
                              <span className="font-bold text-gray-900">{perfData.avgResponseTime}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-500">No performance data found.</p>
                    )}
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4 animate-fade-in relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {timelineLoading ? (
                      <div className="text-center py-10"><div className="animate-pulse h-4 w-24 bg-gray-200 rounded mx-auto" /></div>
                    ) : !timelineData || timelineData.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-10">No recent activity found for your jobs.</p>
                    ) : (
                      timelineData.map((log, index) => (
                        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-[#10AFA5] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <FiClock className="w-3 h-3" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-sm text-gray-900 capitalize">{log.status.replace('_', ' ')}</h4>
                            <p className="text-[10px] text-gray-500 font-semibold mb-1">Job: {log.jobId?.jobId}</p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">Failed to load engineer details.</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EngineerDetailsDrawer;
