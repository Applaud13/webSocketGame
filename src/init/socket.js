import { Server as socketIO } from "socket.io";
import registerHandler from "../handlers/register.handler.js";

const initSocket = (server) => {
  const io = new socketIO();
  io.attach(server);

  registerHandler(io);
};

export default initSocket;
