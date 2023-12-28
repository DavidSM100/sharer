import localforage from 'localforage';


// Get Database
function _db(db_name) {
  return localforage.createInstance({
    name: db_name
  });
}


// Set item
async function _set(key, item, db_name) {
  const db = _db(db_name);
  return await db.setItem(key, item);
}

// Get item
async function _get(key, db_name) {
  const db = _db(db_name);
  return await db.getItem(key);
}

// Remove item
async function _rm(key, db_name) {
  const db = _db(db_name);
  return await db.removeItem(key);
}


// Get key using its index
async function _key(index, db_name) {
  const db = _db(db_name);
  const key = await db.key(index);
  if (key) return [key, db_name];
}


// Get Databases actions
function db(name) {
  return {
    set: async function (key, item) {
      return await _set(key, item, name);
    },
    get: async function (key) {
      return await _get(key, name);
    },
    rm: async function (key) {
      return await _rm(key, name);
    },
    key: async function (index) {
      return await _key(index, name);
    },
    db: function () {
      return _db(name);
    }
  }
}


// Export databases
export default {
  config: db("config"),
  parts: db("parts"),
  infos: db("infos"),
  updates: db("updates")
}