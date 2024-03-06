import { getRecipeFile } from './recipe_service.js';

// all recipes need to be added manually to fileList
// and fileIdx needs to be rebuilt using URL: /?build-idx
export const fileList = [
    'belgian_pale_ale.md'
    ,'cristies_amber_ale.md'
    ,'german_alt_bier.md'
    ,'pale_ale.md'
    ,'sierra_nevada_pale_ale.md'
    ,'sonoran_amber_cerveza.md'  
];

export const fileIdx = [
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

export async function getIdxJson() {
    let newIdx = getIdx();
    return JSON.stringify(newIdx, null, 4);
}

async function getIdx() {
    const newIdx = [];
    for (const file of fileList) {
        const recipe = await getRecipeFile(file);
        const [title, description, ingredients, instructions, notes, meta] = await getMdSections(recipe);
        newIdx.push({file:file, title:title, categories:meta.categories});
    };
    return newIdx;
}