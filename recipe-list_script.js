// Import Firebase functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue, query, orderByChild, equalTo, get, child } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
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

// Function to fetch necessary recipe metadata (only fetch required fields)
function fetchAllRecipes() {
    // Create a reference to the recipes node
    const recipeRef = ref(database, 'recipes');
    
    // Use get instead of onValue to retrieve data once
    get(recipeRef).then((snapshot) => {
        if (snapshot.exists()) {
            const recipes = snapshot.val();
            const recipeArray = [];

            // Extract only necessary fields to reduce data transfer
            for (const key in recipes) {
                const recipe = {
                    key: key,
                    name: recipes[key].name,
                    dish_type: recipes[key].dish_type,
                    dish_category: recipes[key].dish_category,
                    meal_category: recipes[key].meal_category
                };
                recipeArray.push(recipe);
            }

            // Collect unique dish types and meal categories
            const uniqueDishTypes = new Set(recipeArray.map(recipe => recipe.dish_type));
            const uniqueMealCategories = new Set(recipeArray.map(recipe => recipe.meal_category).filter(Boolean));
            
            // Populate dropdowns
            populateDishTypeDropdown(uniqueDishTypes);
            populateMealCategoryDropdown(uniqueMealCategories);

            // Display recipes
            displayRecipes(recipeArray);
        } else {
            console.log("No recipes available");
            displayRecipes([{ name: 'No recipes found.' }]);
        }
    }).catch((error) => {
        console.error("Error fetching recipes:", error);
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

// Function to populate the meal category dropdown
function populateMealCategoryDropdown(mealCategories) {
    const mealCategoryDropdown = document.getElementById('meal-category-dropdown');
    mealCategoryDropdown.innerHTML = ''; // Clear existing options

    // Add default 'None' option
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = 'None';
    mealCategoryDropdown.appendChild(noneOption);

    // Add meal categories
    mealCategories.forEach(category => {
        if (category) { // Ensure we only add valid categories
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            mealCategoryDropdown.appendChild(option);
        }
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
    const mealCategoryDropdown = document.getElementById('meal-category-dropdown');

    // Info icons
    const dishInfoIcon = document.getElementById('dish-info');
    const dishInfoBox = document.getElementById('dish-info-box');
    const vegInfoIcon = document.getElementById('veg-info');
    const vegInfoBox = document.getElementById('veg-info-box');
    const mealInfoIcon = document.getElementById('meal-info');
    const mealInfoBox = document.getElementById('meal-info-box');

    // Show search input and dropdowns when clicking the search button
    searchButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'flex';
        showAllButton.style.display = 'inline-block';
        searchButton.style.display = 'none';
        dishTypeDropdown.style.display = 'block'; 
        vegTypeDropdown.style.display = 'block'; 
        mealCategoryDropdown.style.display = 'block'; // Show meal category dropdown
        dishInfoIcon.style.display = 'block';
        vegInfoIcon.style.display = 'block';
        mealInfoIcon.style.display = 'block'; // Show meal info icon
    });

    // Show all recipes and hide search input
    showAllButton.addEventListener('click', () => {
        searchInputContainer.style.display = 'none';
        showAllButton.style.display = 'none';
        searchButton.style.display = 'inline-block';
        dishTypeDropdown.style.display = 'none';
        vegTypeDropdown.style.display = 'none';
        mealCategoryDropdown.style.display = 'none'; // Hide meal category dropdown
        dishInfoIcon.style.display = 'none';
        vegInfoIcon.style.display = 'none';
        mealInfoIcon.style.display = 'none'; // Hide meal info icon
        fetchAllRecipes();
    });

    // Search feature
    searchRecipeButton.addEventListener('click', () => {
        filterRecipes();
    });

    // Function to handle filtering based on all filters - optimized to use Firebase queries when possible
    function filterRecipes() {
        const searchTerm = searchTermInput.value.trim().toLowerCase();
        const selectedDishType = dishTypeDropdown.value;
        const selectedVegType = vegTypeDropdown.value;
        const selectedMealCategory = mealCategoryDropdown.value;

        // Base reference to recipes
        let recipeRef = ref(database, 'recipes');
        
        // If one specific filter is applied without search term, use Firebase query
        // This optimizes by filtering on the server rather than client
        if (!searchTerm) {
            if (selectedDishType && !selectedVegType && !selectedMealCategory) {
                // Filter by dish type on server
                recipeRef = query(recipeRef, orderByChild('dish_type'), equalTo(selectedDishType));
            } else if (selectedVegType && !selectedDishType && !selectedMealCategory) {
                // Filter by veg type on server
                recipeRef = query(recipeRef, orderByChild('dish_category'), equalTo(selectedVegType));
            } else if (selectedMealCategory && !selectedDishType && !selectedVegType) {
                // Filter by meal category on server
                recipeRef = query(recipeRef, orderByChild('meal_category'), equalTo(selectedMealCategory));
            }
        }
        
        // Get recipes with optimized query
        get(recipeRef).then((snapshot) => {
            if (snapshot.exists()) {
                const recipes = snapshot.val();
                const filteredRecipes = [];
                
                for (const key in recipes) {
                    const recipeName = recipes[key].name.toLowerCase();
                    const recipe = {
                        key: key,
                        name: recipes[key].name,
                        dish_type: recipes[key].dish_type,
                        dish_category: recipes[key].dish_category,
                        meal_category: recipes[key].meal_category
                    };
                    
                    // Apply remaining filters on the client side
                    if ((!searchTerm || recipeName.includes(searchTerm)) && 
                        (!selectedVegType || recipe.dish_category === selectedVegType) &&
                        (!selectedDishType || recipe.dish_type === selectedDishType) &&
                        (!selectedMealCategory || recipe.meal_category === selectedMealCategory)) {
                        filteredRecipes.push({
                            key: key,
                            name: recipes[key].name,
                            country: recipes[key].country || "" // Include country if available
                        });
                    }
                }
                
                // Show the filtered recipes or a message if none found
                displayRecipes(filteredRecipes.length > 0 ? filteredRecipes : [{ name: 'No recipes found.' }]);
            } else {
                displayRecipes([{ name: 'No recipes found.' }]);
            }
        }).catch((error) => {
            console.error("Error filtering recipes:", error);
            displayRecipes([{ name: 'Error loading recipes.' }]);
        });
    }

    // Filter on dish type selection
    dishTypeDropdown.addEventListener('change', () => {
        filterRecipes();
    });

    // Filter on veg/non-veg type selection
    vegTypeDropdown.addEventListener('change', () => {
        filterRecipes();
    });
    
    // Filter on meal category selection
    mealCategoryDropdown.addEventListener('change', () => {
        filterRecipes();
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
    
    // Hover effect for meal info icon
    mealInfoIcon.addEventListener('mouseover', () => {
        mealInfoBox.style.display = 'block';
    });
    mealInfoIcon.addEventListener('mouseout', () => {
        mealInfoBox.style.display = 'none';
    });
});