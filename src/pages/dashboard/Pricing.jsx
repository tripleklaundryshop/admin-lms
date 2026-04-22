import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase-config'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Menu } from 'lucide-react';

const Pricing = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [prices, setPrices] = useState({
    pkg1: 125,
    pkg2: 138,
    white_shirts: 150,
    mixed_shirts: 140,
    heavy_blankets: 180,
    delivery_fee: 20,
    heavy_garment_fee: 50
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const docRef = doc(db, 'settings', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPrices(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  // Function to open the sidebar on mobile
  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-sidebar'));
  };

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

  if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-transparent">
      <style>
        {`
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>

      {/* --- MOBILE HEADER (Same style as Orders Page) --- */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 mb-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={openSidebar}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-black text-[#001D3D] tracking-tight uppercase">
            Update Pricing
          </h1>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
             <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
             </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-4xl relative">
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

        <div className="mb-6 hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-800">Update Pricing</h1>
          <p className="text-gray-500 text-sm">Changes made here will reflect immediately in the customer app.</p>
        </div>

        <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Package 1 (8kg)", name: "pkg1" },
              { label: "Package 2 (8kg)", name: "pkg2" },
              { label: "Plain White Shirts", name: "white_shirts" },
              { label: "Mixed Shirts", name: "mixed_shirts" },
              { label: "Heavy Blankets", name: "heavy_blankets" },
              { label: "Delivery Fee (Fixed)", name: "delivery_fee" },
              { label: "Heavy Garment Fee", name: "heavy_garment_fee" }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                <input 
                  type="number" 
                  name={field.name} 
                  value={prices[field.name]} 
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded w-full sm:w-auto">
              <AlertCircle size={14} />
              <span>Updates are live. Verify prices before saving.</span>
            </div>
            
            <button type="submit" disabled={updating} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#007AB9] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#006494] transition-colors">
              {updating ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {updating ? 'Updating...' : 'Save Prices'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Pricing;