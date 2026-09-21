import path from 'path';
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
const cache = {};
const rootPath = process.cwd();
const publicPath = path.join(rootPath, 'public');
app.use(express.static(publicPath));
app.get('/api/dev/username', async (req, res) => {
  const queryName = req.query.name || req.query.username;
  if (!queryName) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (cache[queryName]) {
    return res.json(cache[queryName]);
  }
  const base = `https://api.github.com/users/${queryName}`;
  try {
    const headers = { 'User-Agent': 'dev-lookup-five' };
    const [response, reposRes] = await Promise.all([
      fetch(base, { headers }),
      fetch(`${base}/repos?per_page=100`, { headers })
    ]);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'User not found on GitHub' });
    }
    if (!reposRes.ok) {
      return res.status(reposRes.status).json({ error: 'Repositories not found' });
    }
    const responseData = await response.json();
    const repoData = await reposRes.json();
    const payLoad = { resdata: responseData, repo: repoData };
    cache[queryName] = payLoad;
    return res.json(payLoad);
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
export default app;