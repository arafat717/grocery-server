const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function createToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
}

function VerifyToken(req, res, next) {
  const authToken = req.headers.authorization.split(" ")[1];
  console.log(authToken);
  const verify = jwt.verify(authToken, "secret");
  if (!verify?.email) {
    return res.send("You are not authorized!");
  }
  req.user = verify.email;
  next();
}

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
    const userCollection = database.collection("user"); // Replace with your collection name
    const cartCollection = database.collection("carts"); // Replace with your collection name

    // all carts api here ////

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    });

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

    ///////////////////     get product by id       //////////////////////

    // Route to get a single product by ID
    app.get("/product/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await collection.findOne({ _id: new ObjectId(id) });
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
      } catch (error) {
        res.status(500).json({ message: "Error retrieving product", error });
      }
    });

    app.delete("/product/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid product ID" });
        }
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
      }
    });

    // Route to update a single product by ID using PATCH
    app.patch("/product/:id", VerifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid product ID" });
        }
        const updates = req.body;
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updates }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
      }
    });

    // Route to create a new product using POST
    app.post("/product", async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await collection.insertOne(newProduct);
        res.status(201).json({
          message: "Product created successfully",
          productId: result.insertedId,
        });
      } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
      }
    });

    //////user related api ///

    app.post("/user", async (req, res) => {
      const user = req.body;
      const token = createToken(user);
      const IsUserExist = await userCollection.findOne({ email: user?.email });
      if (IsUserExist?._id) {
        return res.send({
          status: "success",
          message: "Login Succesful",
          token,
        });
      }
      await userCollection.insertOne(user);
      res.send(token);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid product ID" });
        }
        const result = await userCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
      }
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.get("/user/get/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const result = await userCollection.updateOne(
        { email },
        { $set: user },
        { upsert: true }
      );
      res.send(result);
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
