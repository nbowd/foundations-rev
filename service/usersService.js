const userDao = require('../repository/usersDao');
const uuid = require('uuid');
const bcrypt = require("bcrypt");

const saltRounds = 10;

async function getUsers() {
    const result = await userDao.getUsers();

    if (!result) {
        return {message: "Failed to get users"};
    } else {
        return {message: "Found users", users: result}
    }
}

async function createUser({username, password}) {
    const duplicateUsernames = await userDao.getUserByUsername(username);

    if (duplicateUsernames.length > 0) {
        return {error: 'duplicate', message: "Username is already taken"};
    }

    const hashPass = await bcrypt.hash(password, saltRounds);
    const result = await userDao.createUser({user_id: uuid.v4(), username, password: hashPass, role: "employee"});

    if (!result) {
        return {message: "Failed to create user"};
    } else {
        return {message: "Created user", user: result};
    }
}

async function loginUser({username, password}) {
    let user = await userDao.getUserByUsername(username);
    
    if (user.length == 0) {
        return {error: 'username', message: 'Username missing or invalid'};
    } else {
        user = user[0];
    }
    
    if (!await bcrypt.compare(password, user.password)) {
        return {error: 'password', message: 'Password missing or invalid'};
    }

    return {message: "Logged in", user};
}

async function changeRole(user_id, { role }) {
    const user = await userDao.changeRole(user_id, role);

    if (!user) {
        return {message: "Failed to update user"};
    } else {
        return {message: "Updated user", user: user}
    }
}

async function deleteUser(user_id) {
    let user = await userDao.deleteUser(user_id);

    if (!user) {
        return {error: 'missing', message: 'No user matching provided id'};
    }
    return user;
}

module.exports = { getUsers, createUser, loginUser, deleteUser, changeRole };