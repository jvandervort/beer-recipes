import { filterRecipes } from './modules/search.js';

// all recipes need to be added manually to FILE_LIST
// and FILE_IDX needs to be rebuilt using URL: /?build-idx
const FILE_LIST = [
    'belgian_pale_ale.md'
    ,'cristies_amber_ale.md'
    ,'german_alt_bier.md'
    ,'pale_ale.md'
    ,'sierra_nevada_pale_ale.md'
    ,'sonoran_amber_cerveza.md'  
];
const FILE_IDX = [
    {
        "file": "belgian_pale_ale.md",
        "title": "Belgian Pale Ale",
        "categories": [
            "pale ale",
            "belgian"
        ]
    },
    {
        "file": "cristies_amber_ale.md",
        "title": "Cristie's Amber Ale",
        "categories": [
            "amber ale",
            "american"
        ]
    },
    {
        "file": "german_alt_bier.md",
        "title": "German Altbier-1",
        "categories": [
            "altbier",
            "german"
        ]
    },
    {
        "file": "pale_ale.md",
        "title": "Pale Ale",
        "categories": [
            "pale ale",
            "american"
        ]
    },
    {
        "file": "sierra_nevada_pale_ale.md",
        "title": "Sierra Nevada Pale Ale",
        "categories": [
            "pale ale",
            "american"
        ]
    },
    {
        "file": "sonoran_amber_cerveza.md",
        "title": "Sonoran Amber Cerveza",
        "categories": [
            "amber lager",
            "mexican"
        ]
    }
];

document.addEventListener("DOMContentLoaded", function(event) { 
    init();
});

async function init() {
    const searchBox = document.getElementById('search-box');
    searchBox.onkeyup = function(evt) {
        document.getElementById("recipe-list").innerHTML = getRecipeListHtml(searchBox.value.trim());
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('build-idx')) {
        document.body.innerHTML = await getIdx();
        return;
    }

    const mdFilename = urlParams.get('recipe');
    const mdText = await getFullMdText(mdFilename);
    if (!mdText) {
        const recipeList = getRecipeListHtml('');
        document.getElementById("recipe-list").innerHTML = recipeList;
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
    
        const [title, mdDescription, mdIngredients, mdInstructions, mdNotes, meta] = await getMdSections(mdText);
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

async function getIdx() {
    const newIdx = [];
    for (const file of FILE_LIST) {
        const recipe = await getFullMdText(file);
        const [title, description, ingredients, instructions, notes, meta] = await getMdSections(recipe);
        newIdx.push({file:file, title:title, categories:meta.categories});
    };

    return `<pre>const FILE_IDX = ${JSON.stringify(newIdx, null, 4)};</pre>`;
}

async function getFullMdText(recipeFile) {
    if (!recipeFile) { return }

    const result = await fetch(`./recipes/${recipeFile}`);
    if (result.ok) { return result.text() }
    
    return null;
}

function getRecipeListHtml(searchVal) {
    let retHtml = '';
    let recipeList = filterRecipes(FILE_IDX, searchVal);
    Object.keys(recipeList).sort().forEach((key) => {
        retHtml += `<div>${capitalizeFirstLetter(key)}</div><ul>`
        recipeList[key].forEach((element) => {
            retHtml += `<li><a href="index.html?recipe=${element.file}">${element.title}</a></li>`;
        });
        retHtml += '</ul>';
    });
    return retHtml;
}

async function getMdSections(markdown) {

    const meta = {};
    const regexMeta = /^---[\s\S]*?(?=^---)/gm;
    const regexKeyValue = /\s*([a-z-]*):\s*(.*)/g;
    let metaList = [];
    while ((metaList = regexMeta.exec(markdown)) !== null) {
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
    const headerExec = regexHeader.exec(markdown)
    const title = headerExec[3];
    let description = headerExec[4];

    // hack because local markdown doesn't have the correct paths for web server
    description = description.replaceAll(/img src=".\/images\//g, 'img src="./recipes/images\/');


    let ingredients = '';
    let instructions = '';
    let notes = '';
    const regexSubheading = /^## [\s\S]*?(?=^## |(?![\S\s]))/gm;
    let myArray;
    while ((myArray = regexSubheading.exec(markdown)) !== null) {
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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
