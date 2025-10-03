// Sistema de logging condicional
// Solo muestra logs en desarrollo, silencioso en producción

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
    // En producción, podría enviar a servicio de monitoreo (Sentry, LogRocket, etc.)
    // if (!isDev) {
    //   sendToMonitoringService('error', args);
    // }
  },
  
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },
  
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  }
};

export default logger;
