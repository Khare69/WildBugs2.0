import env from './config/env';
import app from './app';
import { setupIdentificationWorker, setupBadgeWorker } from './jobs/queue';
import { processIdentificationJob } from './jobs/identifyInsect.job';
import { processBadgeJob } from './jobs/checkBadges.job';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`[wildbugs-backend] Server is running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`[wildbugs-backend] Health probe available at http://localhost:${PORT}/api/health`);

  // Initialize background workers in non-test runtime
  if (env.NODE_ENV !== 'test') {
    try {
      setupIdentificationWorker(processIdentificationJob);
      console.log('[wildbugs-backend] Asynchronous AI vision identification worker initialized');

      setupBadgeWorker(processBadgeJob);
      console.log('[wildbugs-backend] Asynchronous badge evaluation worker initialized');
    } catch (err) {
      console.warn('[wildbugs-backend] Background worker initialization deferred:', err);
    }
  }
});

export default server;

