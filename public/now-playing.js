//------------------------------------------
// Fetch tracks
//------------------------------------------
fetch('/.netlify/functions/getRecentTracks')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]];

    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const pacificTimezone = 'America/Los_Angeles';

    const formattedDateNow = new Date().toLocaleString('en-US', {
      ...optionsDate,
      timeZone: pacificTimezone
    });

    const formattedTimeNow = new Date().toLocaleString('en-US', {
      ...optionsTime,
      timeZone: pacificTimezone
    });


    if (nowPlaying[0].hasOwnProperty('@attr') && 
        nowPlaying[0]['@attr'].hasOwnProperty('nowplaying') && 
        nowPlaying[0]['@attr'].nowplaying === 'true') {


// Get the data for the  artist
fetch(`/.netlify/functions/getArtistInfo?mbid=${nowPlaying[0].artist['mbid']}`)
  .then(response => response.json())
  .then(data => {
    // Check for error property in Last.fm API response
    if (data.error) {
      const html = `
        <div class="track_none">
          <p style="text-align: center;">What I’m streaming right now at ${formattedTimeNow} Pacific Time on ${formattedDateNow}.</p>
        </div>
        <div class="track">
          <a href="${nowPlaying[0].url}" target="_blank" class="track_link">
            <img src="${nowPlaying[0].image[3]['#text']}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${nowPlaying[0].name}</h2>
              <p class="track_name">${nowPlaying[0].artist['#text']}</p></a>
              <p class="track_album">${nowPlaying[0].album['#text']}</p>
            </div>
        </div>
        <div class="track_none">
          <p style="text-align: center;">Last.fm unfortunately does not have any additional information on ${nowPlaying[0].artist['#text']}.</p>
        </div>
      `;
      dataContainer.innerHTML = html;
    } else {
      // Get details about the artist
      const tags = data.artist.tags.tag.map(tag => tag.name);
      const similar = data.artist.similar.artist.map(artist => artist.name);
      const bio = data.artist.bio.summary;

      const html = `
        <div class="track_none">
          <p style="text-align: center;">What I’m streaming right now at ${formattedTimeNow} Pacific Time on ${formattedDateNow}:</p>
        </div>
        <div class="track">
          <a href="${nowPlaying[0].url}" target="_blank" class="track_link">
            <img src="${nowPlaying[0].image[3]['#text']}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${nowPlaying[0].name}</h2>
              <p class="track_name">${nowPlaying[0].artist['#text']}</p></a>
              <p class="track_album">${nowPlaying[0].album['#text']}</p>
            </div>
        </div>
        <div class="track_none">
          <p style="text-align: center;">If you like <strong>${tags[0]}</strong> and <strong>${tags[1]}</strong> you might enjoy ${nowPlaying[0].artist['#text']}.
          They are similar to <strong>${similar[0]}</strong>, <strong>${similar[1]}</strong>, and <strong>${similar[2]}</strong>. Here's a bit more info about them:</p>
          <p style="text-align: center;">${bio}.</p>
        </div>
      `;
      dataContainer.innerHTML = html;
    }
  })



  } else {

    const utsDate = data.recenttracks.track[0].date.uts;

    const formattedDate = new Date(utsDate * 1000).toLocaleString('en-US', {
      ...optionsDate,
      timeZone: pacificTimezone
    });
    const formattedTime = new Date(utsDate * 1000).toLocaleString('en-US', {
      ...optionsTime,
      timeZone: pacificTimezone
    });

    // Get the data for the  artist
    fetch(`/.netlify/functions/getArtistInfo?mbid=${nowPlaying[0].artist['mbid']}`)
      .then(response => response.json())
      .then(data => {
        // Check for error property in Last.fm API response
        if (data.error) {
          const html = `
        <div class="track_none">
            <h4 style="text-align:center">Sadly, I’m not listening to anything right now. It’s all very very quiet.</h4>
          <div class="track">
              <a href="${nowPlaying[0].url}" target="_blank" class="track_link">
              <img src="${nowPlaying[0].image[3]['#text']}" class="track_image">
              <div class="track_content">
                <h2 class="track_artist">${nowPlaying[0].name}</h2>
                <p class="track_name">${nowPlaying[0].artist['#text']}</p></a>
                <p class="track_album">${nowPlaying[0].album['#text']}</p>
              </div>
            </div>
            <p style="text-align: center;">The last song I listened to was <a href="${nowPlaying[0].url}">${nowPlaying[0].name}</a> by ${nowPlaying[0].artist['#text']} at ${formattedTime} Pacific Time on ${formattedDate}.</p>
        </div>
          `;
          dataContainer.innerHTML = html;
        } else {
          // Get details about the artist
          const tags = data.artist.tags.tag.map(tag => tag.name);
          const similar = data.artist.similar.artist.map(artist => artist.name);
          const bio = data.artist.bio.summary;

          const html = `
            <div class="track_none">
            <h4 style="text-align:center">Sadly, I’m not listening to anything right now. It’s all very very quiet.</h4>
            <div class="track">
              <a href="${nowPlaying[0].url}" target="_blank" class="track_link">
              <img src="${nowPlaying[0].image[3]['#text']}" class="track_image">
              <div class="track_content">
                <h2 class="track_artist">${nowPlaying[0].name}</h2>
                <p class="track_name">${nowPlaying[0].artist['#text']}</p></a>
                <p class="track_album">${nowPlaying[0].album['#text']}</p>
              </div>
            </div>
            <p style="text-align: center;">The last song I listened to was <a href="${nowPlaying[0].url}">${nowPlaying[0].name}</a> by ${nowPlaying[0].artist['#text']} at ${formattedTime} Pacific Time on ${formattedDate}.</p>
            <p style="text-align: center;">If you like <strong>${tags[0]}</strong> and <strong>${tags[1]}</strong> you might enjoy ${nowPlaying[0].artist['#text']}.
              They are similar to <strong>${similar[0]}</strong>, <strong>${similar[1]}</strong>, and <strong>${similar[2]}</strong>. Here's a bit more info about them:</p>
            <p style="text-align: center;">${bio}.</p>
            </div>
          `;
          dataContainer.innerHTML = html;
        }
      })

  }
  })
  .catch(error => console.error(error));


