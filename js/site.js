"use strict";

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
    const md = markdownit({
        html: true,
        linkify: true,
        typographer: true
    });

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('build-idx')) {
        document.body.innerHTML = await getIdx();
        return;
    }

    const recipeFile = urlParams.get('recipe');
    const recipe = await getRecipe(recipeFile);
    if (!recipe) {
        const recipeList = getRecipeList();
        document.getElementById("recipe-list").innerHTML = recipeList;
        document.getElementById("recipe-list-container").style.display = "block";
        document.getElementById("recipe-container").style.display = "none";
        return;
    }
    else {
        const [title, description, ingredients, instructions, notes, meta] = await parseMarkdown(recipe);
        document.title = title;
        document.getElementById("title").innerHTML = title;
        document.getElementById("description").innerHTML = md.render(description);
        document.getElementById("ingredients-container").innerHTML = md.render(ingredients);
        document.getElementById("instructions-container").innerHTML = md.render(instructions);
        document.getElementById("notes-container").innerHTML = md.render(notes);
        document.getElementById("recipe-container").style.display = "block";
    }
}

async function getIdx() {
    const newIdx = [];
    for (const file of FILE_LIST) {
        const recipe = await getRecipe(file);
        const [title, description, ingredients, instructions, notes, meta] = await parseMarkdown(recipe);
        newIdx.push({file:file, title:title, categories:meta.categories});
    };

    return `<pre>const FILE_IDX = ${JSON.stringify(newIdx, null, 4)};</pre>`;
}

async function getRecipe(recipeFile) {
    if (!recipeFile) { return }

    const result = await fetch(`/recipes/${recipeFile}`);
    if (result.ok) { return result.text() }
    
    return null;
}

function getRecipeList() {
    const cats = {};
    FILE_IDX.forEach((element) => {
        if (!element.categories) {element.categories = ['unclassified']}
        if (!cats[element.categories[0]]) {cats[element.categories[0]] = []}
        cats[element.categories[0]].push(element);
    });

    let retHtml = '';
    for (let key in cats) {
        retHtml += `<div>${capitalizeFirstLetter(key)}</div><ul>`
        console.log(key, cats[key]);
        cats[key].forEach((element) => {
            retHtml += `<li><a href="/?recipe=${element.file}">${element.title}</a></li>`
        });

        retHtml += '</ul>';
    }
    return retHtml;
}

async function parseMarkdown(markdown) {

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
    description = description.replaceAll(/img src=".\/images\//g, 'img src="/recipes/images\/');


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
