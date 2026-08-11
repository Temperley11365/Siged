import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

/**
 * Copies legal text to Clipboard preserving SIGED Judicial Formats:
 * - Margins: Superior 5cm, Izquierdo 5cm, Derecho 1.5cm, Inferior 2.5cm
 * - Typography: Times New Roman 12pt
 * - Interlineado 1.5 & Line Spacing
 * - Justified alignment & Indentation
 * Works across Word, LibreOffice, CKEditor, TinyMCE, and SIGED Portal forms.
 */
export async function copiarTextoConFormatoSiged(texto: string): Promise<boolean> {
  const lineas = texto.split('\n');
  
  const htmlParagraphs = lineas.map((linea) => {
    const trimmed = linea.trim();
    if (!trimmed) {
      return `<p style="margin: 0; padding: 0; min-height: 12pt;">&nbsp;</p>`;
    }
    
    let style = "font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin-bottom: 6pt; text-align: justify;";
    
    if (trimmed.startsWith('PROVEER DE CONFORMIDAD') || trimmed.startsWith('SERÁ JUSTICIA') || trimmed.startsWith('SERA JUSTICIA')) {
      style += " text-align: center; font-weight: bold; margin-top: 18pt; margin-bottom: 18pt;";
    } else if (trimmed === trimmed.toUpperCase() && trimmed.length > 4 && !trimmed.includes('.')) {
      style += " text-align: center; font-weight: bold; margin-top: 14pt; margin-bottom: 14pt;";
    } else if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\./.test(trimmed)) {
      style += " font-weight: bold; margin-top: 12pt; margin-bottom: 6pt;";
    } else {
      style += " text-indent: 1.25cm;";
    }

    return `<p style="${style}">${trimmed}</p>`;
  }).join('');

  const htmlFull = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: A4;
    margin-top: 5cm;
    margin-left: 5cm;
    margin-right: 1.5cm;
    margin-bottom: 2.5cm;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    margin-top: 5cm;
    margin-left: 5cm;
    margin-right: 1.5cm;
    margin-bottom: 2.5cm;
    text-align: justify;
  }
</style>
</head>
<body>
${htmlParagraphs}
</body>
</html>`;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([htmlFull], { type: 'text/html' });
      const blobText = new Blob([texto], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch (err) {
    console.error('Error al copiar con formato HTML:', err);
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Downloads a .docx file strictly formatted for SIGED Judicial presentation:
 * - Page margins: Top 5cm (2835 dxa), Left 5cm (2835 dxa), Right 1.5cm (850 dxa), Bottom 2.5cm (1417 dxa)
 * - Times New Roman 12pt (24 half-pts)
 * - 1.5 line spacing (360)
 * - First-line indent (708 dxa = 1.25cm)
 * - Justified alignment
 */
export async function descargarDocxFormatoSiged(
  texto: string,
  tituloNombre: string = 'Escrito_Judicial_SIGED'
): Promise<void> {
  const lineas = texto.split('\n');

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 2835,    // 5.0 cm = 2835 dxa
              left: 2835,   // 5.0 cm = 2835 dxa (Margen de atado/izquierdo judicial)
              right: 850,   // 1.5 cm = 850 dxa
              bottom: 1417, // 2.5 cm = 1417 dxa
            },
          },
        },
        children: lineas.map((linea) => {
          const trimmed = linea.trim();
          if (!trimmed) {
            return new Paragraph({
              children: [],
              spacing: { after: 120 },
            });
          }

          if (trimmed.startsWith('PROVEER DE CONFORMIDAD') || trimmed.startsWith('SERÁ JUSTICIA') || trimmed.startsWith('SERA JUSTICIA')) {
            return new Paragraph({
              children: [new TextRun({ text: trimmed, bold: true, font: 'Times New Roman', size: 24 })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 280, after: 280, line: 360 },
            });
          }

          if (trimmed === trimmed.toUpperCase() && trimmed.length > 4 && !trimmed.includes('.')) {
            return new Paragraph({
              children: [new TextRun({ text: trimmed, bold: true, font: 'Times New Roman', size: 24 })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200, line: 360 },
            });
          }

          if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\./.test(trimmed)) {
            return new Paragraph({
              children: [new TextRun({ text: trimmed, bold: true, font: 'Times New Roman', size: 24 })],
              alignment: AlignmentType.LEFT,
              spacing: { before: 200, after: 120, line: 360 },
            });
          }

          return new Paragraph({
            children: [new TextRun({ text: linea, font: 'Times New Roman', size: 24 })],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 708 }, // 1.25 cm
            spacing: { line: 360, after: 120 },
          });
        }),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileNameClean = tituloNombre.replace(/[^a-zA-Z0-9_-]/g, '_') + '.docx';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileNameClean;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
