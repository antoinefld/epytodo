const index = require("../../index.js");
const users = require("../../routes/user/user.js");
const middleware_auth = require("../../middleware/auth.js");

var login_user = function() {
    index.app.post("/login", (req, res) => {
        const name = req.body.name;
        const password = req.body.password;

        index.connection.query('SELECT * FROM user'
        , function(err, results, fields) {
            users.loop_db_entries(results, password, name, res);
        })
    })
}

var register_user = function() {
    index.app.post("/register", (req, res) => {
        const body_string_split = JSON.stringify(req.body).split(",");
        const email = req.body.email;
        const name = req.body.name;
        const firstname = req.body.firstname;
        const password = req.body.password;
        let i = 0;

        if (req.body.email === undefined || req.body.name === undefined
            || req.body.firstname === undefined
            || req.body.password === undefined)
            return (res.status(400).send("Bad parameters"));
        for (; body_string_split[i]; i++);
        if (i > 4)
            return (res.status(400).send("Bad parameters"));
        users.handle_account(name, email, firstname, password, res);
    })
}

var update_user = function()
{
    index.app.put("/users/:id", (req, res) => {
        const body_string_split = JSON.stringify(req.body).split(",");
        const email = req.body.email;
        const name = req.body.name;
        const firstname = req.body.firstname;
        const password = req.body.password;
        const id = req.params.id;
        let i = 0;

        if (req.body.email === undefined || req.body.name === undefined
            || req.body.firstname === undefined
            || req.body.password === undefined)
            return (res.status(400).send("Bad parameters"));
        for (; body_string_split[i]; i++);
        if (i > 4)
            return (res.status(400).send("Bad parameters"));
        users.handle_update_account(id, name, email, firstname, password, res);
    })
}

var get_user = function() {
    index.app.get("/user", middleware_auth.checkToken, (req, res) => {
        index.connection.query('SELECT * FROM user WHERE id = \''
        + index.id_on_login + '\''
        , function(err, results, fields) {
            const tmp = JSON.stringify(results[0]);
            users.display_user_root(tmp, res);
        })
    });
}

var delete_user = function() {
    index.app.delete("/users/:id", middleware_auth.checkToken, (req, res) => {
        index.connection.execute('DELETE FROM todo WHERE user_id = \''
        + index.id_on_login + '\'');
        index.connection.execute('DELETE FROM user WHERE id = \''
        + req.params.id + '\'');
        console.log("ok.");
    })
}

var get_user_todos = function() {
    index.app.get("/user/todos", middleware_auth.checkToken, (req, res) => {
        index.connection.query('SELECT * FROM todo WHERE user_id = \''
        + index.id_on_login + '\''
        , function(err, results, fields) {
            const result = new Array();
                for (let i = 0; results[i]; i++)
                    result.push(results[i]);
                res.send(JSON.stringify({result}));
        })
    })
}

var get_user_by_id_or_email = function() {
    index.app.get("/users/:arg", middleware_auth.checkToken, (req, res) => {
        const arg = req.params.arg;

        switch (arg) {
            case 'id':
                index.connection.query('SELECT * FROM user WHERE id = \''
                + index.id_on_login + '\'', function(err, results, fields) {
                    const tmp = JSON.stringify(results[0]);
                    users.display_user_root(tmp, res);
                });
                break;
            case 'email':
                users.get_email_by_id().then(val => {
                    if (val !== 'undefined') {
                        index.connection.query('SELECT * FROM user WHERE email '
                        + '= \'' + val + '\'', function(err, results, fields) {
                            const tmp = JSON.stringify(results[0]);
                            users.display_user_root(tmp, res);
                        })
                    }
                });
                break;
        }
    });
}

var test_action = function() {
    index.app.get("/test/:arg", (req, res) => {
        const arg = req.params.arg;

        if (arg === 'delete') {
            index.connection.execute('TRUNCATE TABLE user');
            res.send("done.");
        }
        if (arg === 'show') {
            index.connection.query('SELECT * FROM user'
            , function(err, results, fields) {
                const result = new Array();
                for (let i = 0; results[i]; i++)
                    result.push(results[i]);
                res.send(JSON.stringify({result}));
            });
        }
        console.log("done.");
    })
}

module.exports = {test_action, register_user, login_user, get_user
, get_user_by_id_or_email, get_user_todos, delete_user, update_user};
