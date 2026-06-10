import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPhoneCall, FiMail, FiMessageCircle, FiHelpCircle, FiChevronRight } from 'react-icons/fi';
import Header from '../../components/layout/Header';

const Support = () => {
  const navigate = useNavigate();

  const faqs = [
    { q: "How do I get more one-time jobs?", a: "Make sure your profile is complete, keep your service radius updated, and stay online during working hours." },
    { q: "When will I get paid?", a: "Payments are processed within 24 hours after a job is marked as completed by both you and the customer." },
    { q: "What if a customer cancels?", a: "If a customer cancels after you have reached the location, you will be compensated with a base visitation charge." }
  ];

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] ">
      <Header title="Help & Support" showBack={true} onBack={() => navigate(-1)} />
      
      <main className="px-5 pt-6 max-w-md mx-auto space-y-6">
        
        {/* Contact Methods */}
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Contact Us</h3>
          
          <a href="tel:+919876543210" className="flex items-center justify-between p-4 bg-teal-50 rounded-2xl border border-teal-100 hover:bg-teal-100 transition-colors active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm">
                <FiPhoneCall />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Call Support</h4>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Available 9 AM - 6 PM</p>
              </div>
            </div>
            <FiChevronRight className="text-teal-400" />
          </a>

          <a href="mailto:support@wbi.com" className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                <FiMail />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Email Us</h4>
                <p className="text-xs font-medium text-gray-500 mt-0.5">support@wbi.com</p>
              </div>
            </div>
            <FiChevronRight className="text-blue-400" />
          </a>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100 hover:bg-green-100 transition-colors cursor-pointer active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                <FiMessageCircle />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">WhatsApp Chat</h4>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Instant resolution</p>
              </div>
            </div>
            <FiChevronRight className="text-green-400" />
          </div>

        </div>

        {/* FAQs */}
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <FiHelpCircle className="text-teal-600" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Frequently Asked Questions</h3>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <h4 className="text-sm font-bold text-gray-800 leading-snug mb-1">{faq.q}</h4>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Support;
