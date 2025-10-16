# @reflective-technology/zap-nodejs

A lightweight Node.js logger with structured logging and Express middleware, designed to match the format and philosophy of [go.uber.org/zap](https://go.uber.org/zap).

## Features

- **Structured Logging**: Log messages with structured fields for better readability and analysis.
- **HTTP Middleware**: Built-in middleware for logging HTTP requests and responses.
- **Customizable Levels**: Supports multiple log levels (e.g., `debug`, `info`, `warn`, `error`).

## Installation

```bash
npm install @reflective-technology/zap-nodejs
# or
yarn add @reflective-technology/zap-nodejs
# or
pnpm add @reflective-technology/zap-nodejs
```

## Usage

### Basic Logger

```javascript
import Logger from '@reflective-technology/zap-nodejs'

const logger = new Logger()

logger.info('This is an info message', { key: 'value' })
logger.error('This is an error message', { error: 'Something went wrong' })
```

### HTTP Middleware

```javascript
import Logger from '@reflective-technology/zap-nodejs'
import express from 'express'

const app = express()
const logger = new Logger()

app.use(logger.express())

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.listen(3000, () => {
  logger.info('Server is running on port 3000')
})
```

## API

### Logger

#### `new Logger(logFunction, level)`

- `logFunction` (optional): A custom function to handle log messages.
- `level` (optional): The minimum log level (e.g., `debug`, `info`, `warn`, `error`).

#### Methods

- `logger.debug(message, fields)`: Logs a debug message.
- `logger.info(message, fields)`: Logs an info message.
- `logger.warn(message, fields)`: Logs a warning message.
- `logger.error(message, fields)`: Logs an error message.
- `logger.setLevel(level)`: Sets the minimum log level.

### Express Middleware

#### `logger.express()`

Returns an Express middleware function that logs HTTP requests and responses.

## Configuration

You can configure the logger using environment variables:

- `LOG_LEVEL`: Sets the minimum log level (default: `info`).

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/Reflective-Technology/zap-nodejs).

## Links

- [Homepage](https://github.com/Reflective-Technology/zap-nodejs)
- [Issues](https://github.com/Reflective-Technology/zap-nodejs/issues)
- [go.uber.org/zap](https://go.uber.org/zap)