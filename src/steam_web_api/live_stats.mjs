import retryUntil200 from './request_retry.mjs'

const LIVE_STATS_URL = "https://api.steampowered.com/IDOTA2MatchStats_570/GetRealtimeStats/v1"

async function getLiveGameStats(serverSteamID) {

    return await retryUntil200(LIVE_STATS_URL + `?server_steam_id=${serverSteamID}&format=json`)

}

export default getLiveGameStats