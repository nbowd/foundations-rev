const profileDao = require('../repository/profileDao');

/* istanbul ignore next */
async function getSignedUrlForImage(fileKey, bucket) {
    if (!fileKey || fileKey.length == 0) {
        return {error: "Bad Request", status:400, message: "Missing file key."};
    }
    if (!bucket || bucket.length == 0) {
        return {error: "Bad Request", status:400, message: "Missing bucket name."};
    }

    const signedUrl = await profileDao.getSignedUrlForImage(fileKey, bucket);

    if (!signedUrl) {
        return {error: "Bad Request", status:400, message: "Failed to get signedURL"};
    } else {
        return {message: "Found profile picture", signedUrl};
    }
}

/* istanbul ignore next */
async function getProfileById(user_id) {
    const profile = await profileDao.getProfileById(user_id);
    return profile;
}

/* istanbul ignore next */
async function updateProfile(user_id, updates, user) {
    if (user.id !== user_id) {
        return {error: "Forbidden Access", status: 403, message: "Profile is not owned by requester"}
    }

    const oldProfile = await profileDao.getProfileById(user_id);

    if (!oldProfile) {
        return {error: "Bad Request", status:400, message: "Profile not found"};
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
        return {error: "Bad Request", status:400, message: "Failed to get profile"};
    } else {
        return {message: "Found profile", profile}
    }
}

/* istanbul ignore next */
async function addPhoto(user_id, file, user) {
    const profile = await profileDao.getProfileById(user_id);

    if (!profile) {
        return {error: "Bad Request", status:400, message: "Profile not found"}
    }

    if (user.id !== profile.user_id) {
        return {error: "Forbidden Access", status:403, message: "Profile is not owned by requester"};
    }

    const fileName = await profileDao.uploadPhoto(file);

    const newProfile = await profileDao.updateProfile(user_id, {...profile, profile_picture: fileName}, user);

    return {message: "Profile found", profile: newProfile};
};

module.exports = { updateProfile, addPhoto, getSignedUrlForImage, getProfileById };