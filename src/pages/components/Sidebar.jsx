import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 
// Added Banknote to the imports
import { LayoutDashboard, ClipboardList, Bike, Users, Send, LogOut, X, Banknote } from 'lucide-react';
import { signOut } from 'firebase/auth'; 
import { auth } from '../../services/firebase-config'; 

// Import your logo
import logo from '../../assets/img/logo.png';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); 

  // --- EVENT LISTENER FOR MOBILE OPENING ---
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-sidebar', handleOpen);
    return () => window.removeEventListener('open-sidebar', handleOpen);
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <ClipboardList size={20} />, label: 'Orders', path: '/orders' },
    { icon: <Bike size={20} />, label: 'Rider', path: '/rider' },
    { icon: <Users size={20} />, label: 'Customers', path: '/customers' },
    { icon: <Send size={20} />, label: 'Dispatch', path: '/dispatch' },
    // NEW PRICING PAGE ADDED HERE
    { icon: <Banknote size={20} />, label: 'Update Prices', path: '/pricing' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      {/* --- MOBILE OVERLAY --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-gray-200 flex flex-col h-screen transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Close Button (Mobile Only) */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <X size={28} />
        </button>

        <div className="p-6 mb-4">
          <div className="flex flex-col items-center justify-center">
            <img 
              src={logo} 
              alt="TripleK Laundry" 
              className="h-14 w-auto object-contain mb-2" 
            />
            <span className="text-[10px] tracking-widest text-gray-400 uppercase font-semibold text-center">
              Wash • Dry • Fold
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? 'bg-[#007AB9] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;