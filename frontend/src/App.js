import logo from './logo.svg';
import './App.css';
import React, { Component } from "react";
import { Accordion, Button, Card } from "react-bootstrap"
import { CartX, Plus, Dash } from "react-bootstrap-icons"
import axios from "axios";

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

    renderIngredients = (recipe) => {
        const ingredients = recipe.ingredients;
        return ingredients.map((ingredient) => (
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
        ));
    };

    renderRecipes = () => {
        const newItems = this.state.recipeList;
        return newItems.map((item) => (
            <Card>
                <Card.Header>
                    <div className="container">
                        <div className="row">
                            <div className="col-9">
                                <Accordion.Toggle as={Button} variant="link" eventKey={item.id}>
                                    <a data-toggle="collapse" data-parent="#recipe-list" href={"#collapse" + item.id}>
                                        {item.name}
                                    </a>
                                </Accordion.Toggle>
                            </div>
                            <div className="col-3 btn-group text-right">
                                <button type="button" className="btn btn-secondary" onClick={() => this.removeFromBasket(item.id)}><Dash /></button>
                                
                                <div className="btn btn-secondary">{this.state.basket.find(x => x.id === item.id).quantity}</div>
                                <button type="button" className="btn btn-secondary" onClick={() => this.addToBasket(item.id)}><Plus /></button>
                            </div>
                        </div>
                    </div>
                    
                </Card.Header>

                <Accordion.Collapse eventKey={item.id}>
                    <Card.Body>
                        <table className="table table-striped">
                            <tbody>
                                {this.renderIngredients(item)}
                            </tbody>
                        </table>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        ));
    };

    render() {
        return (
            <main className="container">
                <h1>Recipes</h1>
                <Accordion>
                    {this.renderRecipes()}
                </Accordion>
                <div onClick={() => this.resetBasket()}>
                    Empty<CartX />
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