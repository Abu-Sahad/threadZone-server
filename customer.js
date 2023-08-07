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



        // ryd start 
        customerRouter.route('/getAllProduct')
            .post(async (req, res) => {
                // const query = {userId:req.body.id}
                const result = await orderList.find().toArray();
                res.send(result);
            })


        customerRouter.route('/getSingleOrder')
            .post(async (req, res) => {
                const id = new ObjectId(req.body.id);
                const result = await orderList.find({ _id: id }).toArray();
                res.send(result);
            })

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