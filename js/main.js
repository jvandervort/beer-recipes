import { fileList, fileIdx, getIdxJson  } from './modules/recipe_idx.js'; 
import { filterRecipes } from './modules/search.js';

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
    const mdText = await getFullMdText(mdFilename);
    if (!mdText) {
        const recipeList = filterRecipes(fileIdx, '');
        const recipeListHtml = getRecipeListHtml(recipeList);
        document.getElementById("recipe-list").innerHTML = recipeListHtml;
        document.getElementById("recipe-list-container").style.display = "block";
        document.getElementById("recipe-container").style.display = "none";
        return;
    }
    else {
        const md = markdownit({
            html: true,
            linkify: true,
            typographer: true
        });
    
        const [title, mdDescription, mdIngredients, mdInstructions, mdNotes, meta] = getMdSections(mdText);
        document.title = title;
        document.getElementById("title").innerHTML = title;
        document.getElementById("description").innerHTML = md.render(mdDescription);
        document.getElementById("ingredients-container").innerHTML = md.render(mdIngredients);
        document.getElementById("instructions-container").innerHTML = md.render(mdInstructions);
        document.getElementById("notes-container").innerHTML = md.render(mdNotes);
        document.getElementById("recipe-container").style.display = "block";
        return;
    }
}

function getMdSections(mdText) {
    const meta = {};
    const regexMeta = /^---[\s\S]*?(?=^---)/gm;
    const regexKeyValue = /\s*([a-z-]*):\s*(.*)/g;
    let metaList = [];
    while ((metaList = regexMeta.exec(mdText)) !== null) {
        let keyValList = [];
        while ((keyValList = regexKeyValue.exec(metaList[0])) !== null) {
            if (keyValList[1] === 'categories') {
                meta[keyValList[1]] = keyValList[2].split(",").map(item=>item.trim());
            }
            else {
                meta[keyValList[1]] = keyValList[2];
            }
            
        }
    }

    const regexHeader = /(^|\n)(# (.+))([^#]+?)(## )/gm;
    const headerExec = regexHeader.exec(mdText)
    const title = headerExec[3];
    let description = headerExec[4];

    // hack because local markdown doesn't have the correct paths for web server
    description = description.replaceAll(/img src=".\/images\//g, 'img src="./recipes/images\/');


    let ingredients = '';
    let instructions = '';
    let notes = '';
    const regexSubheading = /^## [\s\S]*?(?=^## |(?![\S\s]))/gm;
    let myArray;
    while ((myArray = regexSubheading.exec(mdText)) !== null) {
        if (myArray[0].startsWith('## Ingredients')) {
            ingredients = myArray[0];
        }
        else if (myArray[0].startsWith('## Instructions')) {
            instructions = myArray[0];
        }
        else if (myArray[0].startsWith('## Notes')) {
            notes = myArray[0];
        }
    }

    return [title, description, ingredients, instructions, notes, meta];
}

async function getFullMdText(recipeFileName) {
    if (!recipeFileName) { return }
    const result = await fetch(`./recipes/${recipeFileName}`);
    if (result.ok) { return result.text() }
    return null;
}

function getRecipeListHtml(recipeListGrouped) {
    let retHtml = '';
    Object.keys(recipeListGrouped).sort().forEach((key) => {
        retHtml += `<div>${capitalizeFirstLetter(key)}</div><ul>`
        recipeListGrouped[key].forEach((element) => {
            retHtml += `<li><a href="index.html?recipe=${element.file}">${element.title}</a></li>`;
        });
        retHtml += '</ul>';
    });
    return retHtml;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

