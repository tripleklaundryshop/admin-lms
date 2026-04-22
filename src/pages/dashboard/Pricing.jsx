import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Menu, Package, Truck, Shirt } from 'lucide-react';

const Pricing = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [prices, setPrices] = useState({
    // Weight-based wash packages (matches price board)
    pkg_1_2kg:  185,
    pkg_3_3hkg: 215,
    pkg_4_4hkg: 225,
    pkg_5_5hkg: 235,
    pkg_6_6hkg: 265,
    pkg_7kg:    245,
    // Comforter (per piece)
    comforter_single: 185,
    comforter_double: 195,
    comforter_queen:  225,
    // Fees
    delivery_fee:       20,
    heavy_garment_fee:  50,
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const docRef = doc(db, 'settings', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Merge fetched data so new keys still get defaults if missing
          setPrices(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const openSidebar = () => window.dispatchEvent(new CustomEvent('open-sidebar'));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrices(prev => ({
      ...prev,
      [name]: value === "" ? "" : parseInt(value)
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const docRef = doc(db, 'settings', 'pricing');
      const dataToSave = Object.keys(prices).reduce((acc, key) => {
        acc[key] = prices[key] === "" ? 0 : Number(prices[key]);
        return acc;
      }, {});
      await setDoc(docRef, dataToSave, { merge: true });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Update failed:", error);
      alert('Failed to update prices.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center">
      <RefreshCw className="animate-spin text-blue-500" size={32} />
    </div>
  );

  // Field groups matching the physical price board
  const packageFields = [
    { label: "1–2 kg  (1 Ariel + 1 Downy)",   name: "pkg_1_2kg",  hint: "Lightest load" },
    { label: "3–3½ kg  (2 Ariel + 2 Downy)",  name: "pkg_3_3hkg", hint: "" },
    { label: "4–4½ kg  (3 Ariel + 2 Downy)",  name: "pkg_4_4hkg", hint: "" },
    { label: "5–5½ kg  (4 Ariel + 3 Downy)",  name: "pkg_5_5hkg", hint: "" },
    { label: "6–6½ kg  (5 Ariel + 3 Downy)",  name: "pkg_6_6hkg", hint: "Most common load" },
    { label: "7 kg       (6 Ariel + 4 Downy)", name: "pkg_7kg",    hint: "Max regular load" },
  ];

  const comforterFields = [
    { label: "Comforter – Single",     name: "comforter_single" },
    { label: "Comforter – Double",     name: "comforter_double" },
    { label: "Comforter – Queen Size", name: "comforter_queen"  },
  ];

  const feeFields = [
    { label: "Delivery Fee (Fixed)",  name: "delivery_fee" },
    { label: "Heavy Garment Fee",     name: "heavy_garment_fee" },
  ];

  const PriceInput = ({ label, name, hint }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 mb-1">{hint}</p>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₱</span>
        <input
          type="number"
          name={name}
          value={prices[name]}
          onChange={handleInputChange}
          onFocus={(e) => e.target.select()}
          className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-transparent">
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 mb-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={openSidebar} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-black text-[#001D3D] tracking-tight uppercase">Update Pricing</h1>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-4xl relative">

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <CheckCircle2 className="text-green-600" size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Prices Updated!</h3>
              <p className="text-gray-500 text-center mb-6">Changes are now live in the customer app.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#007AB9] text-white font-bold py-3 rounded-xl hover:bg-[#006494] transition-colors"
              >
                Okay
              </button>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        <div className="mb-6 hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-800">Update Pricing</h1>
          <p className="text-gray-500 text-sm">Changes made here will reflect immediately in the customer app.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">

          {/* Section 1: Weight-Based Packages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Package size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-gray-800">Wash Packages (by Weight)</h2>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Includes Detergent (Ariel) + Fabric Conditioner (Downy) ratio per load — matches the Triple K price board.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {packageFields.map(f => <PriceInput key={f.name} {...f} />)}
            </div>
          </div>

          {/* Section 2: Comforters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Shirt size={18} className="text-purple-600" />
              <h2 className="text-base font-bold text-gray-800">Comforter Cleaning (Per Piece)</h2>
            </div>
            <p className="text-xs text-gray-400 mb-5">Priced per individual comforter regardless of weight.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {comforterFields.map(f => <PriceInput key={f.name} {...f} />)}
            </div>
          </div>

          {/* Section 3: Fees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Truck size={18} className="text-green-600" />
              <h2 className="text-base font-bold text-gray-800">Service Fees</h2>
            </div>
            <p className="text-xs text-gray-400 mb-5">Fixed fees added on top of the selected package.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {feeFields.map(f => <PriceInput key={f.name} {...f} />)}
            </div>
          </div>

          {/* Save Bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg w-full sm:w-auto">
              <AlertCircle size={14} />
              <span>Updates go live immediately. Double-check before saving.</span>
            </div>
            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#007AB9] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#006494] transition-colors disabled:opacity-60"
            >
              {updating ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {updating ? 'Saving...' : 'Save All Prices'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Pricing;
