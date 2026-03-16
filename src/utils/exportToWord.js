import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export sections to a .docx Word document
 * @param {string} title - Document title
 * @param {Array<{label: string, content: string}>} sections - Array of section objects
 */
export async function exportToWord(title, sections) {
  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 32, // 16pt
          font: 'SimSun',
        }),
      ],
      heading: HeadingLevel.HEADING_1,
    })
  );

  // Sections
  sections.forEach((section, index) => {
    // Section heading
    children.push(
      new Paragraph({
        spacing: { before: 300, after: 200 },
        children: [
          new TextRun({
            text: section.label,
            bold: true,
            size: 28, // 14pt
            font: 'SimSun',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
      })
    );

    // Section content - split by newlines to preserve paragraph breaks
    const lines = (section.content || '').split('\n');
    lines.forEach((line) => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt (小四)
              font: 'SimSun',
            }),
          ],
        })
      );
    });
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
}
