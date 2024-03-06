
export function getHtmlSections(mdText) {
    const [title, mdDescription, mdIngredients, mdInstructions, mdNotes, meta] = getMdSections(mdText);
 
    const md = markdownit({
        html: true,
        linkify: true,
        typographer: true
    });

    const htmlDescription = md.render(mdDescription);
    const htmlIngredients = md.render(mdIngredients);
    const htmlInstructions = md.render(mdInstructions);
    const htmlNotes = md.render(mdNotes);
    
    return [title, htmlDescription, htmlIngredients, htmlInstructions, htmlNotes, meta];
}

export function getRecipeListHtml(recipeListGrouped) {
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

export function getMdSections(mdText) {
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
