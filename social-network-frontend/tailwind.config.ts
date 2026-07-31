import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#FF6584',
        background: '#0F0F1A',
        card: '#1A1A2E',
        'text-primary': '#EAEAEA',
        'text-secondary': '#A0A0B0',
        accent: '#00D4FF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neu': '20px 20px 40px #0a0a12, -20px -20px 40px #1e1e32',
        'neu-sm': '8px 8px 16px #0a0a12, -8px -8px 16px #1e1e32',
        'glow': '0 0 30px -5px rgba(108, 99, 255, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config