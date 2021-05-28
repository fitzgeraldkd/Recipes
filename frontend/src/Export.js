import React, { Component } from "react";
import { Button, Modal } from "react-bootstrap"
import { gapiKey, gapiOAuthClientID } from "./apikey.js";

class ModalTaskLists extends Component {
    render() {
        const tasklists = this.props.tasklists;
        console.log(tasklists);
        return tasklists.map((tasklist) => (
            <button key={tasklist.id} type="button" className="list-group-item list-group-item-action" onClick={() => this.props.addTasks(tasklist.id)}>
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

export class ExportModal extends Component {
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