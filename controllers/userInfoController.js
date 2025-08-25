
const { fetchUserInfo, addUser, updateUser, deleteUser } = require('../models/userInfol');

// Fetch User Info
async function getUserInfo(req, res) {

  try {
    const userInfo = await fetchUserInfo();
    if (!userInfo || userInfo.length === 0) {
      return res.status(404).json({ error: 'User info not found' });
    }
    res.json(userInfo);
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}
// Add New User
async function createUser(req, res) {
  const user = req.body;

  try {
    const result = await addUser(user);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding user:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update Existing User
async function modifyUser(req, res) {
  const { userId } = req.params;
  const updatedUser = req.body;

  try {
    const result = await updateUser(userId, updatedUser);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Password has already been reset once. Further resets are not allowed.' });
  }
}

// Delete User
async function removeUser(req, res) {
  const { userId } = req.params;

  try {
    const result = await deleteUser(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getUserInfo,
  createUser,
  modifyUser,
  removeUser
};
