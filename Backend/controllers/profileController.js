const db = require('../config/db');
const decryptToken = require('../middleware/decryptToken');

exports.getLogin = (req, res) => {
  const { email, pass, rememberMe } = req.body;

  const selectlogin = `SELECT * FROM Logincrd WHERE Email=? AND Password=?`;

  db.query(selectlogin, [email, pass], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error');
      return;
    }

    if (result.length === 0) {
      return res.status(401).send('Error: Invalid credentials');
    }

    if (rememberMe === 'true') {
      res.cookie('username', email, { maxAge: 30 * 24 * 3600 * 1000, httpOnly: true });
      res.cookie('password', pass, { maxAge: 30 * 24 * 3600 * 1000, httpOnly: true });
    } else {
      res.clearCookie('username');
      res.clearCookie('password');
    }
    res.send({ message: 'Success', result: result });
  });
};

exports.updateUser = (req, res) => {
  const { id, name, Email, Password, location } = req.body;
  const passwordBase64 = Buffer.from(Password).toString('base64');

  const checkQuery = `SELECT * FROM Logincrd WHERE id=?`;
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error');
      return;
    }

    if (results.length > 0) {
      const user = results[0];
      if (
        user.Name === name &&
        user.Email === Email &&
        user.Password === passwordBase64 &&
        user.Location === location
      ) {
        res.status(400).send('User already exists');
        return;
      }

      const updateQuery = `UPDATE Logincrd SET Name=?, Email=?, Password=?, Location=? WHERE id=?`;
      db.query(updateQuery, [name, Email, passwordBase64, location, id], (err, result) => {
        if (err) {
          console.error('Error updating user:', err);
          res.status(500).send('Error');
          return;
        }
        res.status(200).send('Success');
      });
    } else {
      res.status(404).send('User not found');
    }
  });
};

exports.getProfile = (req, res) => {
  const { U_id } = req.body;
  const query = "SELECT * FROM Logincrd WHERE id = ?";
  db.query(query, [U_id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length > 0) {
      const user = result[0];
      user.password = Buffer.from(user.Password, 'base64').toString('utf8');
      if (!user.Location) user.Location = 'Ratnagiri';
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  });
};

exports.updateProfile = (req, res) => {
  const { U_id, name, email, password, location } = req.body;
  const encodedPassword = Buffer.from(password).toString('base64');
  const query = `
      UPDATE Logincrd
      SET Name = ?, Email = ?, Password = ?, Location = ?
      WHERE id = ?
  `;
  db.query(query, [name, email, encodedPassword, location, U_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('Profile updated successfully');
  });
};

exports.empDropdown = (req, res ) => {
  const { token } = req.body;
  const userData = decryptToken(token);
  if (userData.Type !== 'Admin' && userData.Type !== 'Team Leader') {
    const query = `SELECT * FROM Logincrd WHERE id='${userData.id}' AND disableemp!='1' ORDER BY Name ASC`;
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(result);
      }
    });
  } else {
    const query = `SELECT * FROM Logincrd WHERE disableemp!='1' ORDER BY Name ASC`;
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(result);
      }
    });
  }
};