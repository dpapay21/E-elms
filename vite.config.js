import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const missing = ['VITE_CLOUDINARY_CLOUD_NAME', 'VITE_CLOUDINARY_UPLOAD_PRESET']
      .filter((name) => !env[name]?.trim());

    if (missing.length) {
      throw new Error(
        `Cannot build E-LMIS: configure ${missing.join(' and ')} in the deployment environment. ` +
        'For Vercel, add them under Project Settings → Environment Variables and redeploy.'
      );
    }
  }

  return {
    plugins: [react()],
  };
});
