// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";

let app;
let database;
let analytics;

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
        database = getDatabase(app);
        analytics = getAnalytics(app);
        console.log('Firebase initialized successfully');
        return true; // Return true to indicate successful initialization
    } catch (error) {
        console.error('Error fetching Firebase config:', error);
        return false; // Return false to indicate failed initialization
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Firebase first
    const initialized = await initializeFirebase();
    if (!initialized) {
        console.error("Firebase initialization failed. Search functionality will not work.");
        // Display an error message to the user
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Search is currently unavailable. Please try again later.';
            errorMsg.style.color = 'red';
            errorMsg.style.marginTop = '10px';
            searchBar.appendChild(errorMsg);
        }
        return;
    }
    
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const resultsList = document.getElementById('resultsList');
    
    // Modified search function that doesn't require a special index
    async function searchRecipes(searchTerm) {
        if (!searchTerm.trim()) {
            resultsList.innerHTML = '';
            resultsList.style.display = 'none';
            return;
        }
        
        try {
            // Get all recipes and filter client-side
            const recipesRef = ref(database, 'recipes');
            const snapshot = await get(recipesRef);
            
            if (snapshot.exists()) {
                // Clear previous results
                resultsList.innerHTML = '';
                
                // Convert search term to lowercase for case-insensitive comparison
                const searchTermLower = searchTerm.toLowerCase();
                
                // Process and display results
                const recipes = [];
                snapshot.forEach((childSnapshot) => {
                    const recipeData = childSnapshot.val();
                    // Compare lowercase recipe name with search term
                    if (recipeData.name && recipeData.name.toLowerCase().includes(searchTermLower)) {
                        recipes.push({
                            key: childSnapshot.key,
                            name: recipeData.name,
                            image: recipeData.image || '' // Add image if available
                        });
                    }
                });
                
                // Sort results alphabetically
                recipes.sort((a, b) => a.name.localeCompare(b.name));
                
                // Display results (limit to 10 for better UX)
                const maxResults = Math.min(recipes.length, 10);
                for (let i = 0; i < maxResults; i++) {
                    const recipe = recipes[i];
                    const listItem = document.createElement('li');
                    
                    // Create a div to hold the recipe info
                    const recipeInfo = document.createElement('div');
                    recipeInfo.className = 'recipe-info';
                    
                    // Add recipe name
                    const recipeName = document.createElement('span');
                    recipeName.textContent = recipe.name;
                    recipeName.className = 'recipe-name';
                    recipeInfo.appendChild(recipeName);
                    
                    // Add the recipe info to the list item
                    listItem.appendChild(recipeInfo);
                    
                    // Add click event listener to navigate to recipe detail
                    listItem.addEventListener('click', () => {
                        // Navigate to recipe detail page on click
                        window.location.href = `recipe-detail.html?recipeId=${recipe.key}`;
                    });
                    
                    resultsList.appendChild(listItem);
                }
                
                // Show results list
                resultsList.style.display = recipes.length > 0 ? 'block' : 'none';
                
                // If no results were found
                if (recipes.length === 0) {
                    const noResults = document.createElement('li');
                    noResults.textContent = 'No recipes found';
                    noResults.classList.add('no-results');
                    resultsList.appendChild(noResults);
                    resultsList.style.display = 'block';
                }
            } else {
                // No recipes found
                resultsList.innerHTML = '';
                const noResults = document.createElement('li');
                noResults.textContent = 'No recipes found';
                noResults.classList.add('no-results');
                resultsList.appendChild(noResults);
                resultsList.style.display = 'block';
            }
        } catch (error) {
            console.error("Error searching recipes:", error);
            resultsList.innerHTML = '';
            const errorItem = document.createElement('li');
            errorItem.textContent = 'Error searching recipes';
            errorItem.classList.add('error');
            resultsList.appendChild(errorItem);
            resultsList.style.display = 'block';
        }
    }
    
    // Event listener for search button
    searchButton.addEventListener('click', () => {
        searchRecipes(searchInput.value);
    });
    
    // Event listener for input changes with debounce
    let debounceTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            searchRecipes(e.target.value);
        }, 300); // 300ms debounce
    });
    
    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchButton.contains(e.target) && !resultsList.contains(e.target)) {
            resultsList.style.display = 'none';
        }
    });
    
    // Event listener for pressing Enter in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchRecipes(searchInput.value);
        }
    });
});
