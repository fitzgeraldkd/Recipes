//import logo from './logo.svg';
import './App.css';
import React, { Component } from "react";
import { Accordion } from "react-bootstrap"
import { CartX } from "react-bootstrap-icons"
import axios from "axios";
import { ExportModal } from "./Export.js";
import { RecipeModal, Recipes } from "./Recipes.js";
import { roundDecimal, simplifyUnits, addMeasurements } from "./Units.js";
import RecipeAPI from "./API.js";
const clonedeep = require('lodash.clonedeep')

class Basket extends Component {
    renderMeasurements(measurementSum) {
        return measurementSum.map(measurement => (
            <React.Fragment key={measurement.unit}>
                {roundDecimal(measurement.quantity, 1)}
                {" "}
                {measurement.unit}
                {" "}
            </React.Fragment>
        ));
    }

    render() {
        const ingredients = this.props.basket;
        return ingredients.map((ingredient) => (
            <div key={ingredient.id}>
                {this.renderMeasurements(ingredient.measurementSum)}
                {ingredient.name}
            </div>
        ));
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recipes: [],
            ingredients: [],
            basket: [],
            modal: {
                export: false
            },
            auth: {
                google: false
            },
            tasklists: [],
            activeRecipe: null,
            recipeAPI: new RecipeAPI()
        };
    }

    componentDidMount() {
        this.refreshRecipes();
        //this.addRecipe();
    }

    componentDidUpdate() {
    }

    refreshRecipes = () => {
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
                this.setState({ recipes: recipes}, this.refreshIngredients())

            })
         .catch((err) => console.log(err));
    };

    refreshIngredients = () => {
        axios
            .get("/api/ingredients/")
            .then((res) => {
                const ingredients = Array.from(new Set(res.data.map(obj => { return obj.name }))).sort();
                this.setState({ ingredients: ingredients });
        })
    }

    addRecipe = (recipe) => {
/*        const recipe = {
            name: "Test Recipe",
            ingredients: [
                {
                    ingredient_name: "Milk",
                    ingredient: 3,
                    quantity: 50,
                    measurement: "cup",
                    prepared: "",
                    optional: false
                }
            ]
        };*/
        this.state.recipeAPI.addRecipe(recipe);
        this.refreshRecipes();
    };

    addActiveRecipe = () => {
        this.addRecipe(this.state.activeRecipe);
    }

    resetBasket = () => {
        const recipes = this.state.recipes.map(obj => ({ ...obj, quantity: 0 }));
        this.setState({ recipes: recipes }, () => this.updateBasket());
    };

    addToBasket(recipeID) {
        const recipes = this.state.recipes;
        recipes.find(x => x.id === recipeID).quantity++;
        this.setState({ recipes: recipes }, () => this.updateBasket());
    }

    removeFromBasket(recipeID) {
        const recipes = this.state.recipes;
        if (recipes.find(x => x.id === recipeID).quantity > 0) {
            recipes.find(x => x.id === recipeID).quantity--
        }
        this.setState({ recipes: recipes }, () => this.updateBasket());
    }

    toggleIngredient = (event) => {
        const recipeID = parseInt(event.target.dataset.recipeid);
        const ingredientID = parseInt(event.target.dataset.ingredientid);
        const recipes = this.state.recipes;
        recipes.find(x => x.id === recipeID).ingredients.find(y => y.id === ingredientID).include ^= true;
        this.setState({ recipes: recipes });
        this.updateBasket();
    }

    updateBasket() {
        const recipes = this.state.recipes;
        const ingredients = [];
        recipes.map((recipe) => {
            if (recipe.quantity > 0) {
                recipe.ingredients.map((ingredient) => {
                    if (ingredient.include) {
                        if (ingredients.findIndex(ing => ing.name === ingredient.name) === -1) {
                            ingredients.push({
                                name: ingredient.name,
                                measurements: [{
                                    quantity: ingredient.quantity * recipe.quantity,
                                    unit: ingredient.unit
                                }]
                            });
                        } else {
                            ingredients.find(ing => ing.name === ingredient.name).measurements.push({
                                quantity: ingredient.quantity * recipe.quantity,
                                unit: ingredient.unit
                            });
                        }
                    }
                })
            }
        });
        const basket = ingredients.map(ingredient => ({
            ...ingredient,
            measurementSum: addMeasurements(ingredient.measurements).map(e => simplifyUnits(e))
        }));
        this.setState({ basket: basket });
    }

    updateAuth = (domain, newAuth) => {
        const auth = this.state.auth;
        auth[domain] = newAuth;
        this.setState({ auth: auth });
    }

    updateModal = (modalWindow, value) => {
        const modal = this.state.modal;
        modal[modalWindow] = value;
        this.setState({ modal: modal });
    };

    updateTasklists = (tasklists) => {
        this.setState({ tasklists: tasklists });
    };

    updateActiveRecipe = (recipe=null) => {
        let activeRecipe = null;
        if (recipe === null) {
            activeRecipe = {
                id: null,
                name: "",
                ingredients: [{
                    id: 0,
                    name: "",
                    quantity: "",
                    measurement: "",
                    prepared: "",
                    optional: false,
                    newIngredient: true
                }]
            };
        } else {
            activeRecipe = clonedeep(recipe);
        }
        this.setState({ activeRecipe: activeRecipe });
    };

    activeRecipeAddIngredient = () => {
        const activeRecipe = this.state.activeRecipe;
        const newId = activeRecipe.ingredients[activeRecipe.ingredients.length - 1].id + 1;
        activeRecipe.ingredients.push({
            id: newId,
            name: "",
            quantity: "",
            measurement: "",
            prepared: "",
            optional: false,
            newIngredient: true
        })
        this.setState({ activeRecipe: activeRecipe });
    }

    render() {
        const recipes = this.state.recipes;
        const modal = this.state.modal;
        const auth = this.state.auth;
        const tasklists = this.state.tasklists;
        const basket = this.state.basket;
        const activeRecipe = this.state.activeRecipe;
        const ingredients = this.state.ingredients;
        return (
            <main className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="container">
                            <div className="row">
                                <div className="col-6">
                                    <h2>Recipes</h2>
                                </div>
                                <div className="col-6">
                                    <RecipeModal
                                        modal={modal}
                                        updateModal={this.updateModal}
                                        activeRecipe={activeRecipe}
                                        updateActiveRecipe={this.updateActiveRecipe}
                                        activeRecipeAddIngredient={this.activeRecipeAddIngredient}
                                        ingredients={ingredients}
                                        addActiveRecipe={this.addActiveRecipe}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <Accordion>
                            <Recipes
                                recipes={recipes}
                                addToBasket={id => this.addToBasket(id)}
                                removeFromBasket={id => this.removeFromBasket(id)}
                                toggleIngredient={this.toggleIngredient}
                                updateModal={this.updateModal}
                                updateActiveRecipe={this.updateActiveRecipe}
                            />
                        </Accordion>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <div className="container">
                            <div className="row">
                                <div className="col-6">
                                    <h2>Basket</h2>
                                </div>
                                <div className="col-6">
                                    <ExportModal
                                        modal={modal}
                                        updateModal={this.updateModal}
                                        auth={auth}
                                        updateAuth={this.updateAuth}
                                        tasklists={tasklists}
                                        updateTasklists={this.updateTasklists}
                                        basket={basket}
                                    />
                                    <button type="button" className="btn btn-danger float-right" onClick={() => this.resetBasket()}>Empty <CartX /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <Basket
                            recipes={recipes}
                            basket={basket}
                        />
                    </div>
                </div>
            </main>
        );
    }
}

export default App;