import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  Save, RefreshCw, AlertCircle, CheckCircle2, Menu,
  Plus, Trash2, Pencil, X, Truck, Package, Info
} from 'lucide-react';

export default function Pricing() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wash'); 
  const [packages, setPackages] = useState([]);
  const [fees, setFees] = useState({ delivery_fee: 20, heavy_garment_fee: 50 });
  const [addons, setAddons] = useState({ Surf: 15, Downy: 12, Del: 13, Ariel: 15, Breeze: 20 });
  const [serviceAreas, setServiceAreas] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'pricing'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.packages) setPackages(data.packages);
        setFees({ delivery_fee: data.delivery_fee ?? 20, heavy_garment_fee: data.heavy_garment_fee ?? 50 });
        if (data.addons) setAddons(data.addons);
        if (data.service_areas) setServiceAreas(data.service_areas.join(", "));
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSaveToFirebase = async (updatedPackages) => {
    try {
      await setDoc(doc(db, 'settings', 'pricing'), {
        packages: updatedPackages,
        delivery_fee: Number(fees.delivery_fee),
        heavy_garment_fee: Number(fees.heavy_garment_fee),
        addons,
        service_areas: serviceAreas.split(',').map(s => s.trim()).filter(s => s)
      });
    } catch (err) {
      alert('Sync failed: ' + err.message);
    }
  };

  const openEditModal = (pkg = null) => {
    if (pkg) {
      setEditingPkg({ ...pkg });
    } else {
      setEditingPkg({
        id: Date.now(),
        name: "",
        price: 0,
        suitableFor: "",
        inclusions: "Wash + Dry + Fold",
        isComforter: activeTab === 'comforter'
      });
    }
    setIsModalOpen(true);
  };

  const closeAndSaveModal = () => {
    // --- ADDED CONFIRMATION ALERT ---
    const isConfirmed = window.confirm("Are you sure you want to update this service? Changes will go live immediately on the customer app.");
    if (!isConfirmed) return;

    let newPackages;
    const exists = packages.find(p => p.id === editingPkg.id);
    
    if (exists) {
      newPackages = packages.map(p => p.id === editingPkg.id ? editingPkg : p);
    } else {
      newPackages = [...packages, editingPkg];
    }

    setPackages(newPackages);
    handleSaveToFirebase(newPackages);
    setIsModalOpen(false);
  };

  const deletePackage = (id) => {
    if (window.confirm("Delete this service? This cannot be undone.")) {
      const filtered = packages.filter(p => p.id !== id);
      setPackages(filtered);
      handleSaveToFirebase(filtered);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <RefreshCw className="animate-spin text-blue-600" size={32} />
      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Syncing Rates...</span>
    </div>
  );

  const filteredData = packages.filter(p => activeTab === 'wash' ? !p.isComforter : p.isComforter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 md:p-8">
      
      {/* Header & Tabs Area - Responsive Flex */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex bg-gray-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('wash')}
            className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 text-[10px] md:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'wash' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            WASH PACKAGES
          </button>
          <button 
            onClick={() => setActiveTab('comforter')}
            className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 text-[10px] md:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'comforter' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            COMFORTERS
          </button>
        </div>

        <button 
          onClick={() => openEditModal()}
          className="w-full md:w-auto bg-[#2563EB] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={16} /> ADD SERVICE
        </button>
      </div>

      {/* Main Table Container - Added overflow handling for mobile */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Name</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Details</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rate (₱)</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400 text-sm italic">No services found for this category.</td>
                </tr>
              ) : (
                filteredData.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] shrink-0" />
                        <span className="text-sm font-bold text-gray-800 truncate">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 max-w-[250px] truncate">
                      {pkg.suitableFor || "No details provided"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-400">₱</span>
                        <span className="text-sm font-black text-gray-700">{pkg.price}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-green-50 text-green-600 text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md">ACTIVE</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => openEditModal(pkg)} className="text-gray-300 hover:text-blue-600 transition-colors p-1"><Pencil size={16}/></button>
                        <button onClick={() => deletePackage(pkg.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE / ADD MODAL - Responsive Width */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                {editingPkg.id > Date.now() - 10000 ? "Add New Service" : "Update Service Details"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Service Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                  value={editingPkg.name}
                  placeholder="e.g. 5-5.5 kg Load"
                  onChange={e => setEditingPkg({...editingPkg, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Price (₱)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    value={editingPkg.price}
                    onChange={e => setEditingPkg({...editingPkg, price: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Visibility Status</label>
                  <div className="w-full bg-green-50 border border-green-100 text-green-600 rounded-xl px-4 py-3 text-[10px] font-black text-center">LIVE IN APP</div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Target Details (Subtitle)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                  value={editingPkg.suitableFor}
                  placeholder="e.g. For large family loads"
                  onChange={e => setEditingPkg({...editingPkg, suitableFor: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Full Inclusions</label>
                <textarea 
                  rows="3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  value={editingPkg.inclusions}
                  placeholder="e.g. Wash, Dry, Fold, etc."
                  onChange={e => setEditingPkg({...editingPkg, inclusions: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-white transition-colors">CANCEL</button>
              <button onClick={closeAndSaveModal} className="order-1 sm:order-2 flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">UPDATE SERVICE</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Configuration - Responsive Grid */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
          <h3 className="text-xs font-black text-gray-400 uppercase mb-5 flex items-center gap-2"><Truck size={14}/> Service Fees</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div className="space-y-1.5">
               <label className="text-[10px] text-gray-400 font-bold block">Delivery Fee</label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₱</span>
                 <input type="number" value={fees.delivery_fee} onChange={e => setFees({...fees, delivery_fee: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl pl-8 pr-4 py-3 text-sm font-black text-gray-700 outline-none focus:ring-1 focus:ring-blue-100"/>
               </div>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] text-gray-400 font-bold block">Heavy Garment</label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₱</span>
                 <input type="number" value={fees.heavy_garment_fee} onChange={e => setFees({...fees, heavy_garment_fee: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl pl-8 pr-4 py-3 text-sm font-black text-gray-700 outline-none focus:ring-1 focus:ring-blue-100"/>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2"><Info size={14}/> Allowed Areas</h3>
            <span className="text-[9px] bg-blue-50 text-blue-500 font-bold px-2 py-0.5 rounded">Comma separated</span>
          </div>
          <textarea 
            value={serviceAreas} 
            onChange={e => setServiceAreas(e.target.value)}
            placeholder="e.g. Mambaling, Basak San Nicolas, Tabada"
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-medium resize-none min-h-[90px] outline-none focus:ring-1 focus:ring-blue-100" 
          />
        </div>
      </div>
      
      {/* Global Sync Notification */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-xl shadow-blue-200 animate-pulse">
           <RefreshCw size={12}/> REAL-TIME SYNC ACTIVE
        </div>
      </div>

    </div>
  );
}
