const NodeCache = require("node-cache");

class Cache {
  constructor(ttlSeconds) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });
  }

  getOrSet(key, storeFunction) {
    const value = this.cache.get(key);
    if (value) {
      return Promise.resolve(value);
    }

    return storeFunction().then(result => {
      this.cache.set(key, result);
      return result;
    });
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  get(key) {
    const value = this.cache.get(key);
    if (value) {
      console.log("Returning value from cache ...")
      return Promise.resolve(value);
    }
    return Promise.reject("not found");
  }

  del(keys) {
    this.cache.del(keys);
  }

  delStartWith(startStr = "") {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key);
      }
    }
  }

  flush() {
    this.cache.flushAll();
  }
}

module.exports = Cache;
