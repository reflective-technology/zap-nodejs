import { get } from './env';
import { relative } from 'node:path';
import onFinished from 'on-finished';
import onHeaders from 'on-headers';
import type http from 'node:http';

type RequestWithStartAt = http.IncomingMessage & { _startAt?: [number, number] };
type ResponseWithStartAt = http.ServerResponse & { _startAt?: [number, number] };
const levels: Record<string, number> = {
	silent: 0,
	error: 1,
	warn: 2,
	info: 3,
	verbose: 4,
	debug: 5,
};

const getResponseTime = (req: RequestWithStartAt, res: ResponseWithStartAt) => {
	// missing request and/or response start time
	/* v8 ignore start */
	if (!req._startAt || !res._startAt) {
		return
	}
	/* v8 ignore stop */

	// calculate diff
	const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
		(res._startAt[1] - req._startAt[1]) * 1e-6

	// return truncated value
	return `${ms.toFixed(3)} ms`
}

class Logger {
	private level_num: number;
	private readonly line_num: number
	private readonly cb: (msg: string) => void;

	declare error: (message: string, args?: Record<string, any>) => void;
	declare warn: (message: string, args?: Record<string, any>) => void;
	declare info: (message: string, args?: Record<string, any>) => void;
	declare verbose: (message: string, args?: Record<string, any>) => void;
	declare debug: (message: string, args?: Record<string, any>) => void;

	constructor(cb = console.log, num = 4) {
		const level = get('LOG_LEVEL')
		this.level_num = levels[level];
		this.line_num = num;
		this.cb = cb;
		for (const level in levels) {
			if (level === 'silent') continue;
			// Assign method dynamically with type assertion
			(this as Record<string, any>)[level] = (message: string, args: Record<string, any> = {}) => this.log(level, message, args);
		}
	}

	// Get the file and line number of the caller
	private line(num: number): string {
		const e = new Error('get stack');
		const stack = e.stack;
		/* v8 ignore start */
		if (!stack) {
			return "unknown:0";
		}
		/* v8 ignore stop */
		let regex = /(.*):(\d+):(\d+)/
		let match = regex.exec(stack.split("\n")[num]);
		/* v8 ignore start */
		if (!match) {
			return "unknown:0";
		}
		/* v8 ignore stop */
		const line = match[2];
		regex = /(\/[a-zA-Z].*\.(js|ts))/
		match = regex.exec(match[1]);
		/* v8 ignore start */
		if (!match) {
			return "unknown:0";
		}
		/* v8 ignore stop */
		const filepath = match[1];
		const fileName = relative(process.cwd(), filepath);
		return `${fileName}:${line}`;
	}

	private log(level: string, message: string, args?: Record<string, any>) {
		if (levels[level] > this.level_num) {
			return;
		}
		this.cb(JSON.stringify({
			level,
			ts: Math.floor(Date.now() / 1000),
			message: message,
			caller: this.line(this.line_num),
			...args,
		}))
	}

	/**
	 * Sets the logging level.
	 * @param level - The logging level to set ('silent', 'error', 'warn', 'info', 'verbose', 'debug').
	 */
	setLevel(level: string): void {
		this.level_num = levels[level];
	}

	/**
	 * Express middleware to log HTTP requests and responses.
	 * Logs the method, URL, status code, and response time for each request.
	 */
	express(level: string = 'verbose') {
		return (req: RequestWithStartAt, res: ResponseWithStartAt, next: Function) => {
			// request data
			req._startAt = process.hrtime()

			// response data
			res._startAt = undefined

			const logRequest = () => {
				let responseTime = getResponseTime(req, res)
				this.log(level, "received request", {
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