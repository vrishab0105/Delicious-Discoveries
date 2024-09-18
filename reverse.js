// Replace this with the actual endpoint for client-side usage
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";
const token = "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"; // Avoid exposing sensitive tokens in client-side code

document.getElementById('searchButton').addEventListener('click', async () => {
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
            const response = await fetch(`${endpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are a helpful assistant that describes images in detail." },
                        { role: "user", content: [
                            { type: "text", text: "Give the name of this dish in this image?" },
                            { type: "image_url", image_url: { url: imageDataUrl, details: "low" } }
                        ]}
                    ],
                    model: modelName
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
