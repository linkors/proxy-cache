
# Proxy-cache

This package's goal is to cache API response. This proxy acts as interceptor between client and server. Any (or filtered) HTTP request from client will go through the proxy . The process itself can be explained as figure below.

<img width="1054" alt="image" src="https://user-images.githubusercontent.com/42864780/75757523-18f4d500-5d65-11ea-8343-02ba216d1c1e.png">


- [Setup](#setup)
- [Running Proxy-cache](#running-proxy-cache)
- [Config Source Rule](#config-source-rule)
- [Proxy HTTPS](#proxy-https)

## Setup

### Step 1: Install Node JS

This project is node based app. You can install node js [here](https://nodejs.org/)

### Step 2: Clone repo

```bash
$  git clone --depth 1 git@github.com:linkors/proxy-cache.git
& cd <repo_name>
```

### Step 3: Install project dependencies

```bash
$ yarn install
```


## Running Proxy-mock

You can run `proxy-cache` with 
```bash
$ node proxy-cache [options]
```

These are the list of arguments you can pass:

| Option | Description | Default |
| --- | --- | --- |
| `-p`, `--port` [value] | Port for proxy | 8001 |
| `-w`, `--web` [value] | Web GUI port | 8002 |
| `-f`, `--filter` [value] | List of regex to be matched with url (comma separated), default all page will be cached | - |
| `-m`, `--mode` [value] | Set [cache mode](#cache-mode) | all |
| `-c`, `--code` [value] | Http code to filter if use mode 'code' (comma separated) | - |
| `-t`, `--ttl` [value] | How long cache will be saved (in seconds) | 3600 |
| `--persist` [value] | Enable [persistence cache](#persistence-cache) | - |
| `--clean` [value] | Clean persisted cache | - |
| `-s`, `--setglobalproxy`| Will automatically set global proxy on start | - |
| `-i`, `--ignorerule`| Use this if you just want to check request response. It will ignore defined rule. | - |

example of usage:
```
// Will cache any response from url 
// that contains `api/v2/` or `api/v1/`, eg `http://api.test/api/v2/cinema/list`
// and will return from cache whenever cache is available
$ node proxy-cache -f api/v2/.*,api/v1/.*

// Will cache any response from url 
// that contains `api/v2/`
// and will return from cache when server return http code 500
$ node proxy-cache -f api/v2/.* -m code -c 500 
```


## Cache Mode

Currently, there are two mode available:
|mode| description |
|--|--|
| all | Will return from cache if cache exists |
| code | Will return from cache if cache exists only on specific http code |

Mode `code` must be used with `-c` option

    node proxy-cache -m code -c 500

This  will only return cache if actual response from server is returning  http code 500.

## Persistence Cache

By default cache will be saved on memory. This means if you turn off proxy-cache, all cache will be removed. But, if you use `--persist` option, cache will be persisted (saved) as a file.

## Proxy HTTPS

For proxy _ing_ any https requests, you need to add Anyproxy certificate as trusted source.

Use this command to generate CA certificate
```bash
$ node_modules/.bin/anyproxy-ca
```
Then you need to trust the generated certificate to your browser/device. You can see how to set up it  [Anyproxy Config Certification](http://anyproxy.io/en/#config-certification).

_Warning: please keep your root CA safe since it may influence your system security._
_Note: you only need to do this once._

## Caveats
Internet connection still need to be online, because this package acts as proxy for internet network.

