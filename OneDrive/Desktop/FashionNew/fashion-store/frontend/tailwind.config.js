/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f5',
          100: '#ffe4ef',
          200: '#ffc7dd',
          300: '#ffa3c1',
          400: '#ff7aa3',
          500: '#ff4d86',
          600: '#e6396a',
          700: '#bf2456',
          800: '#8f1840',
          900: '#64122c'
        },
        accent: {
          50: '#fff8ed',
          100: '#fff2dd',
          200: '#ffe2b8',
          300: '#ffd28a',
          400: '#ffc059',
          500: '#ffad2e',
          600: '#e69927',
          700: '#b77720',
          800: '#89541a',
          900: '#623d14'
        },
        neutral: {
          50: '#fafafa',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#0f1724'
        }
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui'],
        display: ['Playfair Display', 'serif']
      },
      container: {
        center: true,
        padding: '1rem'
      }
    }
  },
  plugins: []
};


