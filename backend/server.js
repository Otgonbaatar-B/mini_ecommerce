import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { neon } from "@neondatabase/serverless";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1111;

app.use(bodyParser.json());
app.use(cors());

app.get("/", async (_, res) => {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const response = await sql`SELECT * FROM products`;
  res.json({ response });
});
app.post("/products/insert", async (req, res) => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, description, price, image_url } = req.body;

    const response = await sql`
      INSERT INTO products (name, description, price, image_url)
      VALUES (${name}, ${description}, ${price}, ${image_url});
    `;

    res.json({
      message: `'${name}' nertei baraa amjilttai nemegdlee`,
      response,
    });
  } catch (error) {
    console.error("Error inserting product:", error);
    res.status(500).json({ error: "Бүтээгдэхүүн нэмэхэд алдаа гарлаа." });
  }
});

app.delete("/products/delete/:id", async (req, res) => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const productId = req.params.id;

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const checkResponse = sql`SELECT * FROM products WHERE id = ${productId}`;
    if (checkResponse.length === 0) {
      return res.status(404).json({
        message: `${productId} тай бараа олдсонгүй`,
      });
    }

    const response = await sql`DELETE FROM products WHERE id = ${productId}`;

    res.json({
      message: `${productId} tai baraa amjilttai ustgalaa`,
      response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the product." });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер ажиллаж эхэллээ: http://localhost:${PORT}`);
});
