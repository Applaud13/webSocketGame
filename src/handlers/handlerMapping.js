import { gameStart, gameEnd, moveStageHandler } from "./stage.handler.js";
import { createItem, grabItem } from "./play.handler.js";

const handlerMapping = {
  2: gameStart,
  3: gameEnd,
  4: createItem,
  5: grabItem,
  11: moveStageHandler,
};

export default handlerMapping;
