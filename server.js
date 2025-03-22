const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const { detectIngredients } = require("./detectings");
const { chatWithLlama, getRecipeSteps, modifyRecipe, extractIngredientsFromRecipe, getRecipeData, modifyRecipeData } = require("./chat");
const { default: ollama } = require('ollama');

const app = express();
app.use(cors());
app.use(express.json()); // Add this line to parse JSON request bodies
const port = process.env.PORT || 3002;

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "uploads", req.file.filename).replace(/\\/g, "/");

    try {
        const ingredients = await detectIngredients(filePath);
        console.log("Ingredients detected:", ingredients);

        res.json({ 
            message: "Upload successful",
            filePath: "/uploads/" + req.file.filename,
            ingredients
        });

    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Failed to process image." });
    }
});

// Fetch recipes based on a selected ingredient
app.get("/recipes", async (req, res) => {
    const ingredients = req.query.ingredient;
    if (!ingredients) {
        return res.status(400).json({ error: "No ingredient provided" });
    }

    try {
        const recipes = await chatWithLlama(ingredients);
        res.json({ recipes });
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ error: "Failed to fetch recipes." });
    }
});

// Fetch recipe steps
app.get("/recipe-steps", async (req, res) => {
    const recipeName = req.query.recipe;

    console.log("Received request for recipe:", recipeName); // Debug log

    if (!recipeName) {
        console.error("Missing recipe name in request");
        return res.status(400).json({ error: "Recipe name not provided" });
    }

        // Step 1: Fetch the full recipe text using the AI model
        const formatted_text_data = await getRecipeData(recipeName);
       formatted_text=await getRecipeSteps(recipeName,formatted_text_data);
        const recipeText = formatted_text;
        console.log("Generated Recipe:\n", recipeText); // Debug log

        // Step 2: Extract ingredients using the function
        const extractedIngredients = await extractIngredientsFromRecipe(recipeText);
        console.log("Extracted Ingredients:", extractedIngredients); // Debug log

        // Step 3: Send response with recipe steps and extracted ingredients
        res.json({ steps: recipeText, ingredients: extractedIngredients, data: formatted_text_data });

    
});

// Modify recipe
app.post("/modify-recipe", async (req, res) => {
    let { recipe, missingIngredients } = req.body; // Using 'let' to allow modification

    if (!recipe || !missingIngredients) {
        return res.status(400).json({ error: "Recipe or missing ingredients not provided" });
    }

    try {
        // Step 1: Modify the recipe
        const modifiedRecipe_data = await modifyRecipeData(recipe, missingIngredients)
        const modifiedRecipe = await modifyRecipe(recipe, modifiedRecipe_data);

        // Step 2: Extract ingredients from the modified recipe
        const updatedIngredients = await extractIngredientsFromRecipe(modifiedRecipe);

        // Step 3: Update the missingIngredients variable (removing ones that are now included)
        missingIngredients = missingIngredients.filter(ing => !updatedIngredients.includes(ing));

        res.json({ message: modifiedRecipe, data: modifiedRecipe_data });

    } catch (error) {
        console.error("Error modifying recipe:", error);
        res.status(500).json({ error: "Failed to modify recipe." });
    }
});


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));