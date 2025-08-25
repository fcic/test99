// const userModel = require('../models/login');


// async function authenticateUser(req, res) {
//   const { username, password } = req.body;

//   try {
//     const user = await userModel.authenticateUser(username, password);
    
//     if (user) {
      
//       res.json({ message: 'Authentication successful', user });
//     } else {
      
//       res.status(401).json({ message: 'Authentication failed. Invalid credentials.' });
//     }
//   } catch (error) {
  
//     console.error('Error authenticating user:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }

// module.exports = {
//   authenticateUser
// };
const userModel = require('../models/login');

async function authenticateUser(req, res) {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await userModel.authenticateUser(username, password);
    
    if (user) {

      const { userId, userName, userType } = user;
      res.json({ message: 'Authentication successful', user: { userId, userName, userType } });
    } else {
      res.status(401).json({ message: 'Authentication failed. Invalid credentials.' });
    }
  } catch (error) {
    console.error('Error authenticating user:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  authenticateUser
};
