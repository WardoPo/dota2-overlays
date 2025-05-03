import fs from 'fs';

const API_KEY = fs.readFileSync('src/steam_web_api/API KEY', 'utf8').trim();

function authenticate(url){
    /**
     * Appends the `key` parameter to the given URL
     */
        return url+`&key=${API_KEY}`
}

export default authenticate