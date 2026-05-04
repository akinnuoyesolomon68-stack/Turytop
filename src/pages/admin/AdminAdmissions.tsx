import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Check, 
  X, 
  Trash2, 
  Loader2, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen,
  Search,
  Filter,
  User,
  UserPlus
} from 'lucide-react';
import { AdmissionApplication, AdmissionStatus, StudentInfo } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const AdminAdmissions: React.FC = () => {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'all'>('all');
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'admissions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const docs: AdmissionApplication[] = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() } as AdmissionApplication));
      setApplications(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: AdmissionStatus) => {
    try {
      await updateDoc(doc(db, 'admissions', id), { status: newStatus });
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      
      if (newStatus === 'accepted') {
        alert("Admission Granted! An admission letter has been theoretically triggered to the student's email.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleRegisterStudent = async (app: AdmissionApplication) => {
    setRegisteringId(app.id!);
    const sid = `TTS/${new Date().getFullYear()}/${app.id?.substring(0, 4).toUpperCase()}`;
    const docId = sid.replace(/\//g, '-');
    const studentData: StudentInfo = {
      studentId: sid,
      name: app.fullName,
      class: app.classSeeking || 'N/A',
      createdAt: Date.now()
    };
    
    try {
      // Optimistic update for admissions list
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, registered: true, studentId: sid } : a));
      
      await setDoc(doc(db, 'students', docId), studentData);
      await updateDoc(doc(db, 'admissions', app.id!), { registered: true, studentId: sid });
      
      setSuccessMsg(`Student Registered Successfully! ID: ${sid}`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
      // Rollback on error
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, registered: false, studentId: undefined } : a));
      alert("Registration failed. Please check your connection.");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await deleteDoc(doc(db, 'admissions', id));
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  const filtered = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">Admission Applications</h1>
          <p className="text-slate-500">Manage and review student applications for the new session.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchApplications} className="btn-secondary py-2 px-4 text-sm bg-white">
            Refresh List
          </button>
        </div>
      </header>

      {/* Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] w-full max-w-md px-4"
          >
            <div className="bg-green-600 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Check size={28} />
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-lg">Registration Successful</h4>
                <p className="text-white/80 text-sm leading-tight font-medium">{successMsg.split('! ')[1]}</p>
              </div>
              <button 
                onClick={() => setSuccessMsg(null)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="input-field pl-10 py-2 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="input-field py-2 border-slate-200 w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p>Loading applications...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest pl-8">Student Detail</th>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest text-center">Score</th>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest">Contact Info</th>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest">Applied</th>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest">Status</th>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <User size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{app.fullName}</div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <BookOpen size={12} /> {app.classSeeking || 'Not Specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-black text-sm border-2 ${
                        (app.testScore || 0) >= 70 ? 'bg-green-50 border-green-200 text-green-700' :
                        (app.testScore || 0) >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {app.testScore?.toFixed(0) || '0'}%
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" /> {app.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" /> {app.parentContact}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-slate-600">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {app.status === 'reviewed' ? 'under review' : app.status}
                      </span>
                    </td>
                    <td className="p-6 pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {app.status === 'accepted' && !app.registered && (
                          <button 
                            disabled={registeringId === app.id}
                            onClick={() => handleRegisterStudent(app)}
                            className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-bold uppercase hover:bg-primary/90 transition-all disabled:opacity-50"
                            title="Register as Student"
                          >
                            {registeringId === app.id ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                            {registeringId === app.id ? 'Wait...' : 'Register'}
                          </button>
                        )}
                        {app.registered && (
                          <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase mr-2">
                             <Check size={14} /> Registered
                          </div>
                        )}
                        {app.status !== 'accepted' && (
                          <button 
                            onClick={() => handleStatusUpdate(app.id!, 'accepted')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Accept"
                          >
                            <Check size={20} />
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button 
                            onClick={() => handleStatusUpdate(app.id!, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Reject"
                          >
                            <X size={20} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(app.id!)}
                          className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-border text-center">
          <p className="text-slate-400">No applications found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAdmissions;
