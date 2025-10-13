import { relative } from 'path';
import onHeaders from 'on-headers';
import onFinished from 'on-finished';
import { get } from './env.js';

const levels = {
	silent: 0,
	error: 1,
	warn: 2,
	info: 3,
	verbose: 4,
	debug: 5,
};

const getResponseTime = (req, res) => {
	/* c8 ignore start */
	// missing request and/or response start time
	if (!req._startAt || !res._startAt) {
		return
	}
	/* c8 ignore stop */

	// calculate diff
	const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
		(res._startAt[1] - req._startAt[1]) * 1e-6

	// return truncated value
	return `${ms.toFixed(3)} ms`
}

class Logger {
	constructor(cb = console.log, num = 4) {
		const level = get('LOG_LEVEL')
		this.level_num = levels[level];
		this.line_num = num;
		this.cb = cb;

		// Create a function for each log level
		for (const level in levels) {
			this[level] = (...args) => this.log(level, ...args);
		}
	}

	setLevel(level) {
		this.level_num = levels[level];
	}

	// Get the file and line number of the caller
	line(num) {
		const e = new Error();
		let regex = /(.*):(\d+):(\d+)/
		let match = regex.exec(e.stack.split("\n")[num]);
		const line = match[2];
		regex = /(\/[a-zA-Z].*\.js)/
		match = regex.exec(match[1]);
		const filepath = match[1];
		const fileName = relative(process.cwd(), filepath);
		return `${fileName}:${line}`;
	}

	// Log a message with the specified level and caller information
	log(level, message, args) {
		if (levels[level] > this.level_num) {
			return;
		}
		this.cb(JSON.stringify({
			level,
			ts: Math.floor(new Date().getTime() / 1000),
			message: message,
			caller: this.line(this.line_num),
			...args,
		}))
	}

	http() {
		const logger = this;
		return (req, res, next) => {
			// request data
			req._startAt = process.hrtime()

			// response data
			res._startAt = undefined

			const logRequest = () => {
				let responseTime = getResponseTime(req, res)
				logger.verbose("received request", {
					status: res.statusCode,
					responseTime: responseTime,
					method: req.method,
					url: req.url
				});
			}

			// record response start
			onHeaders(res, () => {
				res._startAt = process.hrtime()
			})
			// log when response finished
			onFinished(res, logRequest)

			next()
		}
	}
}

export default Logger;