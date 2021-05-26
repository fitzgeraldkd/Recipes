import logo from './logo.svg';
import './App.css';
import React, { Component } from "react";
import { Accordion, Button, Card, Modal } from "react-bootstrap"
import { CartX, Plus, Dash } from "react-bootstrap-icons"
import axios from "axios";
import { gapiKey, gapiOAuthClientID, gapiOAuthClientSecret } from "./apikey.js";

class ModalTaskLists extends Component {
    render() {
        const tasklists = this.props.tasklists;
        console.log(tasklists);
        return tasklists.map((tasklist) => (
            <button key={tasklist.id} type="button" className="list-group-item list-group-item-action" onClick={() => this.props.addTasks(tasklist.id) }>
                {tasklist.title}
            </button>
        ));
    }
}

class TasksAPI extends Component {
    handleClientLoad = () => {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/client.js";
        
        script.onload = () => {
            const getFunction = this.initClient();
            window.gapi.load('client:auth2', getFunction)
        };

        document.body.appendChild(script);
    };

    initClient = () => {
        const signin = this.updateSigninStatus;
        window.gapi.load("client", () => {
            window.gapi.client.init({
                apiKey: gapiKey(),
                clientId: gapiOAuthClientID(),
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest"],
                scope: "https://www.googleapis.com/auth/tasks"
            }).then(function () {
                window.gapi.auth2.getAuthInstance().isSignedIn.listen(signin);
                signin(window.gapi.auth2.getAuthInstance().isSignedIn.get());
            }, function (error) {
                this.appendPre(JSON.stringify(error, null, 2));
            })
        })
    };

    updateSigninStatus = (isSignedIn) => {
        if (isSignedIn) {
            this.props.updateAuth("google", true);
        } else {
            this.props.updateAuth("google", false);
        }
    };

    handleAuthClick = (event) => {
        window.gapi.auth2.getAuthInstance().signIn();
    };

    handleSignoutClick = (event) => {
        window.gapi.auth2.getAuthInstance().signOut();
    }

    listTaskLists = () => {
        const updateTasklists = this.props.updateTasklists;
        const tasklists = [];
        window.gapi.client.tasks.tasklists.list({
            'maxResults': 10
        }).then(function (response) {
            tasklists.push(...response.result.items);
            updateTasklists(tasklists);
        });
    };

    addTasks = (tasklist) => {
        console.log(tasklist);
        console.log(this.props.basket);
        this.props.basket.map((ingredient) => {
            console.log(ingredient);
            const taskTitle = "test";
            window.gapi.client.tasks.tasks.insert({
                "tasklist": tasklist,
                "resource": {
                    "title": taskTitle
                }
            });
        });
    }

    componentDidMount() {
        this.handleClientLoad();
    }

    render() {
        //const tasklists = this.listTaskLists();
        const gapiButtons = () => {
            if (this.props.auth.google) {
                return (
                    <>
                        <div>
                            <button type="button" className="btn" onClick={() => this.listTaskLists()}>Get Tasklists</button>
                            <button type="button" className="btn" onClick={() => this.handleSignoutClick()}>Sign Out of Google</button>
                        </div>
                        <div className="list-group">
                            <ModalTaskLists
                                tasklists={this.props.tasklists}
                                addTasks={this.addTasks}
                            />
                        </div>
                    </>
                );
            } else {
                return (
                    <button type="button" className="btn" onClick={() => this.handleAuthClick()}>Sign In to Google</button>
                );
            }
        };

        return (
            <>
                {gapiButtons()}
            </>
        );
    }
}

class ExportModal extends Component {
    render() {
        const show = this.props.modal.export
        const handleClose = () => this.props.updateModal("export", false);
        const handleShow = () => this.props.updateModal("export", true);

        return (
            <>
                <Button variant="primary" onClick={handleShow}>Export</Button>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Export</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <TasksAPI
                            auth={this.props.auth}
                            updateAuth={this.props.updateAuth}
                            tasklists={this.props.tasklists}
                            updateTasklists={this.props.updateTasklists}
                            basket={this.props.basket}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Close</Button>
                    </Modal.Footer>
                </Modal>

            </>
        );
    }
}

class Ingredients extends Component {
    render() {
        const results = this.props.ingredients.map((ingredient) => (
            <tr key={ingredient.id} className={ ingredient.include ? "" : "table-secondary" }>
                <td>
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
                    <table className="card-table table">
                        <tbody>
                            <Ingredients
                                ingredients={recipe.ingredients}
                                toggleIngredient={this.props.toggleIngredient}
                            />
                        </tbody>
                    </table>
                </Accordion.Collapse>
            </Card>
        ));
    }
}

class Basket extends Component {
    getIngredients() {
        const recipes = this.props.recipes;
        const ingredients = [];
        recipes.map((recipe) => {
            if (recipe.quantity > 0) {
                recipe.ingredients.map((ingredient) => {
                    if (ingredient.include) {
                        if (ingredients.findIndex(e => e.ingredient === ingredient.ingredient) === -1) {
                            ingredients.push({
                                ingredient: ingredient.ingredient,
                                measurements: [{
                                    quantity: ingredient.quantity * recipe.quantity,
                                    unit: ingredient.measurement
                                }]
                            });
                        } else {
                            ingredients.find(ing => ing.ingredient === ingredient.ingredient).measurements.push({
                                quantity: ingredient.quantity * recipe.quantity,
                                unit: ingredient.measurement
                            });
                        }
                    }
                })
            }
        });
        return ingredients.map(ingredient => ({
            ...ingredient,
            measurementSum: addMeasurements(ingredient.measurements).map(e => simplifyUnits(e))
        }));
    }

    renderMeasurements(measurementSum) {
        return measurementSum.map(measurement => (
            <React.Fragment>
                {roundDecimal(measurement.quantity, 1)}
                {" "}
                {measurement.unit}
                {" "}
            </React.Fragment>
        ));
    }

    render() {
        const ingredients = this.getIngredients();
        //this.props.updateBasket(ingredients);
        return ingredients.map((ingredient) => (
            <div key={ingredient.id}>
                {this.renderMeasurements(ingredient.measurementSum)}
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
            modal: {
                export: false
            },
            auth: {
                google: false
            },
            tasklists: []
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
        recipeList.find(x => x.id === recipeID).ingredients.find(y => y.id === ingredientID).include ^= true;
        this.setState({ recipeList: recipeList });
    }

    toggleIngredient(recipeID, ingredientID) {
        const recipeList = this.state.recipeList;
        recipeList.find(x => x.id === recipeID).ingredients.find(y => y.id === ingredientID).include ^= true;
        this.setState({ recipeList: recipeList });
    }

    updateBasket = (basket) => {
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
    }

    updateTasklists = (tasklists) => {
        this.setState({ tasklists: tasklists });
    }

    render() {
        const recipes = this.state.recipeList;
        const modal = this.state.modal;
        const auth = this.state.auth;
        const tasklists = this.state.tasklists;
        const basket = this.state.basket;
        return (
            <main className="container">
                <div className="card">
                    <div className="card-header">
                        <h2>Recipes</h2>
                    </div>
                    <div className="card-body">
                        <Accordion>
                            <Recipes
                                recipes={recipes}
                                addToBasket={id => this.addToBasket(id)}
                                removeFromBasket={id => this.removeFromBasket(id)}
                                toggleIngredient={this.toggleIngredientB}
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
                            updateBasket={this.updateBasket}
                        />
                    </div>
                </div>
            </main>
        );
    }
}

export default App;

function roundDecimal(value, decimalPlace=0) {
    return Math.round(value * (10 ** decimalPlace)) / (10 ** decimalPlace)
}

function measurementUnits() {
    const units = {
        // Volume
        gal: {
            min: 0.5,
            dimension: "volume",
            next: null,
            prev: {unit: "cup", conversion: 16}
        },
        cup: {
            min: 0.25,
            dimension: "volume",
            next: { unit: "gal", conversion: 1 / 16 },
            prev: {unit: "tbsp", conversion: 16}
        },
        floz: {
            min: 1,
            dimension: "volume",
            next: { unit: "cup", conversion: 1/8 },
            prev: { unit: "tbsp", conversion: 2 }
        },
        tbsp: {
            min: 1,
            dimension: "volume",
            next: { unit: "cup", conversion: 1/16 },
            prev: { unit: "tsp", conversion: 3 }
        },
        tsp: {
            min: 0,
            dimension: "volume",
            next: { unit: "tbsp", conversion: 1/3 },
            prev: null
        }
    };
    return units;
}

function getDimension(unit) {
    const units = measurementUnits();
    if (unit in units) {
        return units[unit].dimension;
    } else if (unit === "") {
        return "quantity";
    } else {
        return "dimension-" + unit;
    }
}

function convertUnits(quantity, unitIn, unitOut) {
    const units = measurementUnits();
    if (unitIn in units && unitOut in units) {
        if (units[unitIn].dimension === units[unitOut].dimension) {
            let factor = 1;
            let unit = unitIn;
            while (true) {
                if (units[unit].next != null) {
                    factor *= units[unit].next.conversion;
                    unit = units[unit].next.unit;
                    if (unit === unitOut) {
                        return { quantity: quantity * factor, unit: unit };
                    }
                } else {
                    break;
                }
            }

            factor = 1;
            unit = unitIn;
            while (true) {
                if (units[unit].prev != null) {
                    factor *= units[unit].prev.conversion;
                    unit = units[unit].prev.unit;
                    if (unit === unitOut) {
                        return { quantity: quantity * factor, unit: unit };
                    }
                } else {
                    break;
                }
            }
        }
    }

    return { quantity: quantity, unit: unitIn };
}

function simplifyUnits(measurement) {
    const units = measurementUnits();
    let quantity = measurement.quantity;
    let unit = measurement.unit;
    if (unit in units) {
        while (true) {
            if (quantity < units[unit].min && units[unit].prev != null) {
                quantity *= units[unit].prev.conversion;
                unit = units[unit].prev.unit;
            } else if (units[unit].next != null) {
                if (quantity * units[unit].next.conversion >= units[units[unit].next.unit].min) {
                    quantity *= units[unit].next.conversion;
                    unit = units[unit].next.unit;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }
    return { quantity: quantity, unit: unit };
}

function addMeasurements(measurements) {
    const units = measurementUnits();
    const results = [];
    for (const measurement of measurements) {
        const dimension = getDimension(measurement.unit);
        if (results.findIndex(e => e.dimension === dimension) === -1) {
            results.push({
                dimension: dimension,
                quantity: measurement.quantity,
                unit: measurement.unit
            });
        } else {
            if (measurement.unit in units) {
                results.find(e => e.dimension === dimension).quantity += convertUnits(measurement.quantity, measurement.unit, results.find(e => e.dimension === dimension).unit).quantity;
            } else if (measurement.unit === results.find(e => e.dimension === dimension).unit) {
                results.find(e => e.dimension === dimension).quantity += measurement.quantity;
            } else {
                console.log("Error adding measurements.")
            }        
        }
    }
    return results;
}