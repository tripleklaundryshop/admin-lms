import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { 
  UserCircle, Hourglass, WashingMachine, 
  Truck, CheckCircle2, TrendingUp,
  Menu, Search 
} from 'lucide-react';

const Dashboard = () => {
  const [orderCount, setOrderCount] = useState({ new: 0, progress: 0, delivery: 0, completed: 0 });

  useEffect(() => {
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      setOrderCount({
        new: docs.filter(o => o.status === 'Pending').length,
        progress: docs.filter(o => o.status === 'In Progress').length,
        delivery: docs.filter(o => o.status === 'Out for Delivery').length,
        completed: docs.filter(o => o.status === 'Completed').length,
      });
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    { 
      title: 'New Orders', 
      count: orderCount.new, 
      icon: <Hourglass size={32} fill="currentColor" fillOpacity={0.2} />, 
      bgColor: 'bg-[#FFE2E5]',
      textColor: 'text-[#E11D48]', 
    },
    { 
      title: 'In Progress', 
      count: orderCount.progress, 
      icon: <WashingMachine size={32} fill="currentColor" fillOpacity={0.2} />, 
      bgColor: 'bg-[#E1F0FF]',
      textColor: 'text-[#1D4ED8]',
    },
    { 
      title: 'Out for Delivery', 
      count: orderCount.delivery, 
      icon: <Truck size={32} fill="currentColor" fillOpacity={0.2} />, 
      bgColor: 'bg-[#EEE5FF]',
      textColor: 'text-[#6D28D9]',
    },
    { 
      title: 'Completed Orders', 
      count: orderCount.completed, 
      icon: <CheckCircle2 size={32} fill="currentColor" fillOpacity={0.2} />, 
      bgColor: 'bg-[#DFFFE2]',
      textColor: 'text-[#059669]',
    },
  ];

  return (
    <div className="p-6 md:p-10 bg-[#F8F9FA] min-h-screen font-sans">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden flex flex-col mb-8">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-4">
            {/* Click this to open the sidebar via window event */}
            <button 
              onClick={() => window.dispatchEvent(new Event('open-sidebar'))}
              className="p-1 -ml-1 focus:outline-none"
            >
              <Menu className="text-gray-600" size={26} />
            </button>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">DASHBOARD</h1>
          </div>
          
          <div className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center shadow-sm bg-white">
            <UserCircle size={24} className="text-gray-400" />
          </div>
        </div>
        
        <div className="h-[1px] bg-gray-200 w-[calc(100%+48px)] -ml-6 mb-8" />

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* --- DESKTOP HEADER --- */}
      <header className="hidden md:flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          <UserCircle size={40} className="text-blue-500" />
          <span className="text-lg font-semibold text-gray-700">Admin</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-[20px] p-6 h-32 md:h-35 flex flex-col justify-between shadow-sm`}>
            <h3 className={`${stat.textColor} text-base font-bold opacity-90`}>{stat.title}</h3>
            <div className="flex justify-between items-end">
              <div className={`${stat.textColor}`}>{stat.icon}</div>
              <span className={`text-6xl font-extrabold ${stat.textColor} leading-none`}>{stat.count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[300px]">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp size={20} className="text-gray-800" />
          <h2 className="text-xl font-bold text-gray-800">Order & Revenue Trends (Weekly)</h2>
        </div>
        <p className="text-gray-400 text-sm italic text-center mt-20">Analytics chart integration coming soon...</p>
      </div>
    </div>
  );
};

export default Dashboard;