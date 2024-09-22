// Import Firebase functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyASQtEDg7g5koc-H-d6W1kGcW0k-vE-TSY",
    authDomain: "deliciousdiscoveries04.firebaseapp.com",
    projectId: "deliciousdiscoveries04",
    storageBucket: "deliciousdiscoveries04.appspot.com",
    messagingSenderId: "699923003257",
    appId: "1:699923003257:web:e2800b973a35db246ee1a8",
    measurementId: "G-BDWV430X2H",
    databaseURL: "https://deliciousdiscoveries04.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Function to fetch and display recipe names in alphabetical order
document.addEventListener('DOMContentLoaded', function () {
    const recipeList = document.getElementById('recipe-list');

    // Reference to the 'recipes' node in your Firebase Realtime Database
    const recipeRef = ref(database, 'recipes');

    // Fetch the recipe names from Firebase
    onValue(recipeRef, (snapshot) => {
        const recipes = snapshot.val();

        // Get an array of recipe objects with keys and country attribute
        const recipeArray = Object.keys(recipes).map(key => ({
            key: key,
            name: recipes[key].name,
            country: recipes[key].country // Include the country attribute
        }));

        // Sort the recipe array alphabetically by name
        recipeArray.sort((a, b) => a.name.localeCompare(b.name));

        // Display all recipes initially
        displayRecipes(recipeArray);
    });

    // Function to display recipes
    function displayRecipes(recipes) {
        // Clear the existing list
        recipeList.innerHTML = '';

        // Loop through the sorted recipes and create list items for each
        recipes.forEach(recipe => {
            const recipeItem = document.createElement('li');
            recipeItem.textContent = recipe.name;

            // When a recipe is clicked, redirect to recipe-detail.html with the recipe key
            recipeItem.addEventListener('click', () => {
                window.location.href = `recipe-detail.html?recipeId=${recipe.key}`;
            });

            recipeList.appendChild(recipeItem);
        });
    }

    // Search feature
    const searchButton = document.getElementById('search-recipe-btn');
    const searchTermInput = document.getElementById('search-term');

    searchButton.addEventListener('click', () => {
        const searchTerm = searchTermInput.value.trim().toLowerCase();

        if (searchTerm) {
            // Query Firebase for recipes that match the search term
            const recipeRef = ref(database, 'recipes');
            onValue(recipeRef, (snapshot) => {
                const recipes = snapshot.val();
                const filteredRecipes = [];

                for (const key in recipes) {
                    const recipeName = recipes[key].name.toLowerCase();
                    if (recipeName.includes(searchTerm)) {
                        filteredRecipes.push({
                            key: key,
                            name: recipes[key].name,
                            country: recipes[key].country
                        });
                    }
                }

                if (filteredRecipes.length > 0) {
                    displayRecipes(filteredRecipes);
                } else {
                    recipeList.innerHTML = '<li>No recipes found.</li>';
                }
            });
        }
    });
});
