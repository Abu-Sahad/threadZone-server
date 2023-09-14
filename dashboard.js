const { ObjectId } = require('mongodb');
const client = require('./client');
const express = require('express');
const dashboardRouter = express.Router();

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db('threadZone').collection('users');
    const products = client.db('threadZone').collection('products');
    const orders = client.db('threadZone').collection('orders');

     dashboardRouter.route('/dayVsOrder')
     .post(async(req,res)=>{
       const role = req.body.role;
       let aggregationPipeline;
       aggregationPipeline = [
      {
      $group: {
        _id: "$date",
        totalProducts: { $sum: "$quantity" },
        totalPrice: { $sum: { $multiply: ["$quantity", "$price"] } }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ];


    const result = await orders.aggregate(aggregationPipeline).toArray();
      res.send(result);
     })

     dashboardRouter.route('/sellsVsPrice')
     .post(async(req,res)=>{
       const role = req.body.role;
       let aggregationPipeline;
       aggregationPipeline = [
      {
      $group: {
        _id: "$price",
        TotalSells: { $sum: "$totalSell" },
      }
    },
    {
      $sort: { _id: 1 }
    }
    ];
 //    if(role==='seller'){
 //  const shopId = req.body.shopId;
 //    const match = {
 //      $match: {
 //      shopId: shopId
 //     }
 //   }
 //   aggregationPipeline.push(match)
 // }

    const result = await products.aggregate(aggregationPipeline)
      .toArray();
      res.send(result);
     })

     dashboardRouter.route('/visitVsSold')
     .post(async(req,res)=>{
       const role = req.body.role;

      let aggregationPipeline = [
         {
           $group:{
             _id:null,
             TotalVisit:{$sum:"$totalVisit"},
             TotalSells:{$sum:"$totalSell"},
             AddToCart:{$sum:"$addToCart"},
             TotalReview:{$sum:"$totalReview"}
           }
         }
       ]
      const result = await products.aggregate(aggregationPipeline).toArray();
      res.send(result);

     })

           dashboardRouter.route('/orderVsPrice').post(async (req, res) => {
        const userId = req.body.userId;
        console.log(userId);
        const projection = { price: true, date: true, _id: false };
        const result = await orders
          .find({ userId: userId }, projection)
          .sort({ date: 1 })
          .toArray();
          console.log(result);
        res.send(result);
      });

      dashboardRouter.route('/findDashboardInformation')
      .post(async(req,res)=>{
        const role = req.body.role;

        let pipeLine = [
          {
            $group:{
              _id:null,
              totalProduct:{$sum:"$quantity"},
              totalReview:{$sum:"$totalReview"},
              totalSell:{$sum:"$totalSell"},
              totalVisit:{$sum:"$totalVisit"},
              totalIncome:{$sum:{$multiply:["$price","$totalSell"]}}
            }
          }
        ];

        const result = await products.aggregate(pipeLine).toArray();
        res.send(result);
      })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {
      }
    }
    run().catch(console.dir);
    module.exports = dashboardRouter;
