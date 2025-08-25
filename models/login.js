
const sql = require('mssql');
const config = require('../config/config');

async function authenticateUser(username, password) {
  try {
    let pool = await sql.connect(config.db);
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query(`SELECT UserId, UserName, UserType FROM Users WHERE UserName = @username AND Pwd = @password`);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      return {
        userId: user.UserId,
        username: user.UserName,
        userType: user.UserType
      };
    } else {
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    throw new Error(`Error authenticating user: ${error.message}`);
  }
}

module.exports = {
  authenticateUser
};
