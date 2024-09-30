require('dotenv').config(); 
const app = require('./app');
const port = 3001;
const ipAddr = process.env.IP_ADDR;

app.listen(port, ipAddr, () => {
  console.log(`Server is running on http://${ipAddr}:${port}`);
});
