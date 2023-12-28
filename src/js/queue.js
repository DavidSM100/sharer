import db from './components/localforage.js';
import { _upd } from './components/xdc.js';

async function _send() {
  const key = await db.infos.key(0) || await db.parts.key(0) || "none";

  if (key === "none") {
    _wait();
  } else {
    const id = key[0];
    const db_name = key[1];
    const updateObj = await db[db_name].get(id);
    _upd(updateObj.update, updateObj.descr);

    await db[db_name].rm(id);
    _wait();
  }

}

export default async function _wait() {
  setTimeout(_send, 15000);
}