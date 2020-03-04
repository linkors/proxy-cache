const colors = require('colors');

module.exports = function getRule(program, cache) {

  let listRegExp = null;

  if (program.filter) {
    listRegExp = program.filter.split(',').map(filter => {
      return RegExp(filter);
    })
  }
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

  const getResponse = (key, onNotFound) => {
    return cache
      .get(key)
      .then(result => {
        console.log(colors.green.bold('Cache found! ') + 'Returning from cache ...');
        return new Promise(resolve => {
          resolve({ response: result });
        });
      })
      .catch(onNotFound);
  };

  return {
    *beforeSendRequest(requestDetail) {
      if (
        !listRegExp ||
        listRegExp.some(rg => rg.test(requestDetail.url))
      ) {
        console.log('\nRequest for: ' + colors.blue.bold(requestDetail.url))

        switch (program.mode) {
          case "all":
            return getResponse(requestDetail.url, e => {
              return null;
            });
          case "code":
            // only for specific http code
            const codes = program.code.split(",").map(code => parseInt(code));
            if (
              responseDetail &&
              codes.some(code => responseDetail.response.statusCode === code)
            ) {
              return getResponse(requestDetail.url, e => {
                return null;
              });
            } else {
              return new Promise(resolve => {
                resolve({ response: responseDetail.response });
              });
            }
        }

      }
    },
    *beforeSendResponse(requestDetail, responseDetail) {
      if (
        !listRegExp ||
        listRegExp.some(rg => rg.test(requestDetail.url))
      ) {
        if (responseDetail.response.statusCode === 200) {
          cache.set(requestDetail.url, responseDetail.response);
        }

      }
    }
  };
};
