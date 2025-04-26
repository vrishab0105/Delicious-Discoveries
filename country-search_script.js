import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, query, orderByChild, get, equalTo } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

let app;
let db;

// Function to initialize Firebase
async function initializeFirebase() {
    try {
        // Always use absolute path for API endpoint
        const configEndpoint = '/api/config';
        console.log('Fetching Firebase config from:', configEndpoint);
        
        const response = await fetch(configEndpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.firebaseConfig) {
            throw new Error('Invalid configuration received from server');
        }
        
        console.log('Firebase config received successfully');
        
        // Initialize Firebase with the config from server
        app = initializeApp(data.firebaseConfig);
        db = getDatabase(app);
        console.log('Firebase initialized successfully');
        return true; // Return true to indicate successful initialization
    } catch (error) {
        console.error('Error fetching Firebase config:', error);
        return false; // Return false to indicate failed initialization
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase first
    const initialized = await initializeFirebase();
    if (!initialized) {
        console.error("Firebase initialization failed. Country search functionality will not work.");
        // Display an error message to the user
        const countryButtonsContainer = document.querySelector('.country-buttons');
        const recipeList = document.getElementById('recipe-list');
        if (countryButtonsContainer && recipeList) {
            countryButtonsContainer.innerHTML = '<p class="error-message">Country data is currently unavailable.</p>';
            recipeList.innerHTML = '<p class="error-message">Recipe data is currently unavailable. Please try again later.</p>';
        }
        return;
    }
    
    const countryButtonsContainer = document.querySelector('.country-buttons');
    const searchContainer = document.getElementById('search-container');
    const recipeList = document.getElementById('recipe-list');

    // Fetch and display dynamic country buttons
    const countries = await fetchUniqueCountries();
    displayCountryButtons(countries, countryButtonsContainer);

    // Event listeners for dynamically created buttons
    countryButtonsContainer.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
            // Remove active class from all buttons
            const buttons = countryButtonsContainer.querySelectorAll('button');
            buttons.forEach(btn => btn.classList.remove('active'));

            // Add active class to the clicked button
            e.target.classList.add('active');

            const country = e.target.dataset.country;
            await loadRecipesByCountry(country);
            searchContainer.style.display = 'flex'; // Show search options
        }
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

// Fetch unique countries from Firebase and sort them alphabetically
async function fetchUniqueCountries() {
    const dbRef = ref(db, 'recipes');
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        const countries = new Set();

        for (const key in data) {
            if (data[key].country) {
                countries.add(data[key].country.trim()); // Trim whitespace
            }
        }

        // Convert the Set to an array, sort alphabetically ignoring case
        return Array.from(countries).sort((a, b) => 
            a.toLowerCase().localeCompare(b.toLowerCase())
        );
    } else {
        console.warn('No recipes found in the database.');
        return [];
    }
}

// Dynamically display country buttons
function displayCountryButtons(countries, container) {
    container.innerHTML = ''; // Clear existing buttons

    countries.forEach(country => {
        const button = document.createElement('button');
        button.textContent = country;
        button.dataset.country = country;
        container.appendChild(button);
    });
}

async function loadRecipesByCountry(country) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '<p>Loading recipes...</p>'; // Show loading message

    const dbRef = ref(db, 'recipes');
    // Use equalTo to filter directly by country - this leverages your Firebase index
    const countryQuery = query(dbRef, orderByChild('country'), equalTo(country));

    try {
        const snapshot = await get(countryQuery);
        if (snapshot.exists()) {
            const recipes = Object.entries(snapshot.val());

            // Store recipes for filtering
            window.currentRecipes = recipes;

            // Sort recipes by name and display
            const sortedRecipes = recipes.sort(([, a], [, b]) =>
                a.name.localeCompare(b.name)
            );
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
            <p>${recipe.description || 'Experience the unique flavors of this traditional dish!'}</p>
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