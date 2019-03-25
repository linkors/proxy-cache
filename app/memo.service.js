const cache = require("../lib/persistent-cache");

class Cache {
  constructor(ttlSeconds) {
    this.cache = new cache({
      duration: ttlSeconds,
      base: "data",
      memory: true,
      persist: true,
      name: "proxy-cache"
    });
  }

  getOrSet(key, storeFunction) {
    return new Promise((resolve, reject) => {
      this.cache.get(key, (err, data) => {
        if (value) {
          return resolve(value);
        }

        return storeFunction().then(result => {
          this.cache.set(key, result);
          return result;
        });
      });
    });
  }

  set(key, value) {
    this.cache.putSync(key, value, function(err) {
      console.log("Error ==============================");
      console.log(err);
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.cache.get(key, (err, value) => {
        console.log("=====================");
        console.log(value);
        if (value) {
          return resolve(value);
        }
        return reject("not found");
      });
    });
  }

  del(keys) {
    this.cache.delete(keys, function() {});
  }

  delStartWith(startStr = "") {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys((err, keys) => {
      for (const key of keys) {
        if (key.indexOf(startStr) === 0) {
          this.cache.delete(key, function() {});
        }
      }
    });
  }

  flush() {
    this.cache.unlink(function() {});
  }
}

module.exports = Cache;
