import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const port = 1111;
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (request, response) => {
  response.send("Hello GET хүсэлт ирлээ");
});

app.listen(port, () => {
  console.log(`Сервер ажиллаж байна http://localhost:${port}`);
});
