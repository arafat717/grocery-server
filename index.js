const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

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
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    /////my code from here//////

    const database = client.db("grocery"); // Replace with your database name
    const collection = database.collection("allgrocery"); // Replace with your collection name

    //get all fruits///////
    app.get("/fruits", async (req, res) => {
      try {
        const query = { catagory: "fruits" };
        const fruits = await collection.find(query).toArray();
        res.status(200).json(fruits);
      } catch (error) {
        res.status(500).json({ message: "Error retrieving fruits", error });
      }
    });

    ////get all vegitables///////////
    app.get("/vegitables", async (req, res) => {
      try {
        const query = { catagory: "vegitables" };
        const fruits = await collection.find(query).toArray();
        res.status(200).json(fruits);
      } catch (error) {
        res.status(500).json({ message: "Error retrieving fruits", error });
      }
    });

    /////get all dairy///////
    app.get("/dairy", async (req, res) => {
      try {
        const query = { catagory: "dairy" };
        const fruits = await collection.find(query).toArray();
        res.status(200).json(fruits);
      } catch (error) {
        res.status(500).json({ message: "Error retrieving fruits", error });
      }
    });

    /////get all meat///////
    app.get("/meat", async (req, res) => {
      try {
        const query = { catagory: "meat" };
        const fruits = await collection.find(query).toArray();
        res.status(200).json(fruits);
      } catch (error) {
        res.status(500).json({ message: "Error retrieving fruits", error });
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
