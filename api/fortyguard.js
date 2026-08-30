export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { endpoint, payload } = req.body;
  if (!endpoint || !payload) {
    return res.status(400).json({ error: 'Missing endpoint or payload' });
  }

  const apiKey = process.env.FORTYGUARD_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'FORTYGUARD_API_KEY is not configured on the server.' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'api-key': apiKey // FortyGuard sometimes requires this instead of Bearer
  };

  try {
    // 1. Submit task
    const submitRes = await fetch(`https://api.fortyguard.com/v1/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!submitRes.ok) {
      const errData = await submitRes.json().catch(() => ({}));
      return res.status(submitRes.status).json({
        error: `FortyGuard API error (Submit): ${submitRes.statusText}`,
        details: errData
      });
    }

    const submitData = await submitRes.json();
    const activityId = submitData?.data?.activity_id;

    if (!activityId) {
      return res.status(502).json({ error: 'No activity_id returned from FortyGuard.' });
    }

    // 2. Poll status server-side
    const POLL_INTERVAL_MS = 2000;
    const POLL_TIMEOUT_MS = 20000; // Keep under Vercel Serverless timeout
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      // wait
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

      const statusRes = await fetch(`https://api.fortyguard.com/v1/status/${activityId}`, {
        method: 'GET',
        headers
      });

      if (!statusRes.ok) {
         continue; // Keep trying if 5xx, or we could throw. 
      }

      const statusData = await statusRes.json();
      const statusObj = statusData?.data;
      const normalizedStatus = (statusObj?.status || statusData?.message || '').toLowerCase();

      if (normalizedStatus === 'completed') {
        // Safe normalized return!
        return res.status(200).json({
          activityId,
          data: statusObj
        });
      }

      if (normalizedStatus === 'failed') {
        return res.status(502).json({
          error: 'FortyGuard task failed',
          details: statusData.message
        });
      }
    }

    return res.status(504).json({ error: `Polling timed out after ${POLL_TIMEOUT_MS/1000}s on Vercel` });

  } catch (error) {
    console.error('FortyGuard Server-Side Error:', error);
    return res.status(500).json({ error: 'Internal server proxy error', details: error.message });
  }
}
