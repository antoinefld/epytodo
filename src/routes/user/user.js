const { reject } = require("bcrypt/promises");
const index = require("../../index.js");

var get_date = function() {
    const date_ob = new Date();
    const d_date = date_ob.toJSON().split("T")[0];
    const d_time = date_ob.toTimeString().split(" ")[0];
    const str = new String();
    const date = str.concat(d_date, ' ', d_time);

    return (date);
}

const get_last_id = function(email) {
    index.connection.query('SELECT id FROM user WHERE email = \''
    + email + '\'', function(err, results, fields) {
            var id = JSON.stringify(results[0]).split(":")[1]
            .replace("\"", "").replace("\"}", "");
            return (id);
        }
    );
}

const get_id_by_email = function(email) {
    return new Promise((resolve) => {
        return (index.connection.query('SELECT id FROM user WHERE email = \''
        + email + '\'', (err, results, fields) => {
            const id = JSON.stringify(results[0]).split(":")[1]
            .replace("\"", "").replace("\"}", "");
            return (resolve(id));
        }));
    })
}

var get_email_by_id = function() {
    return new Promise((resolve) => {
        return (index.connection.query('SELECT email FROM user WHERE id = \''
        + index.id_on_login + '\'', (err, results, field) => {
            const email = JSON.stringify(results[0]).split(":")[1]
            .replace("\"", "").replace("\"}", "");
            return (resolve(email));
        }));
    });
}

var check_password_on_login = function(password, passwd, user, name
    , user_id, res) {
    return new Promise((resolve, reject) => {
        return (index.bcrypt.compare(password, passwd, (err, result) => {
            if (result === true) {
                if (user === name) {
                    token = index.jwt.sign({
                        id: user_id,
                        username: user
                    }, process.env.SECRET, { expiresIn: '3 hours' });
                    index.id_on_login = user_id;
                    return resolve(token);
                }
                return reject(-1);
            }
        }))
    });
}

var loop_db_entries = function(results, password, name, res) {
    for (let i = 0; results[i]; i++) {
        const tmp = JSON.stringify(results[i]);
        const user_id = tmp.split(",")[0].split(":")[1];
        const user = tmp.split(",")[3].split(":")[1]
        .replace("\"", "").replace("\"", "");
        const passwd = tmp.split(",")[2].split(":")[1]
        .replace("\"", "").replace("\"", "");

        check_password_on_login(password, passwd
            , user, name, user_id, res)
            .then(val => {
                if (val !== -1)
                    return (res.send(JSON.stringify({token})));
            }).catch(val => {
                if (val === -1)
                    return (-1);
            });
    }
}

var push_infos_to_database = function(password, email, name, firstname
    , res) {
    index.bcrypt.genSalt(10, (err, salt) => {
        index.bcrypt.hash(password, salt, (err, hash) => {
            index.connection.execute('INSERT INTO user (email' +
            ', name, firstname, password, created_at) VALUES (\'' + email
            + '\', \'' + name + '\', \'' + firstname + '\', \'' + hash
            + '\', \'' + get_date() + '\')');
            token = index.jwt.sign({
                id: get_last_id(email),
                username: name
            }, process.env.SECRET, { expiresIn: '3 hours' })
            get_id_by_email(email).then(val => {
                index.id_on_login = get_last_id(email);
            });
            return (res.send(JSON.stringify({token})));
        });
    });
}

var push_infos_to_database_update = function(password, email, name, firstname
    , res, id) {
    index.bcrypt.genSalt(10, (err, salt) => {
        index.bcrypt.hash(password, salt, (err, hash) => {
            index.connection.execute('UPDATE user SET email = \'' +
            email + '\', name = \'' + name + '\', firstname = \'' + firstname
            + '\', password = \'' + hash + '\' WHERE id = \'' + id + '\'');
            token = index.jwt.sign({
                id: id,
                username: name
            }, process.env.SECRET, { expiresIn: '3 hours' })
            get_id_by_email(email).then(val => {
                index.id_on_login = get_last_id(email);
            });
            return (res.send(JSON.stringify({token})));
        });
    });
}

var has_an_account = function(name, email, firstname) {
    return (new Promise((resolve, reject) => {
        return (index.connection.query('SELECT * FROM user'
        , (err, results, fields) => {
            let i = 0;
            for (; results[i]; i++) {
                const tmp = JSON.stringify(results[i]);
                const _email = tmp.split(",")[1].split(":")[1]
                .replace("\"", "").replace("\"", "");
                const _name = tmp.split(",")[3].split(":")[1]
                .replace("\"", "").replace("\"", "");
                const _firstname = tmp.split(",")[2].split(":")[1]
                .replace("\"", "").replace("\"", "");
                if (name === _name && firstname === _firstname
                    || email === _email)
                    return (resolve(-1));
                return (reject(0));
            }
            if (i == 0)
                return (reject(0));
        }));
    }));
}

var handle_account = function(name, email, firstname, password, res) {
    has_an_account(name, email, firstname).then(val => {
        if (val === -1)
            return (res.status(400).send("Account already exists"));
    }).catch(val => {
        if (val === 0)
            return (push_infos_to_database(password, email, name
                , firstname, res));
    });
}

var handle_update_account = function(id, name, email, firstname, password
    , res) {
    index.connection.query('SELECT * FROM user WHERE id = \'' + id + '\''
    , (err, results, fields) => {
        const tmp = JSON.stringify(results[0]);
        if (!tmp)
            return (res.status(400).send("Account doesn't exist"));
        return (push_infos_to_database_update(password, email, name
            , firstname, res, id));
    });
}

var display_user_root = function(tmp, res) {
    const email = tmp.split(",")[1].split(":")[1]
    .replace("\"", "").replace("\"", "");
    const name = tmp.split(",")[3].split(":")[1]
    .replace("\"", "").replace("\"", "");
    const firstname = tmp.split(",")[4].split(":")[1]
    .replace("\"", "").replace("\"", "");
    const id = tmp.split(",")[0].split(":")[1];
    const password = tmp.split(",")[2].split(":")[1]
    .replace("\"", "").replace("\"", "");
    const created_at = tmp.split(",")[5].replace("\"created_at\":\"", "")
    .replace("\"}", "");
    res.status(201).send(JSON.stringify({id, email, password, created_at
        , firstname, name}));
}

module.exports = {loop_db_entries, get_date, push_infos_to_database
    , handle_account, display_user_root, get_email_by_id
    , handle_update_account};
