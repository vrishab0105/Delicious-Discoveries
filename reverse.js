// Import Firebase functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

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
const database = getDatabase(app);

document.getElementById('searchButton').addEventListener('click', async () => {
    // Load API key from config.json
    const responseConfig = await fetch('key.json');
    const config = await responseConfig.json();
    const OPENAI_API_KEY = config.OPENAI_API_KEY;

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
