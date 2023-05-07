const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const dataType = event.queryStringParameters.type; // Get the dataType from the URL query parameters
    let url;

    // Get the URL of the getSpotifyToken function from an environment variable
    const getTokenUrl = process.env.GET_SPOTIFY_TOKEN_URL;

    // Call the getSpotifyToken function to retrieve an access token
    const gettokenSecret = process.env.SPOTIFY_GET_TOKEN_SECRET;
    const tokenResponse = await fetch(getTokenUrl, {
        headers: {
          "x-api-key": gettokenSecret
        }
      });
    const { access_token } = await tokenResponse.json();

  const urlTemplates = {
    getTopTracks: () => `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=3`,
    getTopArtists: () => `https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5`
  };

    // Call the appropriate URL template function based on the dataType
    if (dataType === 'tracks') {
      url = urlTemplates.getTopTracks();
    } else if (dataType === 'artists') {
      url = urlTemplates.getTopArtists();
    } else {
      throw new Error(`Unsupported data type: ${dataType}`);
    }

    // Make the request to the Spotify API with the access token
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    // Parse the response as JSON and return it as the response of the Netlify function
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    // Handle any errors that occur during the request
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
