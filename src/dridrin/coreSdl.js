/**
 * Copyright (c) AnotherBrain Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

const SDL = require('./SDL.min');
import CONFIG from './config.js';

import dridrinLogo from './dridrin.png'

class CoreSdl {

    constructor(dridrinBlocks) {

        this._dridrinBlocks = dridrinBlocks

        this._managersReady = false;
        this._hmiFull = false;
        this._hmiLevel = SDL.rpc.enums.HMILevel.HMI_NONE;

        this._template = SDL.rpc.enums.PredefinedLayout.DEFAULT;
        this._title = 'DriDrin';

        const fileName = `${CONFIG.appId}_icon`;

        this._appIcon = new SDL.manager.file.filetypes.SdlFile()
            .setName(fileName)
            .setFilePath(dridrinLogo)
            .setType(SDL.rpc.enums.FileType.GRAPHIC_PNG)
            .setPersistent(true);

        this._textAlign = SDL.rpc.enums.TextAlignment.CENTERED;
        this._textField1 = '';
        this._textField2 = '';
        this._textField3 = '';
        this._textField4 = '';

        this._primaryGraphic;
        this._secondaryGraphic;

        this._softButtonObjects = {};

        this._vehicleData = {
            accPedalPosition: 0.00,
            airBagStatus: {
                driverAirbagDeployed: '',
                driverCurtainAirbagDeployed: '',
                driverKneeAirbagDeployed: '',
                driverSideAirbagDeployed: '',
                passengerAirbagDeployed: '',
                passengerCurtainAirbagDeployed: '',
                passengerKneeAirbagDeployed: '',
                passengerSideAirbagDeployed: ''
            },
            beltStatus: {
                driverBeltDeployed: '',
                passengerBeltDeployed: '',
                passengerBuckleBelted: '',
                driverBuckleBelted: '',
                leftRow2BuckleBelted: '',
                passengerChildDetected: '',
                rightRow2BuckleBelted: '',
                middleRow2BuckleBelted: '',
                middleRow3BuckleBelted: '',
                leftRow3BuckleBelted: '',
                rightRow3BuckleBelted: '',
                leftRearInflatableBelted: '',
                rightRearInflatableBelted: '',
                middleRow1BeltDeployed: '',
                middleRow1BuckleBelted: ''
            },
            bodyInformation: {
                parkBrakeActive: '',
                ignitionStableStatus: '',
                ignitionStatus: '',
                driverDoorAjar: '',
                passengerDoorAjar: '',
                rearLeftDoorAjar: '',
                rearRightDoorAjar: ''

            },
            cloudAppVehicleID: '',
            clusterModeStatus: {
                powerModeActive: '',
                powerModeQualificationStatus: '',
                carModeStatus: '',
                powerModeStatus: ''
            },
            deviceStatus: {
                battLevelStatus: '',
                btIconOn: false,
                callActive: false,
                eCallEventActive: false,
                monoAudioOutputMuted: false,
                phoneRoaming: false,
                primaryAudioSource: '',
                signalLevelStatus: '',
                stereoAudioOutputMuted: false,
                textMsgAvailable: false,
                voiceRecOn: false
            },
            driverBraking: '',
            eCallInfo: {
                eCallNotificationStatus: '',
                auxECallNotificationStatus: '',
                eCallConfirmationStatus: ''
            },
            electronicParkBrakeStatus: '',
            emergencyEvent: {
                emergencyEventType: '',
                fuelCutoffStatus: '',
                rolloverEvent: '',
                maximumChangeVelocity: 0,
                multipleEvents: ''
            },
            engineOilLife: 0,
            engineTorque: 0.00,
            externalTemperature: 0.0,
            fuelLevel: 0.0,
            fuelLevelState: '',
            fuelRange: [
                {
                    type: '',
                    range: 0
                }
            ],
            gps: {
                longitudeDegrees: 0.0,
                latitudeDegrees: 0.0,
                utcYear: 0,
                utcMonth: 0,
                utcDay: 0,
                utcHours: 0,
                utcMinutes: 0,
                utcSeconds: 0,
                compassDirection: '',
                pdop: 0,
                hdop: 0,
                vdop: 0,
                actual: '',
                satellites: 0,
                dimension: '',
                altitude: 0.0,
                heading: 0.0,
                speed: 0.0,
                shifted: '',
            },
            headLampStatus: {
                ambientLightSensorStatus: '',
                highBeamsOn: '',
                lowBeamsOn: ''
            },
            instantFuelConsumption: 0.00,
            myKey: '',
            odometer: 0.00,
            prndl: '',
            rpm: 0,
            speed: 0.00,
            steeringWheelAngle: 0.0,
            tirePressure: {
                pressureTelltale: '',
                leftFront: {
                    status: '',
                    tpms: '',
                    pressure: 0
                },
                rightFront: {
                    status: '',
                    tpms: '',
                    pressure: 0
                },
                leftRear: {
                    status: '',
                    tpms: '',
                    pressure: 0
                },
                rightRear: {
                    status: '',
                    tpms: '',
                    pressure: 0
                },
                innerLeftRear: {
                    status: '',
                    tpms: '',
                    pressure: 0
                },
                innerRightRear: {
                    status: '',
                    tpms: '',
                    pressure: 0
                }
            },
            turnSignal: '',
            vin: '', // getOnly
            wiperStatus: ''
        };
    }

    get vehicleData() {
        return this._vehicleData;
    }
    async setTemplate(template) {
        if (!(this._managersReady && this._hmiFull)) return;

        if (template !== undefined) this._template = template;
        const templateConfiguration = new SDL.rpc.structs.TemplateConfiguration();

        templateConfiguration.setTemplate(
            this._template // SDL.rpc.enums.PredefinedLayout.MEDIA
        );
        const show = new SDL.rpc.messages.Show();
        show.setTemplateConfiguration(templateConfiguration);
        // show.setAlignment(this._textAlign);
        await this.sendRpcRequest(show);
    }
    get template() {
        return this._template;
    }

    async setAppIcon(fileName, fileType, fileData) {
        // console.log('setAppIcon', fileName, fileType, fileData)
        this._appIcon = await new SDL.manager.file.filetypes.SdlArtwork(fileName, fileType, fileData, true);  // 第4引数 persistent
    }

    async setPrimaryGraphic(fileName, fileType, fileData) {
        // console.log('setAppIcon', fileName, fileType, fileData)
        if (fileName !== undefined) {
            this._primaryGraphic = await new SDL.manager.file.filetypes.SdlArtwork(fileName, fileType, fileData, false);  // 第4引数 persistent
        }

        if (this._managersReady && this._hmiFull && this._primaryGraphic) {
            await this._sdlManager.getScreenManager().setPrimaryGraphic(this._primaryGraphic);
        }
    }
    async setSecondaryGraphic(fileName, fileType, fileData) {
        // console.log('setAppIcon', fileName, fileType, fileData)
        if (fileName !== undefined) {
            this._secondaryGraphic = await new SDL.manager.file.filetypes.SdlArtwork(fileName, fileType, fileData, false);  // 第4引数 persistent
        }

        if (this._managersReady && this._hmiFull && this._secondaryGraphic) {
            await this._sdlManager.getScreenManager().setSecondaryGraphic(this._secondaryGraphic);
        }
    }

    // TODO: 簡易キャッシュ
    async uploadFile(fileName, fileType, fileData, persistent = false) {
        // console.log('uploadFile', fileName, fileType, fileData)
        const file = new SDL.manager.file.filetypes.SdlFile(fileName, fileType, fileData, persistent);
        await this._sdlManager.getFileManager().uploadFile(file);
    }

    async setTitle(title) {
        if (title !== undefined) this._title = title;
        if (this._managersReady && this._hmiFull) {
            await this._sdlManager.getScreenManager().setTitle(this._title);
        }
    }

    // async setTextAlignment(textAlign) {
    //     if (textAlign !== undefined) this._textAlign = textAlign;
    //     if (this._managersReady && this._hmiFull) {
    //         console.log('setTextAlignment', this._textAlign);
    //         await this._sdlManager.getScreenManager().setTextAlignment(this._textAlign);
    //     }
    // }

    async setTextField(index, text) {
        if (text !== undefined) {
            this[`_textField${index}`] = text;
        }

        if (this._managersReady && this._hmiFull) {
            if (index !== undefined) {
                await this._sdlManager.getScreenManager()[`setTextField${index}`](this[`_textField${index}`]);
            } else {
                for (var i = 1; i <= 4; i++) {
                    await this._sdlManager.getScreenManager()[`setTextField${i}`](this[`_textField${i}`]);
                }
            }
        }

        console.log(index, text, this._textField1, this._textField2, this._textField3, this._textField4)
    }

    async addSoftButton(buttonName, buttonLabel, fileName, fileType, fileData) {
        if (buttonName !== undefined) {
            let artWork = undefined;
            if (fileName !== undefined) {
                artWork = await new SDL.manager.file.filetypes.SdlArtwork(fileName, fileType, fileData, false);  // 第4引数 persistent
            }
            const softButtonState = new SDL.manager.screen.utils.SoftButtonState(buttonName + 'State', buttonLabel, artWork);
            this._softButtonObjects[buttonName] = new SDL.manager.screen.utils.SoftButtonObject(buttonName, [softButtonState], softButtonState.getName(),
                (softButtonObject, rpc) => {
                    if (rpc instanceof SDL.rpc.messages.OnButtonPress) {
                        console.log(softButtonObject, softButtonObject.getName())
                        this._dridrinBlocks.runtime.startHats('dridrin_event_onSoftButtonPress', { BUTTON_NAME: softButtonObject.getName() })
                    }
                });
        }
        if (this._managersReady && this._hmiFull) {
            // console.log(this._softButtonObjects)
            // object は順序保証されないから、状況に応じて対応が必要かもしれない
            await this._sdlManager.getScreenManager().setSoftButtonObjects(Object.values(this._softButtonObjects));
        }
    }

    listSoftButtons() {
        return Object.keys(this._softButtonObjects);
    }

    async removeSoftButton(buttonName) {
        if (!(this._managersReady && this._hmiFull)) return;

        delete this._softButtonObjects[buttonName];
        await this.addSoftButton();
    }

    async start(wsURL) {
        if (this._managersReady) return;
        const parts = wsURL.match(/(ws.*):(\d+)/)

        this._lifecycleConfig = new SDL.manager.LifecycleConfig()
            .setAppId(CONFIG.appId)
            .setAppName(CONFIG.appName)
            .setLanguageDesired(SDL.rpc.enums.Language.EN_US)   // TODO: Manticore の TTS はブラウザの設定に依存している
            // .setLanguageDesired(SDL.rpc.enums.Language.JA_JP)
            .setAppTypes([
                SDL.rpc.enums.AppHMIType.DEFAULT,
                SDL.rpc.enums.AppHMIType.MEDIA,
            ])
            .setTransportConfig(new SDL.transport.WebSocketClientConfig(
                parts[1], parts[2]
            ))
            .setAppIcon(this._appIcon)
            .setRpcNotificationListeners({
                [SDL.rpc.enums.FunctionID.OnHMIStatus]: this._onHmiStatusListener.bind(this),
            });

        this._appConfig = await new SDL.manager.AppConfig()
            .setLifecycleConfig(this._lifecycleConfig);

        const managerListener = new SDL.manager.SdlManagerListener();
        managerListener
            .setOnStart((sdlManager) => {
                this._permissionManager = this._sdlManager.getPermissionManager();
                this._permissionManager.addListener(
                    [
                        new SDL.manager.permission.PermissionElement(
                            SDL.rpc.enums.FunctionID.SubscribeVehicleData,
                            [
                                'accPedalPosition',
                                'gps',
                                'fuelLevel',
                                'odometer',
                                'prndl',
                                'speed',
                            ]
                        ),
                    ],
                    SDL.manager.permission.enums.PermissionGroupType.ANY,
                    async (allowedPermissions, permissionGroupStatus) => {
                        console.log('SubscribeVehicleData permissions changed!');
                        console.log('Allowed Permissions: ', allowedPermissions);
                        console.log('Permission Group Status: ', permissionGroupStatus);

                        if (permissionGroupStatus == SDL.manager.permission.enums.PermissionGroupStatus.ALLOWED) {
                            // 車両情報の変化を取得開始
                            const subscribeRequest = new SDL.rpc.messages.SubscribeVehicleData()
                                .setGps(true)
                                .setSpeed(true)
                                .setRpm(true)
                                .setFuelLevel(true)
                                .setFuelLevel_State(true)
                                .setInstantFuelConsumption(true)
                                .setFuelRange(true)
                                .setExternalTemperature(true)
                                .setTurnSignal(true)
                                // .setGearStatus(true)
                                .setPrndl(true)
                                .setTirePressure(true)
                                .setOdometer(true)
                                .setBeltStatus(true)
                                .setBodyInformation(true)
                                .setDeviceStatus(true)
                                .setDriverBraking(true)
                                .setWiperStatus(true)
                                .setHeadLampStatus(true)
                                .setEngineTorque(true)
                                .setAccPedalPosition(true)
                                .setSteeringWheelAngle(true)
                                .setEngineOilLife(true)
                                .setElectronicParkBrakeStatus(true)
                                .setCloudAppVehicleID(true)
                                // .setStabilityControlsStatus(true)
                                .setECallInfo(true)
                                .setAirbagStatus(true)
                                .setEmergencyEvent(true)
                                .setClusterModeStatus(true)
                                .setMyKey(true);
                            // .setWindowStatus(true)
                            // .setHandsOffSteering(true);

                            this.sendRpcRequest(subscribeRequest);
                        }

                        // 初期値を取得
                        const vdRequest = new SDL.rpc.messages.GetVehicleData()
                            .setGps(true)
                            .setSpeed(true)
                            .setRpm(true)
                            .setFuelLevel(true)
                            .setFuelLevel_State(true)
                            .setInstantFuelConsumption(true)
                            .setFuelRange(true)
                            .setExternalTemperature(true)
                            .setTurnSignal(true)
                            // .setGearStatus(true)
                            .setPrndl(true)
                            .setTirePressure(true)
                            .setOdometer(true)
                            .setBeltStatus(true)
                            .setBodyInformation(true)
                            .setDeviceStatus(true)
                            .setDriverBraking(true)
                            .setWiperStatus(true)
                            .setHeadLampStatus(true)
                            .setEngineTorque(true)
                            .setAccPedalPosition(true)
                            .setSteeringWheelAngle(true)
                            .setEngineOilLife(true)
                            .setElectronicParkBrakeStatus(true)
                            .setCloudAppVehicleID(true)
                            // .setStabilityControlsStatus(true)
                            .setECallInfo(true)
                            .setAirbagStatus(true)
                            .setEmergencyEvent(true)
                            .setClusterModeStatus(true)
                            .setMyKey(true)
                            .setVin(true);
                        const response = await sdlManager.sendRpc(vdRequest).catch(error => error);

                        // TODO: もしかしたら、複数パラメーターがあるものは respoonse.getAirBagStatus().getParameters() でもいいかもしれない
                        if (response.getSuccess()) {
                            if (response.getAccPedalPosition() !== null) {
                                this._vehicleData.accPedalPosition = response.getAccPedalPosition();
                            }
                            if (response.getAirbagStatus()) {
                                this._vehicleData.airBagStatus = {
                                    driverAirbagDeployed: response.getAirbagStatus().getDriverAirbagDeployed(),
                                    driverCurtainAirbagDeployed: response.getAirbagStatus().getDriverCurtainAirbagDeployed(),
                                    driverKneeAirbagDeployed: response.getAirbagStatus().getDriverKneeAirbagDeployed(),
                                    driverSideAirbagDeployed: response.getAirbagStatus().getDriverSideAirbagDeployed(),
                                    passengerAirbagDeployed: response.getAirbagStatus().getPassengerAirbagDeployed(),
                                    passengerCurtainAirbagDeployed: response.getAirbagStatus().getPassengerCurtainAirbagDeployed(),
                                    passengerKneeAirbagDeployed: response.getAirbagStatus().getPassengerKneeAirbagDeployed(),
                                    passengerSideAirbagDeployed: response.getAirbagStatus().getPassengerSideAirbagDeployed()
                                };
                            }
                            if (response.getBeltStatus() !== null) {
                                this._vehicleData.beltStatus = {
                                    driverBeltDeployed: response.getBeltStatus().getDriverBeltDeployed(),
                                    passengerBeltDeployed: response.getBeltStatus().getPassengerBeltDeployed(),
                                    passengerBuckleBelted: response.getBeltStatus().getPassengerBuckleBelted(),
                                    driverBuckleBelted: response.getBeltStatus().getDriverBuckleBelted(),
                                    leftRow2BuckleBelted: response.getBeltStatus().getLeftRow2BuckleBelted(),
                                    passengerChildDetected: response.getBeltStatus().getPassengerChildDetected(),
                                    rightRow2BuckleBelted: response.getBeltStatus().getRightRow2BuckleBelted(),
                                    middleRow2BuckleBelted: response.getBeltStatus().getMiddleRow2BuckleBelted(),
                                    middleRow3BuckleBelted: response.getBeltStatus().getMiddleRow3BuckleBelted(),
                                    leftRow3BuckleBelted: response.getBeltStatus().getLeftRow3BuckleBelted(),
                                    rightRow3BuckleBelted: response.getBeltStatus().getRightRow3BuckleBelted(),
                                    leftRearInflatableBelted: response.getBeltStatus().getLeftRearInflatableBelted(),
                                    rightRearInflatableBelted: response.getBeltStatus().getRightRearInflatableBelted(),
                                    middleRow1BeltDeployed: response.getBeltStatus().getMiddleRow1BeltDeployed(),
                                    middleRow1BuckleBelted: response.getBeltStatus().getMiddleRow1BuckleBelted()
                                };
                            }
                            if (response.getBodyInformation() !== null) {
                                this._vehicleData.bodyInformation = {
                                    parkBrakeActive: response.getBodyInformation().getParkBrakeActive(),
                                    ignitionStableStatus: response.getBodyInformation().getIgnitionStableStatus(),
                                    ignitionStatus: response.getBodyInformation().getIgnitionStatus(),
                                    driverDoorAjar: response.getBodyInformation().getDriverDoorAjar(),
                                    passengerDoorAjar: response.getBodyInformation().getPassengerDoorAjar(),
                                    rearLeftDoorAjar: response.getBodyInformation().getRearLeftDoorAjar(),
                                    rearRightDoorAjar: response.getBodyInformation().getRearRightDoorAjar()
                                };
                            }
                            if (response.getCloudAppVehicleID() !== null) {
                                this._vehicleData.cloudAppVehicleID = response.getCloudAppVehicleID();
                            }
                            if (response.getClusterModeStatus() !== null) {
                                this._vehicleData.clusterModeStatus = {
                                    powerModeActive: response.getClusterModeStatus().getPowerModeActive(),
                                    powerModeQualificationStatus: response.getClusterModeStatus().getPowerModeQualificationStatus(),
                                    carModeStatus: response.getClusterModeStatus().getCarModeStatus(),
                                    powerModeStatus: response.getClusterModeStatus().getPowerModeStatus()
                                };
                            }
                            if (response.getDeviceStatus() !== null) {
                                this._vehicleData.deviceStatus = {
                                    battLevelStatus: response.getDeviceStatus().getBattLevelStatus(),
                                    btIconOn: response.getDeviceStatus().getBtIconOn(),
                                    callActive: response.getDeviceStatus().getCallActive(),
                                    eCallEventActive: response.getDeviceStatus().getECallEventActive(),
                                    monoAudioOutputMuted: response.getDeviceStatus().getMonoAudioOutputMuted(),
                                    phoneRoaming: response.getDeviceStatus().getPhoneRoaming(),
                                    primaryAudioSource: response.getDeviceStatus().getPrimaryAudioSource(),
                                    signalLevelStatus: response.getDeviceStatus().getSignalLevelStatus(),
                                    stereoAudioOutputMuted: response.getDeviceStatus().getStereoAudioOutputMuted(),
                                    textMsgAvailable: response.getDeviceStatus().getTextMsgAvailable(),
                                    voiceRecOn: response.getDeviceStatus().getVoiceRecOn(),
                                }
                            }
                            if (response.getDriverBraking() !== null) {
                                this._vehicleData.driverBraking = response.getDriverBraking();
                            }
                            if (response.getECallInfo() !== null) {
                                this._vehicleData.eCallInfo = {
                                    eCallNotificationStatus: response.getECallInfo().getECallNotificationStatus(),
                                    auxECallNotificationStatus: response.getECallInfo().getAuxECallNotificationStatus(),
                                    eCallConfirmationStatus: response.getECallInfo().getECallConfirmationStatus()
                                };
                            }
                            if (response.getElectronicParkBrakeStatus() !== null) {
                                this._vehicleData.electronicParkBrakeStatus = response.getElectronicParkBrakeStatus();
                            }
                            if (response.getEmergencyEvent() !== null) {
                                this._vehicleData.emergencyEvent = {
                                    emergencyEventType: response.getEmergencyEvent().getEmergencyEventType(),
                                    fuelCutoffStatus: response.getEmergencyEvent().getFuelCutoffStatus(),
                                    rolloverEvent: response.getEmergencyEvent().getRolloverEvent(),
                                    maximumChangeVelocity: response.getEmergencyEvent().getMaximumChangeVelocity(),
                                    multipleEvents: response.getEmergencyEvent().getMultipleEvents()
                                };
                            }
                            if (response.getEngineOilLife() !== null) {
                                this._vehicleData.engineOilLife = response.getEngineOilLife();
                            }
                            if (response.getEngineTorque() !== null) {
                                this._vehicleData.engineTorque = response.getEngineTorque();
                            }
                            if (response.getExternalTemperature() !== null) {
                                this._vehicleData.externalTemperature = response.getExternalTemperature();
                            }
                            if (response.getFuelLevel() !== null) {
                                this._vehicleData.fuelLevel = response.getFuelLevel();
                            }
                            if (response.getFuelLevel_State() !== null) {
                                this._vehicleData.fuelLevelState = response.getFuelLevel_State();
                            }

                            // TODO: array
                            if (response.getFuelRange() !== null && response.getFuelRange()[0]) {
                                this._vehicleData.fuelRange = {
                                    type: response.getFuelRange()[0].getType(),
                                    range: response.getFuelRange()[0].getRange()
                                };
                            }
                            if (response.getGps() !== null) {
                                this._vehicleData.gps = {
                                    longitudeDegrees: response.getGps().getLongitudeDegrees(),
                                    latitudeDegrees: response.getGps().getLatitudeDegrees(),
                                    utcYear: response.getGps().getUtcYear(),
                                    utcMonth: response.getGps().getUtcMonth(),
                                    utcDay: response.getGps().getUtcDay(),
                                    utcHours: response.getGps().getUtcHours(),
                                    utcMinutes: response.getGps().getUtcMinutes(),
                                    utcSeconds: response.getGps().getUtcSeconds(),
                                    compassDirection: response.getGps().getCompassDirection(),
                                    pdop: response.getGps().getLongitudeDegrees(),
                                    hdop: response.getGps().getLongitudeDegrees(),
                                    vdop: response.getGps().getLongitudeDegrees(),
                                    actual: response.getGps().getActual(),
                                    satellites: response.getGps().getSatellites(),
                                    dimension: response.getGps().getDimension(),
                                    altitude: response.getGps().getAltitude(),
                                    heading: response.getGps().getHeading(),
                                    speed: response.getGps().getSpeed(),
                                    shifted: response.getGps().getShifted()
                                };
                            }
                            if (response.getHeadLampStatus() !== null) {
                                this._vehicleData.headLampStatus = {
                                    lowBeamsOn: response.getHeadLampStatus().getLowBeamsOn(),
                                    highBeamsOn: response.getHeadLampStatus().getHighBeamsOn(),
                                    ambientLightSensorStatus: response.getHeadLampStatus().getAmbientLightSensorStatus()
                                };
                            }
                            if (response.getInstantFuelConsumption() !== null) {
                                this._vehicleData.instantFuelConsumption = response.getInstantFuelConsumption();
                            }
                            if (response.getMyKey() !== null) {
                                this._vehicleData.myKey = response.getMyKey();
                            }
                            if (response.getAccPedalPosition() !== null) {
                                this._vehicleData.odometer = response.getAccPedalPosition();
                            }
                            if (response.getPrndl() !== null) {
                                this._vehicleData.prndl = response.getPrndl();
                            }
                            if (response.getRpm() !== null) {
                                this._vehicleData.rpm = response.getRpm();
                            }
                            if (response.getSpeed() !== null) {
                                this._vehicleData.speed = response.getSpeed();
                            }
                            if (response.getSteeringWheelAngle() !== null) {
                                this._vehicleData.steeringWheelAngle = response.getSteeringWheelAngle();
                            }
                            if (response.getTirePressure() !== null) {
                                this._vehicleData.tirePressure = {
                                    pressureTelltale: response.getTirePressure().getPressureTelltale(),
                                    leftFront: {
                                        status: response.getTirePressure().getLeftFront().getStatus(),
                                        tpms: response.getTirePressure().getLeftFront().getTpms(),
                                        pressure: response.getTirePressure().getLeftFront().getPressure()
                                    },
                                    rightFront: {
                                        status: response.getTirePressure().getRightFront().getStatus(),
                                        tpms: response.getTirePressure().getRightFront().getTpms(),
                                        pressure: response.getTirePressure().getRightFront().getPressure()
                                    },
                                    leftRear: {
                                        status: response.getTirePressure().getLeftRear().getStatus(),
                                        tpms: response.getTirePressure().getLeftRear().getTpms(),
                                        pressure: response.getTirePressure().getLeftRear().getPressure()
                                    },
                                    rightRear: {
                                        status: response.getTirePressure().getRightRear().getStatus(),
                                        tpms: response.getTirePressure().getRightRear().getTpms(),
                                        pressure: response.getTirePressure().getRightRear().getPressure()
                                    },
                                    innerLeftRear: {
                                        status: response.getTirePressure().getInnerLeftRear().getStatus(),
                                        tpms: response.getTirePressure().getInnerLeftRear().getTpms(),
                                        pressure: response.getTirePressure().getInnerLeftRear().getPressure()
                                    },
                                    innerRightRear: {
                                        status: response.getTirePressure().getInnerRightRear().getStatus(),
                                        tpms: response.getTirePressure().getInnerRightRear().getTpms(),
                                        pressure: response.getTirePressure().getInnerRightRear().getPressure()
                                    }
                                };
                            }
                            if (response.getTurnSignal() !== null) {
                                this._vehicleData.turnSignal = response.getTurnSignal();
                            }
                            if (response.getVin() !== null) {
                                this._vehicleData.vin = response.getVin(); // getOnly
                            }
                            if (response.getWiperStatus() !== null) {
                                this._vehicleData.wiperStatus = response.getWiperStatus();
                            }
                            console.log('GetVehicleData', this._vehicleData);
                        } else {
                            console.log('GetVehicleData was rejected.')
                        }

                    }
                );

                sdlManager.addRpcListener(
                    SDL.rpc.enums.FunctionID.OnButtonPress,
                    (onButtonPress) => {
                        console.log('onButtonPress', onButtonPress);
                        if (onButtonPress instanceof SDL.rpc.messages.OnButtonPress && onButtonPress.getButtonName() != 'CUSTOM_BUTTON') {
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onButtonPress', { BUTTON_NAME: onButtonPress.getButtonName() })
                        }
                    }
                );

                sdlManager.addRpcListener(
                    SDL.rpc.enums.FunctionID.OnVehicleData,
                    async onVehicleDataNotification => {
                        if (onVehicleDataNotification.getAccPedalPosition() !== null) {
                            this._vehicleData.accPedalPosition = onVehicleDataNotification.getAccPedalPosition();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'accPedalPosition' })
                        }
                        if (onVehicleDataNotification.getAirbagStatus()) {
                            this._vehicleData.airBagStatus = {
                                driverAirbagDeployed: onVehicleDataNotification.getAirbagStatus().getDriverAirbagDeployed(),
                                driverCurtainAirbagDeployed: onVehicleDataNotification.getAirbagStatus().getDriverCurtainAirbagDeployed(),
                                driverKneeAirbagDeployed: onVehicleDataNotification.getAirbagStatus().getDriverKneeAirbagDeployed(),
                                driverSideAirbagDeployed: onVehicleDataNotification.getAirbagStatus().getDriverSideAirbagDeployed(),
                                passengerAirbagDeployed: onVehicleDataNotification.getAirbagStatus().getPassengerAirbagDeployed(),
                                passengerCurtainAirbagDeployed: onVehicleDataNotification.getAirbagStatus().getPassengerCurtainAirbagDeployed(),
                                passengerKneeAirbagDeployed: onVehicleDataNotification.getAirbagStatus().getPassengerKneeAirbagDeployed(),
                                passengerSideAirbagDeployed: onVehicleDataNotification.getAirbagStatus().getPassengerSideAirbagDeployed()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'airBagStatus' })
                        }
                        if (onVehicleDataNotification.getBeltStatus() !== null) {
                            this._vehicleData.beltStatus = {
                                driverBeltDeployed: onVehicleDataNotification.getBeltStatus().getDriverBeltDeployed(),
                                passengerBeltDeployed: onVehicleDataNotification.getBeltStatus().getPassengerBeltDeployed(),
                                passengerBuckleBelted: onVehicleDataNotification.getBeltStatus().getPassengerBuckleBelted(),
                                driverBuckleBelted: onVehicleDataNotification.getBeltStatus().getDriverBuckleBelted(),
                                leftRow2BuckleBelted: onVehicleDataNotification.getBeltStatus().getLeftRow2BuckleBelted(),
                                passengerChildDetected: onVehicleDataNotification.getBeltStatus().getPassengerChildDetected(),
                                rightRow2BuckleBelted: onVehicleDataNotification.getBeltStatus().getRightRow2BuckleBelted(),
                                middleRow2BuckleBelted: onVehicleDataNotification.getBeltStatus().getMiddleRow2BuckleBelted(),
                                middleRow3BuckleBelted: onVehicleDataNotification.getBeltStatus().getMiddleRow3BuckleBelted(),
                                leftRow3BuckleBelted: onVehicleDataNotification.getBeltStatus().getLeftRow3BuckleBelted(),
                                rightRow3BuckleBelted: onVehicleDataNotification.getBeltStatus().getRightRow3BuckleBelted(),
                                leftRearInflatableBelted: onVehicleDataNotification.getBeltStatus().getLeftRearInflatableBelted(),
                                rightRearInflatableBelted: onVehicleDataNotification.getBeltStatus().getRightRearInflatableBelted(),
                                middleRow1BeltDeployed: onVehicleDataNotification.getBeltStatus().getMiddleRow1BeltDeployed(),
                                middleRow1BuckleBelted: onVehicleDataNotification.getBeltStatus().getMiddleRow1BuckleBelted()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'beltStatus' })
                        }
                        if (onVehicleDataNotification.getBodyInformation() !== null) {
                            this._vehicleData.bodyInformation = {
                                parkBrakeActive: onVehicleDataNotification.getBodyInformation().getParkBrakeActive(),
                                ignitionStableStatus: onVehicleDataNotification.getBodyInformation().getIgnitionStableStatus(),
                                ignitionStatus: onVehicleDataNotification.getBodyInformation().getIgnitionStatus(),
                                driverDoorAjar: onVehicleDataNotification.getBodyInformation().getDriverDoorAjar(),
                                passengerDoorAjar: onVehicleDataNotification.getBodyInformation().getPassengerDoorAjar(),
                                rearLeftDoorAjar: onVehicleDataNotification.getBodyInformation().getRearLeftDoorAjar(),
                                rearRightDoorAjar: onVehicleDataNotification.getBodyInformation().getRearRightDoorAjar()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'bodyInformation' })
                        }
                        if (onVehicleDataNotification.getCloudAppVehicleID() !== null) {
                            this._vehicleData.cloudAppVehicleID = onVehicleDataNotification.getCloudAppVehicleID();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'cloudAppVehicleID' })
                        }
                        if (onVehicleDataNotification.getClusterModeStatus() !== null) {
                            this._vehicleData.clusterModeStatus = {
                                powerModeActive: onVehicleDataNotification.getClusterModeStatus().getPowerModeActive(),
                                powerModeQualificationStatus: onVehicleDataNotification.getClusterModeStatus().getPowerModeQualificationStatus(),
                                carModeStatus: onVehicleDataNotification.getClusterModeStatus().getCarModeStatus(),
                                powerModeStatus: onVehicleDataNotification.getClusterModeStatus().getPowerModeStatus()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'clusterModeStatus' })
                        }
                        if (onVehicleDataNotification.getDeviceStatus() !== null) {
                            this._vehicleData.deviceStatus = {
                                battLevelStatus: onVehicleDataNotification.getDeviceStatus().getBattLevelStatus(),
                                btIconOn: onVehicleDataNotification.getDeviceStatus().getBtIconOn(),
                                callActive: onVehicleDataNotification.getDeviceStatus().getCallActive(),
                                eCallEventActive: onVehicleDataNotification.getDeviceStatus().getECallEventActive(),
                                monoAudioOutputMuted: onVehicleDataNotification.getDeviceStatus().getMonoAudioOutputMuted(),
                                phoneRoaming: onVehicleDataNotification.getDeviceStatus().getPhoneRoaming(),
                                primaryAudioSource: onVehicleDataNotification.getDeviceStatus().getPrimaryAudioSource(),
                                signalLevelStatus: onVehicleDataNotification.getDeviceStatus().getSignalLevelStatus(),
                                stereoAudioOutputMuted: onVehicleDataNotification.getDeviceStatus().getStereoAudioOutputMuted(),
                                textMsgAvailable: onVehicleDataNotification.getDeviceStatus().getTextMsgAvailable(),
                                voiceRecOn: onVehicleDataNotification.getDeviceStatus().getVoiceRecOn(),
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'deviceStatus' })
                        }

                        if (onVehicleDataNotification.getDriverBraking() !== null) {
                            this._vehicleData.driverBraking = onVehicleDataNotification.getDriverBraking();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'driverBraking' });
                        }
                        if (onVehicleDataNotification.getECallInfo() !== null) {
                            this._vehicleData.eCallInfo = {
                                eCallNotificationStatus: onVehicleDataNotification.getECallInfo().getECallNotificationStatus(),
                                auxECallNotificationStatus: onVehicleDataNotification.getECallInfo().getAuxECallNotificationStatus(),
                                eCallConfirmationStatus: onVehicleDataNotification.getECallInfo().getECallConfirmationStatus()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'eCallInfo' });
                        }
                        if (onVehicleDataNotification.getElectronicParkBrakeStatus() !== null) {
                            this._vehicleData.electronicParkBrakeStatus = onVehicleDataNotification.getElectronicParkBrakeStatus();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'electronicParkBrakeStatus' });
                        }
                        if (onVehicleDataNotification.getEmergencyEvent() !== null) {
                            this._vehicleData.emergencyEvent = {
                                emergencyEventType: onVehicleDataNotification.getEmergencyEvent().getEmergencyEventType(),
                                fuelCutoffStatus: onVehicleDataNotification.getEmergencyEvent().getFuelCutoffStatus(),
                                rolloverEvent: onVehicleDataNotification.getEmergencyEvent().getRolloverEvent(),
                                maximumChangeVelocity: onVehicleDataNotification.getEmergencyEvent().getMaximumChangeVelocity(),
                                multipleEvents: onVehicleDataNotification.getEmergencyEvent().getMultipleEvents()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'emergencyEvent' });
                        }
                        if (onVehicleDataNotification.getEngineOilLife() !== null) {
                            this._vehicleData.engineOilLife = onVehicleDataNotification.getEngineOilLife();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'engineOilLife' });
                        }
                        if (onVehicleDataNotification.getEngineTorque() !== null) {
                            this._vehicleData.engineTorque = onVehicleDataNotification.getEngineTorque();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'engineTorque' });
                        }
                        if (onVehicleDataNotification.getExternalTemperature() !== null) {
                            this._vehicleData.externalTemperature = onVehicleDataNotification.getExternalTemperature();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'externalTemperature' });
                        }
                        if (onVehicleDataNotification.getFuelLevel() !== null) {
                            this._vehicleData.fuelLevel = onVehicleDataNotification.getFuelLevel();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'fuelLevel' });
                        }
                        if (onVehicleDataNotification.getFuelLevel_State() !== null) {
                            this._vehicleData.fuelLevelState = onVehicleDataNotification.getFuelLevel_State();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'fuelLevelState' });
                        }

                        // TODO: array
                        if (onVehicleDataNotification.getFuelRange() !== null && onVehicleDataNotification.getFuelRange()[0]) {
                            this._vehicleData.fuelRange = {
                                type: onVehicleDataNotification.getFuelRange()[0].getType(),
                                range: onVehicleDataNotification.getFuelRange()[0].getRange()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'fuelRange' });
                        }
                        if (onVehicleDataNotification.getGps() !== null) {
                            this._vehicleData.gps = {
                                longitudeDegrees: onVehicleDataNotification.getGps().getLongitudeDegrees(),
                                latitudeDegrees: onVehicleDataNotification.getGps().getLatitudeDegrees(),
                                utcYear: onVehicleDataNotification.getGps().getUtcYear(),
                                utcMonth: onVehicleDataNotification.getGps().getUtcMonth(),
                                utcDay: onVehicleDataNotification.getGps().getUtcDay(),
                                utcHours: onVehicleDataNotification.getGps().getUtcHours(),
                                utcMinutes: onVehicleDataNotification.getGps().getUtcMinutes(),
                                utcSeconds: onVehicleDataNotification.getGps().getUtcSeconds(),
                                compassDirection: onVehicleDataNotification.getGps().getCompassDirection(),
                                pdop: onVehicleDataNotification.getGps().getLongitudeDegrees(),
                                hdop: onVehicleDataNotification.getGps().getLongitudeDegrees(),
                                vdop: onVehicleDataNotification.getGps().getLongitudeDegrees(),
                                actual: onVehicleDataNotification.getGps().getActual(),
                                satellites: onVehicleDataNotification.getGps().getSatellites(),
                                dimension: onVehicleDataNotification.getGps().getDimension(),
                                altitude: onVehicleDataNotification.getGps().getAltitude(),
                                heading: onVehicleDataNotification.getGps().getHeading(),
                                speed: onVehicleDataNotification.getGps().getSpeed(),
                                shifted: onVehicleDataNotification.getGps().getShifted()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'gps' });
                        }
                        if (onVehicleDataNotification.getHeadLampStatus() !== null) {
                            this._vehicleData.headLampStatus = {
                                lowBeamsOn: onVehicleDataNotification.getHeadLampStatus().getLowBeamsOn(),
                                highBeamsOn: onVehicleDataNotification.getHeadLampStatus().getHighBeamsOn(),
                                ambientLightSensorStatus: onVehicleDataNotification.getHeadLampStatus().getAmbientLightSensorStatus()
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'headLampStatus' });
                        }
                        if (onVehicleDataNotification.getInstantFuelConsumption() !== null) {
                            this._vehicleData.instantFuelConsumption = onVehicleDataNotification.getInstantFuelConsumption();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'instantFuelConsumption' });
                        }
                        if (onVehicleDataNotification.getMyKey() !== null) {
                            this._vehicleData.myKey = onVehicleDataNotification.getMyKey();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'myKey' });
                        }
                        if (onVehicleDataNotification.getAccPedalPosition() !== null) {
                            this._vehicleData.odometer = onVehicleDataNotification.getAccPedalPosition();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'odometer' });
                        }
                        if (onVehicleDataNotification.getPrndl() !== null) {
                            this._vehicleData.prndl = onVehicleDataNotification.getPrndl();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'prndl' });
                        }
                        if (onVehicleDataNotification.getRpm() !== null) {
                            this._vehicleData.rpm = onVehicleDataNotification.getRpm();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'rpm' });
                        }
                        if (onVehicleDataNotification.getSpeed() !== null) {
                            this._vehicleData.speed = onVehicleDataNotification.getSpeed();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'speed' });
                        }
                        if (onVehicleDataNotification.getSteeringWheelAngle() !== null) {
                            this._vehicleData.steeringWheelAngle = onVehicleDataNotification.getSteeringWheelAngle();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'steeringWheelAngle' });
                        }
                        if (onVehicleDataNotification.getTirePressure() !== null) {
                            this._vehicleData.tirePressure = {
                                pressureTelltale: onVehicleDataNotification.getTirePressure().getPressureTelltale(),
                                leftFront: {
                                    status: onVehicleDataNotification.getTirePressure().getLeftFront().getStatus(),
                                    tpms: onVehicleDataNotification.getTirePressure().getLeftFront().getTpms(),
                                    pressure: onVehicleDataNotification.getTirePressure().getLeftFront().getPressure()
                                },
                                rightFront: {
                                    status: onVehicleDataNotification.getTirePressure().getRightFront().getStatus(),
                                    tpms: onVehicleDataNotification.getTirePressure().getRightFront().getTpms(),
                                    pressure: onVehicleDataNotification.getTirePressure().getRightFront().getPressure()
                                },
                                leftRear: {
                                    status: onVehicleDataNotification.getTirePressure().getLeftRear().getStatus(),
                                    tpms: onVehicleDataNotification.getTirePressure().getLeftRear().getTpms(),
                                    pressure: onVehicleDataNotification.getTirePressure().getLeftRear().getPressure()
                                },
                                rightRear: {
                                    status: onVehicleDataNotification.getTirePressure().getRightRear().getStatus(),
                                    tpms: onVehicleDataNotification.getTirePressure().getRightRear().getTpms(),
                                    pressure: onVehicleDataNotification.getTirePressure().getRightRear().getPressure()
                                },
                                innerLeftRear: {
                                    status: onVehicleDataNotification.getTirePressure().getInnerLeftRear().getStatus(),
                                    tpms: onVehicleDataNotification.getTirePressure().getInnerLeftRear().getTpms(),
                                    pressure: onVehicleDataNotification.getTirePressure().getInnerLeftRear().getPressure()
                                },
                                innerRightRear: {
                                    status: onVehicleDataNotification.getTirePressure().getInnerRightRear().getStatus(),
                                    tpms: onVehicleDataNotification.getTirePressure().getInnerRightRear().getTpms(),
                                    pressure: onVehicleDataNotification.getTirePressure().getInnerRightRear().getPressure()
                                }
                            };
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'tirePressure' });
                        }
                        if (onVehicleDataNotification.getTurnSignal() !== null) {
                            this._vehicleData.turnSignal = onVehicleDataNotification.getTurnSignal();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'turnSignal' });
                        }
                        // if (onVehicleDataNotification.getVin() !== null) {
                        //     this._vehicleData.vin = onVehicleDataNotification.getVin(); // getOnly
                        //     this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'vin' });
                        // }
                        if (onVehicleDataNotification.getWiperStatus() !== null) {
                            this._vehicleData.wiperStatus = onVehicleDataNotification.getWiperStatus();
                            this._dridrinBlocks.runtime.startHats('dridrin_event_onVehicleData', { VEHICLE_DATA: 'wiperStatus' });
                        }
                    });
                this._onConnected();
            })
            .setOnDestroy((sdlManager) => {
                this._managersReady = false;
                this._hmiFull = false;
                this._hmiLevel = SDL.rpc.enums.HMILevel.HMI_NONE
            })
            .setOnError((sdlManager, info) => {
                console.error('Error from SdlManagerListener: ', info);
            });



        this._sdlManager = new SDL.manager.SdlManager(this._appConfig, managerListener);
        this._sdlManager.start();

        // for a cloud server app the hmi full will be received before the managers report that they're ready!
        this._managersReady = false;
        this._hmiFull = false;
    }


    async say(message) {
        if (!(this._managersReady && this._hmiFull)) return;

        const chunk = new SDL.rpc.structs.TTSChunk().setText(message);
        chunk.setType(SDL.rpc.enums.SpeechCapabilities.SC_TEXT);
        const speak = new SDL.rpc.messages.Speak().setTtsChunks([
            chunk
        ]);
        this._sdlManager.sendRpcResolve(speak);
    }

    async playSound(fileName, fileType, fileData) {
        if (!(this._managersReady && this._hmiFull)) return;

        await this.uploadFile(fileName, fileType, fileData);
        const chunk = new SDL.rpc.structs.TTSChunk()
            .setText(fileName)
            .setType(SDL.rpc.enums.SpeechCapabilities.FILE);
        const speak = new SDL.rpc.messages.Speak().setTtsChunks([
            chunk
        ]);
        this._sdlManager.sendRpcResolve(speak)
    }

    _onConnected() {
        this._managersReady = true;
        this._checkReadyState();
    }

    _onHmiStatusListener(onHmiStatus) {
        this._hmiLevel = onHmiStatus.getHmiLevel();

        // wait for the FULL state for more functionality
        if (this._hmiLevel === SDL.rpc.enums.HMILevel.HMI_FULL) {
            this._hmiFull = true;
            this._checkReadyState();
        }
    }

    get hmiLevel() {
        return this._hmiLevel
    }

    async _checkReadyState() {
        if (!(this._managersReady && this._hmiFull)) return;

        this._sdlManager.getScreenManager().beginTransaction();

        await this.setTemplate();
        // await this.setTextAlignment();
        await this.setTextField();
        await this.setPrimaryGraphic();
        await this.setSecondaryGraphic();
        await this.addSoftButton();

        const success = await this._sdlManager.getScreenManager().commit().catch(function (error) { console.error(error) });
        console.log('ScreenManager update complete:', success);
        if (success === true) {
            // Update complete
        } else {
            // Something went wrong
        }

        Object.keys(SDL.rpc.enums.ButtonName._MAP).forEach((key) => {
            const subscribeButtonRequest = new SDL.rpc.messages.SubscribeButton();
            subscribeButtonRequest.setButtonName(SDL.rpc.enums.ButtonName._MAP[key]);
            this.sendRpcRequest(subscribeButtonRequest);
        });


    }

    async sendRpcRequest(request) {
        const response = await this._sdlManager.sendRpcResolve(request);
    }

    stop() {
        if (this._managersReady) {
            this._sdlManager.dispose();
        }
    }

    isReady() {
        return this._managersReady;
    }

    async unRegisterApp() {
        await this.sendRpcRequest(new SDL.rpc.messages.UnregisterAppInterface());
        this.stop();
    }

}

export default CoreSdl