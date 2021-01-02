module.exports = {
  branch: 'master',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
      },
    ],
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'dist/packages/core',
        tarballDir: 'dist',
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'dist/packages/angular',
        tarballDir: 'dist',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['dist/*.tgz', 'dist/*.zip'],
      },
    ],
  ],
  prepare: [
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'dist/packages/angular',
        tarballDir: 'dist',
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'dist/packages/core',
        tarballDir: 'dist',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md', 'README.md'],
        message:
          "build(release): release <%= nextRelease.version %> - <%= new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) %> [skip ci]\n\n<%= nextRelease.notes %>",
      },
    ],
  ],
};
