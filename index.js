const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m7t65.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const toolCollection = client
      .db("perfect_garden_tools")
      .collection("tools");
    const purchaseCollection = client
      .db("perfect_garden_tools")
      .collection("purchasing");
    const userCollection = client.db("perfect_garden_tools").collection("user");

    app.get("/tool", async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });
    app.get("/tool/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tool = await toolCollection.findOne(query);
      console.log(tool);
      res.send(tool);
    });

    app.get("/purchasing", async (req, res) => {
      const customer = req.query.customer;
      const decodedEmail = req.decoded.email;
      if (customer === decodedEmail) {
        const query = { customer: customer };
        const purchasing = await purchaseCollection.find(query).toArray();
        return res.send(purchasing);
      }
    });

    app.get("/purchasing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const purchasing = await purchaseCollection.findOne(query);
      res.send(purchasing);
    });

    app.post("/purchasing", async (req, res) => {
      const purchasing = req.body;
      const query = {
        tool: purchasing.tool,
        customer: purchasing.tool,
      };
      const exists = await purchaseCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, purchasing: exists });
      }
      const result = await purchaseCollection.insertOne(purchasing);
      return res.send({ success: true, result });
    });
  } finally {
  }
}
run().catch(console.dir);

// a lot of things reaming

app.get("/", (req, res) => {
  res.send("Hello from PerFectGarden Tool");
});

app.listen(port, () => {
  console.log(`garden app listening the port: ${port}`);
});
