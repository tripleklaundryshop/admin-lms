import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../services/firebase-config';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { 
  UserCircle, Search, Send, User, ChevronLeft, 
  ChevronRight, MapPin, ShoppingBag, ChevronDown, Check, Menu 
} from 'lucide-react';

const DispatchPage = () => {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRiders, setSelectedRiders] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const dropdownRef = useRef(null);
  const itemsPerPage = 5;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const qOrders = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qRiders = query(collection(db, "riders"));
    const unsubscribeRiders = onSnapshot(qRiders, (snapshot) => {
      setRiders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRiders();
    };
  }, []);

  const handleDispatch = async (orderId) => {
    const selectedRiderDocId = selectedRiders[orderId]; 
    if (!selectedRiderDocId) return;

    const selectedRider = riders.find(r => r.id === selectedRiderDocId);
    if (!selectedRider) return;

    try {
      await updateDoc(doc(db, "orders", orderId), {
        // Use Firestore document ID so the Flutter app can fetch the rider doc directly
        assignedRiderId: selectedRider.id,
        riderId: selectedRider.riderId || selectedRider.id,
        // Write all rider details to the order so the customer card is never empty
        riderName: selectedRider.fullName || selectedRider.name || "Unknown",
        riderPhone: selectedRider.phone || selectedRider.phoneNumber || "",
        riderVehicle: selectedRider.motorcycleType || selectedRider.motorcycle || "Motorcycle",
        riderPlate: selectedRider.plateNumber || selectedRider.plate || "",
        status: "Assigned",
        dispatchedAt: new Date()
      });
      
      setShowSuccessModal(true);
      setSelectedRiders(prev => {
        const next = {...prev};
        delete next[orderId];
        return next;
      });
    } catch (e) {
      console.error("Dispatch Error:", e.message);
    }
  };

  const filteredOrders = orders.filter(order => 
    (order.status === 'Pending' || order.status === 'Ready to PickUp') && (
      order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const pendingCount = filteredOrders.length;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const RiderDropdown = ({ orderId, isMobile = false }) => {
    const selectedRiderId = selectedRiders[orderId];
    const selectedRider = riders.find(r => r.id === selectedRiderId);
    const isOpen = activeDropdown === orderId;

    // Only show riders who are currently online
    const onlineRiders = riders.filter(r => r.isOnline === true);

    return (
      <div className="relative w-full" ref={isOpen ? dropdownRef : null}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(isOpen ? null : orderId);
          }}
          className={`w-full flex items-center justify-between bg-white border border-gray-200 text-gray-700 transition-all focus:ring-1 focus:ring-blue-400
            ${isMobile ? 'py-4 px-4 rounded-xl text-sm font-bold shadow-sm' : 'py-1.5 px-2 text-[11px] font-medium rounded'}`}
        >
          <span className="truncate flex items-center gap-1.5">
            {selectedRider
              ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />{selectedRider.fullName || selectedRider.name}</>
              : `Select Rider (${onlineRiders.length} online)`}
          </span>
          <div className="flex items-center gap-1 ml-2">
             <User size={isMobile ? 18 : 12} className="text-gray-400" />
             <ChevronDown size={isMobile ? 16 : 10} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-[9999] left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
            <div className="max-h-60 overflow-y-auto">
               <div
                onMouseDown={() => {
                  setSelectedRiders(prev => ({...prev, [orderId]: ""}));
                  setActiveDropdown(null);
                }}
                className="px-4 py-3 text-gray-400 hover:bg-gray-50 cursor-pointer border-b border-gray-50 text-[11px] uppercase font-bold tracking-wider"
              >
                Clear Selection
              </div>
              {onlineRiders.length === 0 && (
                <div className="px-4 py-5 text-center text-gray-400 text-[11px] italic">
                  No riders are currently online.
                </div>
              )}
              {onlineRiders.map(rider => (
                <div
                  key={rider.id}
                  onMouseDown={() => {
                    setSelectedRiders(prev => ({...prev, [orderId]: rider.id}));
                    setActiveDropdown(null);
                  }}
                  className={`px-4 py-3 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors border-b border-gray-50 last:border-0
                    ${selectedRiderId === rider.id ? 'bg-blue-600 text-white' : 'text-gray-700'}
                    ${isMobile ? 'text-sm font-bold' : 'text-[11px] font-medium'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />
                    {rider.fullName || rider.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-[#2D3748]">
      
      {/* --- 📱 MOBILE HEADER --- */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.dispatchEvent(new Event('open-sidebar'))}
              className="p-1 -ml-1"
            >
              <Menu className="text-gray-600" size={26} />
            </button>
            <h1 className="text-[20px] font-black uppercase tracking-tight text-[#0D1B2A]">
              DISPATCH
            </h1>
          </div>
          <div className="p-2 border border-gray-100 rounded-xl shadow-sm bg-white">
            <UserCircle size={22} className="text-gray-400" />
          </div>
        </div>
        
        {/* Search Bar Mobile */}
        <div className="px-5 pb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by customer or address..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none shadow-sm focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="p-4 lg:p-10 max-w-7xl mx-auto">
        
        {/* --- 🖥️ DESKTOP HEADER --- */}
        <header className="hidden lg:flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight">Dispatch Center</h1>
            <p className="text-gray-500 font-medium mt-1">Assign delivery tasks to your active riders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
              {pendingCount} Orders Pending
            </div>
          </div>
        </header>

        {/* --- 🖥️ DESKTOP STATS --- */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
           <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">In Queue</p>
             <h2 className="text-3xl font-black text-[#111827]">{pendingCount}</h2>
           </div>
           <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Riders Online</p>
             <h2 className="text-3xl font-black text-[#111827]">{riders.filter(r => r.isOnline === true).length}</h2>
           </div>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
          <div className="hidden lg:flex px-6 py-4 items-center justify-between border-b border-gray-50">
            <h2 className="text-lg font-bold text-[#111827]">Queue for Assignment</h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block w-full overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="w-16 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">#</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items</th>
                  <th className="w-64 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign Rider</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 overflow-visible">
                {currentOrders.length > 0 ? (
                  currentOrders.map((order, index) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-[10px] text-gray-400 text-center font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-3 text-[13px] font-bold text-gray-800">
                        {order.fullName}
                      </td>
                      <td className="px-6 py-3 text-[12px] text-gray-500 max-w-xs truncate">
                        {order.address}
                      </td>
                      <td className="px-6 py-3 text-[12px] text-blue-600 font-medium italic">
                        {order.selectedItems?.join(", ")}
                      </td>
                      <td className="px-6 py-3 overflow-visible">
                         <RiderDropdown orderId={order.id} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button 
                          onClick={() => handleDispatch(order.id)}
                          className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all shadow-sm ${
                            selectedRiders[order.id] 
                            ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md' 
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <Send size={12} />
                          Dispatch
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400 text-sm italic">
                      No pending orders for dispatch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden flex flex-col divide-y divide-gray-50 overflow-visible">
            {currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <div key={order.id} className="p-6 bg-white flex flex-col gap-5 overflow-visible">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Order #{(currentPage - 1) * itemsPerPage + index + 1}</span>
                      <h3 className="text-lg font-black text-[#111827] uppercase leading-tight">{order.fullName}</h3>
                    </div>
                    <span className="bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded">PENDING</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <MapPin size={18} className="text-gray-400" />
                      </div>
                      <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                        {order.address}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <ShoppingBag size={18} className="text-gray-400" />
                      </div>
                      <p className="text-[11px] text-gray-400 italic font-medium pt-2.5">
                        {order.selectedItems?.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-50 space-y-3 overflow-visible">
                    <RiderDropdown orderId={order.id} isMobile={true} />
                    <button 
                      onClick={() => handleDispatch(order.id)}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        selectedRiders[order.id] 
                        ? 'bg-[#111827] text-white shadow-xl shadow-gray-200' 
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Send size={14} />
                      Confirm Dispatch
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-400 text-sm italic">
                No pending orders found.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-6 bg-white border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
              Showing <span className="text-gray-600 font-bold">{(currentPage-1)*itemsPerPage + 1}</span> to <span className="text-gray-600 font-bold">{Math.min(currentPage*itemsPerPage, filteredOrders.length)}</span>
            </p>
            <div className="flex items-center gap-3">
               <button onClick={() => setCurrentPage(prev => Math.max(prev-1, 1))} disabled={currentPage === 1} className="p-2 text-gray-400 disabled:opacity-20 hover:text-blue-600 transition-colors"><ChevronLeft size={20}/></button>
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
               <button onClick={() => setCurrentPage(prev => Math.min(prev+1, totalPages))} disabled={currentPage === totalPages} className="p-2 text-gray-400 disabled:opacity-20 hover:text-blue-600 transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 flex flex-col items-center text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-2 border-green-100">
              <Check size={40} className="text-green-500" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black text-[#111827] mb-2 tracking-tight">Good job!</h3>
            <p className="text-gray-500 mb-8 font-medium">Order assigned successfully!</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchPage;
