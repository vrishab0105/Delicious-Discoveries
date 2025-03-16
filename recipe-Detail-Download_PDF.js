async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const content = document.getElementById("recipe-content");

    // Ensure all images have cross-origin set
    const images = content.getElementsByTagName("img");
    for (let img of images) {
        img.crossOrigin = "anonymous"; // Set CORS attribute
    }

    // Capture the content using html2canvas
    const canvas = await html2canvas(content, {
        scale: 2,       // Higher scale for better quality
        useCORS: true,  // Allow external images
        logging: true   // Debugging logs
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, 'PNG', 10, 10, 180, 0);
    pdf.save("recipe.pdf");
}
