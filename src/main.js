import _ from 'lodash';
import i18n from './i18n';

const twitchClientId = {
  'Client-ID': '2p71xs0ppf74z0e2zk9ke9w9c7o16x'
};
const defaultLang = 'zh';
let currentLang = defaultLang;
let pagination = '';
let isLoading = false;


const showTitle = (lang) => {
  document.querySelector('.main-heading').textContent = i18n[lang].TITLE;
}


async function getStreamList(queryString) {
  isLoading = true;
  let api_url = 'https://api.twitch.tv/helix/streams?game_id=21779&language=' + queryString;
  const response = await fetch(api_url, {
    headers: new Headers(twitchClientId)
  });
  const streams = await response.json();
  const {data} = streams;
  pagination = streams.pagination.cursor;
  data.forEach(item => {
    displayStreamList(item);
  });
  isLoading = false;
}


// get Twitch user profile image and login id
async function getHost(hostID) {
  const response = await fetch(`https://api.twitch.tv/helix/users?id=${hostID}`, {
    headers: new Headers(twitchClientId)
  });
  const userData = await response.json();
  const profileImgUrl = userData.data[0].profile_image_url;
  const loginId = userData.data[0].login;
  return [profileImgUrl, loginId];
}


async function displayStreamList(item) {
  let profileImgUrl, loginId;
  await getHost(item.user_id).then(response => {
    [profileImgUrl, loginId] = response;
  }).catch(err => console.log(err));
  
  const urlToStream = 'https://www.twitch.tv/' + loginId;
  const livesContainer = document.getElementById('lives-container');
  livesContainer.innerHTML += 
  `
    <div class="live">
      <div class="live__scene">
        <a href="${urlToStream}" target="_blank">
          <img class="live__picture" src="${item.thumbnail_url.replace('{width}x{height}', '800x450')}"
            alt="live scene">
        </a>
      </div>
      <div class="live__detail">
        <img class="live__host-photo" src="${profileImgUrl}" alt="host">
        <div class="live__text">
          <p class="live__channel-name">${item.title}</p>
          <p class="live__host-name">${item.user_name}</p>
        </div>
      </div>
    </div>
  `;
}


const changeLang = (lang) => {
  const livesContainer = document.getElementById('lives-container');
  if (lang !== currentLang) {
    currentLang = lang;
    while (livesContainer.firstChild) {
      livesContainer.removeChild(livesContainer.firstChild);
    }
    showTitle(lang);
    getStreamList(lang);
  }
}


// Prevent scroll event triggered repeatedly within a short time.
const scrollToBottom = _.debounce(() => {
  if (window.pageYOffset + window.innerHeight >= document.body.offsetHeight - 200 && isLoading === false) {
    getStreamList(currentLang + '&after=' + pagination);
  }
}, 500);


window.onscroll = () => {
  scrollToBottom();
};


// Language select buttons
document.getElementById('lang-zh').addEventListener('click', () => {
  changeLang('zh')
});
document.getElementById('lang-en').addEventListener('click', () => {
  changeLang('en')
});
document.getElementById('lang-jp').addEventListener('click', () => {
  changeLang('ja')
});


//  App entry point
  showTitle(currentLang);
  getStreamList(currentLang).catch(err => console.log(err));