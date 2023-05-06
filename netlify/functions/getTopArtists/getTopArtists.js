// Get top artists from last.fm

const lastFMToken = process.env.LAST_FM_API_TOKEN;

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const period = event.queryStringParameters.period;
  const lastFMUser = event.queryStringParameters.lastFMUser;
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastFMUser}&api_key=${lastFMToken}&period=${period}&format=json`
  const results = await fetch(url);

  // If there was an error
  if (!results.ok) {
    console.error(results);

    return {
      statusCode: 500,
      body: results.statusText
    }
  }

  // Get JSON body from results
  const data = await results.json();

  // Return data
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
}

