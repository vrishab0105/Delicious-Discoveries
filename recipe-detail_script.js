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

// Function to navigate between pages
window.navigateTo = function(page) {
    window.location.href = page;
};

// Load recipe details when the page is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipeId');

    if (recipeId) {
        await loadRecipeDetail(recipeId);
    } else {
        document.getElementById('recipe-content').innerHTML = '<p>Recipe not found.</p>';
    }
    
    // Set logo source
    const logoImg = document.getElementById('navbar-logo');
    if (logoImg) {
        logoImg.src = "photos/logo.jpeg";
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
            
            // Get the image URL from the database
            const imageUrl = recipe.image || '';

            // Create HTML content with enhanced layout and styling
            recipeContent.innerHTML = `
                <div class="recipe-header">
                    <h2>${recipe.name}</h2>
                    <img src="${imageUrl}" alt="${recipe.name}" class="recipe-image">
                </div>
                
                <div class="recipe-details">
                    <p><strong>Country:</strong> ${recipe.country}</p>
                    <p><strong>Dish Type:</strong> ${dishType}</p>
                    <p><strong>Dish Category:</strong> ${dishCategory}</p>
                    <p><strong>Meal Category:</strong> ${recipe.meal_category || ''}</p>
                </div>
                
                <div class="ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                        ${recipe.ingredients ? recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('') : ''}
                    </ul>
                </div>
                
                <div class="steps">
                    <h3>Steps</h3>
                    <ol>
                        ${recipe.steps ? recipe.steps.map(step => `<li>${step}</li>`).join('') : ''}
                    </ol>
                </div>
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
        const country = recipeElement.querySelector(".recipe-details p:nth-of-type(1)")?.innerText || "";
        const dishType = recipeElement.querySelector(".recipe-details p:nth-of-type(2)")?.innerText || "";
        const dishCategory = recipeElement.querySelector(".recipe-details p:nth-of-type(3)")?.innerText || "";

        const ingredientsList = Array.from(recipeElement.querySelectorAll(".ingredients li")).map(li => li.innerText);
        const stepsList = Array.from(recipeElement.querySelectorAll(".steps li")).map(li => li.innerText);

        // Get image URL
        const imageUrl = document.querySelector(".recipe-image")?.src || "";

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
            
            // Wrap text to ensure it fits on the page
            const splitText = pdf.splitTextToSize(`${index + 1}. ${step}`, 180);
            pdf.text(splitText, 10, y);
            y += 10 * splitText.length;
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
        alert("Error generating PDF. Please try again.");
    }
};
