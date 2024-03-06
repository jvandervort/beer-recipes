
function filterRecipes(fileIdx, searchVal) {
    let recipeList = [];

    // filter recipes
    if (!searchVal) {
        recipeList = fileIdx;
    }
    else {
        recipeList = fileIdx.filter((r) => r.title.toLowerCase().indexOf(searchVal.toLowerCase()) >= 0);
    }
    
    // create category groups
    let cats = {}
    recipeList.forEach((element) => {
        if (!element.categories) {element.categories = ['unclassified']}
        if (!cats[element.categories[0]]) {cats[element.categories[0]] = []}
        cats[element.categories[0]].push(element);
    });

    // sort category groups
    let sortedKeys = Object.keys(cats).sort();
    sortedKeys.forEach((key) => {
        // sort cat recipes
        cats[key] = cats[key].sort((a, b) => a.title.localeCompare(b.title));
    });

    return cats;
} 

export { filterRecipes };