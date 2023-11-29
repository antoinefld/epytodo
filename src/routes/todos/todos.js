const index = require("../../index.js");
const users = require("../../routes/user/user.js");

const get_last_todo_id = function() {
    return (new Promise((resolve) => {
        return (index.connection.query(
            'SELECT * FROM todo',
            function(err, results, fields) {
                let i = 1;

                for (; results[i]; i++);
                return (resolve(i));
            }
        ));
    }));
}

const display_todo_by_id_defined = function(res, id) {
    index.connection.query('SELECT * FROM todo WHERE id = \''
    + id + '\'', (err, results, fielfd) => {
        const tmp = JSON.stringify(results[0]);
        const title = tmp.split(",")[1].split(":")[1]
        .replace("\"", "").replace("\"", "");
        const created_at = tmp.split(",")[3]
        .replace("\"created_at\":\"", "").replace("\"", "");
        const due_time = tmp.split(",")[4]
        .replace("\"due_time\":\"", "").replace("\"", "");
        const id = tmp.split(",")[0].split(":")[1];
        const desc = tmp.split(",")[2].split(":")[1]
        .replace("\"", "").replace("\"", "");
        const user_id = tmp.split(",")[5].split(":")[1]
        .replace("\"", "").replace("\"", "");
        const status = tmp.split(",")[6].split(":")[1]
        .replace("}", "");
        res.status(201).send(JSON.stringify({id, title, desc, created_at
            , due_time, user_id, status}));
    });
}

var display_todo_by_id = function(id, res) {
    if (id > 0)
        return (display_todo_by_id_defined(res, id));
    get_last_todo_id().then(val => {
        index.connection.query('SELECT * FROM todo WHERE id = \''
        + val + '\'', (err, results, fielfd) => {
            const tmp = JSON.stringify(results[0]);
            const title = tmp.split(",")[1].split(":")[1]
            .replace("\"", "").replace("\"", "");
            const created_at = tmp.split(",")[3]
            .replace("\"created_at\":\"", "").replace("\"", "");
            const due_time = tmp.split(",")[4]
            .replace("\"due_time\":\"", "").replace("\"", "");
            const id = tmp.split(",")[0].split(":")[1];
            const desc = tmp.split(",")[2].split(":")[1]
            .replace("\"", "").replace("\"", "");
            const user_id = tmp.split(",")[6].split(":")[1]
            .replace("}", "");
            const status = tmp.split(",")[5].split(":")[1]
            .replace("\"", "").replace("\"", "");
            res.status(201).send(JSON.stringify({id, title, desc, created_at
                , due_time, user_id, status}));
        });
    });
}

var push_todo_to_db = function(title, desc, due_time, status
    , user_id, res) {
        index.connection.execute('INSERT INTO todo (title' +
        ', description, created_at, due_time, status, user_id) VALUES (\'' 
        + title + '\', \'' + desc + '\', \'' + users.get_date() + '\', \''
        + due_time + '\', \'' + status + '\', \'' + user_id + '\')');
        display_todo_by_id(0, res);
}

var push_todo_to_db_update = function(title, desc, due_time, status
    , user_id, res, id) {
        index.connection.execute('UPDATE todo set title = \'' + title
        + '\', description = \'' + desc + '\', due_time = \'' + due_time
        + '\', status = \'' + status + '\', user_id = \'' + user_id
        + '\' WHERE id = \'' + id + '\'');
        display_todo_by_id(id, res);
}

module.exports = {push_todo_to_db, display_todo_by_id, push_todo_to_db_update};
