import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import getMatchDetails from './src/steam_web_api/match_details.mjs';
import getLiveGameStats from './src/steam_web_api/live_stats.mjs';

import dotaconstants from 'dotaconstants';

const PORT = 3000;

const baseDir = path.join('src');

var steam_server_id = null;
var live_stats = null;


const server = http.createServer(async (req, res) => {

    const parsedUrl = url.parse(req.url, true);

    //API Paths

    switch (parsedUrl.pathname) {
        case '/api/get-match-details':
            return await getMatchDetails_API_wrapper();
        case '/api/live-stats':
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(live_stats))
            return
        case '/api/set-steam-server-id':
            return setSteamServerID();
        case '/api/dotaconstants/heroes':
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(dotaconstants.heroes));
            return;
        default:
            break
    }

    // API Wrappers

    async function getMatchDetails_API_wrapper() {
        const matchID = parsedUrl.query.matchID;

        if (!matchID) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing matchID parameter' }));
            return;
        }

        try {
            const data = await getMatchDetails(matchID);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch match details' }));
        }
        return;
    }

    // API Functions

    function setSteamServerID() {
        const serverSteamID = parsedUrl.query.serverSteamID;

        if (!serverSteamID) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing serverSteamID parameter' }));
            return;
        }

        steam_server_id = serverSteamID
        console.debug(`Steam server ID set to: ${steam_server_id}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Steam server ID set successfully' }));
    }

    // Static File Server

    let filePath = path.join(baseDir, req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1>');
            }
        } else {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.mjs': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
            };

            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // Server Functions

    setInterval(() => {

        if (steam_server_id) {
            getLiveGameStats(steam_server_id).then((data) => {
                live_stats = data;
                console.log('Live stats updated');
            }).catch((error) => {
                console.error('Error fetching live stats:', error);
            });
        } else {
            console.log('No Steam server ID set');
        }

    }, 1000);
});