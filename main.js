#!/usr/bin/env node

const program = require("commander"),
  packageInfo = require("./package.json"),
  proxyApp = require("./app/app");

program
  .version(packageInfo.version)
  .option("-p, --port [value]", "proxy port", "8001")
  .option("-w, --web [value]", "web GUI port", "8002")
  .option(
    "-f, --filter",
    "List of url to be cached (comma separated), default no filter"
  )
  .option("-m, --mode <mode>", "Cache mode", /^(all|code|nonet)$/i, "all")
  .option(
    "-c, --code <code>",
    "Http code if use mode 'code' (comma separated)",
    "500"
  )
  .option("-t, --ttl <ttl>", "How long cache will be saved", "3600")
  .option("-c, --clear", "Clear cache")
  .parse(process.argv);

if (program.clear) {
} else {
  return proxyApp.startProxy(program);
}
