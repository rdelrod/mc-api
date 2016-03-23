# mc-api

[![Code Climate](https://codeclimate.com/github/rdelrod/mc-api/badges/gpa.svg)](https://codeclimate.com/github/rdelrod/mc-api)

A simple express REST API to interact with [mcfd](https://github.com/rdelrod/mcfd)


## Routes


**GET** - `/server/status`

Returns the status of the server.

```json
{
  "latency": 9,
  "success": true,
  "status":  "up"
}
```

**GET** - `/server/start`

**Authenticated**

Starts the server.

```json
{
  ""
}
```

Without Authentication:

```json
{
  "success": false,
  "reason":  "NOAUTH"
}
```

**GET** - `/server/stop`

Stops the server (equivalent to `stop`)

**Authenticated**

```json
{
  ""
}
```

Without Authentication:

```json
{
  "success": false,
  "reason":  "NOAUTH"
}
```

**GET** - `/server/forceKill`

**Authenticated**

Force kills the server thread. (`kill -9 <pid>`)

**GET** - `/server/sendCommand/:command`

**Authenticated** / **Deprecated**

Send a command to the server.

**POST** - `/server/sendCommand`

**Authenticated**

Body:

```json
{
  "command": "command"
}
```

Result:

```json
{
  ""
}
```

## Authentication

Header: **Authentication**

Format: `Token:TokenSecret`

## License

MIT
