// Import Firebase functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
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

    // Sort recipes alphabetically by name
    recipes.sort((a, b) => a.name.localeCompare(b.name));

    recipes.forEach(recipe => {
        const recipeItem = document.createElement('li');

        if (recipe.key) { 
            // Only make it clickable if a valid recipe is found
            recipeItem.textContent = recipe.name;
            recipeItem.addEventListener('click', () => {
                window.location.href = `recipe-detail.html?recipeId=${recipe.key}`;
            });
        } else {
            // Display "No recipes found" without making it clickable
            recipeItem.textContent = recipe.name;
            recipeItem.style.color = 'gray';  // Optional: Make the text look different
        }

        recipeList.appendChild(recipeItem);
    });

    // Show the recipe list
    recipeList.style.display = recipes.length > 0 ? 'block' : 'none';
}

// Function to fetch all recipes (fetch only necessary fields)
function fetchAllRecipes() {
    const recipeRef = ref(database, 'recipes');
    
    // Use onValue to fetch the data
    onValue(recipeRef, (snapshot) => {
        const recipes = snapshot.val();
        const recipeArray = [];

        // Only extract 'name', 'dish_type', and 'veg_type'
        for (const key in recipes) {
            const recipe = {
                key: key,
                name: recipes[key].name,       // Fetch name
                dish_type: recipes[key].dish_type, // Fetch dish type
                veg_type: recipes[key].veg_type  // Fetch veg/non-veg type
            };
            recipeArray.push(recipe);
        }

        // Populate the dish type dropdown with unique dish types
        const uniqueDishTypes = new Set(recipeArray.map(recipe => recipe.dish_type));
        populateDishTypeDropdown(uniqueDishTypes);

        // Display the fetched recipes (will be sorted in displayRecipes)
        displayRecipes(recipeArray);
    });
}

// Function to populate the dish type dropdown
function populateDishTypeDropdown(dishTypes) {
    const dishTypeDropdown = document.getElementById('dish-type-dropdown');
    dishTypeDropdown.innerHTML = ''; // Clear existing options

    // Add default 'None' option to show all dishes
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = 'None';
    dishTypeDropdown.appendChild(noneOption);

    // Add other dish types
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
    const vegTypeDropdown = document.getElementById('veg-type-dropdown'); // New dropdown for Veg/Non-Veg

    // Hide the dropdowns by default
    dishTypeDropdown.style.display = 'none';
    vegTypeDropdown.style.display = 'none';

    // Show search input and dish type dropdown when clicking the search button
    searchButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'flex';
        showAllButton.style.display = 'inline-block';
        searchButton.style.display = 'none'; // Hide search button
        dishTypeDropdown.style.display = 'block'; // Show dish type dropdown
        vegTypeDropdown.style.display = 'block';  // Show veg/non-veg dropdown
    });

    // Show all recipes and hide search input
    showAllButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'none';
        showAllButton.style.display = 'none';
        searchButton.style.display = 'inline-block'; // Show search button
        dishTypeDropdown.style.display = 'none'; // Hide dropdown when showing all recipes
        vegTypeDropdown.style.display = 'none';   // Hide veg/non-veg dropdown
        fetchAllRecipes(); // Fetch and display all recipes again
    });

    // Search feature with Firebase handling the filter
    searchRecipeButton.addEventListener('click', () => {
        const searchTerm = searchTermInput.value.trim().toLowerCase();
        const selectedType = dishTypeDropdown.value; // Get selected dish type
        const selectedVegType = vegTypeDropdown.value; // Get selected veg/non-veg type

        let queryRef = ref(database, 'recipes');

        if (selectedType || selectedVegType || searchTerm) {
            // If search term, dish type, or veg type is provided
            queryRef = query(ref(database, 'recipes'), orderByChild('dish_type'), equalTo(selectedType));

            // Execute query
            onValue(queryRef, (snapshot) => {
                const recipes = snapshot.val();
                const filteredRecipes = [];

                for (const key in recipes) {
                    const recipeName = recipes[key].name.toLowerCase();
                    const isVegMatch = !selectedVegType || recipes[key].veg_type === selectedVegType;

                    // Filter based on search term, dish type, and veg type
                    if (recipeName.includes(searchTerm) && isVegMatch) {
                        filteredRecipes.push({
                            key: key,
                            name: recipes[key].name,
                            country: recipes[key].country
                        });
                    }
                }

                // Show the filtered recipes (sorted by name) or a message if none found
                displayRecipes(filteredRecipes.length > 0 ? filteredRecipes : [{ name: 'No recipes found.' }]);
            });
        }
    });

    // Function to display filtered recipes based on selected dish type or veg type
    dishTypeDropdown.addEventListener('change', () => {
        searchRecipeButton.click();  // Trigger search button click on dish type change
    });

    vegTypeDropdown.addEventListener('change', () => {
        searchRecipeButton.click();  // Trigger search button click on veg/non-veg change
    });
});
