const fetch = require("node-fetch");
const Redis = require("ioredis");

exports.handler = async function(event, context) {
  try {
    const query = event.queryStringParameters.q; // Get the search query from the URL query parameters
    const dataType = event.queryStringParameters.type; // Get the dataType from the URL query parameters
    let url;

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

    const urlTemplates = {
      getTrack: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      getAlbum: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=20`,
      getArtist: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=20`
    };

    if (urlTemplates.hasOwnProperty(dataType) && query) {
      url = urlTemplates[dataType](query);
    } else {
      return {
        statusCode: 400,
        body: 'Invalid request. Please provide a valid data type and query.'
      };
    }


    // Send a GET request to the Spotify API to search for the song
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token_2}`
      }
    });

    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`Failed to search for song: ${response.statusText}`);
    }

    // Parse the response JSON
    const jsonResponse = await response.json();

    // Return the relevant data depending on the dataType parameter
    let resultData;
    if (dataType === 'getTrack') {
      resultData = jsonResponse.tracks;
    } else if (dataType === 'getAlbum') {
      resultData = jsonResponse.albums;
    } else if (dataType === 'getArtist') {
      resultData = jsonResponse.artists;
    }


      return {
        statusCode: 200,
        body: JSON.stringify({ data: resultData }),
      };

      
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
