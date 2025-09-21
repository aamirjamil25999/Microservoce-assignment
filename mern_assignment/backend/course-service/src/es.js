import { Client as ESClient } from '@elastic/elasticsearch'

export const esClient = new ESClient({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: '21009b1b3eb66b3f88411585a3b6722d75cb5d9eb387063d0e730a1ad15fa73b'
  }
})
export async function ensureIndex(){
  const { body: exists } = await esClient.indices.exists({ index: 'courses' })
  if(!exists){
    await esClient.indices.create({
      index: 'courses',
      settings: { number_of_shards: 1, number_of_replicas: 0 },
      mappings: {
        properties: {
          course_id: { type: 'keyword' },
          title: { type: 'text' },
          description: { type: 'text' },
          category: { type: 'keyword' },
          instructor: { type: 'text' },
          duration: { type: 'text' }
        }
      }
    })
  }
}
