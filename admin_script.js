// Import Firebase functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
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

// Handle login functionality
document.addEventListener('DOMContentLoaded', async function () {
    const loginForm = document.getElementById('login-form');
    const mainContent = document.getElementById('main-content');
    const loginPage = document.getElementById('login-page');
    
    // Initialize Firebase before login to enable credential checking
    const initialized = await initializeFirebase();
    
    if (!initialized) {
        // Show error message if Firebase initialization fails
        const loginContent = document.querySelector('.login-content');
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Authentication service unavailable. Please try again later.';
        errorMsg.style.color = 'red';
        errorMsg.style.marginTop = '10px';
        loginContent.appendChild(errorMsg);
        return;
    }

    // Handle login form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const enteredUsername = document.getElementById('username').value;
        const enteredPassword = document.getElementById('password').value;
        
        try {
            // Reference to the users node in Firebase
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (!snapshot.exists()) {
                alert('User authentication system is not configured. Please contact the administrator.');
                return;
            }
            
            const users = snapshot.val();
            let isAuthenticated = false;
            
            // Check if the entered username exists and password matches
            if (users[enteredUsername] && users[enteredUsername].password === enteredPassword) {
                isAuthenticated = true;
            }
            
            if (isAuthenticated) {
                loginPage.style.display = 'none'; // Hide login page
                mainContent.style.display = 'block'; // Show main content
                loadRecipes(); // Call function to load recipes
            } else {
                alert('Incorrect username or password. Please try again.');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('Authentication failed. Please try again later.');
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
        document.getElementById('add-recipe-page').style.display = 'flex'; // Show modal
    });

    // Close the add recipe page when the close button is clicked
    document.querySelector('.close-add-recipe').addEventListener('click', () => {
        document.getElementById('add-recipe-page').style.display = 'none'; // Hide modal
    });

    // Close the add recipe page when the cancel button is clicked
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        document.getElementById('add-recipe-page').style.display = 'none'; // Hide modal
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

        // Reference to the 'recipes' node in Firebase
        const newRecipeRef = ref(database, 'recipes/' + recipeName.replace(/\s+/g, '-').toLowerCase());

        // Create a new recipe object
        const newRecipe = {
            name: recipeName,
            country: country,
            dishType: dishType,
            dishCategory: dishCategory,
            ingredients: ingredients,
            steps: steps
        };

        // Set the new recipe in Firebase
        set(newRecipeRef, newRecipe).then(() => {
            alert(`${recipeName} has been added.`);
            document.getElementById('add-recipe-page').style.display = 'none'; // Hide the add recipe modal
            document.getElementById('add-recipe-form').reset(); // Reset the form
            loadRecipes(); // Refresh the recipe list
        }).catch(error => {
            console.error('Error adding recipe:', error);
        });
    });
});
