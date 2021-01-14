# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/Sekai-World/sekai-viewer/compare/v0.2.2...v0.3.0) (2021-01-14)


### Features

* **announcement:** get by preferred languages ([83ce93d](https://github.com/Sekai-World/sekai-viewer/commits/83ce93ddf0931260784001b8d145f3854607fc37))
* **card:** add rarity filter for list ([5663d0d](https://github.com/Sekai-World/sekai-viewer/commits/5663d0dd73ab26f19cad57a5d3eb46a335dcddc3))
* **sw:** cache more resource ([bb8fffe](https://github.com/Sekai-World/sekai-viewer/commits/bb8fffe195feb3779f130e655a0ebf9ec9dcd625))
* **translate:** add language filters ([db7f1e6](https://github.com/Sekai-World/sekai-viewer/commits/db7f1e65ff9e4860e4781fa114ef4651c223a175))
* add honor title list page ([e68f498](https://github.com/Sekai-World/sekai-viewer/commits/e68f498912afbccfda62b9d39ace5c12e8a280ae))
* add main page skeleton to reduce white screen time ([c274215](https://github.com/Sekai-World/sekai-viewer/commits/c2742153ddf41447b17d4d4142d12eb91a570700))


### Bug Fixes

* **card:** comfy view text outside of box ([88ee74e](https://github.com/Sekai-World/sekai-viewer/commits/88ee74e27e542f97d512b2c4346306ee7cde041c))
* **mission:** character mission use translation strings ([35c4173](https://github.com/Sekai-World/sekai-viewer/commits/35c41733804a15e5655a4ebfe0e174dbb968bc89))
* **user:** restore bind sekai function ([d55ea15](https://github.com/Sekai-World/sekai-viewer/commits/d55ea15918e61cb6f8c768546ff877a8c16cfd65))


### Refactors

* **announcement:** remove author field ([8770428](https://github.com/Sekai-World/sekai-viewer/commits/8770428be2fcab71fcba4b1c0e27d6bbbd6d6702))
* import `useSWR`, remove refState for lists ([159d546](https://github.com/Sekai-World/sekai-viewer/commits/159d546e812c7ac728c12029c6dec5a4dcb11c3f))
* **home:** layout of links ([16fd1aa](https://github.com/Sekai-World/sekai-viewer/commits/16fd1aa250884f3f22a1b2b8706374a2958276a5))
* **music:** tag filter use chip instead of select ([7ba3f4c](https://github.com/Sekai-World/sekai-viewer/commits/7ba3f4c89d628bd04a01cf4c73427371c680ecdd))

### [0.2.2](https://github.com/Sekai-World/sekai-viewer/compare/v0.2.1...v0.2.2) (2021-01-10)


### Bug Fixes

* **mission:** beginner and normal mission reward icon strectched ([38e5b32](https://github.com/Sekai-World/sekai-viewer/commits/38e5b32eeffefc53e8d2a95f5a0240c50c9e56fb))
* **mission:** honor popup title translation ([5ff2250](https://github.com/Sekai-World/sekai-viewer/commits/5ff2250edb19f3aa4bdfb6ed63f2d790b507ebc4))
* **mission:** show honor group ([679ba58](https://github.com/Sekai-World/sekai-viewer/commits/679ba58b3adca97d943a2c43a6d3dfd77cd61c75))
* **storyreader:** story title translation ([e5b8fa7](https://github.com/Sekai-World/sekai-viewer/commits/e5b8fa7f0efc16d4f956540bce6943eeab28b351))
* **user:** profile page circular progress on submitting ([6ee764a](https://github.com/Sekai-World/sekai-viewer/commits/6ee764a6b2b90018d7243ffda51645bd8906d2f2))
*  avatar in usermeta could be null ([76f2870](https://github.com/Sekai-World/sekai-viewer/commits/76f2870448d1862ae45de1163fab2ae880a23ca9))


### Refactors

* **api:** sort languages by id asc ([c2bc965](https://github.com/Sekai-World/sekai-viewer/commits/c2bc965820fa0a9ef33e5e59237ccde7e034633d))
* **music:** music vocal type translation ([61578a8](https://github.com/Sekai-World/sekai-viewer/commits/61578a8708eb960bbff86cff3084dc54212ec53b))
* **virtual-live:** use accordion to replace collapse ([f1fa206](https://github.com/Sekai-World/sekai-viewer/commits/f1fa2062213411b30e5ce136c0fa34ae6737fc83))

### [0.2.1](https://github.com/Sekai-World/sekai-viewer/compare/v0.2.0...v0.2.1) (2021-01-10)


### Features

* **user:** allow user to edit preferred languages ([36ece0b](https://github.com/Sekai-World/sekai-viewer/commits/36ece0b9dd7b5465fb213996077ddcb06fbb57f5))


### Bug Fixes

* **announcement:** fetch only display language if not logged in ([36ad7a4](https://github.com/Sekai-World/sekai-viewer/commits/36ad7a49027e4b2bc96a7d3355f75d97215ef1c2))
* **gacha:** gacha simulator shows weird pull results ([4809029](https://github.com/Sekai-World/sekai-viewer/commits/4809029171071d8cb05493e6ed5689f39031b8db)), closes [#309](https://github.com/Sekai-World/sekai-viewer/issues/309)
* **widget:** set overflow to auto ([38cd6fe](https://github.com/Sekai-World/sekai-viewer/commits/38cd6fe19df41bb8cb991f0a833b09bc042d6d75))


### Refactors

* **user:** sekai profile to separate section ([16010c3](https://github.com/Sekai-World/sekai-viewer/commits/16010c32f713b8f2d2f39c97c38d092694362d5c))
