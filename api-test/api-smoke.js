import axios from 'axios';
const AUTH_BASE = 'http://localhost:4000/auth';
const COURSE_BASE = 'http://localhost:4002/courses';
const RECO_BASE = 'http://localhost:4001/recommendations';
async function run(){
  console.log('Login:');
  try{ let r = await axios.post(`${AUTH_BASE}/login`, { username:'admin', password:'admin123' }); console.log('token:', r.data.token?.slice(0,20)+'...'); }catch(e){ console.log('Login error:', e.response?.data || String(e)) }
  console.log('Search:');
  try{ let r = await axios.get(`${COURSE_BASE}/search`, { params: { q: 'react' } }); console.log('hits:', Array.isArray(r.data)? r.data.length : r.data?.length ); }catch(e){ console.log('Search error:', e.response?.data || String(e)) }
  console.log('Recs:');
  try{ let r = await axios.post(`${RECO_BASE}`, { topics:['mern'], skillLevel:'beginner' }); console.log(r.data); }catch(e){ console.log('Recs error:', e.response?.data || String(e)) }
}
run();
