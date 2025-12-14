/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef3f2',
                    100: '#fee5e2',
                    200: '#fecfca',
                    300: '#fcaea5',
                    400: '#f87f71',
                    500: '#ef5844',
                    600: '#dc3a26',
                    700: '#b92e1c',
                    800: '#99291b',
                    900: '#7f281d',
                },
                sweet: {
                    pink: '#ff6b9d',
                    purple: '#c44569',
                    orange: '#f97f51',
                    yellow: '#feca57',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
