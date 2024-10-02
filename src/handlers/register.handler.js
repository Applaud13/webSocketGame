import handlerRepositories from "../repositories/handlerRepositories.js";
import { handleConnect, handleDisconnect, handlerEvent } from "./helper.js";

const registerHandler = (io) => {
  try {
    io.on("connection", async (socket) => {
      const userUUID = await handlerRepositories.setUserUUID(socket);

      // 기본 생성 요소
      handleConnect(socket, userUUID);

      socket.on("event", (data) => handlerEvent(io, socket, userUUID, data));

      socket.on("disconnect", () => {
        handleDisconnect(socket, userUUID);
      });
    });
  } catch (error) {
    console.log("유저 연결 중 에러발생", error);
  }
};

export default registerHandler;
