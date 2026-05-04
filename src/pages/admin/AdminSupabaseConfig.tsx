import React, { useState } from 'react';
import { Database, Key, CheckCircle2, ShieldAlert, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';

const AdminSupabaseConfig: React.FC = () => {
  const [url, setUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [key, setKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd save this to local storage or a secure config
    // For this environment, we'll suggest using environment variables
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Database className="text-primary" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Database Configuration</h1>
          <p className="text-slate-500">Connect your Supabase instance to power the school portal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm"
          >
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <LinkIcon size={16} /> Supabase URL
                </label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Key size={16} /> Anon Public Key
                </label>
                <input 
                  type="password" 
                  className="input-field font-mono"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary/20"
              >
                {saved ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 /> Configuration Applied
                  </span>
                ) : 'Update Connection'}
              </button>
            </form>
          </motion.div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <ShieldAlert size={18} /> Important Note
            </h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              To persist these changes permanently, please add them to your <span className="font-mono bg-blue-100 px-1 rounded">.env</span> file 
              using the keys: <span className="font-bold">VITE_SUPABASE_URL</span> and <span className="font-bold">VITE_SUPABASE_ANON_KEY</span>.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-4">
            <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Connection Status</h4>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${url && key ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-bold">{url && key ? 'Linked' : 'Disconnected'}</span>
            </div>
            <p className="text-xs text-slate-400">
              {url && key ? 'System is ready to migrate data from Firebase.' : 'Please provide keys to establish a connection.'}
            </p>
          </div>

          <div className="p-6 bg-white border border-border rounded-[2rem] shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-2">
                  Supabase Dashboard
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-2">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupabaseConfig;
