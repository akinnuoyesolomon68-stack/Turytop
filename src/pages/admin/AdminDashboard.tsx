import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Loader2,
  Database
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminAdmissions from './AdminAdmissions';
import AdminResults from './AdminResults';
import AdminStudents from './AdminStudents';
import AdminSupabaseConfig from './AdminSupabaseConfig';
import LoadingScreen from '../../components/LoadingScreen';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            setAuthenticated(true);
          } else {
            const ALLOWED_ADMINS = [
              'akinnuoyesolomon68@gmail.com',
              'akinnuoyesolomon7@gmail.com'
            ];
            
            if (user.email && ALLOWED_ADMINS.includes(user.email)) {
              await setDoc(doc(db, 'admins', user.uid), {
                email: user.email,
                role: 'superadmin',
                lastLogin: Date.now(),
                displayName: user.displayName || 'Admin'
              });
              setAuthenticated(true);
            } else {
              setAuthError(`Access Denied: ${user.email} is not an authorized administrator.`);
              setTimeout(async () => {
                await signOut(auth);
                navigate('/admin');
              }, 3000);
            }
          }
        } catch (err: any) {
          console.error("Dashboard Auth Error:", err);
          setAuthError(`Verification failed: ${err.message}. Re-authenticating...`);
          setTimeout(async () => {
            await signOut(auth);
            navigate('/admin');
          }, 3000);
        }
      } else {
        navigate('/admin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <LoadingScreen />;
  
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <X size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Security Check</h2>
          <p className="text-slate-500">{authError}</p>
          <div className="pt-4">
            <Loader2 className="animate-spin mx-auto text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Admissions', path: '/admin/admissions', icon: Users },
    { name: 'Results', path: '/admin/results', icon: FileCheck },
    { name: 'Database', path: '/admin/config', icon: Database },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-border sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-6">
            <div className="bg-primary text-white p-2 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Administrator</div>
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Session</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-4 rounded-xl font-medium transition-all group ${
                  location.pathname === item.path 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'} />
                  {item.name}
                </div>
                <ChevronRight size={16} className={location.pathname === item.path ? 'text-white/50' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-primary">Admin Dashboard</span>
          <div className="w-10"></div>
        </div>

        <main className="p-4 md:p-8 flex-grow">
          <Routes>
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="config" element={<AdminSupabaseConfig />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="w-72 h-full bg-white shadow-2xl p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-primary text-xl">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>

            <nav className="flex-grow space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-xl font-bold transition-all ${
                    location.pathname === item.path ? 'bg-primary text-white' : 'text-slate-600'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
            </nav>

            <button 
              onClick={handleLogout}
              className="mt-auto flex items-center gap-4 p-4 text-red-500 font-bold border-t border-border"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
