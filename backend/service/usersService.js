const userDao = require('../repository/usersDao');
const profileDao = require('../repository/profileDao');
const uuid = require('uuid');
const bcrypt = require("bcrypt");

const saltRounds = 10;

/* istanbul ignore next */
async function getUsers() {
    const result = await userDao.getUsers();

    if (!result) {
        return {error: "Bad Request", status: 400, message: "Failed to get users"};
    } else {
        return {message: "Found users", users: result}
    }
}

/* istanbul ignore next */
async function createUser({username, password}) {
    const duplicateUsernames = await userDao.getUserByUsername(username);

    if (duplicateUsernames.length > 0) {
        return {error: 'Duplicate Username', status: 409, message: "Username is already taken"};
    }

    const hashPass = await bcrypt.hash(password, saltRounds);
    const user_id = uuid.v4();
    const result = await userDao.createUser({user_id, username, password: hashPass, role: "employee"});

    const profile = await profileDao.createProfile({user_id, first_name: "", last_name: "", title: "", office_location: "", profile_picture: ""});

    if (!result || !profile) {
        return {error: "Bad Request", status: 400, message: "Failed to create user"};
    } else {
        return {message: "Created user", user: result};
    }
}

/* istanbul ignore next */
async function loginUser({username, password}) {
    let user = await userDao.getUserByUsername(username);
    
    if (user.length == 0) {
        return {error: 'Unauthorized', status: 401, message: 'Username missing or invalid'};
    } else {
        user = user[0];
    }
    
    if (!await bcrypt.compare(password, user.password)) {
        return {error: 'Unauthorized', status: 401, message: 'Password missing or invalid'};
    }
    const profile = await profileDao.getProfileById(user.user_id);
    user.profile = profile;
    return {message: "Logged in", user};
}

/* istanbul ignore next */
async function changeRole(user_id, { role }) {
    const user = await userDao.changeRole(user_id, role);

    if (!user) {
        return {error: "Bad Request", status: 400, message: "Failed to update user"};
    } else {
        return {message: "Updated user", user: user}
    }
}

/* istanbul ignore next */
async function deleteUser(user_id) {
    let user = await userDao.deleteUser(user_id);
    const profile = await profileDao.deleteProfile(user_id);

    if (!user || !profile) {
        return {error: 'Bad Request', status: 400, message: 'No user matching provided id'};
    }
    return user;
}

module.exports = { getUsers, createUser, loginUser, deleteUser, changeRole };