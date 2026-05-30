/** @type {import('tailwindcss').Config} */
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
            fontFamily: {
                sans:    ['Jost', 'Inter', 'system-ui', 'sans-serif'],
                display: ['"Cormorant Garamond"', 'Cormorant', 'Georgia', 'serif'],
                script:  ['Italianno', '"Cormorant Garamond"', 'serif'],
                body:    ['Jost', 'Inter', 'system-ui', 'sans-serif'],
                mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            letterSpacing: {
                'widest-x':   '0.28em',
                'widest-xx':  '0.32em',
                'widest-xxx': '0.42em',
            },
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
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
                hotel: {
                    navy: "hsl(var(--hotel-navy))",
                    "navy-light": "hsl(var(--hotel-navy-light))",
                    gold: "hsl(var(--hotel-gold))",
                    "gold-light": "hsl(var(--hotel-gold-light))",
                    cream: "hsl(var(--hotel-cream))",
                    "cream-dark": "hsl(var(--hotel-cream-dark))",
                    charcoal: "hsl(var(--hotel-charcoal))",
                    "charcoal-light": "hsl(var(--hotel-charcoal-light))",
                    bronze: "hsl(var(--hotel-bronze))",
                    "bronze-light": "hsl(var(--hotel-bronze-light))",
                    sage: "hsl(var(--hotel-sage))",
                    "sage-light": "hsl(var(--hotel-sage-light))",
                    primary: "hsl(var(--hotel-primary))",
                    "primary-light": "hsl(var(--hotel-primary-light))",
                    secondary: "hsl(var(--hotel-secondary))",
                    "secondary-light": "hsl(var(--hotel-secondary-light))",
                },
                samudra: {
                    paper:        'var(--paper)',
                    'paper-soft': 'var(--paper-soft)',
                    'paper-deep': 'var(--paper-deep)',
                    ink:          'var(--ink)',
                    'ink-soft':   'var(--ink-soft)',
                    'ink-mute':   'var(--ink-mute)',
                    teal:         'var(--teal)',
                    'teal-deep':  'var(--teal-deep)',
                    sand:         'var(--sand)',
                    gold:         'var(--gold)',
                },
            },
            borderRadius: {
                none:    '0',
                sm:      '0',
                DEFAULT: '0',
                md:      '0',
                lg:      '0',
                full:    '9999px',
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
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
