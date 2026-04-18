exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text } = JSON.parse(event.body);
    if (!text) return { statusCode: 400, body: 'Missing text' };

    const ELEVENLABS_KEY = process.env.ELEVENLABS_KEY;
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'o5tUAYEqld5GJZ1Lv8uC';
    if (!ELEVENLABS_KEY) return { statusCode: 500, body: 'Missing API key' };

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('ElevenLabs error:', err);
      return { statusCode: res.status, body: err };
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      body: base64,
      isBase64Encoded: true
    };

  } catch(e) {
    console.error('TTS function error:', e);
    return { statusCode: 500, body: e.message };
  }
};
