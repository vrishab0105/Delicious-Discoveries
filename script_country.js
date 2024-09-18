import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

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
    const buttons = document.querySelectorAll('.country-buttons button');
    buttons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const country = e.target.dataset.country;
            await loadRecipesByCountry(country);
        });
    });
});

async function loadRecipesByCountry(country) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = ''; // Clear previous results

    const dbRef = ref(db, 'recipes');
    const countryQuery = query(dbRef, orderByChild('country'), equalTo(country));

    try {
        const snapshot = await get(countryQuery);
        if (snapshot.exists()) {
            const recipes = snapshot.val();
            for (const key in recipes) {
                const recipe = recipes[key];
                const recipeItem = document.createElement('div');
                recipeItem.className = 'recipe-item';
                recipeItem.innerHTML = `
                    <h2>${recipe.name}</h2>
                    <a href="recipe-detail.html?recipe=${encodeURIComponent(recipe.name)}">View Recipe</a>
                `;
                recipeList.appendChild(recipeItem);
            }
        } else {
            recipeList.innerHTML = '<p>No recipes found for this country.</p>';
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipeList.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
    }
}
