import express from 'express';
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
const cache = {};
app.get("/api/dev/username", async (req,res) =>{
  const queryName = req.query.name;
  if(!queryName){
    return res.status(400).json({error: 'Name is required'});
  }
  const base = `https://api.github.com/users/${queryName}`;
  if (cache[queryName]) {
    return res.json(cache[queryName]);
  }
  try{
    const [response, reposRes] = await Promise.all([
      fetch(base, {headers: {'User-Agent': 'DeveloperMetricHub'}}),
      fetch(`${base}/repos?per_page=100`, {headers: {'User-Agent': 'DeveloperMetricHub'}})
    ]);
    if(!response.ok || !reposRes.ok){
      return res.status(response.status).json({error: 'User not found on github'});
    }
    const responseData = await response.json();
    const repoData = await reposRes.json();
    const payLoad = { resdata: responseData, repo: repoData};
    cache[queryName] = payLoad;
    return res.json(payLoad);
  }
  catch(error){
    res.status(500).json({error: 'Failed to fetch from Github'});
  }
})
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;