// This script is for ingredients.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Firebase Configuration
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
const db = getDatabase(app);

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
