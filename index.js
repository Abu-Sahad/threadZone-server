require('dotenv').config()
const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;

const adminRouter = require('./admin');
const sellerRouter = require('./seller');
const customerRouter = require('./customer');
const productRouter = require('./product');
const dashboardRouter = require('./dashboard');

app.use(cors())
app.use(express.json())

  app.use('/',adminRouter);
  app.use('/',sellerRouter);
  app.use('/',customerRouter);
  app.use('/',productRouter);
  app.use('/',dashboardRouter);





app.get('/', (req, res) => {
    res.send('ThreadZone Emart Website Running!')
})

app.listen(port, () => {
    console.log(`ThreadZone Emart Website listening on port ${port}`)
})
