const timestamp = () => new Date().toISOString();

const formatMessage = (level, ...args) => {
  return [`[${timestamp()}] [${level}]`, ...args];
};

export const logger = {
  info(...args) {
    console.log(...formatMessage('INFO', ...args));
  },

  warn(...args) {
    console.warn(...formatMessage('WARN', ...args));
  },

  error(...args) {
    console.error(...formatMessage('ERROR', ...args));
  },

  /** Payment-specific logs — always output regardless of log level config */
  payment(...args) {
    console.log(...formatMessage('PAYMENT', ...args));
  },
};
