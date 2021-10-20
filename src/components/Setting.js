import React from "react";
import {
    View,
    Text,
    StyleSheet,
    PermissionsAndroid,
    ScrollView,
    Linking,
    Platform,
    TouchableOpacity, Image, Switch, SafeAreaView,
    Alert
} from 'react-native';
import
AsyncStorage
    from '@react-native-community/async-storage';
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
import DocumentPicker from 'react-native-document-picker';
import StorageConstant from '../constants/StorageConstant'
import Subscription from '../ActivityIndicator/Subscription'

var self;
export default class Setting extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            isNeedToFinish: false,
            //this willbe use for sort and diplay order 
            studentOrderList: [{ 'data': { 'name': 'First, Last' }, 'selectionVisibilty': false },
            { 'data': { 'name': 'Last, First' }, 'selectionVisibilty': false }],
            studentQuickJumpList: [{ 'data': { 'name': 'Home' }, 'selectionVisibilty': false },
            { 'data': { 'name': 'Class' }, 'selectionVisibilty': false },
            { 'data': { 'name': 'Student' }, 'selectionVisibilty': false }],
            showPointValue: false,
            showThumbnailValue: false,
            lblSortOrder: '',
            lblDisplayOrder: '',
            lblQuickJump: '',
            settingId: '',
            lblScreenLock: 'OFF',
            screenLockValue: '',
            toTeacherEmail: '',
            //Dropbox Section
            dropboxAccessToken: '',
            dropboxEnabledValue: false,
            isFromDropBoxEnabled: false,

            //actionSheet variables
            actionSheetTitle: AppConstant.APP_NAME,
            actionSheetOptions: [],
            actionSheetMessage: '',
            isForceUpdate: false,
            isShowingSubscription: false,
            subscription: undefined

        }
        this.deleteAndCancelOptions = ['DELETE', 'CANCEL']
        this.resetAndCancelOptions = ['RESET', 'CANCEL']
        self = this;

    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    async componentDidMount() {
        await TeacherAssitantManager.getInstance().getUserSubscriptionData()
        let subscription = await TeacherAssitantManager.getInstance().getUserSubscriptionsDataToLocalDb()
        if (subscription) {
            this.setState({
                subscription
            })
        }
        // this._getSettingData()
        //console.log('componentDidMount');
        Linking.addEventListener('url', this.handleOpenURL);
        Linking.getInitialURL().then((ev) => {
            if (ev) {
                this.handleOpenURL(ev);
            }
        }).catch(err => {
            console.warn('An error occurred', err);
        });




        this.props.navigation.setParams({
            moveToHome: this.gotoPreviousScreen
        })

        this.refreshScreen()
        // this._sub = this.props.navigation.addListener(
        //     'didFocus',
        //     this.refreshScreen
        // );

        // this.initializeIAPListner()

    }

    //initializeIAPListner
    initializeIAPListner() {

        this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
            //console.log('purchaseUpdatedListener', purchase);
            //Sentry.captureMessage(`6 exploreKandiid initializeIAPListner purchaseUpdatedListener ${purchase}`, //Sentry.Severity.Log)
            const receipt = purchase.transactionReceipt;
            if (receipt) {
                //Sentry.captureMessage(`7 exploreKandiid initializeIAPListner receipt ${JSON.stringify(receipt)}`, //Sentry.Severity.Log)

                try {
                    await RNIap.finishTransaction(purchase, true);
                    //Sentry.captureMessage(`8 exploreKandiid initializeIAPListner finishTransaction`, //Sentry.Severity.Log)
                    //Sentry.captureMessage(`9 exploreKandiid initializeIAPListner is going to hit the api`, //Sentry.Severity.Log)
                    this.purchaseByIAP(purchase)


                } catch (err) {
                    //Sentry.captureMessage(`8 err exploreKandiid initializeIAPListner finishTransaction ${err} `, //Sentry.Severity.Log)

                    // this.setState({
                    //     isAnimatedLoderVisible: false
                    // }, () => {
                    //     KDManager.showToastMessage(err.message, KDToastType.WARNING)
                    // })
                }           // again until you do this.
            }
        });

        this.purchaseErrorSubscription = purchaseErrorListener((error) => {
            //Sentry.captureMessage(`exploreKandiid purchaseErrorListener ${error}`, //Sentry.Severity.Log)

            // this.setState({
            //     isAnimatedLoderVisible: false
            // })
            console.warn('purchaseErrorListener', error);
        });

    }

    refreshScreen = () => {
        this._getSettingData();
        // this.hitApiToSaveSettings();
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

        this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
            //console.log("addStudentListener", data)
            this._updateUserSetting(data)
        })
        this.updateUserSettingDefault = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING_DEFAULT, (data) => {
            //console.log("addStudentListener", data)
            this._updateUserSettingDefault(data)
        })
    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.updateUserSetting)
        EventRegister.removeEventListener(this.updateUserSettingDefault)
    }

    //add data to student
    _updateUserSetting = (settingData) => {

        if (settingData.studentSortOrder != undefined) {
            this.setState({
                lblSortOrder: this._setOrderValues(settingData.studentSortOrder)
            })
        } else if (settingData.studentDisplayOrder != undefined) {
            this.setState({
                lblDisplayOrder: this._setOrderValues(settingData.studentDisplayOrder)
            })
        }
        else if (settingData.studentThumbnailImages != undefined) {
            this.setState({
                showThumbnailValue: settingData.studentThumbnailImages
            })
        }
        else if (settingData.quickJumpButton != undefined) {
            this.setState({
                lblQuickJump: this._setOrderValues(settingData.quickJumpButton, true)
            })
        }
        else if (settingData.showPointValues != undefined) {
            this.setState({
                showPointValue: settingData.showPointValues
            })
        }
        else if (settingData.screenLock != undefined) {
            this.setState({
                lblScreenLock: settingData.screenLock.length == 4 ? 'ON' : 'OFF',
                screenLockValue: settingData.screenLock.length == 4 ? settingData.screenLock : ''
            })
        } else if (settingData.dropboxAccessToken != undefined) {
            let isTrue = settingData.dropboxAccessToken == ''
            this.setState({
                dropboxAccessToken: isTrue ? '' : settingData.dropboxAccessToken,
                dropboxEnabledValue: isTrue ? false : true,
            })
        }


    }

    _updateUserSettingDefault = (settingData) => {
        this.setState({
            lblSortOrder: this._setOrderValues(settingData.studentSortOrder),
            lblDisplayOrder: this._setOrderValues(settingData.studentDisplayOrder),
            showThumbnailValue: settingData.studentThumbnailImages,
            lblQuickJump: this._setOrderValues(settingData.quickJumpButton, true),
            showPointValue: settingData.showPointValues,
            settingId: settingData._id,
            lblScreenLock: settingData.screenLock.length == 4 ? 'ON' : 'OFF',
            screenLockValue: settingData.screenLock.length == 4 ? settingData.screenLock : '',
            isDefaultActionValue: settingData.isDefaultActionValue,
            toTeacherEmail: settingData.toTeacherEmail == undefined ? '' : settingData.toTeacherEmail,
            dropboxAccessToken: settingData.dropboxAccessToken,
            dropboxEnabledValue: settingData.dropboxAccessToken == '' ? false : true,
        })
    }

    //_getSettingData 
    _getSettingData() {
        var userId = TeacherAssitantManager.getInstance().getUserID();
        var url = API.BASE_URL + API.API_USER_SETTINGS_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID()
        var headerValue = {}
        //console.log("picker data url is", url)
        //console.log("userId", userId)

        //fetch
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: headerValue,
        })
            .then((responseJson) => {
                if (responseJson.success) {
                    var settingData = responseJson.data
                    this.setState({
                        lblSortOrder: this._setOrderValues(settingData.studentSortOrder),
                        lblDisplayOrder: this._setOrderValues(settingData.studentDisplayOrder),
                        showThumbnailValue: settingData.studentThumbnailImages,
                        lblQuickJump: this._setOrderValues(settingData.quickJumpButton, true),
                        showPointValue: settingData.showPointValues,
                        settingId: settingData._id,
                        lblScreenLock: settingData.screenLock.length == 4 ? 'ON' : 'OFF',
                        screenLockValue: settingData.screenLock.length == 4 ? settingData.screenLock : '',
                        isDefaultActionValue: settingData.isDefaultActionValue,
                        toTeacherEmail: settingData.toTeacherEmail == undefined ? '' : settingData.toTeacherEmail,
                        dropboxAccessToken: settingData.dropboxAccessToken,
                        dropboxEnabledValue: settingData.dropboxAccessToken == '' ? false : true,
                        isForceUpdate: true,
                    })
                    //attached socket listner           
                    this._addEventListener();
                }
            })
            .catch((error) => {
                //console.log("error===" + error)
            })
    }

    _setOrderValues(orderType, isFromQuickJump = false) {
        if (!isFromQuickJump) {
            switch (orderType.toLowerCase()) {
                case AppConstant.ENUM_FIRST_LAST:
                    return AppConstant.FIRST_LAST;
                case AppConstant.ENUM_LAST_FIRST:
                    return AppConstant.LAST_FIRST;
            }
        } else {
            switch (orderType.toLowerCase()) {
                case AppConstant.ENUM_HOME:
                    return AppConstant.HOME;
                case AppConstant.ENUM_CLASSES:
                    return AppConstant.CLASSES;
                case AppConstant.ENUM_STUDENT:
                    return AppConstant.STUDENT;
            }
        }

    }


    refresh = (text) => {
        if (text == true) {
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
        }

        this._getSettingData()
        this.forceUpdate()
    }

    gotoImportScreen = (response, accessToken) => {
        //console.log("data is ", response)
        //console.log("accessToken", accessToken)
        this._removeEventListener()
        const { navigation } = this.props;
        navigation.navigate('ImportCSV', {
            dropboxData: response.entries, accessToken: accessToken, userId: this.props.navigation.state.params.userId,
            onGoBack: this.refresh, leftHeader: BreadCrumbConstant.SETTINGS
        });
    }





    handleOpenURL(event) {
        self.setLoading(true); //show activate indicator    
        //console.log('this.props');
        //console.log(this.props);

        //console.log('handleOpenURL coming from drop down');
        //console.log(event);
        //console.log(event.url);

        //Parsing AccenTokern fron Url

        var accessToken = '';
        var url = event.url
        if (url.indexOf('access_token') > -1) {
            //console.log('url.indexOf(access_token) > -1');
            let urlList = url.split('#');
            let paramList = urlList[1].split('&');
            paramList.forEach(element => {
                if (element.indexOf('access_token') > -1) {
                    //console.log('element.indexOf(access_token) > -1');
                    let accessTokenList = element.split('=');
                    accessToken = accessTokenList[1];
                }
            });

            //console.log('accessToken');
            //console.log(accessToken);
            if (self.state.isFromDropBoxEnabled) {
                url = self._getSettingUpdateUrl();
                //console.log('_getSettingUpdateUrl url', url)
                self.hitApiToSaveSettings(url, {
                    dropboxAccessToken: accessToken,
                    dropboxEnabledValue: true
                });
                self.setState({ isFromDropBoxEnabled: false, dropboxAccessToken: accessToken, dropboxEnabledValue: true });
            }
            else {

                self._getDropBoxDataList(accessToken);
            }

        } else {
            self.setLoading(false); //hide activate indicator  

            //console.log('url.indexOf(access_token) !> -1');
        }


    }

    handleOpenURLForDropBoxEnabled(event) {
        self.setLoading(true); //show activate indicator    
        //console.log('this.props');
        //console.log(this.props);



        //console.log('handleOpenURL coming from drop down');
        //console.log(event);
        //console.log(event.url);


        //Parsing AccenTokern fron Url

        var accessToken = '';
        var url = event.url
        if (url.indexOf('access_token') > -1) {
            //console.log('url.indexOf(access_token) > -1');
            let urlList = url.split('#');
            let paramList = urlList[1].split('&');
            paramList.forEach(element => {
                if (element.indexOf('access_token') > -1) {
                    //console.log('element.indexOf(access_token) > -1');
                    let accessTokenList = element.split('=');
                    accessToken = accessTokenList[1];
                }
            });

            //console.log('accessToken');
            //console.log(accessToken);
            if (self.state.isFromDropBoxEnabled) {
                self.setState({ isFromDropBoxEnabled: false, dropboxAccessToken: accessToken, dropboxEnabledValue: true });
                url = self._getSettingUpdateUrl();
                self.hitApiToSaveSettings(url, {
                    dropboxAccessToken: accessToken,
                    dropboxEnabledValue: true
                });
            }

        } else {
            self.setLoading(false); //hide activate indicator  

            //console.log('url.indexOf(access_token) !> -1');
        }


    }


    //show alert when we want to show Message for use on screen

    _handleShowThumbnailSwitch = (value) => {
        //console.log("value", value)
        // this.state.listData[index].data.value = !value;
        this.setState({
            showThumbnailValue: value
        })

        this._changeThumbnailOrActionValues(value, AppConstant.SHOW_THUMBNAIL_IMAGES)
    }

    _handleDropboxEnabledSwitch = (value) => {
        //console.log("value", value)
        // this.state.listData[index].data.value = !value;
        // this.setState({
        //     dropboxEnabledValue: value
        // })

        this._changeThumbnailOrActionValues(value, AppConstant.Dropbox_Enabled)
    }



    _getDropBoxDataList(accessToken) {
        var Dropbox = require('dropbox').Dropbox;
        var dbx = new Dropbox({ fetch: fetch, accessToken: accessToken });
        dbx.filesListFolder({ path: dropboxKey.FOLDER_PATH })
            .then((response) => {
                //console.log(response);
                this.setLoading(false); //hide activate indicator  
                //if (this.state.dropboxAccessToken == '') {
                this.gotoImportScreen(response, accessToken);
                // }
                //console.log(this);
            })
            .catch((error) => {
                self.setLoading(false); //hide activate indicator  
                this._showToastMessage(error.error.error_summary)
                //console.log(error);
            });
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    _changeThumbnailOrActionValues(value, status) {
        var body = {};
        var url = this._getSettingUpdateUrl();
        switch (status) {
            case AppConstant.SHOW_THUMBNAIL_IMAGES:
                body = {
                    'studentThumbnailImages': value
                }
                this.hitApiToSaveSettings(url, body)
                break;

            case AppConstant.SHOW_POINT_VALUES:
                body = {
                    'showPointValues': value ? true : false
                }
                this.hitApiToSaveSettings(url, body)
                break;
            case AppConstant.Dropbox_Enabled:
                if (value) {
                    this.setState({
                        isFromDropBoxEnabled: value
                    }, function () {
                        this._onPressImportCsvFromDropBox()
                    })
                } else {

                    this.setState({
                        isFromDropBoxEnabled: value
                    }, function () {
                        body = {
                            dropboxAccessToken: '',
                            dropboxEnabledValue: value
                        }
                        this.hitApiToSaveSettings(url, body, true)
                    })

                }

                break;
        }

    }

    //dropbox Authentication
    _onPressImportCsvFromDropBox = (isFromDropBox = true) => {



        if (this.state.dropboxAccessToken == '' && !isFromDropBox) {
            Alert.alert("Teacher's Assistant Pro 3", "",
                [
                    { text: "CSV file download link", onPress: () => Linking.openURL(TeacherAssitantManager.getInstance().getCSV_TemPlateEmailData()) },
                    {
                        text: "Import CSV file",
                        onPress: () => {
                            this.readAndroidStroagePermission()

                        },
                    },
                    {
                        text: "Cancel",
                        onPress: () => {
                        },
                    }
                ],
                {
                    cancelable: false
                }
            );

            return
        }
        //  require('isomorphic-fetch'); // or another library of choice.
        if (this.state.dropboxAccessToken == '') {
            var Dropbox = require('dropbox').Dropbox;
            var dbx = new Dropbox({ fetch: fetch, clientId: dropboxKey.APP_KEY });
            var redirectUri = '';

            if (Platform.OS === 'ios') {
                redirectUri = dropboxKey.REDRIECT_URI_IOS_VALUE;
                //console.log('ios : ' + dropboxKey.REDRIECT_URI_IOS_VALUE);
            } else {
                redirectUri = dropboxKey.REDRIECT_URI_Android_VALUE
                ////console.log('Android : ' + dropboxKey.REDRIECT_URI_Android_VALUE);
            }
            var authUrl = dbx.getAuthenticationUrl(redirectUri);

            Linking.openURL(authUrl).catch(err => console.error('An error occurred', err));
        } else {
            this.setLoading(true);
            this._getDropBoxDataList(this.state.dropboxAccessToken);
        }

    }

    readAndroidStroagePermission() {
        // readAndroidStroagePermission(item, fileName, fileExtenison) {
        //let path = '';
        if (Platform.OS === 'ios') {
            this.filepicker()
        } else {
            this.requestReadExternalStoragePermission().then((response) => {
                if (response) {
                    //path = RNFS. DocumentDirectoryPath +  '/' + name
                    // this.saveFileToStroage(RNFS.DocumentDirectoryPath + '/' + fileName, item, fileName, fileExtenison);
                    this.filepicker()
                    //return path;
                } else {
                    // this.setLoading(false)
                    this.readAndroidStroagePermission();
                }

            });
        }

        // //console.log('abc');
        // return path;
    }

    async requestReadExternalStoragePermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    'title': AppConstant.APP_NAME,
                    'message': AppConstant.APP_NAME + ' need your external stroage'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {

                //console.log("You can use the camera")
                return true
            }
            else if (granted === PermissionsAndroid.RESULTS.DENIED) {
                this.requestReadExternalStoragePermission
            }
            else {
                this.requestReadExternalStoragePermission
                //console.log("Camera permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    }

    async filepicker() {
        // Pick a single file
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            let fileExtenison = ".csv"
            if (!res.name.indexOf(fileExtenison)) {
                this._showToastMessage("Please select a CSV file")
                return
            }
            // let fileExtenison = ".csv"
            let fileName = TeacherAssitantManager.getInstance().getUserID() + '_' + new Date().getTime() + fileExtenison;

            this.uploadCsvOrDatFile(res.uri, fileName, fileExtenison);

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }
    }

    uploadCsvOrDatFile(path, fileName, fileExtenison, datFileData = '') {
        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
            //console.log("Get Value >> ", value);

            if (fileExtenison == '.csv') {
                //this.setLoading(true); //show activate indicator  
                let formdata = new FormData();
                formdata.append("createdBy", value)

                if (Platform.OS === 'ios') {
                    let _path = path.replace("file://", "")
                    formdata.append("file_name", { uri: _path, name: fileName, type: 'multipart/form-data' })
                } else {
                    formdata.append("file_name", { uri: path, name: fileName, type: 'multipart/form-data' })
                }
                let headers = {
                    'Content-Type': 'multipart/form-data',
                    'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    'userId': TeacherAssitantManager.getInstance().getUserID(),
                }
                // console.log("headers>>",JSON.stringify(headers))
                // console.log("formdata>>",JSON.stringify(formdata))
                this.setLoading(true);
                fetch(API.BASE_URL + API.API_UPLOAD_PREVIEW_CSV, {
                    method: 'post',
                    headers,
                    body: formdata,
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log('response sent successfully');

                        if (responseJson.success) {
                            //console.log('if responseJson.success');
                            //console.log('student list===' + responseJson.data);

                            // return
                            var studentList = [];
                            studentList = responseJson.data


                            //console.log('student list after===' + studentList);
                            this.setLoading(false);
                            const { navigation } = self.props;
                            navigation.navigate('PerviewCSV', {
                                name: responseJson.filename, path: path,
                                studentList: studentList, userId: this.props.navigation.state.params.userId,
                                leftHeader: BreadCrumbConstant.CANCEL,
                                onGoBack: () => { },
                                comingFrom: ComingFrom.SETTINGS_IMPORT_SCREEN
                            })
                        } else {
                            this.setLoading(false);
                            //console.log('responseJson.not success ');
                            this._showToastMessage(responseJson.message)
                            //  this.showAlert(responseJson.message)
                        }
                        //console.log(responseJson);
                        //console.log(responseJson.message);
                        //console.log(responseJson.success);

                        //return responseJson;
                    })
                    .catch((error) => {
                        // this.setLoading(false); //hide activate indicator 

                        this.setLoading(false);
                        this._showToastMessage(error.message)
                        //  this.showAlert(error.message);
                        //console.log('response sent not successfully' + JSON.stringify(error));
                        //return  error;
                    })
            } else {

                // TeacherAssitantManager.getInstance()._serviceMethod(API.BASE_URL + API.API_UPLOAD_PREVIEW_DAT + TeacherAssitantManager.getInstance().getUserID(), {
                //     method: 'post',
                //     headers: {
                //         // 'Content-Type': 'multipart/form-data',
                //         // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                //         // 'userId': TeacherAssitantManager.getInstance().getUserID(),
                //     },
                //     body: JSON.stringify({
                //         file: datFileData
                //     }),
                // })
                //     .then((responseJson) => {

                //         //console.log('response sent successfully');
                //         this.setLoading(false);
                //         if (responseJson.success) {
                //             this.props.navigation.pop(2)
                //             this.props.navigation.state.params.onGoBack(true);

                //         } else {
                //             //console.log('responseJson.not success ');
                //             this._showToastMessage(responseJson.message)
                //             //  this.showAlert(responseJson.message)
                //         }
                //         //return responseJson;
                //     })
                //     .catch((error) => {
                //         // this.setLoading(false); //hide activate indicator 

                //         //this.setLoading(false);
                //         this._showToastMessage(error.message)
                //         //  this.showAlert(error.message);
                //         //console.log('response sent not successfully' + JSON.stringify(error));
                //         //return  error;
                //     })

            }


        }).done();
    }

    _onPressExport = () => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("SettingExportData", { screenTitle: "Export Data", accessToken: this.state.dropboxAccessToken, onGoBack: this.refresh, leftHeader: BreadCrumbConstant.SETTINGS })

    }


    _onPressSubscription = async () => {
        this.setState({
            isShowingSubscription: true
        })
    }


    _onPressDateRanges = () => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("SettingDateRange", { screenTitle: "Date Range", onGoBack: this.refresh, settingId: this.state.settingId, leftHeader: BreadCrumbConstant.SETTINGS })

    }

    _onPressCustomizeActionFields = (screen, comingFrom, isRightHeaderShow) => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("CustomizeActionFieldsScreen", {
            screen: screen, onGoBack: this.refresh,
            createdBy: TeacherAssitantManager.getInstance().getUserID(), comingFrom: comingFrom,
            userId: this.props.navigation.state.params.userId,
            leftHeader: BreadCrumbConstant.SETTINGS,
            isRightHeaderShow: isRightHeaderShow

        })
    }

    _onPressCustomizeTerminology = () => {
        this._onPressCustomizeActionFields("Terms", ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY, false)
        // this._removeEventListener()
        // const { state, navigate } = this.props.navigation;
        // navigate("SettingsCustomiseTerminology", {
        //     screen: "Terms", onGoBack: this.refresh,
        //     createdBy: TeacherAssitantManager.getInstance().getUserID(), comingFrom: ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY,
        //     userId: this.props.navigation.state.params.userId, leftHeader: BreadCrumbConstant.SETTINGS
        // })
    }

    _onPressCustomizeColorLabels = () => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("ColorLabelsScreen", {
            screen: "Color Labels", onGoBack: this.refresh,
            userId: this.props.navigation.state.params.userId,
            leftHeader: BreadCrumbConstant.SETTINGS
        })
    }

    _handleShowPointValueSwitch = (value) => {
        //console.log("value", value)
        // this.state.listData[index].data.value = !value;
        this.setState({
            showPointValue: value
        })
        this._changeThumbnailOrActionValues(value, AppConstant.SHOW_POINT_VALUES)
    }

    //_onPressCustomizeDetailFields click 
    _onPressCustomizeDetailFields = () => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("SettingCustomizeDetailFields", {
            onGoBack: this.refresh,
            userId: this.state.userId,
            isheaderRightShow: true,
            headerRight: "Save", screenTitle: 'Student Details',
            comingFrom: ComingFrom.SETTINGS_CUSTOMIZE_DETAIL_FIELDS, leftHeader: BreadCrumbConstant.SETTINGS
        })
    }

    //_onPressCustomizeDetailFields click 
    _onPressDefaultActionValues = () => {
        this._removeEventListener()
        // const { state, navigate } = this.props.navigation;
        // navigate("StudentActionFields", {
        //     screen: "Default Values", onGoBack: this.refresh, headerRight: this.state.isDefaultActionValue ? 'Clear' : 'Save',
        //     comingFrom: ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE,
        //     leftHeader: BreadCrumbConstant.SETTINGS, isUpdate: this.state.isDefaultActionValue ? true : false,
        //     createdBy: TeacherAssitantManager.getInstance().getUserID()
        // })
        const { state, navigate } = this.props.navigation;
        navigate("StudentActionFields", {
            screen: "Default Values", onGoBack: this.refresh, headerRight: this.state.isDefaultActionValue ? 'Clear' : 'Save',
            comingFrom: ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE,
            leftHeader: BreadCrumbConstant.SETTINGS, isUpdate: this.state.isDefaultActionValue ? true : false,
            createdBy: TeacherAssitantManager.getInstance().getUserID()
        })
    }

    _onPressDelete = (status) => {
        var message = ''

        switch (status) {
            case AppConstant.DELETE_ALL_STUDENTS:
                message = TextMessage.ARE_YOU_SURE_WANT_TO_DELETE_ALL + TextMessage.DELETE_ALL_STUDENT
                break;
            case AppConstant.DELETE_ALL_ACTIONS:
                message = TextMessage.ARE_YOU_SURE_WANT_TO_DELETE_ALL + TextMessage.DELETE_ALL_ACTIONS
                break;
            case AppConstant.DELETE_ALL_DATA:
                message = TextMessage.ARE_YOU_SURE_WANT_TO_DELETE_ALL + TextMessage.DELETE_ALL_DATA;
                break;
            case AppConstant.RESET_TO_DEFAULT:
                message = TextMessage.ARE_YOU_SURE_WANT_TO_DELETE_ALL + TextMessage.RESET_TO_DEFAULT;
                break
            default:
                break;
        }
        this.setState({
            actionSheetOptions: this.deleteAndCancelOptions,
            actionSheetMessage: message
        }, function () {
            this.ActionSheetObject.show()
        })

    }
    //move to one screen at a time
    _moveToSettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock = (status) => {
        this._removeEventListener()
        var orderList = [...this.state.studentOrderList]
        var title = ""
        var comingFor = ''
        switch (status) {
            case AppConstant.SORT_DATA:
                this._setVisibiltyForDisplaySortAndQuickJump(orderList, this.state.lblSortOrder);
                title = "Sort Order"
                comingFor = AppConstant.SORT_DATA
                break;

            case AppConstant.DISPLAY_ORDER:
                this._setVisibiltyForDisplaySortAndQuickJump(orderList, this.state.lblDisplayOrder);

                title = "Display Order"
                comingFor = AppConstant.DISPLAY_ORDER
                break;

            case AppConstant.QUICK_JUMP_BUTTON:
                orderList = [...this.state.studentQuickJumpList]

                this._setVisibiltyForDisplaySortAndQuickJump(orderList, this.state.lblQuickJump);

                title = "Quick Jump Button"
                comingFor = AppConstant.QUICK_JUMP_BUTTON
                break;

            case AppConstant.SCREEN_LOCK:
                title = "Screen Lock"
                comingFor = AppConstant.SCREEN_LOCK
                break;


        }
        const { state, navigate } = this.props.navigation;
        navigate("SettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock", {
            screenTitle: title, onGoBack: this.refresh,
            studentOrderList: orderList,
            settingId: this.state.settingId, comingFor: comingFor, screenLockValue: this.state.screenLockValue,
            leftHeader: BreadCrumbConstant.SETTINGS
        })



    }

    _getSettingUpdateUrl() {
        return API.BASE_URL + API.API_USER_SETTINGS_UPDATE + this.state.settingId;
    }

    _setVisibiltyForDisplaySortAndQuickJump(orderList, lblName) {
        for (var i = 0; i < orderList.length; i++) {
            var order = orderList[i];
            if (order.data.name == lblName) {
                order.selectionVisibilty = true;
            }
            else {
                order.selectionVisibilty = false;
            }
        }
        //return { i, order };
    }

    _onPressToEmail = () => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("SettingToTeacherEmail", {
            onGoBack: this.refresh, screenTitle: "To Adress", headerRight: 'Save', leftHeader: BreadCrumbConstant.CANCEL,
            toTeacherEmail: this.state.toTeacherEmail, settingId: this.state.settingId,
        })
    }

    _onPressParentRecipients = () => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("EmailBlastRecipient", {
            onGoBack: this.refresh, screen: "Specify Recipients",
            selectedActionList: [], comingFrom: ComingFrom.SETTINGS_EMAIL_BLAST_SPECIFY_RECIPIENT,
            leftHeader: BreadCrumbConstant.SETTINGS
        })
    }



    //it will help to set edit is on/off
    _handleActionSheetIndex = (index) => {
        if (index == 0) {
            switch (this.state.actionSheetMessage) {
                case TextMessage.ARE_YOU_SURE_WANT_TO_DELETE_ALL + TextMessage.DELETE_ALL_STUDENT:
                    this._onDelete(AppConstant.DELETE_ALL_STUDENTS)
                    break;
                case TextMessage.ARE_YOU_SURE_WANT_TO_DELETE_ALL + TextMessage.DELETE_ALL_ACTIONS:
                    this._onDelete(AppConstant.DELETE_ALL_ACTIONS)
                    break;
                case TextMessage.ARE_YOU_SURE_WANT_TO_DELETE_ALL + TextMessage.DELETE_ALL_DATA:
                    this._onDelete(AppConstant.DELETE_ALL_DATA)
                    break;
                case TextMessage.ARE_YOU_SURE_WANT_TO_DELETE_ALL + TextMessage.RESET_TO_DEFAULT:
                    this._onDelete(AppConstant.RESET_TO_DEFAULT)
                    break;
                default:
                    break;
            }
        }
    }

    _onDelete = (status) => {
        var url = API.BASE_URL
        var userId = TeacherAssitantManager.getInstance().getUserID();
        switch (status) {
            case AppConstant.DELETE_ALL_STUDENTS:
                url = url + API.API_USERS_SETTINGS_DELETE_ALL_STUDENTS_BY_USER_ID + userId
                break;
            case AppConstant.DELETE_ALL_ACTIONS:
                url = url + API.API_USERS_SETTINGS_DELETE_ALL_STUDENT_ACTIONS_BY_USER_ID + userId
                break;
            case AppConstant.DELETE_ALL_DATA:
                url = url + API.API_USERS_SETTINGS_DELETE_ALL_DATA_BY_USER_ID + userId
                break;
            case AppConstant.RESET_TO_DEFAULT:
                url = url + API.API_USERS_SETTINGS_RESET_ALL_DATA_BY_USER_ID + userId
                break
            default:
                break;
        }

        this.hitApiToSaveSettings(url)
        //console.log("Delete All url", url)
    }

    hitApiToSaveSettings(url, body = null,) {
        this.setLoading(true)
        var headerValue = {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        }
        if (body == null) {
            requestInfo = {
                method: 'POST',
                headers: {},
            }
            TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
                this.setLoading(false)
                this._showToastMessage(responseJson.message)
                // if (responseJson.success) {
                //     //console.log('response hitApiToSaveSettings', JSON.stringify(responseJson));

                //     // this._getSettingData();
                //     //     this._showToastMessage(responseJson.message)
                // } else {
                //     this.setLoading(false)
                //     //     this._showToastMessage(responseJson.message)
                //     //     // this.showAlert(responseJson.message);
                // }
            }).catch((error) => {
                this.setLoading(false)
                console.error(error);
            });
        }
        else {
            requestInfo = {
                method: 'PUT',
                headers: {},
                body: JSON.stringify(body)
            }
            TeacherAssitantManager.getInstance()._updateUserSetting(body, this.state.settingId).then((responseJson) => {
                //console.log("response", responseJson);
                if (responseJson.success) {
                    this.setLoading(false)
                    // if(isFromDropBoxEnabled){
                    //     this.setState({
                    //         isFromDropBoxEnabled: false,
                    //         dropboxAccessToken: ''
                    //     })
                    // }
                } else {
                    this.setLoading(false)
                    this._showToastMessage(responseJson.message)
                }
            }).catch((error) => {
                this.setLoading(false)
                console.error(error);
            });
        }


    }

    _onPressShareData = () => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("SettingShareData", { screenTitle: "Setting Data", onGoBack: this.refresh, leftHeader: BreadCrumbConstant.SETTINGS })

    }



    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: 'Settings',
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,
            headerLeft: () => <TouchableOpacity onPress={() => params.moveToHome()}>
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
            headerRight: () => <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
            </View>



        }
    }


    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }




    render() {

        const { lblSortOrder, lblDisplayOrder, lblQuickJump, showThumbnailValue, showPointValue, actionSheetTitle, dropboxEnabledValue,
            actionSheetOptions, lblScreenLock,
            actionSheetMessage, isShowingSubscription, subscription } = this.state
        let lblCustomizeActionField = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 0)
        return (
            <SafeAreaView style={styles.container}>
                <View>
                    {isShowingSubscription && <Subscription

                        onPressBackBtn={async () => {
                            let subscription = await TeacherAssitantManager.getInstance().getUserSubscriptionsDataToLocalDb()
                            if (subscription) {
                                this.setState({
                                    subscription,
                                    isShowingSubscription: false
                                })
                                return
                            }
                            this.setState({
                                isShowingSubscription: false
                            })

                        }}
                    />}
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <ActionSheet
                        ref={o => this.ActionSheetObject = o}
                        title={actionSheetTitle}
                        options={actionSheetOptions} //- a title to show above the action sheet
                        message={
                            actionSheetMessage} // - a message to show below the title
                        tintColor={['red', 'blue']} //- the color used for non-destructive button titles
                        //cancelButtonIndex={1}
                        destructiveButtonIndex={0}
                        onPress={(index) => { this._handleActionSheetIndex(index) }}
                    />
                    <Loader loading={this.state.loading} />
                    <ScrollView>

                        <View style={styles.container} >
                            {/* {subscription && subscription.is_active && <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressShareData}
                                    style={styles.buttonWithTopMargin}>
                                    <Text style={styles.buttonText}>Share Data</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>} */}
                            <View style={styles.sectionViewContainer}>
                                <Text style={styles.sectionTitle}>{TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, 2)}</Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() =>
                                    this._moveToSettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock(AppConstant.SORT_DATA)}
                                    style={styles.buttonWithoutTopMargin}>
                                    <View style={styles.touchableOpacityItemViewContainer}>
                                        <Text style={[styles.buttonText, styles.textAlignLeft]}>Sort Order</Text>
                                        <Text style={[styles.buttonText, styles.textPositionAbsoluteWithEnd]}>
                                            {lblSortOrder}</Text>
                                        <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                                    </View>

                                </TouchableOpacity>
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() =>
                                    this._moveToSettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock
                                        (AppConstant.DISPLAY_ORDER)}

                                    style={styles.buttonWithoutTopMargin}>
                                    <View style={styles.touchableOpacityItemViewContainer}>
                                        <Text style={[styles.buttonText, styles.textAlignLeft]}>Display Order</Text>
                                        <Text style={[styles.buttonText, styles.textPositionAbsoluteWithEnd]}>
                                            {lblDisplayOrder}</Text>
                                        <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.buttonWithoutTopMargin}
                                    disabled={true}>
                                    <View style={styles.touchableOpacityItemViewContainer}>
                                        <Text style={[styles.buttonText, styles.textAlignLeft]}>Show Thumbnail Images</Text>
                                        <Switch style={[styles.switchView, styles.positionAbsoluteWithEnd]}
                                            onValueChange={this._handleShowThumbnailSwitch}
                                            value={showThumbnailValue}
                                        />
                                    </View>

                                </TouchableOpacity>
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressCustomizeDetailFields}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>Customize Detail Fields</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressDateRanges}
                                    style={styles.buttonWithTopMargin}>
                                    <Text style={styles.buttonText}>{TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_DATE_RANGE, 2)}</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() =>
                                    this._moveToSettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock(AppConstant.QUICK_JUMP_BUTTON)}
                                    style={styles.buttonWithTopMargin}>
                                    <View style={styles.touchableOpacityItemViewContainer}>
                                        <Text style={[styles.buttonText, styles.textAlignLeft]}>Quick Jump Button</Text>
                                        <Text style={[styles.buttonText, styles.textPositionAbsoluteWithEnd]}>
                                            {lblQuickJump}</Text>
                                        <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                                    </View>

                                </TouchableOpacity>
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressCustomizeTerminology}
                                    style={styles.buttonWithTopMargin}>
                                    <Text style={styles.buttonText}>Customize Terminology</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>


                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={
                                    () => this._onPressCustomizeActionFields(lblCustomizeActionField, ComingFrom.SETTINGS_CUSTOMIZE_ACTION_FIELDS, true)}
                                    // () => this._onPressCustomizeActionFields('Action Fields', ComingFrom.SETTINGS_CUSTOMIZE_ACTION_FIELDS, true)}
                                    style={styles.buttonWithTopMargin}>
                                    <Text style={styles.buttonText}>Customize {lblCustomizeActionField} Fields</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Color Lbale SECTION */}
                            <View style={styles.sectionViewContainer}>
                                <Text style={styles.sectionTitle}>{TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_COLOR_LABEL, 2)}</Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressCustomizeColorLabels}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>Customize {TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_COLOR_LABEL, 2)}</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.buttonWithoutTopMargin}
                                disabled={true}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>Show Point Value</Text>
                                    <Switch style={[styles.switchView, styles.positionAbsoluteWithEnd]}
                                        value={showPointValue}
                                        onValueChange={this._handleShowPointValueSwitch}

                                    />
                                </View>
                            </TouchableOpacity>


                            {/* Default Action Value SECTION */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressDefaultActionValues}
                                    style={styles.buttonWithTopMargin}>
                                    <Text style={styles.buttonText}>Default {TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 1)} Values</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* email blast SECTION */}
                            <View style={styles.sectionViewContainer}>
                                <Text style={styles.sectionTitle}>Email Blast</Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressToEmail}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>To: Teacher Email</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressParentRecipients}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>{TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_PARENT, 0)} Recipients</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {/* Import SECTION */}

                            {subscription && subscription.is_active && <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.buttonWithTopMargin}
                                    disabled={true}>
                                    <View style={styles.touchableOpacityItemViewContainer}>
                                        <Text style={[styles.buttonText, styles.textAlignLeft]}>Dropbox Enabled</Text>
                                        <Switch style={[styles.switchView, styles.positionAbsoluteWithEnd]}
                                            onValueChange={this._handleDropboxEnabledSwitch}
                                            value={dropboxEnabledValue}
                                        />
                                    </View>

                                </TouchableOpacity>
                            </View>}

                            {subscription && subscription.is_active && <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() => { this._onPressImportCsvFromDropBox(false) }}
                                    style={styles.buttonWithTopMargin}>
                                    <Text style={styles.buttonText}>Import</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>}

                            {/* export Section*/}
                            {subscription && subscription.is_active && <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressExport}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>Export </Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>}
                            {/* Default Action Value SECTION */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={this._onPressSubscription}
                                    style={styles.buttonWithTopMargin}>
                                    <Text style={styles.buttonText}>Subscription </Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* end of export Section*/}
                            {/* <View style={styles.buttonContainer}> */}
                            <TouchableOpacity onPress={() =>
                                this._moveToSettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock(AppConstant.SCREEN_LOCK)}
                                style={[styles.buttonContainer, styles.buttonWithTopMargin]}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>Screen Lock</Text>
                                    <Text style={[styles.buttonText, styles.textPositionAbsoluteWithEnd]}>
                                        {lblScreenLock}</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {/* </View> */}
                            {/* DELETE SECTION*/}
                            <View style={styles.sectionViewContainer}>
                                <Text style={styles.sectionTitle}>DELETE</Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() => this._onPressDelete(AppConstant.DELETE_ALL_STUDENTS)}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>Delete All {TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, 2)} </Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() => this._onPressDelete(AppConstant.DELETE_ALL_ACTIONS)}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>Delete All {TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 2)}</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() => this._onPressDelete(AppConstant.DELETE_ALL_DATA)}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>Delete All Data</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() => this._onPressDelete(AppConstant.RESET_TO_DEFAULT)}
                                    style={styles.buttonWithoutTopMargin}>
                                    <Text style={styles.buttonText}>Reset to Default</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
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

    switchView: {
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