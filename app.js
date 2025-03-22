const { getRecipeSteps } = require("./chat");

function captureImage() {
    const webcam = document.getElementById("webcam");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // Capture the current frame from the webcam video
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
    context.drawImage(webcam, 0, 0, canvas.width, canvas.height);

    // Convert the captured image to a Blob and call uploadImage
    canvas.toBlob((blob) => {
        uploadImage(blob); // Call uploadImage with the captured image blob
    }, "image/png");
}

async function uploadImage(imageBlob = null) {
    const input = document.getElementById("imageInput");
    const status = document.getElementById("status");
    const ingredientsList = document.getElementById("ingredientsList");
    const recipesList = document.getElementById("recipes");
    const detectedIngredients = [];

    const formData = new FormData();

    if (imageBlob) {
        // Append webcam-captured image
        formData.append("image", imageBlob, "webcam-image.png");
    } else if (input.files.length) {
        // Append file-uploaded image
        formData.append("image", input.files[0]);
    } else {
        status.innerText = "Please select or capture an image first!";
        return;
    }

    try {
        const response = await fetch("http://localhost:3002/upload", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            status.innerText = "Image uploaded successfully!";
            ingredientsList.innerHTML = "";
            const detectedIngredients = result.ingredients.map((i) => i.trim());
            detectedIngredients.forEach((ingredient) => {
                const li = document.createElement("li");
                li.innerText = ingredient;
                li.style.cursor = "pointer";
                li.style.color = "blue";
                ingredientsList.appendChild(li);
                

            });
            fetchRecipes(detectedIngredients)
        } else {
            status.innerText = "Upload failed: " + result.error;
        }
        
    } catch (error) {
        status.innerText = "Error: " + error.message;
    }
}

//dfuvbwiubvuibviubviuubvufvgubvubuivbfbvuibvbfvuibfvbfduivbfiuvbuibv
async function fetchRecipes(ingredients) {
    const recipesList = document.getElementById("recipes");
    recipesList.innerHTML = `<p>Fetching recipes for ${ingredients}...</p>`;

    try {
        const query = encodeURIComponent(ingredients.join(","));
        const response = await fetch(`http://localhost:3002/recipes?ingredient=${query}`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.recipes && result.recipes.length > 0) {
            recipesList.innerHTML = "";
            result.recipes.forEach(recipe => {
                const li = document.createElement("li");
                li.innerText = recipe;
                li.onclick = () => fetchRecipeSteps(recipe, ingredients); // Pass ingredients here
                li.style.cursor = "pointer";
                li.style.color = "green";
                recipesList.appendChild(li);
            });
        } else {
            recipesList.innerHTML = `<p>No recipes found for these ingredients.</p>`;
        }
    } catch (error) {
        console.error("Error fetching recipes:", error);
        recipesList.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function fetchRecipeSteps(recipeName, ingredients) {
    const recipeSteps = document.getElementById("recipeSteps");
    recipeSteps.innerHTML = `<p>Loading steps for ${recipeName}...</p>`;

    try {
        const query = encodeURIComponent(ingredients.join(","));
        const url = `http://localhost:3002/recipe-steps?recipe=${encodeURIComponent(recipeName)}&ingredients=${query}`;
        console.log("Fetching recipe steps from:", url);

        const response = await fetch(url);
        const result = await response.json();
        recipeData2 = document.getElementById("recipeData");
        recipeData2.innerHTML = `<p>${result.data}</p>`;
       

        splitter(recipeName,result.steps);

        if (response.ok) {
            console.log("Received recipe steps:", result.steps);
            splitter(recipeName,result.steps);

            // Show missing ingredient selection
            const missingIngredientsList = document.getElementById("missingIngredients");
            missingIngredientsList.innerHTML = "";
            result.ingredients.forEach(ingredient => {
                const li = document.createElement("li");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = ingredient;
                li.appendChild(checkbox);
                li.appendChild(document.createTextNode(ingredient));
                missingIngredientsList.appendChild(li);
            });

            document.getElementById("modifyRecipeBtn").style.display = "block";
            document.getElementById("modifyRecipeBtn").setAttribute("data-recipe", recipeName);
        } else {
            console.error("Error fetching recipe steps:", result.error);
            recipeSteps.innerHTML = `<p>Error fetching recipe steps: ${result.error}</p>`;
        }
    } catch (error) {
        console.error("Error in fetchRecipeSteps:", error);
        recipeSteps.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function modifyRecipe() {
    const recipeName = document.getElementById("modifyRecipeBtn").getAttribute("data-recipe");
    const checkboxes = document.querySelectorAll("#missingIngredients input:checked");
    const missingIngredients = Array.from(checkboxes).map(cb => cb.value);

    if (missingIngredients.length === 0) {
        alert("No ingredients marked as missing.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3002/modify-recipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipe: recipeName, missingIngredients })
        });

        const result = await response.json();
        recipeData3 = document.getElementById("recipeData");
        recipeData3.innerHTML = `<p>${result.data}</p>`;
        splitter(recipeName,result.message);
        ensureStepButtons();

            
        
 
    } catch (error) {
        document.getElementById("recipeSteps").innerHTML = `<p>Error: ${error.message}</p>`;
    }
}


function splitter(recipeName, steps) {
    // Find the first occurrence of '1' and remove everything before it
    const firstStepIndex = steps.indexOf('1');
    const cleanedSteps = firstStepIndex !== -1 ? steps.substring(firstStepIndex) : steps;
    const normalizedSteps = cleanedSteps.replace(/(<br>\s*)+/g, '<br>');
    globalThis.stepsArray = normalizedSteps.split('<br>');
    //document.getElementById("nextStepBtn").style.display = "inline-block"; 
    //document.getElementById("prevStepBtn").style.display = "inline-block"; 
    

    globalThis.currentStep = 0;
    globalThis.recipeSteps = document.getElementById('recipeSteps');
  
    function displayStep() {
      recipeSteps.innerHTML = `<h4>${recipeName}</h4><p>${stepsArray[currentStep]}</p>`;
    }
  
    window.nextStep = function () {
      if (currentStep < stepsArray.length - 1) {
        currentStep++;
        displayStep();
      }
    };
  
    window.prevStep = function () {
      if (currentStep > 0) {
        currentStep--;
        displayStep();
      }
    };
    ensureStepButtons();

  
    // Initial display
    displayStep();
  }
  
  function ensureStepButtons() {
    let nextStepBtn = document.getElementById("nextStepBtn");
    let prevStepBtn = document.getElementById("prevStepBtn");

    // If the buttons do not exist, recreate them and add them back
    if (!nextStepBtn) {
        nextStepBtn = document.createElement("button");
        nextStepBtn.id = "nextStepBtn";
        nextStepBtn.innerText = "Next";
        nextStepBtn.onclick = nextStep;
        document.body.appendChild(nextStepBtn);
    }

    if (!prevStepBtn) {
        prevStepBtn = document.createElement("button");
        prevStepBtn.id = "prevStepBtn";
        prevStepBtn.innerText = "Previous";
        prevStepBtn.onclick = prevStep;
        document.body.appendChild(prevStepBtn);
    }

    // Ensure buttons are visible
    nextStepBtn.style.display = "inline-block";
    prevStepBtn.style.display = "inline-block";
}
