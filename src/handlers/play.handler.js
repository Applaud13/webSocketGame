import { SOCKET } from "../constant.js";
import { pushCreatedItem, pushGrabedItem } from "../models/items.model.js";
import handlerRepositories from "../repositories/handlerRepositories.js";

// 아이템 생성
export const createItem = (io, socket, uuid, payload) => {
  try {
    // 보유한 스테이지 상태에 문제가 있는지 검사
    const stageCheck = handlerRepositories.haveStageCheck(uuid);
    if (stageCheck) return stageCheck;

    // 현재 스테이지에서 생성 가능한 아이템이 생성되었는지 검사
    const imtecheck = handlerRepositories.createItemStageCheck(uuid, payload);
    if (imtecheck) return imtecheck;

    // 생성 아이템 목록에 생성된 아이템 추가
    pushCreatedItem(uuid, payload);

    return { status: SOCKET.SUCCESS, Message: "아이템 생성!" };
  } catch (error) {
    console.log("생성 아이템 목록 갱신 중 에러 발생", error);
  }
};

// 아이템 획득
export const grabItem = (io, socket, uuid, payload) => {
  try {
    // 보유한 스테이지 상태에 문제가 있는지 검사
    const stageCheck = handlerRepositories.haveStageCheck(uuid);
    if (stageCheck) return stageCheck;

    // 획득 아이템목록에 획득한 아이템 추가
    pushGrabedItem(uuid, payload);

    // 생성된 아이템을 획든한게 맞는지 검사
    const itemCheck = handlerRepositories.itemCheck(uuid, payload);
    if (itemCheck) return itemCheck;

    return { status: SOCKET.SUCCESS, Message: "아이템 획득!" };
  } catch (error) {
    console.log("획득 아이템 목록 갱신 중 에러 발생", error);
  }
};
