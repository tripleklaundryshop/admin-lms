import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom"; // Added useLocation
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase-config"; 

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007AB9]"></div>
      </div>
    );
  }

  if (!user) {
    // replace ensures they can't go back. state remembers where they were trying to go.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;