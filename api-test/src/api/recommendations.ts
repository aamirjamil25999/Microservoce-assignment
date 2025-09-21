import { http, RECO_BASE } from './client';
export async function getRecommendations(topics: string[] = [], skillLevel = 'beginner'){
  const { data } = await http.post(`${RECO_BASE}`, { topics, skillLevel });
  return data;
}
