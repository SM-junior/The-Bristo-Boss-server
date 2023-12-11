const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const express=require('express')
const cors=require('cors')
const app=express()
const port=process.env.PORT || 3000;
 
app.use(cors());
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('boss is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n2wd0zs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const menuCollection=client.db('bristoDB').collection('bristo-menu');

    app.get('/menu', async(req,res)=>{
        const menu=await menuCollection.find().toArray();
        res.send(menu)
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`boss is running on port ${port}`);
})