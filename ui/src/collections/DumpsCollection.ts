import Dump from "../models/Dump";

export default class DumpsCollection {
  protected readonly dumps: Dump[] = [];

  public constructor(dumps: Dump[] = []) {
    this.dumps = dumps;
  }

  public push(dump: Dump, maxDumps: number, maxMilliseconds: number): DumpsCollection {
    let count: number = 0;
    const dumps = this.dumps.slice().reverse().filter((d: Dump) => {
      if (maxMilliseconds > 0 && d.expired(maxMilliseconds)) {
        return false;
      }

      if (d.isPinned()) {
        return true;
      }

      return ++count < maxDumps;
    });

    dumps.reverse().push(dump);

    return new DumpsCollection(dumps);
  }

  public isEmpty(): boolean {
    return this.dumps.length === 0;
  }

  public pin(dump: Dump): DumpsCollection {
    const dumps = new DumpsCollection([...this.dumps]);

    dumps.findByUid(dump.getUid()).pin();

    return dumps;
  }

  public unpin(dump: Dump): DumpsCollection {
    const dumps = new DumpsCollection([...this.dumps]);

    dumps.findByUid(dump.getUid()).unpin();

    return dumps;
  }

  public delete(dump: Dump): DumpsCollection {
    return new DumpsCollection([...this.dumps.filter((d: Dump) => !d.equals(dump))]);
  }

  public findByUid(uid: string): Dump {
    const found = this.dumps.find((d: Dump) => d.getUid() === uid);

    if (!found) {
      throw new Error(`Dump with uid ${uid} not found`);
    }

    return found;
  }

  public getByUIDs(UIDs: string[]): Dump[] {
    const found: Dump[] = [];
    UIDs.forEach((uid: string) => {
      try {
        found.push(this.findByUid(uid));
      } catch (e: any) {
      }
    });

    return found;
  }

  public map<T>(callback: (dump: Dump) => T): T[] {
    return this.dumps.map(callback);
  }

  public removeUnpinned(): DumpsCollection {
    return new DumpsCollection([...this.dumps.filter((dump: Dump) => dump.isPinned())]);
  }

  public static fromJsonString(dumps: string): DumpsCollection {
    try {
      const collection = JSON.parse(dumps);
      if (collection.dumps === undefined) {
        return new DumpsCollection();
      }

      return new DumpsCollection(collection.dumps.map(Dump.fromJson));
    } catch (e: any) {
      return new DumpsCollection();
    }
  }
}