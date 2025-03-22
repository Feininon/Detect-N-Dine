const { default: ollama } = require('ollama');
const fs = require('fs');

async function detectIngredients(imgPath) {
    if (!fs.existsSync(imgPath)) {
        throw new Error("Image file does not exist at: " + imgPath);
    }

    console.log("Processing image:", imgPath);

    try {
        const response = await ollama.chat({
            model: 'llama3.2-vision',
            messages: [{
                role: 'user',
                content: 'List the food items here, just say the word do not say anything else',
                images: [imgPath] // Ensure properly formatted path
            }]
        });

        if (!response || !response.message || !response.message.content) {
            throw new Error("Invalid Ollama response format");
        }

        const ingredients = response.message.content.trim().split("\n").map(i => i.trim());
        console.log("Detected Ingredients:", ingredients); 
        return ingredients;

    } catch (error) {
        console.error("Error in detectIngredients:", error);
        throw error;
    }
}

module.exports = { detectIngredients };
