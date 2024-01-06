const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');  
const app = express()
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
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

    const userCollection = client.db('bristoDB').collection('bristo-users');
    const menuCollection = client.db('bristoDB').collection('bristo-menu');
    const reviewCollection = client.db('bristoDB').collection('reviews');
    const cartCollection = client.db('bristoDB').collection('carts');

    //jwt token
    app.post('/jwt', (req,res)=>{
      const user=req.body;
      const token=jwt.sign(user, process.env.ACCESS_JWT_TOKEN, {expiresIn: '1h'})
      res.send(token)
    })

    //user related apis
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'existing user' })
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      const result=await userCollection.find().toArray();
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req,res)=>{
      const id=req.params.id;
      const filter={_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result= await userCollection.updateOne(filter,updateDoc);
      res.send(result)
    })

    app.delete('/users/:id', async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const result= await userCollection.deleteOne(query);
      res.send(result)
    })

    //menu related apis
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result)
    })

    //reviews related apis
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result)
    })

    //cart collection
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([])
      }
      else {
        const query = { email: email }
        const result = await cartCollection.find(query).toArray();
        res.send(result)
      }
    })

    app.post('/carts', async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result)
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`boss is running on port ${port}`);
})