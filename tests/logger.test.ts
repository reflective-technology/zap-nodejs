import { describe, it, expect, vi, beforeEach } from 'vitest'
import Logger, { RequestWithStartAt, ResponseWithStartAt } from '../src'

type LogFunction = (message?: any, ...optionalParams: any[]) => void
type TestRes = ResponseWithStartAt & {
	_onHeaders: (cb: Function) => void
	_onFinished: (cb: Function) => void
}

vi.mock('on-headers', () => ({
	default: (res: TestRes, cb: Function) => res._onHeaders(cb)
}))
vi.mock('on-finished', () => ({
	default: (res: TestRes, cb: Function) => res._onFinished(cb)
}))

describe('Logger', () => {
	let logSpy: ReturnType<typeof vi.fn>

	beforeEach(() => {
		logSpy = vi.fn()
	})

	it('should log messages at allowed level', () => {
		const logger = new Logger(logSpy as LogFunction, 4)
		logger.info('Test info', { foo: 'bar' })
		expect(logSpy).toHaveBeenCalled()
		const logObj = JSON.parse(logSpy.mock.calls[0][0])
		expect(logObj.level).toBe('info')
		expect(logObj.message).toBe('Test info')
		expect(logObj.foo).toBe('bar')
	})

	it('should not log messages below current level', () => {
		const logger = new Logger(logSpy as LogFunction, 4)
		logger.setLevel('error')
		logger.info('Should not log')
		expect(logSpy).not.toHaveBeenCalled()
		logger.error('Should log')
		expect(logSpy).toHaveBeenCalled()
	})

	it('should include caller info', () => {
		const logger = new Logger(logSpy as LogFunction, 4)
		logger.info('Caller test')
		const logObj = JSON.parse(logSpy.mock.calls[0][0])
		expect(logObj.caller).toMatch(/logger\.test\.ts:\d+/)
	})

	it('should log HTTP request when response finishes', () => {
		const logger = new Logger(logSpy as LogFunction, 4)
		logger.setLevel('verbose')
		const middleware = logger.express()

		// mock req, res, next
		const req: RequestWithStartAt = { method: 'GET', url: '/test', _startAt: undefined } as RequestWithStartAt
		const res: TestRes = { 
			statusCode: 200,
			_startAt: undefined,
			_onHeaders: (cb: Function) => void 0,
			_onFinished: (cb: Function	) => void 0
		} as TestRes
		const next = vi.fn()

		// Simulate onHeaders behavior
		let onHeadersCallback: Function = () => {}
		res._onHeaders = (cb: Function) => { onHeadersCallback = cb }
		// Simulate onFinished behavior
		let onFinishedCallback: Function = () => {}
		res._onFinished = (cb: Function) => { onFinishedCallback = cb }

		// Run middleware
		middleware(req, res, next)
		expect(next).toHaveBeenCalled()

		// Trigger response start
		onHeadersCallback()
		expect(res._startAt).toBeDefined()

		// Trigger response finished
		onFinishedCallback()
		expect(logSpy).toHaveBeenCalled()
		const logObj = JSON.parse(logSpy.mock.calls[0][0])
		expect(logObj.level).toBe('verbose')
		expect(logObj.message).toBe('received request')
		expect(logObj.status).toBe(200)
		expect(logObj.method).toBe('GET')
		expect(logObj.url).toBe('/test')
	})

	it('should not log when level is silent', () => {
		const logger = new Logger(logSpy as LogFunction, 4)
		logger.setLevel('silent')
		logger.error('Should not log')
		expect(logSpy).not.toHaveBeenCalled()
	})
})