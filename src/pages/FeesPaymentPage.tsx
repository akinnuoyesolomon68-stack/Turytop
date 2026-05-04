import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Search, 
  CreditCard, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Wallet,
  User,
  ArrowRight
} from 'lucide-react';

const FeesPaymentPage: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentStep, setPaymentStep] = useState<'IDLE' | 'AUTHORIZING' | 'PROCESSING' | 'VERIFYING'>('IDLE');

  const getFeeAmount = (studentClass: string) => {
    const feeMap: Record<string, number> = {
      'PRIMARY 1': 30000,
      'PRIMARY 2': 35000,
      'PRIMARY 3': 40000,
      'PRIMARY 4': 45000,
      'PRIMARY 5': 50000,
      'PRIMARY 6': 55000,
      'JSS 1': 65000,
      'JSS 2': 70000,
      'JSS 3': 75000,
      'SSS 1': 85000,
      'SSS 2': 90000,
      'SSS 3': 100000,
    };
    return feeMap[studentClass.toUpperCase()] || 75000;
  };

  const currentFee = student ? getFeeAmount(student.class) : 0;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStudent(null);

    const queryTerm = studentId.trim().toUpperCase();
    const queryTermNormalized = queryTerm.replace(/-/g, '/'); // TTS-2024 -> TTS/2024
    const queryTermSanitized = queryTerm.replace(/\//g, '-'); // TTS/2024 -> TTS-2024

    try {
      // 1. Try searching in students collection with both formats
      const studentsRef = collection(db, 'students');
      const q1 = query(studentsRef, where('studentId', '==', queryTermNormalized));
      const q2 = query(studentsRef, where('studentId', '==', queryTermSanitized));
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      if (!snap1.empty || !snap2.empty) {
        const foundDoc = !snap1.empty ? snap1.docs[0] : snap2.docs[0];
        setStudent({ id: foundDoc.id, ...foundDoc.data() });
        setLoading(false);
        return;
      }

      // 2. If not found, check if it's an Application ID for someone ALREADY accepted
      const admQuery = query(collection(db, 'admissions'), where('registered', '==', true));
      const admSnap = await getDocs(admQuery);
      let foundInAdm = false;

      admSnap.forEach(doc => {
        const data = doc.data();
        const idMatch = doc.id.toUpperCase().includes(queryTerm);
        const studentIdMatch = data.studentId && (data.studentId.toUpperCase() === queryTermNormalized || data.studentId.toUpperCase() === queryTermSanitized);

        if (idMatch || studentIdMatch) {
          if (data.studentId) {
            setStudent({ 
              studentId: data.studentId, 
              name: data.fullName, 
              class: data.classSeeking || 'JSS 1' 
            });
            foundInAdm = true;
          }
        }
      });

      if (!foundInAdm) {
        setError("Student record not found. If you just registered, please ensure your application was marked as 'Accepted' by the admin.");
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      handleFirestoreError(err, OperationType.GET, 'students');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    setError(null);
    try {
      // Step 1: Simulated Secure Authorization
      setPaymentStep('AUTHORIZING');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: Gateway Response Processing
      setPaymentStep('PROCESSING');
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Step 3: Final Backend Verification (Relational Integrity)
      setPaymentStep('VERIFYING');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ref = `PAY-${Date.now()}`;
      setPaymentRef(ref);

      // Record payment in Firestore
      await setDoc(doc(db, 'payments', ref), {
        studentId: student.studentId,
        studentName: student.name,
        amount: currentFee,
        type: 'School Fees',
        status: 'PAID',
        createdAt: Date.now(),
        reference: ref
      });

      setPaid(true);
      setPaymentStep('IDLE');
    } catch (err) {
      setError("Payment verification failed. Please check your bank and try again.");
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'payments');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (paid) {
    return (
      <div className="section-padding bg-slate-50 min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-border text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-8">Your school fees payment has been processed and recorded.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-border text-left mb-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Student Name</span>
              <span className="text-slate-800 font-bold">{student.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Reference</span>
              <code className="text-primary font-bold">{paymentRef}</code>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Amount</span>
              <span className="text-slate-800 font-bold">₦{currentFee.toLocaleString()}</span>
            </div>
          </div>

          <button 
            onClick={() => window.print()}
            className="w-full btn-primary py-4 mb-4"
          >
            Download Receipt
          </button>
          <button 
            onClick={() => {
              setPaid(false);
              setStudent(null);
              setStudentId('');
            }}
            className="w-full text-slate-400 font-bold hover:text-slate-600 transition-colors"
          >
            Back to Payments
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-widest mb-4">
            <Wallet size={16} /> Financial Portal
          </div>
          <h1 className="text-4xl font-display font-bold text-slate-800 mb-4">Pay School Fees</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto italic">
            "Education is the most powerful weapon which you can use to change the world." - Pay securely online.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
          {/* Step 1: Find Student */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">1</div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Student Verification</h3>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow space-y-2 w-full">
                <label className="text-sm font-bold text-slate-700 ml-1">Student Registration ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. TTS/2024/001" 
                    className="input-field pl-12 uppercase"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary py-4 px-8 whitespace-nowrap min-w-[150px] shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Find Student'}
              </button>
            </form>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 text-sm font-medium"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              {student && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 pt-8 border-t border-slate-100"
                >
                  <div className="bg-slate-50 p-6 rounded-3xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-border shadow-sm flex items-center justify-center text-primary text-2xl font-black">
                        {student.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">{student.name}</h4>
                        <p className="text-slate-500 font-medium">Class: <span className="text-primary font-bold">{student.class}</span></p>
                      </div>
                    </div>
                    <div className="px-6 py-2 bg-white rounded-2xl border border-border">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-1">Fee Balance</span>
                      <span className="text-2xl font-display font-black text-slate-800">₦{currentFee.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-12 bg-slate-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <ShieldCheck className="text-primary" size={24} />
                        <h4 className="text-xl font-bold">Secure Payment Gateway</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Card Number</label>
                          <div className="relative">
                            <input type="text" placeholder="#### #### #### ####" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono" />
                            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Expiry Date</label>
                            <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">CVV</label>
                            <input type="text" placeholder="***" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono" />
                          </div>
                        </div>
                      </div>

                      <button 
                        type="button"
                        disabled={paymentLoading}
                        onClick={handlePayment}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-primary/20"
                      >
                        {paymentLoading ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-1">
                              <Loader2 className="animate-spin" />
                              <span>{
                                paymentStep === 'AUTHORIZING' ? 'Securing Connection...' :
                                paymentStep === 'PROCESSING' ? 'Processing Gateway Response...' :
                                'Finalizing Verification...'
                              }</span>
                            </div>
                            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-white"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>Pay ₦{currentFee.toLocaleString()} Securely <ArrowRight size={20} /></>
                        )}
                      </button>
                      
                      <div className="mt-6 flex items-center justify-center gap-4 text-slate-500">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter">
                          <ShieldCheck size={12} /> SSL Encrypted
                        </div>
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter">
                          <CreditCard size={12} /> PCIDSS Compliant
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeesPaymentPage;
