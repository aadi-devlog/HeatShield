import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.fortyguard.com/v1';
const API_KEY = process.env.VITE_FORTYGUARD_API_KEY;

async function testApi() {
  console.log('Testing FortyGuard API...');
  console.log('API Key available:', !!API_KEY);
  
  try {
    const payload = {
      latitude: 33.4484,
      longitude: -112.0740,
      date_time: {
        start_date: new Date().toISOString().split('T')[0],
        start_time: '06:00',
        end_time: '20:00',
        filter_type: 2,
      },
      analysis: [
        'heat_index_celsius',
        'wet_bulb_temperature_celsius',
        'relative_humidity_percent',
      ],
    };

    console.log('POST /v1/env_params', JSON.stringify(payload));
    
    const postRes = await axios.post(`${BASE_URL}/env_params`, payload, {
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json',
      }
    });
    
    const activityId = postRes.data?.data?.activity_id;
    console.log('Activity ID:', activityId);
    
    if (!activityId) throw new Error('No activity ID returned');
    
    let status = 'Processing';
    let getRes;
    while (status.toLowerCase() === 'processing' || status.toLowerCase() === 'pending') {
      await new Promise(r => setTimeout(r, 2000));
      getRes = await axios.get(`${BASE_URL}/status/${activityId}`, {
        headers: { 'api-key': API_KEY }
      });
      status = getRes.data?.status || 'Processing';
      console.log('Status:', status);
    }
    
    console.log('Final Result keys:', Object.keys(getRes?.data?.data || {}));
    console.log('SUCCESS');
    
  } catch (err) {
    console.error('API Test Failed:', err.response?.data || err.message);
  }
}

testApi();
