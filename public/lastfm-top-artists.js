const lastFMUsernames = ['vhata', 'SundancerZA', 'ThisIsGio', 'draklef', 'mobivangelist', 'jhuggart113', 'imsickofmaps', 'Troegie', 'bordesak'];

const fetchDataForUser = (username) => {
  return fetch(`/.netlify/functions/getTopArtists?lastFMUser=${username}&period=7day`)
    .then(response => response.json());
};

const displayTopArtists = async (userData, username) => {
  const topArtists = userData.topartists.artist.slice(0, 3);

  // Create an array of promises for each artist's data
  const artistPromises = topArtists.map(artist => {
    const artistName = artist.name
      .replace(/&/g, '%26')
      .replace(/\+/g, '%2B')
      .replace(/\./g, '%2E');
    const encodedArtist = encodeURIComponent(artistName);

    return fetch(`/.netlify/functions/getLastfmData?&type=getArtistInfo&artist=${encodedArtist}`)
      .then(response => response.json())
      .then(async data => {
        if (typeof data.artist.tags.tag[0] === 'undefined') {
          return {
            summary: 'Last.fm unfortunately does not have any additional information on this artist.',
          };
        }

        const albumResults = await fetch(`/.netlify/functions/getLastfmData?type=topAlbumsByArtist&artist=${encodedArtist}`);
        const albumData = await albumResults.json();

        return {
          tags: data.artist.tags.tag
            .filter(tag => tag.name !== "seen live")
            .slice(0, 3),
          similarArtist: data.artist.similar.artist.slice(0,3),
          topAlbums: albumData.topalbums.album.slice(0, 2),
        };
      })
      .catch(error => {
        console.error(error);
        return null;
      });
  });

  // Resolve all artist promises and create HTML
  return Promise.all(artistPromises)
    .then(async artists => {
      const html = await Promise.all(topArtists.map(async (artist, i) => {
        const q = `${artist.name}`;
        const spotifyResponse = await fetch(`/.netlify/functions/getSpotifySearchResults?type=getArtist&q=${encodeURIComponent(q)}`);
        const spotifyData = await spotifyResponse.json();
        const spotifyArtistID = spotifyData.data.items[0].id;
        const spotifyArtistImgUrl = spotifyData.data.items[0].images[1].url;
        const spotifyGenres = spotifyData.data.items[0].genres.slice(0, 2);


        async function getTopTracks(spotifyArtistID) {
          const topTracksResponse = await fetch(`/.netlify/functions/getSpotifyArtistTopTracks?spotifyArtistID=${spotifyArtistID}`);
          const topTracksData = await topTracksResponse.json();
          return topTracksData.slice(0, 3); // Directly slice the tracks array
        }


        const topTracks = await getTopTracks(spotifyArtistID);

        if (artists[i].summary) {
          return `
            <div class="track_ul">
                <strong><a href="${artist.url}" target="_blank">${artist.name}</a></strong> (${artist.playcount} plays)
                <br>${artists[i].summary}
            </div>
          `;
        } else {
          return `
            <div class="track_ul">
              <img src="${spotifyArtistImgUrl}">
              <div class="no-wrap-text">
                <strong><a href="${artist.url}" target="_blank" class="track_link">${artist.name}</a></strong> (${artist.playcount} plays).
                <br><strong>Genres:</strong> ${artists[i].tags[0].name} and ${artists[i].tags[1].name}. 
                <br><strong>Most popular songs:</strong> ${
                    topTracks && topTracks.length >= 3
                      ? `<a href="https://odesli.co/${topTracks[0].external_urls.spotify}">${topTracks[0].name}</a>, <a href="https://odesli.co/${topTracks[1].external_urls.spotify}">${topTracks[1].name}</a>, and <a href="https://odesli.co/${topTracks[2].external_urls.spotify}">${topTracks[2].name}</a>`
                      : "unknown"
                }.
                <br><strong>Similar artists:</strong> ${
                    artists[i].similarArtist && artists[i].similarArtist.length >= 3
                      ? `<a href="${artists[i].similarArtist[0].url}" target="_blank"">${artists[i].similarArtist[0].name}</a>, <a href="${artists[i].similarArtist[1].url}" target="_blank"">${artists[i].similarArtist[1].name}</a>, and <a href="${artists[i].similarArtist[2].url}" target="_blank">${artists[i].similarArtist[2].name}</a>`
                      : "unknown"
                  }.
              </div>
            </div>
          `;
        }
      }));
      return html.join('');
    })
    .catch(error => console.error(error));
};

Promise.all(lastFMUsernames.map(fetchDataForUser))
  .then(usersData => {
    const lastfmTopArtists = document.querySelector('.js-lastfm-top-artists');

    usersData.forEach(async (userData, index) => {
      const dataContainer = document.createElement('div');
      dataContainer.classList.add('user-data');
      lastfmTopArtists.appendChild(dataContainer);

      const userTitle = document.createElement('h2');
      userTitle.innerText = `Here are ${lastFMUsernames[index]}’s top artists`;
      dataContainer.appendChild(userTitle);

      const html = await displayTopArtists(userData, lastFMUsernames[index]);
      dataContainer.innerHTML += html;
    });
  })
  .catch(error => console.error(error));