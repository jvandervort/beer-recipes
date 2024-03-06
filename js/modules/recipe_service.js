
export async function getRecipeFile(recipeFileName) {
    if (!recipeFileName) { return }
    const result = await fetch(`./recipes/${recipeFileName}`);
    if (result.ok) { return result.text() }
    return null;
}