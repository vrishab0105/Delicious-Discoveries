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

initializeApp(firebaseConfig);

const db = getDatabase();

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipeId');

    if (recipeId) {
        await loadRecipeDetail(recipeId);
    } else {
        document.getElementById('recipe-content').innerHTML = '<p>Recipe not found.</p>';
    }
});

async function loadRecipeDetail(recipeId) {
    const recipeContent = document.getElementById('recipe-content');

    const dbRef = ref(db, `recipes/${recipeId}`);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const recipe = snapshot.val();
            recipeContent.innerHTML = `
                <h2>${recipe.name}</h2>
                <p><strong>Ingredients:</strong></p>
                <ul>${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>
                <p><strong>Steps:</strong></p>
                <ol>${recipe.steps.map(step => `<li>${step}</li>`).join('')}</ol>
            `;
        } else {
            recipeContent.innerHTML = '<p>Recipe not found.</p>';
        }
    } catch (error) {
        console.error('Error loading recipe detail:', error);
        recipeContent.innerHTML = '<p>Error loading recipe. Please try again later.</p>';
    }
}
