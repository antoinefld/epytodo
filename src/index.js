const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var app = express();
var id_on_login;

require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

module.exports = {app, connection, jwt, bcrypt, id_on_login};

const users_query = require("./routes/user/user.query");
const todo_query = require("./routes/todos/todos.query");

users_query.test_action();
users_query.register_user();
users_query.login_user();
users_query.get_user();
users_query.get_user_by_id_or_email();
users_query.get_user_todos();
users_query.delete_user();
users_query.update_user();
todo_query.create_todo();
todo_query.get_todo_by_id();
todo_query.get_all_todos();
todo_query.delete_todo();
todo_query.update_todo();

app.listen(process.env.PORT, () => {
    console.log("Example app listening at http://localhost:"
    + process.env.PORT);
});
