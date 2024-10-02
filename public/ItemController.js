import Item from "./Item.js";
import { sendEvent } from "./socket.js";

class ItemController {
  INTERVAL_MIN = 1000;
  INTERVAL_MAX = 6000;
  nextInterval = null;
  items = [];

  constructor(itemUnlock, ctx, itemImages, scaleRatio, speed) {
    this.itemUnlock = itemUnlock;
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;

    this.setNextItemTime();
  }

  setNextItemTime() {
    this.nextInterval = this.getRandomNumber(
      this.INTERVAL_MIN,
      this.INTERVAL_MAX
    );
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createItem(stageId) {
    const itemUnlock = this.itemUnlock.find(
      (itemUnlock) => itemUnlock.stage_id === stageId
    ).item;

    const randomN = Math.random();
    let itemPercentage = 0;
    let index = 0;

    for (let i = 0; i < itemUnlock.length; i++) {
      itemPercentage += itemUnlock[i].item_precentage;

      if (randomN < itemPercentage) {
        index = itemUnlock[i].item_id;
        index--;
        break;
      }
    }

    const itemInfo = this.itemImages[index];
    const x = this.canvas.width * 1.5;
    const y = this.getRandomNumber(10, this.canvas.height - itemInfo.height);

    const item = new Item(
      this.ctx,
      itemInfo.id,
      x,
      y,
      itemInfo.width,
      itemInfo.height,
      itemInfo.image,
      itemInfo.score
    );

    this.items.push(item);

    sendEvent(4, {
      itemId: itemInfo.id,
      itemScore: itemInfo.score,
      timeStamp: Date.now(),
    });
  }

  update(gameSpeed, deltaTime, stageId) {
    if (this.nextInterval <= 0) {
      this.createItem(stageId);
      this.setNextItemTime();
    }

    this.nextInterval -= deltaTime;

    this.items.forEach((item) => {
      item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
    });

    this.items = this.items.filter((item) => item.x > -item.width);
  }

  draw() {
    this.items.forEach((item) => item.draw());
  }

  collideWith(sprite) {
    const collidedItem = this.items.find((item) => item.collideWith(sprite));
    if (collidedItem) {
      this.ctx.clearRect(
        collidedItem.x,
        collidedItem.y,
        collidedItem.width,
        collidedItem.height
      );
      return {
        itemId: collidedItem.id,
      };
    }
  }

  reset() {
    this.items = [];
  }
}

export default ItemController;
