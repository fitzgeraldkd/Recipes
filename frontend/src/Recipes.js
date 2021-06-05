import React, { Component } from "react";
import { Accordion, Button, Card, Col, Form, Modal } from "react-bootstrap"
import { Plus, Dash, PencilSquare, XCircleFill } from "react-bootstrap-icons"

class RecipeModalIngredient extends Component {
    handleChange(event) {
        const activeRecipe = this.props.activeRecipe;
    }

    render() {
        const elements = this.props.activeRecipe.ingredients.map((ingredient) => (
            <Form.Row key={ingredient.id.toString()}>
                <Col xs="3">
                    {/*<input type="text" list="data" />*/}
                    {console.log(ingredient)}
                    <Form.Control type="text" list="data" placeholder="ingredient" value={ingredient.ingredient_name} size="sm" />
                    <datalist id="data">
                        <option value="test" />
                    </datalist>
                </Col>
                <Col xs="3">
                    <Form.Control type="number" placeholder="quantity" value={ ingredient.quantity } size="sm" />
                </Col>
                <Col xs="2">
                    <Form.Control as="select" size="sm">
                        <option>Test</option>
                    </Form.Control>
                </Col>
                <Col xs="3">
                    <Form.Control type="text" placeholder="prepared" value={ingredient.prepared} size="sm" />
                </Col>
                <Col xs="1">
                    <XCircleFill color="red" />
                </Col>
            </Form.Row>
        ));
        return elements
    }
}

export class RecipeModal extends Component {
    handleChange = (event) => {
        // Create an array to relate form IDs to the recipe properties
        const recipeProps = {
            formRecipeName: "name"
        }

        const recipe = this.props.activeRecipe;
        recipe[recipeProps[event.target.id]] = event.target.value;
        this.props.updateActiveRecipe(recipe);
    }

    editRecipe = (recipe) => {
        this.props.updateActiveRecipe(recipe);
        this.props.updateModal("recipe", true);
    };

    cancelEditRecipe = () => {
        this.props.updateModal("recipe", false);
        this.props.updateActiveRecipe();
    }

    getRecipeName = () => {
        try {
            return this.props.activeRecipe.name;
        }
        catch (err) {
            return "";
        }
    };

    render() {
        const show = this.props.modal.recipe;
        const handleClose = () => this.cancelEditRecipe();
        //const handleShow = () => this.props.updateModal("recipe", true);
        const handleShow = () => this.editRecipe(null);
        return (
            <>
                <Button variant="primary" onClick={handleShow}>New Recipe</Button>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Recipe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formRecipeName">
                                <Form.Label>Recipe Name</Form.Label>
                                <Form.Control type="text" placeholder="Recipe Name" value={this.getRecipeName()} onChange={this.handleChange} />
                            </Form.Group>
                            <RecipeModalIngredient
                                activeRecipe={this.props.activeRecipe}
                            />
                        </Form>
                        <Button variant="success" size="sm" onClick={() => this.props.activeRecipeAddIngredient()}>Add Ingredient</Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={handleClose}>Submit</Button>
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
            <tr key={ingredient.id.toString()} className={ingredient.include ? "" : "table-secondary"}>
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
                    {ingredient.ingredient_name}
                </td>
                <td>
                    {ingredient.prepared}
                </td>
            </tr>
        ));
        return results;
    }
}

export class Recipes extends Component {
    editRecipe = (recipe) => {
        console.log(recipe);
        this.props.updateActiveRecipe(recipe);
        this.props.updateModal("recipe", true);
    };

    render() {
        return this.props.recipes.map((recipe) => (
            <Card key={recipe.id.toString()}>
                <Card.Header>
                    <div className="container">
                        <div className="row">
                            <div className="col-8">
                                <Accordion.Toggle as={Button} variant="link" eventKey={recipe.id}>
                                    <a data-toggle="collapse" data-parent="#recipe-list" href={"#collapse" + recipe.id}>
                                        {recipe.name}
                                    </a>
                                </Accordion.Toggle>
                            </div>
                            <div className="col-1 text-right">
                                <button type="button" className="btn btn-primary" onClick={() => this.editRecipe(recipe)}><PencilSquare /></button>
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