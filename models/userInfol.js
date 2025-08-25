
const sql = require('mssql');
const config = require('../config/config');

async function fetchUserInfo(userId) {
  try {
    let query;
    const pool = await sql.connect(config);
    const request = pool.request();

 
     
      query = `
        SELECT UserId, UserName, UserType, cellPhone, email, Pwd, Plant
        FROM Users;
      `;
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching user info: ${error.message}`);
  }
}



//addUser
async function addUser(user) {
  try {
    const query = `
      INSERT INTO Users (UserName, UserType, cellPhone, email, Pwd, Plant)
      VALUES (@UserName, @UserType, @cellPhone, @email, @Pwd, @Plant);
    `;

    const pool = await sql.connect(config);
    const request = pool.request()
      .input('UserName', sql.NVarChar, user.UserName)
      .input('UserType', sql.Int, user.UserType)
      .input('cellPhone', sql.NVarChar, user.cellPhone)
      .input('email', sql.NVarChar, user.email)
      .input('Pwd', sql.NVarChar, user.Pwd)
      .input('Plant', sql.NVarChar, user.Plant);

    await request.query(query);
    return { message: 'User added successfully' };
  } catch (error) {
    throw new Error(`Error adding user: ${error.message}`);
  }
}

//update User
// async function updateUser(userId, updatedUser) {
//   try {
//     const query = `
//       UPDATE Users
//       SET UserName = @UserName, UserType = @UserType, cellPhone = @cellPhone, 
//           email = @email, Pwd = @Pwd, Plant = @Plant
//       WHERE UserId = @userId;
//     `;

//     const pool = await sql.connect(config);
//     const request = pool.request()
//       .input('userId', sql.Int, userId)
//       .input('UserName', sql.NVarChar, updatedUser.UserName)
//       .input('UserType', sql.Int, updatedUser.UserType)
//       .input('cellPhone', sql.NVarChar, updatedUser.cellPhone)
//       .input('email', sql.NVarChar, updatedUser.email)
//       .input('Pwd', sql.NVarChar, updatedUser.Pwd)
//       .input('Plant', sql.NVarChar, updatedUser.Plant);

//     await request.query(query);
//     return { message: 'User updated successfully' };
//   } catch (error) {
//     throw new Error(`Error updating user: ${error.message}`);
//   }
// }

// update User
async function updateUser(userId, updatedUser) {
  try {
    const pool = await sql.connect(config);

   
if (parseInt(userId, 10) === 38) {
 
  
      const checkRequest = pool.request().input('UserId', sql.Int, userId);
      const checkQuery = `
        SELECT PasswordResetCount
        FROM Users
        WHERE UserId = @UserId;
      `;
      const checkResult = await checkRequest.query(checkQuery);
      const passwordResetCount = checkResult.recordset[0]?.PasswordResetCount || 0;

      if (passwordResetCount >= 1 && updatedUser.Pwd) {
        throw new Error('Password has already been reset once. Further resets are not allowed.');
      }

      const updateQuery = updatedUser.Pwd
        ? `
          UPDATE Users
          SET UserName = @UserName, UserType = @UserType, cellPhone = @cellPhone, 
              email = @email, Pwd = @Pwd, Plant = @Plant,
              PasswordResetCount = ISNULL(PasswordResetCount, 0) + 1
          WHERE UserId = @UserId;
        `
        : `
          UPDATE Users
          SET UserName = @UserName, UserType = @UserType, cellPhone = @cellPhone, 
              email = @email, Plant = @Plant
          WHERE UserId = @UserId;
        `;
      
     
      const updateRequest = pool.request();
      updateRequest
        .input('UserId', sql.Int, userId)
        .input('UserName', sql.NVarChar, updatedUser.UserName)
        .input('UserType', sql.Int, updatedUser.UserType)
        .input('cellPhone', sql.NVarChar, updatedUser.cellPhone)
        .input('email', sql.NVarChar, updatedUser.email)
        .input('Pwd', sql.NVarChar, updatedUser.Pwd || null)
        .input('Plant', sql.NVarChar, updatedUser.Plant);

      await updateRequest.query(updateQuery);

      
      return { message: 'User updated successfully' };
    } else {
      
      const updateRequest = pool.request();
      updateRequest
        .input('UserId', sql.Int, userId)
        .input('UserName', sql.NVarChar, updatedUser.UserName)
        .input('UserType', sql.Int, updatedUser.UserType)
        .input('cellPhone', sql.NVarChar, updatedUser.cellPhone)
        .input('email', sql.NVarChar, updatedUser.email)
        .input('Pwd', sql.NVarChar, updatedUser.Pwd || null)
        .input('Plant', sql.NVarChar, updatedUser.Plant);

      const query = `
        UPDATE Users
        SET UserName = @UserName, UserType = @UserType, cellPhone = @cellPhone, 
            email = @email, Pwd = @Pwd, Plant = @Plant
        WHERE UserId = @UserId;
      `;

      
      await updateRequest.query(query);
      return { message: 'User updated successfully' };
    }
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw new Error(`Error updating user: ${error.message}`);
  }
}

//delete User

async function deleteUser(userId) {
  try {
    const query = `
      DELETE FROM Users
      WHERE UserId = @userId;
    `;

    const pool = await sql.connect(config);
    const request = pool.request()
      .input('userId', sql.Int, userId);

    await request.query(query);
    return { message: 'User deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
}



module.exports = {
  fetchUserInfo,
  addUser,
  updateUser,
  deleteUser
};
