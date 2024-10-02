import { SOCKET } from "../constant.js";
import { getGameAssets } from "../init/assets.js";

const stages = {};

export const createStage = (uuid) => {
  stages[uuid] = [];
};

export const getStage = (uuid) => {
  return stages[uuid];
};

export const setStage = (uuid, data, timeStamp) => {
  return stages[uuid].push({
    id: data.id,
    stage: data.stage,
    clearScore: data.clearScore,
    timeStamp,
  });
};

export const resetStage = (socket, uuid, timeStamp) => {
  const zerostage = getGameAssets().stages.data[0];
  stages[uuid] = [
    {
      id: zerostage.id,
      stage: zerostage.stage,
      clearScore: zerostage.clearScore,
      timeStamp,
    },
  ];
  socket.emit(SOCKET.STAGECHANGE, zerostage);
};

export const deleteStages = (uuid) => {
  delete stages[uuid];
};
