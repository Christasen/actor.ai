const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});

// Create actor index with mapping
async function setupElasticsearch() {
  try {
    await client.indices.create({
      index: 'actors',
      body: {
        mappings: {
          properties: {
            name: { type: 'text' },
            birthplace: { type: 'text' },
            birthday: { type: 'date' },
            bio: { type: 'text' },
            movies: {
              type: 'nested',
              properties: {
                title: { type: 'text' },
                role: { type: 'text' }
              }
            }
          }
        }
      }
    });
    console.log('Elasticsearch index created successfully');
  } catch (error) {
    if (error.message !== 'resource_already_exists_exception') {
      console.error('Elasticsearch setup error:', error);
    }
  }
}

module.exports = { client, setupElasticsearch }; 