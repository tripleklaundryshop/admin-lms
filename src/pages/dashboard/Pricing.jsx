import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  Save, RefreshCw, AlertCircle, CheckCircle2, Menu,
  Plus, Trash2, Pencil, X, Truck, Info
} from 'lucide-react';

const Pricing = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wash'); 
  const [packages, setPackages] = useState([]);
  const [fees, setFees] = useState({ delivery_fee: 20, heavy_garment_fee: 50 });
  const [addons, setAddons] = useState({ Surf: 15, Downy: 12, Del: 13, Ariel: 15, Breeze: 20 });
  const [serviceAreas, setServiceAreas] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'pricing'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.packages) setPackages(data.packages);
        setFees({ 
            delivery_fee: data.delivery_fee ?? 20, 
            heavy_garment_fee: data.heavy_garment_fee ?? 50 
        });
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
        suitable_for: "",
        inclusions: "Wash + Dry + Fold",
        isComforter: activeTab === 'comforter'
      });
    }
    setIsModalOpen(true);
  };

  const closeAndSaveModal = () => {
    const isConfirmed = window.confirm("Update this service? Changes will be applied immediately.");
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
      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
    </div>
  );

  const filteredData = packages.filter(p => activeTab === 'wash' ? !p.isComforter : p.isComforter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 md:p-8">
      
      {/* HEADER & TABS */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex bg-gray-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('wash')} className={`flex-1 md:flex-none px-8 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'wash' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>WASH PACKAGES</button>
          <button onClick={() => setActiveTab('comforter')} className={`flex-1 md:flex-none px-8 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'comforter' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>COMFORTERS</button>
        </div>
        <button onClick={() => openEditModal()} className="w-full md:w-auto bg-[#2563EB] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"><Plus size={16} /> ADD SERVICE</button>
      </div>

      {/* TABLE */}
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
              {filteredData.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6"><div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)] shrink-0" /><span className="text-sm font-bold text-gray-800">{pkg.name}</span></div></td>
                  <td className="py-3 px-4 text-xs text-gray-500 truncate max-w-[250px]">{pkg.suitableFor || "—"}</td>
                  <td className="py-3 px-4"><div className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg inline-flex items-center gap-1 font-black text-gray-700 text-sm">₱{pkg.price}</div></td>
                  <td className="py-3 px-4 text-center"><span className="bg-green-50 text-green-600 text-[9px] font-black px-2.5 py-1 rounded">ACTIVE</span></td>
                  <td className="py-3 px-4"><div className="flex justify-center gap-4"><button onClick={() => openEditModal(pkg)} className="text-gray-300 hover:text-blue-600 p-1"><Pencil size={16}/></button><button onClick={() => deletePackage(pkg.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SERVICE CONFIGURATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Service Configuration</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={editingPkg.name}
                  onChange={e => setEditingPkg({...editingPkg, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Price (₱)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    value={editingPkg.price}
                    onChange={e => setEditingPkg({...editingPkg, price: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">App Status</label>
                  <div className="w-full bg-[#F2FAF4] border border-[#E6F4E9] text-[#22C55E] rounded-xl px-4 py-3 text-[10px] font-black text-center tracking-widest uppercase">Live</div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Details</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={editingPkg.suitableFor}
                  onChange={e => setEditingPkg({...editingPkg, suitableFor: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Inclusions</label>
                <textarea 
                  rows="2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={editingPkg.inclusions}
                  onChange={e => setEditingPkg({...editingPkg, inclusions: e.target.value})}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 flex gap-4 bg-gray-50/50 border-t border-gray-50">
              <button 
                onClick={closeAndSaveModal} 
                className="flex-1 bg-[#2563EB] text-white py-3.5 rounded-xl text-[10px] font-black tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 uppercase"
              >
                Update Service
              </button>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 bg-white border border-gray-200 text-gray-500 py-3.5 rounded-xl text-[10px] font-black tracking-widest hover:bg-gray-50 transition-all uppercase"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BOTTOM CONFIGS */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase mb-5 flex items-center gap-2"><Truck size={14}/> Service Fees</h3>
          <div className="grid grid-cols-2 gap-5">
             <div className="space-y-1.5"><label className="text-[10px] text-gray-400 font-bold block">Delivery Fee</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₱</span><input type="number" value={fees.delivery_fee} onChange={e => setFees({...fees, delivery_fee: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl pl-8 pr-4 py-3 text-sm font-black text-gray-700 outline-none"/></div></div>
             <div className="space-y-1.5"><label className="text-[10px] text-gray-400 font-bold block">Heavy Garment</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₱</span><input type="number" value={fees.heavy_garment_fee} onChange={e => setFees({...fees, heavy_garment_fee: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl pl-8 pr-4 py-3 text-sm font-black text-gray-700 outline-none"/></div></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase mb-5 flex items-center gap-2"><Info size={14}/> Allowed Areas</h3>
          <textarea value={serviceAreas} onChange={e => setServiceAreas(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-medium resize-none min-h-[90px] outline-none" placeholder="Mambaling, Basak San Nicolas..." />
        </div>
      </div>

    </div>
  );
};

export default Pricing;
