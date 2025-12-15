export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: any;
  timestamp: string;
  environment: string;
}

class Logger {
  private log(level: LogLevel, message: string, metadata?: any) {
    const entry: LogEntry = {
      level,
      message,
      metadata,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    // In production, we could send this to Sentry / LogRocket / Datadog
    // For now, we standardize console output
    switch (level) {
      case 'error':
        console.error(JSON.stringify(entry));
        break;
      case 'warn':
        console.warn(JSON.stringify(entry));
        break;
      case 'info':
        console.info(JSON.stringify(entry));
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(JSON.stringify(entry));
        }
        break;
    }
  }

  public info(message: string, metadata?: any) {
    this.log('info', message, metadata);
  }

  public warn(message: string, metadata?: any) {
    this.log('warn', message, metadata);
  }

  public error(message: string, metadata?: any) {
    this.log('error', message, metadata);
  }

  public debug(message: string, metadata?: any) {
    this.log('debug', message, metadata);
  }
}

export const logger = new Logger();
