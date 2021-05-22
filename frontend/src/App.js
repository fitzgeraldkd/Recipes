import logo from './logo.svg';
import './App.css';
import React, { Component } from "react";
import { Accordion, Button, Card } from "react-bootstrap"
import { CartX, Plus, Dash } from "react-bootstrap-icons"
import axios from "axios";

class Ingredients extends Component {
    render() {
        const results = this.props.ingredients.map((ingredient) => (
            <React.Fragment key={ingredient.id}>
                <tr key={ingredient.id}>
                    <td>
                        {console.log(1)}
                        <input
                            type="checkbox"
                            className="form-input"
                            checked={ingredient.include}
                            data-recipeid={ingredient.recipe}
                            data-ingredientid={ingredient.id}
                            onChange={this.props.toggleIngredient} />
                    </td>
                    <td className="text-right">
                        {ingredient.quantity}
                    </td>
                    <td>
                        {ingredient.measurement}
                    </td>
                    <td>
                        {ingredient.ingredient}
                    </td>
                    <td>
                        {ingredient.prepared}
                    </td>
                    </tr>
                </React.Fragment>
        ));
        return results;
    }
}

class Recipes extends Component {
    render() {
        return this.props.recipes.map((recipe) => (
            <Card>
                <Card.Header>
                    <div className="container">
                        <div className="row">
                            <div className="col-9">
                                <Accordion.Toggle as={Button} variant="link" eventKey={recipe.id}>
                                    <a data-toggle="collapse" data-parent="#recipe-list" href={"#collapse" + recipe.id}>
                                        {recipe.name}
                                    </a>
                                </Accordion.Toggle>
                            </div>
                            <div className="col-3 btn-group text-right">
                                <button type="button" className="btn btn-secondary" onClick={() => this.props.removeFromBasket(recipe.id)}><Dash /></button>
                                <div className="btn btn-secondary">{recipe.quantity}</div>
                                <button type="button" className="btn btn-secondary" onClick={() => this.props.addToBasket(recipe.id)}><Plus /></button>
                            </div>
                        </div>
                    </div>
                </Card.Header>

                <Accordion.Collapse eventKey={recipe.id}>
                    <Card.Body>
                        <table className="table table-striped">
                            <tbody>
                                <Ingredients
                                    ingredients={recipe.ingredients}
                                    toggleIngredient={this.props.toggleIngredient}
                                />
                            </tbody>
                        </table>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        ));
    }
}

class Basket extends Component {
    getIngredients() {
        const recipes = this.props.recipes;
        let ingredients = [];
        recipes.map((recipe) => {
            if (recipe.quantity > 0) {
                recipe.ingredients.map((ingredient) => {
                    if (ingredient.include && ingredients.findIndex(e => e.ingredient === ingredient.ingredient) === -1) {
                        ingredients.push({
                            ingredient: ingredient.ingredient,
                            quantity: ingredient.quantity * recipe.quantity,
                            measurement: ingredient.measurement
                        });
                    } else {
                        
                    }
                })
            }
        });
        return ingredients;
    }

    render() {
        const ingredients = this.getIngredients();
        return ingredients.map((ingredient) => (
            <div key={ingredient.id}>
                {simplifyUnits(ingredient.quantity, ingredient.measurement)}
                {" "}
                {ingredient.ingredient}
            </div>
        ));
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeList: [],
            basket: [],
        };
    }

    componentDidMount() {
        this.refreshList();
    }

    componentDidUpdate() {
    }

    refreshList = () => {
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
                this.setState({ recipeList: recipes})

            })
         .catch((err) => console.log(err));
    };

    resetBasket = () => {
        const recipeList = this.state.recipeList.map(obj => ({ ...obj, quantity: 0 }));
        this.setState({ recipeList: recipeList });
    };

    addToBasket(recipeID) {
        const recipeList = this.state.recipeList;
        recipeList.find(x => x.id === recipeID).quantity++;
        this.setState({ recipeList: recipeList });
    }

    removeFromBasket(recipeID) {
        const recipeList = this.state.recipeList;
        if (recipeList.find(x => x.id === recipeID).quantity > 0) {
            recipeList.find(x => x.id === recipeID).quantity--
        }
        this.setState({ recipeList: recipeList });
    }

    toggleIngredientB = (event) => {
        console.log(event);
        const recipeID = parseInt(event.target.dataset.recipeid);
        const ingredientID = parseInt(event.target.dataset.ingredientid);
        const recipeList = this.state.recipeList;
        console.log(recipeID, ingredientID)
        recipeList.find(x => x.id === recipeID).ingredients.find(y => y.id === ingredientID).include ^= true;
        this.setState({ recipeList: recipeList });
    }

    toggleIngredient(recipeID, ingredientID) {
        const recipeList = this.state.recipeList;
        recipeList.find(x => x.id === recipeID).ingredients.find(y => y.id === ingredientID).include ^= true;
        this.setState({ recipeList: recipeList });
    }

    render() {
        const recipes = this.state.recipeList;
        return (
            <main className="container">
                <h1>Recipes</h1>
                <Accordion>
                    {console.log(recipes)}
                    <Recipes
                        recipes={recipes}
                        addToBasket={id => this.addToBasket(id)}
                        removeFromBasket={id => this.removeFromBasket(id)}
                        toggleIngredient={this.toggleIngredientB}
                    />
                </Accordion>
                <div className="card">
                    <div className="card-header">
                        Shopping List
                        <div onClick={() => this.resetBasket()}>
                            Empty <CartX />
                        </div>
                    </div>
                    <div className="card-body">
                        <Basket
                            recipes={recipes}
                        />
                    </div>
                </div>
            </main>
        );
    }
}

export default App;

function roundDecimal(value, decimalPlace) {
    return Math.round(value * (10 ** decimalPlace)) / (10 ** decimalPlace)
}

function measurementUnits() {
    const units = {
        // Volume
        cup: {
            min: 0.25,
            dimension: "volume",
            next: null,
            prev: "tbsp",
            conversion: {
                floz: 8,
                tbsp: 16,
                tsp: 48,
            }
        },
        floz: {
            min: 1,
            dimension: "volume",
            next: "cup",
            prev: "tbsp",
            conversion: {
                tbsp: 2,
                tsp: 6,
            }
        },
        tbsp: {
            min: 1,
            dimension: "volume",
            next: "floz",
            prev: "tsp",
            conversion: {
                tsp: 3,
            }
        },
        tsp: {
            min: 0,
            dimension: "volume",
            next: "tbsp",
            prev: null,
            conversion: {

            }
        }
    };
    return units;
}

function simplifyUnits(quantity, unit=null) {
    const units = measurementUnits();
    if (unit in units) {
        while (true) {
            const unitNext = units[unit].next;
            const unitPrev = units[unit].prev;
            if (quantity < units[unit].min && unitPrev != null) {
                quantity *= units[unit].conversion[unitPrev];
                unit = unitPrev;
            } else if (unitNext != null) {
                if (quantity >= units[unitNext].min * units[unitNext].conversion[unit]) {
                    quantity /= units[unitNext].conversion[unit];
                    unit = unitNext;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }
    return [quantity, " ", unit];
}

function addMeasurements(measurements) {
    const units = measurementUnits();
    var results = {}
    for (const measurement of measurements) {
        if (measurement.unit in units) {
            const dimension = units[measurement.unit].dimension;
            if (dimension in results) {
                results[dimension].push([{ quantity: measurement.quantity, unit: measurement.unit}])
            } else {
                results[dimension] = [{ quantity: measurement.quantity, unit: measurement.unit }];
            }
        }
    }
}