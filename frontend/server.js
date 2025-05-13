import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  
  app.use(vite.middlewares);
  
  app.use('*', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });
  
  app.listen(5173, () => {
    console.log('Server is running at http://localhost:5173');
  });
}

createServer(); 