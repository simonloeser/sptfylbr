/**
 * Spotify QR Code Generator CLI cmd:
 * pnpm exec ts-node src/cli.ts --from-year 2001 --to-year 2010 --genre rock --min-popularity 50 --limit 12 --token tokens.json
 */

import {Command} from 'commander';
import {makeQr} from './generateQR';
import {makePdf} from './generatePDF';
import {setTokens, refreshAccessToken, searchTracks} from './spotify';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const program = new Command();
program
    .option('--from-year <n>', '', parseInt)
    .option('--to-year <n>', '', parseInt)
    .option('--genre <g>', '')
    .option('--min-popularity <number>', '', val => parseInt(val), 50)
    .option('--limit <l>', '', parseInt, 10)
    .option('--token <f>', '', 'tokens.json')
    .parse(process.argv);

const opts = program.opts();

async function loadAndRefreshTokens() {
    const file = opts.token;
    if (!fs.existsSync(file)) throw new Error(`Token file not found: ${file}`);
    const tokens = JSON.parse(fs.readFileSync(file, 'utf-8'));
    setTokens(tokens);
    const newToken = await refreshAccessToken();
    fs.writeFileSync(file, JSON.stringify({accessToken: newToken, refreshToken: tokens.refreshToken}, null, 2));
}

async function main() {
    await loadAndRefreshTokens();
    const offset = Math.floor(Math.random() * 50);
    const tracks = await searchTracks(opts.genre, opts.fromYear, opts.toYear, opts.minPopularity, opts.limit, offset);
    if (tracks.length === 0) {
        console.error('❌ No songs found.');
        process.exit(1);
    }
    fs.mkdirSync('output', {recursive: true});
    const items = [];
    for (const t of tracks) {
        const uri = t.external_urls.spotify;
        const qrPath = `output/${t.id}.png`;
        await makeQr(uri, qrPath);
        items.push({qrPath, year: +t.album.release_date.slice(0, 4), artist: t.artists[0].name, title: t.name});
    }
    makePdf(items, path.join('output', 'songs.pdf'));
    console.log(`✅ Finished: ${items.length} Songs in output/songs.pdf`);
}

main().catch(e => {
    console.error('❌', e);
    process.exit(1);
});
