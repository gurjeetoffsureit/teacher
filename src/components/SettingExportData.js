import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ScrollView,
    Linking,
    Alert,
    Platform,
    TouchableOpacity, Image, Switch, SafeAreaView
} from 'react-native';

import RNFS from 'react-native-fs';
import dropboxKey from '../constants/DropboxConstant';
import Loader from '../ActivityIndicator/Loader';
import API from '../constants/ApiConstant'
import AppConstant from '../constants/AppConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import { EventRegister } from 'react-native-event-listeners'
import update from 'react-addons-update'
import SocketConstant from '../constants/SocketConstant'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import ActionSheet from 'react-native-actionsheet'
import ComingFrom from '../constants/ComingFrom'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'
import AlertWithTextBox from "../Modal/AlertWithTextBox";


// var self;
let date = new Date()
const getBackupDate = (parseInt(date.getMonth() + 1) + "_" + date.getDate() + "_" + date.getFullYear() + "_" +
    TeacherAssitantManager.getInstance()._convertTimeTo12HourFormat(TeacherAssitantManager.getInstance()._getHoursFromDate(date),
        TeacherAssitantManager.getInstance()._getMinutesFromDate(date), TeacherAssitantManager.getInstance()._getSecondsFromDate(date)));

export default class SettingExportData extends React.PureComponent {

    _showToastMessage(message, isdelay) {
        if (isdelay) {
            let self = this
            setTimeout(function () {
                self.toast.show(message, DURATION.LENGTH_SHORT);
            }, 2000)
            return
        }

        this.toast.show(message, DURATION.LENGTH_SHORT);
    }


    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            isshowAlertWithTextBox: false,
            filename: '',
            accessToken: this.props.navigation.state.params.accessToken,
            // filename: TeacherAssitantManager.getInstance().getUserID() + '_' + new Date().getTime() + '.csv',
        }

    }

    _getFileName = () => {
        let date = new Date()
        let filename = 'Backup_' + (parseInt(date.getMonth() + 1) + "_" + date.getDate() + "_" + date.getFullYear() + "_" +
            TeacherAssitantManager.getInstance()._convertTimeTo12HourFormat(TeacherAssitantManager.getInstance()._getHoursFromDate(date),
                TeacherAssitantManager.getInstance()._getMinutesFromDate(date), TeacherAssitantManager.getInstance()._getSecondsFromDate(date)));

        return filename
    }
    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    componentDidMount() {
        this.props.navigation.setParams({
            moveToHome: this.gotoPreviousScreen
        })
        this._addEventListener()
    }
    gotoPreviousScreen = () => {
        this._removeEventListener()
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();

    }

    componentWillUnmount() {
        //console.log('componentWillUnmount');
        Linking.removeEventListener('url', (event) => this.handleOpenURL(event));
    }

    // event listener for socket
    _addEventListener = () => {

        this.updateUserBackUp = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USERBACKUP, (data) => {
            //console.log("addStudentListener", data)
            if (data.error) {
                this.setState({
                    loading: false
                })
                this._showToastMessage(data.message, true)
                return
            }
            if (data.message.toLowerCase() != 'user backup is ready.')
                this._showToastMessage(data.message, true)
            else {
                this._saveToDropbox(data)
            }


        })

        // this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
        //     //console.log("addStudentListener", data)
        //     this._updateUserSetting(data)
        // })

    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.updateUserBackUp)
    }

    _updateUserSetting = (settingData) => {

        if (settingData.dropboxAccessToken != undefined) {
            let isTrue = settingData.dropboxAccessToken == ''
            this.setState({
                accessToken: isTrue ? '' : settingData.dropboxAccessToken,

            })
        }


    }

    // //_getSettingData 
    // _getSettingData() {
    //     var userId = TeacherAssitantManager.getInstance().getUserID();
    //     var url = API.BASE_URL + API.API_USER_SETTINGS_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID()
    //     var headerValue =
    //     {
    //         // Accept: 'application/json',
    //         // 'Content-Type': 'application/json',
    //         // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
    //         // 'userId': TeacherAssitantManager.getInstance().getUserID(),
    //     }

    //     //console.log("picker data url is", url)
    //     //fetch
    //     TeacherAssitantManager.getInstance()._serviceMethod(url, {
    //         method: 'GET',
    //         headers: headerValue,
    //     })
    //         .then((responseJson) => {
    //             if (responseJson.success) {
    //                 var settingData = responseJson.data
    //                 this.setState({
    //                     lblSortOrder: this._setOrderValues(settingData.studentSortOrder),
    //                     lblDisplayOrder: this._setOrderValues(settingData.studentDisplayOrder),
    //                     showThumbnailValue: settingData.studentThumbnailImages,
    //                     lblQuickJump: this._setOrderValues(settingData.quickJumpButton, true),
    //                     showPointValue: settingData.showPointValues,
    //                     settingId: settingData._id,
    //                     lblScreenLock: settingData.screenLock.length == 4 ? 'ON' : 'OFF',
    //                     screenLockValue: settingData.screenLock.length == 4 ? settingData.screenLock : '',
    //                     isDefaultActionValue: settingData.isDefaultActionValue,
    //                     toTeacherEmail: settingData.toTeacherEmail == undefined ? '' : settingData.toTeacherEmail,
    //                     dropboxAccessToken: settingData.dropboxAccessToken,
    //                     dropboxEnabledValue: settingData.dropboxAccessToken == '' ? false : true,
    //                 })
    //                 //attached socket listner           
    //                 this._addEventListener();
    //             }
    //         })
    //         .catch((error) => {
    //             //console.log("error===" + error)
    //         })
    // }




    showAlertWithTextBox = () => {
        let fileName = this._getFileName()
        this.setState({
            filename: fileName
        }, function () {
            let file = this.state.filename
            this.setState({
                isshowAlertWithTextBox: true
            })
        })
    }


    uploadBegin = (response) => {
        const jobId = response.jobId;
        //console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
    };

    uploadProgress = (response) => {
        const percentage = Math.floor((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
        //console.log('UPLOAD IS ' + percentage + '% DONE!');
    };

    _exportData = () => {

        this.setState({
            loading: true
        })

        let url = API.BASE_URL + API.API_EXPORT + TeacherAssitantManager.getInstance().getUserID()

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((responseJson) => {
            //console.log(responseJson.message);
            this.setState({
                loading: false
            })
            //if (responseJson.success) {

            this._showToastMessage(responseJson.message)
            // }
            // else {

            //  this._showToastMessage(responseJson.message);
            // }
        }).catch((error) => {
            this.setState({
                loading: false
            })
            console.error(error);
        });

    }

    _saveToDropbox = (data) => {



      
        let self = this
        let Dropbox = require('dropbox').Dropbox;
        let dbx = new Dropbox({ fetch:fetch,accessToken: this.state.accessToken });
        let fileContent = data.fileContent
        // if (Platform.OS === 'android') {
        var Buffer = require('safe-buffer').Buffer
        fileContent = Buffer.from(data.fileContent, 'utf8')
        // }

        dbx.filesUpload({
            path: '/TeacherAssistant/' + this.state.filename + '.dat',
            contents: fileContent,
            mode: 'add',
        }).then(function (response) {

            self.setState({
                loading: false
            }, function () {
                self._showToastMessage(response.name + ' file has been successfully uploaded', true)

            })


        }).catch(function (error) {
            self.setState({
                loading: false
            }, function () {
                self._showToastMessage(self.state.filename + ' file hase been not uploaded. Please try again later', true)

            })
        });
    }





    _openDrobboxUplaodAlert = () => {

        if (this.state.accessToken == '') {
            this._showToastMessage('please goto setting and enable dropbox', true)
            return
        }
        // let fileName = this._getFileName()
        // this.setState({
        //     filename: fileName,
        // },function(){
        Alert.alert(
            AppConstant.APP_NAME,
            TextMessage.ARE_YOU_SURE_YOU_WANT_TO_EXPORT_BACKUP_TO_DROPBOX,
            [
                { text: 'Cancel', onPress: () =>{}}, //console.log('Cancel Pressed!') },
                { text: 'Yes', onPress: 
                this.showAlertWithTextBox 
            },
            ],
            { cancelable: false }
        )
        // })







    }

    _movetoNextScreen = (cominfFrom) => {
        this.props.navigation.navigate("AddActionsToManyScreen", {
            onGoBack: this.refresh, screen: "CSV Export",
            selectedActionList: [], comingFrom: cominfFrom,
            leftHeader: BreadCrumbConstant.CANCEL
        });
    }

    _onPress = (moveTo) => {

        switch (moveTo) {
            case AppConstant.SAVE_TO_DROPBOXKEY:
                this._openDrobboxUplaodAlert()
                break;
            case AppConstant.TEXT_REPORT_VIA_EMAIL:
                this._removeEventListener()
                const { state, navigate } = this.props.navigation;
                navigate("SettingExportReportOptions", { screenTitle: "Report options", onGoBack: this.refresh, leftHeader: BreadCrumbConstant.SETTINGS, headerRight: "Continue" })
                break;
            case AppConstant.STUDENT_DEMOGRAPHICS:
                this._removeEventListener()
                this._movetoNextScreen(ComingFrom.EXPORT_DATA_STUDENT_DEMOGRAPHICS);
                break;
            case AppConstant.STUDENT_ACTIONS:
                this._removeEventListener()
                this._movetoNextScreen(ComingFrom.EXPORT_DATA_STUDENT_ACTIONS);

                break
        }

    }
    refresh = () => {
        this._addEventListener()
    }


    _responseFromAlert = (isTrue, filename) => {
        this.setState({
            isshowAlertWithTextBox: false,
            filename: isTrue ? filename : ''
        }, function () {
            if (isTrue) {
                this._exportData()
            }
        })

    }



    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: params.screenTitle,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.moveToHome()}>
                    <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.width60Per,
                    StyleTeacherApp.marginLeft14]}>
                        {/* <Image
              style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
              source={Platform.OS === "android" ? require("../img/back_arrow_android.png") : require("../img/back_arrow_ios.png")} /> */}
                        <Image
                            style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
                            source={require("../img/back_arrow_ios.png")} />
                        <Text style={[StyleTeacherApp.headerLeftButtonText]} numberOfLines={1}>{
                            TeacherAssitantManager.getInstance()._setnavigationleftButtonText(params.leftHeader)}</Text>
                    </View>
                </TouchableOpacity>

                        ,
            headerRight:  () => 
                <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
                </View>

            

        }
    }




    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Toast ref={o => this.toast = o}
                    position={'bottom'}
                    positionValue={200}
                />
                {
                    this.state.isshowAlertWithTextBox && <AlertWithTextBox isshowAlertWithTextBox={this.state.isshowAlertWithTextBox}
                        _responseFromAlert={this._responseFromAlert}
                        filename={this.state.filename} />
                }

                <Loader loading={this.state.loading} />
                <ScrollView>

                    <View style={styles.container} >
                        {/* <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>BACKUP</Text>
                        </View> */}
                        {/* <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => { this._onPress(AppConstant.SAVE_TO_DROPBOXKEY) }}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>Save to Dropbox</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                    <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                        source={require('../img/icon_arrow.png')}>
                                    </Image>
                                </View>
                            </TouchableOpacity>
                        </View> */}
                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>REPORT</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => { this._onPress(AppConstant.TEXT_REPORT_VIA_EMAIL) }}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>Text Report via Email</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                    <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                        source={require('../img/icon_arrow.png')}>
                                    </Image>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {/* email blast SECTION */}
                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>CSV EXPORT</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => { this._onPress(AppConstant.STUDENT_DEMOGRAPHICS) }}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, 0)} Demographics</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                    <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                        source={require('../img/icon_arrow.png')}>
                                    </Image>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => { this._onPress(AppConstant.STUDENT_ACTIONS) }}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, 0) + ' ' + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 2)}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                    <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                        source={require('../img/icon_arrow.png')}>
                                    </Image>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView >


        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E7E7E7"
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    buttonWithTopMargin: {
        height: 50,
        flex: 2,
        marginTop: 15,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
    },
    buttonWithoutTopMargin: {
        height: 50,
        flex: 1,
        marginTop: 0,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        marginLeft: 10,
    },

    sectionTitle: { fontSize: 16, color: 'black' },
    sectionViewContainer: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', height: 40, marginLeft: 10 },
    textAlignLeft: { textAlign: 'left' },
    positionAbsoluteWithEnd: {
        position: 'absolute', end: 10
    },
    textPositionAbsoluteWithEnd: {
        position: 'absolute', end: 30
    },
    touchableOpacityItemViewContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },

});