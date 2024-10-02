import { SOCKET } from "../constant.js";
import { createItemSpace, deleteItempSpace } from "../models/items.model.js";
import { createStage, deleteStages } from "../models/stage.model.js";
import { addUser, removeUser } from "../models/user.model.js";
import handlerRepositories from "../repositories/handlerRepositories.js";

// 유저 접속
export const handleConnect = async (socket, uuid) => {
  try {
    // 기본 필수 데이터 생성
    addUser(uuid, socket);
    createStage(uuid);
    createItemSpace(uuid);
    await handlerRepositories.setServerHighScore(socket);
    handlerRepositories.loadAssetsFrontEnd(socket);
    console.log("유저 접속: ", uuid);
  } catch (error) {
    console.log("유저 접속 처리 중 에러 발생", error);
  }
};

// 유저 접속 종료
export const handleDisconnect = (socket, uuid) => {
  try {
    // 기본 필수 데이터 삭제
    removeUser(socket.id);
    deleteStages(uuid);
    deleteItempSpace(uuid);
  } catch (error) {
    console.log("유저 접속 종료 처리 중 에러 발생", error);
  }
};

// handlerId → handler 변환
export const handlerEvent = async (io, socket, userUUID, data) => {
  try {
    // 클라이언트/서버 timeStamp 격차 검사
    handlerRepositories.timeStampCheck(socket, data.payload);

    // 클라이언트 버전 검사
    const clientVersioncheck = handlerRepositories.clientVersionCheck(
      data.clientVersion
    );
    if (clientVersioncheck) socket.emit(SOCKET.RESPONSE, clientVersioncheck);

    const handler = handlerRepositories.handlerIdCheck(socket, data.handlerId);

    // handler 실행
    const response = await handler(io, socket, userUUID, data.payload);

    // response 실행
    if (response.broadcast) {
      io.emit(SOCKET.RESPONSE, response.broadcast);
    }

    socket.emit(SOCKET.RESPONSE, response);
  } catch (error) {
    console.log("Handler 변환 중 에러 발생", error);
  }
};
