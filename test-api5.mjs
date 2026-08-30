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
      temperature: 35,
      date_time: {
        start_date: '2026-08-30',
        start_time: '14:00',
        filter_type: 1,
      },
    };

    const postRes = await axios.post(`${BASE_URL}/env_params`, payload, {
      headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' }
    });
    
    const activityId = postRes.data?.data?.activity_id;
    console.log('Activity ID:', activityId);
    
    const getRes = await axios.get(`${BASE_URL}/status/${activityId}`, {
      headers: { 'api-key': API_KEY }
    });
    
    console.log('GET /status response data:', JSON.stringify(getRes.data, null, 2));
  } catch (err) {
    console.error('API Test Failed:', err.response?.data || err.message);
  }
}

testApi();
