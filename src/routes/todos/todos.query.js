const index = require("../../index.js");
const todos = require("../../routes/todos/todos.js");
const middleware_auth = require("../../middleware/auth.js");

var get_todo_by_id = function() {
    index.app.get("/todos/:id", middleware_auth.checkToken, (req, res) => {
        todos.display_todo_by_id(req.params.id, res);
    });
}

var get_all_todos = function() {
    index.app.get("/todos", middleware_auth.checkToken, (req, res) => {
        index.connection.query('SELECT * FROM todo WHERE user_id = \''
        + index.id_on_login + '\'', function(err, results, fields) {
            const result = new Array();
                for (let i = 0; results[i]; i++)
                    result.push(results[i]);
                res.send(JSON.stringify({result}));
        })
    });
}

var delete_todo = function() {
    index.app.delete("/todos/:id", middleware_auth.checkToken
    , (req, res) => {
        index.connection.execute('DELETE FROM todo WHERE id = \''
        + req.params.id + '\'');
        console.log("ok.");
    })
}

var create_todo = function() {
    index.app.post("/todos", middleware_auth.checkToken, (req, res) => {
        const body_string_split = JSON.stringify(req.body).split(",");
        const title = req.body.title;
        const description = req.body.description;
        const status = req.body.status;
        const due_time = req.body.due_time;
        const user_id = req.body.user_id;
        let i = 0;

        if (req.body.title === undefined || req.body.description === undefined
            || req.body.status === undefined
            || req.body.due_time === undefined
            || req.body.user_id === undefined)
            return (res.status(400).send("Bad parameters"));
        for (; body_string_split[i]; i++);
        if (i > 5)
            return (res.status(400).send("Bad parameters"));
        todos.push_todo_to_db(title, description, due_time, status, user_id
            , res);
    })
}

var update_todo = function() {
    index.app.put("/todos/:id", middleware_auth.checkToken, (req, res) => {
        const body_string_split = JSON.stringify(req.body).split(",");
        const title = req.body.title;
        const description = req.body.description;
        const status = req.body.status;
        const due_time = req.body.due_time;
        const user_id = req.body.user_id;
        const id = req.params.id;
        let i = 0;

        if (req.body.title === undefined || req.body.description === undefined
            || req.body.status === undefined
            || req.body.due_time === undefined
            || req.body.user_id === undefined)
            return (res.status(400).send("Bad parameters"));
        for (; body_string_split[i]; i++);
        if (i > 5)
            return (res.status(400).send("Bad parameters"));
        todos.push_todo_to_db_update(title, description, due_time, status
            , user_id, res, id);
    })
}

module.exports = {create_todo, get_todo_by_id, get_all_todos, delete_todo
, update_todo};
