async function downloadPDF() {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const content = document.getElementById("recipe-content");
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, 'PNG', 10, 10, 180, 0);
    pdf.save("page-content.pdf");
}