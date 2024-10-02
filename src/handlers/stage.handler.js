import { SOCKET } from "../constant.js";
import { resetItemSpace } from "../models/items.model.js";
import { resetStage, setStage } from "../models/stage.model.js";
import handlerRepositories from "../repositories/handlerRepositories.js";

// 게임 시작
export const gameStart = (io, socket, uuid, payload) => {
  try {
    // 스테이지, 아이템 공간 리셋
    resetStage(socket, uuid, payload.timeStamp);
    resetItemSpace(uuid);

    return { status: SOCKET.SUCCESS, Message: "게임 시작!" };
  } catch (error) {
    console.log("게임 시작 시도 중 에러 발생", error);
  }
};

// 게임 종료
export const gameEnd = async (io, socket, uuid, payload) => {
  try {
    // 보유한 스테이지 상태에 문제가 있는지 검사
    const stageCheck = handlerRepositories.haveStageCheck(uuid);
    if (stageCheck) return stageCheck;

    // 아이템이 정상적인 시간간격으로 생성되었는지 검사
    const itemcheck = handlerRepositories.createItemTime(uuid);
    if (itemcheck) return itemcheck;

    // 클라이언트/서버 점수 비교 검사
    const scoreCheck = handlerRepositories.scoreCheck(uuid, payload);
    if (scoreCheck) return scoreCheck;

    // 최고기록 여부 검사
    const highScore = await handlerRepositories.checkHighScore(
      io,
      socket,
      uuid,
      payload.score
    );
    if (highScore) return highScore;

    return { status: SOCKET.SUCCESS, Message: "게임 종료!" };
  } catch (error) {
    console.log("게임 종료 시도 중 에러 발생", error);
  }
};

// 스테이지 이동
export const moveStageHandler = (io, socket, uuid, payload) => {
  try {
    // 보유한 스테이지 상태에 문제가 있는지 검사
    const stageCheck = handlerRepositories.haveStageCheck(uuid);
    if (stageCheck) return stageCheck;

    // 다음 스테이지 존재하는지 확인
    const nextStage = handlerRepositories.nextStageCheck(uuid);

    // 스테이지 변경
    setStage(uuid, nextStage, payload.timeStamp);
    socket.emit(SOCKET.STAGECHANGE, nextStage);

    return { status: SOCKET.SUCCESS, Message: "스테이지 이동!" };
  } catch (error) {
    console.log("스테이지 이동 시도 중 에러 발생", error);
  }
};
