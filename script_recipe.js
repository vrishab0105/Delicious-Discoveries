import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDa84aF-8FeNYVuxB1b3ffPNvY1-KspQFk",
    authDomain: "receipe-e56ae.firebaseapp.com",
    databaseURL: "https://receipe-e56ae-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "receipe-e56ae",
    storageBucket: "receipe-e56ae.appspot.com",
    messagingSenderId: "513489179455",
    appId: "1:513489179455:web:7f26b4734f99854704798a",
    measurementId: "G-C75XCMJKKE"
};

initializeApp(firebaseConfig);

const db = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeName = urlParams.get('recipe');
    if (recipeName) {
        loadRecipeDetail(recipeName);
    }
});

async function loadRecipeDetail(recipeName) {
    const recipeDetail = document.getElementById('recipe-detail');
    const dbRef = ref(db, `recipes/${recipeName}`);
    
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const recipe = snapshot.val();
            recipeDetail.innerHTML = `
                <h2>${recipe.name}</h2>
                <h3>Ingredients:</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
                <h3>Steps:</h3>
                <ol>
                    ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            `;
        } else {
            recipeDetail.innerHTML = '<p>Recipe not found.</p>';
        }
    } catch (error) {
        console.error('Error loading recipe:', error);
        recipeDetail.innerHTML = '<p>Error loading recipe. Please try again later.</p>';
    }
}
