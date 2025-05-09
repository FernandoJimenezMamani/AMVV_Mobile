const isDev = __DEV__; 

const log = (...args) => {
  if (isDev) {
    console.log('[LOG]', ...args);
  }
};

const warn = (...args) => {
  if (isDev) {
    console.warn('[WARN]', ...args);
  }
};

const error = (...args) => {
  if (isDev) {
    console.error('[ERROR]', ...args); 
  } else {

  }
};

export default {
  log,
  warn,
  error,
};
