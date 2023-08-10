const { ObjectId } = require('mongodb');
const client = require('./client');
const express = require('express');
const adminRouter = express.Router();

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const usersCollection = client.db('threadZone').collection('users');
        const categoryList = client.db('threadZone').collection('categorys');
        const products = client.db('threadZone').collection('products');
        const pendingProduct = client.db('threadZone').collection('pendingProducts');
        const orders = client.db('threadZone').collection('orders');

 
    adminRouter.route('/users/admin/:id')
      .patch(async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const updatedDoc = {
          $set: {
            role: 'admin'
          },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result)
      });

    adminRouter.route('/users/admin/:email')
      .get(async (req, res) => {
        const email = req.params.email;
        const query = { email: email }
        const user = await usersCollection.findOne(query);
        const result = { admin: user?.role === 'admin' }
        res.send(result);
      })



    adminRouter.route('/products/:id')
      .put(async (req, res) => {
        const { id } = req.params;
        const updatedProduct = await products.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { isBlock: true } },
          { returnOriginal: false }
        );
        res.send(updatedProduct);
      });

    //ryd
    adminRouter.route('/addCategory')
      .post(async (req, res) => {
        try {
          const category = req.body;
          //  console.log(category);
          await categoryList.insertOne(category);
          res.send({ status: true });
        } catch (e) {
          console.log(e);
          res.send({ status: false })
        }
      })


    //ryd
    adminRouter.route('/getAllCategory')
      .get(async (req, res) => {
        const result = await categoryList.find().toArray();
        res.send(result)
      })

    //ryd
    adminRouter.route('/deleteCategory')
      .post(async (req, res) => {
        const id = new ObjectId(req.body.id);
        const result = await categoryList.deleteOne({ _id: id });
        res.send({ status: true });
      })

    //ryd
    adminRouter.route('/getApproveProduct')
      .get(async (req, res) => {
        const result = await pendingProduct.find({ status: 'pending' }).toArray();
        console.log('check for products ');
        res.send(result);
      })
    //ryd

    adminRouter.route('/adminProductApprove')
      .post(async (req, res) => {
        const data = req.body;
        const id = new ObjectId(data._id);
        if (data.status === 'approve') {
          await products.insertOne(data);
          await pendingProduct.deleteOne({ _id: id })
        } else if (data.status === 'denied') {

          await pendingProduct.updateOne({ _id: id }, { $set: { status: data.status } });
        }
        console.log("approve data ", data);
        res.send({ status: true })
      })

   adminRouter.route('/adminDeliveryList')
   .get(async(req,res)=>{
     const result = await orders.find({status:'warehouse'}).toArray();
     res.send(result);
   })

   adminRouter.route('/singleProductDelivery')
   .post(async(req,res)=>{
     try {
       const id = new ObjectId(req.body.id);
       const result = await orders.updateOne({_id:id},{$set:{status:'delivered'}});
       res.send({status:true});
     } catch (e) {
       res.send({status:false});
     }
   })
   adminRouter.route('/adminDeliverycomplete')
   .get(async(req,res)=>{
     const result = await orders.find({status:'delivered'}).toArray();
     res.send(result);
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
module.exports = adminRouter;
