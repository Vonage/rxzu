## [3.2.1](https://github.com/Vonage/rxzu/compare/v3.2.0...v3.2.1) (2021-04-22)


### Bug Fixes

* export drop action ([389540d](https://github.com/Vonage/rxzu/commit/389540d082220acbb96a35186194426f9bef361b))
* **fit-to-center:** fix calculation ([1edbc5d](https://github.com/Vonage/rxzu/commit/1edbc5d7593eba90799be9c48709e493808019fd))

# [3.2.0](https://github.com/Vonage/rxzu/compare/v3.1.0...v3.2.0) (2021-04-21)


### Bug Fixes

* **delete action:** fix delete key pressed action ([5b79614](https://github.com/Vonage/rxzu/commit/5b796144985326f589eb88ff0ef70ce0c2541718))
* **delete action:** fix delete key pressed action ([7203014](https://github.com/Vonage/rxzu/commit/72030146ea7eb76d9cc81c5112d002c45f0e49ee))


### Features

* **engine:** add fit to center ability ([2ca0b26](https://github.com/Vonage/rxzu/commit/2ca0b26c41db084cbdf9244987871ce013387aaa))

# [3.1.0](https://github.com/Vonage/rxzu/compare/v3.0.7...v3.1.0) (2021-04-21)


### Features

* **actions:** add drop action ([7233777](https://github.com/Vonage/rxzu/commit/7233777a01c3a81ba8fb2874d13fd8b734b5790d))

## [3.0.7](https://github.com/Vonage/rxzu/compare/v3.0.6...v3.0.7) (2021-04-18)


### Bug Fixes

* **dependencies:** add rxjs and dagre to peer dependencies to prevent conflicts ([d6a97fb](https://github.com/Vonage/rxzu/commit/d6a97fbce57523a678bb76f926509b94367cba80))

## [3.0.6](https://github.com/Vonage/rxzu/compare/v3.0.5...v3.0.6) (2021-04-14)


### Bug Fixes

* **extras:** set the value as passed ([db355ce](https://github.com/Vonage/rxzu/commit/db355ce4e9bf4121de9423c46c701b67add9892a))
* **link:** merge with current extras ([0b5a3bc](https://github.com/Vonage/rxzu/commit/0b5a3bc0190ee1be3ecb4fa5d5eb9a1f56f9a98e))
* **mouse:** change minimum zoom limitation ([67b1509](https://github.com/Vonage/rxzu/commit/67b150971e24a37779c856a87dbcfe7fd89d32dd))

## [3.0.5](https://github.com/Vonage/rxzu/compare/v3.0.4...v3.0.5) (2021-04-03)


### Bug Fixes

* **cyclic:** updated imports to remove cyclic dependencies ([b576592](https://github.com/Vonage/rxzu/commit/b5765920f55015b00245cac662939bdac1f1efab))

## [3.0.4](https://github.com/Vonage/rxzu/compare/v3.0.3...v3.0.4) (2021-03-31)


### Bug Fixes

* **host:** models are no longer bound to host view ([a0d9937](https://github.com/Vonage/rxzu/commit/a0d993789dcf04585a08839f3af3637718b3afcb))

## [3.0.3](https://github.com/Vonage/rxzu/compare/v3.0.2...v3.0.3) (2021-03-30)


### Bug Fixes

* **optional models:** added optional to all models ([1780c6d](https://github.com/Vonage/rxzu/commit/1780c6d97e718920d7bdcbc2c24f2d5f9f317126))


### Performance Improvements

* **deps:** updated all deps to latest ([485d681](https://github.com/Vonage/rxzu/commit/485d6817d0550b6dfd1ecf9354585de203588285))

## [3.0.2](https://github.com/Vonage/rxzu/compare/v3.0.1...v3.0.2) (2021-03-29)


### Bug Fixes

* **deps:** removed unnecessary dependencies ([e8956a2](https://github.com/Vonage/rxzu/commit/e8956a25b09ce9589f5bc0b31a77a62c217c2a98))

## [3.0.1](https://github.com/Vonage/rxzu/compare/v3.0.0...v3.0.1) (2021-03-29)


### Bug Fixes

* **typings:** added resize-observer-browser typing to core ([18ddd83](https://github.com/Vonage/rxzu/commit/18ddd8393030174fa551fd2af4c758a77a13c006))

# [3.0.0](https://github.com/Vonage/rxzu/compare/v2.2.3...v3.0.0) (2021-03-29)


### Bug Fixes

* generate links & dynamic ports ([9343733](https://github.com/Vonage/rxzu/commit/9343733e38c9bc83af5fb4474e33b22b457e4a4c))
* **state:** removed un neccesery emits ([f9be243](https://github.com/Vonage/rxzu/commit/f9be2437253dfef0369bab52528d0e1b1bba6561))
* factories reimplementation ([24eb729](https://github.com/Vonage/rxzu/commit/24eb729496e34d87b5929f1fbe7eec89cd9f74f0))


### Features

* **auto dimensions:** resize observer to resolve node and port dimensions automatically ([d97e372](https://github.com/Vonage/rxzu/commit/d97e372e560b00a3406e840d530443a849b90180))
* **core:** change factory implementation ([5ad231d](https://github.com/Vonage/rxzu/commit/5ad231df2f1303f6ae238089ec65f2c2122b942c))
* **themes:** gh theme finished ([0f45722](https://github.com/Vonage/rxzu/commit/0f45722e45ee5dfce3ffa9fe044df056e649723f))
* **themes:** styling ([1807d0f](https://github.com/Vonage/rxzu/commit/1807d0fcb20a1d5c65ef7a031787423fe80efd57))
* **v3:** initial work ([09c534d](https://github.com/Vonage/rxzu/commit/09c534d88766414a20b2038ccde8b4c012210b91))


### BREAKING CHANGES

* **core:** rename diagramEngineCore to diagramEngine
delete FactoriesManager
add entityType to base.entity
delete default angular factories
rename angular's DiagramEngine to EngineService

## [2.2.3](https://github.com/Vonage/rxzu/compare/v2.2.2...v2.2.3) (2021-03-08)


### Bug Fixes

* **keyboard:** fire delete action only if pressed the delete key ([311989b](https://github.com/Vonage/rxzu/commit/311989bee7751bf29dea43d5a4a2718b51c2cf1d))

## [2.2.2](https://github.com/Vonage/rxzu/compare/v2.2.1...v2.2.2) (2021-03-04)


### Bug Fixes

* **events:** remove contenteditable ([5365877](https://github.com/Vonage/rxzu/commit/53658772ea5c84cea53654fba3562b800fb1a740))
* **events:** remove contenteditable ([c94d1f9](https://github.com/Vonage/rxzu/commit/c94d1f9e2246591cc2f2f2a54e60559dd9a42903))

## [2.2.1](https://github.com/Vonage/rxzu/compare/v2.2.0...v2.2.1) (2021-03-04)


### Bug Fixes

* **action:** add new actions to actions index ([29d51f0](https://github.com/Vonage/rxzu/commit/29d51f09ef4662f7499ddb778fcd0060488abe01))

# [2.2.0](https://github.com/Vonage/rxzu/compare/v2.1.4...v2.2.0) (2021-03-04)


### Features

* **general:** add keyboard manager ([382d0d4](https://github.com/Vonage/rxzu/commit/382d0d43bfaacafa39c35d0211c41b15f3f56d6c))
* **keyboard:** add copy paste events ([400c429](https://github.com/Vonage/rxzu/commit/400c4290d12b5f1b19a14b36fd831edcb6d054cc))
* **keyboard manager:** fix cr comments ([c54ed9b](https://github.com/Vonage/rxzu/commit/c54ed9bfc94ab434045ad7add87d427441a16a94))
* **keyboard manager:** fix cr comments ([7fb1d24](https://github.com/Vonage/rxzu/commit/7fb1d246f581dae745ff788452b8f245c6b36756))
* **keyboard manager:** fix cr comments ([ea18c52](https://github.com/Vonage/rxzu/commit/ea18c524c16b3523d50715ed1cf1ff3b2247ffb8))
* **keyboard manager:** fix cr comments ([19d4973](https://github.com/Vonage/rxzu/commit/19d49737334b8d4dcce2b562f32f05ff322206df))
* **keyboard manager:** fix cr comments ([92fa193](https://github.com/Vonage/rxzu/commit/92fa19391c27989d75abf4c88554bf4268efd7a0))
* **keyboard manager:** fix cr comments ([0bc5259](https://github.com/Vonage/rxzu/commit/0bc5259575ecc47e7932a37fe8e4639b01691105))
* **keyboard manager:** fix cr comments ([0de5fa0](https://github.com/Vonage/rxzu/commit/0de5fa0a85d56277ab3b6a6c3f0f1ed3be6b66c6))
* **keyboard manager:** fix cr comments ([94d1455](https://github.com/Vonage/rxzu/commit/94d14554015b524ee5c7698301b9d33534c5b5f6))
* **keyboard manager:** fix cr in progress ([dab3950](https://github.com/Vonage/rxzu/commit/dab39501c456b10c3be177f21932898c093b635e))
* **keyboard manager:** fix cr in progress ([0d90e76](https://github.com/Vonage/rxzu/commit/0d90e76fecaf72b43d8ac6b215588b1f13e3b8c6))
* **keyboard manager:** fix cr in progress ([1a862f7](https://github.com/Vonage/rxzu/commit/1a862f79cf88ec5254aadaf63df4c0d0be1a22cd))

## [2.1.4](https://github.com/Vonage/rxzu/compare/v2.1.3...v2.1.4) (2021-03-01)


### Bug Fixes

* **mouse manager:** fix mouse up triggered twice intead of one every time item is moved ([f453939](https://github.com/Vonage/rxzu/commit/f453939ffe20e91d32be4030e62e344f2ab4e1df))

## [2.1.3](https://github.com/Vonage/rxzu/compare/v2.1.2...v2.1.3) (2021-02-21)


### Bug Fixes

* **select action:** fix checking if element is contains in box,now also check the bottom right point ([ca0e178](https://github.com/Vonage/rxzu/commit/ca0e178edb055e1670ea74fd2491dccb88c25df5))

## [2.1.2](https://github.com/Vonage/rxzu/compare/v2.1.1...v2.1.2) (2021-02-18)


### Bug Fixes

* **auto arrange:** fix DagrePlugin set coordinates ([c47e929](https://github.com/Vonage/rxzu/commit/c47e929799f9c6bf421f53841767d91683b05040))

## [2.1.1](https://github.com/Vonage/rxzu/compare/v2.1.0...v2.1.1) (2021-02-10)


### Bug Fixes

* **node layers rect:** calc right and top nodes including the width and height ([75423c8](https://github.com/Vonage/rxzu/commit/75423c844e0cd2e8551118b974fa53bb714aae13))
* **node layers rect:** calc right and top nodes including the with and height ([c74eb12](https://github.com/Vonage/rxzu/commit/c74eb12d35116cf2163b2c669d1ad9385d30b345))
* **node layers rect:** calc right and top nodes including the with and height ([8926af1](https://github.com/Vonage/rxzu/commit/8926af12e560f4bd40fd886f82aef4c4bf0205dc))
* **node layers rect:** calc right and top nodes including the with and height ([37a6860](https://github.com/Vonage/rxzu/commit/37a6860bb42b693664ea7a37b541c71adbd89e85))

# [2.1.0](https://github.com/Vonage/rxzu/compare/v2.0.2...v2.1.0) (2021-02-09)


### Features

* **genral:** add the ability to zoom to fit and zoom to nodes ([94dea1b](https://github.com/Vonage/rxzu/commit/94dea1b84c4b10723f6865a651699e2cdb7bacb2))
* **genral:** add the ability to zoom to fit and zoom to nodes ([8580874](https://github.com/Vonage/rxzu/commit/8580874687e2a1f74e6a02575d6aa434ac03c009))
* **genral:** fix comments ([0d9526f](https://github.com/Vonage/rxzu/commit/0d9526f98eb914316a1d7d1e3ae8ce4de3c13832))
* **genral:** fix comments ([bf70291](https://github.com/Vonage/rxzu/commit/bf70291236d855034a1c87490dfdbfa46267cdcb))
* **genral:** fix comments ([cfac5f3](https://github.com/Vonage/rxzu/commit/cfac5f3d209b843565914384e446297ce19a9847))

## [2.0.2](https://github.com/Vonage/rxzu/compare/v2.0.1...v2.0.2) (2021-01-31)


### Bug Fixes

* **ctx menu:** chrome bug when clicking right mouse button, mouse up isn't fired ([9b1b383](https://github.com/Vonage/rxzu/commit/9b1b383347b5a8ea67d0cb3af92347978bfb8ede))

## [2.0.1](https://github.com/Vonage/rxzu/compare/v2.0.0...v2.0.1) (2021-01-31)


### Bug Fixes

* **multiple select:** if point is attached to port, don't select ([f008d13](https://github.com/Vonage/rxzu/commit/f008d13992877a5168a40e54f2d7abda7596bb68))

# [2.0.0](https://github.com/Vonage/rxzu/compare/v1.5.3...v2.0.0) (2021-01-30)


### Bug Fixes

* **angular:** enable strict mode ([6c30470](https://github.com/Vonage/rxzu/commit/6c304708118f40043fc105f51f9aec273b3340b9))


### Features

* **strict typescript:** strict mode enabled on all libraries and storybook ([5e967c8](https://github.com/Vonage/rxzu/commit/5e967c8bdb32d27458fe31355b1b220a702d4ac6))


### BREAKING CHANGES

* **strict typescript:** angular components no longer extend base models | factories structure changed

## [1.5.3](https://github.com/Vonage/rxzu/compare/v1.5.2...v1.5.3) (2021-01-10)


### Bug Fixes

* **default node:** removed default animations on node appearance ([0aa6502](https://github.com/Vonage/rxzu/commit/0aa6502e0b236e68601f3bf871601e1bec1c0d05))

## [1.5.2](https://github.com/Vonage/rxzu/compare/v1.5.1...v1.5.2) (2021-01-09)


### Bug Fixes

* **state:** isArray native ([c0c7f7e](https://github.com/Vonage/rxzu/commit/c0c7f7e2a09a1e0d467889acd60c7b42f8657964))

## [1.5.1](https://github.com/Vonage/rxzu/compare/v1.5.0...v1.5.1) (2021-01-09)


### Bug Fixes

* **angular links:** hover change detection manually triggered ([f9aac7c](https://github.com/Vonage/rxzu/commit/f9aac7c8eb3d25a88e54d65a13c002a6fd456837))
* **dynamic:** ports updates will now consider offsets and zoom level ([9a35868](https://github.com/Vonage/rxzu/commit/9a35868f9fe831c11ab5c851ddb51377eb244281))
* **imports:** removed unused imports, build only whats neccessery ([3fb1e89](https://github.com/Vonage/rxzu/commit/3fb1e89ed31ce88c4163959919558994e26c4668))

# [1.5.0](https://github.com/Vonage/rxzu/compare/v1.4.0...v1.5.0) (2021-01-08)


### Features

* **engine:** node and canvas selectors ([a41f760](https://github.com/Vonage/rxzu/commit/a41f76072e869dfef87ec7eea4c9da2738cf82c0))

# [1.4.0](https://github.com/Vonage/rxzu/compare/v1.3.0...v1.4.0) (2021-01-08)


### Features

* **link:** points selector added ([ec48ab1](https://github.com/Vonage/rxzu/commit/ec48ab11003753b24fdc563d8895ee10137e0990))

# [1.3.0](https://github.com/Vonage/rxzu/compare/v1.2.5...v1.3.0) (2021-01-06)


### Features

* **links and ports:** dynamically updating coords on changes ([1b032f2](https://github.com/Vonage/rxzu/commit/1b032f264551547a79854f86eb4b14cc16e0686c))

## [1.2.5](https://github.com/Vonage/rxzu/compare/v1.2.4...v1.2.5) (2021-01-05)


### Performance Improvements

* **rxjs:** updated version ([65a8102](https://github.com/Vonage/rxzu/commit/65a81025a7b3cbb61c65d5430a977932924ebe36))

## [1.2.4](https://github.com/Vonage/rxzu/compare/v1.2.3...v1.2.4) (2021-01-04)


### Bug Fixes

* **labels:** will be selected and not painted once ([990d79f](https://github.com/Vonage/rxzu/commit/990d79f7138540e96c2368b585575dba1327bfd6))

## [1.2.3](https://github.com/Vonage/rxzu/compare/v1.2.2...v1.2.3) (2021-01-04)


### Bug Fixes

* **inverse zoom:** fixed assignment ([e181ee3](https://github.com/Vonage/rxzu/commit/e181ee3b2a8c3a7dbd1fbed174aaf37b49391002))

## [1.2.2](https://github.com/Vonage/rxzu/compare/v1.2.1...v1.2.2) (2021-01-03)


### Bug Fixes

* **link model:** path and points moved to model to fix imports issue ([1006135](https://github.com/Vonage/rxzu/commit/10061354ab39a878d2219912c0281dcc424f6901))

## [1.2.1](https://github.com/Vonage/rxzu/compare/v1.2.0...v1.2.1) (2021-01-03)


### Bug Fixes

* **events:** added event state to actions observer ([8af62bd](https://github.com/Vonage/rxzu/commit/8af62bd517ba61d42c6356fc394132565dac2b0a))

# [1.2.0](https://github.com/Vonage/rxzu/compare/v1.1.1...v1.2.0) (2021-01-03)


### Features

* **metadata:** updated packages and versions ([0af7376](https://github.com/Vonage/rxzu/commit/0af73768cbd28e692da4f3606e47e6b4118f7575))

## [1.1.1](https://github.com/Vonage/rxzu/compare/v1.1.0...v1.1.1) (2021-01-02)


### Bug Fixes

* **publish:** packges public access ([5fa989b](https://github.com/Vonage/rxzu/commit/5fa989bde55fb04c5246838820fae4f854820f76))

# [1.1.0](https://github.com/Vonage/rxzu/compare/v1.0.0...v1.1.0) (2021-01-02)


### Features

* **docs:** readme on both packages ([494d2ce](https://github.com/Vonage/rxzu/commit/494d2cedf40f7babf477cca43abc068063e69447))
