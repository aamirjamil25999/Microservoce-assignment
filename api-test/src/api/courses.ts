import { http, COURSE_BASE } from './client';
export async function searchCourses(q: string){
  const { data } = await http.get(`${COURSE_BASE}/search`, { params: { q } });
  return data;
}
