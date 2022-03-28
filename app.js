const express = require("express");
const router = require("./Routes/Users")
require('dotenv').config();


// Database
require('./Database')

const app = express();
app.use(express.json());

// Routes
app.use(router); 

app.get('/test', (req, res) => {
   res.send('Hello world');
 });
 
 app.get('/', (req, res) => {
   res.json({ success: true, message: 'Welcome to backend zone!' });
 });

const port = 9000

app.listen(port, () => {
  console.log(`server is running on port ${port} `);
});
