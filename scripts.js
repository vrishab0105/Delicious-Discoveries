// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Firebase config (replace with your own config)
const firebaseConfig = {
  apiKey: "AIzaSyDa84aF-8FeNYVuxB1b3ffPNvY1-KspQFk",
  authDomain: "receipe-e56ae.firebaseapp.com",
  databaseURL: "https://receipe-e56ae-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "receipe-e56ae",
  storageBucket: "receipe-e56ae.appspot.com",
  messagingSenderId: "513489179455",
  appId: "1:513489179455:web:7f26b4734f99854704798a",
  measurementId: "G-C75XCMJKKE"
};

// Initialize Firebase and the Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to fetch and display recipe names in alphabetical order
document.addEventListener('DOMContentLoaded', function () {
    const recipeList = document.getElementById('recipe-list');
    
    // Reference to the 'recipes' node in your Firebase Realtime Database
    const recipeRef = ref(database, 'recipes');

    // Fetch the recipe names from Firebase
    onValue(recipeRef, (snapshot) => {
        const recipes = snapshot.val();

        // Get an array of recipe objects with keys
        const recipeArray = Object.keys(recipes).map(key => ({
            key: key,
            name: recipes[key].name
        }));

        // Sort the recipe array alphabetically by name
        recipeArray.sort((a, b) => a.name.localeCompare(b.name));

        // Clear the existing list
        recipeList.innerHTML = '';

        // Loop through the sorted recipes and create list items for each
        recipeArray.forEach(recipe => {
            const recipeItem = document.createElement('li');
            recipeItem.textContent = recipe.name;

            // When a recipe is clicked, redirect to recipe-detail.html with the recipe key
            recipeItem.addEventListener('click', () => {
                window.location.href = `recipe-detail.html?recipeId=${recipe.key}`;
            });

            recipeList.appendChild(recipeItem);
        });
    });

    // Open the add recipe page when the button is clicked
    document.getElementById('add-recipe-btn').addEventListener('click', () => {
        document.getElementById('add-recipe-page').style.display = 'block';
    });

    // Close the add recipe page when the close button is clicked
    document.querySelector('.close-add-recipe').addEventListener('click', () => {
        document.getElementById('add-recipe-page').style.display = 'none';
    });

    // Handle the form submission for adding new recipes
    document.getElementById('add-recipe-form').addEventListener('submit', (event) => {
        event.preventDefault();
        
        const recipeName = document.getElementById('recipe-name').value;
        const ingredients = document.getElementById('ingredients').value.split(',').map(item => item.trim());
        const steps = document.getElementById('steps').value.split(',').map(item => item.trim());

        // Push new recipe to Firebase
        const newRecipeRef = ref(database, `recipes/${recipeName.replace(/\s+/g, '')}`);
        set(newRecipeRef, {
            name: recipeName,
            ingredients: ingredients,
            steps: steps
        }).then(() => {
            // Clear the form
            document.getElementById('recipe-name').value = '';
            document.getElementById('ingredients').value = '';
            document.getElementById('steps').value = '';

            // Close the add recipe page
            document.getElementById('add-recipe-page').style.display = 'none';
        }).catch(error => {
            console.error('Error adding recipe:', error);
        });
    });
});
