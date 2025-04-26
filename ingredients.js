// This script is for ingredients.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Firebase first
    const initialized = await initializeFirebase();
    if (!initialized) {
        console.error("Firebase initialization failed. Ingredient search functionality will not work.");
        // Display an error message to the user
        const resultsDiv = document.getElementById("results");
        if (resultsDiv) {
            resultsDiv.innerHTML = "<p class='error-message'>Search is currently unavailable. Please try again later.</p>";
        }
        return;
    }

    // DOM elements
    const inputBox = document.getElementById("ingredient-box");
    const searchBtn = document.getElementById("search-btn");
    const resultsDiv = document.getElementById("results");

    // Capitalize function
    function capitalize(str) {
      return str ? str.replace(/\b\w/g, char => char.toUpperCase()) : "";
    }

    // Search logic
    searchBtn.addEventListener("click", async () => {
      const userIngredients = inputBox.value
        .toLowerCase()
        .split(",")
        .map(item => item.trim())
        .filter(item => item);

      if (userIngredients.length === 0) {
        resultsDiv.innerHTML = "<p>Please enter at least one ingredient.</p>";
        return;
      }

      const recipesRef = ref(db, "recipes");
      try {
        const snapshot = await get(recipesRef);
        if (snapshot.exists()) {
          const recipes = snapshot.val();
          let matchedRecipes = [];

          Object.entries(recipes).forEach(([id, recipe]) => {
            const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase());
            const allMatch = userIngredients.every(userIng =>
              recipeIngredients.some(recipeIng => recipeIng.includes(userIng))
            );

            if (allMatch) {
              matchedRecipes.push({ id, name: recipe.name });
            }
          });

          if (matchedRecipes.length > 0) {
            resultsDiv.innerHTML = `
              <h3>Recipes found:</h3>
              <ul style="list-style: none; padding-left: 0;">
                ${matchedRecipes.map(recipe =>
                  `<li style="margin-bottom: 10px;">
                    <button class="recipe-btn" onclick="showRecipeDetails('${recipe.id}')">${recipe.name}</button>
                  </li>`
                ).join("")}
              </ul>
            `;
          } else {
            resultsDiv.innerHTML = "<p>No recipes found with those ingredients.</p>";
          }
        } else {
          resultsDiv.innerHTML = "<p>No recipes available.</p>";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (resultsDiv) {
          resultsDiv.innerHTML = "<p>Error fetching recipes. Try again later.</p>";
        }
      }
    });

    // Show detailed recipe
    window.showRecipeDetails = async (recipeId) => {
      const recipeRef = ref(db, `recipes/${recipeId}`);
      try {
        const snapshot = await get(recipeRef);
        if (snapshot.exists()) {
          const recipe = snapshot.val();
          const imageUrl = recipe.image || "";
          const dishType = capitalize(recipe.dish_type);
          const dishCategory = capitalize(recipe.dish_category);

          // Ensure the 'resultsDiv' is available before updating it
          if (resultsDiv) {
            resultsDiv.innerHTML = `
              <div class="search-result-card">
                <center>
                  <h2>${recipe.name}</h2>
                  <img src="${imageUrl}" alt="${recipe.name}" style="max-width: 20vw; height: auto;">
                  <p><strong>Country:</strong> ${recipe.country}</p>
                  <p><strong>Dish Type:</strong> ${dishType}</p>
                  <p><strong>Dish Category:</strong> ${dishCategory}</p>
                  <p><strong>Meal Category:</strong> ${recipe.meal_category}</p>
                  <p><strong>Ingredients:</strong></p>
                  <ul>${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>
                  <p><strong>Steps:</strong></p>
                  <ol>${recipe.steps.map(step => `<li>${step}</li>`).join('')}</ol>
                  
                </center>
              </div>
            `;
          }
        } else {
          if (resultsDiv) {
            resultsDiv.innerHTML = "<p>Recipe not found.</p>";
          }
        }
      } catch (error) {
        console.error("Error fetching recipe details:", error);
        if (resultsDiv) {
          resultsDiv.innerHTML = "<p>Unable to load recipe details.</p>";
        }
      }
    };
});
