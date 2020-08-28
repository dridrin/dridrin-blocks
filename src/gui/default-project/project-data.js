import { defineMessages } from 'react-intl'
import sharedMessages from './shared-messages'
let messages = defineMessages({
  variable: {
    defaultMessage: 'my variable',
    description: 'Name for the default variable',
    id: 'gui.defaultProject.variable'
  },
  car:{
    id: 'dridrin.defaultProject.costumes.car',
    defaultMessage: 'car',
  },
  dridrin:{
    id: 'dridrin.defaultProject.costumes.dridrin',
    defaultMessage: 'DriDrin',
  },
  carHorn:{
    id: 'dridrin.defaultProject.sounds.carHorn',
    defaultMessage: 'car horn',
  },
  engine:{
    id: 'dridrin.defaultProject.sounds.engine',
    defaultMessage: 'engine',
  },
  skid  :{
    id: 'dridrin.defaultProject.sounds.skid',
    defaultMessage: 'skid',
  }
})

messages = { ...messages, ...sharedMessages }


// use the default message if a translation function is not passed
const defaultTranslator = msgObj => msgObj.defaultMessage

/**
 * Generate a localized version of the default project
 * @param {function} translateFunction a function to use for translating the default names
 * @return {object} the project data json for the default project
 */
const projectData = translateFunction => {
  const translator = translateFunction || defaultTranslator
  // console.log(translator)
  return {
    targets: [
      {
        isStage: true,
        name: 'Stage',
        variables: {
          '`jEk@4|i[#Fk?(8x)AV.-my variable': [translator(messages.variable), 0]
        },
        lists: {},
        broadcasts: {},
        blocks: {},
        currentCostume: 0,
        costumes: [
          {
            assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
            name: translator(messages.backdrop, { index: 1 }),
            md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
            dataFormat: 'svg',
            rotationCenterX: 240,
            rotationCenterY: 180
          }
        ],
        sounds: [],
        volume: 100
      },
      {
        isStage: false,
        name: translator(messages.sprite, { index: 1 }),
        variables: {},
        lists: {},
        broadcasts: {},
        blocks: {},
        currentCostume: 0,
        costumes: [
          {
            assetId: 'd378dbff9527c8b083919bbcdfe750cc',
            name: translator(messages.car),
            bitmapResolution: 1,
            md5ext: 'd378dbff9527c8b083919bbcdfe750cc.svg',
            dataFormat: 'svg',
            rotationCenterX: 46.5,
            rotationCenterY: 31.5
          },
          {
            assetId: '2437968c23224ff2ed13aa34cc4fe64e',
            name: translator(messages.dridrin),
            bitmapResolution: 1,
            md5ext: '2437968c23224ff2ed13aa34cc4fe64e.svg',
            dataFormat: 'svg',
            rotationCenterX: 40,
            rotationCenterY: 40
          }
        ],
        sounds: [
          {
            "assetId": "7c887f6a2ecd1cdb85d5527898d7f7a0",
            "name": translator(messages.carHorn),
            "dataFormat": "wav",
            "format": "adpcm",
            "rate": 22050,
            "sampleCount": 42673,
            "md5ext": "7c887f6a2ecd1cdb85d5527898d7f7a0.wav"
          }, {
            "assetId": "f5c4e2311024f18c989e53f9b3448db8",
            "name": translator(messages.engine),
            "dataFormat": "wav",
            "format": "adpcm",
            "rate": 22050,
            "sampleCount": 172721,
            "md5ext": "f5c4e2311024f18c989e53f9b3448db8.wav"
          },
          {
            "assetId": "2c22bb6e3c65d9430185fd83ec3db64a",
            "name": translator(messages.skid),
            "dataFormat": "wav",
            "format": "adpcm",
            "rate": 22050,
            "sampleCount": 24385,
            "md5ext": "2c22bb6e3c65d9430185fd83ec3db64a.wav"
          }
        ],
        volume: 100,
        visible: true,
        x: 0,
        y: 0,
        size: 100,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around'
      }
    ],
    meta: {
      semver: '3.0.0',
      vm: '0.1.0',
      agent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' // eslint-disable-line max-len
    }
  }
}

export default projectData
