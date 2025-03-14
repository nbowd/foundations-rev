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

module.exports = { updateProfile };