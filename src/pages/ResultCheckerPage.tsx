import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Search, FileText, AlertCircle, Loader2, Download, User, Calendar, BookCheck } from 'lucide-react';
import { StudentResult } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ResultCheckerPage: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [results, setResults] = useState<StudentResult[]>([]);
  const [admissionStatus, setAdmissionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'academic' | 'admission'>('academic');

  const ACADEMIC_YEARS = [
    '2026/2027',
    '2025/2026',
    '2024/2025',
    '2023/2024',
    '2022/2023',
  ];

  const handleDownloadPDF = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      alert("Container not found. Please try again.");
      return;
    }

    try {
      setDownloadingId(elementId);
      
      // Delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        ignoreElements: (el) => el.classList.contains('no-print') || el.hasAttribute('data-html2canvas-ignore')
      });
      
      const imgData = canvas.toDataURL('image/png', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = (canvas.width * 0.264583) / 1.5; // PX to MM conversion approx
      const imgHeight = (canvas.height * 0.264583) / 1.5;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      // Explicit fallback
      window.print();
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryTerm = studentId.trim().toUpperCase();
    if (!queryTerm) return;

    setLoading(true);
    setError(null);
    setSearched(false);
    setResults([]);
    setAdmissionStatus(null);

    try {
      const queryTermNormalized = queryTerm.replace(/-/g, '/'); // TTS-2024 -> TTS/2024
      const queryTermSanitized = queryTerm.replace(/\//g, '-'); // TTS/2024 -> TTS-2024

      if (searchType === 'academic') {
        // Try searching for studentId field with both formats and filter by academicYear
        const academicRef = collection(db, 'results');
        
        // Use queries that combine studentId and academicYear
        const q1 = query(academicRef, 
          where('studentId', '==', queryTermNormalized),
          where('academicYear', '==', academicYear)
        );
        const q2 = query(academicRef, 
          where('studentId', '==', queryTermSanitized),
          where('academicYear', '==', academicYear)
        );
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const fetchedResults: StudentResult[] = [];
        
        const processSnap = (snap: any) => {
          snap.forEach((doc: any) => {
            const data = doc.data() as StudentResult;
            if (!fetchedResults.find(r => r.id === doc.id)) {
              fetchedResults.push({ id: doc.id, ...data });
            }
          });
        };

        processSnap(snap1);
        processSnap(snap2);
        
        fetchedResults.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setResults(fetchedResults);
        if (fetchedResults.length === 0) {
          setError(`No academic records found for this student ID in the ${academicYear} session. Please check the ID or academic year selection.`);
        }
      } else {
        // Checking Admission Status
        const admissionsRef = collection(db, 'admissions');
        
        // Strategy: 1. Try getDoc by ID directly (most accurate for Application ID)
        // 2. Fallback to list search if it's a partial match or studentId
        try {
          const directDoc = await getDocs(query(admissionsRef)); // This works as allow list: if true
          let found = false;
          
          directDoc.forEach(doc => {
            const data = doc.data();
            const docIdMatch = doc.id.toUpperCase() === queryTerm || doc.id.toUpperCase().includes(queryTerm);
            const studentIdMatch = (data.studentId && (data.studentId.toUpperCase() === queryTermNormalized || data.studentId.toUpperCase() === queryTermSanitized));
            
            if (docIdMatch || studentIdMatch) {
              setAdmissionStatus({ id: doc.id, ...data });
              found = true;
            }
          });

          if (!found) {
            setError('Admission application not found. If you were recently registered, try your new Student ID.');
          }
        } catch (err) {
          setError('Permission error or search failure. Please contact administrator.');
          console.error(err);
        }
      }
      
      setSearched(true);
    } catch (err) {
      setError('An error occurred. Please try again later.');
      handleFirestoreError(err, OperationType.LIST, searchType === 'academic' ? 'results' : 'admissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-primary mb-4">Portal Checker</h1>
          <p className="text-lg text-slate-600">Access your academic and admission records securely.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-2xl border border-border flex shadow-sm">
            <button 
              onClick={() => { setSearchType('academic'); setSearched(false); setError(null); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${searchType === 'academic' ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}
            >
              Academic Results
            </button>
            <button 
              onClick={() => { setSearchType('admission'); setSearched(false); setError(null); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${searchType === 'admission' ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}
            >
              Admission Status
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-border mb-8 portal-search-area"
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Registration ID</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    required
                    type="text"
                    placeholder={searchType === 'academic' ? "TTS/2024/001" : "Application ID"}
                    className="input-field pl-12 uppercase"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
              </div>

              {searchType === 'academic' && (
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Academic Session</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select
                      className="input-field pl-12 appearance-none"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    >
                      {ACADEMIC_YEARS.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                disabled={loading}
                type="submit"
                className="btn-primary px-12 py-4 text-lg shadow-lg shadow-primary/20 w-full sm:w-auto"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                Check Results
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Display */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-4 no-print"
            >
              <AlertCircle size={28} />
              <div>
                <h4 className="font-bold">Not Found</h4>
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {searched && searchType === 'admission' && admissionStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              id="admission-letter"
              className="bg-white rounded-[2.5rem] shadow-xl border border-border overflow-hidden result-card-print"
            >
              {/* Formal Printing Header (Hidden on screen) */}
              <div className="hidden print:block p-8 border-b-2 border-primary text-center">
                <h2 className="text-3xl font-black text-primary uppercase">Triumph Trinity Secondary School</h2>
                <p className="text-sm text-slate-500 font-bold">ORE ALABA, ORE, ONDO STATE, NIGERIA</p>
                <div className="mt-4 inline-block bg-primary text-white px-6 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
                  Admission Notification
                </div>
              </div>

              <div className={`p-8 text-white no-print ${
                admissionStatus.status === 'accepted' ? 'bg-green-600' : 
                admissionStatus.status === 'rejected' ? 'bg-red-600' : 'bg-blue-600'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <BookCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{admissionStatus.fullName}</h3>
                    <p className="text-white/80 font-medium">#{admissionStatus.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="hidden print:block mb-8">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-bold text-slate-400">APPLICANT NAME:</span> <span className="font-black text-slate-800 uppercase ml-2">{admissionStatus.fullName}</span></div>
                    <div><span className="font-bold text-slate-400">APPLICATION ID:</span> <span className="font-black text-slate-800 uppercase ml-2">#{admissionStatus.id.toUpperCase()}</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-border">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
                    <p className={`text-lg font-black uppercase ${
                      admissionStatus.status === 'accepted' ? 'text-green-600' : 
                      admissionStatus.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {admissionStatus.status || 'PENDING'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-border">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Class</p>
                    <p className="text-lg font-black text-slate-800 uppercase">{admissionStatus.classSeeking}</p>
                  </div>
                </div>

                {admissionStatus.status === 'accepted' && (
                  <div className="p-6 bg-green-50 border border-green-100 rounded-3xl">
                    <h4 className="font-bold text-green-800 mb-2">Congratulations!</h4>
                    <p className="text-green-700 text-sm leading-relaxed">
                      You have been offered provisional admission. Your official Student ID is 
                      <span className="font-bold text-green-900 mx-1">#{admissionStatus.studentId}</span>. 
                      You can now proceed to pay your school fees using this ID.
                    </p>
                  </div>
                )}

                {/* Print Signature Line */}
                <div className="hidden print:mt-16 print:flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-48 h-px bg-slate-400 mb-2"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Parent/Guardian Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="w-48 h-px bg-primary mb-2"></div>
                    <p className="text-xs font-bold text-primary uppercase italic">Principal's Signature & Stamp</p>
                  </div>
                </div>

                <div className="flex justify-end no-print" data-html2canvas-ignore>
                  <button 
                    disabled={!!downloadingId}
                    onClick={() => handleDownloadPDF('admission-letter', `Admission_${admissionStatus.fullName.replace(/\s+/g, '_')}`)}
                    className="btn-secondary py-3 px-6 text-sm disabled:opacity-50"
                  >
                    {downloadingId === 'admission-letter' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} 
                    {downloadingId === 'admission-letter' ? 'Generating...' : 'Download Admission Letter'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {searched && searchType === 'academic' && results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {results.map((result) => (
                <div 
                  key={result.id} 
                  id={`result-sheet-${result.id}`}
                  className="bg-white rounded-[2.5rem] shadow-xl border border-border overflow-hidden result-card-print print-break-inside-avoid"
                >
                  {/* Formal Printing Header (Hidden on screen) */}
                  <div className="hidden print:block p-8 border-b-2 border-primary text-center">
                    <h2 className="text-3xl font-black text-primary uppercase">Triumph Trinity Secondary School</h2>
                    <p className="text-sm text-slate-500 font-bold">ORE ALABA, ORE, ONDO STATE, NIGERIA</p>
                    <div className="mt-4 inline-block bg-primary text-white px-6 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
                      Student Academic Report Sheet
                    </div>
                  </div>

                  {/* Result Header - Screen View */}
                  <div className="bg-primary p-8 text-white no-print">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                          <User size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{result.studentName}</h3>
                          <p className="text-blue-100 font-medium">#{result.studentId}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">
                          <div className="text-[10px] uppercase font-bold text-blue-200">Session</div>
                          <div className="text-sm font-bold">{result.academicYear}</div>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">
                          <div className="text-[10px] uppercase font-bold text-blue-200">Term</div>
                          <div className="text-sm font-bold">{result.term}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Result Body */}
                  <div className="p-8">
                    {/* Print Only Info Grid */}
                    <div className="hidden print:grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
                      <div className="space-y-2">
                        <div><span className="text-[10px] font-bold text-slate-400 uppercase">Student Name:</span> <span className="block font-black text-slate-800 uppercase">{result.studentName}</span></div>
                        <div><span className="text-[10px] font-bold text-slate-400 uppercase">Student ID:</span> <span className="block font-black text-slate-800 uppercase">{result.studentId}</span></div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div><span className="text-[10px] font-bold text-slate-400 uppercase">Academic Year:</span> <span className="block font-black text-slate-800 uppercase">{result.academicYear}</span></div>
                        <div><span className="text-[10px] font-bold text-slate-400 uppercase">Term:</span> <span className="block font-black text-slate-800 uppercase">{result.term}</span></div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-200">
                            <th className="py-4 font-bold text-slate-500 uppercase text-xs tracking-widest pl-2">Subject</th>
                            <th className="py-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-center">Score</th>
                            <th className="py-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-center">Grade</th>
                            <th className="py-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-right pr-2">Remark</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {result.subjects.map((sub: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="py-5 font-bold text-slate-800 pl-2">{sub.name}</td>
                              <td className="py-5 text-center font-mono text-lg">{sub.score}</td>
                              <td className="py-5 text-center">
                                <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                                  ['A', 'B'].includes(sub.grade) ? 'bg-green-100 text-green-700' :
                                  sub.grade === 'C' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {sub.grade}
                                </span>
                              </td>
                              <td className="py-5 text-right font-medium text-slate-500 pr-2">
                                {sub.score >= 70 ? 'Excellent' : sub.score >= 60 ? 'Very Good' : sub.score >= 50 ? 'Good' : 'Needs Improvement'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Print Summary/Grading System */}
                    <div className="hidden print:grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-200">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grading Scale</h4>
                        <div className="grid grid-cols-2 text-[10px] font-bold text-slate-600 gap-2">
                          <div>70 - 100: A (Excellent)</div>
                          <div>60 - 69: B (Very Good)</div>
                          <div>50 - 59: C (Good)</div>
                          <div>40 - 49: D (Pass)</div>
                          <div>0 - 39: F (Fail)</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Principal's Remark</h4>
                        <div className="h-12 border-b border-slate-200 italic text-slate-400 text-xs">
                          {result.subjects.reduce((acc: number, s: any) => acc + s.score, 0) / result.subjects.length > 60 
                            ? "A very impressive performance. Keep up the high standard." 
                            : "Fair performance. More effort is needed in weak areas."}
                        </div>
                      </div>
                    </div>

                    {/* Print Signatures */}
                    <div className="hidden print:mt-16 print:flex justify-between items-end">
                      <div className="text-center">
                        <div className="w-48 h-px bg-slate-400 mb-2"></div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Form Teacher's Signature</p>
                      </div>
                      <div className="text-center">
                        <div className="w-48 h-px bg-primary mb-2"></div>
                        <p className="text-[10px] font-bold text-primary uppercase italic">Principal's Signature & Official Stamp</p>
                        <p className="text-[8px] text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-border no-print" data-html2canvas-ignore>
                      <div className="text-slate-500 text-sm flex items-center gap-2">
                        <Calendar size={16} /> Generated on {new Date(result.createdAt).toLocaleDateString()}
                      </div>
                      <button 
                        disabled={!!downloadingId}
                        onClick={() => handleDownloadPDF(`result-sheet-${result.id}`, `Report_${result.studentName.replace(/\s+/g, '_')}_${result.term}`)}
                        className="btn-primary py-3 px-8 shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        {downloadingId === `result-sheet-${result.id}` ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        {downloadingId === `result-sheet-${result.id}` ? 'Generating...' : 'Download Report Sheet'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!searched && !loading && (
          <div className="mt-12 text-center text-slate-400">
            <FileText size={64} className="mx-auto mb-4 opacity-20" />
            <p>Enter your Registration Number above to fetch your performance result.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCheckerPage;
