// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
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

document.addEventListener('DOMContentLoaded', function() {
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
