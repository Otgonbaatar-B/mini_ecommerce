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

app.listen(PORT, () => {
  console.log(`Сервер ажиллаж эхэллээ: http://localhost:${PORT}`);
});
