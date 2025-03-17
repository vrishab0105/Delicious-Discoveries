import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyASQtEDg7g5koc-H-d6W1kGcW0k-vE-TSY",
   authDomain: "deliciousdiscoveries04.firebaseapp.com",
   projectId: "deliciousdiscoveries04",
   storageBucket: "deliciousdiscoveries04.appspot.com",
   messagingSenderId: "699923003257",
   appId: "1:699923003257:web:e2800b973a35db246ee1a8",
   measurementId: "G-BDWV430X2H",
   databaseURL: "https://deliciousdiscoveries04.firebaseio.com" // Add correct database URL
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getDatabase();

// Helper function to capitalize the first letter of each word
function capitalizeFirstLetter(str) {
    if (str && typeof str === 'string') {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }
    return ''; // Return an empty string if undefined or not a string
}

// Load recipe details when the page is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipeId');

    if (recipeId) {
        await loadRecipeDetail(recipeId);
    } else {
        document.getElementById('recipe-content').innerHTML = '<p>Recipe not found.</p>';
    }
});

// Function to load and display the recipe details
async function loadRecipeDetail(recipeId) {
    const recipeContent = document.getElementById('recipe-content');

    const dbRef = ref(db, `recipes/${recipeId}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const recipe = snapshot.val();

            // Safely get dish_type and dish_category, handle undefined or missing data
            const dishType = capitalizeFirstLetter(recipe.dish_type || '');
            const dishCategory = capitalizeFirstLetter(recipe.dish_category || '');
            
            // Get the image URL from the database (assuming the key is 'image')
            const imageUrl = recipe.image; // Ensure the image URL is stored in your Firebase as 'image'

            // Display the recipe details dynamically
            recipeContent.innerHTML = `
                <center>
                <h2>${recipe.name}</h2>
                <img src="${imageUrl}" alt="${recipe.name}" style="max-width: 20vw; height: auto;">
                <p><strong>Country:</strong> ${recipe.country}</p>
                <p><strong>Dish Type:</strong> ${dishType}</p>
                <p><strong>Dish Category:</strong> ${dishCategory}</p>
                <p><strong>Ingredients:</strong></p>
                <ul>${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>
                <p><strong>Steps:</strong></p>
                <ol>${recipe.steps.map(step => `<li>${step}</li>`).join('')}</ol>
                </center>
                
            `;
        } else {
            recipeContent.innerHTML = '<p>Recipe not found.</p>';
        }
    } catch (error) {
        console.error('Error loading recipe detail:', error);
        recipeContent.innerHTML = '<p>Error loading recipe. Please try again later.</p>';
    }
}


// Function to download recipe details as a PDF with an image
window.downloadPDF = async function () {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const recipeElement = document.getElementById('recipe-content');
    if (!recipeElement) {
        console.error("Recipe content not found!");
        return;
    }

    try {
        // Extract details from the recipe page
        const recipeName = recipeElement.querySelector("h2")?.innerText || "Recipe";
        const country = recipeElement.querySelector("p:nth-of-type(1)")?.innerText || "";
        const dishType = recipeElement.querySelector("p:nth-of-type(2)")?.innerText || "";
        const dishCategory = recipeElement.querySelector("p:nth-of-type(3)")?.innerText || "";

        const ingredientsList = Array.from(recipeElement.querySelectorAll("ul li")).map(li => li.innerText);
        const stepsList = Array.from(recipeElement.querySelectorAll("ol li")).map(li => li.innerText);

        // Get image URL
        const imageUrl = document.querySelector("#recipe-content img")?.src || "";

        // Add title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text(recipeName, 10, 20);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text(country, 10, 30);
        pdf.text(dishType, 10, 40);
        pdf.text(dishCategory, 10, 50);

        // Add ingredients
        pdf.setFont("helvetica", "bold");
        pdf.text("Ingredients:", 10, 60);
        pdf.setFont("helvetica", "normal");

        let y = 70;
        ingredientsList.forEach((ingredient, index) => {
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            pdf.text(`- ${ingredient}`, 10, y);
            y += 10;
        });

        // Add steps
        pdf.setFont("helvetica", "bold");
        pdf.text("Steps:", 10, y + 10);
        pdf.setFont("helvetica", "normal");

        y += 20;
        stepsList.forEach((step, index) => {
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            pdf.text(`${index + 1}. ${step}`, 10, y);
            y += 10;
        });

        // Add image if available
        if (imageUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Ensure CORS for external images
            img.src = imageUrl;

            img.onload = function () {
                const imgWidth = 60;
                const imgHeight = (img.height / img.width) * imgWidth;
                pdf.addImage(img, "JPEG", 140, 20, imgWidth, imgHeight);
                pdf.save(`${recipeName}.pdf`);
            };

            img.onerror = function () {
                console.error("Failed to load image.");
                pdf.save(`${recipeName}.pdf`);
            };
        } else {
            pdf.save(`${recipeName}.pdf`);
        }
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};
