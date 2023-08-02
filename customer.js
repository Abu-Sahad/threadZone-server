const client = require('./client');
const express = require('express');
const customerRouter = express.Router();

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const usersCollection = client.db('threadZone').collection('users')

        // customerRouter.route("/instructor")
        // .get(async (req, res) => {
        //       const result = await instructorCollection.find().toArray();
        //       res.send(result);
        //     })
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