const fetch = require("node-fetch");
const Redis = require("ioredis");

exports.handler = async function (event, context) {
  try {
    const seed_artists = event.queryStringParameters.seed_artists;
    const seed_genres = event.queryStringParameters.seed_genres;
    const seed_tracks = event.queryStringParameters.seed_tracks;

    const getTokenUrl = process.env.GET_SPOTIFY_TOKEN_URL;

    console.log('Creating Redis client2');
      const client2 = new Redis(process.env.REDIS_URL, {
      connectTimeout: 26000,
    });

    console.log('Retrieving access token and expiration time from Redis');
    let access_token_2 = await client2.get("spotify_access_token_2");
    let expires_at_2_str = await client2.get("spotify_expires_at_2");
    let expires_at_2 = parseInt(expires_at_2_str, 10);
    console.log(expires_at_2);

    if (!access_token_2 || !expires_at_2 || Date.now() >= expires_at_2) {
      console.log('Fetching new access token');
      const gettokenSecret = process.env.SPOTIFY_GET_TOKEN_SECRET;
      const tokenResponse = await fetch(getTokenUrl, {
        headers: {
          "x-api-key": gettokenSecret
        }
      });
      const tokenData = await tokenResponse.json();
      console.log(tokenData);
      access_token_2 = tokenData.access_token;
      expires_at_2 = Date.now() + tokenData.expires_in * 1000;
      console.log(expires_at_2);

      console.log('Storing new access token and expiration time in Redis');
      await client2.set("spotify_access_token_2", access_token_2);
      await client2.set("spotify_expires_at_2", expires_at_2);
    } else {
      console.log('Using existing access token from Redis');
      console.log(expires_at_2);
    }

    console.log('Quitting Redis client2');
    await client2.quit();

    const requestUrl = `https://api.spotify.com/v1/recommendations?limit=10&seed_artists=${seed_artists}&seed_genres=${seed_genres}&seed_tracks=${seed_tracks}&limit=2`;

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token_2}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
