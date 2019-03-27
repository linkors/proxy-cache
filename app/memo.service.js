const cache = require("../lib/persistent-cache");
const colors = require("colors");

function clean(key) {
  const lastChar = key[key.length - 1];
  if (lastChar === '/') {
    key = key.substring(0, key.length - 1);
  }
  return key.replace(/\//g, '|');
}

function parseBack(key) {
  return key.replace(/|/g, '/');
}

class Cache {
  constructor(ttlSeconds) {
    this.cache = new cache({
      duration: ttlSeconds * 1000,
      base: "data",
      memory: true,
      persist: true,
      name: "proxy-cache"
    });
  }

  getOrSet(key, storeFunction) {
    return new Promise((resolve, reject) => {
      this.cache.get(clean(key), (err, data) => {
        if (value) {
          return resolve(value);
        }

        return storeFunction().then(result => {
          this.cache.set(clean(key), result);
          return result;
        });
      });
    });
  }

  set(key, value) {
    this.cache.put(clean(key), value, function (err) {
      if (err) {
        console.log(colors.red("Error saving cache") + err);
      }
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.cache.get(clean(key), (err, value) => {
        if (value) {
          return resolve(value);
        }
        return reject("not found");
      });
    });
  }

  del(keys) {
    this.cache.delete(clean(keys), function () { });
  }

  delStartWith(startStr = "") {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys((err, keys) => {
      for (const key of keys) {
        const parsedBack = parseBack(key);
        if (parsedBack.indexOf(startStr) === 0) {
          this.del(key);
        }
      }
    });
  }

  flush(cb) {
    this.cache.unlink(cb);
  }
}

module.exports = Cache;
