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
let _program = {};
module.exports = {
  initProxy: function (program) {
    const CacheService = program.nopersist ? require("./cache.service") : require("./memo.service");
    cache = new CacheService(program.ttl);
    _program = program;
    return this;
  },
  start: function () {
    if (!cache) return console.log(`${colors.red('Proxy has not been initialized!')}, Please call ${colors.bold('initProxy')}`)

    const options = {
      port: _program.port | 8001,
      rule: getRule(_program, cache),
      webInterface: {
        enable: true,
        webPort: _program.web | 8002
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
        colors.green.bold.underline(options.port) + "\n\n\n"
      );
      /* */
    });
    proxyServer.on("error", e => {
      console.log(colors.red('Cannot start proxy server: ') + e);
    });
    proxyServer.start();

    if (_program['setglobalproxy']) {
      setGlobalProxy('localhost', options.port);
    }

    // Exit by ctrl+c
    process.on("SIGINT", () => {
      console.log(colors.bold('Stopping proxy server ...'));
      try {
        proxyServer && proxyServer.close();
        if (_program['setglobalproxy'])
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
