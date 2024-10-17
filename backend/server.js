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

app.get("/products", async (_, res) => {
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
    response.josn({
      body: response,
      success: true,
    });
    res.json({
      data: response,
      message: `'${name}' nertei baraa amjilttai nemegdlee`,
      response,
    });
  } catch (error) {
    console.error("Error inserting product:", error);
    res.status(500).json({ error: "Бүтээгдэхүүн нэмэхэд алдаа гарлаа." });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const productId = req.params.id;

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const response = await sql`SELECT * FROM products WHERE id = ${productId}`;

    if (response.length !== 0) {
      res.json({
        response: response,
        success: true,
      });
    } else {
      res.json({
        message: "Baraaa oldsongui",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "ALdaa garlaa.",
    });
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

let cart = [];

app.post("/cart", (req, res) => {
  const { productId, quantity } = req.body;
  const product = cart.find((item) => item.productId === productId);
  if (product) {
    product.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  res.json({ message: "Product added to cart", cart });
});

app.get("/cart", (req, res) => {
  res.json(cart);
});

app.post("/orders", async (req, res) => {
  const { customerId, items } = req.body;
  try {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderResult = await client.query(
      "INSERT INTO orders (customer_id, total_amount) VALUES ($1, $2) RETURNING id",
      [customerId, totalAmount]
    );
    const orderId = orderResult.rows[0].id;

    const orderItemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES ($1, $2, $3, $4)
    `;
    for (const item of items) {
      await client.query(orderItemsQuery, [
        orderId,
        item.productId,
        item.quantity,
        item.price,
      ]);
    }
    res.json({ message: "Order placed successfully", orderId });
  } catch (error) {
    res.status(500).json({ error: "Error placing order" });
  }
});

app.post("/products", async (req, res) => {
  const { name, description, price, image_url } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO products (name, description, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, price, image_url]
    );
    res.json({
      message: "Product added successfully",
      product: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Error adding product" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер ажиллаж эхэллээ: http://localhost:${PORT}`);
});
