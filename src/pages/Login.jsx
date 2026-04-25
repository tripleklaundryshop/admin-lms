import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/login.module.css";
// Added Eye and EyeOff icons
import { Lock, Shirt, ArrowRight, User, Eye, EyeOff } from "lucide-react";
import { auth } from "../services/firebase-config.js";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // New state for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login Successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else {
        setError("Failed to login. Please check your credentials.");
      }
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ALERTS CONTAINER */}
      <div className={styles.alertContainer}>
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {error}
            <button type="button" className="btn-close" 
            onClick={() => setError("")}>
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> {success}
          </div>
        )}
      </div>

      <div className={styles.mainContainer}>
        {/* LEFT SECTION (BLUE) */}
        <div className={styles.leftSection}>
          <div className={styles.logoWrapper}>
            <div className={styles.archPart}>
              <Shirt size={50} className={styles.shirtIcon} />
            </div>
            <div className={styles.textPart}>
              <h2>Laundry <br /> Management <br /> System</h2>
            </div>
          </div>
          <p className={styles.leftSubtext}>
            Efficient inventory management <br /> and cashflow tracking.
          </p>
        </div>

        {/* RIGHT SECTION (CREAM) */}
        <div className={styles.rightSection}>
          <div className={styles.adminAccess}>Admin Access</div>
          
          <div className={styles.formHeader}>
            <h1 className={styles.welcomeTitle}>Welcome Back</h1>
            <p className={styles.welcomeSubtitle}>Please enter your credentials.</p>
          </div>

          <form className={styles.form} onSubmit={handleAuth}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <div className={styles.inputWrapperBlue}>
                <User className={styles.inputIconBlue} size={20} />
                <input
                  className={styles.inputBlue}
                  type="email"
                  placeholder="admintriplek@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>PASSWORD</label>
              <div className={styles.inputWrapperGray} style={{ display: 'flex', alignItems: 'center' }}>
                <Lock className={styles.inputIconGray} size={20} />
                <input
                  className={styles.inputGray}
                  // Type changes based on showPassword state
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    outline: 'none'
                  }}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.accessBtn} 
              disabled={success !== ""}
            >
              {success ? "Processing..." : "Access System"}
              {!success && <ArrowRight size={20} style={{marginLeft: '10px'}} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;