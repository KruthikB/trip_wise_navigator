import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPdf = (element: HTMLElement, fileName: string) => {
  html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate the height of the image in the PDF's units
    const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add new pages if the content overflows
    while (heightLeft > 0) {
      position = -heightLeft;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${fileName}.pdf`);
  });
};
