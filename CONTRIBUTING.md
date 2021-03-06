# Contributing to Sekai Viewer
We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github
We use github to host code, to track issues and feature requests, as well as accept pull requests. Pull requests should be only against `dev` branch, a pull request targeting `main` branch will be closed.

## We Welcome All Kinds of Code Changes Through Pull Requests
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo.
2. Switch to branch `dev`, or create a branch based on `dev`.
3. ~~If you've added code that should be tested, add tests. (Not yet)~~
4. ~~Ensure the test suite passes. (Not yet)~~
5. Make sure your code lints.
6. Format you code with `prettier`.
7. Commit message with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) style
8. Issue that pull request against `dev` branch!

## Any contributions you make will be under the GNU GENERAL PUBLIC LICENSE
In short, when you submit code changes, your submissions are understood to be under the same [GNU GENERAL PUBLIC LICENSE](https://choosealicense.com/licenses/gpl-3.0/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/Sekai-World/sekai-viewer/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/Sekai-World/sekai-viewer/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code
**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

People *love* thorough bug reports. I'm not even kidding.

## Use a Consistent Coding Style
It's very simple:

- use camelCase
- format with `prettier`
- use meaningful variable name
- comment on the "strange"-looking but intentional codes

## Handling `i18next` Namespace Right
`i18next` allow developer to set namespace for different strings in different domain, therefore use a right namespace for the key is important.

Normally you can use namespace `common` if your string will show up everywhere in the project. Otherwise use a proper namespace for where the string should stay, for example the strings in CardDetail page is supposed to stay in namespace `card` with exception of `power` which will be displayed only in context of cards.

If you added or created a namespace, please add it `initGlobalI18n` in `src/utils/i18n.ts`.

## License
By contributing, you agree that your contributions will be licensed under its GNU GENERAL PUBLIC LICENSE.

## References
This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md)
