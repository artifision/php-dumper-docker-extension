import {blue, green, lightGreen, orange, pink, purple, teal} from "@mui/material/colors";

export default class Dump {
  protected pinned: boolean = false;

  protected methodColors: any = {
    'HEAD': lightGreen[400],
    'GET': blue[400],
    'POST': teal[400],
    'PUT': orange[400],
    'PATCH': purple[400],
    'DELETE': pink[400],
    'CLI': green[400],
  };

  public constructor(
    protected uid: string,
    protected timestamp: number,
    protected html: string,
    protected context: any,
  ) {
  }

  public getISOTime(): string {
    return new Date(this.timestamp * 1000).toISOString();
  }

  public getUid(): string {
    return this.uid;
  }

  public getHtml(): string {
    return this.html;
  }

  public getHumanDateTime(): string {
    return new Date(this.timestamp * 1000).toLocaleString();
  }

  public getSource(): string {
    return this.context.source.file + ':' + this.context.source.line;
  }

  public getRequestMethod(): string | undefined {
    if (this.isCli()) {
      return 'CLI';
    }

    return this.context?.request?.method;
  }

  public getCliCommand(): string | undefined {
    return this.context?.cli?.command_line;
  }

  public isCli(): boolean {
    return this.context?.cli?.command_line !== undefined;
  }

  public getMethodColor(): string {
    const method = this.getRequestMethod();
    if (method && this.methodColors[method]) {
      return this.methodColors[method];
    }

    return this.methodColors['GET'];
  }

  public getRequestUri(): string | undefined {
    if (this.isCli()) {
      return this.getCliCommand();
    }

    return this.context?.request?.uri;
  }

  public static fromJson(json: any): Dump {
    const dump = new Dump(
      json.uid,
      json.timestamp,
      json.html,
      json.context,
    );

    if (json.pinned) {
      dump.pin();
    }

    return dump;
  }

  public equals(target: Dump): boolean {
    return this.uid === target.getUid();
  }

  public expired(maxMilliseconds: number): boolean {
    if (this.pinned) {
      return false;
    }

    return this.timestamp * 1000 + maxMilliseconds < Date.now();
  }

  public pin() {
    this.pinned = true;
  }

  public unpin() {
    this.pinned = false;
  }

  public isPinned(): boolean {
    return this.pinned;
  }
}