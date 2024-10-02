const items = {};

export const createItemSpace = (uuid) => {
  items[uuid] = {};
};

export const resetItemSpace = (uuid) => {
  items[uuid] = { createItem: [], grabItem: [] };
};

export const getItemSpace = (uuid) => {
  return items[uuid];
};

export const pushCreatedItem = (uuid, data) => {
  items[uuid].createItem.push(data);
};

export const pushGrabedItem = (uuid, data) => {
  items[uuid].grabItem.push(data);
};

export const deleteItempSpace = (uuid) => {
  delete items[uuid];
};
