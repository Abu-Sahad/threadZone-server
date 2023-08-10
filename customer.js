const { ObjectId } = require('mongodb');
const client = require('./client');
const express = require('express');
const customerRouter = express.Router();

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const orderList = client.db('threadZone').collection('orders');
        const usersCollection = client.db('threadZone').collection('users')
        const galleryCollection = client.db('threadZone').collection('gallery')
        const product = client.db('threadZone').collection('products');
        const cartList = client.db('threadZone').collection('cartList');
        const address = client.db('threadZone').collection('addreses');
        const review = client.db('threadZone').collection('reviews');



  // ryd start
  customerRouter.route('/getAllProduct')
  .post(async (req,res)=>{
   // const query = {userId:req.body.id}
    const result = await orderList.find().toArray();
    res.send(result);
  })


 customerRouter.route('/getSingleOrder')
 .post(async(req,res)=>{
    const id = new ObjectId(req.body.id);
    const result = await orderList.find({ _id: id}).toArray();
    res.send(result);
 })

 //sahad

        customerRouter.route('/users')
            .post(async (req, res) => {
                const user = req.body;
                const query = { email: user.email }
                const existingUser = await usersCollection.findOne(query)
                if (existingUser) {
                    return res.send({ message: 'user already exists' })
                }
                const result = await usersCollection.insertOne(user);
                res.send(result)
            })

        customerRouter.route('/users')
            .get(async (req, res) => {
                const result = await usersCollection.find().toArray()
                res.send(result)
            })
        customerRouter.route('/gallery')
            .get(async (req, res) => {
                const result = await galleryCollection.find().toArray()
                res.send(result)
            })

// ryd

customerRouter.route('/findUserImformation')
.post(async(req,res)=>{
   const email = req.body.email;
   const userId = await usersCollection.findOne({email});
  // console.log("user id", userId);
   res.send(userId)
})

  //ryd
   customerRouter.route('/orderSubmit')
   .post(async(req,res)=>{
     const data = req.body;
     cartList.insertOne(data);
     res.send({status:true})

   })

    //ryd
    customerRouter.route('/getCartList')
    .post(async(req,res)=>{
      const data = req.body.id;
      const id = new ObjectId(data);
      const result = await cartList.find({userId:data}).toArray();
      res.send(result);
    })

    //ryd
    customerRouter.route('/deleteCartItem')
    .post(async(req,res)=>{
      try {
        const id = new ObjectId(req.body.id);
        await cartList.deleteOne({_id:id});
        res.send({status:true});
      } catch (e) {
        console.log(e);
        res.send({status:false});
      }
    })

      //ryd
      customerRouter.route('/addAddress')
      .post(async(req,res)=>{
        try {
          await  address.insertOne(req.body);
          res.send({status:true})
        } catch (e) {
          console.log(e);
        }

      })

      //ryd
      customerRouter.route('/getAddress')
      .post(async(req,res)=> {
        const id = req.body.id;
        const data = await address.find({userId:id}).toArray();
        res.send(data);
      })
      //ryd

      customerRouter.route('/submitOrder')
      .post(async(req,res)=>{
        const data = req.body;
      //  console.log("order List ",data);
       for(var i=0;i<data.length;i++){
         const id = new ObjectId(data[i].productId)
         const singleProduct = await product.findOne({_id:id});
         const presentQuantity = singleProduct.quantity;
         const afterSelling = singleProduct.quantity - data[i].quantity;
         await product.updateOne({_id:id},{$set:{quantity:afterSelling}});
         const singleProduct2 = await product.findOne({_id:id});
       }

        orderList.insertMany(data);
        res.send({success:true});
      })

      //ryd 10-august-23
      customerRouter.route('/addReview')
      .post(async(req,res)=>{
        try {
          const data = req.body;
          const id = new ObjectId(req.body.orderId);
          await orderList.updateOne({_id:id},{$set:{status:data.status}});
          await review.insertOne(data);
          res.send({status:true})
        } catch (e) {
          console.log(e);
        }
      })

      customerRouter.route('/getReturnList')
      .post(async(req,res)=>{
        try {
          const role = req.body.role;
          if(role==='customer'){
            const userId = req.body.userId;
            const result = await orderList.find({$and:[{userId:userId},{status:'returned'}]}).toArray();
          //  console.log('Return List ',result);
            res.send(result)
          }else if(role==='seller'){
            const shopId = req.body.shopId;
            const result = await orderList.find({status:'returned'}).toArray();
            res.send(result);
          }else if(role==='admin'){
            const result = await orderList.find({status:'returned'}).toArray();
            res.send(result);
          }

        } catch (e) {
          console.log(e);
        }
      })

      customerRouter.route('/getReviewList')
      .post(async(req,res)=>{
        try {
          const role = req.body.role;
          if(role==='customer'){
            const userId = req.body.userId;
            const result = await orderList.find({$and:[{userId:userId},{status:'reviewed'}]}).toArray();
          //  console.log('Review List ',result);
            res.send(result)
          } else if(role==='seller'){
            const shopId = req.body.shopId;
            const result = await orderList.find({status:'reviewed'}).toArray();
            res.send(result);
          }else if(role==='admin'){
            const result = await orderList.find({status:'reviewed'}).toArray();
            res.send(result);
          }

        } catch (e) {
          console.log(e);
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
module.exports = customerRouter;
