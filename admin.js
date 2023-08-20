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
    const shop = client.db('threadZone').collection('shops');
    const notification = client.db('threadZone').collection('notifications');
    const voucher = client.db('threadZone').collection('vouchers');


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

    adminRouter.route('/updateStatus/:id')
      .put(async (req, res) => {
        const { id } = req.params;
        const { status, reason,userId } = req.body;
        const uid = new ObjectId(userId)
      //  console.log("shop conformation update status ",id,status,reason);
        const updatedShop = await shop.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { status, reason } },
          { returnOriginal: false }
        );
        const shopName = updatedShop.value.shopName;
        console.log("update shop ",shopName);

        if(status==='approve'){
           const updateUser = await usersCollection.updateOne({_id:uid},{$set:{role:'seller',shopId:id,shopName:shopName}});
        }
        res.send(updatedShop)
      })



    adminRouter.route('/shopStatus')
      .get(async (req, res) => {
        const pendingShops = await shop.find({ status: 'pending' }).toArray();
        res.send(pendingShops)
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
            console.log(category);
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

        res.send(result);
      })
    //ryd

    adminRouter.route('/adminProductApprove')
      .post(async (req, res) => {
        const data = req.body;
        const id = new ObjectId(data._id);

        const notif = {
          role:'seller',
          isRead:false,
          shopId:data.shopId,
          shopName:data.shopName,
          description:`Admin accept your ${data.productName} product. Now you can sell `
        }

        if (data.status === 'approve') {
          const withOutId = {...data};
          delete withOutId['_id'];
          await products.insertOne(withOutId);
          await pendingProduct.deleteOne({ _id: id });
          await notification.insertOne(notif);
        } else if (data.status === 'denied') {
          const newNotif = {...notif,description:`Admin reject your ${data.productName} product!!`};
          await pendingProduct.updateOne({ _id: id }, { $set: { status: data.status } });
          await notification.insertOne(newNotif);
        }
        res.send({ status: true })
      })

    adminRouter.route('/adminDeliveryList')
      .get(async (req, res) => {
        const result = await orders.find({ status: 'warehouse' }).toArray();
        res.send(result);
      })

    adminRouter.route('/singleProductDelivery')
      .post(async (req, res) => {
        try {
          const id = new ObjectId(req.body.id);
          const result = await orders.updateOne({ _id: id }, { $set: { status: 'delivered' } });
          res.send({ status: true });

          //notification
          const data = await orders.findOne({_id:id})

          const notif = {
            role:'customer',
            isRead:false,
            shopId:data.shopId,
            userId:data.userId,
            description:`your ordered ${data.productName} product from ${data.shopName} shop is delivered. Hope you Like it!`
          }
            await notification.insertOne(notif);
            const notif2 = {
              role:'seller',
              isRead:false,
              shopId:data.shopId,
              userId:data.userId,
              description:`${data.productName} for ${data.userName} is delivered`
            }
              await notification.insertOne(notif2);

        } catch (e) {
          res.send({ status: false });
        }
      })


    adminRouter.route('/adminDeliverycomplete')
      .get(async (req, res) => {
        const result = await orders.find({ status: 'delivered' }).toArray();
        res.send(result);
      })

      adminRouter.route('/updateNotification')
      .post(async(req,res)=>{
        const id = new ObjectId(req.body.id);
        await notification.updateOne({_id:id},{$set:{isRead:true}});
        res.send({status:true})
      })

      adminRouter.route('/deleteNotification')
      .post(async(req,res)=>{
        const id = new ObjectId(req.body.id);
        await notification.deleteOne({_id:id});
        res.send({status:true})
      })

      //ryd-13-8-23
      adminRouter.route('/addVoucher')
      .post(async(req,res)=>{
        const data = req.body;
        await voucher.insertOne(data);
        res.send({status:true})

      })

      adminRouter.route('/deleteVoucher')
      .post(async(req,res)=>{
        const id = new ObjectId(req.body.id);
        await voucher.deleteOne({_id:id});
        res.send({status:true});
      })

      adminRouter.route('/getAllVoucher')
      .get(async(req,res)=>{
        const result =await voucher.find().toArray();
        res.send(result);
      })
      adminRouter.route('/useVoucher')
      .post(async(req,res)=>{
        const data = req.body;
        const result = await voucher.find({voucherName:data}).toArray();
        if(result.length>0 && result.quantity>0){
          const newQuantity = result.quantity-1;
          await voucher.updateOne({voucherName:data},{$set:{quantity:newQuantity}});
          res.send({status:true});
        } else {
          res.send({status:false});
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
module.exports = adminRouter;
