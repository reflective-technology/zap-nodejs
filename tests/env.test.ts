import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('env.js', () => {
	beforeEach(() => {
		delete process.env.LOG_LEVEL
		vi.resetModules()
	})

	it('should return default value "info" when LOG_LEVEL is not set', async () => {
		const { get } = await import('../src/env')
		expect(get('LOG_LEVEL')).toBe('info')
	})

	it('should return the set value when LOG_LEVEL is set to a allowed value', async () => {
		process.env.LOG_LEVEL = 'debug'
		const { get } = await import('../src/env')
		expect(get('LOG_LEVEL')).toBe('debug')
	})

	it('should return default value "info" when LOG_LEVEL is set to a disallowed value', async () => {
		process.env.LOG_LEVEL = 'invalid'
		const { get } = await import('../src/env')
		expect(get('LOG_LEVEL')).toBe('info')
	})

	it('should return error when getting a non-existent variable without a default', async () => {
		const { get } = await import('../src/env')
		const invalidVars = 'NON_EXISTENT_VAR'
		const msg = `Env key "${invalidVars}" is not defined`
		expect(() => get(invalidVars)).toThrowError(msg)
	})
})