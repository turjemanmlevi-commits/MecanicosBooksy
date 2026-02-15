/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--bg-primary)",
                card: "var(--bg-card)",
                surface: "var(--bg-surface)",
                primary: {
                    DEFAULT: "var(--color-primary)",
                    hover: "var(--color-primary-hover)",
                },
                muted: "var(--color-text-muted)",
                border: "var(--color-border)",
            },
            fontFamily: {
                sans: ['Rajdhani', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: "var(--radius)",
            }
        },
    },
    plugins: [],
}
