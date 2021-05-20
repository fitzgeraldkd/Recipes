import logo from './logo.svg';
import './App.css';
import React, { Component } from "react";
import { Accordion, Button, Card } from "react-bootstrap"
import axios from "axios";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeList: [],
        };
    }

    componentDidMount() {
        this.refreshList();
    }

    refreshList = () => {
        axios
            .get("/api/recipes/")
            .then((res) => this.setState({ recipeList: res.data }))
            .catch((err) => console.log(err));
    };

    renderIngredients = (recipe) => {
        const ingredients = recipe.ingredients;
        return ingredients.map((ingredient) => (
            <li key={ingredient.id}>
                {ingredient.quantity}
                {ingredient.measurement}
                {ingredient.ingredient}
            </li>
        ));
    };

    renderRecipes = () => {
        const { viewCompleted } = this.state;
        const newItems = this.state.recipeList;

        return newItems.map((item) => (
            <Card>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey={item.id}>
                        <a data-toggle="collapse" data-parent="#recipe-list" href={"#collapse" + item.id}>
                            {item.name}
                        </a>
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey={item.id}>
                    <Card.Body>
                        {this.renderIngredients(item)}
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
            </main>
        );
    }

  //return (
  //  <div className="App">
  //    <header className="App-header">
  //      <img src={logo} className="App-logo" alt="logo" />
  //      <p>
  //        Edit <code>src/App.js</code> and save to reload.
  //      </p>
  //      <a
  //        className="App-link"
  //        href="https://reactjs.org"
  //        target="_blank"
  //        rel="noopener noreferrer"
  //      >
  //        Learn React
  //      </a>
  //    </header>
  //  </div>
  //);
}

export default App;
