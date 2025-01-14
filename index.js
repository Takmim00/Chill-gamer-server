require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jxfxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const reviewCollection = client.db("reviewDB").collection("review");
    const watchListCollection = client.db("reviewDB").collection("watchList");

    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/review/limit", async (req, res) => {
      const cursor = reviewCollection.find().limit(8);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/review/all", async (req, res) => {
      const sortField = req.query.sortField; 
      const sortOrder = req.query.sortOrder;
    
      let sortQuery = {};
      if (sortField && sortOrder) {
        sortQuery[sortField] = sortOrder === "asc" ? 1 : -1;
      }
      const cursor = reviewCollection.find().sort(sortQuery);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });
    app.put("/review/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedReview = req.body;
      const review = {
        $set: {
          coverImage: updatedReview.coverImage,
          title: updatedReview.title,
          description: updatedReview.description,
          rating: updatedReview.rating,
          year: updatedReview.year,
          genre: updatedReview.genre,
        },
      };

      const result = await reviewCollection.updateOne(filter, review, options);
      res.send(result);
    });

    app.get("/watchList", async (req, res) => {
      const cursor = watchListCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/watchList/:userEmail", async (req, res) => {
      const userEmail = req.params.userEmail;
      console.log(userEmail);
      const query = { email: userEmail };
      const result = await watchListCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/myReviews", async (req, res) => {
      const userEmail = req.query.email;
      const query = { email: userEmail };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const addReview = req.body;
      const result = await reviewCollection.insertOne(addReview);
      res.send(result);
    });

    app.post("/watchList", async (req, res) => {
      const watchListItem = req.body;
      const result = await watchListCollection.insertOne(watchListItem);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Gaming server is running");
});

app.listen(port, () => {
  console.log(`Gaming server is running on port: ${port}`);
});
