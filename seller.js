const { ObjectId } = require('mongodb');
const client = require('./client');
const express = require('express');
const sellerRouter = express.Router();

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const usersCollection = client.db('threadZone').collection('users')


      const shop = client.db('threadZone').collection('shops');
      const product = client.db('threadZone').collection('products');
      const pendingProduct = client.db('threadZone').collection('pendingProducts');
      const orders = client.db('threadZone').collection('orders');

      sellerRouter.route("/addShop")
      .post(async(req,res)=>{
        const data = req.body;
        await shop.insertOne(data);
        console.log("add review ",data);
        res.send({status:true});
      })




        sellerRouter.route('/users/seller/:id')
            .patch(async (req, res) => {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) }
                const updatedDoc = {
                    $set: {
                        role: 'seller'
                    },
                };
                const result = await usersCollection.updateOne(filter, updatedDoc);
                res.send(result)
            });

        sellerRouter.route('/users/seller/:email')
            .get(async (req, res) => {
                const email = req.params.email;
                const query = { email: email }
                const user = await usersCollection.findOne(query);
                const result = { seller: user?.role === 'seller' }
                res.send(result);
            })

  //ryd

     sellerRouter.route('/addProduct')
     .post(async(req,res)=>{
       const data = req.body;
      // console.log('product data', data);
       const result = pendingProduct.insertOne(data);

       res.send({status:true})
     })

     //ryd
     sellerRouter.route('/sellerOrderRequest')
     .post(async(req,res)=>{
       const shopId = req.body.shopId;
      // const result = await orders.find({$and:[{shopId:shopId},{$or:[{status:'approved'},{status:'warehouse'}]}]}).toArray();
       const result = await orders.find({$or:[{status:'approved'},{status:'warehouse'}]}).toArray();

    //   console.log("orders data ",result);
       res.send(result);

     })

     sellerRouter.route('/sentToWarehouse')
     .post(async(req,res)=>{
       const id = new ObjectId(req.body.id);
       await orders.updateOne({_id:id},{$set:{status:'warehouse'}});
       res.send({status:true})
     })

     sellerRouter.route('/sellerOrderComplete')
     .post(async(req,res)=>{
       try{
         const shopId = req.body.shopId;
         const result = await orders.find({shopId:shopId,status:'delivered'}).toArray();
         res.send(result);
       }
       catch(err){
         console.log(err);
       }
     })





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);
module.exports = sellerRouter;
