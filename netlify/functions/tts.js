exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  try {
    const { text } = JSON.parse(event.body);
    const KEY = process.env.ELEVENLABS_KEY;
    const VOICE = 'o5tUAYEqld5GJZ1Lv8uC';

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': KEY },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 }
      })
    });

    if (!res.ok) return { statusCode: res.status, body: await res.text() };

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch(e) {
    return { statusCode: 500, body: e.message };
  }
};
