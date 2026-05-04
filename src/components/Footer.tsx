import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <GraduationCap size={24} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">TURY TOP SCHOOLS</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering students through quality education and discipline. We nurture the next generation of leaders.
            </p>
            <div className="pt-4 border-t border-slate-800">
               <p className="italic text-blue-400 text-xs font-bold uppercase tracking-widest">
                "Knowledge is the key to global transformation"
              </p>
            </div>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-pink-600 hover:text-white transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/admission" className="hover:text-blue-400 transition-colors">Admission</Link></li>
              <li><Link to="/results" className="hover:text-blue-400 transition-colors">Check Result</Link></li>
              <li><Link to="/pay-fees" className="hover:text-blue-400 transition-colors">School Fees</Link></li>
              <li><Link to="/admin" className="hover:text-blue-400 transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-blue-500 mt-1" />
                <span className="text-sm">akinnuoyesolomon7@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-blue-500 mt-1" />
                <span className="text-sm">09115275892</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 mt-1" />
                <a 
                  href="https://www.google.com/maps/search/Ore+Alaba,+Ore,+Ondo+State" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sm hover:text-blue-400 transition-colors"
                >
                  Ore Alaba, Ore, Ondo State, Nigeria
                </a>
              </li>
            </ul>
          </div>

          {/* Office Hours */}
          <div>
            <h3 className="text-white font-bold mb-6">Office Hours</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex justify-between">
                <span>Mon - Fri:</span>
                <span className="text-white">8:00 AM - 4:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-white">Closed</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-white">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>© {currentYear} TURY TOP SCHOOLS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
