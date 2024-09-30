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

        // Only extract 'name' and 'dish_type'
        for (const key in recipes) {
            const recipe = {
                key: key,
                name: recipes[key].name,       // Fetch name
                dish_type: recipes[key].dish_type, // Fetch dish type
                dish_category: recipes[key].dish_category // Fetch dish category
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
    const vegTypeDropdown = document.getElementById('veg-type-dropdown');

    // Info icons
    const dishInfoIcon = document.getElementById('dish-info');
    const dishInfoBox = document.getElementById('dish-info-box');
    const vegInfoIcon = document.getElementById('veg-info');
    const vegInfoBox = document.getElementById('veg-info-box');

    // Show search input and dish type dropdown when clicking the search button
    searchButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'flex';
        showAllButton.style.display = 'inline-block';
        searchButton.style.display = 'none';
        dishTypeDropdown.style.display = 'block'; // Show dropdown
        vegTypeDropdown.style.display = 'block'; // Show dropdown
        dishInfoIcon.style.display = 'block'; // Show dish info icon
        vegInfoIcon.style.display = 'block'; // Show veg info icon
    });

    // Show all recipes and hide search input
    showAllButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'none';
        showAllButton.style.display = 'none';
        searchButton.style.display = 'inline-block'; // Show search button
        dishTypeDropdown.style.display = 'none'; // Hide dropdown when showing all recipes
        vegTypeDropdown.style.display = 'none'; // Hide veg dropdown
        dishInfoIcon.style.display = 'none'; // Hide dish info icon
        vegInfoIcon.style.display = 'none'; // Hide veg info icon
        fetchAllRecipes(); // Fetch and display all recipes again
    });

    // Search feature with Firebase handling the filter
    searchRecipeButton.addEventListener('click', () => {
        const searchTerm = searchTermInput.value.trim().toLowerCase();
        const selectedDishType = dishTypeDropdown.value; // Get selected dish type
        const selectedVegType = vegTypeDropdown.value; // Get selected veg/non-veg type

        let queryRef = ref(database, 'recipes');

        // Filter based on dish type and veg/non-veg category
        const queries = [];
        if (selectedDishType) {
            queries.push(query(ref(database, 'recipes'), orderByChild('dish_type'), equalTo(selectedDishType)));
        }
        if (selectedVegType) {
            queries.push(query(ref(database, 'recipes'), orderByChild('dish_category'), equalTo(selectedVegType)));
        }

        // Execute query
        onValue(queryRef, (snapshot) => {
            const recipes = snapshot.val();
            const filteredRecipes = [];

            for (const key in recipes) {
                const recipeName = recipes[key].name.toLowerCase();

                // Filter based on search term and dish type (if both are provided)
                if ((!searchTerm || recipeName.includes(searchTerm)) && 
                    (!selectedVegType || recipes[key].dish_category === selectedVegType) &&
                    (!selectedDishType || recipes[key].dish_type === selectedDishType)) {
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
    });

    // Function to display filtered recipes based on selected dish type
    dishTypeDropdown.addEventListener('change', () => {
        const selectedType = dishTypeDropdown.value; // Get selected dish type
        const selectedVegType = vegTypeDropdown.value; // Get selected veg/non-veg type
        const searchTerm = searchTermInput.value.trim().toLowerCase();

        let queryRef = ref(database, 'recipes');
        
        // Filtering based on selected dish type and veg/non-veg category
        onValue(queryRef, (snapshot) => {
            const recipes = snapshot.val();
            const filteredRecipes = [];

            for (const key in recipes) {
                const recipeName = recipes[key].name.toLowerCase();

                // Add filter for dish type, search term, and veg/non-veg category
                if ((!searchTerm || recipeName.includes(searchTerm)) && 
                    (!selectedVegType || recipes[key].dish_category === selectedVegType) &&
                    (!selectedType || recipes[key].dish_type === selectedType)) {
                    filteredRecipes.push({
                        key: key,
                        name: recipes[key].name,
                        country: recipes[key].country
                    });
                }
            }

            // Show filtered recipes or a message if none found
            displayRecipes(filteredRecipes.length > 0 ? filteredRecipes : [{ name: 'No recipes found.' }]);
        });
    });

    // Function to display filtered recipes based on selected veg/non-veg type
    vegTypeDropdown.addEventListener('change', () => {
        const selectedVegType = vegTypeDropdown.value; // Get selected veg/non-veg type
        const selectedType = dishTypeDropdown.value; // Get selected dish type
        const searchTerm = searchTermInput.value.trim().toLowerCase();

        let queryRef = ref(database, 'recipes');

        onValue(queryRef, (snapshot) => {
            const recipes = snapshot.val();
            const filteredRecipes = [];

            for (const key in recipes) {
                const recipeName = recipes[key].name.toLowerCase();

                // Add filter for veg/non-veg category, search term, and dish type
                if ((!searchTerm || recipeName.includes(searchTerm)) && 
                    (!selectedVegType || recipes[key].dish_category === selectedVegType) &&
                    (!selectedType || recipes[key].dish_type === selectedType)) {
                    filteredRecipes.push({
                        key: key,
                        name: recipes[key].name,
                        country: recipes[key].country
                    });
                }
            }

            // Show filtered recipes or a message if none found
            displayRecipes(filteredRecipes.length > 0 ? filteredRecipes : [{ name: 'No recipes found.' }]);
        });
    });

    // Hover effect for dish info icon
    dishInfoIcon.addEventListener('mouseover', () => {
        dishInfoBox.style.display = 'block';
    });
    dishInfoIcon.addEventListener('mouseout', () => {
        dishInfoBox.style.display = 'none';
    });

    // Hover effect for veg info icon
    vegInfoIcon.addEventListener('mouseover', () => {
        vegInfoBox.style.display = 'block';
    });
    vegInfoIcon.addEventListener('mouseout', () => {
        vegInfoBox.style.display = 'none';
    });
});


// navigation.js
function navigateTo(page) {
    // Get the base URL from the current location
    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    // Redirect to the desired page
    window.location.href = `${baseUrl}/${page}`;
}
