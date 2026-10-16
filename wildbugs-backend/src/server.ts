import env from './config/env';
import app from './app';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`[wildbugs-backend] Server is running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`[wildbugs-backend] Health probe available at http://localhost:${PORT}/api/health`);
});
