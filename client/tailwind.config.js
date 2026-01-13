/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0d9488', // Teal 600 - Main brand color
                secondary: '#f97316', // Coral/Orange 500 - Vibrant secondary
                accent: '#fbbf24', // Amber 400 - Warm accent
                coral: '#fb7185', // Rose 400 - Additional coral tone
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
