import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  { id: 7, name: "Comforter - Single", price: 185, suitableFor: "Single size comforter", inclusions: "Deep Clean, High Heat Dry, Per piece pricing", isComforter: true },
  { id: 8, name: "Comforter - Double", price: 195, suitableFor: "Double size comforter", inclusions: "Deep Clean, High Heat Dry, Per piece pricing", isComforter: true },
  { id: 9, name: "Comforter - Queen",  price: 225, suitableFor: "Queen size comforter",  inclusions: "Deep Clean, High Heat Dry, Per piece pricing", isComforter: true },
];

export default function Pricing() {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [packages, setPackages]   = useState(DEFAULT_PACKAGES);
  const [fees, setFees]           = useState({ delivery_fee: 20, heavy_garment_fee: 50 });
  const [addons, setAddons]       = useState({ Surf: 15, Downy: 12, Del: 13, Ariel: 15, Breeze: 20 });
  const [serviceAreas, setServiceAreas] = useState("Cogon Pardo, Basak San Nicolas, Mambaling");
  const [expandedId, setExpandedId] = useState(null);
  const [nextId, setNextId]       = useState(200);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'pricing'));
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.packages) && data.packages.length > 0) {
            setPackages(data.packages);
          }
          setFees({
            delivery_fee:      data.delivery_fee      ?? 20,
            heavy_garment_fee: data.heavy_garment_fee ?? 50,
          });
          if (data.addons) setAddons(data.addons);
          if (data.service_areas) setServiceAreas(data.service_areas.join(", "));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
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
    if (window.confirm('Delete this package?')) {
      setPackages(prev => prev.filter(p => p.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  const addPackage = (isComforter) => {
    const id = nextId;
    setNextId(n => n + 1);
    const newPkg = {
      id,
      name: isComforter ? 'New Comforter Type' : 'New Package',
      price: 0,
      suitableFor: '',
      inclusions: 'Wash + Dry + Fold',
      isComforter,
    };
    setPackages(prev => [...prev, newPkg]);
    setExpandedId(id);
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
      <RefreshCw className="animate-spin text-blue-500" size={32} />
    </div>
  );

  const washPkgs      = packages.filter(p => !p.isComforter);
  const comforterPkgs = packages.filter(p =>  p.isComforter);

  const PackageCard = ({ pkg }) => {
    const globalIndex = packages.findIndex(p => p.id === pkg.id);
    const isOpen = expandedId === pkg.id;

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div
          className="flex items-center gap-2 px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors select-none"
          onClick={() => setExpandedId(isOpen ? null : pkg.id)}
        >
          <div className="flex flex-col shrink-0" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => move(globalIndex, -1)} className="text-gray-300 hover:text-gray-600 leading-none py-0.5"><ChevronUp size={13}/></button>
            <button type="button" onClick={() => move(globalIndex,  1)} className="text-gray-300 hover:text-gray-600 leading-none py-0.5"><ChevronDown size={13}/></button>
          </div>

          <GripVertical size={13} className="text-gray-300 shrink-0" />

          <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{pkg.name || 'Unnamed'}</span>
          <span className="text-sm font-bold text-blue-600 shrink-0 mr-2">₱{pkg.price}</span>

          <button
            type="button"
            onClick={e => { e.stopPropagation(); deletePkg(pkg.id); }}
            className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>

          <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Package Name</label>
              <input
                type="text"
                value={pkg.name}
                onChange={e => updatePkg(pkg.id, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="e.g. 5-5.5 kg Load"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Price (₱)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">₱</span>
                <input
                  type="number"
                  value={pkg.price}
                  onChange={e => updatePkg(pkg.id, 'price', parseInt(e.target.value) || 0)}
                  onFocus={e => e.target.select()}
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Suitable For <span className="font-normal normal-case text-gray-400">(shown in app)</span>
              </label>
              <input
                type="text"
                value={pkg.suitableFor}
                onChange={e => updatePkg(pkg.id, 'suitableFor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="e.g. 5-5.5 kg of laundry"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                What's Included <span className="font-normal normal-case text-gray-400">(comma separated)</span>
              </label>
              <input
                type="text"
                value={pkg.inclusions}
                onChange={e => updatePkg(pkg.id, 'inclusions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="e.g. 4 Ariel sachets, 3 Downy sachets, Wash + Dry + Fold"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-transparent">
      <style>{`input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>

      <div className="lg:hidden bg-white border-b border-gray-200 p-4 mb-4 flex items-center gap-4 sticky top-0 z-40">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-sidebar'))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-black text-[#001D3D] uppercase tracking-tight">Update Pricing</h1>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-4"><CheckCircle2 className="text-green-600" size={48} /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Prices Updated!</h3>
            <p className="text-gray-500 mb-6">Changes are now live in the customer app — homepage and booking screen updated automatically.</p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-[#007AB9] text-white font-bold py-3 rounded-xl hover:bg-[#006494] transition-colors">Okay</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="p-4 lg:p-8 max-w-4xl space-y-6">

        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-800">Update Pricing</h1>
          <p className="text-gray-500 text-sm mt-1">Add, remove, rename, or reprice any package — changes reflect immediately on the homepage and booking screen.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-gray-800">Wash Packages</h2>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">{washPkgs.length}</span>
            </div>
            <button type="button" onClick={() => addPackage(false)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={13}/> Add Package
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Click a row to edit. Use arrows to reorder. All changes go live when you save.</p>
          <div className="space-y-2">
            {washPkgs.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8 italic border-2 border-dashed border-gray-200 rounded-xl">
                No wash packages yet — click "Add Package" to create one.
              </p>
            ) : (
              washPkgs.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-purple-600" />
              <h2 className="text-base font-bold text-gray-800">Comforter Cleaning</h2>
              <span className="bg-purple-50 text-purple-600 text-[10px] font-black px-2 py-0.5 rounded-full">{comforterPkgs.length}</span>
            </div>
            <button type="button" onClick={() => addPackage(true)} className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={13}/> Add Comforter
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Priced per individual piece regardless of weight.</p>
          <div className="space-y-2">
            {comforterPkgs.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={18} className="text-green-600" />
            <h2 className="text-base font-bold text-gray-800">Service Fees</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Delivery Fee (Fixed)', key: 'delivery_fee' },
              { label: 'Heavy Garment Fee',    key: 'heavy_garment_fee' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">₱</span>
                  <input
                    type="number"
                    value={fees[f.key]}
                    onChange={e => setFees(prev => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))}
                    onFocus={e => e.target.select()}
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            ))}
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
              <p className="text-xs text-gray-400 mb-2">Separate barangays with commas</p>
              <textarea
                value={serviceAreas}
                onChange={e => setServiceAreas(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="e.g. Cogon Pardo, Basak San Nicolas"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg w-full sm:w-auto">
            <AlertCircle size={14} />
            <span>Saving overwrites all packages. Double-check before saving.</span>
          </div>
          <button type="submit" disabled={saving} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#007AB9] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#006494] transition-colors disabled:opacity-60">
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

      </form>
    </div>
  );

}