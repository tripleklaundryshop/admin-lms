import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  Save, RefreshCw, AlertCircle, CheckCircle2, Menu,
  Plus, Trash2, Pencil, X, Truck, Package, Info
} from 'lucide-react';

const DEFAULT_PACKAGES = [
  { id: 1, name: "1-2 kg Load", price: 185, suitableFor: "1-2 kg of laundry (cotton shirts, shorts, socks)", inclusions: "1 Ariel sachet, 1 Downy sachet, Wash + Dry + Fold", isComforter: false },
  { id: 7, name: "Comforter - Single", price: 185, suitableFor: "Single size comforter", inclusions: "Deep Clean, High Heat Dry, Per piece pricing", isComforter: true },
];

export default function Pricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('wash'); // 'wash' or 'comforter'
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
    if (window.confirm("Delete this service?")) {
      const filtered = packages.filter(p => p.id !== id);
      setPackages(filtered);
      handleSaveToFirebase(filtered);
    }
  };

  if (loading) return <div className="p-20 text-center"><RefreshCw className="animate-spin inline mr-2"/> Loading...</div>;

  const filteredData = packages.filter(p => activeTab === 'wash' ? !p.isComforter : p.isComforter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      
      {/* Header & Tabs Area */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex bg-gray-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('wash')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'wash' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            WASH PACKAGES
          </button>
          <button 
            onClick={() => setActiveTab('comforter')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'comforter' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            COMFORTERS
          </button>
        </div>

        <button 
          onClick={() => openEditModal()}
          className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          <Plus size={16} /> ADD SERVICE
        </button>
      </div>

      {/* Main Table Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
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
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      <span className="text-sm font-bold text-gray-800">{pkg.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 max-w-[300px] truncate">
                    {pkg.suitableFor}
                  </td>
                  <td className="py-3 px-4">
                    <div className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg inline-flex items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-400">₱</span>
                      <span className="text-sm font-black text-gray-700">{pkg.price}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-md">ACTIVE</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => openEditModal(pkg)} className="text-gray-300 hover:text-blue-500 transition-colors"><Pencil size={16}/></button>
                      <button onClick={() => deletePackage(pkg.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE / ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Update Service</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Service Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={editingPkg.name}
                  onChange={e => setEditingPkg({...editingPkg, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price (₱)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    value={editingPkg.price}
                    onChange={e => setEditingPkg({...editingPkg, price: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
                  <div className="w-full bg-green-50 border border-green-100 text-green-600 rounded-xl px-4 py-2.5 text-xs font-bold text-center">ACTIVE</div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Details</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                  value={editingPkg.suitableFor}
                  onChange={e => setEditingPkg({...editingPkg, suitableFor: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Inclusions</label>
                <textarea 
                  rows="2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none resize-none"
                  value={editingPkg.inclusions}
                  onChange={e => setEditingPkg({...editingPkg, inclusions: e.target.value})}
                />
              </div>
            </div>

            <div className="p-5 bg-gray-50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-white">CANCEL</button>
              <button onClick={closeAndSaveModal} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">UPDATE SERVICE</button>
            </div>
          </div>
        </div>
      )}

      {/* Other Config (Fees & Areas) - Minimized logic remains below */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2"><Truck size={14}/> Service Fees</h3>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-[10px] text-gray-400 font-bold block mb-1">Delivery Fee</label>
               <input type="number" value={fees.delivery_fee} onChange={e => setFees({...fees, delivery_fee: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold"/>
             </div>
             <div>
               <label className="text-[10px] text-gray-400 font-bold block mb-1">Heavy Garment</label>
               <input type="number" value={fees.heavy_garment_fee} onChange={e => setFees({...fees, heavy_garment_fee: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold"/>
             </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2"><Truck size={14}/> Allowed Areas</h3>
          <textarea 
            value={serviceAreas} 
            onChange={e => setServiceAreas(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-medium resize-none" rows="2"
          />
        </div>
      </div>
    </div>
  );
}
