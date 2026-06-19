# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.18.9](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.8...v1.18.9) (2026-06-19)


### Bug Fixes

* **live2d:** normalize resource paths and metadata loading ([2954c65](https://github.com/Sekai-World/sekai-viewer/commits/2954c65a8321fe02387facf159068d8ba3486e97))
* **live2d:** stabilize model selector value ([9a461db](https://github.com/Sekai-World/sekai-viewer/commits/9a461db4d212231023381ee84033e776a4ca4a6d))

### [1.18.8](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.7...v1.18.8) (2026-06-14)


### Bug Fixes

* **music:** add missing ID to EN_EXCLUSIVE_IDS ([76fc4ae](https://github.com/Sekai-World/sekai-viewer/commits/76fc4ae543cb8ca74d4e537a6600994e07935467))

### [1.18.7](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.6...v1.18.7) (2026-06-09)

### [1.18.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.5...v1.18.6) (2026-06-05)


### Features

* **music:** FLAC download metadata tags ([#681](https://github.com/Sekai-World/sekai-viewer/issues/681)) ([0f4349a](https://github.com/Sekai-World/sekai-viewer/commits/0f4349aedafb5e85f589df8e301e4459c87c04f3))
* **music:** trim leading silence on full flac downloads ([5b32115](https://github.com/Sekai-World/sekai-viewer/commits/5b3211541656990ae4df975d87f1b93b78a9f5f8))


### Bug Fixes

* **music:** write mp3 id3 metadata ([18e362d](https://github.com/Sekai-World/sekai-viewer/commits/18e362df3759515ae1010ab9360b1a4553bc3790))


### Refactors

* **AudioPlayer:** remove unused imports and simplify download button ([094af8e](https://github.com/Sekai-World/sekai-viewer/commits/094af8e7a2786aab029c354c6d5bc9232a36bb98))

### [1.18.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.4...v1.18.5) (2026-06-01)


### Bug Fixes

* **tsc:** resolve type check errors ([9d94c72](https://github.com/Sekai-World/sekai-viewer/commits/9d94c72afcd4cf54707493619b0ca5d96d17a271))


### Refactors

* **live2d:** split viewer controls and download packing ([72122b8](https://github.com/Sekai-World/sekai-viewer/commits/72122b8c5ae502985e76cd7a60cb06fb48b2ec58))

### [1.18.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.3...v1.18.4) (2026-05-22)


### Bug Fixes

* **music-detail:** 更新 EN_EXCLUSIVE_IDS 和 KR_EXCLUSIVE_IDS，添加缺失的 ID ([de02701](https://github.com/Sekai-World/sekai-viewer/commits/de02701ea3d6d7aca5bb225dd9307ff351bfc48d))

### [1.18.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.2...v1.18.3) (2026-05-21)


### Bug Fixes

* **music-detail:** add missing exclusive ID to EN_EXCLUSIVE_IDS ([1dfa8cf](https://github.com/Sekai-World/sekai-viewer/commits/1dfa8cfd0eb0449ee243bc59b00f22959e9c2763))

### [1.18.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.1...v1.18.2) (2026-05-14)


### Features

* enable opening cards in new tabs ([1c94251](https://github.com/Sekai-World/sekai-viewer/commits/1c94251dc55d880cc76e6136406cce4c03c4e684))
* **stamp:** add search functionality to stamp list ([3a1ad60](https://github.com/Sekai-World/sekai-viewer/commits/3a1ad60783f5524cea80c356ac4b6d42231b4987))


### Bug Fixes

* align ingress and pull secret for argocd prod ([7a3b193](https://github.com/Sekai-World/sekai-viewer/commits/7a3b19345d8890b480a7577dddd1f48a837d3998))
* **asset-viewer:** reset continuation token on path change ([41a0aa0](https://github.com/Sekai-World/sekai-viewer/commits/41a0aa0c78fd459a7841b1036b3c4b3a952db72f))
* handle edge cases for non-score skills and empty arrays ([48b6794](https://github.com/Sekai-World/sekai-viewer/commits/48b6794b5c2edd3f4da0951e461859a1d04d7044))
* improve character selection logic in AreaTalk component ([b3ae512](https://github.com/Sekai-World/sekai-viewer/commits/b3ae512d9ba5eedd44805abd7f4186fb8d56959c))
* **score:** harden skill rate lookup ([be168e6](https://github.com/Sekai-World/sekai-viewer/commits/be168e6c38481a59aa695092cd46422f7dd8e94e))
* **spoiler:** update overlay styles when setting changes ([bf2c8a8](https://github.com/Sekai-World/sekai-viewer/commits/bf2c8a86ba487533d11ae97824bf982738d236ba))
* **stamp:** add accessible label for search input ([3e1304d](https://github.com/Sekai-World/sekai-viewer/commits/3e1304d1784dda1707945a8473334c49d2e6bd47))
* **stamp:** avoid mutating cached stamps while sorting ([3371142](https://github.com/Sekai-World/sekai-viewer/commits/3371142cd4efdd0bd47b74f6502b6ab6e67d2f76))
* **stamp:** handle empty search results ([1d41945](https://github.com/Sekai-World/sekai-viewer/commits/1d41945317be6454af035047e68637753255bdc9))
* update TypeScript SDK path in VSCode settings ([411a7f9](https://github.com/Sekai-World/sekai-viewer/commits/411a7f9cae8419601ebf540d2c09b19b8662f3ce))

### [1.18.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.18.0...v1.18.1) (2026-04-16)


### Bug Fixes

* **musicDetail:** update CN_EXCLUSIVE_IDS and EN_EXCLUSIVE_IDS for completeness ([9bfb3b9](https://github.com/Sekai-World/sekai-viewer/commits/9bfb3b9353716b010273e55266c3ccd341f0b1dc))

## [1.18.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.12...v1.18.0) (2026-03-15)


### Features

* **virtualLive:** add `mc_timeline` type support ([7b922cc](https://github.com/Sekai-World/sekai-viewer/commits/7b922cc7b9c54e879cabc550b16a49ae02dfd599))


### Bug Fixes

* **musicDetail:** correct region handling for music chart links ([757a9f7](https://github.com/Sekai-World/sekai-viewer/commits/757a9f7658b6376b1916f3ccb4dff49947a8f35f))
* **mysekai storyreader:** white background in darkmode ([2ed6249](https://github.com/Sekai-World/sekai-viewer/commits/2ed62497b9cda5a1035dbd213c1c0192dfd86029))


### Refactors

* **virtualLive:** extract common logic of mc timeline ([0792abe](https://github.com/Sekai-World/sekai-viewer/commits/0792abe85950cec3ceb8bb413aac706a62795755))

### [1.17.12](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.11...v1.17.12) (2026-03-01)


### Features

* **event:** add EventBoostCardsDialog component for managing boost card attributes and rarity ([aa9cec9](https://github.com/Sekai-World/sekai-viewer/commits/aa9cec9c14f67f2678bfa65cdd0c93381a13de85))


### Bug Fixes

* **event:** calculate minimum bonus correctly by adding master rank bonus ([8e72744](https://github.com/Sekai-World/sekai-viewer/commits/8e72744b5cd6cb39534d6702e0973279d617fcaa))
* **event:** update rarity_birthday bonus and add extra bonus for events after 135 ([e00e5d9](https://github.com/Sekai-World/sekai-viewer/commits/e00e5d912c8ad727d6e293ae681b511b74969af8))

### [1.17.11](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.10...v1.17.11) (2026-02-25)


### Bug Fixes

* **live2d:** fix [#654](https://github.com/Sekai-World/sekai-viewer/issues/654) ([0f12d57](https://github.com/Sekai-World/sekai-viewer/commits/0f12d579f6ebb7a8fa742c98b3baae34b9ee852d))
* **music:** update TW_EXCLUSIVE_IDS to include 11012 ([524ef2f](https://github.com/Sekai-World/sekai-viewer/commits/524ef2ff0a5a8d93e4a725ac8575d66494340d88))

### [1.17.10](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.9...v1.17.10) (2025-12-08)


### Bug Fixes

* **music:** add exclusive ID 701 to EN_EXCLUSIVE_IDS ([dda7d2d](https://github.com/Sekai-World/sekai-viewer/commits/dda7d2d252dd8c6a6248f6ef26a2f278cd9711ff))

### [1.17.9](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.8...v1.17.9) (2025-12-05)


### Bug Fixes

* **music:** update exclusive IDs to include 694 for KR, EN, and TW ([e20c177](https://github.com/Sekai-World/sekai-viewer/commits/e20c177d4d15758889046276518490a54c5499c4))

### [1.17.8](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.7...v1.17.8) (2025-11-12)


### Features

* add filter for Virtual Singer Original cards (supportUnit === "none") ([48237bd](https://github.com/Sekai-World/sekai-viewer/commits/48237bdba5f5ccd26304f8e371fa38dd410ab931))
* **live2d:** add show ui button ([f65a7c9](https://github.com/Sekai-World/sekai-viewer/commits/f65a7c9772c1f84f770c2f9ada8a2a42fed6e7a7))


### Bug Fixes

* improve intersection check for loading more cards ([080d21a](https://github.com/Sekai-World/sekai-viewer/commits/080d21a2d6b9cda000bedd45e1bed7ad4115f70d))
* **live2d:** do not continue after voice stops ([577a333](https://github.com/Sekai-World/sekai-viewer/commits/577a333c6c21b592dd3cc95b0ccc09215ad07efe))
* **live2d:** fix [#622](https://github.com/Sekai-World/sekai-viewer/issues/622) add older version of live2d core lib ([65b2c10](https://github.com/Sekai-World/sekai-viewer/commits/65b2c100e14a35153f56a36e1777cf86b9bb7499))
* **live2d:** fix [#626](https://github.com/Sekai-World/sekai-viewer/issues/626) ([7a89d7b](https://github.com/Sekai-World/sekai-viewer/commits/7a89d7bd28015dca0412c52fdff57299ca6fc218))


### Refactors

* address code review feedback ([1733784](https://github.com/Sekai-World/sekai-viewer/commits/173378478e840a30c6667cb3d6633e27593fd1f5))

### [1.17.7](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.6...v1.17.7) (2025-10-28)


### Features

* **honor:** add support for birthday honor frame for middle rarity ([b55c902](https://github.com/Sekai-World/sekai-viewer/commits/b55c9024c1c023865d5cdf3869b60f1d246f4eb7))

### [1.17.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.5...v1.17.6) (2025-10-27)


### Features

* **event:** refine event card bonus calculation logic ([1a68f2f](https://github.com/Sekai-World/sekai-viewer/commits/1a68f2f23840f15534adc66ef1ab5e0550d5d576))


### Bug Fixes

* **degree-image:** enhance birthday honor type handling by incorporating honor rarity ([995b6c1](https://github.com/Sekai-World/sekai-viewer/commits/995b6c1485d300155a5eb0155740fffd7fb736bf))
* **degree-image:** update degree level icon handling for birthday honor type ([88b3661](https://github.com/Sekai-World/sekai-viewer/commits/88b366132cf417271b3cb5e1e38b9c1e5fa1088a))
* **gacha:** simulator guarantee mechanism ([d3765ca](https://github.com/Sekai-World/sekai-viewer/commits/d3765caa7893ce88f06df9983ca08628ff253939))
* **live2d:** adjust model directory handling for collabo egg path ([41ca877](https://github.com/Sekai-World/sekai-viewer/commits/41ca87766119bc024f0d77bfed671cb0d4756b72))
* **live2d:** enhanced model name processing ([d66cb02](https://github.com/Sekai-World/sekai-viewer/commits/d66cb02d1d078a97736a9c6e49273ce958dcac90))
* **music-detail:** correct EN_EXCLUSIVE_IDS by updating entry 657 ([e411d27](https://github.com/Sekai-World/sekai-viewer/commits/e411d27f3755fdb74aa3ee5f7a6881f29620952f))

### [1.17.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.4...v1.17.5) (2025-10-20)


### Bug Fixes

* **event-detail:** adjust bonus calculation for piapro units based on event ID ([1545bce](https://github.com/Sekai-World/sekai-viewer/commits/1545bce84b6062bd5b7243b7db23c4abf8fdca54))
* **story-reader:** do not increase event id since 177 ([1199d8d](https://github.com/Sekai-World/sekai-viewer/commits/1199d8d889a66958dddc0162a865cfcaaa08e25c)), closes [#634](https://github.com/Sekai-World/sekai-viewer/issues/634)

### [1.17.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.3...v1.17.4) (2025-10-07)


### Bug Fixes

* **music:** update CN_EXCLUSIVE_IDS to include missing ID 76 ([f0933b4](https://github.com/Sekai-World/sekai-viewer/commits/f0933b46bc6b6d70ca0e05941f578478d5732a9e))

### [1.17.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.2...v1.17.3) (2025-10-07)

### [1.17.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.1...v1.17.2) (2025-10-05)


### Features

* **card:** add card supply filtering and related state management ([46c65b2](https://github.com/Sekai-World/sekai-viewer/commits/46c65b259226eb9bbc93e8fe81aeed572e44709f))
* **card:** add card supply type display in CardDetail component ([ee2a839](https://github.com/Sekai-World/sekai-viewer/commits/ee2a839aeb63d48e7116b993d3591687b03e52fa))
* **card:** add filter for cards with 3DMV cut-ins ([f39e160](https://github.com/Sekai-World/sekai-viewer/commits/f39e1602ce2279f552c1491bc2cf31a875c77e1c))
* **card:** implement card image component with hover effects and lazy loading ([e531d39](https://github.com/Sekai-World/sekai-viewer/commits/e531d394ea22c58a42c5911c4d038d810a76b43e))
* **intersection-observer:** add custom hook for lazy loading components ([d0d679a](https://github.com/Sekai-World/sekai-viewer/commits/d0d679ab97e4c991f5fd2fc2f3b6c2cdfdda1f41))


### Bug Fixes

* **filters:** correct translation keys for clear and fixture filter options ([4e58f71](https://github.com/Sekai-World/sekai-viewer/commits/4e58f710ac74028171cd7680891b08668d51354d))

### [1.17.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.17.0...v1.17.1) (2025-09-30)


### Bug Fixes

* **banner:** 5th anniversary ([070f540](https://github.com/Sekai-World/sekai-viewer/commits/070f540d88c47105d7f956aba726f512b97110c2))
* **music:** update EN_EXCLUSIVE_IDS to include missing ID 673 ([edfb717](https://github.com/Sekai-World/sekai-viewer/commits/edfb717d90c15b98f6398d2551f68c7bd04d8072))

## [1.17.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.16.4...v1.17.0) (2025-09-20)


### Features

* **chibi:** add Chibi viewer ([432ee60](https://github.com/Sekai-World/sekai-viewer/commits/432ee6034e94457eab04152046d3f8a882e8e6cf))
* **chibi:** add recording by ffmpeg.wasm ([0167214](https://github.com/Sekai-World/sekai-viewer/commits/016721465dd46db6973fc8a859e2495a44ae2b9c))
* **chibi:** support older spine model && add switch to disable chibi model shadow ([633dbff](https://github.com/Sekai-World/sekai-viewer/commits/633dbffd862c4898285824f2878719a24805d63f))
* **chibi:** trim transparent pixels for screenshot and recording ([571ca49](https://github.com/Sekai-World/sekai-viewer/commits/571ca49b2c5ef0300c8343bd0b1f2f4d8bd7c57f))
* **live2d:** enhance loading progress handling and add warning support ([c900a2c](https://github.com/Sekai-World/sekai-viewer/commits/c900a2c86be32d9dade3c66bf3a400c899086584))
* **live2d:** improve talk audio and lip sync handling ([aacca32](https://github.com/Sekai-World/sekai-viewer/commits/aacca32f67b22acbcf1f326e3f7fb0c4509d1b67))
* **live2d:** speed up model appear action ([7d6d2b4](https://github.com/Sekai-World/sekai-viewer/commits/7d6d2b488fa6dc910160318c6969f6c879fc1bb2))


### Bug Fixes

* **event:** world link finale chapter ([d8b5a0a](https://github.com/Sekai-World/sekai-viewer/commits/d8b5a0a9bff26ba2cd95e3b3f4d23bb184aba55a))
* **live2d:** wonder miku missing eyes ([30b2ff8](https://github.com/Sekai-World/sekai-viewer/commits/30b2ff8c42687a4713e5496446c2186544d5807f))


### Refactors

* **live2d:** update Live2D asset handling & fix typo ([cdd7fd8](https://github.com/Sekai-World/sekai-viewer/commits/cdd7fd8d38bf104984c0f48294b3c079911b807a))

### [1.16.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.16.3...v1.16.4) (2025-08-09)


### Bug Fixes

* correctly display master lesson cost and reward ([2e18f69](https://github.com/Sekai-World/sekai-viewer/commits/2e18f697b7025acca5595fc899911a8a4aecd2f1))
* update Transifex link to the dashboard ([74fe1d0](https://github.com/Sekai-World/sekai-viewer/commits/74fe1d03f78206b6838941da9b525ff460edb4cb))


### Refactors

* update exclusive IDs for music details ([5fe813f](https://github.com/Sekai-World/sekai-viewer/commits/5fe813fffe2de79d74178339c36d23309ed81702))

### [1.16.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.16.2...v1.16.3) (2025-07-23)


### Features

* **l2d:** implement SpecialEffectType.44 ([b9a09e5](https://github.com/Sekai-World/sekai-viewer/commits/b9a09e536b630f9e0cb9f0d8baac0662deeccc14))
* **l2d:** implement SpecialEffectType.PlaceInfo ([c829abd](https://github.com/Sekai-World/sekai-viewer/commits/c829abd5bfabf830d002195c606780aaf05ce71e))
* mysekai talk and fixture ([26e08f7](https://github.com/Sekai-World/sekai-viewer/commits/26e08f7ff82dcd80f3ccfee32505a47dfe2a9278))


### Bug Fixes

* hide dialogue when change background, sekai in and out, telop ([f867a20](https://github.com/Sekai-World/sekai-viewer/commits/f867a203a257c9b697a7c7949a5c6649f6f01e98))
* incorrect movie url ([0a15f86](https://github.com/Sekai-World/sekai-viewer/commits/0a15f8693dd4db285cfdebc45df2962b730f993f))
* **l2d:** add check for costume before adding animation ([6392031](https://github.com/Sekai-World/sekai-viewer/commits/63920311a1edad82bb949043b3769a6ae036470e))
* **l2d:** correctly display background during fullscreentext ([1b8b55e](https://github.com/Sekai-World/sekai-viewer/commits/1b8b55e552b1e227837bd725cba1ef82b71fb262))
* **l2d:** potential null animation and error handling for xml parse ([1047d61](https://github.com/Sekai-World/sekai-viewer/commits/1047d61f7d7200fa69cc4b664a9fa9b8847a44d5))
* **mysekai:** static dependency ([38dc05a](https://github.com/Sekai-World/sekai-viewer/commits/38dc05a278b4adf26b66df9fa0cba596ee83cf98))
* **mysekai:** update fixture labels and remove unused wishlist link ([2f3e282](https://github.com/Sekai-World/sekai-viewer/commits/2f3e2824dbe9d4d0f0897e402b60755980ccd153))
* wrong link for thumbnail of surface interface ([2a73278](https://github.com/Sekai-World/sekai-viewer/commits/2a73278a0e8ce51f724fefd87a5711c6efaedcab))


### Refactors

* remove unused translation link and signup route ([e95bb69](https://github.com/Sekai-World/sekai-viewer/commits/e95bb6965d9ac9e24af30c739efc46f1a7647886))

### [1.16.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.16.1...v1.16.2) (2025-07-13)


### Features

* add pnpm workspace configuration for built dependencies ([05c725f](https://github.com/Sekai-World/sekai-viewer/commits/05c725f9e352019fdf2244574bad2fce275cde3d))
* **l2d:** implement SpecialEffectType.Movie ([189acc6](https://github.com/Sekai-World/sekai-viewer/commits/189acc627300a986ea46a6a3fe3110d7ae771059))
* **live2d:** llm translation for story reader ([faa2ea2](https://github.com/Sekai-World/sekai-viewer/commits/faa2ea2d174adc6538b687665e59a74511e3612e))


### Bug Fixes

* better edge case handling ([24ca181](https://github.com/Sekai-World/sekai-viewer/commits/24ca181c699d059cc152eddac65c3dda555b0591))
* **l2d:** dialogue layer will not zoom in ([13ab11b](https://github.com/Sekai-World/sekai-viewer/commits/13ab11b670d759f6bc1c2bd48fd1e200c0a80695))
* **l2d:** incorrect position move and sequence ([3c7493d](https://github.com/Sekai-World/sekai-viewer/commits/3c7493d9cbd7bf758cb6717271a10b005299b5b3))
* **l2d:** incorrect URL for motion file ([238183c](https://github.com/Sekai-World/sekai-viewer/commits/238183c1394562a6536ccff14c3244be7f525ac6))
* **l2d:** telop don't disappear ([37d61bc](https://github.com/Sekai-World/sekai-viewer/commits/37d61bcf332a53fef39207a61854ec491623e7e5))
* wrong URL for voice ([9291986](https://github.com/Sekai-World/sekai-viewer/commits/9291986417b6e12c8b5b17f8dc2082da7434d0f4))


### Refactors

* add checking for translation setting ([f577cbd](https://github.com/Sekai-World/sekai-viewer/commits/f577cbd7f11b64fd3ff7bf1829b39e312cb4cab5))
* add safety guidelines to system prompt ([f939599](https://github.com/Sekai-World/sekai-viewer/commits/f939599de01cb71978b628a6f08e43d2a5af138c))
* disable thinking for Gemini 2.5 Flash family models ([fc3c243](https://github.com/Sekai-World/sekai-viewer/commits/fc3c243a20d482280e630903051ea935a06f72ed))
* use axios for network fetching ([0e836bb](https://github.com/Sekai-World/sekai-viewer/commits/0e836bbf523a1b91df2556e2820efd9aa4c41558))

### [1.16.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.16.0...v1.16.1) (2025-07-07)


### Features

* **event:** add event music filtering to event list ([d65c20e](https://github.com/Sekai-World/sekai-viewer/commits/d65c20e6ffd7382de54294c1ce98c7efba3bf28a))
* **event:** add event unit filters with different types ([2aa10ad](https://github.com/Sekai-World/sekai-viewer/commits/2aa10ad9654271ff5fddcabcc66f834645616073))
* **event:** add filter for event deck bonuses ([0a8fe14](https://github.com/Sekai-World/sekai-viewer/commits/0a8fe14b19d6ce866b324044ba4e758840356ccc))
* **event:** add filtering options for event type and start time ([fe5a2dd](https://github.com/Sekai-World/sekai-viewer/commits/fe5a2dd250fcafe8245ecd57c74f5f19a243d0fb))
* **event:** add key event story filter ([b77d2f3](https://github.com/Sekai-World/sekai-viewer/commits/b77d2f3d367a787f3cfaca9ccdfeb6413f96c62b))
* **event:** add radio buttons for event music filtering options ([0c1b9eb](https://github.com/Sekai-World/sekai-viewer/commits/0c1b9eb2576d7617b900158def620e930bbed76e))
* **event:** initialize filter state with provided filter data ([fa07c6f](https://github.com/Sekai-World/sekai-viewer/commits/fa07c6f4e204ea7f9c78033a8f27f9f30edb6983))
* **event:** update event deck bonus attributes to be optional ([5f34163](https://github.com/Sekai-World/sekai-viewer/commits/5f341630320b4cd2a0465a4f10046fbe237871b0))
* **event:** wip implement filtering ([5f80e1e](https://github.com/Sekai-World/sekai-viewer/commits/5f80e1e356435ab156863ab9752e51c544f0bba3))


### Bug Fixes

* asset ScenarioId ([b5352a6](https://github.com/Sekai-World/sekai-viewer/commits/b5352a6758072283089be0abd48ff6cfe05d2218))
* asset ScenarioId ([483917f](https://github.com/Sekai-World/sekai-viewer/commits/483917f4c56c22d74afcdc58f3fcc6e3fd5f51ac))
* create a fixVoiceScenarioId method ([503d090](https://github.com/Sekai-World/sekai-viewer/commits/503d09039423ded89a6c20ab664e01f1408f1607))
* **deps:** update msw to version 2.10.3 ([cb28145](https://github.com/Sekai-World/sekai-viewer/commits/cb28145100d86c189e3e35d7d49a0ae0598508a1))
* **event:** correctly initialize eventBonusCharaSupportUnit ([91931c0](https://github.com/Sekai-World/sekai-viewer/commits/91931c0d77ce03e045ddefdd94ce481806ed39a0))
* **event:** optimize filter check to exclude 'both' value ([2aaba2c](https://github.com/Sekai-World/sekai-viewer/commits/2aaba2ca0a2afe00f918041c6351116786ea2021))
* **l2d:** missing argument in PlayScenarioEffect.ts ([b62d172](https://github.com/Sekai-World/sekai-viewer/commits/b62d17283617abbf7a150b347f628e207785aa35))


### Refactors

* **event:** update label for event music filter ([59221de](https://github.com/Sekai-World/sekai-viewer/commits/59221deb80770d3bcdf359d2981f79f5d9c30de2))

## [1.16.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.15...v1.16.0) (2025-06-19)


### Features

* add IWorldBloom and IWorldBloomChapterRankingRewardRange to useCachedData ([7686e84](https://github.com/Sekai-World/sekai-viewer/commits/7686e84b06cb80101605a3949fb71700cf6290fa))
* add world bloom chapters and rankings to EventDetail component ([7d77820](https://github.com/Sekai-World/sekai-viewer/commits/7d77820a728a5739f25af9ce67a296b91f41837d))
* enhance ICardInfo and add WorldBloom interfaces ([3f6241b](https://github.com/Sekai-World/sekai-viewer/commits/3f6241b890517fd0262bf315106833b2df106901))
* **event:** add event tracker for world link chapters ([910fa1b](https://github.com/Sekai-World/sekai-viewer/commits/910fa1b95149c2afdcc6e98e97597291f4056c69))


### Bug Fixes

* **event:** add charaId prop to EventTracker components for character-specific data ([49a2fd7](https://github.com/Sekai-World/sekai-viewer/commits/49a2fd796f421b03b31de7cb680957f030774c21))

### [1.15.15](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.14...v1.15.15) (2025-06-12)


### Features

* add en exclusive song 609 ([437cef9](https://github.com/Sekai-World/sekai-viewer/commits/437cef91de3a3c0e71989b8056fdd804c436e638))
* **live2d:** implement live2d parameter sliders ([5651401](https://github.com/Sekai-World/sekai-viewer/commits/56514019747cebed0612e13fb673ab3e3e873981))


### Refactors

* moved setIdle inside handleShow ([06c33a3](https://github.com/Sekai-World/sekai-viewer/commits/06c33a3cae2658e862e937d6b293319317ae59e8))

### [1.15.14](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.13...v1.15.14) (2025-05-24)


### Features

* **music:** add CN exclusive IDs and update region checks ([859949a](https://github.com/Sekai-World/sekai-viewer/commits/859949a4bcfbe2d2b1e8f284f63ce2b56418714d))

### [1.15.13](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.12...v1.15.13) (2025-05-23)


### Features

* **live2d:** implement toggle for idle animation ([af74575](https://github.com/Sekai-World/sekai-viewer/commits/af7457524552edbf5a5170556a16fb7b645af97d))


### Refactors

* added i18n ([7bff6b0](https://github.com/Sekai-World/sekai-viewer/commits/7bff6b0a1511a3d1836c06cbca93c0af57b726fc))
* **live2d:** optimize defaultBreath with useMemo and replace Checkbox with Switch ([299d92e](https://github.com/Sekai-World/sekai-viewer/commits/299d92edf4892ff205259f033dacdfa298aeeeac))

### [1.15.12](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.11...v1.15.12) (2025-05-06)


### Bug Fixes

* **event:** simplify return condition in EventDetail component ([7b90302](https://github.com/Sekai-World/sekai-viewer/commits/7b90302536cd7e50398e40aaa2a7c44dd119f57f))

### [1.15.11](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.10...v1.15.11) (2025-05-04)


### Features

* **card:** add initialSpecialTrainingStatus to ICardInfo interface ([19b233a](https://github.com/Sekai-World/sekai-viewer/commits/19b233a91ed1bed7654476ed974b06eb24938848))
* **card:** add isTrainedOnlyCard to useCardType and update related components ([e8b5df0](https://github.com/Sekai-World/sekai-viewer/commits/e8b5df014be27caa43ed676f6cd363a9f2187eb1))

### [1.15.10](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.9...v1.15.10) (2025-04-29)


### Bug Fixes

* **honor:** fix bonds honor assets urls ([116fe12](https://github.com/Sekai-World/sekai-viewer/commits/116fe12080a035c47282277a40b7130f747a924d))
* **member:** fix character assets url ([6ad9503](https://github.com/Sekai-World/sekai-viewer/commits/6ad95034d17ec641999e36fa5918951472a43276))

### [1.15.9](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.8...v1.15.9) (2025-04-24)


### Bug Fixes

* **music meta:** correctly filter out unreleased difficulties ([08a7e3c](https://github.com/Sekai-World/sekai-viewer/commits/08a7e3ccfd8f85260d0db6764c58508dd4ed2faf))
* **music meta:** fix note count display ([d3467dd](https://github.com/Sekai-World/sekai-viewer/commits/d3467dd9117f55c3cf1ecd61b21e1dbc315dd553))
* **music meta:** widen width for music id field ([50538ae](https://github.com/Sekai-World/sekai-viewer/commits/50538ae06554aee085f22304b6d5682839ea15af))

### [1.15.8](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.7...v1.15.8) (2025-04-21)


### Bug Fixes

* **live2d:** handle models endding with "back02" ([a52f11e](https://github.com/Sekai-World/sekai-viewer/commits/a52f11ea71fdea20c194228880613ae0e18ce02b))

### [1.15.7](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.6...v1.15.7) (2025-04-21)


### Bug Fixes

* **live2d:** handle models ending with "back" ([e849933](https://github.com/Sekai-World/sekai-viewer/commits/e8499335683d07f39c82a76ac962103a8c0e6fd8))

### [1.15.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.5...v1.15.6) (2025-04-21)


### Bug Fixes

* **live2d:** download path of additional motions ([81c9786](https://github.com/Sekai-World/sekai-viewer/commits/81c978657d2d173040484920a2ffcc77507c636d))

### [1.15.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.4...v1.15.5) (2025-04-16)


### Bug Fixes

* **Home:** update game walkgthrough collection link ([cf686b3](https://github.com/Sekai-World/sekai-viewer/commits/cf686b3c76c68533b4fca2eba2c0636ee5ca9e97))
* **music:** improve character selection logic in music filtering ([4f57099](https://github.com/Sekai-World/sekai-viewer/commits/4f5709929738dd049f1dc9ea14bbfe1549f9df1e))

### [1.15.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.3...v1.15.4) (2025-04-11)


### Bug Fixes

* **live2d:** download motions ([807c289](https://github.com/Sekai-World/sekai-viewer/commits/807c289300516243b0446e349d63742adc0deb83))

### [1.15.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.2...v1.15.3) (2025-04-10)


### Bug Fixes

* **live2d:** model loading, motions loading ([6ccda7f](https://github.com/Sekai-World/sekai-viewer/commits/6ccda7fc2fbc7d0a51e1f53398afa4b8fa8c415d))
* **music:** music video finding ([43945ff](https://github.com/Sekai-World/sekai-viewer/commits/43945ff951840803b4ffcd61310e37bb7ec60672))

### [1.15.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.1...v1.15.2) (2025-04-09)


### Bug Fixes

* **live2d:** story reader ([7d6f6be](https://github.com/Sekai-World/sekai-viewer/commits/7d6f6be1f768b99ab13e2da3ed113a8cb4ffb66c))
* **live2d:** update motion and expression file paths for model data ([882908f](https://github.com/Sekai-World/sekai-viewer/commits/882908f68cffe1ddd688b631b2c04acae2718d8f))

### [1.15.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.15.0...v1.15.1) (2025-04-09)


### Bug Fixes

* **live2d:** changes for new live2d assets structure ([dc81005](https://github.com/Sekai-World/sekai-viewer/commits/dc810053f3292ed343b949d16a5024ba95c08ff5))
* **music:** id3 embedded cover art use png image ([836980d](https://github.com/Sekai-World/sekai-viewer/commits/836980d1f7e38267ab0ac154c3ac4188b6259ac4))

## [1.15.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.14.7...v1.15.0) (2025-04-07)


### Features

* **apiClient:** update live2d model URL to use assetUrl configuration ([fc7cafb](https://github.com/Sekai-World/sekai-viewer/commits/fc7cafb7432378003afe112119692fb869d78955))
* **mp3:** add ID3 tagging functionality and support for WAV format ([d7f6927](https://github.com/Sekai-World/sekai-viewer/commits/d7f692730c3f27aa9010a728b7c12ca2fe87e08c))
* **voiceFinder:** implement voice normalization and retrieval functions ([af57318](https://github.com/Sekai-World/sekai-viewer/commits/af57318115f8d18a4687e7af0621c7974974a308))


### Bug Fixes

* **AudioPlayer:** add type annotations for seekHandler and formatTime functions ([947753b](https://github.com/Sekai-World/sekai-viewer/commits/947753b40b0ebbe4b83f0f80ee78fdb73655e58f))
* **event:** fix error on history event tracker ([6065173](https://github.com/Sekai-World/sekai-viewer/commits/6065173d4e070ca913ea07afb9806a0f1f55515e))
* **event:** make rows with no score unexpandable ([eb2ccaa](https://github.com/Sekai-World/sekai-viewer/commits/eb2ccaa73064833d667ea5e44ee44e5606eea614))


### Refactors

* asset URLs to remove "_rip" suffix across multiple components ([9352c95](https://github.com/Sekai-World/sekai-viewer/commits/9352c95925a7839e7e0da5677fe42a93be3ccb3c))

### [1.14.7](https://github.com/Sekai-World/sekai-viewer/compare/v1.14.6...v1.14.7) (2025-03-19)


### Features

* **card:** :sparkles: add 3dmv cut-ins for cards ([216a2ee](https://github.com/Sekai-World/sekai-viewer/commits/216a2eed91093fbd1d3d082cd90325e1a30657c4))
* **card:** support skill change after training ([436c032](https://github.com/Sekai-World/sekai-viewer/commits/436c032ae28a2d183e4cab086b3894dd545ac468))

### [1.14.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.14.5...v1.14.6) (2025-03-07)


### Features

* **event:** add link to live2d story reader ([8bf7fc8](https://github.com/Sekai-World/sekai-viewer/commits/8bf7fc8874db9884b9b8b6620417c89507deac87))
* **live2d:** add warning event & popup snack bar ([f920557](https://github.com/Sekai-World/sekai-viewer/commits/f9205572dbe2892822b1dc600c21cbec8c44ceb4))
* **live2d:** implement camera move/zoom effect ([8679e04](https://github.com/Sekai-World/sekai-viewer/commits/8679e043fc1374ba77c3927c3d7875d2f7b2ff50))
* **live2d:** implement CharacterLayoutMode ([a4a2e1a](https://github.com/Sekai-World/sekai-viewer/commits/a4a2e1aa386618931f6d5c2807080140fea34f5d))
* **live2d:** implement memory in/out effect ([341a268](https://github.com/Sekai-World/sekai-viewer/commits/341a26877676ee9ca92a71db6ee9263a62f1e16b))
* **live2d:** implement sekai in/out center effect ([6c3389a](https://github.com/Sekai-World/sekai-viewer/commits/6c3389a46232af4fcc7ed3222455433c6c6cd39c))
* **live2d:** implement sound fade in/out ([ac18dd6](https://github.com/Sekai-World/sekai-viewer/commits/ac18dd68f60333102d7300af8cd064184f7455a7))
* **music:** add additional exclusive IDs for English music ([1ef6192](https://github.com/Sekai-World/sekai-viewer/commits/1ef619297deba0a42158c2a2bfab3bdfb9b9decd))


### Bug Fixes

* **i18n:** typo area_sub_name ([ba0a92c](https://github.com/Sekai-World/sekai-viewer/commits/ba0a92c0bba08efe23de169d5e641f931abdb427))
* **live2d:** miku missing eye & rui missing arm ([fc0477c](https://github.com/Sekai-World/sekai-viewer/commits/fc0477c962f436732256fc49282ee7a2a7e499aa))
* **live2d:** models will be blocked in some cases & memory leak ([a689929](https://github.com/Sekai-World/sekai-viewer/commits/a689929371cabf995719891de7557a158c7675af))
* **live2d:** some sound effects and part voices are not loaded correctly ([15f296e](https://github.com/Sekai-World/sekai-viewer/commits/15f296e16433fb6421b10b939d2338415d487c99))
* **live2d:** texts are sharp-edged ([91f21c3](https://github.com/Sekai-World/sekai-viewer/commits/91f21c3d57eb3907a40eb57c1bb111a6088edcc9))
* **live2d:** texture and sound objects are not destroyed after the live2d stage is destroyed ([de07cb8](https://github.com/Sekai-World/sekai-viewer/commits/de07cb8d0292ab1c79ea45b0cb9789819472c74c))
* **live2d:** wipe out effect animation not shown ([dca4791](https://github.com/Sekai-World/sekai-viewer/commits/dca4791698da73caa0100e195fcca20796389248))

### [1.14.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.14.4...v1.14.5) (2025-02-22)


### Features

* **card:** add link to live2d story reader ([af80a94](https://github.com/Sekai-World/sekai-viewer/commits/af80a94e1988f64f7836f06f02aa00387ceffa9d))
* **live2d:** add web page fullscreen and portrait mode(for mobile) support ([2c9904f](https://github.com/Sekai-World/sekai-viewer/commits/2c9904fb0b7cd499f730f37d95237514ab9cbdea))
* **live2d:** indicate when a story ends ([fd42263](https://github.com/Sekai-World/sekai-viewer/commits/fd42263fd28c084a6287b3d20474db13073bc36a))
* **live2d:** move settings to top, add toggle button ([702ec95](https://github.com/Sekai-World/sekai-viewer/commits/702ec952998fdc98c3459e30bc70506eddde7a0a))
* **test:** refine test page, create graph to clearify workflow ([9da2ff7](https://github.com/Sekai-World/sekai-viewer/commits/9da2ff76696a0c64a9de87a2eee23ac8656d2fc6))


### Bug Fixes

* **live2d:** autoplay not working ([f8806de](https://github.com/Sekai-World/sekai-viewer/commits/f8806de88dc510d2f1d6e11a6e64e2455f6f2d21))
* **live2d:** fail to add ambient color when no live2d filters ([b40ccd9](https://github.com/Sekai-World/sekai-viewer/commits/b40ccd9c138df743eb7e8f7094ad540da04e4d5c))
* **live2d:** live2d motions will start with T-pose in some situation ([a5380bf](https://github.com/Sekai-World/sekai-viewer/commits/a5380bf883c4278112872bfde858f2f99b4e1fb0))
* **live2d:** only one texture was packed when download live2d models ([7471354](https://github.com/Sekai-World/sekai-viewer/commits/74713548b5503a8cf79d550f9ee0c459d7821216))
* **live2d:** wrong model names stuck the story loading process ([89dc331](https://github.com/Sekai-World/sekai-viewer/commits/89dc331d7ce4fd614de82ffc278776a70936f528))


### Refactors

* **live2d:** simplify some story loading codes ([b3a1a12](https://github.com/Sekai-World/sekai-viewer/commits/b3a1a12be1f83ce4c5c79bf9b681b3540990d51f))

### [1.14.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.14.3...v1.14.4) (2025-02-01)


### Bug Fixes

* **live2d:** return the right motion base name ([767dd29](https://github.com/Sekai-World/sekai-viewer/commits/767dd293a7bf5db4dd9e03b0583d2db2000a8c38))
* **live2d:** update texture, moc, and physics file URLs to include modelData.url ([e69dd7d](https://github.com/Sekai-World/sekai-viewer/commits/e69dd7db513a951f0ab5d27382b9c619dbbc52dc))


### Refactors

* **live2d:** refactor nextStep function to use useCallback for better performance ([2fe97aa](https://github.com/Sekai-World/sekai-viewer/commits/2fe97aad202487ccc4b110e86604c406d063dfde))

### [1.14.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.14.2...v1.14.3) (2025-02-01)


### Features

* **live2d:** add model name transformation logic for motion base name retrieval ([6bc87b1](https://github.com/Sekai-World/sekai-viewer/commits/6bc87b120065b9424aafb670fe42c297c104eeb6))
* **live2d:** add support for none 16:9 screen in fullscreen mode ([98ab4ba](https://github.com/Sekai-World/sekai-viewer/commits/98ab4ba1fce7a9fc6e1390776d8dda1445eb060c))
* **live2d:** add volume and animation controller ([4610c51](https://github.com/Sekai-World/sekai-viewer/commits/4610c51fc4c7d3ccedda674ea2bd47f4afb4cc55))
* **live2d:** implement fullscreentext effect ([b7b079f](https://github.com/Sekai-World/sekai-viewer/commits/b7b079fa0b9901edb1086dc9b454b7a17f163313))
* **storyreader:** add character filter for areatalk ([9aecc27](https://github.com/Sekai-World/sekai-viewer/commits/9aecc273150ad8533444b7f99722d10dc047f57d))
* **test:** add test page in dev mode to ensure every assets are exist for storyreader ([a1ba77b](https://github.com/Sekai-World/sekai-viewer/commits/a1ba77bf62a67115b9dc42a39843ae66b6d7733d))


### Bug Fixes

* **live2d:** areatalk not load properly ([58cec0e](https://github.com/Sekai-World/sekai-viewer/commits/58cec0ec81c7af1b92cb36850e44d9ac3e9c583f))
* **live2d:** improve motion base name reduction logic for URL retrieval ([a9f4172](https://github.com/Sekai-World/sekai-viewer/commits/a9f41723c77a5480a60ee4dcd963bab462221bba))
* **live2d:** set minWidth of motion and expression selector to 250px ([1bba9eb](https://github.com/Sekai-World/sekai-viewer/commits/1bba9eb16fcb4c191c2e4eb6391308c87a6242f5))
* **live2d:** update motion name parsing for v2_clb format ([ca5204a](https://github.com/Sekai-World/sekai-viewer/commits/ca5204a67c0296f8893c168f1d888be21352a1d0))
* **storyreader:** area sub name not display and translate ([ece5ef7](https://github.com/Sekai-World/sekai-viewer/commits/ece5ef7f440562862d50323c6b4d09c33df52998))


### Refactors

* **live2d:** clean up imports and improve model data type handling ([7d424a3](https://github.com/Sekai-World/sekai-viewer/commits/7d424a39504caaac284e7c58e76b1eb577c7eece))
* **live2d:** create live2d loading module for live2d showcase and live2d reader ([d6cb52d](https://github.com/Sekai-World/sekai-viewer/commits/d6cb52dbd616ffc32028e86bd321eed38d998f6a))
* **live2d:** simplify motion data retrieval and enhance error handling ([9895d73](https://github.com/Sekai-World/sekai-viewer/commits/9895d733ab49b346f0b6138f704cd3ad588b5131))
* **live2d:** split live2d player action into multiple files ([5e3cc59](https://github.com/Sekai-World/sekai-viewer/commits/5e3cc59f5234c421f84e628b7d4e3ace0439f200))
* **storyreader:** create story loading module for text and live2d reader ([7d79aae](https://github.com/Sekai-World/sekai-viewer/commits/7d79aae656bdcf486267c195d6c19a003a3207ee))
* **storyreader:** create story selector for both text and live2d reader ([258f3c6](https://github.com/Sekai-World/sekai-viewer/commits/258f3c61744331837990cc3da8878b4d6d0fbd5e))

### [1.14.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.14.1...v1.14.2) (2025-01-23)


### Bug Fixes

* refactor image extraction to use promise for better handling ([13eecdb](https://github.com/Sekai-World/sekai-viewer/commits/13eecdbf055bb24591578fe4a5fdae8fa6080838))

### [1.14.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.14.0...v1.14.1) (2025-01-19)


### Bug Fixes

* add missing voice finder ([013dcfe](https://github.com/Sekai-World/sekai-viewer/commits/013dcfeab508fbd03f69dcfaab890880be705abc))
* add missing voice finder ([285594f](https://github.com/Sekai-World/sekai-viewer/commits/285594f963e01dfb97489e26fa84d984da04ce57))
* add missing voice finder ([b1e4f3d](https://github.com/Sekai-World/sekai-viewer/commits/b1e4f3d56f966c141f231dac0edb0c11b7660b7f))
* **honor:** update viewType check to use startsWith for normal state ([a154e9b](https://github.com/Sekai-World/sekai-viewer/commits/a154e9b7ea0f06f85f44eb50ee1af651abd67220))
* **live2d:** cross origin policy are not set for images and sounds ([236e604](https://github.com/Sekai-World/sekai-viewer/commits/236e6046a78aa322981ac474e94eec6d94beda70))
* remove package-lock.json ([616f82c](https://github.com/Sekai-World/sekai-viewer/commits/616f82c52f2482bca0396a432806ec2b727e673f))

## [1.14.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.13.3...v1.14.0) (2025-01-12)


### Features

* **live2d:** fancy ui and text animation ([d1c01ec](https://github.com/Sekai-World/sekai-viewer/commits/d1c01ec55b3fe3ecf5a559e6ecb81da6be31c05b))
* **live2d:** implement 56% SpecialEffect.ScenarioEffect ([96ada55](https://github.com/Sekai-World/sekai-viewer/commits/96ada5505b6a84a8b631ec91260c92cb964ac2f0))
* **live2d:** implement character moving ([fc78b16](https://github.com/Sekai-World/sekai-viewer/commits/fc78b16cba410a394caa4fb80bac1c740e566d63))
* **live2d:** implement shake & ambient color & wipe & sekai in/out effect ([7274ffa](https://github.com/Sekai-World/sekai-viewer/commits/7274ffadd2ee25abc3da452f080b263ed68467ec))
* **live2d:** implement SpecialEffect Hologram ([c2a7534](https://github.com/Sekai-World/sekai-viewer/commits/c2a753434b811847c582b049f3b7a5fbc8d52182))
* **live2d:** lipsync, simultaneous motions and expressions ([0298ef9](https://github.com/Sekai-World/sekai-viewer/commits/0298ef9b3ef60967c0d9007ea6e42057c3212545))
* **live2d:** refactor motion name handling and update progress text keys ([454eaab](https://github.com/Sekai-World/sekai-viewer/commits/454eaab47707538fdec979bf8602ebd5f12be4aa))
* reimplement live2d story reader ([76d3866](https://github.com/Sekai-World/sekai-viewer/commits/76d3866c271d1af1e466abbb79a3f43cb5a39b86))


### Bug Fixes

* **live2d:** event sound loading not properly & sound not clear ([ed54310](https://github.com/Sekai-World/sekai-viewer/commits/ed54310adbcfd64a6985d7ce8a305054da738030))
* **live2d:** update x positions and offsets in BondsDegreeImage and DegreeImage components ([1aaace8](https://github.com/Sekai-World/sekai-viewer/commits/1aaace87c34f398d768fc75f837b43da7d76669c))


### Refactors

* **live2d:** animation classes ([b2db225](https://github.com/Sekai-World/sekai-viewer/commits/b2db225b892d4f365dab359e39cb906e05f198b8))
* **live2d:** change some file name ([6e96e49](https://github.com/Sekai-World/sekai-viewer/commits/6e96e49c48b51b21418c1d4d9c8caad8e4ddc9fb))
* upgrade pixi to v7, migrate to pixi-live2d-display-mulmotion ([5383b34](https://github.com/Sekai-World/sekai-viewer/commits/5383b34b154ff6e65ccc739c8f14bb1d254a0109))

### [1.13.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.13.2...v1.13.3) (2024-12-14)


### Features

* **member:** add costume data to member detail ([c40c79b](https://github.com/Sekai-World/sekai-viewer/commits/c40c79b0e3e7ba17319b06dca508b5bab3c59858))
* **types:** add ICompactCostume3D and ICompactCostume3DEnum interfaces for costume data management ([2aaff71](https://github.com/Sekai-World/sekai-viewer/commits/2aaff71759ed459184746d9db77800fc3954d785))


### Bug Fixes

* **ImageWrapper:** add duration prop to Image component for smoother transitions ([6388506](https://github.com/Sekai-World/sekai-viewer/commits/6388506a4fd836f0c99268c34cb194ef8870cb6d))

### [1.13.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.13.1...v1.13.2) (2024-12-10)


### Features

* **Settings:** add spoiler content mosaicked option in settings ([df544c3](https://github.com/Sekai-World/sekai-viewer/commits/df544c3436f8dfe12ade6dfed56a255f7d9bde88))
* **SpoilerCard:** integrate mobx for spoiler mosaicking and optimize styles ([b953656](https://github.com/Sekai-World/sekai-viewer/commits/b953656b3907aa90370a845384d2c6fdecd741d3))


### Bug Fixes

* **Live2D:** update motion name validation to include 'sub_rival' prefix ([209266c](https://github.com/Sekai-World/sekai-viewer/commits/209266cd58160991cabce8bbf363ca1d194fefff))
* **SpoilerCard:** update click handler to include isSpoilerMosaicked condition ([9c9e457](https://github.com/Sekai-World/sekai-viewer/commits/9c9e457abd0c455bff9cbdc2d626e4f2cdf4b6e7))


### Refactors

* **AgendaView:** remove unused SpoilerTag component from AgendaView ([9fa5894](https://github.com/Sekai-World/sekai-viewer/commits/9fa589432d526b3b02ff6bf269e3b9f5264ee0e9))

### [1.13.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.13.0...v1.13.1) (2024-12-09)


### Features

* **SpoilerCard:** implement touch device detection and adjust interaction logic ([3f5e94d](https://github.com/Sekai-World/sekai-viewer/commits/3f5e94d4c8437402b72d10ab99236388f7223d87))


### Bug Fixes

* **useIsTouchDevice:** reset touch device state on cleanup ([ad8a89c](https://github.com/Sekai-World/sekai-viewer/commits/ad8a89cce691c9f1a8b9e4bb41bf6fbecd0fd1fa))


### Refactors

* **vite.config:** remove unnecessary TypeScript error suppression for cleaner configuration ([a02e037](https://github.com/Sekai-World/sekai-viewer/commits/a02e03759e4e42542484bfa92500fd6fc7ef1cef))

## [1.13.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.12.6...v1.13.0) (2024-12-09)


### Features

* :sparkles: spoiler card instead of simple spoiler tag ([54beccb](https://github.com/Sekai-World/sekai-viewer/commits/54beccb12d2128e6a5588fe4ad95810d4bdf36b5))
* **AgendaView:** enhance layout with AgendaBox and AgendaPaper components ([ce0afc8](https://github.com/Sekai-World/sekai-viewer/commits/ce0afc8c724174b88b328cf96c62c41e63dec0b8))
* **AgendaView:** integrate SpoilerCard component for improved layout and functionality ([6fb0038](https://github.com/Sekai-World/sekai-viewer/commits/6fb00388b84ac3717caa40404faae1b4dab50ca6))
* **AgendaView:** replace Link with SpoilerCard for improved navigation and layout ([2bedee8](https://github.com/Sekai-World/sekai-viewer/commits/2bedee879668b18557355ae9892225ea6dbf67b6))
* **AgendaView:** replace LinkNoDecoration with SpoilerCard for improved navigation and layout ([5f9ae99](https://github.com/Sekai-World/sekai-viewer/commits/5f9ae99767577cb3b3ccdbd763928a519f274dc3))
* **card:** optimize max parameter calculation and add support for CN server ([3786ad7](https://github.com/Sekai-World/sekai-viewer/commits/3786ad7bd234cd41faee439cb0faab04009d2595))
* **card:** replace SpoilerTag with SpoilerCard for improved display in GridView components ([4674017](https://github.com/Sekai-World/sekai-viewer/commits/46740170e68351e4f798cb5cfb99601c8b805842))
* **ComfyView:** replace LinkNoDecoration with SpoilerCard for improved navigation and layout ([40c4cee](https://github.com/Sekai-World/sekai-viewer/commits/40c4cee494dbdfdd1d23fe9189504b52cc2a388d))
* **comic:** add support for Chinese language assets in ComicList and GridView components ([1b898bf](https://github.com/Sekai-World/sekai-viewer/commits/1b898bfef2b95da74236ce4fcc3c9660287e4a93))
* **comic:** add support for simplified Chinese language in ComicList component ([ecec6e1](https://github.com/Sekai-World/sekai-viewer/commits/ecec6e107af55c20ccf1b196602416a59745d93e))
* **event:** conditionally display remaining time and progress during event ([a458bc9](https://github.com/Sekai-World/sekai-viewer/commits/a458bc9c882138dff0640f2916ef87a31af4e08f))
* **event:** replace SpoilerTag with SpoilerCard for improved event spoiler display ([d1507be](https://github.com/Sekai-World/sekai-viewer/commits/d1507be7360cb624e2850fe1623242f6ebab805e))
* **resources:** add support for CN region in DegreeImage and ResourceBox components ([9d8403b](https://github.com/Sekai-World/sekai-viewer/commits/9d8403b78beb14af0906924fafd6cf4901d0dea3))
* **settings:** add support for cn server region ([c2927e6](https://github.com/Sekai-World/sekai-viewer/commits/c2927e6bfe3b62498e64e3bbec75b1ea261de33e))
* **SpoilerCard:** spread additional props to Card component for enhanced flexibility ([9c6d09d](https://github.com/Sekai-World/sekai-viewer/commits/9c6d09d547de50257da08f28a0f4787a020afe3f))


### Bug Fixes

* **agenda:** simplify rarity check for card display logic ([c501fba](https://github.com/Sekai-World/sekai-viewer/commits/c501fbab2e38e24f5616cf84aaa710f6aaf87784))
* **AgendaView:** adjust grid sizes for improved layout consistency ([098084f](https://github.com/Sekai-World/sekai-viewer/commits/098084f1b7c9f1ffda1dd5e653560a70b56f24e9))
* **ResourceBox:** update asset URL to use region-specific path for stamp images ([4ba14f5](https://github.com/Sekai-World/sekai-viewer/commits/4ba14f551782b9ab5592eda139672804b9ad43a2))
* **score:** multiroom player skill calculation ([2e57de8](https://github.com/Sekai-World/sekai-viewer/commits/2e57de8fe802487dc5566b5523d54391b84e7a98))
* **SpoilerCard:** adjust backdrop filter and background color for improved visual clarity ([64c425a](https://github.com/Sekai-World/sekai-viewer/commits/64c425a0f7df3e85879585aca6d1023272cbe786))
* **utils:** simplify condition checks and improve character data retrieval ([0bb9fd3](https://github.com/Sekai-World/sekai-viewer/commits/0bb9fd3d4a6c593ba2b9beb27b6847748736a3f6))
* **VirtualLiveList:** improve filtering logic for virtual live schedules ([8f005e5](https://github.com/Sekai-World/sekai-viewer/commits/8f005e5e4e10db0ba93f5867c1ce51408fc3540d))
* **VirtualLiveList:** remove unnecessary lg grid size for agenda layout ([9d80e14](https://github.com/Sekai-World/sekai-viewer/commits/9d80e14b18ed3de626e242af88bd109719ed16ae))


### Refactors

* **AgendaView:** remove unused SpoilerTag component for cleaner code ([2df8b74](https://github.com/Sekai-World/sekai-viewer/commits/2df8b7400fd5bb5ce76f7c1ecdb8af56acc9f483))
* **event:** remove unused realtime event data logic and related types ([dde8f85](https://github.com/Sekai-World/sekai-viewer/commits/dde8f85641df41366e7c7774da666e977c0c0b59))
* remove console.log statements and replace with console.error where applicable ([d30c50e](https://github.com/Sekai-World/sekai-viewer/commits/d30c50e3a40d141a7dce3d9a65f6e522eee733ff))
* **user:** remove unused imports and adjust layout for CN region ([c7f2797](https://github.com/Sekai-World/sekai-viewer/commits/c7f27973f8d8590034a92392aa2808438cd8d8b1))

### [1.12.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.12.5...v1.12.6) (2024-11-04)


### Bug Fixes

* **honor:** do not override honorLevel from prop ([71690ff](https://github.com/Sekai-World/sekai-viewer/commits/71690ff7f19226c61e3dd43a1e65018be9cd3c2a))
* **widgets:** compact costume 3d data for tw and kr servers ([2b014fe](https://github.com/Sekai-World/sekai-viewer/commits/2b014fe6758f887f69aa573aaea05054bda4d22a))
* wrong locale key in HonorDetailDialog for reward titles ([a3defe3](https://github.com/Sekai-World/sekai-viewer/commits/a3defe349169e64172c75c1580e8f5358296eaf7))


### Refactors

* **helpers:** update threshold value in InfiniteScroll component ([5c8b7d3](https://github.com/Sekai-World/sekai-viewer/commits/5c8b7d3cd42bb723ca26e98722da9c08c5851836))
* **honor:** improve rendering of honor titles ([1a41275](https://github.com/Sekai-World/sekai-viewer/commits/1a41275121998e5e0d83a2570235eadb3b354891))

### [1.12.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.12.4...v1.12.5) (2024-10-14)


### Features

* **honor:** add icon for level 6+ ([9439a27](https://github.com/Sekai-World/sekai-viewer/commits/9439a270b413ce52b5afad301e692033c94750a0))
* **widgets:** add LevelNumberInput component ([f672f16](https://github.com/Sekai-World/sekai-viewer/commits/f672f16ab622d54a011c645abcc8c824a7be48a8))


### Bug Fixes

* **degree:** handle degree frame and text image correctly ([d576e2c](https://github.com/Sekai-World/sekai-viewer/commits/d576e2ce53cd4fefc1fbc6e2622a754c61471102))
* **gacha:** gacha ticket display ([c381532](https://github.com/Sekai-World/sekai-viewer/commits/c38153214b790a82d51697b31cbca70ab4b6bff7))
* **honor:** bondsHonor word retrieval logic in BondsHonorList ([27c0e13](https://github.com/Sekai-World/sekai-viewer/commits/27c0e13448d0ea21dd20b40f264bddfb49334551))
* **honor:** handling if bondsHonor does not have word ([437a896](https://github.com/Sekai-World/sekai-viewer/commits/437a8963ec0ba1f2fc4a34a2dd89eb90455463ad))
* **honor:** world link event chapter degree frame ([b410854](https://github.com/Sekai-World/sekai-viewer/commits/b410854f5e0286a651c112ffce673ef281ce5574))
* **widgets:** handling world link event degrees ([772f7fe](https://github.com/Sekai-World/sekai-viewer/commits/772f7fe5ba70fafee911759b922c0aec2c7d2977))
* **widgets:** rendering degree level diamonds ([28f8d1f](https://github.com/Sekai-World/sekai-viewer/commits/28f8d1fd7baf6d7fb134cde8894b313396e6b817))


### Refactors

* **honor:** better display of honor details ([d3789a2](https://github.com/Sekai-World/sekai-viewer/commits/d3789a2123f221a2ab157ade68de42eac3905c00))
* **honor:** bondsHonor detail dialog have better layout of words ([c96631b](https://github.com/Sekai-World/sekai-viewer/commits/c96631bdc0d4cab2e830790e5e0e2fc9b2fcb142))
* **honor:** use level number input ([b753258](https://github.com/Sekai-World/sekai-viewer/commits/b7532580ecdd702f6df02a903af5ec6368ba4a31))
* optimize DegreeImage component ([446aed7](https://github.com/Sekai-World/sekai-viewer/commits/446aed72eaf1e571515741e84e9b74eef00f125a))
* rename widgets ([d51b362](https://github.com/Sekai-World/sekai-viewer/commits/d51b3628cc01fe080549cea3d9848b6c199cc127))
* **types:** update types definition of master data ([08b1e2a](https://github.com/Sekai-World/sekai-viewer/commits/08b1e2a7334e998f35c57932e67ca0c5661fe6e9))
* **widgets:** add BoostItemIcon component ([c804afc](https://github.com/Sekai-World/sekai-viewer/commits/c804afc4ab0a89533fb9978f5590c00acde61393))
* **widgets:** degree image check if image exists before setting image url ([43a2fa1](https://github.com/Sekai-World/sekai-viewer/commits/43a2fa12f6cb71a9d80471e931e37d21001ad79d))
* **widgets:** update ResourceBox component ([0c00a45](https://github.com/Sekai-World/sekai-viewer/commits/0c00a45f47d7d8f71f2b104caf9854affb278f19))
* **widgets:** use remote material icons ([e696b26](https://github.com/Sekai-World/sekai-viewer/commits/e696b26e1cbeb2f2da2bf26f66edfe789fbd1a80))

### [1.12.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.12.3...v1.12.4) (2024-09-29)


### Features

* update 4th anniversary banner ([d9abdd4](https://github.com/Sekai-World/sekai-viewer/commits/d9abdd40356124f3bc6e840e67c927a72b7d1cb5))

### [1.12.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.12.2...v1.12.3) (2024-09-28)


### Refactors

* **music:** add en exclusive song 514 ([0734227](https://github.com/Sekai-World/sekai-viewer/commits/073422713ba192752387f7680e75b776be330778))

### [1.12.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.12.1...v1.12.2) (2024-09-20)


### Refactors

* **music:** new url for charts ([cb62557](https://github.com/Sekai-World/sekai-viewer/commits/cb625578e84442efcee1271e72cb1d1305f8cc98))

### [1.12.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.12.0...v1.12.1) (2024-08-27)


### Features

* add search functionality to MusicRecommend page ([b80de8f](https://github.com/Sekai-World/sekai-viewer/commits/b80de8f5864f11999e52c73bcda4bbbafabf9479))
* search songs in music meta ([215378f](https://github.com/Sekai-World/sekai-viewer/commits/215378f92335a7a2b2167439e64e81db0d2a576c))


### Bug Fixes

* append difficulty in music meta ([15f0788](https://github.com/Sekai-World/sekai-viewer/commits/15f07889f3cb33919fe1732800b3536b0ce56c5a))
* v2_sub live2d not loaded because of motion files ([2b89d95](https://github.com/Sekai-World/sekai-viewer/commits/2b89d951664a111bfce8bd7be44b08193dabaf8b))


### Refactors

* :recycle: dependency package breaking changes ([d14bb11](https://github.com/Sekai-World/sekai-viewer/commits/d14bb116fc8a1c3a8ff8962012193b31dfe2aaed))

## [1.12.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.11.2...v1.12.0) (2024-08-17)


### Features

* add bondsHonor (kizuna titles) ([b39053e](https://github.com/Sekai-World/sekai-viewer/commits/b39053e13d971a06822c0c7ba317bb538de7925c))
* **honor:** :sparkles: add search to honor list filter ([c53e751](https://github.com/Sekai-World/sekai-viewer/commits/c53e75128e54a9c1d67dfb4f4838a63c287f2b89))


### Bug Fixes

* add Howl import to AudioPlayButton component ([c12de28](https://github.com/Sekai-World/sekai-viewer/commits/c12de289e7a3640523a110521eb5789b2d7f0f4c))


### Refactors

* add definition for ingameCutinCharacters ([ea3ca5d](https://github.com/Sekai-World/sekai-viewer/commits/ea3ca5d3d29572ac9de60a2c5aa44cadd8e40971))
* make AudioPlayButton a common widget ([7912574](https://github.com/Sekai-World/sekai-viewer/commits/79125746b044762398af557fc2e4b9e131726e31))
* remove deprecated components, add entry to bonds title ([624ab3a](https://github.com/Sekai-World/sekai-viewer/commits/624ab3aaf9531165277efbe71d2dad0b87c919a8))
* remove redundant svg tag from DegreeImage component ([f44c972](https://github.com/Sekai-World/sekai-viewer/commits/f44c9723a544dd7316b86629c3017033a7d76449))
* update CommonMaterialIcon component with spacing prop ([4de4f1a](https://github.com/Sekai-World/sekai-viewer/commits/4de4f1ab1a839fd25e7377ab31abe72ecbb9d85e))
* update import paths for AudioPlayButton component ([b64024f](https://github.com/Sekai-World/sekai-viewer/commits/b64024ff4f526068687e26cd173aa370f5016904))
* update rank input min and max values in BondsHonorDetailDialog ([9e07291](https://github.com/Sekai-World/sekai-viewer/commits/9e072917437394e50feb5157737d0eb9ea5ba591))

### [1.11.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.11.1...v1.11.2) (2024-07-22)


### Features

* :sparkles: add countdown to event tracker ([0aeede0](https://github.com/Sekai-World/sekai-viewer/commits/0aeede0b2fff9f7f309c1efc1f3de75e4e7d8df6))
* **live2d:** :sparkles: reload model ([9dfffd2](https://github.com/Sekai-World/sekai-viewer/commits/9dfffd27db98a4ff757fe3603caebbbded843a41))


### Refactors

* :lipstick: countdown digit block style ([3e4f8f4](https://github.com/Sekai-World/sekai-viewer/commits/3e4f8f4cf74ad0f0a1d41326c11049508e13bc33))

### [1.11.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.11.0...v1.11.1) (2024-07-02)


### Refactors

* fix rank in event titles ([710cfff](https://github.com/Sekai-World/sekai-viewer/commits/710cfff011cd36171878bb6a0131a3d0c621d636))
* fix unused variables and improve code readability in TeamBuilder component ([1b18717](https://github.com/Sekai-World/sekai-viewer/commits/1b187175f2ae764fd5f2ac19484c950fedfc7286))
* optimize image loading in CardImage and CardThumb components ([6471666](https://github.com/Sekai-World/sekai-viewer/commits/64716663a84da625fac2e7dedf22ffe3c924a2fd))
* update sorting options in MusicList component ([baaae33](https://github.com/Sekai-World/sekai-viewer/commits/baaae339e5cb052275f05d8af5103cbb8d432283))

## [1.11.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.10.4...v1.11.0) (2024-07-02)


### Features

* add region prop to StoryReaderContent component ([09e1c20](https://github.com/Sekai-World/sekai-viewer/commits/09e1c20328d4f7f708f1c4e2dbc9a71c494e50ce))


### Bug Fixes

* **storyreader:** en server card story path ([84886d9](https://github.com/Sekai-World/sekai-viewer/commits/84886d9419471505bfff8f145b0eeee98e32435c))


### Refactors

* add minWidth style to search input in MusicList ([c30acbb](https://github.com/Sekai-World/sekai-viewer/commits/c30acbb80d8accadac727cbe1c531f629ccb8a14))
* add missing exclusive IDs for EN music ([53940fa](https://github.com/Sekai-World/sekai-viewer/commits/53940fa6906c4f35d6d09a58f6cead64ec0fdb80))
* add region prop to MusicVideoPlayer ([9669a90](https://github.com/Sekai-World/sekai-viewer/commits/9669a9065371e6ea184895a8d913c38b18acf236))
* add searchTitle to EventList, GachaList and VirtualLiveList ([c6c4be8](https://github.com/Sekai-World/sekai-viewer/commits/c6c4be80e76a132f336f8f7ddc4ff2e34cbfa219))
* add supportUnitSelected and searchTitle to CardList and MusicList filters ([e1a142c](https://github.com/Sekai-World/sekai-viewer/commits/e1a142cd3be6d01a9308919fdc7aa8a6e697e539))
* add title search to CardList ([55649f1](https://github.com/Sekai-World/sekai-viewer/commits/55649f17ca6969bb8f1efecd011ac443d6ac66b5))
* add title search to MusicList ([4296756](https://github.com/Sekai-World/sekai-viewer/commits/4296756e55190b914795360f6cc95643c70df67e))
* disable auto interaction for Live2dModel ([6f147bc](https://github.com/Sekai-World/sekai-viewer/commits/6f147bc92419c99164677adf6864983f00bde776))
* distinguish back icon ([dfaf463](https://github.com/Sekai-World/sekai-viewer/commits/dfaf46394668349d2615d6c976bf4f29b8450d9e))
* improve UI layout in AgendaView component ([611cc90](https://github.com/Sekai-World/sekai-viewer/commits/611cc90db2358f358c25e1ab5e4fa4cd34b9dc07))
* improve UI layout in CardList component ([9614e16](https://github.com/Sekai-World/sekai-viewer/commits/9614e164146d85e2b42954ccfb170878ff938358))
* update Dockerfile and service-worker configuration ([1a9174a](https://github.com/Sekai-World/sekai-viewer/commits/1a9174afbc7f8ad3c6b859c84632eb70a3f8f315))
* upscale pixi.js rendering resolution ([0af67f5](https://github.com/Sekai-World/sekai-viewer/commits/0af67f5fec114b8cb258526d79b8d40a88b738e0))

### [1.10.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.10.3...v1.10.4) (2024-06-18)


### Features

* **home:** prepare countdown ([e11f263](https://github.com/Sekai-World/sekai-viewer/commits/e11f263ccb91153890a418eba4e02a5139d66d75))


### Bug Fixes

* **home:** wrong countdown condition and placement ([2d6f309](https://github.com/Sekai-World/sekai-viewer/commits/2d6f309e3ada94d4d4260b24e66c4b3a2d6d0d4d))
* **music:** mv radio button not selectable ([1fded80](https://github.com/Sekai-World/sekai-viewer/commits/1fded8012c921e12eeb0ba69fb1090e009d01eaa))


### Refactors

* :arrow_up: new live2d use pixi renderer ([0361dcd](https://github.com/Sekai-World/sekai-viewer/commits/0361dcd624fbffa0e1c5dfe1914a09138a6b0d65))
* :arrow_up: use new flip countdown package ([a51cb46](https://github.com/Sekai-World/sekai-viewer/commits/a51cb46b7021f07e25b26e44f29c57651b12fe3e))

### [1.10.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.10.2...v1.10.3) (2024-06-04)


### Refactors

* **music:** update server exclusive song list ([897123d](https://github.com/Sekai-World/sekai-viewer/commits/897123d5c1b26125801ce1ddb1831e028f3c97b3))

### [1.10.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.10.1...v1.10.2) (2024-06-03)


### Bug Fixes

* **stamp:** stamp asset path ([450d82c](https://github.com/Sekai-World/sekai-viewer/commits/450d82c73e07b3945edd823fc58a07e05f8100e3))


### Refactors

* **stamp:** character filter ([db44a30](https://github.com/Sekai-World/sekai-viewer/commits/db44a30fdff457340128221a7bfce96ddc786078))

### [1.10.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.10.0...v1.10.1) (2024-05-30)

## [1.10.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.15...v1.10.0) (2024-05-30)

### [1.9.15](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.14...v1.9.15) (2024-05-30)


### Refactors

* :bento: use sekai-jp-assets bucket ([6d5d47d](https://github.com/Sekai-World/sekai-viewer/commits/6d5d47de9ea58a225cbd04ad26faa6449324bdfa))

### [1.9.14](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.13...v1.9.14) (2024-04-24)


### Refactors

* :zap: better filtering for card and music lists ([4392c6a](https://github.com/Sekai-World/sekai-viewer/commits/4392c6a3911f27173743e648b781b74ff7ec3a0a))
* :zap: better isReady handling ([844f159](https://github.com/Sekai-World/sekai-viewer/commits/844f159b1b6884ff06b9553626296ebfe9b240d5))

### [1.9.13](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.12...v1.9.13) (2024-04-22)


### Bug Fixes

* :sparkles: event prediction ([23f6d17](https://github.com/Sekai-World/sekai-viewer/commits/23f6d17a56a3eeb9ae09390b2f55fb34a9caa8ac))


### Refactors

* :hammer: proxy current event api in development ([eac0f20](https://github.com/Sekai-World/sekai-viewer/commits/eac0f203634087280ffc4d683e1bc24cd775a1a9))

### [1.9.12](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.11...v1.9.12) (2024-04-20)


### Bug Fixes

* **card:** :bug: blank screen when clicking traimed image ([41f52a8](https://github.com/Sekai-World/sekai-viewer/commits/41f52a889e6018e350f8b587ceb96702217b80a3))


### Refactors

* :lipstick: card filter use icons only for units, charas and attrs ([e8a33aa](https://github.com/Sekai-World/sekai-viewer/commits/e8a33aa749c03337b034caf4301b1df17fbf359e))
* **music:** :fire: remove warning text on music detail page ([d98de3c](https://github.com/Sekai-World/sekai-viewer/commits/d98de3c902af91ed0ae61c822989dbbdfacaf7c9))
* **music:** :lipstick: filter style change like card list ([55a5600](https://github.com/Sekai-World/sekai-viewer/commits/55a5600774f3f8b21c45dbadd44bb28d2354815e))

### [1.9.11](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.10...v1.9.11) (2024-04-14)


### Bug Fixes

* **live2d:** :bug: black model motion path ([d1cba45](https://github.com/Sekai-World/sekai-viewer/commits/d1cba45bfd2fc2f570208eefd25fa9de3d7de847))

### [1.9.10](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.9...v1.9.10) (2024-04-06)


### Features

* :lipstick: always scroll to page top after route change ([a401c72](https://github.com/Sekai-World/sekai-viewer/commits/a401c72eb7db59329a4c7bd811eff9709ba6bcee))
* **music:** original music video link ([627432d](https://github.com/Sekai-World/sekai-viewer/commits/627432d44814e5dc603bf8a2b37973ed082c92a6))


### Bug Fixes

* do not verify asset url unless necessary ([e81e944](https://github.com/Sekai-World/sekai-viewer/commits/e81e944c7fd16255196c84cabbe3715463890cef))

### [1.9.9](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.8...v1.9.9) (2024-04-04)


### Bug Fixes

* :bug: v2 models motion path was incorrect ([c791c2a](https://github.com/Sekai-World/sekai-viewer/commits/c791c2af66f6297c949608e620133515abaf922e))

### [1.9.8](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.7...v1.9.8) (2024-04-03)


### Features

* hide trim image tabs if no trim images available ([71cf095](https://github.com/Sekai-World/sekai-viewer/commits/71cf095aa24b81e08b225923d5cff2da7059781c))
* only return resource path if it exists ([eb44ffc](https://github.com/Sekai-World/sekai-viewer/commits/eb44ffcd9e7eed9dc7fc5826f0c2626111d064bd))


### Bug Fixes

* **live2d:** motion path for sanrio models ([3c703ca](https://github.com/Sekai-World/sekai-viewer/commits/3c703ca4439e68f5c7203c7ee9fc9ae73d0e135d))

### [1.9.7](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.6...v1.9.7) (2024-03-24)


### Bug Fixes

* await for msw to start ([618561a](https://github.com/Sekai-World/sekai-viewer/commits/618561a8d5cf0473b31016f0977736792d07d388))
* en profile definition ([374e34f](https://github.com/Sekai-World/sekai-viewer/commits/374e34fcb93a2cb449844f3d8ce702213c258223))


### Refactors

* :arrow_up: msw migration to v2 ([d878701](https://github.com/Sekai-World/sekai-viewer/commits/d8787019fbd1e2c1a28f53c549f286ab4bc0187d))
* minor changes ([43ca9b7](https://github.com/Sekai-World/sekai-viewer/commits/43ca9b7c70b8c87eb3d1f1a3c735d8f6ec35e071))

### [1.9.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.5...v1.9.6) (2024-03-09)

### [1.9.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.4...v1.9.5) (2024-03-09)


### Bug Fixes

* :bug: service worker cache only status between 0 and 200 ([f491155](https://github.com/Sekai-World/sekai-viewer/commits/f4911553bd711d6917030bc87662388050fe999d))
* en and kr exclusive song music path ([7c8ab3d](https://github.com/Sekai-World/sekai-viewer/commits/7c8ab3d810921f2d3c6d9dfb902a1ed34ac23415))


### Refactors

* :arrow_up: update msw ([a93f419](https://github.com/Sekai-World/sekai-viewer/commits/a93f419159cbea7535f6a6b40251d3d0e9e35a4f))
* :recycle: card and music list default sorting, card max param calc for tc and kr ([f15c2a2](https://github.com/Sekai-World/sekai-viewer/commits/f15c2a2a5193cdd138ee5506e91ce3c7ffa47c97))

### [1.9.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.3...v1.9.4) (2024-01-28)


### Bug Fixes

* ignore custom profile ([96f20ce](https://github.com/Sekai-World/sekai-viewer/commits/96f20cefa4b1313e10d0d5b21c6771b2428a29c5))
* missing key warning ([05bc4d9](https://github.com/Sekai-World/sekai-viewer/commits/05bc4d9ae920c4202594c27f749f9cf001d4df81))

### [1.9.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.2...v1.9.3) (2024-01-23)


### Features

* **storyreader:** :sparkles: event story outline ([3f41a2d](https://github.com/Sekai-World/sekai-viewer/commits/3f41a2d4d8a694ee6825aab90044598ad90ab57b))


### Bug Fixes

* **live2d:** :bug: v2 model motion path ([21f6097](https://github.com/Sekai-World/sekai-viewer/commits/21f60977b47e5bfe23069039d4479fa73e0d76f7))

### [1.9.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.1...v1.9.2) (2024-01-22)

### [1.9.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.9.0...v1.9.1) (2024-01-22)

## [1.9.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.8.4...v1.9.0) (2024-01-20)


### Bug Fixes

* :bug: card rarity ([8b4149d](https://github.com/Sekai-World/sekai-viewer/commits/8b4149d71184e544c1f0b3fedd8db66714512a82))
* :bug: music meta no level and no tap count ([8b7ecd1](https://github.com/Sekai-World/sekai-viewer/commits/8b7ecd1594097d2c621d7034c4e1d6be38415c92))
* align icons in gacha behaviors ([f7abd37](https://github.com/Sekai-World/sekai-viewer/commits/f7abd37b489dd4f8d1d80b5c6f033ed201e47c94))
* check if gacha actually has pickups ([cf9b28e](https://github.com/Sekai-World/sekai-viewer/commits/cf9b28ee8f39d745cafbe4e02f16846f1b8ddf1f))
* gacha ticket icon and colorful pass free pulls ([2fbce4e](https://github.com/Sekai-World/sekai-viewer/commits/2fbce4ef7f6343b4fccae6cb0a335f852dff5f66))
* increment jewel count when pulling with paid jewels ([734bef3](https://github.com/Sekai-World/sekai-viewer/commits/734bef38959f5b4647cc77e6cf459b71e7a56ba1))
* some live2d model motion base not found ([74a23fe](https://github.com/Sekai-World/sekai-viewer/commits/74a23feb0c4b2a50c16d6b2df932bb38b2e36712))
* some resource icons not showing on tw/kr ([18c3376](https://github.com/Sekai-World/sekai-viewer/commits/18c337687a16ac8d6221e33bebdcbe25d4b4497d))
* streaming live page crash on jp ([5d87f66](https://github.com/Sekai-World/sekai-viewer/commits/5d87f66c5b4be6fcf118408146cb68c5b99dc8ce))
* virtual live music setlists not showing on tw/kr ([128495e](https://github.com/Sekai-World/sekai-viewer/commits/128495e8a5bb1ed36db575692091b00752894791))
* world link no attr bonus ([c7be441](https://github.com/Sekai-World/sekai-viewer/commits/c7be441f79695173b40ebaf3420b741c16209eb3))


### Refactors

* remove old rarity checks and fix bday gacha guaranteed rates ([3dc5fed](https://github.com/Sekai-World/sekai-viewer/commits/3dc5fed9ed77506d2d87571fc3e58b2ea26c65a8))
* use `array.map` instead ([c1ae461](https://github.com/Sekai-World/sekai-viewer/commits/c1ae461492b9088e63dc6cc20c4576aef107078f))

### [1.8.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.8.3...v1.8.4) (2023-11-04)


### Bug Fixes

* :bug: more problem about sekai profile ([aa0a68d](https://github.com/Sekai-World/sekai-viewer/commits/aa0a68de95ef123b19300fcab66d1c93b0c3c1be))

### [1.8.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.8.2...v1.8.3) (2023-11-04)


### Bug Fixes

* :bug: old profile have no "totalPower" field ([229ef01](https://github.com/Sekai-World/sekai-viewer/commits/229ef012ec9fba6a68200dafd0c4c4eaf3599716))

### [1.8.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.8.1...v1.8.2) (2023-11-04)


### Bug Fixes

* :bug: user profile cannot correctly display ([c1a50a5](https://github.com/Sekai-World/sekai-viewer/commits/c1a50a5e58c83f05dff81f7d8dab966dd3e99a33))

### [1.8.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.8.0...v1.8.1) (2023-10-29)

## [1.8.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.7.6...v1.8.0) (2023-10-29)


### Bug Fixes

* :bug: music list crash if sorting by play levels ([a818545](https://github.com/Sekai-World/sekai-viewer/commits/a81854546d2f62081927534e2c350ff95adb5031)), closes [#451](https://github.com/Sekai-World/sekai-viewer/issues/451)
* :lipstick: weird font fallback ([a0c6106](https://github.com/Sekai-World/sekai-viewer/commits/a0c6106d82b55ff5aa946adc3a8a4170d142f8cb)), closes [#427](https://github.com/Sekai-World/sekai-viewer/issues/427)
* 🐛 card details not showing for tw, kr region ([296329c](https://github.com/Sekai-World/sekai-viewer/commits/296329c75a3e966da5c57d500c7993db1891e2e0))
* 🐛 music difficulty background colors ([01307d5](https://github.com/Sekai-World/sekai-viewer/commits/01307d5a683fc4d30e4928e092a03c5869a7456e))
* 🐛 sorting cards by id and release date for tw, kr region ([684b840](https://github.com/Sekai-World/sekai-viewer/commits/684b840406d7ef4cac1ddd10a553cac7cdf447f7))
* 🐛 spoiler tags and event boost cards display ([9dc2377](https://github.com/Sekai-World/sekai-viewer/commits/9dc2377b1abf3d276b09b083a82b716f9e6229d8))

### [1.7.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.7.5...v1.7.6) (2023-10-28)


### Bug Fixes

* :bug: card list not loading for tw and kr server ([adf8f2c](https://github.com/Sekai-World/sekai-viewer/commits/adf8f2cbbc9091c06d7ea3d8635801570cba57ce)), closes [#450](https://github.com/Sekai-World/sekai-viewer/issues/450)
* :bug: live2d v2 model motions ([edc1377](https://github.com/Sekai-World/sekai-viewer/commits/edc137732f9a3c6285dadbd4f4d3dc98ccd1de11)), closes [#453](https://github.com/Sekai-World/sekai-viewer/issues/453)
* :bug: music category display ([fe1a626](https://github.com/Sekai-World/sekai-viewer/commits/fe1a626e881dc93bd9b06d45a70a8783a35cfa3a)), closes [#448](https://github.com/Sekai-World/sekai-viewer/issues/448)

### [1.7.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.7.4...v1.7.5) (2023-10-24)


### Bug Fixes

* :bug: asset-viewer cannot list root folder ([79eb3f1](https://github.com/Sekai-World/sekai-viewer/commits/79eb3f197af4912083f24bf9c8439e278c80cf06))

### [1.7.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.7.3...v1.7.4) (2023-07-08)


### Bug Fixes

* :bug: virtual live detail crash ([e65fba9](https://github.com/Sekai-World/sekai-viewer/commits/e65fba96c41713009cfa4456aca9e3f53363f91a))

### [1.7.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.7.2...v1.7.3) (2023-05-21)


### Features

* :sparkles: process compact json data ([3818ae9](https://github.com/Sekai-World/sekai-viewer/commits/3818ae9be0518af20aa32b40da62cd6793a6a005))


### Bug Fixes

* :bug: event honor badge display for TW and KR servers ([df0b862](https://github.com/Sekai-World/sekai-viewer/commits/df0b862b657ba8f51b14472a0942002725669a54))


### Refactors

* :clown_face: passthrough current-event request ([dee2e8d](https://github.com/Sekai-World/sekai-viewer/commits/dee2e8d0a732e0be195416960d59971fb577e65b))

### [1.7.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.7.1...v1.7.2) (2023-05-18)


### Features

* :clown_face: mock sekai profile update ([2dab17c](https://github.com/Sekai-World/sekai-viewer/commits/2dab17c043660b5f86e04af96d0384eed4c80825))
* :globe_with_meridians: add ua and kr comics ([1187b64](https://github.com/Sekai-World/sekai-viewer/commits/1187b64be0ddf8630ac0a07b5b74b42c7959f45a))
* :lipstick: add "do filter" button to music list page ([a5a9f65](https://github.com/Sekai-World/sekai-viewer/commits/a5a9f65c7c28c90449d063cc681b254f037f8d1d))
* :sparkles: 2nd anniversary countdown ([a3bee9f](https://github.com/Sekai-World/sekai-viewer/commits/a3bee9fde4b242500f3e779bfd298778a5440a8b))
* **event:** add max bonus to bonus card list ([c1972e4](https://github.com/Sekai-World/sekai-viewer/commits/c1972e4cb96e93181ebf6bf4df4eb2eb7cf62924))
* **event:** card bonus detail list ([a8a3b22](https://github.com/Sekai-World/sekai-viewer/commits/a8a3b228fb29d24817cebcc74ff091ec7069ba3b))


### Bug Fixes

* :bug: add kr unit logos resource url ([c6e5a94](https://github.com/Sekai-World/sekai-viewer/commits/c6e5a94f355221d0749430de57b5c64d55b154f9))
* :bug: add node-modules-polyfill to fix cron problem ([dbd0ed9](https://github.com/Sekai-World/sekai-viewer/commits/dbd0ed98741e807e222065dae944da42f111dbad))
* :bug: close deletion confirm dialog before execution ([98727bc](https://github.com/Sekai-World/sekai-viewer/commits/98727bcf361c15ad1ab3b1f46b5da4049ba0dacd))
* :bug: episode fields deleted by nuverse ([2372d08](https://github.com/Sekai-World/sekai-viewer/commits/2372d087d8502521674450d7d56880f42d6c9c5b))
* :bug: eventMusics only exist in JP server ([e41b575](https://github.com/Sekai-World/sekai-viewer/commits/e41b575f59071eff69142a89a28f359b47ccc419))
* :bug: filter operation upon opening card list page ([5e55157](https://github.com/Sekai-World/sekai-viewer/commits/5e55157c10e8448d7bac85ab0cc58de83d8a54a0))
* :bug: memoize styled components or make them const ([3c8fae3](https://github.com/Sekai-World/sekai-viewer/commits/3c8fae348c694f22e1bd2c2818cb26b34b8689ee))
* :bug: nuverse deleted fields in cardEpisodes ([fbffe33](https://github.com/Sekai-World/sekai-viewer/commits/fbffe3340b8b6dbfc95230d41879b1d080a2f771))
* :bug: rank match honor asset url ([867ae8c](https://github.com/Sekai-World/sekai-viewer/commits/867ae8c572807812de6cf919516038957dedabe8))
* :bug: sekai profile update error ([75b96aa](https://github.com/Sekai-World/sekai-viewer/commits/75b96aa2c9d89d302f4e9b12439858be36545782))
* :bug: sekai profile userid now string ([c47e339](https://github.com/Sekai-World/sekai-viewer/commits/c47e33979aed51f56ac73cbb6c9d75bf2231ede0))
* :bug: story reader respect spoiler switch and region setting ([f2ca4ff](https://github.com/Sekai-World/sekai-viewer/commits/f2ca4ffcad707acf7eda31795e205468bc5620fc))
* :bug: tw and kr server sekai profile not matching ([9518457](https://github.com/Sekai-World/sekai-viewer/commits/95184570415f2fcd69616277a19587f87f917d51))
* :bug: user config in jp sekai profile ([31f3e6b](https://github.com/Sekai-World/sekai-viewer/commits/31f3e6bddc4f2e3a55137b07b933aeed71603c8f))
* :bug: wrongly trimmed short version of songs ([daabecd](https://github.com/Sekai-World/sekai-viewer/commits/daabecd49b39ef609b1c463bc06e6b0105a86976))
* :lipstick: card image position set to relative ([2d6f3d1](https://github.com/Sekai-World/sekai-viewer/commits/2d6f3d189e4ce00c95408dc59a2b12dba02f635c))
* :lipstick: card image style not working ([b3c4212](https://github.com/Sekai-World/sekai-viewer/commits/b3c421288e98fdb7ba39a69c82be7aa9404ec837))
* :lipstick: degree image style not working ([05b856f](https://github.com/Sekai-World/sekai-viewer/commits/05b856ffac554cb54ddb00e1bb4295f3a2a51cf2))
* 403 and CORS problem for Mainland China developer ([f0d4d1d](https://github.com/Sekai-World/sekai-viewer/commits/f0d4d1dda291333219481f768722151b34d97271))
* add missing region param to one useStrapi usage ([b6db0e2](https://github.com/Sekai-World/sekai-viewer/commits/b6db0e2b0f664ca0881758447ecfb89f86d4b048))
* add null checks for event tracker ([9d38e2c](https://github.com/Sekai-World/sekai-viewer/commits/9d38e2cce18ba75648b1270d72701f09f41e9675))
* enhance skill ([3245a42](https://github.com/Sekai-World/sekai-viewer/commits/3245a42284c7a576e6b3eca780c0024ca4e3a598))
* **event:** more bonus characters after first anniversary ([56b7919](https://github.com/Sekai-World/sekai-viewer/commits/56b7919b64f9efd35c20589c356940b851d0b458))
* jp server music note count field rename ([73b1228](https://github.com/Sekai-World/sekai-viewer/commits/73b12280946ee88244368c478809c3f752022ab3))


### Refactors

* :bento: update anniversary banner to 2nd ([3d6e5de](https://github.com/Sekai-World/sekai-viewer/commits/3d6e5decd581537bd18faceac4dfebc6407ff477))
* :fire: remove china mainland urls ([7a9dba2](https://github.com/Sekai-World/sekai-viewer/commits/7a9dba22ff0ad89444f6e247afa50e0ca6d7e0b8))
* :fire: remove unused console log ([69471f8](https://github.com/Sekai-World/sekai-viewer/commits/69471f85c33269e5c6b3b58d61a7eab023a42e86))
* :fire: unnecessary filter option on stamp list page ([c3fce73](https://github.com/Sekai-World/sekai-viewer/commits/c3fce730d8e4723a3989fd5c0747d02d634171b5))
* :fire: unused console log ([7e3a479](https://github.com/Sekai-World/sekai-viewer/commits/7e3a4799e7af80dba1ca3381d25c436e9c870cae))
* :lipstick: add missing margin bottom to list ([7286539](https://github.com/Sekai-World/sekai-viewer/commits/728653980aeab2b59743e5bd6d7684da075ac39d))
* :lipstick: auto collapse filter after applying ([22e0f25](https://github.com/Sekai-World/sekai-viewer/commits/22e0f25e84eee719e4d89ad5a8cf3861fe87f826))
* :lipstick: unify all toggle button style ([f1dc202](https://github.com/Sekai-World/sekai-viewer/commits/f1dc202746d062f8138d3364f8a22ed69a0598bc))
* :recycle: convert common styles to styled components ([c2cda9d](https://github.com/Sekai-World/sekai-viewer/commits/c2cda9dd8f84bc00f41c521121da07273cd7c36f))
* :recycle: filterOpen -> filterOpened ([0ad1850](https://github.com/Sekai-World/sekai-viewer/commits/0ad1850eba92b5defd455618ddce1440ea98d32f))
* :recycle: remove all usage of @mui/styles and use styled components and sx props ([073025a](https://github.com/Sekai-World/sekai-viewer/commits/073025a4f9867c2e08a3157a8aa1b9c90ba3ad99))

### [1.7.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.7.0...v1.7.1) (2023-01-14)


### Bug Fixes

* :bug: remove country detection in settings page ([5fc211f](https://github.com/Sekai-World/sekai-viewer/commits/5fc211f1967ab48d24fe34366df206e161e9da80))

## [1.7.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.11...v1.7.0) (2023-01-14)


### Bug Fixes

* :bug: sekai profile userid now string ([163a23d](https://github.com/Sekai-World/sekai-viewer/commits/163a23d2d91e8600ebf66ecd7864ac172aa78221))


### Refactors

* :fire: remove china mainland urls ([d4d3a90](https://github.com/Sekai-World/sekai-viewer/commits/d4d3a90c338f667d44dff216f3495d41c9767329))

### [1.6.11](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.10...v1.6.11) (2023-01-13)


### Bug Fixes

* :bug: user config in jp sekai profile ([f3d7728](https://github.com/Sekai-World/sekai-viewer/commits/f3d7728911d2f4baa0ac19d0962cb1c43fa76e29))

### [1.6.10](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.9...v1.6.10) (2022-12-21)


### Bug Fixes

* jp server music note count field rename ([a08398d](https://github.com/Sekai-World/sekai-viewer/commits/a08398d772db2f6715ce0e6369dd13e5a07777c2))

### [1.6.9](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.8...v1.6.9) (2022-12-18)


### Bug Fixes

* :bug: sekai profile update error ([e0174cd](https://github.com/Sekai-World/sekai-viewer/commits/e0174cd2d4bad4fc4cc9bfec0f2c8023e88554f5))
* add missing region param to one useStrapi usage ([544bd37](https://github.com/Sekai-World/sekai-viewer/commits/544bd3725562b78171753e834ec6f966970d568f))

### [1.6.8](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.7...v1.6.8) (2022-11-01)


### Bug Fixes

* :bug: tw and kr server sekai profile not matching ([19badb6](https://github.com/Sekai-World/sekai-viewer/commits/19badb64c27d01e57dd38734a7944b321992c93e))
* enhance skill ([b171341](https://github.com/Sekai-World/sekai-viewer/commits/b17134143f21035799c17d49514b979638a2727b))

### [1.6.7](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.6...v1.6.7) (2022-10-24)


### Features

* **event:** add max bonus to bonus card list ([0fd596a](https://github.com/Sekai-World/sekai-viewer/commits/0fd596a67ca3027d7da2dd798e7210acb3e1f666))
* **event:** card bonus detail list ([d184acf](https://github.com/Sekai-World/sekai-viewer/commits/d184acfda0e119ea83963601c860527a21794aa0))


### Bug Fixes

* :bug: wrongly trimmed short version of songs ([1ec2456](https://github.com/Sekai-World/sekai-viewer/commits/1ec245645f4c60d63b5cff3b876cbee1ac73e1f8))
* 403 and CORS problem for Mainland China developer ([2ad3b63](https://github.com/Sekai-World/sekai-viewer/commits/2ad3b63438dc3a1b8c23872e7e34039b0f383d20))
* **event:** more bonus characters after first anniversary ([061fd2a](https://github.com/Sekai-World/sekai-viewer/commits/061fd2a601838a69d8766d094b8131b2d07d36a2))

### [1.6.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.5...v1.6.6) (2022-10-10)


### Bug Fixes

* :bug: add kr unit logos resource url ([1d751e2](https://github.com/Sekai-World/sekai-viewer/commits/1d751e2f26b2ac35c09470e32720d9a2680a8cfe))
* :bug: story reader respect spoiler switch and region setting ([3bf570d](https://github.com/Sekai-World/sekai-viewer/commits/3bf570d766e27bee52b641376de297ee90e5ccb7))

### [1.6.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.4...v1.6.5) (2022-10-04)


### Features

* :lipstick: add "do filter" button to music list page ([73139f6](https://github.com/Sekai-World/sekai-viewer/commits/73139f600d3ad8c0361dd01fb33b7f9a74a2bc8c))


### Bug Fixes

* :bug: filter operation upon opening card list page ([af38e0e](https://github.com/Sekai-World/sekai-viewer/commits/af38e0ee5805a6eba6daae233fcd9714fb765b79))


### Refactors

* :fire: unnecessary filter option on stamp list page ([dd23d9b](https://github.com/Sekai-World/sekai-viewer/commits/dd23d9bf78516b2d3e5d7306e64a647f2e419f76))
* :fire: unused console log ([632abf3](https://github.com/Sekai-World/sekai-viewer/commits/632abf3f0863bb21fcf6097435141c930bddd48a))
* :recycle: filterOpen -> filterOpened ([2c2db70](https://github.com/Sekai-World/sekai-viewer/commits/2c2db707e5f338cebc722d3b92947d28f25a4f84))

### [1.6.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.3...v1.6.4) (2022-09-29)


### Bug Fixes

* :lipstick: card image position set to relative ([d05cc2b](https://github.com/Sekai-World/sekai-viewer/commits/d05cc2b75b85bb625c87861586db51569b24909b))


### Refactors

* :lipstick: add missing margin bottom to list ([529790c](https://github.com/Sekai-World/sekai-viewer/commits/529790c8b00d30976b6e1283296c71a99ec4cafb))
* :lipstick: unify all toggle button style ([a2bc804](https://github.com/Sekai-World/sekai-viewer/commits/a2bc8044275c17adee4af68ea04e4ed1ce692875))

### [1.6.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.2...v1.6.3) (2022-09-29)


### Refactors

* :bento: update anniversary banner to 2nd ([df89b23](https://github.com/Sekai-World/sekai-viewer/commits/df89b23136afb21ee36345bed6e1f900371a1d9a))
* :lipstick: auto collapse filter after applying ([f4a64cd](https://github.com/Sekai-World/sekai-viewer/commits/f4a64cd94a2579ddee7bf35d3727431b3501d7f9))

### [1.6.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.1...v1.6.2) (2022-09-28)


### Bug Fixes

* :bug: memoize styled components or make them const ([7e376db](https://github.com/Sekai-World/sekai-viewer/commits/7e376dba393e1ae97b31cc39fc1ab950f3af606c))


### Refactors

* :fire: remove unused console log ([48c4d4f](https://github.com/Sekai-World/sekai-viewer/commits/48c4d4fafa34a0c6d4c871da6aab63d32a580923))

### [1.6.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.6.0...v1.6.1) (2022-09-27)


### Features

* :globe_with_meridians: add ua and kr comics ([95a1c46](https://github.com/Sekai-World/sekai-viewer/commits/95a1c461847f9ea8a19c808645f502402bf422f3))


### Bug Fixes

* :lipstick: card image style not working ([324f698](https://github.com/Sekai-World/sekai-viewer/commits/324f698fe895698f1f6572e967a2d370ce32c70e))
* :lipstick: degree image style not working ([99da7a7](https://github.com/Sekai-World/sekai-viewer/commits/99da7a79b54063e1936ab33640a4190d2b94bd65))

## [1.6.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.5.3...v1.6.0) (2022-09-27)


### Refactors

* :recycle: convert common styles to styled components ([1929516](https://github.com/Sekai-World/sekai-viewer/commits/19295168433872b6ec1f25ccb5e8f66a37847698))
* :recycle: remove all usage of @mui/styles and use styled components and sx props ([1a8c51e](https://github.com/Sekai-World/sekai-viewer/commits/1a8c51eb0c20eae13c37d09bc2849c1a69ff64d6))

### [1.5.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.5.2...v1.5.3) (2022-09-23)


### Bug Fixes

* :bug: eventMusics only exist in JP server ([e86cc84](https://github.com/Sekai-World/sekai-viewer/commits/e86cc8458b383bea6799ea8c2d4b705bd514ff5d))

### [1.5.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.5.1...v1.5.2) (2022-09-22)


### Bug Fixes

* :bug: episode fields deleted by nuverse ([12aab08](https://github.com/Sekai-World/sekai-viewer/commits/12aab08a188b523e75b23a1ef71abbe7d9818afd))
* :bug: nuverse deleted fields in cardEpisodes ([7836f90](https://github.com/Sekai-World/sekai-viewer/commits/7836f9074396139c0c51ac1bc7d41ebb23facc49))
* :bug: rank match honor asset url ([1883fca](https://github.com/Sekai-World/sekai-viewer/commits/1883fca275aaf7f0e28b3e80fa757aa14b552f88))

### [1.5.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.5.0...v1.5.1) (2022-09-21)


### Features

* :bento: add sub degree frame ([d067bc5](https://github.com/Sekai-World/sekai-viewer/commits/d067bc5b77a982ad81e81dac88be6cae59fed229))
* :sparkles: 2nd anniversary countdown ([66c721c](https://github.com/Sekai-World/sekai-viewer/commits/66c721c490537c72ad6e05535c95b81005581eb2))
* :sparkles: bonds honor badge ([f09e488](https://github.com/Sekai-World/sekai-viewer/commits/f09e48830a51eb8cd6f9a257d8f6cd4e5a4ab47f))
* **event:** :sparkles: show new user profile honors ([0a4e822](https://github.com/Sekai-World/sekai-viewer/commits/0a4e822651971fb054f23e76c738988d0da9f411))
* **sekai-viewer:** withlist entry point ([58b3723](https://github.com/Sekai-World/sekai-viewer/commits/58b37234d9789da89f103dd44860773a7abc9f4e))
* **story:** :sparkles: add special stories to story reader ([511fc3b](https://github.com/Sekai-World/sekai-viewer/commits/511fc3b4d72c77cfacf4bcb28a4db8f9b8c86de9))


### Bug Fixes

* :bug: add node-modules-polyfill to fix cron problem ([b53a82a](https://github.com/Sekai-World/sekai-viewer/commits/b53a82a838c898b2715db6dce1b1249adcf69b24))
* :bug: further fixing sekai data type annotation ([ebfcf37](https://github.com/Sekai-World/sekai-viewer/commits/ebfcf37fe4e92bdc56013d39b9a06db195343f4a))
* :lipstick: degree sub style improvements ([7949b09](https://github.com/Sekai-World/sekai-viewer/commits/7949b095010e9e9c4003fc4f8ca7b29954aa77c6))
* **card:** :bug: correctly process card detail without side stories ([5fc4e7f](https://github.com/Sekai-World/sekai-viewer/commits/5fc4e7ffa1e68950f0bbf279d2cac94b1a56f065))
* **card:** :bug: really fix the empty list problem ([7c4fe58](https://github.com/Sekai-World/sekai-viewer/commits/7c4fe581118379efbd1cd2dd77be9b10aa9d9a00))
* collab area icons and voice ([3cd3988](https://github.com/Sekai-World/sekai-viewer/commits/3cd39888e174f540e1c12f6d2126112f627b834c))
* **event:** :bug: en server event tracker shows jp result after event ends ([98e2b2e](https://github.com/Sekai-World/sekai-viewer/commits/98e2b2e80160b00a2dffa3c5b465c527a2dd1496))
* **gacha:** :bug: gacha detail card rate becomes NaN ([fba9e6a](https://github.com/Sekai-World/sekai-viewer/commits/fba9e6af351aea1c4de88d29f5d39a446ce8aeb5))
* **home:** :bug: game news spoiler filter, en url fix ([ca40eb8](https://github.com/Sekai-World/sekai-viewer/commits/ca40eb8fb31dbea0b40d72e8f0d6212c40c9d0c6))
* **home:** :bug: service worker reload prompt wrong location ([6bcb76d](https://github.com/Sekai-World/sekai-viewer/commits/6bcb76d7b215456e420630d5a4900fb7f4e1954e))
* **live2d:** :bug: jp clb model motion base url ([255ed13](https://github.com/Sekai-World/sekai-viewer/commits/255ed13e94d1c6cb5d86ee96ce97ebb82523b7b6))
* **live2d:** :lipstick: fit wide screen mobile device ([17f0c12](https://github.com/Sekai-World/sekai-viewer/commits/17f0c120005b92d986c07fce346686be0b0bfc80))
* **story:** :bug: special story wrong voice path ([cc1dcb1](https://github.com/Sekai-World/sekai-viewer/commits/cc1dcb11034ea43234fff7b3926f8cf2e17dd7c9))
* **tools:** :bug: event pt calc wrong bonus rate ([63daf95](https://github.com/Sekai-World/sekai-viewer/commits/63daf95488bdba9ff5cdab532350a49b727574a2)), closes [#353](https://github.com/Sekai-World/sekai-viewer/issues/353)
* **user:** :lipstick: bonds degree badge reverse ([8cb3942](https://github.com/Sekai-World/sekai-viewer/commits/8cb3942e25f04401141d054d22b5612ee4939132))
* **user:** sekai profile cards teams story unlock type fix ([12c42e2](https://github.com/Sekai-World/sekai-viewer/commits/12c42e2d963e1db79d0854a2c13523c7db3b843a))


### Refactors

* :lipstick: normal degree image width ([f9a386d](https://github.com/Sekai-World/sekai-viewer/commits/f9a386d10709e5aac260ba76b2815bbe5e621e73))
* :recycle: remove redundant codes ([d8af11d](https://github.com/Sekai-World/sekai-viewer/commits/d8af11d07dcddf8bc1de3a7e9227f95b0342d5d3))
* **event:** :lipstick: make event tracker table looks better ([3fcd8f1](https://github.com/Sekai-World/sekai-viewer/commits/3fcd8f15f1e4eeb816d7f6a3bc616329b6c212bb))
* **gacha:** filter not really opened en gachas ([2507188](https://github.com/Sekai-World/sekai-viewer/commits/2507188285630190ca8bcf93592cf1f4c3aa48ff))
* **live2d:** :lipstick: live2d toolbar and display area padding remove ([77f3434](https://github.com/Sekai-World/sekai-viewer/commits/77f3434f772e013e08735692b3627d5d224dd37b))
* open external link in new instead of current page ([e9492bd](https://github.com/Sekai-World/sekai-viewer/commits/e9492bdadbd817c35572547139b1d2bfd131587e))
* **user:** :ambulance: sekai new profile structure (user honors) ([6e1c230](https://github.com/Sekai-World/sekai-viewer/commits/6e1c230d2895570e73f70fa30efb9fa8450609c1))
* **user:** :lipstick: style fix ([3a08e01](https://github.com/Sekai-World/sekai-viewer/commits/3a08e0160aa6b66117a33ebfa35756d7460d70c6))

## [1.5.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.4.3...v1.5.0) (2022-09-21)


### Features

* :clown_face: add mock handlers for user system ([56c4fc0](https://github.com/Sekai-World/sekai-viewer/commits/56c4fc05f59805e501bd62ce75e8302a3dbe6ac2))
* :clown_face: add mock handlers for user system ([8a08d74](https://github.com/Sekai-World/sekai-viewer/commits/8a08d743472e9f8eb9e107f97ba96b71aa5c3408))
* :clown_face: add msw to browser env ([0453602](https://github.com/Sekai-World/sekai-viewer/commits/04536025018f842e8bf3f518d87272b859c4b121))
* :clown_face: add msw to browser env ([1e26864](https://github.com/Sekai-World/sekai-viewer/commits/1e26864887c8796c382023653e85ce56dbf5a120))
* :sparkles: add newly written song for events ([23ce998](https://github.com/Sekai-World/sekai-viewer/commits/23ce9988efef18c1c004521e2f681c4554dc0e2b))
* :sparkles: add newly written song for events ([c0c9ffe](https://github.com/Sekai-World/sekai-viewer/commits/c0c9ffe7bd536e1a115fc6edd1c4bf2726d4ed30))
* :sparkles: add sorting to honor and mission list ([4dc4aed](https://github.com/Sekai-World/sekai-viewer/commits/4dc4aed4ca7e00e402a48997ab0ad1e7702c931e))
* :sparkles: add sorting to honor and mission list ([172a545](https://github.com/Sekai-World/sekai-viewer/commits/172a54506e6042e6d7518b2a3b98cc35dea029f8))


### Bug Fixes

* :lipstick: avoid character rank ellipsis ([c812190](https://github.com/Sekai-World/sekai-viewer/commits/c812190c7feeb30c63437a1345a8ff4381394158))
* :lipstick: avoid character rank ellipsis ([83ca262](https://github.com/Sekai-World/sekai-viewer/commits/83ca2623b0beeb4b6f33b2be74c36c2010934570))
* :lipstick: not centered material icon and quantity text ([8ff8efa](https://github.com/Sekai-World/sekai-viewer/commits/8ff8efa1b864df783408824e300e71e0723a7db2))
* :lipstick: not centered material icon and quantity text ([e9be4d5](https://github.com/Sekai-World/sekai-viewer/commits/e9be4d5e907614d0dc8db06b0ea2f7059eada8d8))
* **score:** multiroom player skill calculation ([3efca62](https://github.com/Sekai-World/sekai-viewer/commits/3efca62a8fdf544ee09cefc4471bc0463bfce608))


### Refactors

* :clown_face: add msw to react ([ba65860](https://github.com/Sekai-World/sekai-viewer/commits/ba65860329737a70c79869eb969bb5f4a40f489f))
* :clown_face: add msw to react ([8ba6ff0](https://github.com/Sekai-World/sekai-viewer/commits/8ba6ff014702cb23e6f1838bb8f6c0eb61ff0665))
* :truck: use storage.sekai.best instead of minio.dnaroma.eu ([cf60f6c](https://github.com/Sekai-World/sekai-viewer/commits/cf60f6cb592da59e67bf404c990c3bf35b28f98a))

### [1.4.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.4.2...v1.4.3) (2022-08-17)

### [1.4.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.4.1...v1.4.2) (2022-08-16)


### Refactors

* :truck: use storage.sekai.best instead of minio.dnaroma.eu ([bb35e96](https://github.com/Sekai-World/sekai-viewer/commits/bb35e966fefe555a720c9b3a8c58c056286059b6))

### [1.4.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.4.0...v1.4.1) (2022-06-01)


### Features

* **home:** :memo: add disclaimer ([7f2a569](https://github.com/Sekai-World/sekai-viewer/commits/7f2a5694f5a02cb31d81606e37b02a3b0852773f))

## [1.4.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.3.2...v1.4.0) (2022-05-31)


### Features

* add korean server ([474a13a](https://github.com/Sekai-World/sekai-viewer/commits/474a13aa2c0b53a890e922b91ddc6b70def8e28a))
* **gacha:** :sparkles: gacha fetch images from remote list ([d82005a](https://github.com/Sekai-World/sekai-viewer/commits/d82005ab481b13b3ea34c2c62ae45da8c498b38f))


### Bug Fixes

* **card:** :bug: birthday card stats are NaN ([7709d90](https://github.com/Sekai-World/sekai-viewer/commits/7709d901197748949b9f2c4b5bb2fd9a3acbcc8c))


### Refactors

* abandon b2 storage ([db610a7](https://github.com/Sekai-World/sekai-viewer/commits/db610a7659fdeb38d1aadf6e6a01003f35ddfd29))
* change webp-hero implementation ([658d106](https://github.com/Sekai-World/sekai-viewer/commits/658d106b4d085ae0ad1f8ee3276dba1e92ee0737))
* index description change ([818d248](https://github.com/Sekai-World/sekai-viewer/commits/818d2485528f0d35bd36843b16ee1615871b09e5))

### [1.3.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.3.1...v1.3.2) (2022-04-30)


### Bug Fixes

* **tools:** :bug: filter cards modal in team builder may cause unwanted updates ([5e477b1](https://github.com/Sekai-World/sekai-viewer/commits/5e477b13e61d7ba220dd665bec1f27e1d51d3f10))

### [1.3.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.3.0...v1.3.1) (2022-04-30)


### Bug Fixes

* **card:** :bug: check skill before displaying it ([f66ddc9](https://github.com/Sekai-World/sekai-viewer/commits/f66ddc90e932b4a65353d5706c6cb9751bebf54b))

## [1.3.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.12...v1.3.0) (2022-04-30)


### Features

* :sparkles: asset viewer now supports different regions ([13c48b6](https://github.com/Sekai-World/sekai-viewer/commits/13c48b6aa1f846fa6e0a54e1babd015e84726c57))


### Bug Fixes

* **event:** :ambulance: load history data from database ([01ed396](https://github.com/Sekai-World/sekai-viewer/commits/01ed396a0af97b3baa44623a3568a88ea9efc516))
* **event:** :bug: record event data on other servers ([174974e](https://github.com/Sekai-World/sekai-viewer/commits/174974e1ecc2594b9bcd1038f619dd90007bd9f3))


### Refactors

* :recycle: url from env replaced by urls from utilities ([6ffe2de](https://github.com/Sekai-World/sekai-viewer/commits/6ffe2de23e4aed2d06658c4038fec737080f623d))

### [1.2.12](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.11...v1.2.12) (2022-04-11)


### Bug Fixes

* **user:** :bug: removed already existed user cards from filter list, minor bugs fixed ([b8b88c1](https://github.com/Sekai-World/sekai-viewer/commits/b8b88c120f72056e14ef4242d74b1f1a59054a5f))
* **user:** :bug: user card list sort by rarity ([48a74f3](https://github.com/Sekai-World/sekai-viewer/commits/48a74f3747b9137cd462c4b22ca079091c6f97ea))

### [1.2.11](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.10...v1.2.11) (2022-04-05)


### Bug Fixes

* **story:** :bug: failed to show story lines due to missing mob character entries ([49f0f01](https://github.com/Sekai-World/sekai-viewer/commits/49f0f019009c074063d6a34a9ccfa79d00b9c864))

### [1.2.10](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.9...v1.2.10) (2022-04-05)


### Features

* add support for custom font's for each language + Add Thai fonts support ([6b59f5c](https://github.com/Sekai-World/sekai-viewer/commits/6b59f5c317c73937a87b3e514045681d7c47aa4d))


### Bug Fixes

* :bug: useCallback missing deps in sekai user card list ([ecbced3](https://github.com/Sekai-World/sekai-viewer/commits/ecbced3a6d735afac4877f0181c9c876e0283c3d))
* **tools:** :bug: filter card by rarity in jp server ([18e9ca2](https://github.com/Sekai-World/sekai-viewer/commits/18e9ca2db6a4f21d7d46a56910743910bd3c16ee))


### Refactors

* :lipstick: font family order change ([5152cf4](https://github.com/Sekai-World/sekai-viewer/commits/5152cf456d80c6913637a1c27a665ef9c9e49eea))
* :recycle: use china friendly url ([a21dbcb](https://github.com/Sekai-World/sekai-viewer/commits/a21dbcbf52b05bf19ad55b6e8415d2c36cf63125))
* :rotating_light: remove unused codes ([f6d4c68](https://github.com/Sekai-World/sekai-viewer/commits/f6d4c6870fe054394d6bc7b0b655341b9d46e5c1))
* :truck: move comics to separate bucket ([eb33dbd](https://github.com/Sekai-World/sekai-viewer/commits/eb33dbddcd379646187a62b44229013702a6cc96))
* :truck: move fonts to utils ([469ef58](https://github.com/Sekai-World/sekai-viewer/commits/469ef58f3efd55d6b2d0ed9106540bc882212ed6))
* :truck: move music charts to separate bucket ([440e9cc](https://github.com/Sekai-World/sekai-viewer/commits/440e9cc182e3897b3ba77d7040d8620935233434))
* change how the web decides which fonts to use ([5f95af0](https://github.com/Sekai-World/sekai-viewer/commits/5f95af09e8315c5bb35755ef68ed4a6e66eb2131))
* import fonts from font-face instead of <link> ([864cdfb](https://github.com/Sekai-World/sekai-viewer/commits/864cdfbd945e0b0aba103b559e67a8371b132fcc))

### [1.2.9](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.8...v1.2.9) (2022-03-11)


### Features

* :sparkles: add costume 3d thumbnails ([cf0d7cf](https://github.com/Sekai-World/sekai-viewer/commits/cf0d7cf4010a8db4724e6a89fe70f63fb315fba2))
* **card:** :sparkles: add master rank and rewards to card detail page ([c40a168](https://github.com/Sekai-World/sekai-viewer/commits/c40a16832cd8b4d3e0aafe4bfe7a122958d72a8f))


### Bug Fixes

* **music:** :bug: wrong music release condition ([538ec93](https://github.com/Sekai-World/sekai-viewer/commits/538ec93db229db16d04037a543fca31dab5c7cc4))


### Refactors

* :fire: remove ad on home and event tracker ([79d6640](https://github.com/Sekai-World/sekai-viewer/commits/79d66409f78c99caa0fe97446aa00dfc768cf27e))
* :lipstick: material icon style fix ([084fa46](https://github.com/Sekai-World/sekai-viewer/commits/084fa4601cd775622fd11dce66517e3d9834034f))

### [1.2.8](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.7...v1.2.8) (2022-02-26)


### Bug Fixes

* **card:** :bug: rarity field is removed in JP server ([aa6f565](https://github.com/Sekai-World/sekai-viewer/commits/aa6f565c5df99a080fb94fdbbf02c536d3f9b99e)), closes [#373](https://github.com/Sekai-World/sekai-viewer/issues/373)

### [1.2.7](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.6...v1.2.7) (2022-02-16)


### Features

* **Home:** add kaito banner ([95db8a2](https://github.com/Sekai-World/sekai-viewer/commits/95db8a23c475fcaa625004278744b6cd46c040c6))

### [1.2.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.5...v1.2.6) (2022-01-26)


### Bug Fixes

* **musicRecommend:** scroll-to-top button overlapped with content ([425802e](https://github.com/Sekai-World/sekai-viewer/commits/425802e0e07aba465576a404042f7dc15aab9d12))
* **tools:** :lipstick: make scroll-to-top button not overlapping content in event planner ([f544716](https://github.com/Sekai-World/sekai-viewer/commits/f544716d6b77871a7709752b1fbb11674061bd15))


### Refactors

* **tools:** :rotating_light: remove warnings in music recommender ([f7ae04c](https://github.com/Sekai-World/sekai-viewer/commits/f7ae04caa6b7b1f5747ee8d4303cc9dba1f527d8))

### [1.2.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.4...v1.2.5) (2022-01-16)


### Features

* **card:** :sparkles: add correlating event title entry ([3397098](https://github.com/Sekai-World/sekai-viewer/commits/3397098aa98b73ee27c3260e558561618f410c9f)), closes [#361](https://github.com/Sekai-World/sekai-viewer/issues/361)
* **cards:** add link to corr event detail page ([eea440a](https://github.com/Sekai-World/sekai-viewer/commits/eea440a4ebdd523ec2870e314fc678c3ab1f8278))


### Bug Fixes

* **user:** :bug: wrong jwt token set function usage ([d235efd](https://github.com/Sekai-World/sekai-viewer/commits/d235efd641d3d4aae9d14fc23b16c13bb3da146f))

### [1.2.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.3...v1.2.4) (2021-12-31)


### Bug Fixes

* **home:** :bug: countdown time bug ([e7754b9](https://github.com/Sekai-World/sekai-viewer/commits/e7754b90d4069853d7871de733e20f6f952e1ce2))

### [1.2.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.2...v1.2.3) (2021-12-31)


### Refactors

* **home:** :lipstick: new banners ([6cc93f9](https://github.com/Sekai-World/sekai-viewer/commits/6cc93f90420dd67347a1c2ca7ecaaafbc7809cf2))

### [1.2.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.1...v1.2.2) (2021-12-29)


### Bug Fixes

* **user:** :ambulance: fix sekai profile type def ([65a6393](https://github.com/Sekai-World/sekai-viewer/commits/65a63935fb033ef095605510b741d8b601529d97))

### [1.2.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.2.0...v1.2.1) (2021-12-29)


### Bug Fixes

* **home:** :bug: service worker reload prompt wrong location ([44e83ad](https://github.com/Sekai-World/sekai-viewer/commits/44e83add65905526eb9ec343bd05c7044e473da1))
* **tools:** :bug: event pt calc wrong bonus rate ([2240434](https://github.com/Sekai-World/sekai-viewer/commits/2240434226c2e6863b23e3c7cc5290dce11d88d2)), closes [#353](https://github.com/Sekai-World/sekai-viewer/issues/353)

## [1.2.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.8...v1.2.0) (2021-12-28)


### Features

* :sparkles: bonds honor badge ([e8ab6e1](https://github.com/Sekai-World/sekai-viewer/commits/e8ab6e12dc2168bef87bb3efe3c032ea805beb50))
* **event:** :sparkles: show new user profile honors ([8311854](https://github.com/Sekai-World/sekai-viewer/commits/83118540d00db9dda7ea85ad4f5ddb93d0c4473f))
* **sekai-viewer:** withlist entry point ([650be2b](https://github.com/Sekai-World/sekai-viewer/commits/650be2b67851214fa8f8bc907d3671a24f5f3ff9))


### Bug Fixes

* :lipstick: degree sub style improvements ([58feaa1](https://github.com/Sekai-World/sekai-viewer/commits/58feaa1f74e9eca38305a5a19a39f4e7396b2938))
* **user:** :lipstick: bonds degree badge reverse ([ce95020](https://github.com/Sekai-World/sekai-viewer/commits/ce950201f1a3a09af472fe7f8875a797c1979321))


### Refactors

* :lipstick: normal degree image width ([1935e89](https://github.com/Sekai-World/sekai-viewer/commits/1935e89e902bacec42a043ad3530d80a72eafd3c))
* open external link in new instead of current page ([c549dc2](https://github.com/Sekai-World/sekai-viewer/commits/c549dc27a9a5843d459505285e8c4fee91065c1b))
* **user:** :ambulance: sekai new profile structure (user honors) ([7dbeabf](https://github.com/Sekai-World/sekai-viewer/commits/7dbeabf9c203c7cf5f1c34ea09c42c0f11390e89))

### [1.1.8](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.7...v1.1.8) (2021-12-23)


### Bug Fixes

* :bug: further fixing sekai data type annotation ([f6b7515](https://github.com/Sekai-World/sekai-viewer/commits/f6b7515d8bba4b56033ca92222993ccbcf5eceae))
* **home:** :bug: game news spoiler filter, en url fix ([0574068](https://github.com/Sekai-World/sekai-viewer/commits/05740682b5b048229a73183eb6f03bacdaa76061))


### Refactors

* **live2d:** :lipstick: live2d toolbar and display area padding remove ([dd67c4d](https://github.com/Sekai-World/sekai-viewer/commits/dd67c4d7920c190e3419fcb5a285cb5dfc1b764e))

### [1.1.7](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.6...v1.1.7) (2021-12-15)


### Features

* :bento: add sub degree frame ([42d638e](https://github.com/Sekai-World/sekai-viewer/commits/42d638e39adadc4effd58773717dedff1f710a64))


### Bug Fixes

* **event:** :bug: en server event tracker shows jp result after event ends ([d01eaa8](https://github.com/Sekai-World/sekai-viewer/commits/d01eaa86d1decae4d6411d3883e0f763a5f5dc0e))


### Refactors

* **event:** :lipstick: make event tracker table looks better ([1e90fe3](https://github.com/Sekai-World/sekai-viewer/commits/1e90fe363ec3698d4ff532a51285a4ea9a06488c))
* **user:** :lipstick: style fix ([257d083](https://github.com/Sekai-World/sekai-viewer/commits/257d083ebe3dd46c1348eea63cc9ed9b4fa3f1c3))

### [1.1.6](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.5...v1.1.6) (2021-12-14)


### Bug Fixes

* collab area icons and voice ([86b19ad](https://github.com/Sekai-World/sekai-viewer/commits/86b19ada0f3b24b70e245ff53dc46a9d52a4f5d4))

### [1.1.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.4...v1.1.5) (2021-12-14)


### Bug Fixes

* **user:** sekai profile cards teams story unlock type fix ([b21ca63](https://github.com/Sekai-World/sekai-viewer/commits/b21ca6368ba164968b530cb287b0d8d97e636d33))

### [1.1.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.3...v1.1.4) (2021-12-14)


### Bug Fixes

* **card:** :bug: correctly process card detail without side stories ([da132a0](https://github.com/Sekai-World/sekai-viewer/commits/da132a0d1121a186382ee74c0248dcbd0f0d707f))
* **live2d:** :lipstick: fit wide screen mobile device ([b986f09](https://github.com/Sekai-World/sekai-viewer/commits/b986f09caf2a3147757efbd8d28d1e7df72dfa8a))

### [1.1.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.2...v1.1.3) (2021-12-14)


### Bug Fixes

* **live2d:** :bug: jp clb model motion base url ([980bbe8](https://github.com/Sekai-World/sekai-viewer/commits/980bbe8ba933b6efca497abcac657024d808202d))

### [1.1.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.1...v1.1.2) (2021-12-13)


### Bug Fixes

* **story:** :bug: special story wrong voice path ([8452ead](https://github.com/Sekai-World/sekai-viewer/commits/8452eadb98599c246fe6439f1dee880f30295e27))

### [1.1.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.1.0...v1.1.1) (2021-12-13)


### Features

* **story:** :sparkles: add special stories to story reader ([68e1b1d](https://github.com/Sekai-World/sekai-viewer/commits/68e1b1dfccc5aa9c0376b975b0f8c0027c5f093d))


### Bug Fixes

* **card:** :bug: really fix the empty list problem ([842b2cb](https://github.com/Sekai-World/sekai-viewer/commits/842b2cb603a96c5239d577c3178350bb241a6d9e))
* **gacha:** :bug: gacha detail card rate becomes NaN ([024a2a4](https://github.com/Sekai-World/sekai-viewer/commits/024a2a42524a126c979516291fe00bb54ed2e9cb))


### Refactors

* **gacha:** filter not really opened en gachas ([328c3d0](https://github.com/Sekai-World/sekai-viewer/commits/328c3d005ac52c23c496cd54e90fdea5fc693808))

## [1.1.0](https://github.com/Sekai-World/sekai-viewer/compare/v1.0.5...v1.1.0) (2021-12-09)


### Features

* **gacha:** :sparkles: gacha simulator improvement, allow birthday cards ([abd29ab](https://github.com/Sekai-World/sekai-viewer/commits/abd29ab654b274f1a8190ae5d925ce2acb1a9efb))
* **layout:** :lipstick: allow material icons to have mini variant ([cde5d6c](https://github.com/Sekai-World/sekai-viewer/commits/cde5d6c5248536b6ae3a2c19dac6dc77067000ea))


### Bug Fixes

* **card:** :bug: empty card list because of race condition ([baedd13](https://github.com/Sekai-World/sekai-viewer/commits/baedd1332f477ef7744949d65bac8869c2d8adc1))
* **card:** :bug: optional property cardRarityType ([7dbf5c6](https://github.com/Sekai-World/sekai-viewer/commits/7dbf5c60d2b46b3d139d2076c3e148ce5f4079dc))
* **user:** :bug: event record filtering event ([e6c5ebc](https://github.com/Sekai-World/sekai-viewer/commits/e6c5ebcb4150de4b9c6462ee686fee2e2bc95e0a))


### Refactors

* **home:** :zap: split sekai game news table component from home ([6e82f08](https://github.com/Sekai-World/sekai-viewer/commits/6e82f082fe57d18ab8a169643662e833700310ac))

### [1.0.5](https://github.com/Sekai-World/sekai-viewer/compare/v1.0.4...v1.0.5) (2021-12-08)


### Bug Fixes

* **user:** :bug: import card not working for EN and TW ([046c456](https://github.com/Sekai-World/sekai-viewer/commits/046c4569f551900d58279a55aeb1ab0566ece6de))

### [1.0.4](https://github.com/Sekai-World/sekai-viewer/compare/v1.0.3...v1.0.4) (2021-12-08)


### Bug Fixes

* **user:** :bug: sekai profile model definition ([96f20df](https://github.com/Sekai-World/sekai-viewer/commits/96f20dfe89712616b9e67e59cac705c7418fdbbf))


### Refactors

* **user:** verify carousel open state ([98560e3](https://github.com/Sekai-World/sekai-viewer/commits/98560e3dd700a20352031b817a27d9f4aad0ee90))

### [1.0.3](https://github.com/Sekai-World/sekai-viewer/compare/v1.0.2...v1.0.3) (2021-12-08)


### Bug Fixes

* **user:** :bug: forget to set sekai card team map after creation empty one ([542c310](https://github.com/Sekai-World/sekai-viewer/commits/542c31019d32035cf4135fc2724c9179a8813985))

### [1.0.2](https://github.com/Sekai-World/sekai-viewer/compare/v1.0.1...v1.0.2) (2021-12-08)


### Bug Fixes

* **user:** :bug: sekai id binding and other function are not functioning ([8b38ea8](https://github.com/Sekai-World/sekai-viewer/commits/8b38ea8c959ddba7cfeebe08069a4ba008fd7e35))


### Refactors

* **event:** :recycle: use unified sekai event record ([7fe2fe2](https://github.com/Sekai-World/sekai-viewer/commits/7fe2fe2fef1f9b246ba86cfe189782300dd28e0e))

### [1.0.1](https://github.com/Sekai-World/sekai-viewer/compare/v1.0.0...v1.0.1) (2021-12-08)


### Bug Fixes

* :bug: check currEvent before applying ([c28dc30](https://github.com/Sekai-World/sekai-viewer/commits/c28dc300dd3541064ce783e8f324b4214dc054a2))
* **user:** :bug: sekai deck back compatibility ([530a897](https://github.com/Sekai-World/sekai-viewer/commits/530a897433769a24da5c0aa4a5668dad5517f8ae))


### Refactors

* :lipstick: add loading animation to some images ([add1d2c](https://github.com/Sekai-World/sekai-viewer/commits/add1d2c117b3a458dae7c2edb310a2345b1204d2))

## [1.0.0](https://github.com/Sekai-World/sekai-viewer/compare/v0.9.6...v1.0.0) (2021-12-07)


### Features

* :sparkles: add asset viewer ([ca982c5](https://github.com/Sekai-World/sekai-viewer/commits/ca982c50a5a5b1dbb1e76ae6558b2899cd914d53))
* :sparkles: transition to mobx ([7c78db7](https://github.com/Sekai-World/sekai-viewer/commits/7c78db7d369e3893ff5b8fc13fc3ec67a5602dbd))
* **tools:** :sparkles: asset viewer with virtual scrolling ([b1b6800](https://github.com/Sekai-World/sekai-viewer/commits/b1b68009bb9e8bf001b16a9b8c8d00f51a358b38))


### Bug Fixes

* :rotating_light: resourceBox no unique key warning ([f63faf8](https://github.com/Sekai-World/sekai-viewer/commits/f63faf842b55a6b2b3faa500fdbecbc8a2c6815e))
* **card:** :bug: wrong birthday card maximum level ([ccba4fc](https://github.com/Sekai-World/sekai-viewer/commits/ccba4fc904ca32f68b05eea6effdf85f40455e01)), closes [#351](https://github.com/Sekai-World/sekai-viewer/issues/351)
* **user:** :bug: user login and logout redirection ([dd4993d](https://github.com/Sekai-World/sekai-viewer/commits/dd4993df9c23f580ab6369a05fd49c1d9a6200a2))
* **user:** :lipstick: sekai profile page layout ([7290d77](https://github.com/Sekai-World/sekai-viewer/commits/7290d778dc9a8373babee6096f555facffe7b556))

### [0.9.6](https://github.com/Sekai-World/sekai-viewer/compare/v0.9.5...v0.9.6) (2021-11-24)


### Bug Fixes

* :bug: language-cache empty problem causing user home blank ([97b5334](https://github.com/Sekai-World/sekai-viewer/commits/97b5334ba602d32be8e6a927c7896e0f9560b5f1))
* typo ([16ed29e](https://github.com/Sekai-World/sekai-viewer/commits/16ed29e8a82f7b1537363eec9b8bf33f31e70626))


### Refactors

* **user:** :recycle: let connect login fecth more data ([99ee5fc](https://github.com/Sekai-World/sekai-viewer/commits/99ee5fc2c300b3c4980cde62ac0d5168d05e4659))

### [0.9.5](https://github.com/Sekai-World/sekai-viewer/compare/v0.9.4...v0.9.5) (2021-11-16)


### Bug Fixes

* **user:** :bug: sekai components style and bug ([6ca723f](https://github.com/Sekai-World/sekai-viewer/commits/6ca723fb8e2de1198783732cfe51be4da29e529b))

### [0.9.4](https://github.com/Sekai-World/sekai-viewer/compare/v0.9.3...v0.9.4) (2021-11-16)


### Features

* **backend:** :sparkles: add refresh token, split sekai card and team from sekai profile ([61ec368](https://github.com/Sekai-World/sekai-viewer/commits/61ec368204587595052b3d7295f5ab85f29aa4ab))


### Bug Fixes

* **user:** :bug: login undefined user profile ([7814f41](https://github.com/Sekai-World/sekai-viewer/commits/7814f41324e80894752718d5c5f9116da83389f1))


### Refactors

* **backend:** :recycle: make changes according to endpoint split ([e0f6d0a](https://github.com/Sekai-World/sekai-viewer/commits/e0f6d0ad1d52bb12917d1afe8d5eba19af9eede6))
* **user:** :lipstick: sekai components code cleanup ([4def1c4](https://github.com/Sekai-World/sekai-viewer/commits/4def1c4dc9f28cbce2fbceecdb84c5a7fb6d84be))

### [0.9.3](https://github.com/Sekai-World/sekai-viewer/compare/v0.9.2...v0.9.3) (2021-11-12)


### Features

* **card:** :sparkles: add unit filter ([69b43c4](https://github.com/Sekai-World/sekai-viewer/commits/69b43c494b5dcb3e831c0f7cb9ed3a168212407d))
* **music:** :sparkles: meta table loading state ([886d985](https://github.com/Sekai-World/sekai-viewer/commits/886d9858518d32a773b846ff92aac6555bfe44a7))


### Bug Fixes

* :bug: filter state fix and cleanup ([77e452a](https://github.com/Sekai-World/sekai-viewer/commits/77e452ac70e837e4afcea6d5bc802764cc012ae2))
* :bug: horizontal scrollbar height ([487502c](https://github.com/Sekai-World/sekai-viewer/commits/487502ce256b5147ba8c0620f4e7a977ac8b26ee))
* **home:** :bug: table sorting uses new sortModel parameter ([321b68d](https://github.com/Sekai-World/sekai-viewer/commits/321b68d31253fe702baf206c4468fc7f7434c1fa))
* **tools:** :bug: music recommender crash for multi-live ([6f0e0e8](https://github.com/Sekai-World/sekai-viewer/commits/6f0e0e89f93c3486b29648634c7bc5125fc7d3ba))


### Refactors

* **card:** :lipstick: make comfy view more dense ([7c9ecc7](https://github.com/Sekai-World/sekai-viewer/commits/7c9ecc791c90c693c1dde29f570fe945adeac6ab))
* **home:** :recycle: remove table and dialog conditional rendering ([7e4b63b](https://github.com/Sekai-World/sekai-viewer/commits/7e4b63bc44f0c96b14e7ff251a6a5e00f4b69794))
* **music:** :lipstick: add icons to music tag ([db11315](https://github.com/Sekai-World/sekai-viewer/commits/db11315d7200711d25e92e9bdb13fbf680258f47))
* **tools:** :lipstick: event point calc autocomplete style fix ([d47a74a](https://github.com/Sekai-World/sekai-viewer/commits/d47a74acd373fc64eb60e98c2a682b10608205a7))

### [0.9.2](https://github.com/Sekai-World/sekai-viewer/compare/v0.9.1...v0.9.2) (2021-11-05)


### Refactors

* :recycle: remove redundant codes ([19e1034](https://github.com/Sekai-World/sekai-viewer/commits/19e103470cfbbd4c2472b893407052d080201d2c))

### [0.9.1](https://github.com/Sekai-World/sekai-viewer/compare/v0.9.0...v0.9.1) (2021-11-04)

## [0.9.0](https://github.com/Sekai-World/sekai-viewer/compare/v0.8.1...v0.9.0) (2021-11-04)


### Features

* **home:** :sparkles: make drawer swipeable on mobile device ([5dd5179](https://github.com/Sekai-World/sekai-viewer/commits/5dd51798f0868568fd8fe93c9d9a5b536107fc37))
* **home:** :sparkles: show game version info ([6807256](https://github.com/Sekai-World/sekai-viewer/commits/68072566635e3f9dd99a2513316a2193bf9af403))
* **layout:** :sparkles: store drawer open state on desktop ([9f4ffcb](https://github.com/Sekai-World/sekai-viewer/commits/9f4ffcb162102fdfd8fc45d62bfabf112ef2766b))
* **settings:** :sparkles: show detected client region ([679a1f4](https://github.com/Sekai-World/sekai-viewer/commits/679a1f4bdeecb392e350d52fad4d3122a1cc7a2e))
* **user:** :sparkles: show more sekai profile data ([b0c7694](https://github.com/Sekai-World/sekai-viewer/commits/b0c7694785db49509e2be4efb9b6afe3a1d49c8b))


### Bug Fixes

* :adhesive_bandage: rename AdSense to avoid wrong adblock rules ([b1ec37e](https://github.com/Sekai-World/sekai-viewer/commits/b1ec37e68280eae9690c7e6a94572e550a45f776))
* :rotating_light: missing `key` prop warning in AgendaView ([eff5d0c](https://github.com/Sekai-World/sekai-viewer/commits/eff5d0c9bebd67f3abf75b71316ec1e0a023192a))
* **music:** no `null` label for FormControlLabel ([ea62f1e](https://github.com/Sekai-World/sekai-viewer/commits/ea62f1e76c706540f04c033e20064a6478c69be0))
* **pwa:** :bug: use `manifest.webmanifest` in `index.html` ([1385ba1](https://github.com/Sekai-World/sekai-viewer/commits/1385ba11cdbc5a259baa7010ff91a2f99eda555e))


### Refactors

* :arrow_up: upgrade material-ui@4 to mui@5 alongwith dependencies ([c1dd350](https://github.com/Sekai-World/sekai-viewer/commits/c1dd350cf19e33313cee29bbcb52c8e040f90c1f))
* :building_construction: change folder structure ([a896a32](https://github.com/Sekai-World/sekai-viewer/commits/a896a326f9748081fc769dd2ba550a8a0ea43436))
* :hammer: migration to pnpm, vite ([5e66bd8](https://github.com/Sekai-World/sekai-viewer/commits/5e66bd83c2183a04edbf2956888a06f0e5d3edb7))
* :lipstick: dialog style fix ([5f3e0bd](https://github.com/Sekai-World/sekai-viewer/commits/5f3e0bd4070cc0f4f5382df6ed3c8a1545b36977))
* :recycle: remove useToggle for mobile drawer ([ea08f10](https://github.com/Sekai-World/sekai-viewer/commits/ea08f10fd3947eda59bc514fcbeab7cfdf57a12e))
* :recycle: save country as "unknown" instead of `undefined` ([1c7d56e](https://github.com/Sekai-World/sekai-viewer/commits/1c7d56ea91c771ae1983fb28a37259c28181eab6))
* **home:** :lipstick: shortcut section spacing adjustment ([0962140](https://github.com/Sekai-World/sekai-viewer/commits/09621409b26c5f08d02aec7865307b57840aa241))
* **pwa:** :recycle: use vite pwa plugin ([8827de0](https://github.com/Sekai-World/sekai-viewer/commits/8827de0b52f4ba34db8678312632458d820002fb))
* **user:** :lipstick: dialog with crousel style fix ([027ea11](https://github.com/Sekai-World/sekai-viewer/commits/027ea11e4ffd92a27894bef2ad8f0a18633e2842))

### [0.8.1](https://github.com/Sekai-World/sekai-viewer/compare/v0.8.0...v0.8.1) (2021-10-18)


### Bug Fixes

* **card:** birthday card rarity on detail page ([e5ccc4b](https://github.com/Sekai-World/sekai-viewer/commits/e5ccc4b10f53d98c1b52139c6a75912a7fe3d463))
* **comment:** list key warning ([582bd1f](https://github.com/Sekai-World/sekai-viewer/commits/582bd1f3320722c2bd51fd2fe0186c6a45435fe6))
* **event-tracker:** fetch correct regional graph ([c9cff47](https://github.com/Sekai-World/sekai-viewer/commits/c9cff47bdf937d74fce92af01c53851a0f536c7b))
* **event:** cards specific boost check condition ([b314b1f](https://github.com/Sekai-World/sekai-viewer/commits/b314b1f5798b06f6a36b9271cc2f7ca4fe773826))
* **settings:** warning ([05b4b9a](https://github.com/Sekai-World/sekai-viewer/commits/05b4b9a6ff734ea5e1ad3ce266465b850907a1c8))
* **subs:** avoid degree image find error ([4301179](https://github.com/Sekai-World/sekai-viewer/commits/43011796ae0fe9e282baea8d88e5cd7b08c8f0eb))
* **utils:** distinguish data cache key for fetched data ([3388f5e](https://github.com/Sekai-World/sekai-viewer/commits/3388f5e7f1a91204b9bffdc87a56b65f0723d7e3))

## [0.8.0](https://github.com/Sekai-World/sekai-viewer/compare/v0.7.2...v0.8.0) (2021-10-18)


### Features

* add separate settings page ([e0b7f72](https://github.com/Sekai-World/sekai-viewer/commits/e0b7f727ed6c8cc9411e6dd74b26dcec26f4912c))
* **event-tracker:** support multiple server region ([59d45c9](https://github.com/Sekai-World/sekai-viewer/commits/59d45c946b1d2e938e6d9d40657e3b7a23fd9d31))
* support multiple server region ([64c307d](https://github.com/Sekai-World/sekai-viewer/commits/64c307dcc6e6e52707c23816cda4c48bbe51d49d))
* **utils:** support multiple server regions ([38ceec3](https://github.com/Sekai-World/sekai-viewer/commits/38ceec3cd121f8cf2dee6fdd29d6c003b10bf9ca))


### Refactors

* **support:** remove container ([86cf630](https://github.com/Sekai-World/sekai-viewer/commits/86cf6303d2f4b6eece09b4b443495e5bee8f9783))

### [0.7.2](https://github.com/Sekai-World/sekai-viewer/compare/v0.7.1...v0.7.2) (2021-10-04)


### Bug Fixes

* **card:** card birthday frame ([9064146](https://github.com/Sekai-World/sekai-viewer/commits/9064146aefae5a342fba8138b5efc2a9d45e81c6))
* **card:** card detail birthday card thumb ([b581e6a](https://github.com/Sekai-World/sekai-viewer/commits/b581e6a8eeb548a5ce902c1ef63ab42a9e1d5637))
* **subs:** birthday card, trainable state ([e88a2e9](https://github.com/Sekai-World/sekai-viewer/commits/e88a2e981831042077f3801c3956e6e53b01f74a))
* **subs:** correctly handle thumb training status ([f3bbcf6](https://github.com/Sekai-World/sekai-viewer/commits/f3bbcf648c51d231a1ba27dec1633b894ddf45bb))
* **subs:** loadTeamDialog show card training status ([cbd69d8](https://github.com/Sekai-World/sekai-viewer/commits/cbd69d8c5227249faa7b8dfac5946f7181dfe289))

### [0.7.1](https://github.com/Sekai-World/sekai-viewer/compare/v0.7.0...v0.7.1) (2021-10-04)


### Features

* **card:** support birthday card ([f190891](https://github.com/Sekai-World/sekai-viewer/commits/f190891e40beceaa5cdf758df37e0141633f2af2))


### Bug Fixes

* **home:** haruka birthday banner date check ([e10db33](https://github.com/Sekai-World/sekai-viewer/commits/e10db33fe44dae6bf09f09a541d709a72c96b170))

## [0.7.0](https://github.com/Sekai-World/sekai-viewer/compare/v0.6.0...v0.7.0) (2021-10-03)


### Features

* **calc:** support event card related bonus ([18270b3](https://github.com/Sekai-World/sekai-viewer/commits/18270b35f5dfe765a5be3241ce0c19ec11a88895))
* **event-tracker:** add cheerful carnival team info ([85d1f11](https://github.com/Sekai-World/sekai-viewer/commits/85d1f11af7013379a8201d5c08d94293677770fb))
* **event:** add bonus rate for special cards ([7e05961](https://github.com/Sekai-World/sekai-viewer/commits/7e05961a25e9a38ade1c21a211feff85bf5b405a))
* **home:** add birthday banner of haruka and anniversary banner ([e46454f](https://github.com/Sekai-World/sekai-viewer/commits/e46454f88c7359b470cd2d6ebc610ab41fbdd593))
* **subs:** add cards diaglog improve ([65f2e37](https://github.com/Sekai-World/sekai-viewer/commits/65f2e374c3bfa355cf65a796722b55662c9fa2ff))


### Bug Fixes

* **gacha:** now able to sample the last element in card-list of each rarity ([f01ad9f](https://github.com/Sekai-World/sekai-viewer/commits/f01ad9f3936d5c410e46de878565b46c9791e19e))
* **subs:** degree image rank indicator not cleared ([e8758f0](https://github.com/Sekai-World/sekai-viewer/commits/e8758f0dd0a0cb55463dd64a1cd954f93b0d8983))


### Refactors

* make every externel url changable ([5cea1dd](https://github.com/Sekai-World/sekai-viewer/commits/5cea1dd9d915c7eac93abceade74e48083398929))
* **subs:** better clear degree rank indicator ([39179fe](https://github.com/Sekai-World/sekai-viewer/commits/39179fe15ba3eb0d27fb240f37c8158587bfe82e))

## [0.6.0](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.9...v0.6.0) (2021-08-02)


### Features

* **calc:** give worst and best score for songs in song recommender ([45b312e](https://github.com/Sekai-World/sekai-viewer/commits/45b312eda7e7888bed208550f18c81f72c934d71))
* **music:** filter only valid (released) music meta ([da58fd7](https://github.com/Sekai-World/sekai-viewer/commits/da58fd72ad8874b1074f9aa79ffe67205bb78d28))
* **utils:** team builder allows filtering by skills ([4e514f9](https://github.com/Sekai-World/sekai-viewer/commits/4e514f905058c83924f7935bd218ab31feaffebe))


### Bug Fixes

* **calc:** wrong average skill rate for event point calc ([4b37840](https://github.com/Sekai-World/sekai-viewer/commits/4b378406ef803c68de4714283ddd71bfa63b810e))
* **user:** allow 18 digit sekai id ([c49dd7d](https://github.com/Sekai-World/sekai-viewer/commits/c49dd7d92319e30369bfd9e632d1feac7c9c3392)), closes [#333](https://github.com/Sekai-World/sekai-viewer/issues/333)


### Refactors

* **ad:** remove most ads ([c2b76ac](https://github.com/Sekai-World/sekai-viewer/commits/c2b76ace89e91f0ef55a65628ed818ba74fb8046))
* **calc:** add challenge live mode for event point calc, use filtered music meta ([4428733](https://github.com/Sekai-World/sekai-viewer/commits/4428733a51544179696e0cd034e6c0994c172305))
* **calc:** update event point formular, add challenge live point ([fedb984](https://github.com/Sekai-World/sekai-viewer/commits/fedb9845e566b9bfd3aeba8c1046bbe7a0618d6f))
* **skill:** adpot new skill type score_up_condition_life ([32d2d39](https://github.com/Sekai-World/sekai-viewer/commits/32d2d39823bb1f9761c574c79867a9fcc52b1fba))

### [0.5.9](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.8...v0.5.9) (2021-07-12)


### Features

* **home:** add banner for nene and an's birthday ([1d73088](https://github.com/Sekai-World/sekai-viewer/commits/1d73088c8c3234240a1ceb016d35e9dceb43bf13))
* **music:** simplify trim slience, add flac support ([fc3bc1b](https://github.com/Sekai-World/sekai-viewer/commits/fc3bc1b81d1bb76719c9dbec4965ab49e274b771))
* **music:** tooltip for downloading flac ([ccb1cec](https://github.com/Sekai-World/sekai-viewer/commits/ccb1cecd0da7ed038c111c84013c8e02ba0f4294))


### Refactors

* **music:** only trim mp3 file for now ([da676ec](https://github.com/Sekai-World/sekai-viewer/commits/da676ecd234fd5e8b9ceede107230e94da2cb56d))

### [0.5.8](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.7...v0.5.8) (2021-07-09)


### Bug Fixes

* **music:** mv type filter becomes true "AND" filter ([224e5ed](https://github.com/Sekai-World/sekai-viewer/commits/224e5ed06098f3d51b019d4ba5b1c1a274bd9fd2))

### [0.5.7](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.6...v0.5.7) (2021-06-27)


### Features

* add comments for card, event, music and vlive ([4107baa](https://github.com/Sekai-World/sekai-viewer/commits/4107baa72c55c9d7aa75ed4c9cdfd1b0b385d1d2))
* **utils:** add api for proseka data ([cfa8915](https://github.com/Sekai-World/sekai-viewer/commits/cfa89150bc565aa33db4c9f48aea7c8d8719d5f2))


### Bug Fixes

* **comment:** missing style file, fetch comments on load ([995163b](https://github.com/Sekai-World/sekai-viewer/commits/995163b76a7beaa4812df826a59db744a74c677e))
* **music:** music video path ([b4f283c](https://github.com/Sekai-World/sekai-viewer/commits/b4f283c477934788e7f3e3fd6ec669b471ed296d))


### Refactors

* **announcement:** adaption for comment component  change ([fcd76be](https://github.com/Sekai-World/sekai-viewer/commits/fcd76beb58297d28e32ed1c060b7412b10ad22ac))
* **calc:** add difficulties back to event point calc ([93be7b0](https://github.com/Sekai-World/sekai-viewer/commits/93be7b0c00e5859f05350dd3edf77edf4b142827))
* **calc:** code cleanup ([f43ea36](https://github.com/Sekai-World/sekai-viewer/commits/f43ea361b160edddb58e689dbfd8f145b68561c6))

### [0.5.6](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.5...v0.5.6) (2021-06-21)


### Bug Fixes

* movie player, story reader blank screen ([9d4c98c](https://github.com/Sekai-World/sekai-viewer/commits/9d4c98c03dd50a427cd425119d0231a50867c8a0))

### [0.5.5](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.4...v0.5.5) (2021-06-21)


### Bug Fixes

* **subs:** degree image set background ([0d3b796](https://github.com/Sekai-World/sekai-viewer/commits/0d3b796709fc824f02eac86435b2d5abd5e8f4ec))

### [0.5.4](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.3...v0.5.4) (2021-06-16)


### Features

* **storyreader:** add music and voice download button ([2231eec](https://github.com/Sekai-World/sekai-viewer/commits/2231eec27b34d2a87c089f48fd7235e4b761cd2f))
* update type definition ([44a21a1](https://github.com/Sekai-World/sekai-viewer/commits/44a21a16bfbbd6d3fd9201f1f76b07f0d119e68d))
* **utils:** add cheerful carnival event point calc ([dbb0fc4](https://github.com/Sekai-World/sekai-viewer/commits/dbb0fc4640cd7d4877c8bfce5b913d797ac219b2))


### Bug Fixes

* **ad:** typo of noAdRoles ([02a0b04](https://github.com/Sekai-World/sekai-viewer/commits/02a0b042c7262c2292c775c21a2b4f308de487d3))
* support page patreon list ([36b6841](https://github.com/Sekai-World/sekai-viewer/commits/36b68411b3e5513bbb50d59011baa6d1a7e0460d))


### Refactors

* **event_calc:** great functionality enrichment ([08b4001](https://github.com/Sekai-World/sekai-viewer/commits/08b400133c2f4dfbb255c3109bc44d1fa4a136e2))
* **muisc_recomm:** remove event point calc ([abb217a](https://github.com/Sekai-World/sekai-viewer/commits/abb217a37c9fde951d047b5c6c2bbd72a0c779dc))
* **music:** audio player download link add download attribute ([eb96147](https://github.com/Sekai-World/sekai-viewer/commits/eb96147d6e0f2b118ce86945afd65f9952588444))
* **subs:** add cardStates param to calcTotalPower function ([8147f9a](https://github.com/Sekai-World/sekai-viewer/commits/8147f9a25ce30562ed78dbe980d79581490b5404))
* **user:** avoid loading too much assets once ([b313607](https://github.com/Sekai-World/sekai-viewer/commits/b3136074dc7bc1e372f46426cb51b90ce7e2f5bd))
* **user:** rename teamPowerStates to teamTotalPower ([e25243d](https://github.com/Sekai-World/sekai-viewer/commits/e25243d5c3250666b93f601139161b1c15a66fe8))

### [0.5.3](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.2...v0.5.3) (2021-05-10)


### Features

* add story reader link to detail pages ([838e7ba](https://github.com/Sekai-World/sekai-viewer/commits/838e7ba03a98babfb8760c0074e8a25e19d4bbe4))


### Bug Fixes

* **event:** boost cards align with event cards on sm screen ([ab2c20f](https://github.com/Sekai-World/sekai-viewer/commits/ab2c20f3b7946500ef9cf5e3553af3b2e17903cf))
* **event:** detail page boost attribute align with boost characters ([2286ab4](https://github.com/Sekai-World/sekai-viewer/commits/2286ab4c2fe4a0d8dd53388f820a32497c147f79))
* **subs:** audio player volume reset after change source ([07e00fa](https://github.com/Sekai-World/sekai-viewer/commits/07e00fa3ad501fc7cbf856224fe0d746fceb8bf2))
* **user:** allow 17-digit sekai id ([e8a0acc](https://github.com/Sekai-World/sekai-viewer/commits/e8a0acc40348ef36847bff47d1ccad926fb58386))


### Refactors

* **storyreader:** disable transition of images ([02eae15](https://github.com/Sekai-World/sekai-viewer/commits/02eae152e17321f159a966f152b0dd29a8a55f7a))
* **subs:** material icon disable transition ([54ad9b7](https://github.com/Sekai-World/sekai-viewer/commits/54ad9b7ef6d3cdcd2d28ecfd955b4670995a63a5))

### [0.5.2](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.1...v0.5.2) (2021-05-07)


### Features

* **event:** event tracker live row background change upon update ([d410ec1](https://github.com/Sekai-World/sekai-viewer/commits/d410ec1413f12538e096565a8f66d362d99b39c6))
* **storyreader:** support map talk ([9909cc2](https://github.com/Sekai-World/sekai-viewer/commits/9909cc2b69a613e6de9d9acddc24cc57abf55b45))


### Bug Fixes

* **context:** sekai profile local storage update with wrong content ([de0d891](https://github.com/Sekai-World/sekai-viewer/commits/de0d891eeab03b7cde5e096469b9bd7779649b64))
* **event:** sekai event record error message ([c5fcee8](https://github.com/Sekai-World/sekai-viewer/commits/c5fcee82e53b1e4fe59cc750f7ba54501e90a810))
* **music:** actual playback time varies ([e67bd40](https://github.com/Sekai-World/sekai-viewer/commits/e67bd40b1f6ab623c35bff77465e0320790893a9))
* **team:** medium thumb xs column 4 instead of 2 ([6b66371](https://github.com/Sekai-World/sekai-viewer/commits/6b66371291ee44a27896c908c8ffd76ccdcfc245))
* **tools:** score calc skill effect type crash ([bd4cb5d](https://github.com/Sekai-World/sekai-viewer/commits/bd4cb5db4510501b10d2800e8739ea68450e2ea3))
* **tools:** table row warning ([7496225](https://github.com/Sekai-World/sekai-viewer/commits/7496225a1c3db2324317c140dd4332d4edb6e537))
* **user:** check if sekai id is malformed before verification ([bdf965b](https://github.com/Sekai-World/sekai-viewer/commits/bdf965b246184d14d8f748406745ee804b94287d))
* **user:** new registered user login but blank screen ([c05b44b](https://github.com/Sekai-World/sekai-viewer/commits/c05b44b1225b475652293e18de09e7e0dce58419))


### Refactors

* **event:** event tracker update color use warning color ([ba8fee3](https://github.com/Sekai-World/sekai-viewer/commits/ba8fee35d297384bba81d1dd92da277a07c80ddb))
* **music:** agenda view type use chip ([a44c586](https://github.com/Sekai-World/sekai-viewer/commits/a44c5869fd23ac54e8660ac1b4b3d3699822919b))
* **storyreader:** change story reader entry layout ([76c3feb](https://github.com/Sekai-World/sekai-viewer/commits/76c3feb40262e742c8c51bf02475fe15b2cb43b7))
* **utils:** remove contentTransMode argument of getTranslated ([1ce1548](https://github.com/Sekai-World/sekai-viewer/commits/1ce1548f0296e29f15931baa1eff4131407762a3))
* **utils:** remove contentTransMode for useCharaName ([ae31c56](https://github.com/Sekai-World/sekai-viewer/commits/ae31c568e81afdff375682900e27322af5add250))

### [0.5.1](https://github.com/Sekai-World/sekai-viewer/compare/v0.5.0...v0.5.1) (2021-04-30)


### Features

* use global snackbar provider ([2117c9a](https://github.com/Sekai-World/sekai-viewer/commits/2117c9ab43af52898a39617ba1ba1126300784ae))


### Bug Fixes

* **context:** updateSekaiProfile set wrong localstorage content ([1a2d71c](https://github.com/Sekai-World/sekai-viewer/commits/1a2d71c8049b0838dcd88d0cb7a465505576ef56))
* **i18n:** namespace missing ([4aa1ed9](https://github.com/Sekai-World/sekai-viewer/commits/4aa1ed9eece1c521546b814984fd3dec35245142))
* **vlive:** agenda view image wrong place ([3ac9233](https://github.com/Sekai-World/sekai-viewer/commits/3ac9233c872eb30f62809612730b9e18a43a0e63))
* **vlive:** agenda view route endpoint ([d31176d](https://github.com/Sekai-World/sekai-viewer/commits/d31176d3870ed2b30fd98afe80139888c27ae7fa))


### Refactors

* **music:** if trim mp3 failed, try clean cache ([8ef453c](https://github.com/Sekai-World/sekai-viewer/commits/8ef453c259698cbb3453947ae345495e532e225f))
* **user:** sekai profile user statistics use accordion ([26f2e45](https://github.com/Sekai-World/sekai-viewer/commits/26f2e45c3efaaba5327eb41d6d706900b50cf3e4))
* **user:** user area items shown by areas ([05a01a0](https://github.com/Sekai-World/sekai-viewer/commits/05a01a00a21995051468e221c5570009775bdcb6))

## [0.5.0](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.15...v0.5.0) (2021-04-29)


### Features

* **event:** cheerful carnival information ([fd010a7](https://github.com/Sekai-World/sekai-viewer/commits/fd010a706998aea45031afcf1d520100b357035e))
* **music:** music list filter enrichment ([0292b37](https://github.com/Sekai-World/sekai-viewer/commits/0292b37e578214d3a8b1c1da051f38e99eef3e23))
* **setting:** make spoiler switch opt-in ([032439c](https://github.com/Sekai-World/sekai-viewer/commits/032439c29eef31d4af6f0546c72a7b6c382b9135))
* **user:** user page sectioning ([81cf0e5](https://github.com/Sekai-World/sekai-viewer/commits/81cf0e5dc0ece4af1028f8d70005a4e6d9a6bd6c))


### Bug Fixes

* charaNameTrans component text color ([916db4e](https://github.com/Sekai-World/sekai-viewer/commits/916db4e4234979c214eda20a23637dbb0cf0810c))
* **music:** wrong number of dancer memebers ([62bcc21](https://github.com/Sekai-World/sekai-viewer/commits/62bcc21475ffdd1daf1d35eacf8825569d5afdb2))


### Refactors

* **vlive:** use image in list instead of CardMedia ([9993c3c](https://github.com/Sekai-World/sekai-viewer/commits/9993c3cf4f04eb68c6f2c742258bec8d249d429d))
* enlarge container to md ([33398d1](https://github.com/Sekai-World/sekai-viewer/commits/33398d1db44945e43d3195003822c5b9976a3913))
* **music:** make agenda view more compat ([dc94b42](https://github.com/Sekai-World/sekai-viewer/commits/dc94b42acd549f05152f4e33286eb3a69da384bb))
* **widget:** current event widget banner enlarge on mobile ([c22ba6d](https://github.com/Sekai-World/sekai-viewer/commits/c22ba6dc6f302ef83886074ca88550df6603f2fb))

### [0.4.15](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.14...v0.4.15) (2021-04-21)


### Features

* **style:** add pointer interactive style ([857eef9](https://github.com/Sekai-World/sekai-viewer/commits/857eef907ed84804c5316eddb880539c204e9ce4))


### Bug Fixes

* **event:** event tracker crash when specific rank is not available ([8542f99](https://github.com/Sekai-World/sekai-viewer/commits/8542f99dda986e9c5ad1055ed6328c96bbc9ad94))
* **event:** show boost cards only before event starts ([6a55f84](https://github.com/Sekai-World/sekai-viewer/commits/6a55f846156a8a54cfc888e9ebb94725d16c4971))
* **stamp:** typo ([bf89975](https://github.com/Sekai-World/sekai-viewer/commits/bf89975738c8e5468ecf9653a2a3a431cd2070a2))
* **user:** added sekai card are not filtered out properly ([d82f418](https://github.com/Sekai-World/sekai-viewer/commits/d82f418859bd5f70d8c011554c589360be77f4c3))
* **virtual_live:** birthday live honor reward ([58426cf](https://github.com/Sekai-World/sekai-viewer/commits/58426cfad0eb92e6d40f9d6670653f6b8c171b2a))


### Refactors

* **event:** event image show using image component ([d2d3f11](https://github.com/Sekai-World/sekai-viewer/commits/d2d3f11de76c0daa6361d0a8df009c5c6410b724))
* **home:** move links to shortcuts ([ebff4ae](https://github.com/Sekai-World/sekai-viewer/commits/ebff4ae4ec0eaff2dc2670b33a12e39e86114956))

### [0.4.14](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.13...v0.4.14) (2021-04-05)


### Features

* **comic:** add en translation ([3bdd2c0](https://github.com/Sekai-World/sekai-viewer/commits/3bdd2c02b67de3f95d1ce61651c0bf2619853f5c))
* **stamp:** add filter for text ([1675e5b](https://github.com/Sekai-World/sekai-viewer/commits/1675e5b7162943bb8737109c1aa91e74afd17f11))
* **support:** patron list from strapi ([c099ac3](https://github.com/Sekai-World/sekai-viewer/commits/c099ac3281689c90e59229f9fe73aa49dacfba87))

### [0.4.13](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.12...v0.4.13) (2021-03-31)


### Bug Fixes

* **event:** eventTracker blank page ([c39cea9](https://github.com/Sekai-World/sekai-viewer/commits/c39cea95312818187d4198ecfeaec76a04d82914))
* useLocalStorage allow false value to be set ([a09b9fe](https://github.com/Sekai-World/sekai-viewer/commits/a09b9fe8ffe32bbb4225f9b7e07a79664c073d63))

### [0.4.12](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.10...v0.4.12) (2021-03-30)


### Features

* **music:** add link to chart image ([891076f](https://github.com/Sekai-World/sekai-viewer/commits/891076fdb53835dff3365a1b86022574668e4624))


### Bug Fixes

* **music:** trim music following vocal type ([da1b09c](https://github.com/Sekai-World/sekai-viewer/commits/da1b09c4983f27fdc21c4b566df65dd1fba8c98b))
* avoid ToggleButtonGroup becomes null value ([3a773eb](https://github.com/Sekai-World/sekai-viewer/commits/3a773ebfa767bf21e8586d2d1c566f8ff4f18448))


### Refactors

* **card:** card detail page layout optimize ([01c8f68](https://github.com/Sekai-World/sekai-viewer/commits/01c8f682fc3e3ed27fbbe3e57964af04ecf264b6))
* **music:** make mp3 trim only when toggle is turned on ([47b325d](https://github.com/Sekai-World/sekai-viewer/commits/47b325dfdddacf549a08f3ad437e84766c7f06f2))

### [0.4.11](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.10...v0.4.11) (2021-03-29)


### Features

* **music:** add link to chart image ([7c2c02b](https://github.com/Sekai-World/sekai-viewer/commits/7c2c02b0d0ac94992496fad3aa03734cb223b422))


### Bug Fixes

* avoid ToggleButtonGroup becomes null value ([46b75c8](https://github.com/Sekai-World/sekai-viewer/commits/46b75c8f6ad2414dc243b10622f4cf27315c5226))


### Refactors

* **card:** card detail page layout optimize ([23f637f](https://github.com/Sekai-World/sekai-viewer/commits/23f637f0ffa00b2d098fd8ab673d41e7bd798795))
* **music:** make mp3 trim only when toggle is turned on ([17a8715](https://github.com/Sekai-World/sekai-viewer/commits/17a87158feeda1daa9a6bb77e45f4f0d7893b86f))

### [0.4.10](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.9...v0.4.10) (2021-03-19)


### Features

* **event:** add boost cards and virtual live section ([b30806f](https://github.com/Sekai-World/sekai-viewer/commits/b30806fb62d7289fb85a9b49d6c1e335d2a85a3c))
* user can control whether to display spoiler content ([3f22a94](https://github.com/Sekai-World/sekai-viewer/commits/3f22a940d2c463d16d49fe3ea0b17544f2256175))
* **card:** add gacha phrase with audio ([ad10d34](https://github.com/Sekai-World/sekai-viewer/commits/ad10d34af27774815c2f0a5c6292031d451b55d7))


### Bug Fixes

* **event:** handle event without virtual live ([e74c95e](https://github.com/Sekai-World/sekai-viewer/commits/e74c95efb0ae767c136f6887cdd73aa3842c62fb))
* card list filter dispatch function name ([124bd21](https://github.com/Sekai-World/sekai-viewer/commits/124bd21d2f06ed42aee2afe372bc0e5aee3fdea1))
* **card:** card list repeat no key warning ([a14fa2c](https://github.com/Sekai-World/sekai-viewer/commits/a14fa2c4d1fbe0072ff1156320c9187dcfed1646))
* **misc:** audio play button unload howl on unmount ([5d0a328](https://github.com/Sekai-World/sekai-viewer/commits/5d0a3286c649d6d7dc4f71a75a54dc3d43167628))
* **utils:** useLocalStorage reset value upon error ([503bdd0](https://github.com/Sekai-World/sekai-viewer/commits/503bdd0c044fa6da857811792d27265e590cd7df))


### Refactors

* index check sekai profile update as well ([1856756](https://github.com/Sekai-World/sekai-viewer/commits/18567563842cd5eec716c564621b4f5f2687d398))

### [0.4.9](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.8...v0.4.9) (2021-03-09)


### Features

* **music:** add music meta page ([f85555f](https://github.com/Sekai-World/sekai-viewer/commits/f85555fff9de56499c074a6669cedb2c37b0309a))
* **subs:** add padding to popover ([818d6f8](https://github.com/Sekai-World/sekai-viewer/commits/818d6f8a6c3cf2c553b15fcd478d7883cc6b1fb4))


### Refactors

* **mr:** table columns layout optimization ([bd16beb](https://github.com/Sekai-World/sekai-viewer/commits/bd16bebbb1527e9d993f34bccf1312e92549a829))
* **mr:** table refine ([1338bce](https://github.com/Sekai-World/sekai-viewer/commits/1338bce724087b58459ecafcabe44235b1f81e15))
* **utils:** update music meta url ([8fd6e2c](https://github.com/Sekai-World/sekai-viewer/commits/8fd6e2c9584e0ac014f2c97649708abebe2549af))

### [0.4.8](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.7...v0.4.8) (2021-03-03)


### Features

* **card:** only show support unit filter when vs character selected ([bf1bc54](https://github.com/Sekai-World/sekai-viewer/commits/bf1bc5498ee93bbf178c51af105c2c19cbf87667))
* **event:** add sekai event record to event tracker ([dcdc811](https://github.com/Sekai-World/sekai-viewer/commits/dcdc811b6bc25e4dff03eef5eee770622bf4569d))
* **music:** jacket for sekai ver of charles ([50b4ad9](https://github.com/Sekai-World/sekai-viewer/commits/50b4ad979b97ff26b6567a10925ee927968e41b8))
* **user:** allow user check event record in the past ([1406dc8](https://github.com/Sekai-World/sekai-viewer/commits/1406dc89fa69a3e204debd7c40538c12e8950857))
* **user:** card filter sync to card list ([230c02e](https://github.com/Sekai-World/sekai-viewer/commits/230c02e8ec6d0919be135a64eade794c387caeb0))


### Bug Fixes

* **event:** disable time travel slider when fetching data ([5e4c5b5](https://github.com/Sekai-World/sekai-viewer/commits/5e4c5b5ff5c7765dc1770eaf49faef68e62d9597))
* **event:** event tracker current event button does not fetch data ([3995b78](https://github.com/Sekai-World/sekai-viewer/commits/3995b7880cc2f5129310884a68a67721cd5b0e37))
* **user:** music statistics full combo count ([9aff556](https://github.com/Sekai-World/sekai-viewer/commits/9aff5561328988e66e1900aad2f378f9892f9f5b))


### Refactors

* update service worker cache strategy ([a0d6cc6](https://github.com/Sekai-World/sekai-viewer/commits/a0d6cc6c01a89890580b1fc3922e7e036dca0f99))

### [0.4.7](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.6...v0.4.7) (2021-02-20)


### Features

* add placeholder for event analyzer ([48f3221](https://github.com/Sekai-World/sekai-viewer/commits/48f3221d7f3fc3183a0f0e43f3b79086e1bb07f6))
* **event:** event tracker time travel ([ea49c1a](https://github.com/Sekai-World/sekai-viewer/commits/ea49c1a8875a9885bff162dd8b16f021ba0f2e72))


### Bug Fixes

* **event:** add missing prediction to event tracker mobile view ([05b4da1](https://github.com/Sekai-World/sekai-viewer/commits/05b4da1a0ffdcc45ee39372a08b23938f44185e5))
* **event:** add show full rank switch to event tracker ([bd55669](https://github.com/Sekai-World/sekai-viewer/commits/bd556696977b5919048353db26e12c562fe7b011))


### Refactors

* **event:** event tracker better mobile view, remove unnecessary buttons ([da19859](https://github.com/Sekai-World/sekai-viewer/commits/da19859defdae25ed7d071a30641893e06c93767))

### [0.4.6](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.5...v0.4.6) (2021-02-18)


### Features

* **degree:** show degree level icons ([ba6a13f](https://github.com/Sekai-World/sekai-viewer/commits/ba6a13f924724fb15d777f5430b4eb645b859e46))
* **user:** sekai profile music statistics ([aaa77bc](https://github.com/Sekai-World/sekai-viewer/commits/aaa77bcca11846f60e267a5c80ab53404bf9147d))


### Bug Fixes

* **unit-detail:** music name use translation ([4b2b7b0](https://github.com/Sekai-World/sekai-viewer/commits/4b2b7b0034b3467903ad134f80fe94e0146dd8f4))
* **widget:** event banner no jump ([36d8c5e](https://github.com/Sekai-World/sekai-viewer/commits/36d8c5ead6ce6a3a0f510601404c674ca1f192be))


### Refactors

* **event:** event tracker layout refine ([2b8de3c](https://github.com/Sekai-World/sekai-viewer/commits/2b8de3c8aadb57f45cfb8faec99c4ef25e4b019f))
* change adsense behaviour ([3d95319](https://github.com/Sekai-World/sekai-viewer/commits/3d95319bad44fb1279714840fc977340772f91fd))
* unregister service worker if hostname not match ([6f3ace6](https://github.com/Sekai-World/sekai-viewer/commits/6f3ace6cfe00ea3a0a17a945759b69a6f6c713b0))

### [0.4.5](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.4...v0.4.5) (2021-02-12)


### Features

* **filter:** stamp list character filter local storage ([2d93902](https://github.com/Sekai-World/sekai-viewer/commits/2d93902f968f9c55087dc4055b46a93ce9e9f102))
* card filter of event bonuses ([73d3c73](https://github.com/Sekai-World/sekai-viewer/commits/73d3c73bc7170e1c52c63c5cdf908ab4d748aee7))
* **user:** better card importer ([ccc6829](https://github.com/Sekai-World/sekai-viewer/commits/ccc6829a97d0371d7cf53422e54fa2aa55c39aa9))


### Bug Fixes

* **music:** music tag translation empty ([463f1dd](https://github.com/Sekai-World/sekai-viewer/commits/463f1dd6b2490f8dde77ebb1df22a99bebea3be8))

### [0.4.4](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.3...v0.4.4) (2021-02-11)


### Bug Fixes

* **live2d:** small screen size error, avoid loading interruption ([a271938](https://github.com/Sekai-World/sekai-viewer/commits/a27193893ad90ee325cb16cf96becb3f737b6e02))


### Refactors

* **card:** agenda view fit large screen ([8e3723c](https://github.com/Sekai-World/sekai-viewer/commits/8e3723c5d824cfc467da9053237a68b558c32b1e))
* use useLocalStorage hooks instead of setItem ([633d8fe](https://github.com/Sekai-World/sekai-viewer/commits/633d8fe02372f521cecb4b06c11a3d691ad03de0))

### [0.4.3](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.2...v0.4.3) (2021-02-08)


### Features

* **card:** filter local storage save, add reset filter button ([89b566b](https://github.com/Sekai-World/sekai-viewer/commits/89b566bc08e20e10019b40176c53036119a3645a))
* **honor:** list filter memory in local storage ([f9860ae](https://github.com/Sekai-World/sekai-viewer/commits/f9860ae222e801f8707e53433ce6eb89e845f1ea))
* **misson:** list filter memory using local storage ([cd47dbe](https://github.com/Sekai-World/sekai-viewer/commits/cd47dbe864cd49495ae320d204c9d4432c6052a2))
* **music:** do same thing as in card list filter ([1bc0ca7](https://github.com/Sekai-World/sekai-viewer/commits/1bc0ca71687fbb1e539889c102c5d78ea781b3bb))
* skill filter for cardList ([bfe4e3c](https://github.com/Sekai-World/sekai-viewer/commits/bfe4e3c7b7de359dd4bd0cc374d02172cf136d01))


### Bug Fixes

* **card:** remove warning ([19f298e](https://github.com/Sekai-World/sekai-viewer/commits/19f298ed29b82bca276e392fa6dee012ae4683ac))
* **stamp:** download url ([111cb71](https://github.com/Sekai-World/sekai-viewer/commits/111cb71b5050235eaa9f0205984654c164be5adc))
* **team:** fix build ([ed20745](https://github.com/Sekai-World/sekai-viewer/commits/ed2074559089c3e58d34b7ff540a522a1814dc4e))
* **team:** team power calculation ([f5ee163](https://github.com/Sekai-World/sekai-viewer/commits/f5ee1633fe1ac1df8428142e9f8cb5cd6c270b18))
* **user:** "perfect_score_up" skill type filtering ([8f6b56b](https://github.com/Sekai-World/sekai-viewer/commits/8f6b56bd891a7f8f08c7e5a6725878f755545ce5))
* **user:** cannot add card when card list is empty ([e9c7321](https://github.com/Sekai-World/sekai-viewer/commits/e9c7321b6c040338bf10569066bb55753be48cd4))


### Refactors

* filter dense layout ([801a447](https://github.com/Sekai-World/sekai-viewer/commits/801a4475bd1a06789c3cae4cf9787af9b97d8814))

### [0.4.2](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.1...v0.4.2) (2021-02-04)


### Features

* **user:** add user sekai statistics panel ([c91eedc](https://github.com/Sekai-World/sekai-viewer/commits/c91eedc4575dedd56ff96b77dd6cca5189410c03))
* add area items cached data ([56bc7a8](https://github.com/Sekai-World/sekai-viewer/commits/56bc7a8eb3d40657268444919468488235713625))
* **user:** show user honors in sekai profile ([3198142](https://github.com/Sekai-World/sekai-viewer/commits/31981425a42459ef3f4df0faef8f07483cdfd6f3))


### Bug Fixes

* **about:** it translator name ([27f5b0e](https://github.com/Sekai-World/sekai-viewer/commits/27f5b0e4d21adea53193933a01be9b3a5f7de1e3))
* **user:** missing close button of help carousel ([70f11e4](https://github.com/Sekai-World/sekai-viewer/commits/70f11e4137bd5c5f47438c71b059ad110defce74))


### Refactors

* improve adsense block display ([3fe781c](https://github.com/Sekai-World/sekai-viewer/commits/3fe781c5a0379110c71a9fa780813a752a155784))

### [0.4.1](https://github.com/Sekai-World/sekai-viewer/compare/v0.4.0...v0.4.1) (2021-02-03)


### Features

* **user:** add help to import cards ([9d44612](https://github.com/Sekai-World/sekai-viewer/commits/9d446126fb5b826d80cb89a6e1e07998e4eb58a3))
* add adsense blocks ([9c666f2](https://github.com/Sekai-World/sekai-viewer/commits/9c666f26a7463b8073440f904a607253dd2604d0))


### Bug Fixes

* **team-build:** add card crash if not logged in ([31d7441](https://github.com/Sekai-World/sekai-viewer/commits/31d7441d411f69af0a0c343b0e11221ba8bbd6df))
* **user:** import tweak to solve some screenshot matching problem ([f8077b1](https://github.com/Sekai-World/sekai-viewer/commits/f8077b1579b9a84115c74fffe65278b04c6efff6))


### Refactors

* **user:** reduce tesseract worker count to 1 to save memory ([c6d9b06](https://github.com/Sekai-World/sekai-viewer/commits/c6d9b069e032ad52061be096ecefb232212d09da))

## [0.4.0](https://github.com/Sekai-World/sekai-viewer/compare/v0.3.2...v0.4.0) (2021-01-30)


### Features

* **api:** add putSekaiDeckList and deleteSekaiDeckList ([ad5ce76](https://github.com/Sekai-World/sekai-viewer/commits/ad5ce762f736c1055d056627c6fc634a1d64cf8a))
* **card:** medium thumbnail supports showing card power as well ([95511cd](https://github.com/Sekai-World/sekai-viewer/commits/95511cde0cb631565d015325e21248db3b9b6458))
* **card:** thumbnail show card data ([5cf7779](https://github.com/Sekai-World/sekai-viewer/commits/5cf77793e340d30f08dbeb9061d707ee3ded3d7d))
* **user:** add sekai card management board ([0b1e50c](https://github.com/Sekai-World/sekai-viewer/commits/0b1e50c74b5f0d59171b2bc2e42e690059c8d43b))
* **user:** allow modify skill level upon importing and modifying in list ([7931948](https://github.com/Sekai-World/sekai-viewer/commits/79319480f28c691fb778b620957f44c115ddc9c8))
* **user:** allow partial update sekai profile and user meta ([4c73e08](https://github.com/Sekai-World/sekai-viewer/commits/4c73e08f80e39ba0ec2421e02c27bf3c105637a1))
* **user:** import sekai cards ([76586e7](https://github.com/Sekai-World/sekai-viewer/commits/76586e7c505df215909763c7fe541e575e3be84d))
* **user:** load sekai user team ([6386169](https://github.com/Sekai-World/sekai-viewer/commits/6386169d819e0e580f6e7d7177bbb28cfb8c8f95))
* **user:** sekai profile sub components lazy laoding ([ad7d665](https://github.com/Sekai-World/sekai-viewer/commits/ad7d6650b2d1a75c88ec733ebb73bbca1cb96e1a))
* **utils:** add useLocalStorage and useToggle hooks ([0d8d7e9](https://github.com/Sekai-World/sekai-viewer/commits/0d8d7e95b81b88a2c1e0e18b62072529703e69ca))


### Bug Fixes

* **card:** thumbnail rarity star position ([eb4c394](https://github.com/Sekai-World/sekai-viewer/commits/eb4c394e2deac992a38f3a35bac93b07ea293356))
* **music:** audio player animation stop after seeking ([9029ec5](https://github.com/Sekai-World/sekai-viewer/commits/9029ec5bd8e52dd923091f9e64f05258d08aa9de))
* **music-recommend:** typo ([d800b76](https://github.com/Sekai-World/sekai-viewer/commits/d800b76bc1431220b7c479d0b82aaca787b184f6))
* **types:** remove SekaiCard, use ITeamCardState directly ([6fe9ad9](https://github.com/Sekai-World/sekai-viewer/commits/6fe9ad97dd1a078fa15d169349462dcb34dfbe27))
* **user:** correct auto total power calc process ([30a4e22](https://github.com/Sekai-World/sekai-viewer/commits/30a4e22355a49fd6391ccab3197dc84feda2c45b))
* **user:** due to change of other module ([0c4ab44](https://github.com/Sekai-World/sekai-viewer/commits/0c4ab446349a759b86f1c101b53ed690826667d3))
* **user:** sekai profile crash when no sekai profile created ([f674ec8](https://github.com/Sekai-World/sekai-viewer/commits/f674ec80b4ac0f501cfb6e112e144917225f1e18))
* card master rank icon level 5 ([4705fb8](https://github.com/Sekai-World/sekai-viewer/commits/4705fb8ddde251990379fd1d1fbdb226f8a1c444))
* preview download png instead of webp ([5a61fe1](https://github.com/Sekai-World/sekai-viewer/commits/5a61fe15c86fb0f40104f21617018e123c98d54d))


### Refactors

* **api:** strapi card model fix, add put and delete sekai card list api ([5c196c6](https://github.com/Sekai-World/sekai-viewer/commits/5c196c62cd54c108d99566c543dfee916963d1a5))
* **live2d:** read model list from remote ([1fbe666](https://github.com/Sekai-World/sekai-viewer/commits/1fbe666278a983a962eabc91455046605483395e))
* **user:** import card power instead of level ([83ed3b6](https://github.com/Sekai-World/sekai-viewer/commits/83ed3b653c43c242d9a6273d3d6a6e9618bbfd00))
* **user:** load team sekai team text change and space between sections ([18004d1](https://github.com/Sekai-World/sekai-viewer/commits/18004d10e2d18a8644452fa76f54f762d6b52fad))
* **user:** move update sekai profile button to same line of sekai id ([b130018](https://github.com/Sekai-World/sekai-viewer/commits/b130018de95a0d4a771443869b9e9cda39a4c360))
* **user:** remove unnecessary console.log ([793ce9e](https://github.com/Sekai-World/sekai-viewer/commits/793ce9e5a3195c454381af01071da7ca40320dfd))
* **user:** sekai id panel layout fix ([55308ae](https://github.com/Sekai-World/sekai-viewer/commits/55308aefefc7437cac614dde0a6fe1855c0b6b69))
* **user:** store more card states for calculating card power ([31fd647](https://github.com/Sekai-World/sekai-viewer/commits/31fd6472fbaf5b654c463067732eaaf5e08555f2))
* **user:** team manager layout change, edit card power, auto calc total power ([7288929](https://github.com/Sekai-World/sekai-viewer/commits/72889298949caab47599f6c82fff52d68e8d3a59))
* **user:** user card list changes when cloud card list changes ([9cdf769](https://github.com/Sekai-World/sekai-viewer/commits/9cdf7693e72eacef74e9ba3c8474f2b282aa252c))
* modify global scrollbar style (only for webkit) ([90badc9](https://github.com/Sekai-World/sekai-viewer/commits/90badc9aef7dcbaae7bf2000cbddccc11c1719b7))

### [0.3.2](https://github.com/Sekai-World/sekai-viewer/compare/v0.3.1...v0.3.2) (2021-01-18)


### Features

* sort by id for all list page ([a4f755e](https://github.com/Sekai-World/sekai-viewer/commits/a4f755e118b62bebd41e11e8e0393491d4f7ba2b))
* **event:** allow track more rankings ([d57d8fa](https://github.com/Sekai-World/sekai-viewer/commits/d57d8fae1eb887e1e015ce235d94b0999eeded6d))
* **music:** add music mv type filter ([2591712](https://github.com/Sekai-World/sekai-viewer/commits/25917120f277819d8e0a3891a7dd33191978760d))


### Bug Fixes

* language code not in list may cause error ([e7c9587](https://github.com/Sekai-World/sekai-viewer/commits/e7c9587052e07ef632bd1da4abaa4b97c628563b))
* **live2d:** wrong model size on mobile device full screen ([1ecafaa](https://github.com/Sekai-World/sekai-viewer/commits/1ecafaae19e1e882696289ea5be1e589999e8a97))
* **pwa:** update notification not shown in firefox ([09a1488](https://github.com/Sekai-World/sekai-viewer/commits/09a14887ff6fc5cb4c27edfc186feaf0fae09ecf))


### Refactors

* move spoiler tag inside image in grid view ([da1bcc2](https://github.com/Sekai-World/sekai-viewer/commits/da1bcc2086c6827b9850d7599e49bcc3aef56673))
* **annoucnement:** use created_at instead of published_at as publication time ([891a893](https://github.com/Sekai-World/sekai-viewer/commits/891a89388c02240f398fbc1a5df8755714876562))

### [0.3.1](https://github.com/Sekai-World/sekai-viewer/compare/v0.3.0...v0.3.1) (2021-01-16)


### Bug Fixes

* home screen white blank page bug ([a634397](https://github.com/Sekai-World/sekai-viewer/commits/a634397255e80b42ae5473142a95ea1a85d2bdd3))


### Refactors

* reduce load i18n json requests ([e6e26c4](https://github.com/Sekai-World/sekai-viewer/commits/e6e26c429fbcc5a50f75754aba28ec8058f713bd))

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
