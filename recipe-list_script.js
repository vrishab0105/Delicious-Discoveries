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

// Function to display recipes
function displayRecipes(recipes) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';

    recipes.forEach(recipe => {
        const recipeItem = document.createElement('li');
        recipeItem.textContent = recipe.name;
        recipeItem.addEventListener('click', () => {
            window.location.href = `recipe-detail.html?recipeId=${recipe.key}`;
        });

        recipeList.appendChild(recipeItem);
    });
}

// Function to fetch and display all recipes
function fetchAllRecipes() {
    const recipeRef = ref(database, 'recipes');
    onValue(recipeRef, (snapshot) => {
        const recipes = snapshot.val();
        const recipeArray = Object.keys(recipes).map(key => ({
            key: key,
            name: recipes[key].name,
            country: recipes[key].country
        }));

        // Sort the recipe array alphabetically by name
        recipeArray.sort((a, b) => a.name.localeCompare(b.name));

        // Display all recipes
        displayRecipes(recipeArray);
    });
}

// Fetch recipes by country
function fetchRecipesByCountry(selectedCountry) {
    const recipeRef = ref(database, 'recipes');
    onValue(recipeRef, (snapshot) => {
        const recipes = snapshot.val();
        const filteredRecipes = [];

        for (const key in recipes) {
            if (recipes[key].country === selectedCountry) {
                filteredRecipes.push({
                    key: key,
                    name: recipes[key].name,
                    country: recipes[key].country
                });
            }
        }

        displayRecipes(filteredRecipes.length > 0 ? filteredRecipes : [{ name: "No recipes found." }]);
    });
}

// Initial fetch of all recipes
fetchAllRecipes();

document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-dish-btn');
    const showAllButton = document.getElementById('show-all-btn');
    const searchInputContainer = document.getElementById('search-input-container');
    const searchRecipeButton = document.getElementById('search-recipe-btn');
    const searchTermInput = document.getElementById('search-term');
    const countryDropdown = document.getElementById('dish-type'); // Get the dropdown for country filtering

    // Show search input when clicking the search button
    searchButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'flex';
        showAllButton.style.display = 'inline-block';
        searchButton.style.display = 'none'; // Hide search button
    });

    // Show all recipes and hide search input
    showAllButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'none';
        showAllButton.style.display = 'none';
        searchButton.style.display = 'inline-block'; // Show search button
        fetchAllRecipes(); // Fetch and display all recipes again
    });

    // Search feature
    searchRecipeButton.addEventListener('click', () => {
        const searchTerm = searchTermInput.value.trim().toLowerCase();

        if (searchTerm) {
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

                displayRecipes(filteredRecipes.length > 0 ? filteredRecipes : [{ name: "No recipes found." }]);
            });
        }
    });

    // Filter recipes by country
    countryDropdown.addEventListener('change', () => {
        const selectedCountry = countryDropdown.value;
        if (selectedCountry) {
            fetchRecipesByCountry(selectedCountry);
        } else {
            fetchAllRecipes(); // If no country is selected, show all recipes
        }
    });
});
