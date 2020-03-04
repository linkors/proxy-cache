const AnyProxy = require("anyproxy");
const getRule = require("./rule");
const colors = require('colors');

function setGlobalProxy(host, port) {
  console.log(colors.bold(`${colors.green('Set')} global proxy...`));
  AnyProxy.utils.systemProxyMgr.enableGlobalProxy(host, port);
  AnyProxy.utils.systemProxyMgr.enableGlobalProxy(host, port, 'https');
}

function unsetGlobalProxy() {
  console.log(colors.bold(`${colors.yellow('Unset')} global proxy...`));
  AnyProxy.utils.systemProxyMgr.disableGlobalProxy();
  AnyProxy.utils.systemProxyMgr.disableGlobalProxy('https');
}

let cache = null;
let program = {};
module.exports = {
  initProxy: function (program) {
    const CacheService = program.persist ? require("./memo.service") : require("./cache.service");
    cache = new CacheService(program.ttl);
    return this;
  },
  start: function () {
    if (!cache) return console.log(`${colors.red('Proxy has not been initialized!')}, Please call ${colors.bold('initProxy')}`)
    const options = {
      port: program.port,
      rule: getRule(program, cache),
      webInterface: {
        enable: true,
        webPort: program.web
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

    if (program['setglobalproxy']) {
      setGlobalProxy('localhost', options.port);
    }

    // Exit by ctrl+c
    process.on("SIGINT", () => {
      console.log(colors.bold('Stopping proxy server ...'));
      try {
        proxyServer && proxyServer.close();
        unsetGlobalProxy();
      } catch (e) {
        console.error(e);
      }
      process.exit();
    });
  },
  cleanCache: function () {
    console.log('Clearing ' + colors.yellow('cache') + '...');
    cache.flush(function () {
      console.log('Cache ' + colors.yellow('cleared'));
    });
  }
};
