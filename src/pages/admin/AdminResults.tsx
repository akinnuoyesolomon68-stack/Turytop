import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  Loader2, 
  X,
  FileText,
  User,
  Users,
  BookOpen,
  History,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubjectResult, StudentResult } from '../../types';

const AdminResults: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [publishedResults, setPublishedResults] = useState<StudentResult[]>([]);
  const [fetching, setFetching] = useState(true);
  
  // Form State
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [term, setTerm] = useState('First Term');
  const [filterYear, setFilterYear] = useState('2025/2026');
  const [subjects, setSubjects] = useState<SubjectResult[]>([
    { name: '', score: 0, grade: '' }
  ]);

  const SUBJECTS = [
    'Mathematics', 'English Language', 'Civic Education', 'Biology', 'Chemistry', 
    'Physics', 'Commerce', 'Financial Accounting', 'Government', 'Literature in English',
    'Economics', 'Agricultural Science', 'Geography', 'Further Mathematics', 'Computer Studies',
    'CRK/IRK', 'Yoruba Language', 'Igbo Language', 'Hausa Language', 'Data Processing',
    'Basic Science', 'Basic Technology', 'Social Studies', 'Home Economics', 'Business Studies'
  ];

  const CLASSES = [
    'PRIMARY 1', 'PRIMARY 2', 'PRIMARY 3', 'PRIMARY 4', 'PRIMARY 5', 'PRIMARY 6',
    'JSS 1', 'JSS 2', 'JSS 3', 
    'SSS 1', 'SSS 2', 'SSS 3'
  ];

  // Bulk State
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkClass, setBulkClass] = useState('JSS 1');
  const [bulkSubject, setBulkSubject] = useState(SUBJECTS[0]);
  const [classStudents, setClassStudents] = useState<{id: string, name: string, score: number, grade: string}[]>([]);

  const fetchClassStudents = async (targetClass: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'students'), where('class', '==', targetClass));
      const snap = await getDocs(q);
      const studentList: any[] = [];
      snap.forEach(doc => {
        studentList.push({ id: doc.data().studentId, name: doc.data().name });
      });

      // Now fetch existing results for these students for current session/term
      const resultPromises = studentList.map(async (s: any) => {
        const sidSanitized = s.id.replace(/\//g, '-');
        const docId = `${sidSanitized}_${academicYear.replace(/\//g, '-')}_${term.replace(/\s+/g, '-')}`.toUpperCase();
        const d = await getDoc(doc(db, 'results', docId));
        
        let existingScore = 0;
        let existingGrade = 'F';
        
        if (d.exists()) {
          const res = d.data();
          const sub = res.subjects?.find((subj: any) => subj.name === bulkSubject);
          if (sub) {
            existingScore = sub.score;
            existingGrade = sub.grade;
          }
        }
        
        return { ...s, score: existingScore, grade: existingGrade };
      });

      const finalResults = await Promise.all(resultPromises);
      setClassStudents(finalResults);
    } catch (err) {
      console.error(err);
      alert("Error fetching students or records.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    setLoading(true);
    try {
      const batchPromises = classStudents.map(async (student) => {
        // Deterministic ID: studentID_Year_Term (sanitized)
        const sidSanitized = student.id.replace(/\//g, '-');
        const docId = `${sidSanitized}_${academicYear.replace(/\//g, '-')}_${term.replace(/\s+/g, '-')}`.toUpperCase();
        const docRef = doc(db, 'results', docId);
        const docSnap = await getDoc(docRef);

        const newSubject = { name: bulkSubject, score: student.score, grade: student.grade };

        if (docSnap.exists()) {
          const currentData = docSnap.data();
          const subjects = currentData.subjects || [];
          // Remove existing entry for the same subject if it exists
          const filteredSubjects = subjects.filter((s: any) => s.name !== bulkSubject);
          return updateDoc(docRef, {
            subjects: [...filteredSubjects, newSubject],
            updatedAt: Date.now()
          });
        } else {
          return setDoc(docRef, {
            studentId: student.id,
            studentName: student.name,
            academicYear,
            term,
            subjects: [newSubject],
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        }
      });

      await Promise.all(batchPromises);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchResults();
      alert(`Successfully published ${bulkSubject} results for ${classStudents.length} students!`);
    } catch (err) {
      console.error(err);
      alert("Error during bulk upload. Please check permissions or connection.");
    } finally {
      setLoading(false);
    }
  };

  const updateBulkScore = (idx: number, score: number) => {
    const list = [...classStudents];
    list[idx].score = score;
    
    let g = 'F';
    if (score >= 70) g = 'A';
    else if (score >= 60) g = 'B';
    else if (score >= 50) g = 'C';
    else if (score >= 45) g = 'D';
    else if (score >= 40) g = 'E';
    list[idx].grade = g;
    
    setClassStudents(list);
  };

  const fetchResults = async () => {
    setFetching(true);
    try {
      const q = query(
        collection(db, 'results'), 
        where('academicYear', '==', filterYear),
        orderBy('createdAt', 'desc'), 
        limit(50)
      );
      const snapshot = await getDocs(q);
      const docs: StudentResult[] = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() } as StudentResult));
      setPublishedResults(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    fetchResults();
  }, [filterYear]);

  React.useEffect(() => {
    if (isBulkMode && classStudents.length > 0) {
      fetchClassStudents(bulkClass);
    }
  }, [bulkSubject, academicYear, term]);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', score: 0, grade: '' }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: keyof SubjectResult, value: string | number) => {
    const newSubjects = [...subjects];
    // @ts-ignore
    newSubjects[index][field] = value;
    
    // Auto calculate grade based on score
    if (field === 'score') {
      const s = Number(value);
      let g = 'F';
      if (s >= 70) g = 'A';
      else if (s >= 60) g = 'B';
      else if (s >= 50) g = 'C';
      else if (s >= 45) g = 'D';
      else if (s >= 40) g = 'E';
      newSubjects[index].grade = g;
    }
    
    setSubjects(newSubjects);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const sid = studentId.toUpperCase().trim();
      const sidSanitized = sid.replace(/\//g, '-');
      const docId = `${sidSanitized}_${academicYear.replace(/\//g, '-')}_${term.replace(/\s+/g, '-')}`.toUpperCase();
      const docRef = doc(db, 'results', docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const existingSubjects = currentData.subjects || [];
        // Merge New Subjects (if multiple subjects are added in individual mode, this logic handles them)
        const updatedSubjects = [...existingSubjects];
        
        subjects.forEach(newSub => {
          const idx = updatedSubjects.findIndex(s => s.name === newSub.name);
          if (idx > -1) {
            updatedSubjects[idx] = newSub;
          } else {
            updatedSubjects.push(newSub);
          }
        });

        await updateDoc(docRef, {
          subjects: updatedSubjects,
          updatedAt: Date.now()
        });
      } else {
        await setDoc(docRef, {
          studentId: sid,
          studentName,
          academicYear,
          term,
          subjects,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }

      setSuccess(true);
      // Reset form
      setStudentId('');
      setStudentName('');
      setSubjects([{ name: '', score: 0, grade: '' }]);
      setTimeout(() => setSuccess(false), 3000);
      fetchResults();
      alert("Result published successfully!");
    } catch (err) {
      console.error(err);
      alert("Error uploading result. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!window.confirm("Delete this result record permanently?")) return;
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'results', id));
      setPublishedResults(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">Results Management</h1>
          <p className="text-slate-500">Upload and manage school academic records.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setIsBulkMode(false)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!isBulkMode ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Individual
          </button>
          <button 
            onClick={() => setIsBulkMode(true)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${isBulkMode ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Bulk Class
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {isBulkMode ? (
              <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-xl space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Users className="text-primary" /> Bulk Class Results
                  </h2>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Session</span>
                      <select 
                        className="input-field py-2 text-sm w-32 border-slate-200"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                      >
                        <option value="2026/2027">2026/2027</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2024/2025">2024/2025</option>
                        <option value="2023/2024">2023/2024</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Term</span>
                      <select 
                        className="input-field py-2 text-sm w-32 border-slate-200"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                      >
                        <option>First Term</option>
                        <option>Second Term</option>
                        <option>Third Term</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Class</span>
                      <select 
                        className="input-field py-2 text-sm w-32"
                        value={bulkClass}
                        onChange={(e) => setBulkClass(e.target.value)}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={() => fetchClassStudents(bulkClass)}
                        className="btn-primary py-2 px-4 shadow-sm h-[42px]"
                      >
                        Fetch Students
                      </button>
                    </div>
                  </div>
                </div>

                {classStudents.length > 0 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Subject to Record</label>
                        <select 
                          className="input-field py-2 text-sm border-slate-200"
                          value={bulkSubject}
                          onChange={(e) => setBulkSubject(e.target.value)}
                        >
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-400">Class: {bulkClass}</div>
                        <div className="text-xs text-slate-400 font-medium">{classStudents.length} Students Found</div>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {classStudents.map((student, idx) => (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">{student.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono tracking-tighter">#{student.id}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-20">
                              <input 
                                type="number" 
                                min="0" max="100"
                                className="w-full text-center py-2 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                value={student.score}
                                onChange={(e) => updateBulkScore(idx, parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="w-10 text-center font-black text-primary bg-primary/5 rounded-lg py-1.5 text-xs">
                              {student.grade}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleBulkUpload}
                      disabled={loading}
                      className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary/20"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                      {loading ? 'Processing Bulk Records...' : `Publish ${bulkSubject} Results`}
                    </button>
                  </div>
                )}

                {classStudents.length === 0 && !loading && (
                  <div className="p-20 text-center text-slate-400 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <User size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Select a class and fetch students to begin bulk recording.</p>
                  </div>
                )}
              </div>
            ) : (
              <form 
                onSubmit={handleUpload}
                className="bg-white p-8 rounded-[2.5rem] border border-border shadow-xl space-y-8"
              >
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <Plus className="text-primary" /> Publish New Result
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <User size={16} /> Reg Number
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="TTS/2024/001" 
                    className="input-field uppercase"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                     <User size={16} /> Full Name
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="Samuel Solomon" 
                    className="input-field"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <History size={16} /> Session
                  </label>
                  <select 
                    className="input-field py-3 border-slate-200"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  >
                    <option value="2026/2027">2026/2027</option>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2023/2024">2023/2024</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <FileText size={16} /> Term
                  </label>
                  <select 
                    className="input-field py-3 border-slate-200"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  >
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" /> Grade Entries
                  </h3>
                  <button 
                    type="button" 
                    onClick={addSubject}
                    className="text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    <Plus size={16} /> Add Row
                  </button>
                </div>

                <div className="space-y-4">
                  {subjects.map((sub, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50/50 p-5 rounded-2xl border border-slate-100 relative group hover:border-primary/20 transition-all">
                      <div className="flex-grow space-y-1 w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Subject</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Mathematics" 
                          className="input-field py-2 bg-white"
                          value={sub.name}
                          onChange={(e) => updateSubject(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-full sm:w-28 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Score</label>
                        <input 
                          required
                          type="number" 
                          min="0" max="100"
                          className="input-field py-2 text-center bg-white"
                          value={sub.score}
                          onChange={(e) => updateSubject(idx, 'score', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-full sm:w-20 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Grade</label>
                        <input 
                          readOnly
                          type="text" 
                          className="input-field py-2 text-center bg-white font-black text-primary border-primary/20"
                          value={sub.grade}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeSubject(idx)}
                        disabled={subjects.length === 1}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-0 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  {loading ? 'Publishing Data...' : 'Publish Result Now'}
                </button>
                
                <AnimatePresence>
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 p-4 text-center text-green-600 font-bold bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Success: Academic record published.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          )}

            {/* Published List */}
            <div className="bg-white rounded-[2.5rem] border border-border shadow-md overflow-hidden">
              <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <History size={18} /> Published 
                  </h3>
                  <div className="flex bg-white px-2 py-1 rounded-xl border border-slate-200">
                    <select 
                      className="bg-transparent border-0 text-[10px] font-black uppercase text-slate-500 outline-none cursor-pointer"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                    >
                      <option value="2026/2027">2026/2027</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2024/2025">2024/2025</option>
                      <option value="2023/2024">2023/2024</option>
                    </select>
                  </div>
                </div>
                {fetching && <Loader2 className="animate-spin text-primary" size={18} />}
              </div>
              <div className="divide-y divide-border">
                {publishedResults.map((res) => (
                  <div key={res.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        {res.studentName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{res.studentName}</div>
                        <div className="text-xs text-slate-400 font-medium">
                          {res.studentId} • {res.term} ({res.academicYear})
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteResult(res.id!)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {!fetching && publishedResults.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    No results published yet.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-bold mb-6 relative z-10">Scale & Grading</h3>
            <div className="space-y-4 relative z-10">
              {[
                { r: '70 - 100', g: 'A', desc: 'Distinction' },
                { r: '60 - 69', g: 'B', desc: 'Very Good' },
                { r: '50 - 59', g: 'C', desc: 'Credit' },
                { r: '45 - 49', g: 'D', desc: 'Pass' },
                { r: '40 - 44', g: 'E', desc: 'Fair' },
                { r: '0 - 39', g: 'F', desc: 'Fail' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-black text-lg">{item.g}</span>
                    <span className="text-[10px] text-blue-100/60 uppercase">{item.desc}</span>
                  </div>
                  <span className="text-blue-100 font-mono font-bold text-sm bg-white/10 px-3 py-1 rounded-lg">{item.r}</span>
                </div>
              ))}
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="card-base p-8 space-y-4 bg-yellow-50/50 border-yellow-200/50">
            <h3 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
              <ShieldCheck size={20} /> Integrity Notice
            </h3>
            <p className="text-sm text-yellow-700/80 leading-relaxed">
              Carefully verify the <strong>Registration ID</strong>. Students use this number to access their reports. Incorrect IDs mean students cannot view their performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
