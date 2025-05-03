import QRCode from 'qrcode';

export async function makeQr(data: string, path: string) {
    await QRCode.toFile(path, data, {margin: 2});
}
