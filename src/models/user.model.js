const users = [];

export const addUser = (uuid, socket) => {
  users.push({ uuid: uuid, socketId: socket.id });
};

export const removeUser = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = () => {
  return users;
};
