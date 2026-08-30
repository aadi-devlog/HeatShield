import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.fortyguard.com/v1';
const API_KEY = process.env.VITE_FORTYGUARD_API_KEY;

async function testApi() {
  try {
    const payload = {
      latitude: 33.4484,
      longitude: -112.0740,
      temperature: 35, // testing if it needs a temperature value? Or maybe it's analysis: ["temperature"]?
      date_time: {
        start_date: new Date().toISOString().split('T')[0],
        start_time: '06:00',
        end_time: '20:00',
        filter_type: 2,
      },
    };
    
    // First let's try with analysis: ["temperature"]
    const payload2 = {
      latitude: 33.4484,
      longitude: -112.0740,
      date_time: {
        start_date: new Date().toISOString().split('T')[0],
        start_time: '06:00',
        end_time: '20:00',
        filter_type: 2,
      },
      analysis: [
        'temperature_celsius',
        'heat_index_celsius',
      ],
    };

    try {
      console.log('Testing payload2 (analysis with temperature_celsius)');
      await axios.post(`${BASE_URL}/env_params`, payload2, { headers: { 'api-key': API_KEY } });
      console.log('payload2 succeeded');
    } catch(e) {
      console.log('payload2 failed:', JSON.stringify(e.response?.data, null, 2));
    }
    
    // Test 3: Maybe the endpoint is completely different or temperature is required in root?
  } catch (err) {
    console.error('Outer error:', err);
  }
}

testApi();
