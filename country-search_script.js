import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

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

initializeApp(firebaseConfig);
const db = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.country-buttons button');
    const searchContainer = document.getElementById('search-container');
    const recipeList = document.getElementById('recipe-list');

    buttons.forEach(button => {
        button.addEventListener('click', async (e) => {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to the clicked button
            e.target.classList.add('active');
            
            const country = e.target.dataset.country;
            await loadRecipesByCountry(country);
            searchContainer.style.display = 'flex'; // Show search options
        });
    });

    document.getElementById('search-recipe-btn').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-term').value.trim().toLowerCase();
        filterRecipes(searchTerm);
    });

    document.getElementById('show-all-btn').addEventListener('click', () => {
        // Get the active country
        const activeButton = document.querySelector('.country-buttons button.active');
        if (activeButton) {
            const country = activeButton.dataset.country;
            loadRecipesByCountry(country); // Reload all recipes for the selected country
            document.getElementById('search-term').value = ''; // Clear search input
        }
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
            // Convert the object to an array and sort it by recipe name
            const sortedRecipes = Object.entries(recipes).sort((a, b) => {
                return a[1].name.localeCompare(b[1].name);
            });

            // Store recipes for filtering
            window.currentRecipes = sortedRecipes;

            // Display the sorted recipes
            displayRecipes(sortedRecipes);
        } else {
            recipeList.innerHTML = '<p>No recipes found for this country.</p>';
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipeList.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
    }
}

function displayRecipes(recipes) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = ''; // Clear previous results

    if (recipes.length === 0) {
        recipeList.innerHTML = '<p>No recipes found.</p>'; // Show message
        return; // Exit the function early
    }

    recipes.forEach(([key, recipe]) => {
        const recipeItem = document.createElement('div');
        recipeItem.className = 'recipe-item';
        recipeItem.innerHTML = `
            <h2>${recipe.name}</h2>
            <a href="recipe-detail.html?recipeId=${encodeURIComponent(key)}" class="recipe-link">View Recipe</a>
        `;
        recipeList.appendChild(recipeItem);
    });
}

function filterRecipes(searchTerm) {
    const filteredRecipes = window.currentRecipes.filter(([key, recipe]) =>
        recipe.name.toLowerCase().includes(searchTerm)
    );

    // Check if no recipes match the search term
    if (filteredRecipes.length === 0) {
        displayRecipes([]); // Pass an empty array to indicate no recipes
        return;
    }
    
    displayRecipes(filteredRecipes);
}
