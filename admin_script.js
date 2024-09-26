// Import Firebase functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
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

// Handle login functionality
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const mainContent = document.getElementById('main-content');
    const loginPage = document.getElementById('login-page');

    // Hardcoded credentials
    const username = "Recipe";
    const password = "Admin";

    // Handle login form submission
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const enteredUsername = document.getElementById('username').value;
        const enteredPassword = document.getElementById('password').value;

        // Check credentials
        if (enteredUsername === username && enteredPassword === password) {
            loginPage.style.display = 'none'; // Hide login page
            mainContent.style.display = 'block'; // Show main content
            loadRecipes(); // Call function to load recipes
        } else {
            alert('Incorrect username or password. Please try again.');
        }
    });

    // Function to fetch and display recipe names in alphabetical order
    function loadRecipes() {
        const recipeList = document.getElementById('recipe-list');

        // Reference to the 'recipes' node in your Firebase Realtime Database
        const recipeRef = ref(database, 'recipes');

        // Fetch the recipe names from Firebase
        onValue(recipeRef, (snapshot) => {
            const recipes = snapshot.val();

            // Get an array of recipe objects with keys and country attribute
            const recipeArray = Object.keys(recipes).map(key => ({
                key: key,
                name: recipes[key].name,
                country: recipes[key].country // Include the country attribute
            }));

            // Log the country attribute of each recipe to the console
            recipeArray.forEach(recipe => {
                console.log(`Recipe Name: ${recipe.name}, Country: ${recipe.country}`);
            });

            // Sort the recipe array alphabetically by name
            recipeArray.sort((a, b) => a.name.localeCompare(b.name));

            // Clear the existing list
            recipeList.innerHTML = '';

            // Loop through the sorted recipes and create list items for each
            recipeArray.forEach(recipe => {
                const recipeItem = document.createElement('li');
                recipeItem.textContent = recipe.name;

                // Create a delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'delete-btn'; // Add a class for styling
                deleteBtn.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent event from bubbling up

                    // Confirm deletion
                    if (confirm(`Are you sure you want to delete ${recipe.name}?`)) {
                        const recipeRefToDelete = ref(database, `recipes/${recipe.key}`);
                        set(recipeRefToDelete, null).then(() => {
                            alert(`${recipe.name} has been deleted.`);
                        }).catch(error => {
                            console.error('Error deleting recipe:', error);
                        });
                    }
                });

                // When a recipe is clicked, redirect to recipe-detail.html with the recipe key
                recipeItem.addEventListener('click', () => {
                    window.location.href = `recipe-detail.html?recipeId=${recipe.key}`;
                });

                // Append the delete button to the recipe item
                recipeItem.appendChild(deleteBtn);
                recipeList.appendChild(recipeItem);
            });
        });
    }

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
        const country = document.getElementById('country').value; // Get the country from the text input
        const dishType = document.getElementById('dish-type').value; // Get dish type
        const dishCategory = document.getElementById('dish-category').value; // Get dish category
        const ingredients = document.getElementById('ingredients').value.split(',').map(item => item.trim());
        const steps = document.getElementById('steps').value.split(',').map(item => item.trim());

        // Push new recipe to Firebase
        const newRecipeRef = ref(database, `recipes/${recipeName.replace(/\s+/g, '')}`);
        set(newRecipeRef, {
            name: recipeName,
            country: country, // Include the country in the recipe data
            dish_type: dishType, // Include dish type
            dish_category: dishCategory, // Include dish category    
            ingredients: ingredients,
            steps: steps
        }).then(() => {
            // Clear the form
            document.getElementById('recipe-name').value = '';
            document.getElementById('country').value = ''; // Clear the country field
            document.getElementById('dish-type').value = ''; // Clear the dish type field
            document.getElementById('dish-category').value = ''; // Clear the dish category field    
            document.getElementById('ingredients').value = '';
            document.getElementById('steps').value = '';

            // Close the add recipe page
            document.getElementById('add-recipe-page').style.display = 'none';
        }).catch(error => {
            console.error('Error adding recipe:', error);
        });
    });
});
