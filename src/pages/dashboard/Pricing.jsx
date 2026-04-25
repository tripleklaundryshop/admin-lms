import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Save, RefreshCw, AlertCircle, CheckCircle2, Menu,
  Plus, Trash2, GripVertical, Package, Truck, ChevronDown, ChevronUp,
  CreditCard, MapPin, Sparkles
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
      <div className={`group transition-all duration-300 border ${isOpen ? 'border-blue-200 ring-2 ring-blue-50 shadow-lg' : 'border-gray-200 hover:border-gray-300 shadow-sm'} rounded-2xl overflow-hidden bg-white`}>
        <div
          className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${isOpen ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
          onClick={() => setExpandedId(isOpen ? null : pkg.id)}
        >
          <div className="flex flex-col shrink-0 items-center gap-0.5" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => move(globalIndex, -1)} className="text-gray-300 hover:text-blue-500 transition-colors p-1"><ChevronUp size={16}/></button>
            <button type="button" onClick={() => move(globalIndex,  1)} className="text-gray-300 hover:text-blue-500 transition-colors p-1"><ChevronDown size={16}/></button>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">{pkg.name || 'Unnamed Package'}</h3>
            {!isOpen && <p className="text-[11px] text-gray-400 font-medium truncate">{pkg.suitableFor || 'No description'}</p>}
          </div>

          <div className="text-right shrink-0 px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-sm font-black text-gray-700">₱{pkg.price}</span>
          </div>

          <button
            type="button"
            onClick={e => { e.stopPropagation(); deletePkg(pkg.id); }}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
          >
            <Trash2 size={16} />
          </button>

          <div className={`p-1 rounded-full bg-gray-100 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-100 text-blue-600' : ''}`}>
             <ChevronDown size={16} />
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-blue-100 bg-white px-6 py-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Package Name</label>
                <input
                  type="text"
                  value={pkg.name}
                  onChange={e => updatePkg(pkg.id, 'name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. 5-5.5 kg Load"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₱)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₱</div>
                  <input
                    type="number"
                    value={pkg.price}
                    onChange={e => updatePkg(pkg.id, 'price', parseInt(e.target.value) || 0)}
                    onFocus={e => e.target.select()}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Suitable For</label>
                <input
                  type="text"
                  value={pkg.suitableFor}
                  onChange={e => updatePkg(pkg.id, 'suitableFor', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. 5-5.5 kg of laundry"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">What's Included</label>
                <input
                  type="text"
                  value={pkg.inclusions}
                  onChange={e => updatePkg(pkg.id, 'inclusions', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Items separated by commas"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-5 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-sidebar'))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-black text-[#001D3D] uppercase tracking-tight">Pricing</h1>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-100 p-5 rounded-full mb-6 ring-8 ring-emerald-50"><CheckCircle2 className="text-emerald-600" size={56} /></div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Settings Saved!</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">Pricing updates are now live. All customers will see these changes immediately.</p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-[#001D3D] text-white font-bold py-4 rounded-2xl hover:bg-blue-900 transition-all active:scale-95 shadow-lg shadow-blue-900/20 uppercase tracking-widest text-xs">Got it</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10 pb-32">

        {/* DESKTOP HEADER */}
        <header className="hidden lg:block">
          <div className="flex items-center gap-3 mb-1">
            <CreditCard className="text-blue-600" size={28} />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pricing & Services</h1>
          </div>
          <p className="text-gray-500 font-medium">Manage your service packages and business logic in one place.</p>
        </header>

        {/* WASH PACKAGES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-800">Wash Packages</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Regular Laundry Services</p>
              </div>
            </div>
            <button type="button" onClick={() => addPackage(false)} className="flex items-center gap-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95">
              <Plus size={16}/> ADD PACKAGE
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {washPkgs.length === 0 ? (
              <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-[2rem]">
                <Package className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No packages found</p>
              </div>
            ) : (
              washPkgs.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)
            )}
          </div>
        </section>

        {/* COMFORTERS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-200">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-800">Comforter Care</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Per-Piece Premium Service</p>
              </div>
            </div>
            <button type="button" onClick={() => addPackage(true)} className="flex items-center gap-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95">
              <Plus size={16}/> ADD COMFORTER
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {comforterPkgs.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SERVICE FEES */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg text-white">
                <Truck size={20} />
              </div>
              <h2 className="text-lg font-black text-gray-800">Service Fees</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              {[
                { label: 'Delivery Fee (Fixed)', key: 'delivery_fee' },
                { label: 'Heavy Garment Fee',    key: 'heavy_garment_fee' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₱</span>
                    <input
                      type="number"
                      value={fees[f.key]}
                      onChange={e => setFees(prev => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))}
                      onFocus={e => e.target.select()}
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ADD-ONS */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg text-white">
                <Plus size={20} />
              </div>
              <h2 className="text-lg font-black text-gray-800">Detergent Add-ons</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {Object.keys(addons).map(key => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{key}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₱</span>
                    <input
                      type="number"
                      value={addons[key]}
                      onChange={e => setAddons(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SERVICE AREAS */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg text-white">
              <MapPin size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-800">Operational Areas</h2>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Allowed Locations (Separated by commas)</label>
            <textarea
              value={serviceAreas}
              onChange={e => setServiceAreas(e.target.value)}
              rows="3"
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-gray-50/50 resize-none"
              placeholder="e.g. Cogon Pardo, Basak San Nicolas"
            />
          </div>
        </section>

        {/* STICKY SAVE BAR */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl z-40">
          <div className="bg-[#001D3D] rounded-3xl p-4 shadow-2xl shadow-blue-900/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
              <AlertCircle size={18} className="text-blue-400" />
              <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.15em] leading-none">
                Double-check pricing before publishing live
              </p>
            </div>
            <button 
              type="submit" 
              disabled={saving} 
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-400 text-white px-10 py-3.5 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'UPDATING...' : 'PUBLISH CHANGES'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
