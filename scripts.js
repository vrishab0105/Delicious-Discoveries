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
    databaseURL: "https://deliciousdiscoveries04.firebaseio.com" // Add correct database URL
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const database = getDatabase(app);

  // Function to fetch and display recipe names in alphabetical order
  document.addEventListener('DOMContentLoaded', function () {
      const recipeList = document.getElementById('recipe-list');
      
      // Reference to the 'recipes' node in your Firebase Realtime Database
      const recipeRef = ref(database, 'recipes');

      // Fetch the recipe names from Firebase
      // Fetch the recipe names from Firebase
onValue(recipeRef, (snapshot) => {
    const recipes = snapshot.val();

    // Get an array of recipe objects with keys and country attribute
    const recipeArray = Object.keys(recipes).map(key => ({
        key: key,
        name: recipes[key].name,
        country: recipes[key].country // Add this line to include the country attribute
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
