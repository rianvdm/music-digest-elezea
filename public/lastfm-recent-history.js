// Add your list of usernames here
const lastFMUsernames = ['vhata', 'SundancerZA', 'ThisIsGio', 'draklef', 'jhuggart113', 'imsickofmaps', 'Troegie', 'bordesak'];

const fetchDataForUser = (username) => {
  return fetch(`/.netlify/functions/getRecentTracks?lastFMUser=${username}`)
    .then(response => response.json());
};

Promise.all(lastFMUsernames.map(fetchDataForUser))
  .then(usersData => {
    const dataContainer = document.querySelector('.js-now-playing');

    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const pacificTimezone = 'America/Los_Angeles';

    let html = '';

    usersData.forEach((data, userIndex) => {
      const recentTracks = data.recenttracks.track.slice(0, 5);

      html += `
        <div class="track_list">
          <p style="text-align: center;">Last 5 tracks <strong>${lastFMUsernames[userIndex]}</strong> listened to:</p>
          <ul class="track_ul">
      `;

      recentTracks.forEach(track => {
        html += `
          <li>
            <strong>${track.name}</strong> by <strong>${track.artist['#text']}</strong> from the album <strong>${track.album['#text']}</strong>
          </li>
        `;
      });

      html += `
          </ul>
        </div>
      `;
    });

    dataContainer.innerHTML = html;
  })
  .catch(error => console.error(error));
