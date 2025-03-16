async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const content = document.getElementById("recipe-content");

    // Use html2canvas to capture content as an image
    const canvas = await html2canvas(content, { scale: 2 }); // Increase scale for better quality
    const imgData = canvas.toDataURL("image/png");

    const imgWidth = 180; // Fixed width
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    let yPos = 10; // Start position

    if (imgHeight > 280) { // If content is too long, split into multiple pages
        let pageHeight = 297 - 20; // A4 page height in mm, leaving margins
        let imgChunks = Math.ceil(imgHeight / pageHeight);

        for (let i = 0; i < imgChunks; i++) {
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, yPos - (i * pageHeight), imgWidth, imgHeight);
        }
    } else {
        pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
    }

    pdf.save("recipe.pdf");
}
