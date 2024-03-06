import { fileIdx, getIdxJson  } from './modules/recipe_idx.js'; 
import { filterRecipes } from './modules/search.js';
import { getRecipeFile } from './modules/recipe_service.js';
import { getHtmlSections, getRecipeListHtml } from './modules/recipe_transformer.js';

document.addEventListener("DOMContentLoaded", function(event) { 
    init();
});

async function init() {
    document.getElementById('search-box').onkeyup = function(evt) {
        let recipeList = filterRecipes(fileIdx, this.value.trim());
        document.getElementById("recipe-list").innerHTML = getRecipeListHtml(recipeList);
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('build-idx')) {
        let newIdxJson = await getIdxJson();
        document.body.innerHTML = `<pre>const fileIdx = ${newIdxJson};</pre>`;
        return;
    }

    const mdFilename = urlParams.get('recipe');
    const mdText = await getRecipeFile(mdFilename);
    if (!mdText) {
        const recipeList = filterRecipes(fileIdx, '');
        const recipeListHtml = getRecipeListHtml(recipeList);
        document.getElementById("recipe-list").innerHTML = recipeListHtml;
        document.getElementById("recipe-list-container").style.display = "block";
        document.getElementById("recipe-container").style.display = "none";
        return;
    }
    else {
        const [title, htmlDescription, htmlIngredients, htmlInstructions, htmlNotes, meta] = getHtmlSections(mdText);
        document.title = title;
        document.getElementById("title").innerHTML = title;
        document.getElementById("description").innerHTML = htmlDescription;
        document.getElementById("ingredients-container").innerHTML = htmlIngredients;
        document.getElementById("instructions-container").innerHTML = htmlInstructions;
        document.getElementById("notes-container").innerHTML = htmlNotes;
        document.getElementById("recipe-container").style.display = "block";
        return;
    }
}
