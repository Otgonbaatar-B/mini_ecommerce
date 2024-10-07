require("dotenv").config();

const express = require("express");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 4242;

app.get("/", async (_, res) => {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const response = await sql`SELECT * FROM products`;

  res.json({ response });
});

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});
