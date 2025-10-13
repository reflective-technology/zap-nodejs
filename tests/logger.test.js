import { describe, it, expect, vi, beforeEach } from 'vitest'
import Logger from '../logger.js'

describe('Logger', () => {
	let logSpy

	beforeEach(() => {
		logSpy = vi.fn()
	})

	it('should log messages at allowed level', () => {
		const logger = new Logger(logSpy, 4)
		logger.info('Test info', { foo: 'bar' })
		expect(logSpy).toHaveBeenCalled()
		const logObj = JSON.parse(logSpy.mock.calls[0][0])
		expect(logObj.level).toBe('info')
		expect(logObj.message).toBe('Test info')
		expect(logObj.foo).toBe('bar')
	})

	it('should not log messages below current level', () => {
		const logger = new Logger(logSpy, 4)
		logger.setLevel('error')
		logger.info('Should not log')
		expect(logSpy).not.toHaveBeenCalled()
		logger.error('Should log')
		expect(logSpy).toHaveBeenCalled()
	})

	it('should include caller info', () => {
		const logger = new Logger(logSpy, 4)
		logger.info('Caller test')
		const logObj = JSON.parse(logSpy.mock.calls[0][0])
		expect(logObj.caller).toMatch(/logger\.test\.js:\d+/)
	})

	it('should log HTTP request when response finishes', () => {
		const logger = new Logger(logSpy, 4)
		logger.setLevel('verbose')
		const middleware = logger.http()

		// mock req, res, next
		const req = { method: 'GET', url: '/test', _startAt: undefined }
		const res = { statusCode: 200, _startAt: undefined }
		const next = vi.fn()

		// Simulate onHeaders behavior
		let onHeadersCallback
		res._onHeaders = (cb) => { onHeadersCallback = cb }
		// Simulate onFinished behavior
		let onFinishedCallback
		res._onFinished = (cb) => { onFinishedCallback = cb }

		// Mock on-headers and on-finished
		vi.mock('on-headers', () => ({
			default: (res, cb) => res._onHeaders(cb)
		}))
		vi.mock('on-finished', () => ({
			default: (res, cb) => res._onFinished(cb)
		}))

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
})