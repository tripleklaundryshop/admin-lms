import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  UserCircle, Search, ChevronLeft, ChevronRight, 
  SquarePen, Trash2, X, Menu 
} from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === "Pending") {
        updateData.assignedRiderId = null;
        updateData.riderId = null;
        updateData.riderName = null;
      }
      await updateDoc(doc(db, "orders", id), updateData);
      setToastMessage(`Order status updated to ${newStatus}.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteDoc(doc(db, "orders", id));
      setToastMessage("Order has been deleted successfully.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-3 sm:p-6 bg-[#f8f9fa] min-h-screen font-sans text-[#2D3748] relative">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 z-[999] transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#D1E7DD] border border-[#BADBCC] text-[#0F5132] px-4 h-[50px] rounded shadow-sm flex items-center gap-3 w-fit max-w-xs">
          <p className="text-[12px] leading-tight"><span className="font-bold">Success!</span> {toastMessage}</p>
          <button onClick={() => setShowToast(false)} className="text-[#0F5132] hover:opacity-40 transition-opacity"><X size={14} /></button>
        </div>
      </div>

      {/* --- REFINED HEADER --- */}
      <header className="flex items-center justify-between mb-6 pt-2 lg:pt-2">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => window.dispatchEvent(new Event('open-sidebar'))}
            className="lg:hidden p-1 -ml-1 focus:outline-none"
          >
            <Menu className="text-gray-600" size={26} />
          </button>
          <h1 className="text-[20px] lg:text-2xl font-black uppercase tracking-tight text-[#0D1B2A]">
            Manage Orders
          </h1>
        </div>

        <div className="flex items-center justify-end">
          <div className="lg:hidden w-10 h-10 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-center">
            <UserCircle size={24} className="text-gray-400" />
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <UserCircle size={32} className="text-blue-500 fill-blue-50" />
            <span className="text-sm font-semibold">Admin Panel</span>
          </div>
        </div>
      </header>

      {/* --- RESPONSIVE SEARCH BAR --- */}
      <div className="lg:hidden relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
        <input 
          type="text" 
          placeholder="Search orders..." 
          className="w-full h-14 pl-16 pr-6 bg-white border border-gray-50 rounded-2xl shadow-sm text-base outline-none focus:ring-1 focus:ring-blue-50 placeholder:text-gray-300"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* --- CONTAINER --- */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-3 py-3 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 gap-3">
          <h2 className="text-base font-bold">All Customer Orders</h2>
          <div className="hidden lg:block relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded text-sm outline-none w-full md:w-64 focus:border-blue-400"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* 1. DESKTOP TABLE VIEW */}
        <div className="hidden lg:block w-full overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-200">
                <th className="w-[40px] px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase text-center border-r border-gray-200">#</th>
                <th className="w-[100px] px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase border-r border-gray-200">Date</th>
                <th className="w-[140px] px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase border-r border-gray-200">Name</th>
                <th className="w-[200px] px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase border-r border-gray-200">Address</th>
                <th className="w-[100px] px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase border-r border-gray-200">Contact</th>
                <th className="px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase border-r border-gray-200">Order Details</th>
                <th className="w-[80px] px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase text-center border-r border-gray-200">Total</th>
                <th className="w-[110px] px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase text-center border-r border-gray-200">Status</th>
                <th className="w-[180px] px-3 py-2 text-[10px] font-extrabold text-[#64748B] uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-[11px] text-gray-400 text-center font-medium border-r border-gray-200">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-600 border-r border-gray-200">{order.timestamp?.toDate().toLocaleDateString() || 'N/A'}</td>
                  <td className="px-3 py-2 text-[11px] font-bold text-gray-800 border-r border-gray-200">{order.fullName}</td>
                  <td className="px-3 py-2 text-[10px] text-gray-500 whitespace-normal break-words leading-tight border-r border-gray-200">{order.address}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-600 border-r border-gray-200">{order.phone || order.contact || "N/A"}</td>
                  <td className="px-3 py-2 text-[10px] text-blue-600 font-medium border-r border-gray-200 italic">{order.selectedItems?.join(", ")}</td>
                  <td className="px-3 py-2 text-[11px] font-black text-gray-800 text-center border-r border-gray-200">₱{order.totalPrice}</td>
                  <td className="px-3 py-2 text-center border-r border-gray-200">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${order.status === 'Pending' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center justify-center gap-2">
                        <div className="relative flex-1">
                            <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="w-full bg-[#5BC0DE] text-white pl-2 pr-6 py-1 rounded text-[10px] font-black uppercase appearance-none cursor-pointer outline-none"><option value="Pending">Pending</option><option value="Ready to PickUp">Ready to PickUp</option><option value="Picked Up">Picked Up</option><option value="Processing">Processing</option><option value="Ready to Deliver">Ready to Deliver</option><option value="Delivered">Delivered</option></select>
                            <SquarePen size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                        </div>
                        <button onClick={() => handleDelete(order.id)} className="bg-[#D9534F] text-white p-1.5 rounded transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. MODERN MOBILE BOX VIEW */}
        <div className="lg:hidden flex flex-col bg-gray-50 gap-5 p-4">
          {currentOrders.map((order, index) => (
            <div key={order.id} className="p-6 bg-white flex flex-col gap-5 shadow-sm rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-sm font-black">
                      #{(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-[15px] font-extrabold text-gray-800 leading-tight">{order.fullName}</h3>
                      <span className="text-[11px] font-semibold text-gray-400 mt-0.5">{order.timestamp?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${order.status === 'Pending' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-[12px] text-gray-500 leading-relaxed font-medium">
                  {order.address}
                </div>

                <div className="bg-[#f8f9fa] rounded-xl p-4 border border-gray-50">
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Details</span>
                  <div className="text-[11px] text-gray-600 font-medium leading-relaxed italic truncate">
                    {order.selectedItems?.join(", ")}
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">Total</span>
                    <span className="text-[20px] font-black text-gray-900 leading-none mt-1">₱{order.totalPrice}</span>
                  </div>
                  
                  <div className="flex items-center gap-5 pb-1">
                    <div className="relative text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                      <SquarePen size={20} />
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)} 
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Ready to PickUp">Ready to PickUp</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready to Deliver">Ready to Deliver</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => handleDelete(order.id)} 
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-400 font-medium">Showing <span className="text-gray-700 font-bold">{(currentPage-1)*itemsPerPage + 1}</span> to <span className="text-gray-700 font-bold">{Math.min(currentPage*itemsPerPage, filteredOrders.length)}</span> entries</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev-1, 1))} disabled={currentPage === 1} className="text-gray-400 disabled:opacity-20"><ChevronLeft size={16}/></button>
            {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i+1)} className={`text-[10px] font-bold w-7 h-7 rounded flex items-center justify-center ${currentPage === i+1 ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}>{i+1}</button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev+1, totalPages))} disabled={currentPage === totalPages} className="text-gray-400 disabled:opacity-20"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;