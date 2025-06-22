/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Paleta "Elegancia Festiva" para CECONBOL
      colors: {
        // Colores primarios de la marca
        'brand': {
          'primary': '#0F766E',    // Teal-700 - Azul Océano (principal)
          'secondary': '#EA580C',  // Orange-600 - Naranja Dorado (acciones)
          'tertiary': '#059669',   // Emerald-600 - Verde Salvia (éxito)
          'accent': '#F59E0B',     // Amber-500 - Dorado Sutil (destacados)
          'purple': '#8B5CF6',     // Violet-500 - Púrpura (especiales)
        },
        
        // Variaciones para diferentes usos
        'primary': {
          50: '#F0FDFA',   // Muy claro
          100: '#CCFBF1',  // Claro
          500: '#14B8A6',  // Medio
          600: '#0D9488',  // Medio-oscuro
          700: '#0F766E',  // Principal (brand-primary)
          800: '#115E59',  // Oscuro
          900: '#134E4A',  // Muy oscuro
        },
        
        'secondary': {
          50: '#FFF7ED',   // Muy claro
          100: '#FFEDD5',  // Claro
          500: '#F97316',  // Medio
          600: '#EA580C',  // Principal (brand-secondary)
          700: '#C2410C',  // Medio-oscuro
          800: '#9A3412',  // Oscuro
          900: '#7C2D12',  // Muy oscuro
        },
        
        'success': {
          50: '#ECFDF5',   // Muy claro
          500: '#10B981',  // Medio
          600: '#059669',  // Principal (brand-tertiary)
          700: '#047857',  // Oscuro
        },
        
        'accent': {
          50: '#FFFBEB',   // Muy claro
          400: '#FBBF24',  // Medio
          500: '#F59E0B',  // Principal (brand-accent)
          600: '#D97706',  // Oscuro
        }
      },
      
      // Tipografías
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Espaciados extras si los necesitas
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
      },
      
      // Sombras personalizadas
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.08)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elegant': '0 10px 15px -3px rgba(15, 118, 110, 0.1), 0 4px 6px -2px rgba(15, 118, 110, 0.05)',
      },
      
      // Animaciones suaves
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}