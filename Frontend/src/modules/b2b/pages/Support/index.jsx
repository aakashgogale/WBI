import React, { useState } from 'react';
import { FiHelpCircle, FiSend, FiMessageSquare, FiPhone, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Support = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tickets = [
    { id: 'TKT-1080', subject: 'Invoicing correction for Hyderabad', status: 'Open', date: '27 June 2026' },
    { id: 'TKT-1025', subject: 'Branch address update request', status: 'Closed', date: '21 June 2026' }
  ];

  const handleSendTicket = (e) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please fill in both subject and message');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubject('');
      setMessage('');
      toast.success('Ticket submitted successfully! Our support manager will call you shortly.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Contact Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
          <div className="border-b border-gray-50 pb-4 mb-6">
            <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Raise Priority Ticket</h3>
          </div>

          <form onSubmit={handleSendTicket} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Subject *</label>
              <input 
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly state the issue..."
                className="w-full h-10 border border-gray-200 text-xs rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Description *</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detail your request or issue..."
                className="w-full h-32 border border-gray-200 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#10AFA5] hover:bg-[#0D9488] disabled:bg-gray-200 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-teal-500/10 flex items-center gap-1.5 transition-colors ml-auto block"
            >
              <FiSend />
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Priority contact card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F0FDFA] border border-[#10AFA5]/10 rounded-3xl p-6 text-center space-y-3">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-[#10AFA5] mx-auto shadow-sm">
              <FiPhone className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-gray-800">Priority Partner Hotline</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Our B2B helpdesk is active 24/7 for verified corporate partners.
            </p>
            <span className="block text-sm font-black text-gray-800">+91 1800 210 500</span>
          </div>

          {/* Tickets history */}
          <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide mb-4">Ticket Logs</h3>

            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="border border-gray-50 rounded-xl p-3 bg-gray-50/50 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-400">{t.id}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      t.status === 'Open' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 truncate">{t.subject}</p>
                  <p className="text-[9px] text-gray-400 font-semibold mt-1">Created: {t.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Support;
