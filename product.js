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
     res.send(result);
   })

   const colorPipeLine = [
     {
       $group:{
         _id:'$color',
         totalProduct:{$sum:1}
       }
     }
   ];
   const sizePipeLine = [
     {
       $group:{
         _id:'$size',
         totalProduct:{$sum:1}
       }
     }
   ];
   const categoryPipeLine = [
     {
       $group:{
         _id:'$category',
         totalProduct:{$sum:1}
       }
     }
   ];
   const ratingPipeLine = [
     {
       $group:{
         _id:'$rating',
         totalProduct:{$sum:1}
       }
     }
   ];

  productRouter
  .route('/productInformation')
  .get(async(req,res)=>{
       const colorList = await product.aggregate(colorPipeLine).toArray();
       const sizeList = await product.aggregate(sizePipeLine).toArray();
       const categoryList = await product.aggregate(categoryPipeLine).toArray();
       const ratingList = await product.aggregate(ratingPipeLine).sort({_id:1}).toArray();
       const result = {colorList,sizeList,categoryList,ratingList};
       res.send(result);
  })


   productRouter
   .route('/getProducts')
   .post(async(req,res)=>{
     const data = req.body;
       const {
        sortBy,
        filterByRating,
        minPrice,
        maxPrice,
        size,
        color,
        category,
        page
        } = req.body;
        // console.log("Rating ",filterByRating);

        let query = {};

          if(filterByRating) query.rating = filterByRating;
          if(minPrice && maxPrice) query.price = {$lte:maxPrice,$gte:minPrice}
          if(size) query.size = size;
          if(color) query.color = color;
          if(category) query.category = category;

        let sort = {};
        if(sortBy==='HighToLow'){
          sort.price = -1;
        } else if(sortBy==='LowToHigh'){
          sort.price = 1;
        } else if(sortBy === 'mostSelling'){
          sort.totalSell = -1;
        } else if (sortBy=== 'mostReview') {
          sort.totalReview = -1;
        }
       const totalProduct = await product.find(query).count();
      // const totalProduct =  await product.countDocuments();
        const skip = (page-1)*9;
        let limit = 9;
        if(page*limit>totalProduct){
          limit = totalProduct - skip;
        }

        // console.log("skip limit " ,skip,limit,totalProduct);

      const productArray = await product.find(query).skip(skip).limit(limit).sort(sort).toArray();
      const result = {totalProduct,productArray};
     res.send(result);
   })

    productRouter
    .route('/totalProduct')
    .get(async(req,res)=>{
       const result = await product.countDocuments();
       res.send({totalProduct:result});
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
