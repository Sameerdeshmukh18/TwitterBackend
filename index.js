const express = require('express')
const app = express()
const errorHandler = require('./middlewares/ErrorHandler');
const connectDB = require('./config/DBConnection');
const dotenv = require("dotenv").config();

connectDB();
const port = process.env.PORT? process.env.PORT: 5000

app.use(express.json());
app.use('/api/users',require("./Routes/UserRoutes"));
app.use('/api/tweets',require("./Routes/TweetRoutes"));
app.use('/api/friendship',require("./Routes/FriendshipRoutes"));
app.use(errorHandler);


app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})