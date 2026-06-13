import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiPlus, FiDownload, FiUsers, FiUserCheck, FiBriefcase, 
  FiCalendar, FiLayers, FiStar, FiEye, FiEdit2, FiMoreVertical, 
  FiGrid, FiList, FiTrendingUp, FiTrendingDown, FiClock, FiCheckCircle, FiActivity, FiMail
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
  
  // Data States
  const [overviewData, setOverviewData] = useState(null);
  const [membersData, setMembersData] = useState({ data: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [availability, setAvailability] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  // Metadata States
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // UI States
  const [activeTab, setActiveTab] = useState('Team Members');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [viewMode, setViewMode] = useState('list');
  const [page, setPage] = useState(1);

  const tabs = ['Team Members', 'Roles & Departments', 'Skill Matrix', 'Project Assignment', 'Performance', 'Availability', 'Leave & Calendar'];

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [overviewRes, availRes, perfRes, leavesRes, actRes, assignRes, deptRes, roleRes] = await Promise.all([
          api.get('/vendors/team/overview'),
          api.get('/vendors/team/availability'),
          api.get('/vendors/team/performance'),
          api.get('/vendors/team/leaves'),
          api.get('/vendors/team/activity'),
          api.get('/vendors/team/assignments'),
          api.get('/vendors/team/departments'),
          api.get('/vendors/team/roles')
        ]);
        
        if(overviewRes.data?.success) setOverviewData(overviewRes.data.data);
        if(availRes.data?.success) setAvailability(availRes.data.data);
        if(perfRes.data?.success) setPerformance(perfRes.data.data);
        if(leavesRes.data?.success) setLeaves(leavesRes.data.data);
        if(actRes.data?.success) setActivities(actRes.data.data);
        if(assignRes.data?.success) setAssignments(assignRes.data.data);
        if(deptRes.data?.success) setDepartments(deptRes.data.data);
        if(roleRes.data?.success) setRoles(roleRes.data.data);
        
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 7, search: searchQuery, department: deptFilter, role: roleFilter, status: statusFilter });
        const res = await api.get(`/vendors/team/members?${params.toString()}`);
        if (res.data?.success) setMembersData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchMembers, 300);
    return () => clearTimeout(timer);
  }, [page, searchQuery, deptFilter, roleFilter, statusFilter]);

  if (!overviewData && loading) return <LogoLoader />;
  if (!overviewData) return null;

  const { stats } = overviewData;

  const renderPagination = () => {
    const { total, page, pages } = membersData.pagination;
    return (
      <div className="flex justify-between items-center py-4 text-xs text-gray-500 font-medium">
        <span>Showing {(page - 1) * 7 + 1} to {Math.min(page * 7, total)} of {total} members</span>
        <div className="flex gap-1 items-center">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50">&lt;</button>
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-6 h-6 rounded font-bold transition-colors ${page === i + 1 ? 'bg-white text-[#0D8A72] shadow border border-gray-200' : 'hover:bg-gray-100 text-gray-600'}`}>{i + 1}</button>
          ))}
          <button disabled={page === pages} onClick={() => setPage(p => Math.min(pages, p + 1))} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50">&gt;</button>
        </div>
        <select className="border border-gray-200 rounded px-2 py-1 outline-none font-bold text-gray-700 bg-white">
          <option>10 / page</option>
        </select>
      </div>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400 text-xs">
        {[1,2,3,4,5].map(s => <FiStar key={s} className={s <= Math.round(rating) ? "fill-current" : "text-gray-200"} />)}
      </div>
    );
  };

  const skillColors = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#14B8A6', '#F59E0B'];
  const skillData = overviewData?.topSkills?.slice(0, 6) || [];

  const resourceData = [
    { name: 'Available', value: availability?.visual?.available || 0, color: '#10B981' },
    { name: 'On Leave', value: availability?.visual?.partialLoad || 0, color: '#F59E0B' },
    { name: 'On Project', value: availability?.visual?.fullyAssigned || 0, color: '#EF4444' }
  ].filter(r => r.value > 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
      {/* Header */}
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

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Team Members', value: stats.totalMembers, bg: 'bg-purple-50', icon: <FiUsers className="text-purple-600"/>, trend: '+12%', up: true },
          { title: 'Active Developers', value: stats.activeDevelopers, bg: 'bg-green-50', icon: <FiUserCheck className="text-green-600"/>, trend: '+10%', up: true },
          { title: 'Available', value: stats.available, bg: 'bg-blue-50', icon: <FiCalendar className="text-blue-500"/>, trend: '+20%', up: true },
          { title: 'Assigned Projects', value: stats.assignedProjects, bg: 'bg-orange-50', icon: <FiBriefcase className="text-orange-500"/>, trend: '+15%', up: true },
          { title: 'Open Tasks', value: stats.openTasks, bg: 'bg-red-50', icon: <FiCheckCircle className="text-red-500"/>, trend: '-5%', up: false },
          { title: 'Team Utilization', value: `${stats.teamUtilization}%`, bg: 'bg-indigo-50', icon: <FiActivity className="text-indigo-500"/>, trend: '+8%', up: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>{stat.icon}</div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{stat.title}</p>
                <p className="text-2xl font-black text-gray-800 leading-none mt-1">{stat.value}</p>
              </div>
            </div>
            <p className={`text-[10px] font-bold flex items-center mt-1 ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
              {stat.up ? <FiTrendingUp className="mr-1"/> : <FiTrendingDown className="mr-1"/>} {stat.trend} 
              <span className="text-gray-400 font-normal ml-1">vs last month</span>
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-6 border-b border-gray-200 pb-px">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === tab ? 'text-[#0D8A72] border-[#0D8A72]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeTab === 'Team Members' ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Left Column (Span 3) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Table Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="font-bold text-gray-800 text-lg">Team Members</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input 
                      type="text" 
                      placeholder="Search member..." 
                      className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0D8A72] w-52"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                  </div>
                  <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none font-medium" value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
                    <option>All Departments</option>
                    {departments.map(d => <option key={d._id}>{d.name}</option>)}
                  </select>
                  <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none font-medium" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
                    <option>All Roles</option>
                    {roles.map(r => <option key={r._id}>{r.title}</option>)}
                  </select>
                  <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none font-medium" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option>All Status</option>
                    <option>Available</option>
                    <option>On Project</option>
                    <option>On Leave</option>
                  </select>
                  <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                    <button onClick={()=>setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode==='grid'?'bg-white shadow text-[#0D8A72]':'text-gray-400'}`}><FiGrid/></button>
                    <button onClick={()=>setViewMode('list')} className={`p-1.5 rounded-md ${viewMode==='list'?'bg-white shadow text-[#0D8A72]':'text-gray-400'}`}><FiList/></button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] uppercase text-gray-400 font-bold border-b border-gray-100">
                      <th className="pb-3 px-2 font-bold">Member</th>
                      <th className="pb-3 px-2 font-bold">Role</th>
                      <th className="pb-3 px-2 font-bold">Department</th>
                      <th className="pb-3 px-2 font-bold">Experience</th>
                      <th className="pb-3 px-2 font-bold">Skills</th>
                      <th className="pb-3 px-2 font-bold">Current Project</th>
                      <th className="pb-3 px-2 font-bold">Status</th>
                      <th className="pb-3 px-2 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" className="text-center py-10"><LogoLoader/></td></tr>
                    ) : membersData.data.map(member => (
                      <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-xs">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <img src={member.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f3f4f6&color=333`} alt="" className="w-8 h-8 rounded-full" />
                            <div>
                              <p className="font-bold text-gray-800 whitespace-nowrap">{member.name}</p>
                              <p className="text-[10px] text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-bold text-gray-700 whitespace-nowrap">{member.roleId?.title}</td>
                        <td className="py-3 px-2 font-medium text-gray-600 whitespace-nowrap">{member.departmentId?.name}</td>
                        <td className="py-3 px-2 font-medium text-gray-600 whitespace-nowrap">{member.experience}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1 flex-wrap w-36">
                            {member.skills?.slice(0, 2).map((s, i) => <span key={i} className="text-[9px] font-bold text-[#0D8A72] bg-teal-50 border border-teal-100 px-1 py-0.5 rounded">{s.name}</span>)}
                            {member.skills?.length > 2 && <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1 py-0.5 rounded">+{member.skills.length - 2}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {member.currentProject ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-700">{member.currentProject}</span>
                              <span className="text-[10px] text-gray-500">{member.currentProjectProgress}%</span>
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="py-3 px-2">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                              member.availabilityStatus === 'Available' ? 'bg-green-100 text-green-700' :
                              member.availabilityStatus === 'On Project' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>{member.availabilityStatus === 'On Project' ? 'Busy' : member.availabilityStatus}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-1 text-gray-400">
                            <button className="p-1 hover:text-[#0D8A72] hover:bg-teal-50 rounded transition-colors"><FiEye/></button>
                            <button className="p-1 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"><FiEdit2/></button>
                            <button className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"><FiMoreVertical/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && membersData.data.length > 0 && renderPagination()}
            </div>

            {/* Sub-cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Project Assignment Board */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Project Assignment Board</h3>
                <div className="space-y-4">
                  {assignments.slice(0, 4).map(a => (
                    <div key={a._id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <img src={a.memberId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.memberId?.name || 'U')}`} className="w-6 h-6 rounded-full"/>
                        <div>
                          <p className="font-bold text-gray-800">{a.memberId?.name}</p>
                          <p className="text-[9px] text-gray-500">{a.projectName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0D8A72]" style={{width: `${a.progress}%`}}></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600">{a.progress}%</span>
                      </div>
                      <button className="text-[10px] font-bold text-[#0D8A72] bg-teal-50 px-2 py-1 rounded hover:bg-[#0D8A72] hover:text-white transition-colors">Reassign</button>
                    </div>
                  ))}
                  <button className="w-full text-center text-xs font-bold text-[#0D8A72] hover:underline mt-2">View All Assignments &rarr;</button>
                </div>
              </div>

              {/* Performance Leaderboard */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 text-sm">Performance Leaderboard</h3>
                  <span className="text-[10px] text-gray-500 border border-gray-200 rounded px-1 py-0.5">This Month v</span>
                </div>
                <div className="space-y-3">
                  {performance.slice(0, 5).map((p, i) => (
                    <div key={p._id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${i===0?'bg-yellow-100 text-yellow-600':i===1?'bg-gray-100 text-gray-600':i===2?'bg-orange-100 text-orange-600':'bg-gray-50 text-gray-400'}`}>{i+1}</div>
                        <img src={p.memberId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.memberId?.name || 'U')}`} className="w-6 h-6 rounded-full"/>
                        <div>
                          <p className="font-bold text-gray-800">{p.memberId?.name}</p>
                          <p className="text-[9px] text-gray-500">{p.completedTasks} Projects</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          {renderStars(p.rating)}
                          <span className="font-bold text-gray-800 ml-1">{p.rating}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold">{p.productivityPercentage}%</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-center text-xs font-bold text-[#0D8A72] hover:underline mt-2">View Full Performance &rarr;</button>
                </div>
              </div>

              {/* Leave & Availability */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 text-sm">Leave & Availability</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer hover:underline">View Calendar</span>
                </div>
                <p className="text-[11px] font-bold text-gray-500 mb-3 uppercase">Upcoming Leaves</p>
                <div className="space-y-4">
                  {leaves.map((l, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={l.memberId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.memberId?.name || 'U')}`} className="w-8 h-8 rounded-full"/>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{l.memberId?.name}</p>
                          <p className="text-[9px] text-gray-500">{l.memberId?.roleId?.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-medium">
                          {new Date(l.startDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})} - {new Date(l.endDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
                        </p>
                        <span className="text-[10px] font-bold text-red-500">{l.days} Days</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-center text-xs font-bold text-[#0D8A72] hover:underline mt-4">View Full Calendar &rarr;</button>
                </div>
              </div>
            </div>

            {/* Sub-cards Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invite/Add Members */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                <h3 className="font-bold text-gray-800 text-sm mb-1">Invite / Add Members</h3>
                <p className="text-xs text-gray-500 mb-4">Invite new talent to your team</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button className="bg-[#10B981] text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#059669] transition"><FiPlus/> Add Developer</button>
                  <button className="bg-[#8B5CF6] text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#7C3AED] transition"><FiPlus/> Add Designer</button>
                  <button className="bg-[#F59E0B] text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#D97706] transition"><FiPlus/> Add QA Engineer</button>
                  <button className="bg-[#3B82F6] text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#2563EB] transition"><FiPlus/> Add DevOps</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="border border-gray-200 text-gray-600 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"><FiMail/> Invite by Email</button>
                  <button className="border border-gray-200 text-gray-600 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"><FiLayers/> Bulk Invite</button>
                </div>
              </div>

              {/* Team Activity Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Team Activity Timeline</h3>
                <div className="space-y-4">
                  {activities.slice(0, 4).map((act, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${i===0?'bg-orange-500':i===1?'bg-green-500':i===2?'bg-blue-500':'bg-yellow-500'}`}></div>
                        {i !== 3 && <div className="w-px h-full bg-gray-100 mt-1"></div>}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-xs text-gray-700 font-medium">{act.description}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap mt-1">
                        {new Date(act.createdAt).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full text-center text-xs font-bold text-[#0D8A72] hover:underline mt-4">View All Activity &rarr;</button>
              </div>
            </div>

          </div>

          {/* Right Column (Span 1) */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Skill Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-6">Skill Distribution</h3>
              <div className="h-40 relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={skillData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                      {skillData.map((entry, index) => <Cell key={`cell-${index}`} fill={skillColors[index % skillColors.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-800">{stats.totalMembers}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
                </div>
              </div>
              <div className="space-y-3">
                {skillData.map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: skillColors[i]}}></div>
                      <span className="font-bold text-gray-700">{s.name}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-bold text-gray-800">{s.value}</span>
                      <span className="text-gray-400 w-8 text-right">({s.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Availability */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-6">Resource Availability</h3>
              <div className="h-40 relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={resourceData} innerRadius={55} outerRadius={65} paddingAngle={0} dataKey="value" stroke="none">
                      {resourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-800">{availability?.visual?.total || 28}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
                </div>
              </div>
              <div className="space-y-3">
                {resourceData.map((r, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: r.color}}></div>
                      <span className="font-bold text-gray-700">{r.name}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-bold text-gray-800">{r.value}</span>
                      <span className="text-gray-400 w-8 text-right">({Math.round((r.value / (availability?.visual?.total||28)) * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4 text-[#0D8A72]">
            <FiLayers size={24}/>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{activeTab}</h3>
          <p className="text-sm text-gray-500 max-w-md">The detailed view and management features for {activeTab} will be populated dynamically from the backend as per module specifications.</p>
          <button onClick={() => setActiveTab('Team Members')} className="mt-6 text-sm font-bold text-[#0D8A72] bg-teal-50 px-6 py-2 rounded-lg hover:bg-[#0D8A72] hover:text-white transition-colors">Return to Team Members</button>
        </div>
      )}
    </div>
  );
});

DigitalTeamEngineers.displayName = 'DigitalTeamEngineers';
export default DigitalTeamEngineers;
