
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          'primary-foreground': "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          'accent-foreground': "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        },
        // Stick Design Colors
        stick: {
          primary: "hsl(var(--stick-primary))",
          secondary: "hsl(var(--stick-secondary))",
          accent: "hsl(var(--stick-accent))",
          surface: "hsl(var(--stick-surface))",
          'surface-variant': "hsl(var(--stick-surface-variant))",
          outline: "hsl(var(--stick-outline))"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "reveal-video": {
          "0%": { height: "0", opacity: "0" },
          "100%": { height: "100%", opacity: "1" },
        },
        "spinner": {
          to: { transform: "rotate(360deg)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(var(--stick-primary))/20" 
          },
          "50%": { 
            boxShadow: "0 0 40px hsl(var(--stick-primary))/40, 0 0 60px hsl(var(--stick-secondary))/20" 
          }
        },
        "stick-slide": {
          "0%": { 
            transform: "translateX(-100%)",
            opacity: "0"
          },
          "100%": { 
            transform: "translateX(0)",
            opacity: "1"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-up": "slide-up 0.6s cubic-bezier(0.19, 1, 0.22, 1)",
        "scale-in": "scale-in 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
        "reveal-video": "reveal-video 0.6s cubic-bezier(0.19, 1, 0.22, 1)",
        "spinner": "spinner 1s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "stick-slide": "stick-slide 0.6s cubic-bezier(0.19, 1, 0.22, 1)"
      },
      boxShadow: {
        'stick': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'stick-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
        'stick-xl': '0 16px 60px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px hsl(var(--stick-primary))/20',
        'glow-lg': '0 0 40px hsl(var(--stick-primary))/30',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
