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
            document.getElementById('result').innerText = data.choices[0].message.content;
        } catch (err) {
            document.getElementById('result').innerText = 'An error occurred: ' + err.message;
            console.error('API Request Error:', err);
        }
    };

    reader.readAsDataURL(file);
});
