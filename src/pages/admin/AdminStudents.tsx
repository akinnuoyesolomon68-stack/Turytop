import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  UserPlus, 
  Trash2, 
  Search, 
  Loader2, 
  User,
  Wallet,
  X,
  Plus,
  CheckCircle2,
  History
} from 'lucide-react';
import { StudentInfo } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastRegistered, setLastRegistered] = useState<StudentInfo | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate ID when modal opens
  useEffect(() => {
    if (isModalOpen && !newStudent.studentId) {
      generateId();
    }
  }, [isModalOpen]);
  
  // Form State
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    name: '',
    class: 'JSS 1'
  });

  const CLASSES = [
    'PRIMARY 1', 'PRIMARY 2', 'PRIMARY 3', 'PRIMARY 4', 'PRIMARY 5', 'PRIMARY 6',
    'JSS 1', 'JSS 2', 'JSS 3', 
    'SSS 1', 'SSS 2', 'SSS 3'
  ];

  const generateId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900) + 100;
    setNewStudent(prev => ({ ...prev, studentId: `TTS/${year}/${random}` }));
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const docs: StudentInfo[] = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() } as StudentInfo));
      setStudents(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    const sid = newStudent.studentId.trim().toUpperCase();
    const docId = sid.replace(/\//g, '-');
    const path = `students/${docId}`;
    
    try {
      const newStudentDoc: StudentInfo = {
        studentId: sid,
        name: newStudent.name,
        class: newStudent.class,
        createdAt: Date.now()
      };
      
      // Optimistic update for immediate feedback - putting it at the TOP
      setStudents(prev => [newStudentDoc, ...prev]);
      
      await setDoc(doc(db, 'students', docId), newStudentDoc);
      setLastRegistered(newStudentDoc);
      setNewStudent({ studentId: '', name: '', class: 'JSS 1' });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsModalOpen(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      // Rollback optimistic update if it failed for real
      setStudents(prev => prev.filter(s => s.studentId !== sid));
      setErrorMsg("Registration could not be completed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this student record?")) return;
    try {
      await deleteDoc(doc(db, 'students', id));
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">Student Registry</h1>
          <p className="text-slate-500">Manage active students and their registration records.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <UserPlus size={20} /> Add New Student
        </button>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Student ID or Name..." 
            className="input-field pl-10 py-2 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p>Loading students...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest pl-8">Student Name</th>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest">Class</th>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest">Registration ID</th>
                  <th className="p-6 font-bold text-slate-500 uppercase text-xs tracking-widest text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-600 shadow-sm border border-blue-200">
                          {student.name[0]}
                        </div>
                        <div className="font-bold text-slate-800">{student.name}</div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                        {student.class || 'N/A'}
                      </span>
                    </td>
                    <td className="p-6">
                      <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-primary font-bold text-sm border border-slate-200 uppercase tracking-tight">#{student.studentId}</code>
                    </td>
                    <td className="p-6 pr-8 text-right">
                      <button 
                        onClick={() => handleDelete(student.id!)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-border text-center text-slate-400">
          No students found. Add one to get started.
        </div>
      )}

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 border border-border"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-primary">New Student</h3>
                {!showSuccess && (
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X size={24} />
                  </button>
                )}
              </div>

              {showSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800">Successfully Registered!</h4>
                  <p className="text-slate-500 font-medium">The student record has been added to the portal.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleAddStudent} className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2">
                       <History size={16} /> {errorMsg}
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-bold text-slate-700">Registration ID</label>
                      <button 
                        type="button" 
                        onClick={generateId}
                        className="text-[10px] uppercase font-bold text-primary hover:underline"
                      >
                        Generate ID
                      </button>
                    </div>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. TTS/2024/001" 
                      className="input-field uppercase"
                      value={newStudent.studentId}
                      onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Student Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. John Doe" 
                      className="input-field"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Class</label>
                    <select 
                      required
                      className="input-field"
                      value={newStudent.class}
                      onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                    >
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Plus size={20} />
                      )}
                      {submitting ? 'Registering...' : 'Register Student'}
                    </button>
                    <button 
                      type="button" 
                      disabled={submitting}
                      onClick={() => setIsModalOpen(false)} 
                      className="w-full btn-secondary py-4 border-0 text-slate-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recently Registered "Footer" Alert */}
      {lastRegistered && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4"
        >
          <div className="bg-primary text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/20 backdrop-blur-md bg-opacity-95">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Recently Registered</p>
                <h4 className="font-bold text-lg">{lastRegistered.name} ({lastRegistered.class})</h4>
              </div>
            </div>
            <button 
              onClick={() => setLastRegistered(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Recent Activity Section */}
      <section className="pt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <History size={20} className="text-primary" />
          Recent Registrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.slice(0, 3).map((student) => (
            <div key={student.id + '_recent'} className="bg-white p-6 rounded-3xl border border-border flex items-center justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {student.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{student.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">{student.class}</p>
                </div>
              </div>
              <div className="text-right">
                <code className="text-[10px] bg-slate-50 px-2 py-1 rounded-md text-slate-400 font-bold uppercase">#{student.studentId.split('/').pop()}</code>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium italic">
              No recent activity yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminStudents;
