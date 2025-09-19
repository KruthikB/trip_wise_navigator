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
    const ratio = canvasWidth / canvasHeight;
    const width = pdfWidth;
    const height = width / ratio;

    let position = 0;
    let heightLeft = (height * pdfWidth) / width;
    
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, (height * pdfWidth) / width );
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - ((height * pdfWidth) / width);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, (height * pdfWidth) / width );
      heightLeft -= pdfHeight;
    }

    pdf.save(`${fileName}.pdf`);
  });
};
