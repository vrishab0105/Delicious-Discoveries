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

    // Show the recipe list
    recipeList.style.display = recipes.length > 0 ? 'block' : 'none';
}

// Initialize an array to store unique dish types
const uniqueDishTypes = new Set();

// Function to fetch all recipes and dish types
function fetchAllRecipes() {
    const recipeRef = ref(database, 'recipes');
    onValue(recipeRef, (snapshot) => {
        const recipes = snapshot.val();
        const recipeArray = Object.keys(recipes).map(key => ({
            key: key,
            name: recipes[key].name,
            country: recipes[key].country,
            dish_type: recipes[key].dish_type // Include dish_type here
        }));

        // Collect unique dish types
        recipeArray.forEach(recipe => {
            uniqueDishTypes.add(recipe.dish_type);
        });

        // Populate the dropdown menu
        populateDishTypeDropdown(uniqueDishTypes);

        // Sort the recipe array alphabetically by name
        recipeArray.sort((a, b) => a.name.localeCompare(b.name));

        // Display all recipes
        displayRecipes(recipeArray);
    });
}

// Function to populate the dish type dropdown
function populateDishTypeDropdown(dishTypes) {
    const dishTypeDropdown = document.getElementById('dish-type-dropdown');
    dishTypeDropdown.innerHTML = ''; // Clear existing options
    dishTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        dishTypeDropdown.appendChild(option);
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
    const dishTypeDropdown = document.getElementById('dish-type-dropdown');

    // Hide the dropdown by default
    dishTypeDropdown.style.display = 'none';

    // Show search input and dish type dropdown when clicking the search button
    searchButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'flex';
        showAllButton.style.display = 'inline-block';
        searchButton.style.display = 'none'; // Hide search button
        dishTypeDropdown.style.display = 'block'; // Show dropdown
    });

    // Show all recipes and hide search input
    showAllButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'none';
        showAllButton.style.display = 'none';
        searchButton.style.display = 'inline-block'; // Show search button
        dishTypeDropdown.style.display = 'none'; // Hide dropdown when showing all recipes
        fetchAllRecipes(); // Fetch and display all recipes again
    });

    // Search feature with Firebase handling the filter
searchRecipeButton.addEventListener('click', () => {
    const searchTerm = searchTermInput.value.trim().toLowerCase();
    const selectedType = dishTypeDropdown.value; // Get selected dish type

    let queryRef = ref(database, 'recipes');

    if (searchTerm) {
        // If both search term and dish type are provided
        if (selectedType) {
            queryRef = ref(database, 'recipes', {
                orderByChild: 'dish_type',
                equalTo: selectedType
            });
        }

        // Execute query
        onValue(queryRef, (snapshot) => {
            const recipes = snapshot.val();
            const filteredRecipes = [];

            for (const key in recipes) {
                const recipeName = recipes[key].name.toLowerCase();

                // Filter based on search term only
                if (recipeName.includes(searchTerm)) {
                    filteredRecipes.push({
                        key: key,
                        name: recipes[key].name,
                        country: recipes[key].country
                    });
                }
            }

            // Show the filtered recipes or a message if none found
            displayRecipes(filteredRecipes.length > 0 ? filteredRecipes : [{ name: 'No recipes found.' }]);
        });
    }
});

// Function to display filtered recipes based on selected dish type
dishTypeDropdown.addEventListener('change', () => {
    const selectedType = dishTypeDropdown.value; // Get selected dish type

    if (selectedType) {
        // Query Firebase to get recipes of the selected dish type
        const queryRef = ref(database, 'recipes');
        
        // Listen for data and filter it by dish type
        onValue(queryRef, (snapshot) => {
            const recipes = snapshot.val();
            const filteredRecipes = [];

            for (const key in recipes) {
                if (recipes[key].dish_type === selectedType) {
                    filteredRecipes.push({
                        key: key,
                        name: recipes[key].name,
                        country: recipes[key].country
                    });
                }
            }

            // Show the filtered recipes or a message if none are found
            displayRecipes(filteredRecipes.length > 0 ? filteredRecipes : [{ name: 'No recipes found.' }]);
        });
    } else {
        // If no dish type is selected, fetch and show all recipes
        fetchAllRecipes();
    }
});


});
