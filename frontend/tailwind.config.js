/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Brand colours ──────────────────────────────────
      colors: {
        coral: {
          50:  '#FFF0F0',
          100: '#FFE8E8',
          200: '#FFC5C5',
          300: '#FF9999',
          400: '#FF7777',
          500: '#FF6B6B',   // primary brand coral
          600: '#E85555',
          700: '#C43A3A',
          800: '#9E2A2A',
          900: '#7A1F1F',
        },
        violet: {
          50:  '#F5F2FF',
          100: '#EDE8F5',
          200: '#D8CCEE',
          300: '#BEAAE3',
          400: '#9B7FD4',
          500: '#7C5CBF',   // primary brand violet
          600: '#6648A8',
          700: '#52388E',
          800: '#3E2A70',
          900: '#2C1E52',
        },
        mint: {
          50:  '#E8FFFE',
          100: '#E0FAF8',
          200: '#B8F3EF',
          300: '#80E8E1',
          400: '#4ECDC4',   // accent mint
          500: '#36B8B0',
          600: '#23A09A',
          700: '#1A847E',
          800: '#136660',
          900: '#0D4D48',
        },
        yellow: {
          50:  '#FFFEF0',
          100: '#FFFBE0',
          200: '#FFF5B2',
          300: '#FFEE7A',
          400: '#FFE66D',   // accent yellow
          500: '#F5D834',
          600: '#D4B800',
          700: '#A89000',
          800: '#7C6A00',
          900: '#544800',
        },
        // Neutral with a warm tint
        warm: {
          50:  '#FFF9F5',   // app background
          100: '#FFF0E8',
          200: '#FFE0CC',
          300: '#FFC9A8',
          400: '#FFB085',
          500: '#FF9560',
        },
      },

      // ── Typography ─────────────────────────────────────
      fontFamily: {
        heading: ['Nunito', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },

      // ── Border Radius ──────────────────────────────────
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },

      // ── Box Shadows (branded) ──────────────────────────
      boxShadow: {
        'card':    '0 4px 16px rgba(124,92,191,0.10)',
        'card-lg': '0 8px 32px rgba(124,92,191,0.15)',
        'coral':   '0 8px 24px rgba(255,107,107,0.30)',
        'violet':  '0 8px 24px rgba(124,92,191,0.30)',
        'mint':    '0 8px 24px rgba(78,205,196,0.30)',
        'inner-soft': 'inset 0 2px 8px rgba(124,92,191,0.08)',
      },

      // ── Background sizes (for animations) ─────────────
      backgroundSize: {
        '200%': '200% 200%',
      },

      // ── Animations ─────────────────────────────────────
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':       { transform: 'rotate(3deg)' },
        },
        popIn: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '70%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
      },
      animation: {
        float:      'float 4s ease-in-out infinite',
        'fade-up':  'fadeInUp 0.5s ease both',
        shimmer:    'shimmer 1.5s infinite',
        wiggle:     'wiggle 0.5s ease-in-out',
        'pop-in':   'popIn 0.35s ease both',
      },

      // ── Spacing extras ─────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
