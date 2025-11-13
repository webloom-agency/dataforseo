#!/usr/bin/env node
/**
 * Script pour vérifier quels endpoints DataForSEO existent réellement
 * Usage: node verify-endpoints.js
 */

const https = require('https');

const username = process.env.DATAFORSEO_USERNAME;
const password = process.env.DATAFORSEO_PASSWORD;

if (!username || !password) {
  console.error('❌ ERROR: DATAFORSEO_USERNAME and DATAFORSEO_PASSWORD must be set');
  process.exit(1);
}

const credentials = Buffer.from(`${username}:${password}`).toString('base64');

// Liste des nouveaux endpoints à vérifier
const endpointsToTest = [
  // SERP API
  { name: 'Google AI Mode Languages', path: '/v3/serp/google/ai_mode/languages', method: 'GET' },
  { name: 'Google AI Mode Live', path: '/v3/serp/google/ai_mode/live/advanced', method: 'POST' },
  { name: 'Google News Live', path: '/v3/serp/google/news/live/advanced', method: 'POST' },
  { name: 'Google Maps Live', path: '/v3/serp/google/maps/live/advanced', method: 'POST' },
  { name: 'Google Images Live', path: '/v3/serp/google/images/live/advanced', method: 'POST' },
  { name: 'YouTube Languages', path: '/v3/serp/youtube/languages', method: 'GET' },
  
  // Keywords Data API
  { name: 'Google Ads Keywords For Site', path: '/v3/keywords_data/google_ads/keywords_for_site/live', method: 'POST' },
  { name: 'Google Ads Keywords For Keywords', path: '/v3/keywords_data/google_ads/keywords_for_keywords/live', method: 'POST' },
  { name: 'Google Ads Ad Traffic', path: '/v3/keywords_data/google_ads/ad_traffic_by_keywords/live', method: 'POST' },
  { name: 'Google Trends Locations', path: '/v3/keywords_data/google_trends/locations', method: 'GET' },
  
  // OnPage API
  { name: 'OnPage Task POST', path: '/v3/on_page/task_post', method: 'POST' },
  { name: 'OnPage Tasks Ready', path: '/v3/on_page/tasks_ready', method: 'GET' },
  { name: 'OnPage Summary', path: '/v3/on_page/summary/test-id', method: 'GET' },
  { name: 'OnPage Pages', path: '/v3/on_page/pages/test-id', method: 'POST' },
  { name: 'OnPage Resources', path: '/v3/on_page/resources/test-id', method: 'POST' },
  { name: 'OnPage Links', path: '/v3/on_page/links/test-id', method: 'POST' },
  { name: 'OnPage Redirect Chains', path: '/v3/on_page/redirect_chains/test-id', method: 'POST' },
  { name: 'OnPage Non-Indexable', path: '/v3/on_page/non_indexable/test-id', method: 'POST' },
  { name: 'OnPage Duplicate Tags', path: '/v3/on_page/duplicate_tags/test-id', method: 'POST' },
  { name: 'OnPage Duplicate Content', path: '/v3/on_page/duplicate_content/test-id', method: 'POST' },
  { name: 'OnPage Keyword Density', path: '/v3/on_page/keyword_density/test-id', method: 'POST' },
  { name: 'OnPage Microdata', path: '/v3/on_page/microdata/test-id', method: 'POST' },
  
  // AI Optimization
  { name: 'LLM Mentions Locations/Languages', path: '/v3/ai_optimization/llm_mentions/locations_and_languages', method: 'GET' },
  { name: 'LLM Mentions Filters', path: '/v3/ai_optimization/llm_mentions/filters', method: 'GET' },
  { name: 'LLM Mentions Search', path: '/v3/ai_optimization/llm_mentions/search/live', method: 'POST' },
  { name: 'LLM Mentions Top Pages', path: '/v3/ai_optimization/llm_mentions/top_pages/live', method: 'POST' },
  { name: 'LLM Mentions Top Domains', path: '/v3/ai_optimization/llm_mentions/top_domains/live', method: 'POST' },
  { name: 'LLM Mentions Aggregated', path: '/v3/ai_optimization/llm_mentions/aggregated_metrics/live', method: 'POST' },
  { name: 'LLM Mentions Cross Aggregated', path: '/v3/ai_optimization/llm_mentions/cross_aggregated_metrics/live', method: 'POST' },
  { name: 'ChatGPT Models', path: '/v3/ai_optimization/chat_gpt/llm_responses/models', method: 'GET' },
  { name: 'ChatGPT Responses Live', path: '/v3/ai_optimization/chat_gpt/llm_responses/live', method: 'POST' },
];

console.log('🔍 Testing DataForSEO Endpoints...\n');
console.log('Legend:');
console.log('  ✅ EXISTS - 200 or 40x with error message');
console.log('  ❌ NOT FOUND - 404');
console.log('  ⚠️  UNKNOWN - Other status\n');

let totalTested = 0;
let existsCount = 0;
let notFoundCount = 0;

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const testPayload = endpoint.method === 'POST' ? JSON.stringify([{}]) : null;
    
    const options = {
      hostname: 'api.dataforseo.com',
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    };

    if (testPayload) {
      options.headers['Content-Length'] = Buffer.byteLength(testPayload);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        totalTested++;
        
        if (res.statusCode === 404) {
          console.log(`❌ ${endpoint.name.padEnd(40)} - NOT FOUND (404)`);
          console.log(`   DELETE: ${endpoint.path}\n`);
          notFoundCount++;
        } else if (res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 401 || res.statusCode === 40501) {
          console.log(`✅ ${endpoint.name.padEnd(40)} - EXISTS (${res.statusCode})`);
          existsCount++;
        } else {
          console.log(`⚠️  ${endpoint.name.padEnd(40)} - UNKNOWN (${res.statusCode})`);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`⚠️  ${endpoint.name.padEnd(40)} - ERROR: ${error.message}`);
      resolve();
    });

    if (testPayload) {
      req.write(testPayload);
    }
    req.end();
  });
}

async function runTests() {
  for (const endpoint of endpointsToTest) {
    await testEndpoint(endpoint);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 SUMMARY: ${totalTested} endpoints tested`);
  console.log(`   ✅ Exists: ${existsCount}`);
  console.log(`   ❌ Not Found: ${notFoundCount}`);
  console.log('='.repeat(60));
}

runTests().catch(console.error);

