const client = require("./client");
const express = require("express");
const productRouter = express.Router();

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const product = client.db('threadZone').collection('products')
    
   //? Code Start Here 
   // Ryd code 
     
   productRouter
   .route('/getAllProduct')
   .get(async(req,res)=>{
     const result = await product.find().limit(10).toArray();   
    // console.log("first   ==> ",result)
     res.send(result);
   })  



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment from product and connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
module.exports = productRouter;
