const AnyProxy = require("anyproxy");
const getRule = require("./rule");
const colors = require('colors');

module.exports = {
  startProxy: function (program) {
    const CacheService = program.persist ? require("./memo.service") : require("./cache.service");
    const cache = new CacheService(program.ttl);
    const options = {
      port: 8001,
      rule: getRule(program, cache),
      webInterface: {
        enable: true,
        webPort: 8002
      },
      throttle: 10000,
      forceProxyHttps: true,
      wsIntercept: false,
      silent: true
    };
    const proxyServer = new AnyProxy.ProxyServer(options);

    proxyServer.on("ready", () => {
      var ip = require("ip");
      console.log("Proxy server is ready!");
      console.log(
        colors.bold("Please set your proxy to ") +
        colors.green.bold.underline(ip.address()) +
        colors.bold(" with port ") +
        colors.green.bold.underline(program.port) + "\n\n\n"
      );
      /* */
    });
    proxyServer.on("error", e => {
      console.log(colors.red('Cannot start proxy server: ') + e);
    });
    proxyServer.start();

    // Exit by ctrl+c
    process.on("SIGINT", () => {
      console.log(colors.bold('Stopping proxy server ...'));
      try {
        proxyServer && proxyServer.close();
      } catch (e) {
        console.error(e);
      }
      process.exit();
    });
  },
  cleanCache: function () {
    const cache = new CacheService();
    console.log('Clearing ' + colors.yellow('cache') + '...');
    cache.flush(function () {
      console.log('Cache ' + colors.yellow('cleared'));
    });
  }
};
