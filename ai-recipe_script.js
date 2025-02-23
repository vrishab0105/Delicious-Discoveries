let OPENAI_API_KEY;

async function loadApiKey() {
    try {
        const response = await fetch('key.json');
        if (!response.ok) {
            throw new Error('API key file not found');
        }
        const config = await response.json();
        OPENAI_API_KEY = config.OPENAI_API_KEY;
    } catch (error) {
        console.error('Error loading API key:', error);
        document.getElementById('recipeResult').innerText = 'Error: Could not load API key';
    }
}

loadApiKey();

document.getElementById('getRecipeButton').addEventListener('click', async () => {
    const dishName = document.getElementById('dishInput').value.trim();
    if (!dishName) {
        alert('Please enter a dish name');
        return;
    }

    if (!OPENAI_API_KEY) {
        alert('API key not loaded. Please try again later.');
        return;
    }

    const loadingIndicator = document.getElementById('loadingIndicator');
    const recipeResult = document.getElementById('recipeResult');
    
    loadingIndicator.classList.remove('hidden');
    recipeResult.innerText = '';

    try {
        // First, validate if the input is a dish
        const validationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a validator that checks if the provided input is a food dish. Respond with only "YES" or "NO".'
                    },
                    {
                        role: 'user',
                        content: `Is "${dishName}" a food dish? Only respond with YES or NO.`
                    }
                ],
                temperature: 0.3
            })
        });

        if (!validationResponse.ok) {
            throw new Error(`HTTP error! status: ${validationResponse.status}`);
        }

        const validationData = await validationResponse.json();
        const isValidDish = validationData.choices[0].message.content.trim().toUpperCase() === 'YES';

        if (!isValidDish) {
            recipeResult.innerText = 'Sorry, that doesn\'t appear to be a valid food dish. Please enter a valid dish name.';
            loadingIndicator.classList.add('hidden');
            return;
        }

        // Proceed with the recipe generation if validation passes
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a skilled chef who provides detailed recipes with ingredients and instructions.'
                    },
                    {
                        role: 'user',
                        content: `Please provide a recipe for ${dishName}. Include ingredients list and step-by-step instructions.`
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        recipeResult.innerText = data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        recipeResult.innerText = 'Sorry, there was an error generating the recipe. Please try again.';
    } finally {
        loadingIndicator.classList.add('hidden');
    }
});
