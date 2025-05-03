import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';

dotenv.config();

export const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export function setTokens(tokens: { accessToken: string; refreshToken: string; }) {
    spotify.setAccessToken(tokens.accessToken);
    spotify.setRefreshToken(tokens.refreshToken);
}

export async function refreshAccessToken(): Promise<string> {
    const data = await spotify.refreshAccessToken();
    const newToken = data.body.access_token;
    spotify.setAccessToken(newToken);
    return newToken;
}

/**
 * Search for tracks on Spotify based on genre, year range, and popularity.
 */
export async function searchTracks(
    genre: string,
    fromYear: number,
    toYear: number,
    minPopularity: number,
    limit: 20,
    offset = 0
): Promise<any[]> {
    console.log('Genre: ' + genre + ', Year: ' + fromYear + '-' + toYear + ', minPopularity: ' +
        minPopularity + ', Amount: ' + limit + ', Offset: ' + offset);
    const query = `genre:\"${genre}\" year:${fromYear}-${toYear}`;
    const res = await spotify.searchTracks(query, {limit, offset});
    const items = res.body.tracks?.items || [];
    return items.filter(t => t.popularity >= minPopularity);
}
