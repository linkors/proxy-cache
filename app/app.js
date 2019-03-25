const AnyProxy = require("anyproxy");
const getRule = require("./rule");
module.exports = {
  startProxy: function(program) {
    const options = {
      port: 8001,
      rule: getRule(program),
      webInterface: {
        enable: true,
        webPort: 8002
      },
      throttle: 10000,
      forceProxyHttps: true,
      wsIntercept: false,
      silent: false
    };
    const proxyServer = new AnyProxy.ProxyServer(options);

    proxyServer.on("ready", () => {
      var ip = require("ip");
      console.log("Proxy server is ready!");
      console.log(
        "Please set your proxy to '" +
          ip.address() +
          "' with port '" +
          program.port +
          "'"
      );
      /* */
    });
    proxyServer.on("error", e => {
      /* */
    });
    proxyServer.start();

    //exit cause ctrl+c
    process.on("SIGINT", () => {
      try {
        proxyServer && proxyServer.close();
      } catch (e) {
        console.error(e);
      }
      process.exit();
    });
  }
};
