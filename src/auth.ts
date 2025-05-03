import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import open from 'open';
import SpotifyWebApi from 'spotify-web-api-node';

const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI!
});

const scopes = ['user-read-playback-state', 'user-modify-playback-state'];
const app = express();
const authUrl = spotify.createAuthorizeURL(scopes, 'state');

open(authUrl).then(r => console.log('Browser opened:', r)).catch(err => console.error('Error opening browser:', err));

app.get('/callback', async (req, res) => {
    const code = req.query.code as string;
    try {
        const data = await spotify.authorizationCodeGrant(code);
        const tokens = {
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token
        };
        fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2), 'utf-8');
        console.log('✅ Tokens saved to tokens.json');
        res.send('Authentication successful! You can close this tab.');
        process.exit(0);
    } catch (err) {
        console.error('Error getting Tokens:', err);
        res.status(500).send('Authentication failed');
    }
});

app.listen(8888, () => console.log('Listening on http://127.0.0.1:8888'));
