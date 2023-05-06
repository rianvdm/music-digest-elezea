const fetch = require("node-fetch");

const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

exports.handler = async function(event, context) {
  const allowedOrigins = ['https://sage-blancmange-420de0.netlify.app'];
  const origin = event.headers.origin || event.headers.Origin;

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: 'Forbidden: Access is restricted to allowed origins.'
    };
  }

  try {
    // Send a POST request to the Spotify API to retrieve a new access token
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });

    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${response.statusText}`);
    }

    // Parse the response JSON and return the access token
    const { access_token, expires_in } = await response.json();

    // For testing purposes, set expires_in to a very short duration (e.g., 1 second)
    // const shortexpiration = 1;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ access_token, expires_in })
    };
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};
