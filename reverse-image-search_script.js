// Import Firebase functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

let app;
let database;
let OPENAI_API_KEY;

// Function to initialize Firebase
async function initializeFirebase() {
    try {
        const response = await fetch('/api/config');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.firebaseConfig) {
            throw new Error('Invalid configuration received from server');
        }
        
        // Initialize Firebase with the config from server
        app = initializeApp(data.firebaseConfig);
        database = getDatabase(app);
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error fetching Firebase config:', error);
        document.getElementById('result').innerText = 'Error: Could not load Firebase configuration from server';
        return false;
    }
}

// Function to load OpenAI API key
async function loadApiKey() {
    try {
        const response = await fetch('/api/openai-key');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        OPENAI_API_KEY = data.apiKey;
        
        if (!OPENAI_API_KEY) {
            throw new Error('API key not found in server response');
        }
        return true;
    } catch (error) {
        console.error('Error loading API key:', error);
        document.getElementById('result').innerText = 'Error: Could not load API key from server';
        return false;
    }
}

// Initialize Firebase and API key on page load
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([initializeFirebase(), loadApiKey()]);
});

document.getElementById('searchButton').addEventListener('click', async () => {
    if (!app || !database || !OPENAI_API_KEY) {
        // Try to initialize if they're not already initialized
        const initialized = await Promise.all([initializeFirebase(), loadApiKey()]);
        if (!initialized[0] || !initialized[1]) {
            document.getElementById('result').innerText = 'Error: Failed to initialize services. Please try again later.';
            return;
        }
    }

    const imageInput = document.getElementById('imageInput');
    if (imageInput.files.length === 0) {
        alert('Please select an image first.');
        return;
    }

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        const imageDataUrl = event.target.result;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o', 
                    messages: [
                        { role: "system", content: "You are a helpful assistant that describes images in detail." },
                        { 
                            role: "user", 
                            content: [
                                { type: "text", text: "Give me the name of this dish (only the name of this dish in the response), thanks" },
                                { 
                                    type: "image_url", 
                                    image_url: {
                                        url: imageDataUrl,
                                        details: "low"
                                    }
                                }
                            ] 
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const dishName = data.choices[0].message.content.trim();

            // Display the AI response
            document.getElementById('result').innerText = `Dish Name: ${dishName}`;

            // Query Firebase for dishes
            const dishesRef = ref(database, 'recipes');
            const similarDishesList = document.getElementById('similarDishesList');
            similarDishesList.innerHTML = ''; // Clear previous results

            onValue(dishesRef, (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const dish = childSnapshot.val();
                        if (dish.name.toLowerCase().includes(dishName.toLowerCase())) {
                            const listItem = document.createElement('li');
                            listItem.textContent = `${dish.name} - ${dish.country}`;
                            
                            // Add click event to open recipe-detail page with recipe ID in URL
                            listItem.addEventListener('click', () => {
                                window.location.href = `recipe-detail.html?recipeId=${childSnapshot.key}`;
                            });

                            similarDishesList.appendChild(listItem);
                        }
                    });
                    if (similarDishesList.innerHTML === '') {
                        similarDishesList.innerHTML = "<li>No similar dishes found.</li>";
                    }
                } else {
                    similarDishesList.innerHTML = "<li>No dishes found.</li>";
                }
            });
        } catch (err) {
            document.getElementById('result').innerText = 'An error occurred: ' + err.message;
            console.error('API Request Error:', err);
        }
    };

    reader.readAsDataURL(file);
});
