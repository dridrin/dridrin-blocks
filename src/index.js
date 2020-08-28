/**
 * Copyright (c) AnotherBrain Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

// for await/async (Uncaught ReferenceError: regeneratorRuntime is not defined の回避)
import "regenerator-runtime/runtime";

import formatMessage from 'format-message'

import CoreSdl from './dridrin/coreSdl'
import dridrinImage from './images/dridrin.svg'

import ArgumentType from 'scratch-vm/src/extension-support/argument-type'
import BlockType from 'scratch-vm/src/extension-support/block-type'

// import log = require('scratch-vm/src/util/log');

import Base64Util from 'scratch-vm/src/util/base64-util'

import { WaveFile } from 'wavefile'

class DriDrinBlocks {

  constructor(runtime) {
    this.runtime = runtime
    this.coreSdl = new CoreSdl(this)

    // this.runtime.on('PROJECT_RUN_STOP', this.stop.bind(this))
    // this.runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this))
  }

  infoBlocksOfCurrentVehicleData() {
    const implementSecondLevel = {
      bodyInformation: { parkBrakeActive: true },
      gps: { latitudeDegrees: true, longitudeDegrees: true, altitude: true, heading: true },
      headLampStatus: { lowBeamsOn: true, highBeamsOn: true }
    };

    const keys = Object.keys(this.coreSdl.vehicleData);
    const blocks = [];
    Object.keys(this.coreSdl.vehicleData).forEach((key) => {
      if (typeof this.coreSdl.vehicleData[key] != 'object') {
        blocks.push(
          {
            opcode: `current.${key}`,
            blockType: BlockType.REPORTER,
            func: 'currentVehicleData',
            text: formatMessage({ id: `dridrin.vehicleData.${key}`, default: key })
          }
        );
      } else {
        if (implementSecondLevel[key]) {
          Object.keys(this.coreSdl.vehicleData[key]).forEach((key2) => {
            if (implementSecondLevel[key][key2]) {
              blocks.push(
                {
                  opcode: `current.${key}.${key2}`,
                  blockType: BlockType.REPORTER,
                  func: 'currentVehicleData',
                  text: formatMessage({ id: `dridrin.vehicleData.${key}.${key2}`, default: `${key}.${key2}` })
                }
              )
            }
          });
        }
      }
    });
    console.log('infoBlocksOfCurrentVehicleData', blocks);
    return blocks;
  }

  currentVehicleData(args, util, realBlockInfo) {
    console.log('currentVehicleData', realBlockInfo.opcode)
    const op = realBlockInfo.opcode.split('.');
    switch (op.length) {
      case 2:
        return this.coreSdl.vehicleData[op[1]];
      case 3:
        return this.coreSdl.vehicleData[op[1]][op[2]];
    }
  }

  getInfo() {
    return {
      id: 'dridrin',
      name: formatMessage({
        id: 'dridrin.category.label',
        default: 'DriDrin',
        description: 'Label for the dridrin extension category'
      }),
      blockIconURI: dridrinImage,
      color1: '#304ea0',
      color2: '#2c4688',
      color3: '#283c6a',
      showStatusButton: false,    // exclamation for ble etc
      blocks: [
        {
          opcode: 'setAppIcon',
          func: 'setImage',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.setAppIcon',
            default: 'set [COSTUME] to icon',
            description: 'set icon'
          }),
          arguments: {
            COSTUME: {
              type: ArgumentType.STRING,
              menu: 'COSTUMES'
            }
          },
        },
        '---',
        {
          opcode: 'registerApp',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.registerApp',
            default: 'register sdl app to [WS_URL]',
            description: 'register app'
          }),
          arguments: {
            WS_URL: {
              type: ArgumentType.STRING,
              defaultValue: "wss://xxxxxx.m.sdl.tools:444"
            }
          }
        },
        {
          opcode: 'isReady',
          blockType: BlockType.BOOLEAN,
          text: formatMessage({
            id: 'dridrin.isReady',
            default: 'isReady',
          })
        },
        {
          opcode: 'unregisterApp',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.unregisterApp',
            default: 'unregister app'
          })
        },
        '---',
        {
          opcode: 'setTemplate',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.setTemplate',
            default: 'set [TEMPLATE] to template'
          }),
          arguments: {
            TEMPLATE: {
              type: ArgumentType.STRING,
              menu: 'TEMPLATES'
            }
          },
        },
        {
          opcode: 'isTemplate',
          blockType: BlockType.BOOLEAN,
          text: formatMessage({
            id: 'dridrin.isTemplate',
            default: 'template is [TEMPLATE]',
          }),
          arguments: {
            TEMPLATE: {
              type: ArgumentType.STRING,
              menu: 'TEMPLATES',
            },
          },
        },
        {
          opcode: 'setTitle',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.setTitle',
            default: 'set [TITLE] to Title'
          }),
          arguments: {
            TITLE: {
              type: ArgumentType.STRING,
              defaultValue: formatMessage({
                id: 'dridrin.setTitle.title.defaultValue',
                default: 'title'
              })
            }
          },
        },
        {
          opcode: 'setTextField',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.setTextField',
            default: 'set [TEXT] to [TEXT_FIELD]'
          }),
          arguments: {
            TEXT: {
              type: ArgumentType.STRING,
              defaultValue: formatMessage({
                id: 'dridrin.setTextField.text.defaultValue',
                default: 'text'
              })
            },
            TEXT_FIELD: {
              type: ArgumentType.NUMBER,  // ???
              menu: 'TEXT_FIELDS'
            }
          },
        },
        {
          opcode: 'setGraphic',
          func: 'setImage',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.setGraphic',
            default: 'set [COSTUME] to [GRAPHIC]',
          }),
          arguments: {
            COSTUME: {
              type: ArgumentType.STRING,
              menu: 'COSTUMES'
            },
            GRAPHIC: {
              type: ArgumentType.STRING,
              menu: 'GRAPHICS'
            }
          },
        },
        // {
        //   opcode: 'setTextAlignment',
        //   blockType: BlockType.COMMAND,
        //   text: formatMessage({
        //     id: 'dridrin.setTextAlignment',
        //     default: 'set [TEXT_ALIGNMENT] to TextAlignment'
        //   }),
        //   arguments: {
        //     TEXT_ALIGNMENT: {
        //       type: ArgumentType.STRING,
        //       menu: 'TEXT_ALIGNMENT'
        //     }
        //   },
        // },
        '---',
        {
          opcode: 'event_onVehicleData',
          blockType: BlockType.EVENT,
          text: formatMessage({
            id: 'dridrin.event_onVehicleData',
            default: 'when [VEHICLE_DATA] changed',
          }),
          isEdgeActivated: false,
          shouldRestartExistingThreads: true, // getHats ではなくこちらで設定？
          arguments: {
            VEHICLE_DATA: {
              type: ArgumentType.STRING,
              menu: 'VEHICLE_DATA'
            }
          },
        },
        // {
        //   opcode: 'current',
        //   blockType: BlockType.REPORTER,
        //   func: 'currentVehicleData',
        //   text: formatMessage({ id: 'dridrin.vehicleData.', default: '' })
        // },
        ...this.infoBlocksOfCurrentVehicleData(),
        // {
        //   opcode: 'turnSignalBoolean',
        //   blockType: BlockType.BOOLEAN,
        //   text: formatMessage({
        //     id: 'dridrin.turnSignalBoolean',
        //     default: 'turn signal is [TURN_SIGNAL]',
        //   }),
        //   arguments: {
        //     TURN_SIGNAL: {
        //       type: ArgumentType.STRING,
        //       menu: 'TURN_SIGNAL'
        //     }
        //   },
        // },
        '---',
        {
          opcode: 'event_onButtonPress',
          blockType: BlockType.EVENT,
          text:formatMessage({
            id: 'dridrin.event_onButtonPress',
            default: 'when [BUTTON_NAME] Pressed',
          }), 
          isEdgeActivated: false,
          shouldRestartExistingThreads: true, // getHats ではなくこちらで設定？
          arguments: {
            BUTTON_NAME: {
              type: ArgumentType.STRING,
              menu: 'HARD_BUTTONS'
            }
          },
        },
        {
          opcode: 'addSoftButton',
          blockType: BlockType.COMMAND,
          text: formatMessage({ id: 'dridrin.addSoftButton', default: 'add [BUTTON_NAME] label:[BUTTON_LABEL] image:[COSTUME]' }),
          arguments: {
            BUTTON_NAME: {
              type: ArgumentType.STRING,
              menu: 'SOFT_BUTTONS',
            },
            BUTTON_LABEL: {
              type: ArgumentType.STRING,
              defaultValue: formatMessage({ id: 'dridrin.addSoftButton.lavel.defaultValue', default: 'label' }),
            },
            COSTUME: {
              type: ArgumentType.STRING,
              menu: 'COSTUMES_OPTIONAL',
              defaultValue: '__NONE__' // 予約語にしたいがとりいそぎ
            }
          },
        },
        {
          opcode: 'event_onSoftButtonPress',
          blockType: BlockType.EVENT,
          text: formatMessage({ id: 'dridrin.event_onSoftButtonPress', default: 'when [BUTTON_NAME] pressed' }),
          isEdgeActivated: false,
          shouldRestartExistingThreads: true, // getHats ではなくこちらで設定？
          arguments: {
            BUTTON_NAME: {
              type: ArgumentType.STRING,
              menu: 'SOFT_BUTTONS',
            }
          },
        },
        {
          opcode: 'removeSoftButton',
          blockType: BlockType.COMMAND,
          text: formatMessage({ id: 'dridrin.removeSoftButton', default: 'remove [BUTTON_NAME]' }),
          arguments: {
            BUTTON_NAME: {
              type: ArgumentType.STRING,
              menu: 'SOFT_BUTTONS',
            }
          },
        },
        '---',
        {
          opcode: 'say',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.say',
            default: 'say [MESSAGE]',
          }),
          arguments: {
            MESSAGE: {
              type: ArgumentType.STRING,
              defaultValue: formatMessage({
                id: 'dridrin.say.message.defaultValue',
                default: 'Hello',
              })
            }
          },
        },
        {
          opcode: 'playSound',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'dridrin.playSound',
            default: 'play [SOUND]',
          }),
          arguments: {
            SOUND: {
              type: ArgumentType.STRING,
              menu: 'SOUNDS'
            },
          },
        },
        '---',
        {
          opcode: 'hmiLevelChanged',
          blockType: BlockType.HAT,
          text: formatMessage({
            id: 'dridrin.hmiLevelChanged',
            default: 'when HMI Level changed',
          })
        },
        {
          opcode: 'hmiLevel',
          blockType: BlockType.REPORTER,
          text: formatMessage({
            id: 'dridrin.hmiLevel',
            default: 'HMI Level',
            description: 'describes current levels of HMI'
          })
        },
      ],
      menus: {
        TEMPLATES: {
          items: [
            { text: formatMessage({ id: 'dridrin.menu.templates.default', default: 'DEFAULT' }), value: 'DEFAULT' },  // MEDIA menu.templates
            { text: formatMessage({ id: 'dridrin.menu.templates.nonMedia', default: 'NON_MEDIA' }), value: 'NON-MEDIA' },
            { text: formatMessage({ id: 'dridrin.menu.templates.media', default: 'MEDIA' }), value: 'MEDIA' },
            { text: formatMessage({ id: 'dridrin.menu.templates.largeGraphicOnly', default: 'LARGE_GRAPHIC_ONLY' }), value: 'LARGE_GRAPHIC_ONLY' },
            { text: formatMessage({ id: 'dridrin.menu.templates.largeGraphicWithSoftbuttons', default: 'LARGE_GRAPHIC_WITH_SOFTBUTTONS' }), value: 'LARGE_GRAPHIC_WITH_SOFTBUTTONS' },
            { text: formatMessage({ id: 'dridrin.menu.templates.graphicWithText', default: 'GRAPHIC_WITH_TEXT' }), value: 'GRAPHIC_WITH_TEXT' },
            { text: formatMessage({ id: 'dridrin.menu.templates.textWithGraphic', default: 'TEXT_WITH_GRAPHIC' }), value: 'TEXT_WITH_GRAPHIC' },
            { text: formatMessage({ id: 'dridrin.menu.templates.textbuttonsOnly', default: 'TEXTBUTTONS_ONLY' }), value: 'TEXTBUTTONS_ONLY' },
            { text: formatMessage({ id: 'dridrin.menu.templates.graphicWithTextbuttons', default: 'GRAPHIC_WITH_TEXTBUTTONS' }), value: 'GRAPHIC_WITH_TEXTBUTTONS' },
            { text: formatMessage({ id: 'dridrin.menu.templates.textbuttonsWithGraphic', default: 'TEXTBUTTONS_WITH_GRAPHIC' }), value: 'TEXTBUTTONS_WITH_GRAPHIC' },
            { text: formatMessage({ id: 'dridrin.menu.templates.doubleGraphicWithSoftbuttons', default: 'DOUBLE_GRAPHIC_WITH_SOFTBUTTONS' }), value: 'DOUBLE_GRAPHIC_WITH_SOFTBUTTONS' },
            { text: formatMessage({ id: 'dridrin.menu.templates.tilesOnly', default: 'TILES_ONLY' }), value: 'TILES_ONLY' },
            // unsupported by manticore
            // { text: 'ONSCREEN_PRESETS', value: 'ONSCREEN_PRESETS' },
            // { text: 'NAV_FULLSCREEN_MAP', value: 'NAV_FULLSCREEN_MAP' },
            // { text: 'NAV_LIST', value: 'NAV_LIST' },
            // { text: 'NAV_KEYBOARD', value: 'NAV_KEYBOARD' },
            // { text: 'GRAPHIC_WITH_TILES', value: 'GRAPHIC_WITH_TILES' },
            // { text: 'TILES_WITH_GRAPHIC', value: 'TILES_WITH_GRAPHIC' },
            // { text: 'GRAPHIC_WITH_TEXT_AND_SOFTBUTTONS', value: 'GRAPHIC_WITH_TEXT_AND_SOFTBUTTONS' },
            // { text: 'TEXT_AND_SOFTBUTTONS_WITH_GRAPHIC', value: 'TEXT_AND_SOFTBUTTONS_WITH_GRAPHIC' },
          ],
        },
        COSTUMES: {
          items: 'menuCostumes'
        },
        COSTUMES_OPTIONAL: {
          items: 'menuCostumesOptional'
        },
        SOUNDS: {
          items: 'menuSounds'
        },
        SOFT_BUTTONS: {
          // items: 'softButtonsMenu'
          items: [
            { text: formatMessage({ id: 'dridrin.menu.softButtons.1', default: 'SoftButton1' }), value: 'softButton1' },
            { text: formatMessage({ id: 'dridrin.menu.softButtons.2', default: 'SoftButton2' }), value: 'softButton2' },
            { text: formatMessage({ id: 'dridrin.menu.softButtons.3', default: 'SoftButton3' }), value: 'softButton3' },
            { text: formatMessage({ id: 'dridrin.menu.softButtons.4', default: 'SoftButton4' }), value: 'softButton4' },
            { text: formatMessage({ id: 'dridrin.menu.softButtons.5', default: 'SoftButton5' }), value: 'softButton5' },
            { text: formatMessage({ id: 'dridrin.menu.softButtons.6', default: 'SoftButton6' }), value: 'softButton6' },
            { text: formatMessage({ id: 'dridrin.menu.softButtons.7', default: 'SoftButton7' }), value: 'softButton7' },
            { text: formatMessage({ id: 'dridrin.menu.softButtons.8', default: 'SoftButton8' }), value: 'softButton8' },
          ]
        },
        TEXT_FIELDS: {
          items: [
            { text: formatMessage({ id: 'dridrin.menu.textFields.1', default: 'TextField1' }), value: '1' }, // value に number が NG ?
            { text: formatMessage({ id: 'dridrin.menu.textFields.2', default: 'TextField2' }), value: '2' },
            { text: formatMessage({ id: 'dridrin.menu.textFields.3', default: 'TextField3' }), value: '3' },
            { text: formatMessage({ id: 'dridrin.menu.textFields.4', default: 'TextField4' }), value: '4' }
          ]
        },
        GRAPHICS: {
          items: [
            { text: formatMessage({ id: 'dridrin.menu.graphics.primary', default: 'Primary Graphic' }), value: 'primary' },
            { text: formatMessage({ id: 'dridrin.menu.graphics.secondary', default: 'Secondary Graphic' }), value: 'secondary' },
          ]
        },
        // TEXT_ALIGNMENT: {
        //   items: [
        //     { text: formatMessage({ id: 'dridrin.menu.textAlignment.center', default: 'Center' }), value: 'CENTERED' },
        //     { text: formatMessage({ id: 'dridrin.menu.textAlignment.left', default: 'Left' }), value: 'LEFT_ALIGNED' },
        //     { text: formatMessage({ id: 'dridrin.menu.textAlignment.right', default: 'Right' }), value: 'RIGHT_ALIGNED' },
        //   ]
        // },
        VEHICLE_DATA: {
          items: [
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.accPedalPosition', default: 'acc pedal position' }), value: 'accPedalPosition' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.airbagStatus', default: 'airbag status' }), value: 'airbagStatus' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.beltStatus', default: 'belt status' }), value: 'beltStatus' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.bodyInformation', default: 'body information' }), value: 'bodyInformation' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.cloudAppVehicleID', default: 'cloud app vehicle ID' }), value: 'cloudAppVehicleID' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.clusterModeStatus', default: 'cluster mode status' }), value: 'clusterModeStatus' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.deviceStatus', default: 'device status' }), value: 'deviceStatus' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.driverBraking', default: 'driver braking' }), value: 'driverBraking' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.eCallInfo', default: 'eCall info' }), value: 'eCallInfo' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.electronicParkBrakeStatus', default: 'electronic park brake status' }), value: 'electronicParkBrakeStatus' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.emergencyEvent', default: 'emergency event' }), value: 'emergencyEvent' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.engineOilLife', default: 'engine oil life' }), value: 'engineOilLife' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.engineTorque', default: 'engine torque' }), value: 'engineTorque' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.externalTemperature', default: 'external temperature' }), value: 'externalTemperature' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.fuelLevel', default: 'fuel level' }), value: 'fuelLevel' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.fuelLevelState', default: 'fuel level state' }), value: 'fuelLevelState' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.fuelRange', default: 'fuel range' }), value: 'fuelRange' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.gps', default: 'GPS' }), value: 'gps' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.headLampStatus', default: 'head Lamp status' }), value: 'headLampStatus' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.instantFuelConsumption', default: 'instant fuel consumption' }), value: 'instantFuelConsumption' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.myKey', default: 'my key' }), value: 'myKey' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.odometer', default: 'odometer' }), value: 'odometer' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.prndl', default: 'PRNDL' }), value: 'prndl' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.rpm', default: 'RPM' }), value: 'rpm' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.speed', default: 'speed' }), value: 'speed' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.steeringWheelAngle', default: 'steering wheel angle' }), value: 'steeringWheelAngle' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.tirePressure', default: 'tire pressure' }), value: 'tirePressure' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.vin', default: 'VIN' }), value: 'vin' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.turnSignal', default: 'turn signal' }), value: 'turnSignal' },
            { text: formatMessage({ id: 'dridrin.menu.vehicleData.wiperStatus', default: 'wiper status' }), value: 'wiperStatus' },
          ],
        },
        // TURN_SIGNAL: {
        //   items: [
        //     { text: formatMessage({ id: 'dridrin.menu.turnSignal.off', default: 'off' }), value: 'OFF' },
        //     { text: formatMessage({ id: 'dridrin.menu.turnSignal.left', default: 'left' }), value: 'LEFT' },
        //     { text: formatMessage({ id: 'dridrin.menu.turnSignal.right', default: 'right' }), value: 'RIGHT' },
        //     { text: formatMessage({ id: 'dridrin.menu.turnSignal.both', default: 'both' }), value: 'BOTH' },
        //   ],
        // },
        HARD_BUTTONS: {
          items: [
            { text: formatMessage({ id: 'dridrin.menu.buttonName.ok', default: 'ok' }), value: "OK" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.playPause', default: 'PLAY_PAUSE' }), value: "PLAY_PAUSE" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.seekleft', default: 'SEEKLEFT' }), value: "SEEKLEFT" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.seekright', default: 'SEEKRIGHT' }), value: "SEEKRIGHT" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.tuneup', default: 'TUNEUP' }), value: "TUNEUP" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.tunedown', default: 'TUNEDOWN' }), value: "TUNEDOWN" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.acMax', default: 'AC max' }), value: "AC_MAX" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.ac', default: 'AC' }), value: "AC" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.recirculate', default: 'recirculate' }), value: "RECIRCULATE" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.fanUp', default: 'fan up' }), value: "FAN_UP" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.fanDown', default: 'fan down' }), value: "FAN_DOWN" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.tempUp', default: 'temp up' }), value: "TEMP_UP" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.tempDown', default: 'temp down' }), value: "TEMP_DOWN" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.defrostMax', default: 'defrost max' }), value: "DEFROST_MAX" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.defrost', default: 'defrost' }), value: "DEFROST" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.defrostRear', default: 'defrost rear' }), value: "DEFROST_REAR" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.upperVent', default: 'upper vent' }), value: "UPPER_VENTOK" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.lowerVent', default: 'lower vent' }), value: "LOWER_VENT" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.volumeUp', default: 'volume up' }), value: "VOLUME_UP" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.volumeDown', default: 'volume down' }), value: "VOLUME_DOWN" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.eject', default: 'eject' }), value: "EJECT" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.source', default: 'source' }), value: "SOURCE" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.shuffle', default: 'shuffle' }), value: "SHUFFLE" },
            { text: formatMessage({ id: 'dridrin.menu.buttonName.repeat', default: 'repeat' }), value: "REPEAT" },

          ]
        }
      }
    }
  }

  // TODO: /scratch-gui/src/lib/blocks.js の costumesMenu もしくは ScratchBlocks.Blocks.looks_costume.init の参照方法の模索
  menuCostumes(editingTargetID) {
    // return ScratchBlocks.Blocks.looks_costume.init()

    // console.log(this.runtime.targets[1].blocks._blocks['uniq_rand_id'].opcode)
    // console.log(this.runtime.targets[1].blocks._blocks['uniq_rand_id'].fields['LAYOUT'])  // 選択する場合
    // console.log(this.runtime.targets[1].blocks._blocks['uniq_rand_id'].inputs['MESSAGE'])  // 入力する場合...値はさらにBlockを参照
    // const vm = this.runtime
    // extension_manager.js line 353
    // this.runtime.getEditingTarget() || this.runtime.getTargetForStage();
    // console.trace('_costumesMenu2', ueditingTargetIDil,b)  
    const editingTarget = this.runtime.getEditingTarget() || this.runtime.getTargetForStage();
    // console.log(editingTarget)
    if (editingTarget && editingTarget.getCostumes().length > 0) {
      return editingTarget.getCostumes().map(costume => ({ text: costume.name, value: costume.name }));
    }
    return [''];
  };

  menuSounds(editingTargetID) {
    const editingTarget = this.runtime.getEditingTarget() || this.runtime.getTargetForStage();
    if (editingTarget && editingTarget.getSounds().length > 0) {
      return editingTarget.getSounds().map(sound => ({ text: sound.name, value: sound.name }));
    }
    return [''];
  };

  menuCostumesOptional(editingTargetID) {
    return [
      { text: formatMessage({ id: 'dridrin.menu.costumes.optional', default: 'None' }), value: '__NONE__' },
      ...this.menuCostumes(editingTargetID)
    ];
  }

  menuSoftButtons() {
    const softButtons = this.coreSdl.listSoftButtons();
    if (softButtons.length == 0) {
      return [''];
    }
    return this.coreSdl.listSoftButtons();
  };

  softButtons(args) {
    return args.BUTTON_NAME;
  }

  // // /scratch-gui/src/lib/blocks.js の ScratchBlocks.Blocks.sensing_of.init を参考に
  // menuFileTypes(editingTargetID, b) {
  //   // console.trace(editingTargetID, b)
  //   // const editingTarget = this.runtime.getEditingTarget()
  //   // console.log(editingTarget)
  //   // const extensionMessageContext = this.runtime.makeMessageContextForTarget(editingTarget);
  //   // console.log(extensionMessageContext)
  //   // if (editingTarget && editingTarget.getSounds().length > 0) {
  //   //   return editingTarget.getSounds().map(sound => ({ text: sound.name, value: sound.name }));
  //   // }
  //   return ['costume', 'background', 'sound'];
  // };

  // menuFileNames(editingTargetID) {
  //   console.log(editingTargetID)
  //   // const editingTarget = this.runtime.getEditingTarget() || this.runtime.getTargetForStage();
  //   // if (editingTarget && editingTarget.getSounds().length > 0) {
  //   //   return editingTarget.getSounds().map(sound => ({ text: sound.name, value: sound.name }));
  //   // }
  //   return [''];
  // };

  /*
  * https://ja.scratch-wiki.info/wiki/Scratch_3.0%E3%81%AE%E6%8B%A1%E5%BC%B5%E6%A9%9F%E8%83%BD%E3%82%92%E4%BD%9C%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86/%E5%BF%9C%E7%94%A8
  * https://ja.scratch-wiki.info/wiki/%E3%83%8F%E3%83%83%E3%83%88%E3%83%96%E3%83%AD%E3%83%83%E3%82%AF
  * https://scratch.mit.edu/discuss/topic/394475/
  */
  getHats() {
    console.log('getHats')
    return {
      dridrin_event_onVehicleData: {
        restartExistingThreads: false,  // ここから始まったスレッドを中断し再実行するかどうかのはずだが、機能しない？ info で設定
        // edgeActivated: false
      },
      dridrin_event_onButtonPress: {},
      dridrin_event_onSoftButtonPress: {}
    }
  }


  async registerApp(args, util) {
    // console.log('dridrin.startApp', util.target, util.target.getCostumes())

    // console.log('dridrin.startApp', util.target.currentCostume, util.target.sprite.costumes[0].asset)



    // asset = {
    //   assetId: "f9d1a3501393ac5c0d8e6e4dabd03825",
    //   assetType: { contentType: "image/png", name: "ImageBitmap", runtimeFormat: "png", immutable: true },
    //   clean: false,
    //   data: Uint8Array(3456)[137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 96, 0, 0, 0, 96, 8, 6, 0, 0, 0, 226, 152, 119, 56, 0, 0, 13, 71, 73, 68, 65, 84, 120, 94, 237, 93, 121, 88, 84, 71, 18, 159, 113, 131, 200, 34, 17, 137, 1, 5, 137, 172, 10, 137, 162, 56, 43, 40, 70, 129, 96, 20, 197, 184, 187, 250, 5, 140, 215, 167, 98, 226, 231, 21, 52, 30, 40, 113, 23, 99, 52, 100, 21, 193, 155, 160, 241, 51, 9, 209, 245, …]
    //   dataFormat: "png",
    //   dependencies: [],
    // };

    // this.appClient = new AppClient(args.WS_URL)
    await this.coreSdl.start(args.WS_URL)

    // this.coreSdl.start(args.WS_URL, () => {
    //   // ここで初期化する？

    // })
  }

  setTemplate(args) {
    this.coreSdl.setTemplate(args.TEMPLATE);
  }

  isTemplate(args) {
    return this.coreSdl.template == args.TEMPLATE;
  }

  setTitle(args) {
    this.coreSdl.setTitle(args.TITLE);
  }

  // setTextAlignment(args) {
  //   this.coreSdl.setTextAlignment(args.TEXT_ALIGNMENT);
  // }

  setTextField(args) {
    // console.log('setTextField', args);
    this.coreSdl.setTextField(Number(args.TEXTIELD), args.TEXT);
  }

  isReady() {
    return this.coreSdl.isReady()
  }

  hmiLevel() {
    // console.log('hmiLevel');
    return this.coreSdl.hmiLevel
  }

  hmiLevelChanged() {
    const hmiLevelCurrent = this.hmiLevel()
    const changed = this.hmiLevelLast != hmiLevelCurrent
    this.hmiLevelLast = hmiLevelCurrent
    return changed
  }

  layoutBoolean(args) {
    console.log('hmiLevelCondition');
    return false;
  }

  turnSignalBoolean(args) {
    // console.log('boolean', args);
    return this.coreSdl._vehicleData.turnSignal == args.TURN_SIGNAL
  }

  // public onVehicleData(args: { VEHICLE_DATA: string }): boolean {
  //   if (this.coreSdl.vehicleDataChanged[args.VEHICLE_DATA]) {
  //     this.coreSdl.vehicleDataChanged[args.VEHICLE_DATA] = false;
  //     return true;
  //   }
  //   return false
  // }

  async setImage(args, util, realBlockInfo) {
    const costume = util.target.getCostumes()[util.target.getCostumeIndexByName(args.COSTUME)]

    let func = realBlockInfo.opcode;
    if (func == 'setGraphic') {
      if (args.GRAPHIC == 'primary') func = 'setPrimaryGraphic';
      if (args.GRAPHIC == 'secondary') func = 'setSecondaryGraphic';
    }

    const res = await this._convertDataFormat(costume);
    await this.coreSdl[func](costume.asset.assetId, res.fileType, res.fileData);
  }

  async _convertDataFormat(costume) {
    let dataFormat = costume.asset.dataFormat;
    switch (dataFormat) {
      case 'svg':
        // size は長辺を800に
        const base = 800;
        let x, y;
        if (costume.size[0] > costume.size[1]) {
          x = base;
          y = base / costume.size[0] * costume.size[1];
        } else {
          x = base / costume.size[1] * costume.size[0];
          y = base;
        }
        // png に変換
        const pngData = await this._svgString2Image(Base64Util.uint8ArrayToBase64(costume.asset.data), x, y, 'png');
        return { fileType: 'GRAPHIC_PNG', fileData: Base64Util.base64ToUint8Array(pngData.split(',')[1]) };
        break;
      case 'jpg':
        dataFormat = 'jpeg';
      case 'jpeg':
      case 'png':
      case 'bmp':
        return { fileType: 'GRAPHIC_' + dataFormat.toUpperCase(), fileData: costume.asset.data };
        break;
    }
  }


  async playSound(args, util) {
    const sounds = util.target.getSounds()

    function getSoundIndexByName(soundName) {
      for (let i = 0; i < sounds.length; i++) {
        if (sounds[i].name === soundName) {
          return i;
        }
      }
      return -1;
    }
    const sound = sounds[getSoundIndexByName(args.SOUND)]
    console.log(sound)

    // 22050 to 48000  format: adpcm

    let soundData = sound.asset.data

    if (sound.format == 'adpcm') {
      let wav = new WaveFile(soundData);
      wav.fromIMAADPCM();
      soundData = wav.toBuffer()

    }

    let fileType = 'AUDIO_' + sound.asset.dataFormat.toUpperCase()
    if (fileType == 'AUDIO_WAV') fileType = 'AUDIO_WAVE'

    // await this.coreSdl.uploadFile(sound.asset.assetId, fileType, soundData)

    this.coreSdl.playSound(sound.asset.assetId, fileType, soundData)
  }

  async say(args) {
    await this.coreSdl.say(args.MESSAGE)
  }

  async addSoftButton(args, util) {
    let fileName = undefined;
    let res = { fileType: null, fileData: null };
    if (args.COSTUME !== '__NONE__') {
      const costume = util.target.getCostumes()[util.target.getCostumeIndexByName(args.COSTUME)]
      res = await this._convertDataFormat(costume);
      // await this.coreSdl[func](costume.asset.assetId, res.fileType, res.fileData);
      fileName = costume.asset.assetId;
    }

    this.coreSdl.addSoftButton(args.BUTTON_NAME, args.BUTTON_LABEL, fileName, res.fileType, res.fileData);
  }

  removeSoftButton(args) {
    this.coreSdl.removeSoftButton(args.BUTTON_NAME);
  }

  async _svgString2Image(svgString, width, height, format) {
    // set default for format parameter
    format = format ? format : 'png';
    // SVG data URL from SVG string
    var svgData = 'data:image/svg+xml;base64,' + svgString;
    // create canvas in memory(not in DOM)
    var canvas = document.createElement('canvas');
    // get canvas context for drawing on canvas
    var context = canvas.getContext('2d');
    // set canvas size
    canvas.width = width;
    canvas.height = height;
    // create image in memory(not in DOM)

    // 関数化
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });
    }

    const image = await loadImage(svgData);
    // clear canvas
    context.clearRect(0, 0, width, height);
    // draw image with SVG data to canvas
    context.drawImage(image, 0, 0, width, height);
    // snapshot canvas as png
    var pngData = canvas.toDataURL('image/' + format);
    // pass png data URL to callback
    return pngData
  }

  unregisterApp() {
    console.log('unRegister');
    this.coreSdl.stop();
    // this.appClient.unRegisterApp();
  }

}

export default DriDrinBlocks

