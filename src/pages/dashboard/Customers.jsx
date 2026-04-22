import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { 
  UserCircle, Search, ChevronLeft, ChevronRight, 
  Mail, Phone, MapPin, User, Menu 
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customerData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setCustomers(customerData);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter((user) => {
    const name = user.fullName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentItems = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-[#2D3748]">
      
      {/* --- 📱 MOBILE HEADER --- */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.dispatchEvent(new Event('open-sidebar'))}
              className="p-1 -ml-1 focus:outline-none"
            >
              <Menu className="text-gray-600" size={26} />
            </button>
            <h1 className="text-[20px] font-black uppercase tracking-tight text-[#0D1B2A]">
              CUSTOMERS
            </h1>
          </div>
          
          <div className="p-2 border border-gray-100 rounded-xl shadow-sm bg-white">
            <UserCircle size={22} className="text-gray-400" />
          </div>
        </div>
        
        {/* Full-width Search Bar for Mobile */}
        <div className="px-5 pb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none shadow-sm focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-300"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="p-4 lg:p-10 max-w-7xl mx-auto">
        
        {/* --- 🖥️ DESKTOP HEADER --- */}
        <header className="hidden lg:flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1F2937] tracking-tight">Manage Customers</h1>
          <div className="flex items-center gap-3">
            <UserCircle size={40} className="text-blue-500" />
            <span className="text-lg font-medium text-gray-700">Admin Panel</span>
          </div>
        </header>

        {/* --- 🖥️ DESKTOP STATS CARD --- */}
        <div className="hidden lg:block mb-8 bg-white border border-gray-200 rounded-xl p-6 w-64 shadow-sm">
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Total Customers</p>
          <h2 className="text-4xl font-black text-[#1F2937]">
            {loading ? "..." : customers.length}
          </h2>
        </div>

        {/* Main Table Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#2D3748]">Registered Users</h2>
            <div className="hidden lg:block relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-gray-300"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* --- 🖥️ DESKTOP VIEW (TABLE) --- */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="w-16 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">#</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Home Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.length > 0 ? (
                  currentItems.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-[13px] text-gray-400 text-center font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-gray-700">
                        {user.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-gray-500">
                        {user.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-indigo-600 font-bold">
                        {user.contact || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-gray-500 italic">
                        {user.address || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-gray-400 text-sm italic">
                      {loading ? "Syncing data..." : "No matching customers found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- 📱 MOBILE VIEW (CARDS) --- */}
          <div className="lg:hidden flex flex-col divide-y divide-gray-50">
             {currentItems.length > 0 ? (
               currentItems.map((user, index) => (
                 <div key={user.id} className="p-6 bg-white flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
                        <User size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Customer #{(currentPage - 1) * itemsPerPage + index + 1}</span>
                        <h3 className="text-base font-black text-[#111827] leading-tight">{user.fullName || 'N/A'}</h3>
                      </div>
                    </div>

                    <div className="space-y-4 py-2 border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        <span className="truncate">{user.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <span className="font-bold text-indigo-600">{user.contact || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-3 text-xs text-gray-500 italic bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <span>{user.address || 'N/A'}</span>
                      </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="py-20 text-center text-gray-400 italic text-sm">
                 {loading ? "Syncing..." : "No customers found."}
               </div>
             )}
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-8 md:py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
              Showing <span className="text-gray-600 font-bold">{(currentPage-1)*itemsPerPage + 1}</span> to <span className="text-gray-600 font-bold">{Math.min(currentPage*itemsPerPage, filteredCustomers.length)}</span> of {filteredCustomers.length}
            </p>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setCurrentPage(prev => Math.max(prev-1, 1))} 
                disabled={currentPage === 1} 
                className="p-2 text-gray-400 disabled:opacity-20 hover:text-blue-600 transition-colors"
               >
                  <ChevronLeft size={24}/>
               </button>
               <div className="flex items-center gap-1.5">
                 {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i+1)} 
                      className={`text-[11px] font-black w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === i+1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {i+1}
                    </button>
                 ))}
               </div>
               <button 
                onClick={() => setCurrentPage(prev => Math.min(prev+1, totalPages))} 
                disabled={currentPage === totalPages} 
                className="p-2 text-gray-400 disabled:opacity-20 hover:text-blue-600 transition-colors"
               >
                  <ChevronRight size={24}/>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;