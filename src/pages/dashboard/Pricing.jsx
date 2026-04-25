import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  Save, RefreshCw, AlertCircle, CheckCircle2, Menu,
  Plus, Trash2, GripVertical, Package, Truck, ChevronDown, ChevronUp
} from 'lucide-react';

const DEFAULT_PACKAGES = [
  { id: 1, name: "1-2 kg Load",        price: 185, suitableFor: "1-2 kg of laundry (cotton shirts, shorts, socks)", inclusions: "1 Ariel sachet, 1 Downy sachet, Wash + Dry + Fold", isComforter: false },
  { id: 2, name: "3-3.5 kg Load",      price: 215, suitableFor: "3-3.5 kg of laundry", inclusions: "2 Ariel sachets, 2 Downy sachets, Wash + Dry + Fold", isComforter: false },
  { id: 3, name: "4-4.5 kg Load",      price: 225, suitableFor: "4-4.5 kg of laundry", inclusions: "3 Ariel sachets, 2 Downy sachets, Wash + Dry + Fold", isComforter: false },
  { id: 4, name: "5-5.5 kg Load",      price: 235, suitableFor: "5-5.5 kg of laundry", inclusions: "4 Ariel sachets, 3 Downy sachets, Wash + Dry + Fold", isComforter: false },
  { id: 5, name: "6-6.5 kg Load",      price: 265, suitableFor: "6-6.5 kg - cotton shirts, shorts, socks, jeans", inclusions: "5 Ariel sachets, 3 Downy sachets, Wash + Dry + Fold", isComforter: false },
  { id: 6, name: "7 kg Load",          price: 245, suitableFor: "7 kg - max regular load", inclusions: "6 Ariel sachets, 4 Downy sachets, Wash + Dry + Fold", isComforter: false },
];

// --- TABLE ROW COMPONENT ---
const PackageRow = ({ pkg, globalIndex, onMove, onDelete, onUpdate }) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
      {/* Reorder Column */}
      <td className="py-3 pl-4 w-12">
        <div className="flex items-center gap-1">
          <div className="flex flex-col shrink-0">
            <button type="button" onClick={() => onMove(globalIndex, -1)} className="text-gray-300 hover:text-blue-500 leading-none"><ChevronUp size={12}/></button>
            <button type="button" onClick={() => onMove(globalIndex,  1)} className="text-gray-300 hover:text-blue-500 leading-none"><ChevronDown size={12}/></button>
          </div>
          <GripVertical size={14} className="text-gray-200 group-hover:text-gray-400 transition-colors" />
        </div>
      </td>

      {/* Service Name */}
      <td className="py-3 px-2 min-w-[160px]">
        <input
          type="text"
          value={pkg.name}
          onChange={e => onUpdate(pkg.id, 'name', e.target.value)}
          className="w-full bg-transparent px-2 py-1.5 text-sm font-semibold text-gray-800 outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded"
          placeholder="Service Name"
        />
      </td>

      {/* Target Details / Suitable For */}
      <td className="py-3 px-2 min-w-[200px]">
        <input
          type="text"
          value={pkg.suitableFor}
          onChange={e => onUpdate(pkg.id, 'suitableFor', e.target.value)}
          className="w-full bg-transparent px-2 py-1.5 text-sm text-gray-600 outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded"
          placeholder="Suitable for..."
        />
      </td>

      {/* What's Included */}
      <td className="py-3 px-2 min-w-[200px]">
        <input
          type="text"
          value={pkg.inclusions}
          onChange={e => onUpdate(pkg.id, 'inclusions', e.target.value)}
          className="w-full bg-transparent px-2 py-1.5 text-sm text-gray-500 italic outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded"
          placeholder="Inclusions..."
        />
      </td>

      {/* Rate / Price */}
      <td className="py-3 px-2 w-32">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-sm">₱</span>
          <input
            type="number"
            value={pkg.price}
            onChange={e => onUpdate(pkg.id, 'price', parseInt(e.target.value) || 0)}
            onFocus={e => e.target.select()}
            className="w-full pl-6 pr-2 py-1.5 text-sm font-bold text-blue-600 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded text-right"
          />
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 w-12 text-center">
        <button
          type="button"
          onClick={() => onDelete(pkg.id)}
          className="text-gray-300 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
};

// --- TABLE WRAPPER COMPONENT ---
const PackageTable = ({ title, icon: Icon, colorClass, data, packagesState, onAdd, onMove, onDelete, onUpdate }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={18} className={colorClass} />
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
        <span className={`${colorClass.replace('text', 'bg').replace('600', '50')} ${colorClass} text-[10px] font-black px-2 py-0.5 rounded-full`}>
          {data.length}
        </span>
      </div>
      <button 
        type="button" 
        onClick={onAdd}
        className={`flex items-center gap-1.5 text-xs font-bold ${colorClass} ${colorClass.replace('text', 'bg').replace('600', '50')} hover:opacity-80 px-3 py-1.5 rounded-lg transition-all`}
      >
        <Plus size={13}/> Add Service
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50">
            <th className="py-3 pl-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-12">#</th>
            <th className="py-3 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Service Name</th>
            <th className="py-3 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Target Details</th>
            <th className="py-3 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Included</th>
            <th className="py-3 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-32 text-right">Rate (₱)</th>
            <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-12 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-12 text-center text-gray-400 text-sm italic">
                No services added yet. Click "Add Service" to begin.
              </td>
            </tr>
          ) : (
            data.map(pkg => (
              <PackageRow 
                key={pkg.id} 
                pkg={pkg} 
                globalIndex={packagesState.findIndex(p => p.id === pkg.id)}
                onMove={onMove}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function Pricing() {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [packages, setPackages]   = useState(DEFAULT_PACKAGES);
  const [fees, setFees]           = useState({ delivery_fee: 20, heavy_garment_fee: 50 });
  const [addons, setAddons]       = useState({ Surf: 15, Downy: 12, Del: 13, Ariel: 15, Breeze: 20 });
  const [serviceAreas, setServiceAreas] = useState("Cogon Pardo, Basak San Nicolas, Mambaling");

  useEffect(() => {
    const docRef = doc(db, 'settings', 'pricing');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.packages)) setPackages(data.packages);
        setFees({
          delivery_fee:      data.delivery_fee      ?? 20,
          heavy_garment_fee: data.heavy_garment_fee ?? 50,
        });
        if (data.addons) setAddons(data.addons);
        if (data.service_areas) setServiceAreas(data.service_areas.join(", "));
      }
      setLoading(false);
    }, (error) => {
      console.error("Pricing error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'pricing'), {
        packages,
        delivery_fee:      Number(fees.delivery_fee)      || 0,
        heavy_garment_fee: Number(fees.heavy_garment_fee) || 0,
        addons,
        service_areas: serviceAreas.split(',').map(s => s.trim()).filter(s => s)
      });
      setShowSuccess(true);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally { setSaving(false); }
  };

  const updatePkg = (id, field, value) =>
    setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  const deletePkg = (id) => {
    if (window.confirm('Delete this service?')) {
      setPackages(prev => prev.filter(p => p.id !== id));
    }
  };

  const addPackage = (isComforter) => {
    const id = Date.now();
    const newPkg = {
      id,
      name: isComforter ? 'New Comforter Type' : 'New Wash Package',
      price: 0,
      suitableFor: '',
      inclusions: 'Wash + Dry + Fold',
      isComforter,
    };
    setPackages(prev => [...prev, newPkg]);
  };

  const move = (globalIndex, dir) => {
    setPackages(prev => {
      const arr = [...prev];
      const target = globalIndex + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[globalIndex], arr[target]] = [arr[target], arr[globalIndex]];
      return arr;
    });
  };

  if (loading) return (
    <div className="p-8 flex justify-center items-center min-h-[60vh]">
      <RefreshCw className="animate-spin text-[#007AB9]" size={32} />
    </div>
  );

  const washPkgs      = packages.filter(p => !p.isComforter);
  const comforterPkgs = packages.filter(p =>  p.isComforter);

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-transparent">
      <style>{`input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 mb-4 flex items-center gap-4 sticky top-0 z-40">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-sidebar'))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-black text-[#001D3D] uppercase tracking-tight">Pricing Dashboard</h1>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-4"><CheckCircle2 className="text-green-600" size={48} /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Prices Updated!</h3>
            <p className="text-gray-500 mb-6">Changes are live in real-time across all customer applications.</p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-[#007AB9] text-white font-bold py-3 rounded-xl hover:bg-[#006494] transition-colors">Done</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
        
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-800">Update Pricing</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your services and rates. Updates sync instantly to the mobile app.</p>
        </div>

        {/* Wash Packages Table */}
        <PackageTable 
          title="Wash Packages" 
          icon={Package} 
          colorClass="text-blue-600"
          data={washPkgs}
          packagesState={packages}
          onAdd={() => addPackage(false)}
          onMove={move}
          onDelete={deletePkg}
          onUpdate={updatePkg}
        />

        {/* Comforter Packages Table */}
        <PackageTable 
          title="Comforter Cleaning" 
          icon={Package} 
          colorClass="text-purple-600"
          data={comforterPkgs}
          packagesState={packages}
          onAdd={() => addPackage(true)}
          onMove={move}
          onDelete={deletePkg}
          onUpdate={updatePkg}
        />

        {/* Service Fees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={18} className="text-green-600" />
            <h2 className="text-base font-bold text-gray-800">Service Fees</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Delivery Fee (Fixed)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">₱</span>
                <input
                  type="number"
                  value={fees.delivery_fee}
                  onChange={e => setFees(prev => ({ ...prev, delivery_fee: parseInt(e.target.value) || 0 }))}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Heavy Garment Fee</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">₱</span>
                <input
                  type="number"
                  value={fees.heavy_garment_fee}
                  onChange={e => setFees(prev => ({ ...prev, heavy_garment_fee: parseInt(e.target.value) || 0 }))}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add-ons & Service Areas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-orange-600" />
            <h2 className="text-base font-bold text-gray-800">Add-ons & Service Areas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Add-on Prices (₱)</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(addons).map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-16">{key}</span>
                    <input
                      type="number"
                      value={addons[key]}
                      onChange={e => setAddons(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Allowed Service Areas</label>
              <textarea
                value={serviceAreas}
                onChange={e => setServiceAreas(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="e.g. Mambaling, Basak San Nicolas"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg w-full sm:w-auto">
            <AlertCircle size={14} />
            <span>Updates go live immediately after clicking Save.</span>
          </div>
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#007AB9] text-white px-12 py-3 rounded-lg font-bold hover:bg-[#006494] transition-colors disabled:opacity-60"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
