import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEdit, FiShare2, FiDownload, FiMapPin, FiMail, FiPhone, FiGlobe, 
  FiClock, FiCheckCircle, FiStar, FiFileText, FiLock, FiBell, FiShield,
  FiUploadCloud, FiTrash2, FiEye, FiPlus, FiChevronRight, FiBriefcase, FiArrowUpRight,
  FiDollarSign, FiMessageSquare
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import api from '../../../../services/api';
import LogoLoader from '../../../../components/common/LogoLoader';
import toast from 'react-hot-toast';

const DigitalProfile = memo(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Company Details', 'Team & Engineers', 'Services', 'Documents', 'Bank Details', 'Preferences', 'Security'];

  useEffect(() => {
    const fetchDigitalProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vendors/profile/digital');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching digital profile:', error);
        toast.error('Failed to load digital profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchDigitalProfile();
  }, []);

  if (loading || !data) {
    return <LogoLoader />;
  }

  const { vendor, stats, team, services, portfolio, documents } = data;

  const renderTabContent = () => {
    switch(activeTab) {
      case 'Overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Company Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Company Information</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">Edit</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Company Name</span>
                    <span className="font-bold text-gray-800">{vendor.businessName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Company Type</span>
                    <span className="font-bold text-gray-800">{vendor.companyType}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500 font-medium">GST Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{vendor.gstin}</span>
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold">Verified</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">PAN Number</span>
                    <span className="font-bold text-gray-800">{vendor.pan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">CIN Number</span>
                    <span className="font-bold text-gray-800">{vendor.cin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Business Email</span>
                    <span className="font-bold text-gray-800">{vendor.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Phone Number</span>
                    <span className="font-bold text-gray-800">{vendor.phone}</span>
                  </div>
                </div>
              </div>

              {/* Registered Address */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Registered Address</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">Edit</span>
                </div>
                <p className="text-sm text-gray-800 font-medium leading-relaxed mb-4">
                  {vendor.address?.fullAddress || `${vendor.address?.addressLine1 || ''} ${vendor.address?.city || ''} - ${vendor.address?.pincode || ''}, ${vendor.address?.state || ''}`}
                </p>
                <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(vendor.address?.city || 'Mumbai')}&zoom=12&size=400x200&maptype=roadmap&markers=color:green%7C${encodeURIComponent(vendor.address?.city || 'Mumbai')}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}')` }}>
                  <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none"></div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.address?.fullAddress || vendor.address?.city || 'Mumbai')}`, '_blank')}
                    className="bg-[#0D8A72] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-[#0a6b58] transition-colors z-10"
                  >
                    View on Map
                  </button>
                </div>
                <h4 className="text-xs font-bold text-[#0D8A72] mb-1">Service Coverage Area</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Mumbai, Thane, Navi Mumbai, Pune, Bengaluru, Hyderabad, Delhi NCR & Remote</p>
              </div>

              {/* Service Portfolio */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Service Portfolio</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">Edit</span>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex text-[10px] text-gray-400 font-bold uppercase pb-2 border-b border-gray-50">
                    <div className="w-1/2">Service</div>
                    <div className="w-1/4 text-right">Starting Price</div>
                    <div className="w-1/4 text-right">Delivery</div>
                  </div>
                  {services.map((s, i) => (
                    <div key={i} className="flex text-sm items-center">
                      <div className="w-1/2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-500"><FiBriefcase className="w-3 h-3"/></div>
                        <span className="font-bold text-gray-700">{s.serviceName}</span>
                      </div>
                      <div className="w-1/4 text-right font-bold text-gray-800">₹{s.startingPrice.toLocaleString()}</div>
                      <div className="w-1/4 text-right text-gray-500 text-xs">{s.deliveryTime}</div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 border border-dashed border-gray-300 text-[#0D8A72] font-bold text-sm rounded-lg flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors">
                  <FiPlus/> Add New Service
                </button>
              </div>
            </div>

            {/* Team & Engineers */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Team & Engineers ({team.length})</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View All</span>
                </div>
                <div className="flex gap-4 min-w-max pb-2">
                  {team.map((member, i) => (
                    <div key={i} className="w-48 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center">
                      <img src={member.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8A72&color=fff`} alt={member.name} className="w-16 h-16 rounded-full mb-3 shadow-sm"/>
                      <h4 className="font-bold text-gray-800 text-sm text-center line-clamp-1">{member.name}</h4>
                      <p className="text-[10px] text-gray-500 text-center mb-3">{member.role}</p>
                      <div className="w-full flex justify-between items-center mt-auto">
                        <span className="text-[10px] font-bold text-gray-400">{member.experience}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${member.status==='ONLINE'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-700'}`}>{member.status === 'ONLINE' ? 'Available' : 'Busy'}</span>
                      </div>
                    </div>
                  ))}
                  <div className="w-48 bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-400 hover:text-[#0D8A72]">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2"><FiPlus className="w-6 h-6"/></div>
                    <span className="font-bold text-sm">Add Member</span>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Certifications */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Certifications</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View All</span>
                </div>
                <div className="space-y-4 mb-6">
                  {documents.certifications.map((cert, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500"><FiFileText className="w-4 h-4"/></div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 leading-none">{cert.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase">{(cert.fileSize/1000000).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cert.status==='Verified'?'bg-green-100 text-green-700':cert.status==='Pending'?'bg-orange-100 text-orange-700':'bg-red-100 text-red-700'}`}>{cert.status}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 text-[#0D8A72] font-bold text-xs flex justify-center items-center gap-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <FiPlus/> Upload New Certificate
                </button>
              </div>

              {/* Bank Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Bank Details</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">Edit</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Account Holder Name</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{vendor.bankDetails?.accountName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Bank Name</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{vendor.bankDetails?.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Account Number</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{vendor.bankDetails?.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">IFSC Code</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{vendor.bankDetails?.ifscCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">UPI ID</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{vendor.bankDetails?.upiId}</p>
                  </div>
                  <div className="mt-4 bg-green-50 rounded-lg p-3 flex items-start gap-2">
                    <FiCheckCircle className="text-green-600 mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-xs font-bold text-green-800">Verified</p>
                      <p className="text-[10px] text-green-600">Bank details verified by WBI Admin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Performance Overview</h3>
                  <select className="text-xs border-none bg-gray-50 rounded px-2 py-1 outline-none font-medium text-gray-600"><option>This Month</option></select>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Total Projects</p>
                    <p className="text-lg font-black text-gray-800 mt-1">{stats.totalProjects}</p>
                    <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiArrowUpRight className="mr-0.5"/> 18%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Active Projects</p>
                    <p className="text-lg font-black text-gray-800 mt-1">{stats.activeProjects}</p>
                    <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiArrowUpRight className="mr-0.5"/> 12%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Completed</p>
                    <p className="text-lg font-black text-gray-800 mt-1">{stats.completedProjects}</p>
                    <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiArrowUpRight className="mr-0.5"/> 22%</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Total Earnings</p>
                      <p className="text-2xl font-black text-gray-800">₹{stats.totalEarnings.toLocaleString()}</p>
                      <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiArrowUpRight className="mr-0.5"/> 16% <span className="text-gray-400 font-normal ml-1">vs last month</span></p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Earnings Overview</span>
                  </div>
                  <div className="h-28 w-full mt-auto">
                     <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.revenueChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <RechartsTooltip contentStyle={{ fontSize: '10px' }}/>
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Showcase */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Portfolio Showcase</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View All</span>
                </div>
                <div className="flex gap-4 min-w-max pb-2">
                  {portfolio.map((item, i) => (
                    <div key={i} className="w-56 group cursor-pointer">
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-3 relative">
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-[#0D8A72]"><FiEye size={14}/></div>
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-[#0D8A72]"><FiEdit size={14}/></div>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.serviceType}</p>
                    </div>
                  ))}
                  <div className="w-56 bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-400 hover:text-[#0D8A72] h-[170px]">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2"><FiPlus className="w-6 h-6"/></div>
                    <span className="font-bold text-sm">Add New Project</span>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Documents Vault */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Documents Vault</h3>
                  <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View All</span>
                </div>
                <div className="space-y-4">
                  {documents.vault.map((doc, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-gray-500"><FiFileText className="w-4 h-4"/></div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 leading-none">{doc.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1">Uploaded on {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{(doc.fileSize/1000000).toFixed(1)} MB</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Notification Preferences</h3>
                </div>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <FiMail className="text-gray-400 mt-0.5"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Email Notifications</p>
                        <p className="text-[10px] text-gray-400">Receive updates on your email</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <div className="w-9 h-5 bg-[#0D8A72] rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <FiPhone className="text-gray-400 mt-0.5"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">WhatsApp Notifications</p>
                        <p className="text-[10px] text-gray-400">Receive updates on WhatsApp</p>
                      </div>
                    </div>
                    <div className="w-9 h-5 bg-[#0D8A72] rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <FiBell className="text-gray-400 mt-0.5"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Push Notifications</p>
                        <p className="text-[10px] text-gray-400">Receive push notifications</p>
                      </div>
                    </div>
                    <div className="w-9 h-5 bg-[#0D8A72] rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <FiDollarSign className="text-gray-400 mt-0.5"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Payment Alerts</p>
                        <p className="text-[10px] text-gray-400">Get notified for payments</p>
                      </div>
                    </div>
                    <div className="w-9 h-5 bg-[#0D8A72] rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <FiStar className="text-gray-400 mt-0.5"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Milestone Alerts</p>
                        <p className="text-[10px] text-gray-400">Get notified for milestones</p>
                      </div>
                    </div>
                    <div className="w-9 h-5 bg-[#0D8A72] rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Center */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Security Center</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <FiLock className="text-gray-400 group-hover:text-[#0D8A72]"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Change Password</p>
                        <p className="text-[10px] text-gray-400">Update your account password</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-300 group-hover:text-[#0D8A72]"/>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <FiShield className="text-gray-400 group-hover:text-[#0D8A72]"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Two Factor Authentication</p>
                        <p className="text-[10px] text-gray-400">Add extra security to your account</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#0D8A72] bg-teal-50 px-2 py-0.5 rounded">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <FiEye className="text-gray-400 group-hover:text-[#0D8A72]"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Login Devices</p>
                        <p className="text-[10px] text-gray-400">Manage your active sessions</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-300 group-hover:text-[#0D8A72]"/>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <FiClock className="text-gray-400 group-hover:text-[#0D8A72]"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Login History</p>
                        <p className="text-[10px] text-gray-400">See recent login activities</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-300 group-hover:text-[#0D8A72]"/>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500">Last Login: {new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[10px] text-gray-400">IP: 103.21.45.67</p>
                  </div>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded">This Device</span>
                </div>
              </div>
            </div>

          </div>
        );
      default:
        return (
           <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
               <FiBriefcase size={24}/>
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-2">{activeTab} Details</h3>
             <p className="text-sm text-gray-500 max-w-md">Detailed view for {activeTab} is accessible directly from the Overview dashboard panels or will be expanded in future modules.</p>
             <button onClick={() => setActiveTab('Overview')} className="mt-6 text-sm font-bold text-[#0D8A72] bg-teal-50 px-6 py-2 rounded-lg hover:bg-[#0D8A72] hover:text-white transition-colors">Return to Overview</button>
           </div>
        );
    }
  };




  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-black text-[#0B1E36]">My Profile</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage your company profile, team, services & settings</p>
        </div>
        <button 
          onClick={() => navigate('/vendor/digital-solution/profile/edit')}
          className="bg-[#0D8A72] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#0a6b58] transition-colors flex items-center gap-2"
        >
          <FiEdit/> Edit Profile
        </button>
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

      {/* Top Main Overview Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        {/* Profile Circle */}
        <div className="flex flex-col items-center shrink-0 relative z-10">
          <div className="w-28 h-28 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-4 border-white flex items-center justify-center p-1 relative overflow-hidden">
             {vendor.profilePhoto ? (
                <img src={vendor.profilePhoto} alt={vendor.businessName} className="w-full h-full object-cover rounded-full" />
             ) : (
                <div className="w-full h-full bg-[#0B1E36] rounded-full flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{vendor.businessName?.charAt(0) || 'W'}</span>
                </div>
             )}
          </div>
          <button className="w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center absolute bottom-7 -right-1 text-gray-500 hover:text-[#0D8A72] z-20">
            <FiEdit size={12}/>
          </button>
          
          {/* Star Rating below */}
          <div className="flex items-center gap-1 mt-4 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
            <FiStar className="text-yellow-500 fill-yellow-500 w-3 h-3"/>
            <span className="text-xs font-bold text-gray-800">{vendor.rating}</span>
            <span className="text-[10px] text-gray-500 font-medium">({vendor.totalReviews} Reviews)</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left relative z-10 pt-2">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h2 className="text-2xl font-black text-gray-800">{vendor.businessName}</h2>
            <div className="w-5 h-5 rounded-full bg-[#0D8A72] text-white flex items-center justify-center"><FiCheckCircle size={12}/></div>
          </div>
          <p className="text-sm font-bold text-[#0D8A72] mb-3">Premium Verified Vendor</p>
          <p className="text-sm text-gray-500 max-w-lg leading-relaxed mb-6">
            We build modern, scalable and result-driven digital solutions for businesses of all sizes.
          </p>

          {/* Micro Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-8 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><FiClock/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Active Since</p>
                <p className="text-sm font-bold text-gray-800">{new Date(vendor.activeSince).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><FiBriefcase/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Total Projects</p>
                <p className="text-sm font-bold text-gray-800">{stats.totalProjects}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500"><FiCheckCircle/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Completion Rate</p>
                <p className="text-sm font-bold text-gray-800">{stats.completionRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500"><FiMessageSquare/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Avg. Response Time</p>
                <p className="text-sm font-bold text-gray-800">{stats.avgResponseTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions & Completion Ring */}
        <div className="flex flex-col md:flex-row items-center gap-8 shrink-0 relative z-10 pt-2">
          
          {/* Profile Completion Donut */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 relative mb-2">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
                <path className="text-[#0D8A72]" strokeDasharray={`${stats.profileCompletion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#0D8A72]">{stats.profileCompletion}%</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Profile Completion</span>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3 min-w-[180px]">
            <p className="text-xs font-bold text-gray-800 mb-1">Quick Actions</p>
            <button 
              onClick={() => navigate('/vendor/digital-solution/profile/edit')}
              className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-xs font-bold text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2"><FiEdit className="text-gray-400"/> Edit Profile</span>
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Profile link copied to clipboard!');
              }}
              className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-xs font-bold text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2"><FiShare2 className="text-gray-400"/> Share Profile</span>
            </button>
            <button 
              onClick={() => {
                toast.success('Profile PDF download started!');
              }}
              className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-xs font-bold text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2"><FiDownload className="text-gray-400"/> Download Profile PDF</span>
            </button>
          </div>
        </div>

        {/* Soft Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0D8A72]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
      </div>

      {/* Render Selected Tab */}
      <div className="pb-10">
        {renderTabContent()}
      </div>

    </div>
  );
});




DigitalProfile.displayName = 'DigitalProfile';
export default DigitalProfile;
