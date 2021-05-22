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
                    <input type="checkbox" className="form-input" />
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
                                <div className="btn btn-secondary">{this.props.basket.find(x => x.id === recipe.id).quantity}</div>
                                <button type="button" className="btn btn-secondary" onClick={() => this.props.addToBasket(recipe.id)}><Plus /></button>
                            </div>
                        </div>
                    </div>
                </Card.Header>

                <Accordion.Collapse eventKey={recipe.id}>
                    <Card.Body>
                        <table className="table table-striped">
                            <tbody>
                                <Ingredients ingredients={recipe.ingredients} />
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
        const basket = this.props.basket;
        let ingredients = [];
        recipes.map((recipe) => {
            console.log(basket, recipe.id, basket[recipe.id], recipes, recipe)
            if (basket[recipe.id].quantity > 0) {
                recipe.map((ingredient) => {
                    if (ingredients.findIndex(e => e.ingredient === ingredient.ingredient) === -1) {
                        ingredients.push({
                            ingredient: ingredient.ingredient,
                            quantity: ingredient.quantity,
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
/*        const ingredients = this.getIngredients();
        console.log(ingredients);
        return ingredients.map((ingredient) => (
            <div key={ingredient.id}>Test</div>
        ));*/
        return (
            <div>Test</div>
        );
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
                const basket = res.data.map(recipe => ({
                    id: recipe.id,
                    quantity: 0
                }))
                this.setState({ recipeList: res.data, basket: basket })

            })
         .catch((err) => console.log(err));
    };

    resetBasket = () => {
        const basket = this.state.recipeList;
        this.setState({
            basket: this.state.recipeList.map(recipe => ({
                id: recipe.id,
                quantity: 0,
            }))
        });
    };

    addToBasket(recipeID) {
        const basket = this.state.basket;
        basket.find(x => x.id === recipeID).quantity++;
        this.setState({ basket: basket });
    }

    removeFromBasket(recipeID) {
        const basket = this.state.basket;
        basket.find(x => x.id === recipeID).quantity--;
        this.setState({ basket: basket });
    }

    render() {
        const recipes = this.state.recipeList;
        const basket = this.state.basket;
        return (
            <main className="container">
                <h1>Recipes</h1>
                <Accordion>
                    <Recipes
                        recipes={recipes}
                        basket={basket}
                        addToBasket={id => this.addToBasket(id)}
                        removeFromBasket={id => this.removeFromBasket(id)}
                    />
                </Accordion>
                <div className="card">
                    <div className="card-header">
                        <div onClick={() => this.resetBasket()}>
                            Empty<CartX />
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

function units() {
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

function simplifyUnits(quantity, unit) {
    const units = units();
    if (unit in units) {
        while (true) {
            const unitNext = units[unit].next;
            const unitPrev = units[unit].prev;
            console.log(unit);
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
    return ["SUCCESS", quantity, unit];
}

function addMeasurements(measurements) {
    const units = units();
    var results = {}
    for (const measurement of measurements) {
        if (measurement.unit in units) {
            const dimension = units[measurement.unit].dimension;
            if (dimension in results) {

            } else {
                results[dimension] = measurement.quantity;
            }
        }
    }
}