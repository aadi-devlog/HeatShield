// @ts-nocheck
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import * as dotenv from 'dotenv'

// Load .env variables manually for the Vite dev server plugin
dotenv.config()

const apiProxyPlugin = () => ({
  name: 'api-proxy-plugin',
  configureServer(server) {
    server.middlewares.use('/api/fortyguard', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      // Collect body chunks
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const { endpoint, payload } = JSON.parse(body);
          const apiKey = process.env.FORTYGUARD_API_KEY;
          
          if (!apiKey) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: 'FORTYGUARD_API_KEY is missing' }));
          }

          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'api-key': apiKey
          };

          // 1. Submit
          const submitRes = await fetch(`https://api.fortyguard.com/v1/${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });

          if (!submitRes.ok) {
            res.statusCode = submitRes.status;
            return res.end(JSON.stringify({ error: `FortyGuard error: ${submitRes.statusText}` }));
          }

          const submitData = await submitRes.json();
          const activityId = submitData?.data?.activity_id;

          if (!activityId) {
            res.statusCode = 502;
            return res.end(JSON.stringify({ error: 'No activity_id returned.' }));
          }

          // 2. Poll
          const deadline = Date.now() + 20000;
          while (Date.now() < deadline) {
            await new Promise(r => setTimeout(r, 2000));
            const statusRes = await fetch(`https://api.fortyguard.com/v1/status/${activityId}`, {
              method: 'GET',
              headers
            });

            if (!statusRes.ok) continue;

            const statusData = await statusRes.json();
            const normalizedStatus = (statusData?.data?.status || statusData?.message || '').toLowerCase();

            if (normalizedStatus === 'completed') {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              return res.end(JSON.stringify({ activityId, data: statusData.data }));
            }
            if (normalizedStatus === 'failed') {
              res.statusCode = 502;
              return res.end(JSON.stringify({ error: 'FortyGuard task failed' }));
            }
          }

          res.statusCode = 504;
          res.end(JSON.stringify({ error: 'Polling timed out' }));

        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
        }
      });
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiProxyPlugin()],
})
