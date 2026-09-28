import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer — clean, warm, student-friendly.
 * Includes a fun tagline and social placeholders.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  const links = {
    'Explore': [
      { label: 'Features',  to: '/#features' },
      { label: 'About Us',  to: '/#about'    },
      { label: 'Contact',   to: '/#contact'  },
    ],
    'Account': [
      { label: 'Sign Up',   to: '/register'  },
      { label: 'Log In',    to: '/login'     },
      { label: 'Dashboard', to: '/dashboard' },
    ],
    'Legal': [
      { label: 'Terms',     to: '/terms'     },
      { label: 'Privacy',   to: '/privacy'   },
      { label: 'Cookies',   to: '/cookies'   },
    ],
  };

  return (
    <footer className="bg-violet-900 text-white mt-0">
      {/* Wave separator */}
      <div className="overflow-hidden leading-none -mb-px">
        <svg viewBox="0 0 1440 48" className="block w-full" preserveAspectRatio="none">
          <path
            d="M0,24 C360,48 1080,0 1440,24 L1440,0 L0,0 Z"
            fill="#FFF9F5"
          />
        </svg>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-1 mb-3">
              <span className="text-2xl">🏠</span>
              <span className="text-2xl font-black" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <span className="text-coral-400">Roomie</span>
                <span className="text-white">Link</span>
              </span>
            </div>
            <p className="text-violet-300 text-sm leading-relaxed">
              The #1 roommate-finder built for students. Find your vibe, find your people. 🎓
            </p>

            {/* Social placeholders */}
            <div className="flex gap-3 mt-5">
              {['𝕏', 'in', 'ig'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-violet-800 flex items-center justify-center text-xs font-bold text-violet-300 hover:bg-coral-500 hover:text-white transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4
                className="text-xs font-black uppercase tracking-widest text-coral-400 mb-4"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-violet-300 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-violet-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-violet-400 text-xs">
            © {year} RoomieLink — Made with ❤️ for students everywhere
          </p>
          <p className="text-violet-500 text-xs">
            No more bad roommate horror stories 
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
