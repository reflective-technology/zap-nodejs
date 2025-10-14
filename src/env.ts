type EnvDefine = {
	"default": string,
  "value": string,
  "allow": string[]
}

const Env: Record<string, EnvDefine> = {
	"LOG_LEVEL": {
		"default": 'info',
		"value": process.env.LOG_LEVEL? process.env.LOG_LEVEL.toLowerCase() : 'info',
		"allow": ['silent', 'error', 'warn', 'info', 'verbose', 'debug']
	},
}

export const get = (key: string) => {
	const target = Env[key];

	if (!target) {
		throw new Error(`Env key "${key}" is not defined`);
	}

	if (!target.allow.includes(target.value)) {
		return target.default;
	}

	return target.value;
}