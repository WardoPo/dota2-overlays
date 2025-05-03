import retryUntil200 from './request_retry.mjs'

const MATCH_DETAILS_URL = "https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1"

async function getMatchDetails(matchID) {
    return await retryUntil200(MATCH_DETAILS_URL + `?match_id=${matchID}`)
}

export default getMatchDetails