import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const basePath = path.join(__dirName, "../../assets");

let gameAssets = [];

const readFileAsync = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, fileName), "utf-8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

export const loadGameAssets = async () => {
  try {
    const [stages, items, item_unlocks] = await Promise.all([
      readFileAsync("stage.json"),
      readFileAsync("item.json"),
      readFileAsync("item_unlock.json"),
    ]);

    gameAssets = { stages, items, item_unlocks };
    return gameAssets;
  } catch (err) {
    throw new Error("failed to load gameassets: " + err.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
