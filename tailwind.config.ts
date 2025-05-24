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
  				foreground: "hsl(var(--primary-foreground))",
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))",
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))",
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))",
  			},
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))",
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))",
  			},
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))",
  			},
  			// Custom pink-yellow theme colors
  			pink: {
  				50: "#fdf2f8",
  				100: "#fce7f3",
  				200: "#fbcfe8",
  				300: "#f9a8d4",
  				400: "#f472b6",
  				500: "#ec4899",
  				600: "#db2777",
  				700: "#be185d",
  				800: "#9d174d",
  				900: "#831843",
  			},
  			yellow: {
  				50: "#fefce8",
  				100: "#fef9c3",
  				200: "#fef08a",
  				300: "#fde047",
  				400: "#facc15",
  				500: "#eab308",
  				600: "#ca8a04",
  				700: "#a16207",
  				800: "#854d0e",
  				900: "#713f12",
  			},
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)"
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
  			float: {
  				"0%, 100%": { transform: "translateY(0px)" },
  				"50%": { transform: "translateY(-10px)" },
  			},
  			"pulse-glow": {
  				"0%, 100%": {
  					boxShadow: "0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary)), 0 0 15px hsl(var(--primary))",
  				},
  				"50%": {
  					boxShadow: "0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))",
  				},
  			},
  			wiggle: {
  				"0%, 100%": { transform: "rotate(-3deg)" },
  				"50%": { transform: "rotate(3deg)" },
  			},
  			bounce: {
  				"0%, 100%": {
  					transform: "translateY(-25%)",
  					animationTimingFunction: "cubic-bezier(0.8,0,1,1)",
  				},
  				"50%": {
  					transform: "none",
  					animationTimingFunction: "cubic-bezier(0,0,0.2,1)",
  				},
  			},
  		},
  		animation: {
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  			float: "float 3s ease-in-out infinite",
  			"pulse-glow": "pulse-glow 2s ease-in-out infinite",
  			wiggle: "wiggle 1s ease-in-out infinite",
  			"bounce-slow": "bounce 2s infinite",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
