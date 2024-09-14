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

// Function to fetch and display recipe names
document.addEventListener('DOMContentLoaded', function () {
    const recipeList = document.getElementById('recipe-list');
    
    // Reference to the 'recipes' node in your Firebase Realtime Database
    const recipeRef = ref(database, 'recipes');

    // Fetch the recipe names from Firebase
    onValue(recipeRef, (snapshot) => {
        const recipes = snapshot.val();

        // Clear the existing list
        recipeList.innerHTML = '';

        // Loop through the recipes and create list items for each
        for (const key in recipes) {
            const recipeItem = document.createElement('li');
            recipeItem.textContent = recipes[key].name;
            recipeItem.addEventListener('click', () => openRecipeModal(key));
            recipeList.appendChild(recipeItem);
        }
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

            // Optionally refresh the recipe list
            const recipeList = document.getElementById('recipe-list');
            recipeList.innerHTML = '';
            onValue(recipeRef, (snapshot) => {
                const recipes = snapshot.val();
                for (const key in recipes) {
                    const recipeItem = document.createElement('li');
                    recipeItem.textContent = recipes[key].name;
                    recipeItem.addEventListener('click', () => openRecipeModal(key));
                    recipeList.appendChild(recipeItem);
                }
            });
        }).catch(error => {
            console.error('Error adding recipe:', error);
        });
    });
});

// Open modal and display recipe details when clicked
function openRecipeModal(recipeKey) {
    const recipeRef = ref(database, `recipes/${recipeKey}`);

    // Fetch the specific recipe from Firebase
    onValue(recipeRef, (snapshot) => {
        const recipe = snapshot.val();

        // Populate modal with recipe data
        document.getElementById('modal-recipe-name').textContent = recipe.name;

        const ingredientsList = document.getElementById('modal-recipe-ingredients');
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });

        const stepsList = document.getElementById('modal-recipe-steps');
        stepsList.innerHTML = '';
        recipe.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });

        // Show the modal
        document.getElementById('recipe-modal').style.display = 'block';
    });
}

// Close the modal when the close button is clicked
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('recipe-modal').style.display = 'none';
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('recipe-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
