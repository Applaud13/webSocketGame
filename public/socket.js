import { CLIENT_VERSION, SOCKET } from "./Constants.js";

const socket = io("http://localhost:3000", {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userID = null;

socket.on(SOCKET.RESPONSE, (data) => {
  console.log(data);
});

socket.on(SOCKET.SETUUID, (data) => {
  userID = data;
  document.cookie = data;
});

socket.on(SOCKET.HIGHSCORE, (score) => {
  localStorage.setItem(SOCKET.HIGHSCORE, Math.floor(score));
});

socket.on(SOCKET.USERSCORE, (score) => {
  localStorage.setItem(SOCKET.USERSCORE, Math.floor(score));
});

const sendEvent = (handlerId, payload) => {
  socket.emit("event", {
    userID: document.cookie,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

export { sendEvent, socket };
