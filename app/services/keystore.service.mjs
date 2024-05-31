import { nanoid } from "nanoid";

let __instance = null;

export class KeyStore {
  constructor(db) {
    this.db = db;
  }

  getKeys() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM keys", (err, data) => {
        const p = err
          ? err
          : data.map((key) => {
              return key.__v;
            });
        (err ? reject : resolve)(p);
      });
    });
  }

  setKeys() {
    return new Promise((resolve, reject) => {
      const keys = new Array(4).fill(0).map(() => {
        return nanoid(32);
      });
      const values = keys.map((k) => {
        return `('${k}')`;
      });
      const sql = `INSERT INTO keys (__v) VALUES ${values.join(",")}`;
      this.db.run(sql, (err, data) => {
        const p = err ? err : data;
        (err ? reject : resolve)(p);
      });
    });
  }

  static getInstance(db) {
    if (!__instance) {
      __instance = new KeyStore(db);
    }
    return __instance;
  }
}
