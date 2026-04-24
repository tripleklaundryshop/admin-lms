import React, { useState, useEffect } from 'react';
import { 
  Plus, UserCircle, X, Trash2, Search, ChevronLeft, ChevronRight, 
  Truck, Menu, Check
} from 'lucide-react';
import { db, app } from '../../services/firebase-config'; 
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const RiderDirectory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    riderId: "RDR-0001",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    plateNumber: "",
    motorcycleType: "",
    status: "Active"
  });

  // Compute the next RDR-XXXX id from the current list
  const getNextRiderId = (riderList) => {
    if (riderList.length === 0) return "RDR-0001";
    const nums = riderList
      .map(r => parseInt((r.riderId || "").replace("RDR-", ""), 10))
      .filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `RDR-${String(max + 1).padStart(4, "0")}`;
  };

  useEffect(() => {
    const q = query(collection(db, "riders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const riderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRiders(riderList);
      setLoading(false);
      // Keep the form riderId in sync whenever riders change
      setFormData(prev => ({ ...prev, riderId: getNextRiderId(riderList) }));
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveRider = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      alert("Please fill in all required fields (Name, Email, Password)");
      return;
    }

    try {
      // 1. Create Auth Account using a secondary app instance (prevents Admin from being logged out)
      const secondaryApp = initializeApp(app.options, "SecondaryApp" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      
      await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      await secondaryAuth.signOut(); // Clean up

      // 2. Save Rider Profile to Firestore
      await addDoc(collection(db, "riders"), formData);
      
      setFormData(prev => ({
        riderId: prev.riderId, // will be updated by onSnapshot listener
        fullName: "",
        email: "",
        phone: "",
        password: "",
        plateNumber: "",
        motorcycleType: "",
        status: "Active"
      }));
      setIsModalOpen(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Error adding rider: ", error);
      alert("Failed to save rider: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this rider?")) {
      await deleteDoc(doc(db, "riders", id));
    }
  };

  const filteredRiders = riders.filter(rider => 
    rider.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.riderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white md:bg-[#F9FAFB] font-sans">
      
      <div className="lg:hidden flex items-center px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.dispatchEvent(new Event('open-sidebar'))}
            className="p-1 -ml-1 focus:outline-none"
          >
            <Menu className="text-gray-600" size={26} />
          </button>
          <h1 className="text-xl font-black text-[#111827] tracking-tight">RIDER</h1>
        </div>
        <div className="ml-auto w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center shadow-sm">
          <UserCircle className="text-gray-400" size={24} />
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="hidden lg:flex justify-between items-start md:items-center gap-4 mb-12">
            <h1 className="text-4xl font-extrabold text-[#1F2937] tracking-tight">Rider Directory</h1>
            <div className="flex items-center gap-3">
                <UserCircle size={40} className="text-blue-500" />
                <span className="text-lg font-medium text-gray-700">Admin</span>
            </div>
        </div>

        <div className="lg:hidden space-y-4 mb-8">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search rider..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-600 focus:outline-none shadow-sm placeholder:text-gray-300"
                />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#0F172A] text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 tracking-widest uppercase shadow-md active:scale-95 transition-transform"
            >
                <Truck size={18} />
                New Rider
            </button>
        </div>

        <div className="hidden lg:flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#4B5563]">Account Management</h2>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#1D72E8] hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
                <Plus size={20} strokeWidth={3} />
                Add New Rider
            </button>
        </div>

        <div className="bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 overflow-hidden">
            <div className="hidden lg:flex px-6 py-4 justify-between items-center border-b border-gray-100">
                <h2 className="text-lg font-bold text-[#2D3748]">All Registered Riders</h2>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="border-y border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rider ID</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Phone</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Motorcycle</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Plate #</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {filteredRiders.length > 0 ? (
                        filteredRiders.map((rider, index) => (
                        <tr key={rider.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-[13px] text-gray-400">{index + 1}</td>
                            <td className="px-6 py-4 text-[13px] font-bold text-blue-600">{rider.riderId}</td>
                            <td className="px-6 py-4 text-[13px] font-medium text-gray-700">{rider.fullName}</td>
                            <td className="px-6 py-4 text-[13px] text-gray-500">{rider.email}</td>
                            <td className="px-6 py-4 text-[13px] text-gray-500 text-center">{rider.phone}</td>
                            <td className="px-6 py-4 text-[13px] text-gray-700 text-center capitalize">{rider.motorcycleType}</td>
                            <td className="px-6 py-4 text-[13px] text-gray-700 text-center uppercase">{rider.plateNumber}</td>
                            <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase">
                                {rider.status}
                            </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDelete(rider.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan="9" className="py-20 text-center text-gray-400 italic text-sm">
                            {loading ? "Loading data..." : "No entries found."}
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="lg:hidden flex flex-col gap-6">
            {filteredRiders.length > 0 ? (
                filteredRiders.map((rider) => (
                <div key={rider.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start mb-6">
                        <div className="bg-[#0F172A] p-2 rounded-xl">
                            <Truck className="text-white" size={24} />
                        </div>
                        <div className="ml-4 flex flex-col justify-center">
                            <h4 className="text-base font-bold text-[#111827] leading-tight">{rider.fullName}</h4>
                            <span className="text-xs font-bold text-blue-600">{rider.riderId}</span>
                        </div>
                        <div className="ml-auto">
                            <span className="bg-[#E8FBF2] text-[#10B981] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                {rider.status}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-5 border-t border-gray-50 pt-5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400 font-medium">Phone</span>
                            <span className="text-sm text-[#111827] font-bold">{rider.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400 font-medium">Vehicle</span>
                            <span className="text-sm text-[#111827] font-bold capitalize">
                                {rider.motorcycleType} ({rider.plateNumber})
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400 font-medium">Email</span>
                            <span className="text-sm text-[#111827] font-bold">{rider.email}</span>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-3">
                        <button className="flex-1 border border-gray-100 py-3.5 rounded-xl text-xs font-black text-[#1F2937] uppercase tracking-widest shadow-sm active:bg-gray-50">
                            View Logs
                        </button>
                        <button 
                            onClick={() => handleDelete(rider.id)}
                            className="p-3.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={22} />
                        </button>
                    </div>
                </div>
                ))
            ) : (
                <div className="py-20 text-center text-gray-400 italic text-sm">No entries found.</div>
            )}
            </div>

            <div className="px-6 py-8 md:py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider text-center sm:text-left">
                    Showing <span className="text-gray-600 font-bold">1</span> to <span className="text-gray-600 font-bold">{filteredRiders.length}</span> of {filteredRiders.length} entries
                </span>
                <div className="flex items-center gap-6">
                    <ChevronLeft size={24} className="text-gray-200 cursor-not-allowed" />
                    <ChevronRight size={24} className="text-gray-200 cursor-not-allowed" />
                </div>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Add New Rider</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveRider}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Rider ID (Auto-generated)</label>
                  <input name="riderId" type="text" value={formData.riderId} readOnly className="w-full px-4 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-blue-600 font-bold cursor-not-allowed outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Full Name</label>
                  <input name="fullName" type="text" placeholder="John Doe" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Email</label>
                  <input name="email" type="email" placeholder="john@email.com" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Phone</label>
                  <input name="phone" type="text" placeholder="0912..." onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Plate Number</label>
                  <input name="plateNumber" type="text" placeholder="ABC 123" onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Motorcycle Type</label>
                  <select name="motorcycleType" onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white transition-all">
                    <option value="">Select Type</option>
                    <option value="scooter">Scooter</option>
                    <option value="underbone">Underbone</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Password</label>
                <input name="password" type="password" required placeholder="••••••••" onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#1D72E8] text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">Save Rider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <Check className="text-green-500" size={32} strokeWidth={3} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-1">Good job!</h3>
            <p className="text-gray-500 text-sm mb-6">Rider saved successfully!</p>
            
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-24 bg-[#1D72E8] hover:bg-blue-700 text-white py-2 rounded-md font-bold text-sm transition-colors shadow-lg shadow-blue-200"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RiderDirectory;