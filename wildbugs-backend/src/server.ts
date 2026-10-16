import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[wildbugs-backend] Server is running on port ${PORT}`);
  console.log(`[wildbugs-backend] Health probe available at http://localhost:${PORT}/api/health`);
});
