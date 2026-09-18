import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' ทำให้ build ออกมาใช้ path แบบ relative
// จึงวางบน GitHub Pages ได้ทั้งแบบ username.github.io และ /ชื่อ-repo/ โดยไม่ต้องแก้อะไร
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', assetsDir: 'assets' },
});
