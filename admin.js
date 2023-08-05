const { ObjectId } = require('mongodb');
const client = require('./client');
const express = require('express');
const adminRouter = express.Router();

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const usersCollection = client.db('threadZone').collection('users');
        const categoryList = client.db('threadZone').collection('categorys')

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

  //ryd
          adminRouter.route('/addCategory')
          .post(async(req,res)=>{
            try {
              const category = req.body;
            //  console.log(category);
               await categoryList.insertOne(category);
               res.send({status:true});
            } catch (e) {
              console.log(e);;
              res.send({status:false})
            }
         })


   //ryd
    adminRouter.route('/getAllCategory')
    .get(async(req,res)=>{
      const result = await categoryList.find().toArray();
      res.send(result)
    })

    //ryd
    adminRouter.route('/deleteCategory')
    .post(async(req,res)=>{
      const id = new ObjectId( req.body.id);
      const result = categoryList.deleteOne({_id : id});
      res.send({status:true});
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
