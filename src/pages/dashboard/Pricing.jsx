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

  // Modal States
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

  const handleSaveToFirebase = async (currentPackages = packages) => {
    try {
      await setDoc(doc(db, 'settings', 'pricing'), {
        packages: currentPackages,
        delivery_fee: Number(fees.delivery_fee),
        heavy_garment_fee: Number(fees.heavy_garment_fee),
        addons,
        service_areas: serviceAreas.split(',').map(s => s.trim()).filter(s => s)
      });
    } catch (err) {
      alert('Sync failed: ' + err.message);
    }
  };

  const handleUpdateConfig = async (message) => {
    const isConfirmed = window.confirm(message || "Save changes to this configuration?");
    if (!isConfirmed) return;
    await handleSaveToFirebase();
    alert("Updated successfully!");
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
    const isConfirmed = window.confirm("Are you sure you want to update this service?");
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
      <RefreshCw className="animate-spin text-[#0d6efd]" size={32} />
      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
    </div>
  );

  const filteredData = packages.filter(p => activeTab === 'wash' ? !p.isComforter : p.isComforter);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* STICKY MOBILE HEADER - Ensures Sidebar Toggle is always accessible */}
      <div className="md:hidden flex items-center gap-4 bg-white p-4 border-b border-gray-200 sticky top-0 z-40">
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-sidebar'))} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-[#001D3D] truncate">Pricing Dashboard</h1>
      </div>

      <div className="p-3 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-200/50 p-1 rounded-xl w-full md:w-auto">
            <button onClick={() => setActiveTab('wash')} className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'wash' ? 'bg-white text-[#0d6efd] shadow-sm' : 'text-gray-500'}`}>WASH PACKAGES</button>
            <button onClick={() => setActiveTab('comforter')} className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'comforter' ? 'bg-white text-[#0d6efd] shadow-sm' : 'text-gray-500'}`}>COMFORTERS</button>
          </div>
          <button onClick={() => openEditModal()} className="w-full md:w-auto bg-[#0d6efd] text-white px-6 py-2.5 rounded-md text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0b5ed7] transition-all"><Plus size={16} /> ADD SERVICE</button>
        </div>

        {/* SERVICES CONTAINER */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Service Name</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Details</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rate (₱)</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-3 px-6"><div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500 shrink-0" /><span className="text-sm font-semibold text-gray-800">{pkg.name}</span></div></td>
                    <td className="py-3 px-4 text-xs text-gray-500 truncate max-w-[250px]">{pkg.suitableFor || "—"}</td>
                    <td className="py-3 px-4"><span className="text-sm font-bold text-gray-700">₱{pkg.price}</span></td>
                    <td className="py-3 px-4 text-center"><span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-1 rounded">ACTIVE</span></td>
                    <td className="py-3 px-4"><div className="flex justify-center gap-4"><button onClick={() => openEditModal(pkg)} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={16}/></button><button onClick={() => deletePackage(pkg.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST VIEW (Pencil below Trash as requested) */}
          <div className="md:hidden divide-y divide-gray-100">
            <div className="grid grid-cols-2 py-4 px-6 bg-gray-50/50 border-b border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Details</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Rate (₱)</div>
            </div>
            {filteredData.length === 0 ? (
              <div className="p-10 text-center text-xs text-gray-400">No services added yet.</div>
            ) : (
              filteredData.map((pkg) => (
                <div key={pkg.id} className="grid grid-cols-12 items-center py-6 px-6 active:bg-gray-50 transition-colors">
                  <div className="col-span-9 pr-2">
                    <p className="text-sm font-bold text-gray-800">{pkg.name}</p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{pkg.suitableFor || "—"}</p>
                  </div>
                  <div className="col-span-3 flex flex-col items-end gap-4">
                    <p className="text-sm font-black text-gray-800">₱{pkg.price}</p>
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                       <button onClick={(e) => { e.stopPropagation(); deletePackage(pkg.id); }} className="hover:text-red-500 p-1"><Trash2 size={16}/></button>
                       <button onClick={(e) => { e.stopPropagation(); openEditModal(pkg); }} className="hover:text-blue-600 p-1"><Pencil size={16}/></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM CONFIGS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Service Fees */}
          <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8">Service Fees</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Delivery Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₱</span>
                    <input type="number" value={fees.delivery_fee} onChange={e => setFees({...fees, delivery_fee: e.target.value})} className="w-full border border-gray-200 rounded px-8 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-blue-100"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Heavy Garment</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₱</span>
                    <input type="number" value={fees.heavy_garment_fee} onChange={e => setFees({...fees, heavy_garment_fee: e.target.value})} className="w-full border border-gray-200 rounded px-8 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-blue-100"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => handleUpdateConfig("Update Service Fees?")} className="w-full sm:w-auto bg-[#0d6efd] text-white px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-[#0b5ed7] transition-all flex items-center justify-center gap-2">
                <Save size={14} /> Update Fees
              </button>
            </div>
          </div>

          {/* Allowed Areas */}
          <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8">Allowed Areas</h3>
              <textarea value={serviceAreas} onChange={e => setServiceAreas(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-4 text-xs font-medium resize-none min-h-[100px] outline-none focus:ring-1 focus:ring-blue-100" placeholder="Cogon Pardo, Basak San Nicolas, Mambaling..." />
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => handleUpdateConfig("Update Allowed Areas?")} className="w-full sm:w-auto bg-[#0d6efd] text-white px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-[#0b5ed7] transition-all flex items-center justify-center gap-2">
                <Save size={14} /> Save Areas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE MODAL */}
      {isModalOpen && editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Service Configuration</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24}/></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Service Name</label>
                <input type="text" className="w-full border border-gray-300 rounded px-4 py-2 text-sm outline-none" value={editingPkg.name} onChange={e => setEditingPkg({...editingPkg, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price (₱)</label>
                  <input type="number" className="w-full border border-gray-300 rounded px-4 py-2 text-sm outline-none" value={editingPkg.price} onChange={e => setEditingPkg({...editingPkg, price: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">App Status</label>
                  <div className="w-full bg-[#f1fcf4] border border-[#e3f7e9] text-[#198754] rounded px-4 py-2 text-xs font-bold text-center">LIVE</div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Details</label>
                <input type="text" className="w-full border border-gray-300 rounded px-4 py-2 text-sm outline-none" value={editingPkg.suitableFor} onChange={e => setEditingPkg({...editingPkg, suitableFor: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Inclusions</label>
                <textarea rows="3" className="w-full border border-gray-300 rounded px-4 py-2 text-sm outline-none resize-none" value={editingPkg.inclusions} onChange={e => setEditingPkg({...editingPkg, inclusions: e.target.value})} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50/50">
              <button onClick={() => setIsModalOpen(false)} className="bg-[#6c757d] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#5a6268]">Close</button>
              <button onClick={closeAndSaveModal} className="bg-[#0d6efd] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0b5ed7]">Update Service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
