//------------------------------------------
// Fetch tracks
//------------------------------------------
fetch('/.netlify/functions/getRecentTracks?lastFMUser=vhata')
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

// Check if something is currently playing. If it is, show current date and time and some "right now" text at the top.

    if (nowPlaying[0].hasOwnProperty('@attr') && 
        nowPlaying[0]['@attr'].hasOwnProperty('nowplaying') && 
        nowPlaying[0]['@attr'].nowplaying === 'true') {


      const html = `
        <div class="track_none">
          <p style="text-align: center;">Right now (${formattedTimeNow} PT on ${formattedDateNow}) I am listening to <strong>${nowPlaying[0].name}</strong> by <strong>${nowPlaying[0].artist['#text']}</strong> from the album <strong>${nowPlaying[0].album['#text']}</strong>.</p>
        </div>
      `;
      dataContainer.innerHTML = html;


// If nothing is currently playing, change the text at the top to indicate the last track and when it was played.

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

    const html = `
      <div class="track_none">
        <p style="text-align: center;">Nothing is playing right now. The last song I listened to at ${formattedTime} PT on ${formattedDate} was <strong>${nowPlaying[0].name}</strong> by <strong>${nowPlaying[0].artist['#text']}</strong> from the album <strong>${nowPlaying[0].album['#text']}</strong>.</p>
      </div>
          `;
          dataContainer.innerHTML = html;
          
  }
  })

.catch(error => console.error(error));

        // Code to display the Last.fm details
        // <div class="track">
        //   <a href="${nowPlaying[0].url}" target="_blank" class="track_link">
        //     <img src="${nowPlaying[0].image[3]['#text']}" class="track_image">
        //     <div class="track_content">
        //       <h2 class="track_artist">${nowPlaying[0].name}</h2></a>
        //       <p class="track_name">${nowPlaying[0].artist['#text']}</p>
        //       <p class="track_album">${nowPlaying[0].album['#text']}</p>
        //     </div>
        // </div>
