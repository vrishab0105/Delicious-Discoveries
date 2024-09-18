// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// OpenAI API key and endpoint
const openAIAPIKey = "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";
const openAIEndpoint = "https://models.inference.ai.azure.com";
const openAIModel = "gpt-4o";

// Initialize Firebase and the Database
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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to fetch and display recipe names in alphabetical order
document.addEventListener('DOMContentLoaded', function () {
    const recipeList = document.getElementById('recipe-list');
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const closeAddRecipeBtn = document.querySelector('.close-add-recipe');
    const addRecipePage = document.getElementById('add-recipe-page');
    const addRecipeForm = document.getElementById('add-recipe-form');

    if (recipeList && addRecipeBtn && closeAddRecipeBtn && addRecipePage && addRecipeForm) {
        // Reference to the 'recipes' node in your Firebase Realtime Database
        const recipeRef = ref(database, 'recipes');

        // Fetch the recipe names from Firebase
        onValue(recipeRef, (snapshot) => {
            const recipes = snapshot.val();
            if (!recipes) {
                console.error('No recipes found in the database.');
                return;
            }

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
                recipeItem.addEventListener('click', () => openRecipeModal(recipe.key));
                recipeList.appendChild(recipeItem);
            });
        }, (error) => {
            console.error('Error fetching recipes from Firebase:', error);
        });

        // Open the add recipe page when the button is clicked
        addRecipeBtn.addEventListener('click', () => {
            addRecipePage.style.display = 'block';
        });

        // Close the add recipe page when the close button is clicked
        closeAddRecipeBtn.addEventListener('click', () => {
            addRecipePage.style.display = 'none';
        });

        // Handle the form submission for adding new recipes
        addRecipeForm.addEventListener('submit', (event) => {
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
                addRecipePage.style.display = 'none';
            }).catch(error => {
                console.error('Error adding recipe:', error);
            });
        });
    } else {
        console.error('One or more elements are missing.');
    }
});

// Open modal and display recipe details when clicked
function openRecipeModal(recipeKey) {
    const recipeRef = ref(database, `recipes/${recipeKey}`);

    // Fetch the specific recipe from Firebase
    onValue(recipeRef, (snapshot) => {
        const recipe = snapshot.val();
        if (!recipe) {
            console.error('Recipe not found in the database.');
            return;
        }

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
    }, (error) => {
        console.error('Error fetching recipe from Firebase:', error);
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

// Function to describe an image using OpenAI API
async function describeImage(imageFile) {
    try {
        const imageDataUrl = await getImageDataUrl(imageFile);
        console.log('Image Data URL:', imageDataUrl); // Log the image data URL for debugging

        const response = await fetch(`${openAIEndpoint}/v1/images/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAIAPIKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: openAIModel,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that describes images in detail.' },
                    { role: 'user', content: [
                        { type: 'text', text: "What's in this image?" },
                        { type: 'image_url', image_url: { url: imageDataUrl, details: 'low' } }
                    ] }
                ]
            })
        });

        const data = await response.json();
        console.log('AI Response:', data); // Log the AI response for debugging

        const dishName = data.choices[0]?.message?.content;
        console.log('Dish Name:', dishName); // Log the dish name for debugging

        // Search for dish in Firebase database
        searchDishInFirebase(dishName);
    } catch (error) {
        console.error('Error describing image:', error); // Log any errors
    }
}

/**
 * Get the data URL of an image file.
 * @param {File} imageFile - The image file object.
 * @returns {Promise<string>} The data URL of the image.
 */
function getImageDataUrl(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}

// Search for the dish in Firebase Realtime Database
function searchDishInFirebase(dishName) {
    const recipeRef = ref(database, 'recipes');
    
    onValue(recipeRef, (snapshot) => {
        const recipes = snapshot.val();
        if (!recipes) {
            console.error('No recipes found in the database.');
            return;
        }

        const matchedRecipes = Object.keys(recipes).filter(key => recipes[key].name.toLowerCase().includes(dishName.toLowerCase()));

        // Display matched recipes to the user
        displayMatchedRecipes(matchedRecipes.map(key => recipes[key]));
    }, (error) => {
        console.error('Error searching for dish in Firebase:', error);
    });
}

// Display matched recipes
function displayMatchedRecipes(recipes) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous results
    
    if (recipes.length === 0) {
        resultsContainer.innerHTML = '<p>No matching recipes found.</p>';
    } else {
        recipes.forEach(recipe => {
            const recipeItem = document.createElement('div');
            recipeItem.classList.add('recipe-item');
            recipeItem.innerHTML = `
                <h3>${recipe.name}</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
                <ol>
                    ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            `;
            resultsContainer.appendChild(recipeItem);
        });
    }
}

// Example usage: Describe an image on file input change
const imageFileInput = document.getElementById('image-file-input');
if (imageFileInput) {
    imageFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            describeImage(file);
        }
    });
} else {
    console.error('Image file input element not found.');
}
