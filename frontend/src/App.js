import logo from './logo.svg';
import './App.css';
import React, { Component } from "react";
import { Accordion, Button, Card, Modal } from "react-bootstrap"
import { CartX, Plus, Dash } from "react-bootstrap-icons"
import axios from "axios";
import { gapiKey, gapiOAuthClientID } from "./apikey.js";
import { roundDecimal, simplifyUnits, addMeasurements } from "./Units.js";

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
            let taskTitle = ""
            taskTitle += ingredient.ingredient;
            console.log(ingredient);
            window.gapi.client.tasks.tasks.insert({
                "tasklist": tasklist,
                "resource": {
                    "title": taskTitle
                }
            }).then(function (response) {
                //console.log(response);
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
        const ingredients = this.props.basket;
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
        this.updateBasket();
    }

    removeFromBasket(recipeID) {
        const recipeList = this.state.recipeList;
        if (recipeList.find(x => x.id === recipeID).quantity > 0) {
            recipeList.find(x => x.id === recipeID).quantity--
        }
        this.setState({ recipeList: recipeList });
        this.updateBasket();
    }

    toggleIngredient = (event) => {
        console.log(event);
        const recipeID = parseInt(event.target.dataset.recipeid);
        const ingredientID = parseInt(event.target.dataset.ingredientid);
        const recipeList = this.state.recipeList;
        recipeList.find(x => x.id === recipeID).ingredients.find(y => y.id === ingredientID).include ^= true;
        this.setState({ recipeList: recipeList });
        this.updateBasket();
    }

    updateBasket() {
        const recipes = this.state.recipeList;
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
        const basket = ingredients.map(ingredient => ({
            ...ingredient,
            measurementSum: addMeasurements(ingredient.measurements).map(e => simplifyUnits(e))
        }));
        console.log(basket);
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
                                toggleIngredient={this.toggleIngredient}
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