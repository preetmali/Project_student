import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`[ProjectHub Phase 2 API] Server running on port ${env.PORT} (${env.NODE_ENV})`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
