# Visual Programming for SDL (SmartDeviceLink)

[[DEMO] Enjoy DriDrin visual programming](https://dridrin.github.io/dridrin-blocks/)


## How to build

```
$ git clone https://github.com/dridrin/dridrin-blocks.git
$ git clone https://github.com/dridrin/scratch-gui.git
$ git clone https://github.com/dridrin/scratch-vm.git
$ git clone https://github.com/dridrin/scratch-l10n.git

$ cd ./dridrin-blocks
$ npm link

$ cd ../scratch-vm
$ npm link scratch-dridrin-blocks

$ cd ../scratch-l10n
$ npm run build:data

$ cd ../scratch-gui
$ npm link scratch-dridrin-blocks
$ npm link scratch-l10n
$ npm link scratch-vm

$ npm start
```

## How to build gh-pages

```
$ cd ./scratch-gui
$ npm run clean
$ cd ./build
$ git clone https://github.com/dridrin/dridrin-blocks.git .
$ git checkout gh-pages 
$ rm -fr *
$ ls -al
$ # there are only .git and .nojekyll
$ cd ../
$ GA_ID=UA-XXXXXXXXX-X $(npm bin)/webpack --colors --bail
$ cd ./build
$ git add .
$ git commit
$ git push
```

## TODO:

+ Support several HMI Type. (ex. COMMUNICATION, NAVIGATION etc.) Now only support DEFAULT and MEDIA.
+ Support cache when uploading files
+ Support soft button state
+ Support menus
+ Support alerts
+ Support theme
+ Support voice command
