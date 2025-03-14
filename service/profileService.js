const profileDao = require('../repository/profileDao');

async function updateProfile(user_id, updates, user) {
    if (user.id !== user_id) {
        return {error: "Forbidden", message: "Profile is not owned by requester"}
    }

    const oldProfile = await profileDao.getProfileById(user_id);

    if (!oldProfile) {
        return {error: 'Missing', message: "Profile not found"};
    }
    const newProfile = {
        first_name: updates.first_name? updates.first_name: oldProfile.first_name,
        last_name: updates.last_name? updates.last_name: oldProfile.last_name,
        office_location: updates.office_location? updates.office_location: oldProfile.office_location,
        title: updates.title? updates.title: oldProfile.title,
        profile_picture: updates.profile_picture? updates.profile_picture: oldProfile.profile_picture,
    }

    const profile = await profileDao.updateProfile(user_id, newProfile);

    if (!profile) {
        return {message: "Failed to get profile"};
    } else {
        return {message: "Found profile", profile}
    }
}

async function addPhoto(user_id, file, user) {
    const profile = await profileDao.getProfileById(user_id);

    if (!profile) {
        return {error: "Missing", message: "Profile not found"}
    }

    if (user.id !== profile.user_id) {
        return {error: "Forbidden", message: "Profile is not owned by requester"};
    }

    const fileName = await profileDao.uploadPhoto(file);

    const newProfile = await profileDao.updateProfile(user_id, {...profile, profile_picture: fileName}, user);

    return {message: "Profile found", profile: newProfile};
};

module.exports = { updateProfile, addPhoto };