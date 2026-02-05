/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Figma 디자인 시스템 (당근마켓 클론)
        point: {
          0: '#FF6F0F',
          2: '#FFF6E2',
          3: '#F9B83D',
        },
        gray: {
          100: '#212224',
          90: '#2B2B2B',
          80: '#424242',
          70: '#5A5A5A',
          60: '#717171',
          50: '#898989',
          40: '#A1A1A1',
          30: '#B9B9B9',
          20: '#D0D0D0',
          10: '#E8E8E8',
          light: '#F2F3F6',
        },
        grey: {
          900: '#2B2E33',
          100: '#ECEFF1',
          50: '#F5F7F8',
        },
        error: {
          DEFAULT: '#FC5555',
          2: '#FFF5F4',
        },
        notice: {
          DEFAULT: '#FFF8E1',
        },
      },
      fontSize: {
        'display-1': ['28px', { lineHeight: '36px', letterSpacing: '-0.03em' }],
        'title-3': ['18px', { lineHeight: '1.35', fontWeight: 700 }],
        'body-16': ['16px', { lineHeight: '26px' }],
        'body-14': ['14px', { lineHeight: '22px' }],
        'body-12': ['12px', { lineHeight: '18px' }],
        'subhead': ['14px', { lineHeight: '22px', fontWeight: 600 }],
      },
      maxWidth: {
        mobile: '430px',
      },
    },
  },
  plugins: [],
}
