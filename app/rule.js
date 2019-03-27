const colors = require('colors');

module.exports = function getRule(program, cache) {
  const ttl = parseInt(program.ttl);

  const getOrSetCacheResponse = (key, val) => {
    return cache
      .getOrSet(key, () => {
        return new Promise(resolve => {
          resolve({ response: val });
        });
      })
      .then(result => {
        return result;
      });
  };

  const getResponse = (key, ifEmpty) => {
    return cache
      .get(key)
      .then(result => {
        console.log(colors.green.bold('Cache found! ') + 'Returning from cache ...');
        return new Promise(resolve => {
          resolve({ response: result });
        });
      })
      .catch(e => {
        return new Promise(resolve => {
          resolve({ response: ifEmpty });
        });
      });
  };

  return {
    *onError(requestDetail, error) {
      console.log("Cannot reach server, returning from cache is available");
      return getResponse(requestDetail.url, null);
    },
    *onConnectError(requestDetail, error) {
      console.log("Cannot reach server, returning from cache is available");
      return getResponse(requestDetail.url, null);
    },
    *beforeSendResponse(requestDetail, responseDetail) {
      if (
        !program.filter ||
        program.filter.split(",").some(f => requestDetail.url.includes(f))
      ) {

        console.log('Request for ' + colors.blue.bold(requestDetail.url));
        if (responseDetail.response.statusCode === 200) {
          cache.set(requestDetail.url, responseDetail.response);
        }
        switch (program.mode) {
          case "all":
            return getResponse(requestDetail.url, responseDetail.response);
          case "code":
            // only for specific http code
            const codes = program.code.split(",").map(code => parseInt(code));
            if (
              responseDetail &&
              codes.some(code => responseDetail.response.statusCode === code)
            ) {
              return getResponse(requestDetail.url, responseDetail.response);
            } else {
              return new Promise(resolve => {
                resolve({ response: responseDetail.response });
              });
            }
        }
      }
    }
  };
};
