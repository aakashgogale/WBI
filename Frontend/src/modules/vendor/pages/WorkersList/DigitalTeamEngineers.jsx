import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiPlus, FiDownload, FiUsers, FiUserCheck, FiBriefcase, 
  FiCalendar, FiLayers, FiStar, FiEye, FiEdit2, FiMoreVertical, 
  FiFilter, FiGrid, FiList, FiTrendingUp
} from 'react-icons/fi';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import api from '../../../../services/api';
import LogoLoader from '../../../../components/common/LogoLoader';
import toast from 'react-hot-toast';

const DigitalTeamEngineers = memo(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [membersData, setMembersData] = useState({ data: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [activeTab, setActiveTab] = useState('Team Overview');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [page, setPage] = useState(1);

  const tabs = ['Team Overview', 'Departments', 'Roles & Permissions', 'Skill Matrix', 'Availability Calendar'];

  // Fetch Overview Data once
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/vendors/team/overview');
        if (res.data?.success) {
          setOverviewData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching team overview:', error);
        toast.error('Failed to load team overview');
      }
    };
    fetchOverview();
  }, []);

  // Fetch Members whenever filters or page changes
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Add minimal delay for realistic debounce feel
        await new Promise(r => setTimeout(r, 300));
        
        const params = new URLSearchParams({
          page,
          limit: 8,
          search: searchQuery,
          department: deptFilter,
          role: roleFilter,
          status: statusFilter
        });

        const res = await api.get(`/vendors/team/members?${params.toString()}`);
        if (res.data?.success) {
          setMembersData(res.data);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce logic
    const timer = setTimeout(fetchMembers, 300);
    return () => clearTimeout(timer);
  }, [page, searchQuery, deptFilter, roleFilter, statusFilter]);

  if (!overviewData && loading) {
    return <LogoLoader />;
  }

  if (!overviewData) return null;

  const { stats, availability, departmentDistribution, topSkills, upcomingLeaves, recentJoiners } = overviewData;

  const renderPagination = () => {
    const { total, page, pages } = membersData.pagination;
    return (
      <div className="flex justify-between items-center py-4 text-sm text-gray-500 font-medium">
        <span>Showing {(page - 1) * 8 + 1} to {Math.min(page * 8, total)} of {total} members</span>
        <div className="flex gap-1 items-center">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            &lt;
          </button>
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg font-bold transition-colors ${page === i + 1 ? 'bg-[#0D8A72] text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {i + 1}
            </button>
          ))}
          <button 
             disabled={page === pages}
             onClick={() => setPage(p => Math.min(pages, p + 1))}
             className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
        <select className="border border-gray-200 rounded-lg px-3 py-1.5 outline-none font-bold text-gray-700 bg-white">
          <option>10 / page</option>
          <option>20 / page</option>
        </select>
      </div>
    );
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 pb-20">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-black text-[#0B1E36]">Team & Engineers</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Home &gt; Team & Engineers</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
            <FiDownload className="text-gray-400" /> Export Team Report
          </button>
          <button className="bg-[#0D8A72] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#0a6b58] transition-colors flex items-center gap-2">
            <FiPlus /> Add New Member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-gray-200 pb-px mb-6">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === tab ? 'text-[#0D8A72] border-[#0D8A72]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Team Overview' ? (
         <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
               <FiBriefcase size={24}/>
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-2">{activeTab} Modules</h3>
             <p className="text-sm text-gray-500 max-w-md">Detailed management for {activeTab} is accessible in dedicated sub-views or will be expanded based on your subscription plan.</p>
             <button onClick={() => setActiveTab('Team Overview')} className="mt-6 text-sm font-bold text-[#0D8A72] bg-teal-50 px-6 py-2 rounded-lg hover:bg-[#0D8A72] hover:text-white transition-colors">Return to Team Overview</button>
           </div>
      ) : (
      <>
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center group hover:border-[#0D8A72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3 group-hover:scale-110 transition-transform"><FiUsers /></div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Team Members</p>
            <p className="text-2xl font-black text-gray-800">{stats.totalMembers}</p>
            <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiTrendingUp className="mr-0.5"/> 12% <span className="text-gray-400 font-normal ml-1">vs last month</span></p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center group hover:border-[#0D8A72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-3 group-hover:scale-110 transition-transform"><FiUserCheck /></div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Active Members</p>
            <p className="text-2xl font-black text-gray-800">{stats.activeMembers}</p>
            <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiTrendingUp className="mr-0.5"/> 14% <span className="text-gray-400 font-normal ml-1">vs last month</span></p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center group hover:border-[#0D8A72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-3 group-hover:scale-110 transition-transform"><FiBriefcase /></div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">On Project</p>
            <p className="text-2xl font-black text-gray-800">{stats.onProject}</p>
            <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiTrendingUp className="mr-0.5"/> 10% <span className="text-gray-400 font-normal ml-1">vs last month</span></p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center group hover:border-[#0D8A72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#0D8A72] mb-3 group-hover:scale-110 transition-transform"><FiCalendar /></div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Available</p>
            <p className="text-2xl font-black text-gray-800">{stats.available}</p>
            <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiTrendingUp className="mr-0.5"/> 20% <span className="text-gray-400 font-normal ml-1">vs last month</span></p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center group hover:border-[#0D8A72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform"><FiLayers /></div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Departments</p>
            <p className="text-2xl font-black text-gray-800">{stats.departmentCount}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">--</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center group hover:border-[#0D8A72] transition-colors">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3 group-hover:scale-110 transition-transform"><FiStar /></div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Avg. Experience</p>
            <p className="text-2xl font-black text-gray-800">{stats.avgExperience} Years</p>
            <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiTrendingUp className="mr-0.5"/> 8% <span className="text-gray-400 font-normal ml-1">vs last month</span></p>
          </div>
        </div>

        {/* Main Content Grid: Left (Table) + Right (Charts & Info) */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Left Column (Span 3) - Team Members Table */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              
              {/* Table Header & Filters */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="font-bold text-gray-800 text-lg">Team Members</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input 
                      type="text" 
                      placeholder="Search team member..." 
                      className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0D8A72] w-56"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                  </div>
                  <select 
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none font-medium cursor-pointer"
                    value={deptFilter}
                    onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                  >
                    <option>All Departments</option>
                    {departmentDistribution.map(d => <option key={d.name}>{d.name}</option>)}
                  </select>
                  <select 
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none font-medium cursor-pointer"
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  >
                    <option>All Roles</option>
                    <option>Senior Full Stack Developer</option>
                    <option>Backend Developer</option>
                    <option>UI/UX Designer</option>
                    <option>Frontend Developer</option>
                    <option>SEO Specialist</option>
                    <option>QA Engineer</option>
                    <option>Project Manager</option>
                    <option>DevOps Engineer</option>
                  </select>
                  <select 
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none font-medium cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option>All Status</option>
                    <option>Available</option>
                    <option>On Project</option>
                    <option>On Leave</option>
                    <option>Bench</option>
                  </select>
                  <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                    <button onClick={()=>setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode==='grid'?'bg-white shadow text-[#0D8A72]':'text-gray-400'}`}><FiGrid/></button>
                    <button onClick={()=>setViewMode('list')} className={`p-1.5 rounded-md ${viewMode==='list'?'bg-white shadow text-[#0D8A72]':'text-gray-400'}`}><FiList/></button>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] uppercase text-gray-400 font-bold border-b border-gray-100">
                      <th className="pb-3 px-4 font-bold">Member</th>
                      <th className="pb-3 px-4 font-bold">Role</th>
                      <th className="pb-3 px-4 font-bold">Department</th>
                      <th className="pb-3 px-4 font-bold">Experience</th>
                      <th className="pb-3 px-4 font-bold">Skills</th>
                      <th className="pb-3 px-4 font-bold">Status</th>
                      <th className="pb-3 px-4 font-bold">Current Project</th>
                      <th className="pb-3 px-4 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" className="text-center py-10"><LogoLoader/></td></tr>
                    ) : membersData.data.length === 0 ? (
                       <tr><td colSpan="8" className="text-center py-10 text-gray-500 font-medium text-sm">No members found matching filters.</td></tr>
                    ) : (
                      membersData.data.map(member => (
                        <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img src={member.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8A72&color=fff`} alt={member.name} className="w-10 h-10 rounded-full shadow-sm" />
                              <div>
                                <p className="font-bold text-gray-800 text-sm whitespace-nowrap">{member.name}</p>
                                <p className="text-[10px] text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-gray-700 whitespace-nowrap">{member.roleId?.title || 'Engineer'}</td>
                          <td className="py-4 px-4 text-xs font-medium text-gray-600 whitespace-nowrap">{member.departmentId?.name || 'General'}</td>
                          <td className="py-4 px-4 text-xs font-medium text-gray-600 whitespace-nowrap">{member.experience}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-1 flex-wrap w-40">
                              {member.skills?.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-[10px] font-bold text-[#0D8A72] bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded">{skill.name}</span>
                              ))}
                              {member.skills?.length > 3 && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">+{member.skills.length - 3}</span>}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${
                              member.availabilityStatus === 'Available' ? 'bg-green-100 text-green-700' :
                              member.availabilityStatus === 'On Project' ? 'bg-orange-100 text-orange-700' :
                              member.availabilityStatus === 'On Leave' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>{member.availabilityStatus}</span>
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-gray-700 whitespace-nowrap">{member.currentProjectId?.title || '—'}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2 text-gray-400">
                              <button className="p-1 hover:text-[#0D8A72] hover:bg-teal-50 rounded transition-colors"><FiEye/></button>
                              <button className="p-1 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"><FiEdit2/></button>
                              <button className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"><FiMoreVertical/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {!loading && membersData.data.length > 0 && renderPagination()}
            </div>

            {/* Bottom Row inside Left Column: Upcoming Leaves & Availability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Leaves */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 text-sm">Upcoming Leaves</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View Calendar</span>
                </div>
                <div className="space-y-4">
                  {upcomingLeaves.map(leave => (
                    <div key={leave._id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img src={leave.memberId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.memberId?.name || 'U')}&background=f3f4f6`} alt="" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{leave.memberId?.name}</p>
                          <p className="text-[10px] text-gray-500">{leave.memberId?.roleId?.title}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div className="text-[10px] text-gray-500 font-medium">
                          {new Date(leave.startDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})} - {new Date(leave.endDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
                        </div>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">{leave.days} Days</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mt-2">
                    View Full Calendar
                  </button>
                </div>
              </div>

              {/* Availability Overview & Recent Joiners */}
              <div className="space-y-6">
                {/* Availability Bar */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                   <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 text-sm">Availability Overview</h3>
                    <select className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none"><option>This Week</option></select>
                  </div>
                  
                  {/* Custom Stacked Bar */}
                  <div className="h-4 w-full flex rounded-full overflow-hidden mb-3">
                    <div style={{ width: `${(availability.available/stats.totalMembers)*100}%` }} className="bg-[#10B981] h-full transition-all duration-1000"></div>
                    <div style={{ width: `${(availability.onProject/stats.totalMembers)*100}%` }} className="bg-[#3B82F6] h-full transition-all duration-1000"></div>
                    <div style={{ width: `${(availability.onLeave/stats.totalMembers)*100}%` }} className="bg-[#F59E0B] h-full transition-all duration-1000"></div>
                    <div style={{ width: `${(availability.bench/stats.totalMembers)*100}%` }} className="bg-gray-300 h-full transition-all duration-1000"></div>
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-[#10B981]">Available: {availability.available} ({((availability.available/stats.totalMembers)*100).toFixed(0)}%)</span>
                    <span className="text-[#3B82F6]">On Project: {availability.onProject} ({((availability.onProject/stats.totalMembers)*100).toFixed(0)}%)</span>
                    <span className="text-[#F59E0B]">On Leave: {availability.onLeave} ({((availability.onLeave/stats.totalMembers)*100).toFixed(0)}%)</span>
                    <span className="text-gray-500">Bench: {availability.bench}</span>
                  </div>
                </div>

                {/* Recent Joiners */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-sm">Recent Joiners</h3>
                    <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View All</span>
                  </div>
                  <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
                    {recentJoiners.map(j => (
                      <div key={j._id} className="flex gap-2 items-center min-w-[140px]">
                        <img src={j.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(j.name)}&background=10B981&color=fff`} className="w-10 h-10 rounded-full"/>
                        <div>
                          <p className="text-[11px] font-bold text-gray-800 leading-tight">{j.name}</p>
                          <p className="text-[9px] text-gray-500 leading-tight">{j.departmentId?.name}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Joined on {new Date(j.joiningDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Span 1) - Charts & Actions */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Department Distribution Donut */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-4">Department Distribution</h3>
              <div className="h-48 relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-800">{stats.totalMembers}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
                </div>
              </div>
              <div className="space-y-3">
                {departmentDistribution.map((dept, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }}></div>
                      <span className="font-medium text-gray-600">{dept.name}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold text-gray-800">{dept.value}</span>
                      <span className="text-gray-400 w-10 text-right">({dept.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Skills In Team */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 text-sm mb-4">Top Skills In Team</h3>
               <div className="flex flex-wrap gap-2 mb-6">
                 {topSkills.map((skill, i) => (
                   <div key={i} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-[#0D8A72] hover:bg-teal-50 transition-colors cursor-pointer">
                     <span className="text-[11px] font-medium text-gray-700">{skill.name}</span>
                     <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 rounded">{skill.count}</span>
                   </div>
                 ))}
               </div>
               <button className="text-xs font-bold text-[#0D8A72] text-center w-full hover:underline">View All Skills</button>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 text-sm mb-4">Quick Actions</h3>
               <div className="grid grid-cols-2 gap-3">
                 <button className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[#0D8A72] hover:text-white group transition-colors rounded-xl p-4 border border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0D8A72] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors"><FiPlus className="w-5 h-5"/></div>
                   <span className="text-[10px] font-bold text-gray-700 group-hover:text-white text-center">Add New Member</span>
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[#0D8A72] hover:text-white group transition-colors rounded-xl p-4 border border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors"><FiUsers className="w-5 h-5"/></div>
                   <span className="text-[10px] font-bold text-gray-700 group-hover:text-white text-center">Invite Member</span>
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[#0D8A72] hover:text-white group transition-colors rounded-xl p-4 border border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors"><FiBriefcase className="w-5 h-5"/></div>
                   <span className="text-[10px] font-bold text-gray-700 group-hover:text-white text-center">Assign to Project</span>
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[#0D8A72] hover:text-white group transition-colors rounded-xl p-4 border border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors"><FiUserCheck className="w-5 h-5"/></div>
                   <span className="text-[10px] font-bold text-gray-700 group-hover:text-white text-center">Manage Roles</span>
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[#0D8A72] hover:text-white group transition-colors rounded-xl p-4 border border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors"><FiStar className="w-5 h-5"/></div>
                   <span className="text-[10px] font-bold text-gray-700 group-hover:text-white text-center">Skill Assessment</span>
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[#0D8A72] hover:text-white group transition-colors rounded-xl p-4 border border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors"><FiDownload className="w-5 h-5"/></div>
                   <span className="text-[10px] font-bold text-gray-700 group-hover:text-white text-center">Team Report</span>
                 </button>
               </div>
            </div>

          </div>

        </div>
      </>
      )}
    </div>
  );
});

DigitalTeamEngineers.displayName = 'DigitalTeamEngineers';
export default DigitalTeamEngineers;
