const { default: ollama } = require('ollama');

async function chatWithLlama(ingredients) {
    try {
        console.log('chatWithLlama called with ingredients:', ingredients);
        
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ 
                role: 'user', 
                content: `Tell me 10 recipe names that use all of these ingredients: ${ingredients}. Just provide the names in a numbered list.` 
            }],
        });

        console.log('chatWithLlama response:', response);

        const text = response.message.content;
        return text.match(/\d+\.\s(.+)/g)?.map(recipe => recipe.replace(/^\d+\.\s/, '')) || [];
        
    } catch (error) {
        console.error('Error in chatWithLlama:', error);
        throw error;
    }
}

async function extractIngredientsFromRecipe(recipeText) {
    try {
        console.log('extractIngredientsFromRecipe called with recipeText:', recipeText);
        
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ 
                role: 'user', 
                content: `Extract only the list of ingredients from the following recipe text. Provide them as a comma-separated list without additional text.Each ingredient should be mentioned in one word.No need for nutritional information: \n\n${recipeText}` 
            }],
        });

        console.log('extractIngredientsFromRecipe response:', response);

        return response.message.content.split(", ").map(i => i.trim());
    } catch (error) {
        console.error('Error extracting ingredients:', error);
        throw error;
    }
}

async function getRecipeSteps(recipeName, recipeIngredients) {
    try {
        console.log('getRecipeSteps called with:', { recipeName, recipeIngredients });
        
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ 
                role: 'user', 
                content: `For making ${recipeName}, with the ingredients ${recipeIngredients} step-by-step(with quantity) instructions in this format: 

                Step-by-step instruction:

                1. {{first step}}
                2. {{second step}}     
                do not include anything else just these.Do not mention the ingredients, nutrition facts or anything that are not explicitly steps.`

            }],
        });

        console.log('getRecipeSteps response:', response);

        const formatted_text = response.message.content.replace(/\n/g, "<br>");
        return formatted_text;
    } catch (error) {
        console.error('Error fetching recipe steps:', error);
        throw error;
    }
}

async function getRecipeData(recipeName) {
    try {
        console.log('getRecipeData called with:', recipeName);

        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ 
                role: 'user', 
                content: `For making ${recipeName}, 
                list all ingredients(no quantity) used in recipe, nutrient values of the recipe in this format:

                Ingredients:
                {{Ingredient1}}
                {{Ingredient2}}
                {{Ingredient3}}

                Nutritional Values:
                {{Nutritional Value1}}
                {{Nutritional Value2}}
                {{Nutritional Value3}}
                do not include anything else just these.`
            }],
        });

        console.log('getRecipeData response:', response);

        const formatted_text = response.message.content.replace(/\n/g, "<br>");
        return formatted_text;
    } catch (error) {
        console.error('Error fetching recipe data:', error);
        throw error;
    }
}

async function modifyRecipeData(recipeName, missingIngredients) {
    try {
        console.log('modifyRecipeData called with:', { recipeName, missingIngredients });

        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ 
                role: 'user', 
                content: `For making ${recipeName} to work without ${missingIngredients}, 
                list all ingredients(no quantity) used in recipe, nutrient values of the recipe in this format:

                Ingredients:
                {{Ingredient1}}
                {{Ingredient2}}
                {{Ingredient3}}

                Nutritional Values:
                {{Nutritional Value1}}
                {{Nutritional Value2}}
                {{Nutritional Value3}}

               do not include anything else just these.` 
            }],
        });

        console.log('modifyRecipeData response:', response);

        const formatted_text = response.message.content.replace(/\n/g, "<br>");
        return formatted_text;
    } catch (error) {
        console.error('Error modifying recipe data:', error);
        throw error;
    }
}

async function modifyRecipe(recipeName, ModimissingIngredients) {
    try {
        console.log('modifyRecipe called with:', { recipeName, ModimissingIngredients });

        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ 
                role: 'user', 
                content: `For making ${recipeName} with ${ModimissingIngredients}, 
                give step-by-step(with quantity) instructions in this format: 

           
                1. {{first step}}
                2. {{second step}} 
                Do not mention the ingredients, nutrition facts or anything that are not explicitly steps` 
            }],
        });

        console.log('modifyRecipe response:', response);

        const formatted_text = response.message.content.replace(/\n/g, "<br>");
        return formatted_text;
    } catch (error) {
        console.error('Error modifying recipe:', error);
        throw error;
    }
}

// Export all functions
module.exports = { 
    chatWithLlama, 
    getRecipeSteps, 
    modifyRecipe, 
    extractIngredientsFromRecipe, 
    getRecipeData, 
    modifyRecipeData 
};
