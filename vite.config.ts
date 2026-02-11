import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 7003,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
