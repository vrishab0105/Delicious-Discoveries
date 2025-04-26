let OPENAI_API_KEY;

async function loadApiKey() {
    try {
        const response = await fetch('/api/openai-key');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        OPENAI_API_KEY = data.apiKey;
        
        if (!OPENAI_API_KEY) {
            throw new Error('API key not found in server response');
        }
    } catch (error) {
        console.error('Error loading API key:', error);
        document.getElementById('recipeResult').innerText = 'Error: Could not load API key from server';
    }
}

loadApiKey();

document.getElementById('getRecipeButton').addEventListener('click', async () => {
    const dishName = document.getElementById('dishInput').value.trim();
    if (!dishName) {
        alert('Please enter a dish name');
        return;
    }

    if (!OPENAI_API_KEY) {
        alert('API key not loaded. Please try again later.');
        return;
    }

    const loadingIndicator = document.getElementById('loadingIndicator');
    const recipeResult = document.getElementById('recipeResult');
    
    loadingIndicator.classList.remove('hidden');
    recipeResult.innerText = '';

    try {
        // First, validate if the input is a dish
        const validationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a validator that checks if the provided input is a food dish. Respond with only "YES" or "NO".'
                    },
                    {
                        role: 'user',
                        content: `Is "${dishName}" a food dish? Only respond with YES or NO.`
                    }
                ],
                temperature: 0.3
            })
        });

        if (!validationResponse.ok) {
            throw new Error(`HTTP error! status: ${validationResponse.status}`);
        }

        const validationData = await validationResponse.json();
        const isValidDish = validationData.choices[0].message.content.trim().toUpperCase() === 'YES';

        if (!isValidDish) {
            recipeResult.innerText = 'Sorry, that doesn\'t appear to be a valid food dish. Please enter a valid dish name.';
            loadingIndicator.classList.add('hidden');
            return;
        }

        // Proceed with the recipe generation if validation passes
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a skilled chef who provides detailed recipes with ingredients and instructions.'
                    },
                    {
                        role: 'user',
                        content: `Please provide a recipe for ${dishName}. Include ingredients list and step-by-step instructions.`
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const recipeText = data.choices[0].message.content;
        recipeResult.innerText = recipeText;
        
        // Show download button
        document.getElementById('downloadSection').classList.remove('hidden');
        
        // Setup download button handler
        document.getElementById('downloadButton').onclick = () => {
            generatePDF(dishName, recipeText);
        };
    } catch (error) {
        console.error('Error:', error);
        recipeResult.innerText = 'Sorry, there was an error generating the recipe. Please try again.';
    } finally {
        loadingIndicator.classList.add('hidden');
    }
});

// Replace the PDF generation function
function generatePDF(dishName, recipeText) {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set initial position and page margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = 40;
    
    // Set font styles for title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    
    // Add title
    doc.text(dishName.toUpperCase(), pageWidth / 2, 20, { align: "center" });
    
    // Reset font for body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Split the recipe text into lines that fit on the page
    const splitText = doc.splitTextToSize(recipeText, pageWidth - (margin * 2));
    
    // Add the text line by line, checking if we need a new page
    for (let i = 0; i < splitText.length; i++) {
        if (currentY > pageHeight - 30) {
            // Add footer to current page
            addFooter(doc, pageWidth, pageHeight);
            
            // Add a new page
            doc.addPage();
            currentY = 20; // Reset Y position for new page
            
            // Add page header if it's not the first page
            doc.setFont("helvetica", "italic");
            doc.setFontSize(12);
            doc.text(`${dishName} (continued)`, margin, currentY);
            currentY += 10;
            
            // Reset font for body
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
        }
        
        doc.text(splitText[i], margin, currentY);
        currentY += 7; // Increase Y position for next line
    }
    
    // Add footer to the last page
    addFooter(doc, pageWidth, pageHeight);
    
    // Save the PDF
    doc.save(`${dishName.toLowerCase().replace(/\s+/g, '-')}-recipe.pdf`);
}

// Helper function to add footer to each page
function addFooter(doc, pageWidth, pageHeight) {
    const pageNumber = doc.internal.getNumberOfPages();
    
    // Add page number
    doc.setFontSize(10);
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10);
    
    // Add footer text
    doc.setFontSize(10);
    doc.text("Generated by Delicious Discoveries", pageWidth / 2, pageHeight - 10, { align: "center" });
}
