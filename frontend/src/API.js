import axios from "axios";

class RecipeAPI {
    constructor() {
        axios.defaults.xsrfCookieName = 'csrftoken';
        axios.defaults.xsrfHeaderName = 'X-CSRFToken';
        this.tempData = null;
    }

    // getRecipes currently handled in App.js
/*    getRecipes() {
        axios
            .get("/api/recipes/")
            .then((res) => {
                const recipes = res.data.map(obj => ({
                    ...obj,
                    quantity: 0,
                    ingredients: obj.ingredients.map(ing => ({
                        ...ing,
                        include: true,
                    }))
                }));
                this.tempData = recipes;

            })
            .catch((err) => console.log(err));
        console.log(this.tempData);
        return this.tempData;
    }*/

    addRecipe(recipe) {
        if (recipe.id === null) {
            axios
                .post("/api/recipes/", recipe)
                .then((res) => this.addIngredients(recipe.ingredients, res.data.id))
                .then((res) => console.log(res));
        } else {
            axios
                .put(`/api/recipes/${recipe.id}/`, recipe)
                .then((res) => this.addIngredients(recipe.ingredients, res.data.id))
                .then((res) => console.log(res));
        }
    }

    addIngredients(ingredients, recipeID) {
        ingredients.map(ingredient => {
            if ("newIngredient" in ingredient) {
                axios.post("/api/ingredients/", {
                    ...ingredient,
                    recipe: recipeID
                }).then((res) => console.log(res));
            } else {
                axios.put(`/api/ingredients/${ingredient.id}/`, {
                    ...ingredient,
                    recipe: recipeID
                }).then((res) => console.log(res));
            }
        });
    }
    
}

export default RecipeAPI;