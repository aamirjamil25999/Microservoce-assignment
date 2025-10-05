import { http, COURSE_BASE } from "./client";

export async function uploadCSV(file){
  const form = new FormData();
  form.append("file", file);
  const { data } = await http.post(`${COURSE_BASE}/upload`, form);
  console.log(data)
  return data;
}
export async function searchCourses(q){
  const { data } = await http.get(`${COURSE_BASE}/search`, { params: { q } });
  return data;
}
