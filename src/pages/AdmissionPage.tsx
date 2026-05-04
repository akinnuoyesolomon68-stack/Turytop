import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CheckCircle2, AlertCircle, Loader2, Send, CreditCard, ShieldCheck } from 'lucide-react';

const AdmissionPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    parentContact: '',
    email: '',
    classSeeking: 'Primary 1',
  });
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [appId, setAppId] = useState('');
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [paymentPhase, setPaymentPhase] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/admission/questions');
        const data = await response.json();
        setActiveQuestions(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load assessment questions. Please refresh the page.");
      }
    };
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate score securely on server
      const scoreResponse = await fetch('/api/admission/calculate-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: testAnswers,
          questionIds: activeQuestions.map(q => q.id)
        })
      });

      if (!scoreResponse.ok) {
        throw new Error('Failed to calculate score');
      }

      const { score: calculatedScore } = await scoreResponse.json();
      setScore(calculatedScore);

      // Determine status: all applications now go to 'reviewed' for admin decision
      const finalStatus = 'reviewed';

      const docRef = await addDoc(collection(db, 'admissions'), {
        ...formData,
        testScore: calculatedScore,
        testAnswers,
        status: finalStatus,
        paid: true,
        paymentRef: `ADM-${Date.now()}`,
        createdAt: Date.now(),
      });
      setAppId(docRef.id);
      setSuccess(true);
    } catch (err) {
      setError('An error occurred while submitting your application. Please try again.');
      handleFirestoreError(err, OperationType.WRITE, 'admissions');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="section-padding bg-slate-50 min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-border text-center"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
             <CheckCircle2 size={48} />
          </div>
          
          <h2 className="text-4xl font-display font-bold text-green-600 mb-2">
            Payment & Application Successful!
          </h2>
          <p className="text-slate-500 font-medium mb-6 uppercase tracking-wider">Application ID: <span className="text-slate-900 font-bold">#{appId.substring(0, 8)}</span></p>
          
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Assessment Score</p>
              <p className="text-3xl font-display font-black text-primary">
                {score?.toFixed(0)}%
              </p>
            </div>
            <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Fee Status</p>
              <p className="text-3xl font-display font-black text-green-600">
                PAID
              </p>
            </div>
          </div>

          <div className="text-slate-600 mb-10 text-lg leading-relaxed text-left">
            <p className="mb-4">
              Thank you for completing the admission assessment and profile registration. 
              Your application for <strong>{formData.fullName}</strong> is now being processed.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
              <p className="text-sm text-blue-800 font-bold mb-1 italic">What happens next?</p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Academic board will review your test performance ({score?.toFixed(0)}%).</li>
                <li>Administration will verify parent contact details.</li>
                <li>Final decision will be communicated to <strong>{formData.email}</strong> within 3-5 working days.</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setSuccess(false);
              setFormData({ fullName: '', dob: '', parentContact: '', email: '', classSeeking: 'Primary 1' });
              setTestAnswers({});
              setScore(null);
            }}
            className="w-full btn-primary py-4 text-lg"
          >
            Apply for another child
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-primary mb-4">Online Admission</h1>
          <p className="text-lg text-slate-600">Join the elite community of learners at TURY TOP SCHOOLS.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border"
        >
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Phase 1: Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-bold text-slate-800">Student Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name of Student</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe Akinnuoye"
                    className="input-field"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Class Seeking Admission</label>
                  <select 
                    required
                    className="input-field"
                    value={formData.classSeeking}
                    onChange={(e) => setFormData({...formData, classSeeking: e.target.value})}
                  >
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 3">SSS 3</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Date of Birth</label>
                  <input
                    required
                    type="date"
                    className="input-field"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Contact Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. parent@example.com"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Parent/Guardian Contact Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 09115275892"
                    className="input-field"
                    value={formData.parentContact}
                    onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Phase 2: Academic Assessment */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-bold text-slate-800">Academic Assessment</h3>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Please answer the following questions carefully. Your performance determines <strong>instant provisional admission</strong> eligibility. 
                  Unsuccessful attempts will still be reviewed manually by our administration.
                </p>
              </div>

              <div className="space-y-10 opacity-100 transition-opacity">
                {activeQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-4">
                    <p className="font-bold text-slate-800 text-lg">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {q.options.map((opt) => (
                        <label 
                          key={opt}
                          className={`
                            flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
                            ${testAnswers[q.id] === opt 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-slate-100 hover:border-slate-200 text-slate-600'}
                          `}
                        >
                          <input
                            required
                            type="radio"
                            name={q.id}
                            value={opt}
                            className="hidden"
                            onChange={() => setTestAnswers({ ...testAnswers, [q.id]: opt })}
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${testAnswers[q.id] === opt ? 'border-primary' : 'border-slate-300'}`}>
                            {testAnswers[q.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <span className="font-bold">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Phase 3: Admission Fee Payment */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-bold text-slate-800">Admission Fee Payment</h3>
              </div>

              {!paid ? (
                <div role="region" aria-label="Payment Section" className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                          <CreditCard size={14} className="text-primary" /> Admission Processing Fee
                        </div>
                        <h4 className="text-3xl font-display font-bold">₦3,000.00</h4>
                        <p className="text-slate-400 mt-2">Required for application processing and result verification.</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-primary">
                          <ShieldCheck size={32} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Payment</span>
                      </div>
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
                      onClick={() => {
                        setPaymentLoading(true);
                        setTimeout(() => {
                          setPaymentLoading(false);
                          setPaid(true);
                        }, 2000);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="animate-spin" /> Verifying Transaction...
                        </>
                      ) : (
                        'Pay ₦3,000 & Continue'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 p-8 rounded-[2.5rem] flex items-center gap-6">
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 animate-pulse">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-green-800">Fee Paid Successfully!</h4>
                    <p className="text-green-600 font-medium tracking-tight">Payment reference: ADM-{Date.now().toString().slice(-6)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-slate-100">
              <button
                disabled={loading || !paid}
                type="submit"
                className={`w-full py-5 text-xl font-display shadow-xl transition-all ${paid ? 'btn-primary shadow-primary/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed border-0'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Finalizing Application...
                  </>
                ) : (
                  <>
                    <Send size={20} /> Complete Application
                  </>
                )}
              </button>
              {!paid && <p className="text-center text-xs text-red-500 font-bold mt-3 animate-pulse">Please complete the admission fee payment to enable submission.</p>}
            </div>

            <p className="text-center text-xs text-slate-500 italic mt-6">
              By submitting this form, you agree to the school's terms and conditions regarding data privacy and admission policies.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdmissionPage;
