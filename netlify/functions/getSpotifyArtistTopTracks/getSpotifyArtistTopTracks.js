const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const spotifyArtistID = event.queryStringParameters.spotifyArtistID;

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

    // Construct the request URL with the necessary query parameters
    const requestUrl = `https://api.spotify.com/v1/artists/${spotifyArtistID}/top-tracks?market=US`;

    // Make the request to the Spotify API with the access token
    const response = await fetch(requestUrl, {
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
      body: JSON.stringify(data.tracks),
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
