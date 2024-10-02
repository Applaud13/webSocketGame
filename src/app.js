import express from "express";
import { createServer } from "http";
import initSocket from "./init/socket.js";
import { loadGameAssets } from "./init/assets.js";
import dotenv from "dotenv";

const app = express();
const server = createServer(app);
dotenv.config();

const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
initSocket(server);

server.listen(PORT, async () => {
  console.log(`서버가 ${process.env.PORT}로 시작됩니다.`);

  try {
    await loadGameAssets();

    console.log("게임 데이터 로드에 성공하였습니다!");
  } catch (err) {
    console.log("게임 데이터 로드에 실패하였습니다!", err);
  }
});
