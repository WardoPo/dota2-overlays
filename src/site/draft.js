const DOTA_CDN = "https://cdn.dota2.com/"

heroes = {}

function getHeroSlug(hero_slug) {
    return hero_slug.replace('npc_dota_hero_', '');
}

function getVideoURL(hero_slug) {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero_slug}.webm`;
}

async function fetchStats() {
    try {
        const response = await fetch(`/api/live-stats`);
        response.json().then((data) => {

            // TODO: Filter based on match.game_state

            let radiant_picks = [], dire_picks = [], radiant_bans = [], dire_bans = [];

            if (data.match.picks) {
                radiant_picks = data.match.picks.filter(pick => pick.team === 2);
                dire_picks = data.match.picks.filter(pick => pick.team === 3);
            }

            if (data.match.bans) {
                radiant_bans = data.match.bans.filter(ban => ban.team === 2);
                dire_bans = data.match.bans.filter(ban => ban.team === 3);
            }

            radiant_picks.forEach((element, index, array) => updateVideoSource(element, index, array, 'radiant-pick-'));
            dire_picks.forEach((element, index, array) => updateVideoSource(element, index, array, 'dire-pick-'));

            function updateVideoSource(element, index, array, prefix) {
                const video_url = getVideoURL(getHeroSlug(heroes[element.hero].name));

                let video_element = document.getElementById(`${prefix}${index}`)

                if (video_element.src != video_url) {
                    video_element.src = video_url
                    video_element.parentElement.classList.add('shine')
                };
            }

            radiant_bans.forEach((element, index, array) => updateImageSource(element, index, array, 'radiant-ban-'));
            dire_bans.forEach((element, index, array) => updateImageSource(element, index, array, 'dire-ban-'));

            function updateImageSource(element, index, array, prefix) {
                const img_url = heroes[element.hero].img;

                let img_element = document.getElementById(`${prefix}${index}`)

                img_element.src == img_url ? null : img_element.src = DOTA_CDN + img_url;
            }

        });
    } catch (error) {
        console.error('Error fetching stats: ' + error.message)
    }
}

document.addEventListener('DOMContentLoaded', () => {

    fetch('/api/dotaconstants/heroes').then(response => response.json()).then(data => { heroes = data; console.log(heroes) });

    setInterval(fetchStats, 1000);
});