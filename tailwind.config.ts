import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Vantix Hub
        background: '#08100E',
        surface: '#0F1A18',
        'surface-hover': '#1A2E2A',
        border: '#1E2D2A',
        primary: '#337BD9',
        'primary-hover': '#2563C0',
        'text-main': '#F0F4F8',
        'text-muted': '#8899A6',
        // Shadcn UI variables mapeadas
        card: '#0F1A18',
        'card-foreground': '#F0F4F8',
        popover: '#0F1A18',
        'popover-foreground': '#F0F4F8',
        muted: '#1E2D2A',
        'muted-foreground': '#8899A6',
        accent: '#1A2E2A',
        'accent-foreground': '#F0F4F8',
        destructive: '#DC2626',
        'destructive-foreground': '#F0F4F8',
        input: '#1E2D2A',
        ring: '#337BD9',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
