import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/login.module.css";
import { Lock, Shirt, ArrowRight, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { auth } from "../services/firebase-config.js";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login Successful! Redirecting...");
      setIsLoading(false);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setIsLoading(false);
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
      <div className={styles.alertContainer}>
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> {success}
          </div>
        )}
      </div>

      <div className={styles.mainContainer}>
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
              <div className={styles.inputWrapperGray} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock className={styles.inputIconGray} size={20} />
                <input
                  className={styles.inputGray}
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ flex: 1, paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    outline: 'none',
                    zIndex: 2
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
              disabled={isLoading || success !== ""}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" style={{ marginRight: '10px' }} />
                  Signing in...
                </>
              ) : success ? (
                "Processing..."
              ) : (
                <>
                  Access System <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
