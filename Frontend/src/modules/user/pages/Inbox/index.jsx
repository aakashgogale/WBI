import React from 'react';
import StaggerContainer from '../../../../components/common/StaggerContainer';
import StaggerItem from '../../../../components/common/StaggerItem';
import { FiSearch, FiEdit } from 'react-icons/fi';

const mockChats = [
  { id: 1, name: 'Kylee Danford', service: 'House Cleaning', lastMessage: 'I will arrive in 10 mins', time: '10:42 AM', unread: 2, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Alfonzo Schuessler', service: 'Floor Cleaning', lastMessage: 'Thanks for the feedback!', time: 'Yesterday', unread: 0, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Sanjuanita Ordonez', service: 'Washing Clothes', lastMessage: 'Could we reschedule to 4 PM?', time: 'Mon', unread: 1, avatar: 'https://i.pravatar.cc/150?u=3' },
];

const Inbox = () => {
  return (
    <div className="bg-brand-bg min-h-screen pb-[env(safe-area-inset-bottom)] pt-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 font-poppins">Inbox</h1>
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand">
          <FiEdit size={20} />
        </div>
      </div>

      {/* Search */}
      <div className="w-full flex items-center bg-white rounded-full h-[50px] px-5 mb-6 shadow-sm">
        <FiSearch className="text-gray-400 mr-3" size={20} />
        <input 
          type="text" 
          placeholder="Search messages..." 
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Chat List */}
      <StaggerContainer className="flex flex-col gap-4">
        {mockChats.map((chat) => (
          <StaggerItem key={chat.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
            <div className="relative">
              <img fetchPriority="low" loading="lazy" src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full object-cover" />
              {chat.unread > 0 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">{chat.unread}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-base font-bold text-gray-900 truncate">{chat.name}</h3>
                <span className="text-[12px] text-gray-500">{chat.time}</span>
              </div>
              <p className="text-xs text-brand font-medium mb-0.5">{chat.service}</p>
              <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                {chat.lastMessage}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
};

export default Inbox;
