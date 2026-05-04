import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Loader2, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // List of authorized admin emails
  // You can add more emails here as needed
  const ALLOWED_ADMINS = [
    'akinnuoyesolomon68@gmail.com',
    'akinnuoyesolomon7@gmail.com'
  ];

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email || !ALLOWED_ADMINS.includes(user.email)) {
        setError(`Access Denied: ${user.email} is not authorized to access the admin portal.`);
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Ensure the user has an entry in 'admins' collection for firestore rules
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminDocRef);
      
      if (!adminSnap.exists()) {
        await setDoc(adminDocRef, {
          email: user.email,
          role: 'superadmin',
          lastLogin: Date.now(),
          displayName: user.displayName
        });
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else {
        setError('Login failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding bg-slate-50 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full px-4"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-5 rounded-[2rem] bg-primary text-white mb-6 shadow-2xl shadow-primary/30">
            <ShieldCheck size={56} />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Admin Portal</h1>
          <p className="text-slate-500 font-medium">TURY TOP SCHOOLS Management System</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-border">
          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-start gap-3">
              <AlertCircle size={24} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            <div className="text-center">
              <p className="text-slate-600 mb-8 leading-relaxed">
                To protect student data, we use <strong>Secure Google Authentication</strong> for administrator access.
              </p>

              <button 
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-primary" size={24} />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                )}
                <span className="font-bold text-slate-700">
                  {loading ? 'Authenticating...' : 'Sign in with Google'}
                </span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Authorized Access Only</span></div>
            </div>

            <p className="text-xs text-slate-400 text-center leading-relaxed italic">
              Only registered management accounts are allowed. If your access is denied, please contact the IT department.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:underline transition-all">
            <ArrowLeft size={18} /> Back to Homepage
          </Link>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            System Version 2.0.4
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
