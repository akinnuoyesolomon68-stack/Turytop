import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Users, 
  BookOpen, 
  Award, 
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;
    
    if (!name || !message) {
      alert("Please provide at least your name and a message.");
      return;
    }

    const phoneNumber = '09115275892';
    const waMessage = `*New Website Inquiry*\n\n*Name:* ${name}\n*Email:* ${email || 'Not provided'}\n*Subject:* ${subject || 'General Inquiry'}\n\n*Message:*\n${message}`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(waMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="overflow-hidden">
      {/* Announcement Banner */}
      <div className="bg-primary text-white py-2 text-center text-xs font-bold uppercase tracking-[0.2em] relative z-[60]">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Resumption Date for Next Term: Monday, 12th May 2026
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-10 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-slate-900">
          <img 
            src="https://i.ibb.co/p6hWY8V5/national-cancer-institute-N-aihp118p8-unsplash.jpg" 
            alt="School Exterior" 
            className="w-full h-full object-cover opacity-40 select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
              <Star size={16} fill="currentColor" /> Excellence in Education
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-black text-primary leading-tight mb-6">
              TURY TOP <br />
              <span className="text-blue-500">SCHOOLS</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
              Empowering students through quality education and discipline. Join us in shaping a brighter future for your child.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/admission" className="btn-primary py-4 px-8 text-lg">
                Admission Portal <ArrowRight size={20} />
              </Link>
              <Link to="/pay-fees" className="btn-secondary py-4 px-8 text-lg">
                Pay School Fees
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-6 scale-105 blur-xl" />
            <img 
              src="https://images.unsplash.com/photo-1546410531-bc438a441d1d?q=80&w=2070&auto=format&fit=crop" 
              alt="Students in classroom" 
              className="rounded-3xl shadow-2xl relative z-10 border-4 border-white"
            />
            {/* Floating Stats */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl z-20 border border-border animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-400 p-3 rounded-xl">
                  <Award className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-primary">100%</div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Success Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4">About Our School</h2>
            <div className="w-20 h-1.5 bg-blue-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: BookOpen, 
                title: "Academic Excellence", 
                desc: "We prioritize a rigorous and relevant curriculum that prepares students for global challenges." 
              },
              { 
                icon: ShieldCheck, 
                title: "Strict Discipline", 
                desc: "Moral values and character development are at the core of our educational philosophy." 
              },
              { 
                icon: Users, 
                title: "Student Growth", 
                desc: "We provide a nurturing environment where every child's unique talents are discovered and honed." 
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="card-base p-8 text-center"
              >
                <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-3xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-blue-500" /> Our Mission
                </h2>
                <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                  <p className="text-slate-600 text-lg leading-relaxed italic">
                    "To provide high-quality education balanced with strong moral values, fostering holistic growth and producing responsible global citizens."
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                  <Star className="text-yellow-500" fill="currentColor" /> Our Vision
                </h2>
                <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                  <p className="text-slate-600 text-lg leading-relaxed">
                    "To become a leading educational institution renowned for excellence, innovation, and the production of visionary leaders who positively impact the world."
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1523050335392-9bf5675f42e8?q=80&w=2070&auto=format&fit=crop" 
                alt="School building/Environment" 
                className="rounded-[2.5rem] shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-500"
              />
              <div className="absolute -top-6 -right-6 bg-blue-600 text-white p-8 rounded-3xl shadow-xl">
                <div className="text-4xl font-black italic">Leading</div>
                <div className="text-sm font-bold uppercase tracking-widest opacity-80">the way in Ondo State</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Online Services / Quick Actions */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-12 rounded-[3.5rem] grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-4xl font-display font-bold text-white mb-6">Experience our Seamless <span className="text-blue-400">Digital Portal</span></h2>
              <p className="text-blue-100 text-lg opacity-80 leading-relaxed mb-10 max-w-2xl">
                Access your terminal results, process school fees, and apply for admission all from the comfort of your home. Our technology-driven approach ensures education is always accessible.
              </p>
              <div className="flex flex-wrap gap-6">
                {[
                  { label: "Check Results", link: "/results", color: "bg-blue-500" },
                  { label: "Pay Fees", link: "/pay-fees", color: "bg-green-500" },
                  { label: "Admission", link: "/admission", color: "bg-yellow-500" }
                ].map((action, i) => (
                  <Link key={i} to={action.link} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${action.color}`} />
                    <span className="text-white font-bold hover:text-blue-200 transition-colors">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link to="/admission" className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center hover:scale-110 transition-transform group">
                <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary mb-8">Get In Touch</h2>
              <p className="text-lg text-slate-600 mb-12">
                Have questions or need more information? We are here to help. Reach out to us through any of these channels.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Email Us</div>
                    <div className="text-xl font-bold text-slate-800">akinnuoyesolomon7@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Call Us</div>
                    <div className="text-xl font-bold text-slate-800">09115275892</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Location</div>
                    <a 
                      href="https://www.google.com/maps/search/Ore+Alaba,+Ore,+Ondo+State" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors block"
                    >
                      Ore Alaba, Ore, Ondo State, Nigeria
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Office Hours</div>
                    <div className="text-xl font-bold text-slate-800">Mon - Fri: 8 AM - 4 PM</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-border">
              <h3 className="text-2xl font-bold text-slate-800 mb-8">Send a Message</h3>
              <form className="space-y-6" onSubmit={handleSendMessage}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field" 
                    required
                  />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field" 
                  />
                </div>
                <input 
                  type="text" 
                  name="subject"
                  placeholder="Subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field" 
                />
                <textarea 
                  name="message"
                  rows={5} 
                  placeholder="Your Message" 
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field resize-none"
                  required
                ></textarea>
                <button type="submit" className="w-full btn-primary py-4">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
