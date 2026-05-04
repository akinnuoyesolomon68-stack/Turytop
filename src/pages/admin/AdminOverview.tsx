import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  ChevronRight,
  GraduationCap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState({
    admissions: 0,
    results: 0,
    students: 0
  });
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const admissionsSnap = await getDocs(collection(db, 'admissions'));
        const resultsSnap = await getDocs(collection(db, 'results'));
        const studentsSnap = await getDocs(collection(db, 'students'));
        const recentAdmSnap = await getDocs(query(collection(db, 'admissions'), orderBy('createdAt', 'desc'), limit(5)));

        setStats({
          admissions: admissionsSnap.size,
          results: resultsSnap.size,
          students: studentsSnap.size
        });

        const recents: any[] = [];
        recentAdmSnap.forEach(doc => recents.push({ id: doc.id, ...doc.data() }));
        setRecentAdmissions(recents);
      } catch (err: any) {
        console.error(err);
        setError("Your session might have expired or you don't have permission to view this data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Students', value: stats.students, icon: GraduationCap, color: 'bg-green-500', trend: 'Total enrolled' },
    { label: 'Applications', value: stats.admissions, icon: Users, color: 'bg-blue-500', trend: 'Pending review' },
    { label: 'Results', value: stats.results, icon: FileText, color: 'bg-indigo-500', trend: 'Records' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-bold">Loading overview data...</p>
    </div>
  );

  if (error) return (
    <div className="p-12 bg-red-50 border border-red-100 rounded-[2.5rem] text-red-600 flex flex-col items-center gap-4 text-center">
      <AlertCircle size={48} />
      <div>
        <h2 className="text-2xl font-bold mb-2">Access Error</h2>
        <p className="font-medium opacity-80">{error}</p>
      </div>
      <button onClick={() => window.location.reload()} className="btn-primary bg-red-600 hover:bg-red-700 mt-4 border-0">
        Try Refreshing
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-800">System Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening at TURY TOP SCHOOLS today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{card.label}</div>
              <div className="text-4xl font-black text-slate-800">{card.value}</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                <TrendingUp size={10} /> {card.trend}
              </div>
            </div>
            <div className={`${card.color} text-white p-4 rounded-2xl shadow-lg`}>
              <card.icon size={28} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Admissions */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Recent Applications</h3>
            <Link to="/admin/admissions" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentAdmissions.length > 0 ? (
              recentAdmissions.map((adm) => (
                <div key={adm.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {adm.fullName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{adm.fullName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(adm.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    adm.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    adm.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {adm.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                No recent applications found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/results" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl border border-white/10 transition-all text-center">
                <div className="bg-blue-500 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText size={20} />
                </div>
                <div className="text-sm font-bold">Upload Result</div>
              </Link>
              <Link to="/admin/admissions" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl border border-white/10 transition-all text-center">
                <div className="bg-purple-500 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users size={20} />
                </div>
                <div className="text-sm font-bold">Review Apps</div>
              </Link>
              <Link to="/admin/students" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl border border-white/10 transition-all text-center">
                <div className="bg-green-500 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap size={20} />
                </div>
                <div className="text-sm font-bold">Manage Students</div>
              </Link>
            </div>
          </div>
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full -ml-12 -mb-12 blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
