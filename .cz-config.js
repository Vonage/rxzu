module.exports = {
	types: [
		{ value: 'feat', name: '✨  - FEATURE: a new feature' },
		{ value: 'fix', name: '🐞  - FIX: a bug fix' },
		{ value: 'chore', name: '🔧  - CHORE: changes to the build process or auxiliary tools and libraries such as documentation generation' },
		{ value: 'docs', name: '📝  - DOCS: documentation only changes' },
		{
			value: 'style',
			name: '🎨  - STYLE: changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) '
		},
		{ value: 'refactor', name: '👷‍  - REFACTOR: a code change that neither fixes a bug nor adds a feature' },
		{ value: 'perf', name: '⚡️  - PERFORMANCE: code change that improves performance' },
		{ value: 'ci', name: '💨  - CONTINUOUS INTEGRATION: changes that affect either the build or deployment process' },
		{ value: 'test', name: '✅  - TEST: adding missing tests or correcting existing test' }
	],

	messages: {
		body: '📚  - Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
		breaking: '💥  - List any BREAKING CHANGES (optional):\n',
		confirmCommit: '☑️  - Are you sure you want to proceed with the commit above?',
		customScope: '⤴️  - Denote the SCOPE of this change, e.g. file name or module:',
		footer: '📌  - List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
		subject: '✏️  - Write a SHORT, IMPERATIVE tense description of the change:\n',
		name: "ℹ️  - Select the type of change that you're committing:"
	},

	allowBreakingChanges: ['feat', 'fix'],
	allowCustomScopes: true,
	subjectLimit: 82
};
