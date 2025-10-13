const Env = {
	"LOG_LEVEL": {
		"default": 'info',
		"value": process.env.LOG_LEVEL,
		"allow": ['silent', 'error', 'warn', 'info', 'verbose', 'debug']
	},
}

export const get = (key) => {
	const target = Env[key];

	if (!target.allow.includes(target.value)) {
		return target.default;
	}
	return target.value;
}
