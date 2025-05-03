import PDFDocument from 'pdfkit';
import fs from "fs";

interface SongMeta {
    qrPath: string;
    year: number;
    artist: string;
    title: string;
}

/**
 * Generates a double‑sided A4 PDF with a grid of QR codes on the front and mirrored text blocks on the back.
 * @param items Array of SongMeta objects
 * @param output Path for the output file
 * @param cols Number of columns per page (e.g. 3)
 * @param rows Number of rows per page (e.g. 4) (looks best imo)
 */
export function makePdf(
    items: SongMeta[],
    output: string,
    cols = 3,
    rows = 4
) {
    const doc = new PDFDocument({size: 'A4', margin: 0});
    const stream = fs.createWriteStream(output);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const cardWidth = pageWidth / cols;
    const cardHeight = pageHeight / rows;
    const batchSize = cols * rows;

    for (let i = 0; i < items.length; i += batchSize) {
        const group = items.slice(i, i + batchSize);

        // QR-Codes
        if (i > 0) doc.addPage();
        group.forEach((item, idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const x = col * cardWidth;
            const y = row * cardHeight;
            if (fs.existsSync(item.qrPath)) {
                doc.image(item.qrPath, x + cardWidth * 0.05, y + cardHeight * 0.05, {
                    width: cardWidth * 0.9,
                    height: cardHeight * 0.9
                });
            }
        });

        // Back: Song information mirrored
        doc.addPage();
        group.forEach((item, idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const mirrorCol = cols - 1 - col;
            const x = mirrorCol * cardWidth;
            const y = row * cardHeight;

            doc.fontSize(14)
                .text(`${item.artist} – ${item.title}`, x + cardWidth * 0.05, y + cardHeight * 0.3, {
                    width: cardWidth * 0.9,
                    align: 'center'
                });
            doc.fontSize(12)
                .text(`${item.year}`, x, y + cardHeight * 0.85, {
                    width: cardWidth,
                    align: 'center'
                });
        });
    }

    doc.end();
    stream.on('close', () => console.log('✅ PDF write stream closed.'));
}
