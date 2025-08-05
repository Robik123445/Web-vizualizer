/** Simple in-browser logger that allows log download */
export class Logger {
  constructor() {
    this.logs = [];
    this.log('Logger initialized');
  }

  /** Add message to log */
  log(msg) {
    const line = `${new Date().toISOString()} ${msg}`;
    this.logs.push(line);
    console.log(line);
  }

  /** Trigger download of log file */
  download() {
    const blob = new Blob([this.logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}
