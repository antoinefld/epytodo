CREATE DATABASE IF NOT EXISTS epytodo;

use epytodo;

CREATE TABLE user (
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    firstname varchar(255) NOT NULL,
    created_at varchar(255) DEFAULT NOW()
);

CREATE TABLE todo (
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    description varchar(255) NOT NULL,
    created_at varchar(255),
    due_time varchar(255) DEFAULT NOW() NOT NULL,
    status VARCHAR(255) NOT NULL,
    user_id int NOT NULL,
    CONSTRAINT `fk_user_id` FOREIGN KEY (user_id) REFERENCES user (id)
);
