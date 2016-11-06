const listeners = [];

export const addListener = (listener) => {
  listeners.push(listener);
};

export const handleLink = (event) => {
  event.preventDefault();

  const path = event.target.pathname;
  listeners.forEach((listener) => {
    listener(path);
  });
};
