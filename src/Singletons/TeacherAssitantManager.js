import React, { Component } from 'react';
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    Slider, Keyboard,
    Alert,
    ToastAndroid, Linking
} from 'react-native'
import
AsyncStorage
    from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';

import StorageConstant from '../constants/StorageConstant'
import AppConstant from "../constants/AppConstant";
import API from '../constants/ApiConstant'
import FastImage from 'react-native-fast-image'
export default class TeacherAssitantManager {

    static myInstance = null;
    static userId = null;
    static customizeTerminology = []


    /**
     * @returns {CommonDataManager}
     */
    static getInstance() {
        if (TeacherAssitantManager.myInstance == null) {
            TeacherAssitantManager.myInstance = new TeacherAssitantManager();
        }

        return this.myInstance;
    }

    getDeviceID() {
        //var DeviceInfo = require('react-native-device-info');
        // this.showAlert(DeviceInfo.getUniqueID()+"_")
        //console.log(`DeviceInfo is : ${DeviceInfo.getUniqueID()}`);
        return DeviceInfo.getUniqueId() + "_";
        //return '';
    }
    getBuildVersion() {
        return DeviceInfo.getVersion();
    }

    getUserID() {
        if (TeacherAssitantManager.userId == null) {
            return AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
                TeacherAssitantManager.userId = value
                return value

            });

            // DeviceInfoManager.userId = new DeviceInfoManager();
        } else {
            return TeacherAssitantManager.userId;
        }
    }

    getClientID() {
        return this.getDeviceID() + '_' + this.getUserID()
    }

    getDataFromAsyncStorage(key) {
        return AsyncStorage.getItem(key).then((value) => {
            return value
        });
    }


    saveDataToAsyncStorage(key, value, isSaveAsString = false) {
        if (isSaveAsString) {
            value = JSON.stringify(value)
        }

        return AsyncStorage.setItem(key, value).then((error) => {
            if (isSaveAsString) {
                TeacherAssitantManager.customizeTerminology = JSON.parse(value)
            }
            return error

        })
    }

    // saveDataToAsyncStorage(key, value, isSaveAsString = false) {
    //     if (isSaveAsString) {
    //         value = JSON.stringify(value)
    //     }

    //     return AsyncStorage.setItem(key, value).then((error) => {
    //         return error
    //     })
    // }

    // _saveCustmizeTerminologyToLocalDb
    _saveCustomizeTerminologyToLocalDb(listData) {
        this.saveDataToAsyncStorage(StorageConstant.STORE_CUSTOMIZE_TERMENOLOGY, listData, true);
    }


    // _saveUserSubscriptionsDataToLocalDb
    async _saveUserSubscriptionsDataToLocalDb(data) {
        // value = JSON.stringify(data)
        await AsyncStorage.setItem(StorageConstant.STORE_SUBSCRIPTION, JSON.stringify(data))
        // .then((error) => {
        //     return error
        // })
        // this.saveDataToAsyncStorage(StorageConstant.STORE_SUBSCRIPTION, data,true);
    }


    // getUserSubscriptionsDataToLocalDb
    async getUserSubscriptionsDataToLocalDb() {
        // value = JSON.stringify(data)
        let reposne = await AsyncStorage.getItem(StorageConstant.STORE_SUBSCRIPTION)
        return JSON.parse(reposne)
        // return AsyncStorage.getItem(StorageConstant.STORE_SUBSCRIPTION, JSON.stringify(data)).then((error) => {
        //     return error
        // })
        // this.saveDataToAsyncStorage(StorageConstant.STORE_SUBSCRIPTION, data,true);
    }




    showAlertWithDelay = (message) => {
        // this.setLoading(false);
        if (message != undefined) {
            setTimeout(function () {
                if (Platform.OS === 'android') {
                    ToastAndroid.show(message, ToastAndroid.SHORT);
                }
                else {
                    Alert.alert(
                        AppConstant.APP_NAME,
                        message,
                        message
                        [
                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
                        ],
                        { cancelable: false }
                    )
                }
            }, 500);
        }

    }


    showAlert = (message) => {
        // this.setLoading(false);
        if (message != undefined) {
            if (Platform.OS === 'android') {
                ToastAndroid.show(message, ToastAndroid.SHORT);
            }
            else {
                Alert.alert(
                    AppConstant.APP_NAME,
                    message,
                    message
                    [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
                    ],
                    { cancelable: false }
                )
            }
        }

    }
    //post and Put request
    async _serviceMethod(url, requestInfo, imageInfo = {}) {
        const { isUplaodingMedia = false, entity } = imageInfo
        let { path } = imageInfo
        if (isUplaodingMedia) {
            path = Platform.OS === "ios" ? path : path.indexOf("file://") > -1 ? path : `file://${path}`
            let file = {
                uri: path,
                name: 'image'
            };
            if (Platform.OS == 'android') {
                file.type = 'image/jpeg';
            }

            url = API.BASE_URL + API.API_MEDIA_UPLOAD

            const formData = new FormData();
            formData.append('entity', entity);
            formData.append('file', file);
            requestInfo = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    clientid: this.getClientID(),
                    userId: this.getUserID()

                },
                body: formData
            }
        } else if (requestInfo.headers != undefined && requestInfo.headers.Accept == undefined) {
            requestInfo.headers = this._getHeadervalue()
        }
        try {
            const response = await fetch(url, requestInfo);
            const responseJson = await response.json();
            return responseJson;
        }
        catch (error) {
            return error;
        }
    }

    uploadActionImage = async (body, isUpdate) => {
        let item = { imagePath: "", index: -1 }
        let studentActionsDetails = body.studentActionsDetails ? [...body.studentActionsDetails] : isUpdate ? [...body] : []
        studentActionsDetails.forEach((ele, index) => {
            if (ele && ele.value && ele.value.uri) {
                item.imagePath = ele.value.uri
                item.index = index
            }

        });
        if (item.index > -1) {
            let imageInfo = {
                isUplaodingMedia: true,
                path: item.imagePath,
                entity: "STUDENT_ACTION_IMAGE"
            }
            let response = await this._serviceMethod("", {}, imageInfo);

            if (item.index > -1) {
                if (!response.Key) {
                    return { response, item }
                }
                studentActionsDetails[item.index].value = response.Key
            }

            return { response, item, body }
        }
        return { item, body }
    }

    /**
     * 
     * @param {*} body 
     * @param {*} settingId 
     */
    //it will help to update setting of current logged in user
    _updateUserSetting(body, settingId) {
        var url = API.BASE_URL + API.API_USER_SETTINGS_UPDATE + settingId;
        requestInfo = {
            method: 'PUT',
            headers: {},
            body: JSON.stringify(body)
        };

        return this._serviceMethod(url, requestInfo).then((responseJson) => {
            return responseJson
        }).catch((error) => {
            return error
        });
    }

    //covert color code into hexacode
    _convertSingleCode = (colorCode) => {
        let hexCode = colorCode.toString(16);

        return (hexCode.length == 1) ? ('0' + hexCode) : hexCode;
    }

    //convert Rdb color code into hexacode
    _rgbToHex = (red, green, blue) => {
        if (isNaN(red) || isNaN(green) || isNaN(blue)) {
            alert('Incorrect RGB Color Code!!!');
            return;
        }
        else {
            return '#' + this._convertSingleCode(red) + this._convertSingleCode(green) + this._convertSingleCode(blue);
        }
    }

    _changeDateFormat = (date, isFromDateRange = false) => {
        if (!isFromDateRange) {
            return parseInt(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + this._convertTimeTo12HourFormat(this._getHoursFromDate(date), this._getMinutesFromDate(date), 0)

        } else {
            return parseInt(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()
        }
    }

    _getDateFromDateObject = (date) => {
        return parseInt(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " "
    }

    _convertTimeTo12HourFormat = (hour, minutes, seconds) => {
        var timeType = ''
        if (hour >= 12) {
            hour = hour > 12 ? hour - 12 : hour;
            timeType = 'PM';
        }
        else {
            // If the Hour is Not less than equals to 11 then Set the Time format as PM.
            timeType = 'AM';
        }
        if (hour == 0) {
            hour = 12;
        }

        // if (minutes < 10) {
        //     minutes = '0' + minutes.toString();
        // }

        // // If seconds value is less than 10 then add 0 before seconds.
        // if (seconds < 10) {
        //     seconds = '0' + seconds.toString();
        // }
        if (seconds == 0) {
            return hour + ":" + minutes + " " + timeType;
        }

        return hour + ":" + minutes + ":" + seconds + " " + timeType;

    }

    _convertHoursToProperFormat = (hour) => {
        // If hour value is 0 then by default set its value to 12, because 24 means 0 in 24 hours time format. 
        if (hour == 0) {
            hour = 12;
        }
        return hour;
    }

    _getHoursFromDate = (today) => {
        return (today.getHours());
    }

    _getMinutesFromDate = (today) => {
        return this._convertMinutesToProperFormat(today.getMinutes());
    }

    _getSecondsFromDate = (today) => {
        return this._convertMinutesToProperFormat(today.getSeconds());
    }

    _convertMinutesToProperFormat = (minutes) => {
        if (minutes < 10) {
            minutes = '0' + minutes.toString();
        }
        return minutes;

    }

    _convertSecondsToProperFormat = (seconds) => {
        if (seconds < 10) {
            seconds = '0' + seconds.toString();
        }
        return seconds;

    }

    getFlatListThrashHoldIndex(listData) {
        return (listData.length - (AppConstant.API_PAGINATION_LIMIT / 2))
    }

    //get header for api
    _getHeadervalue() {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            clientid: this.getClientID(),
            userId: this.getUserID()
        }
    }

    //_addDisplayName
    _addDisplayNameToStudentData(student, studentDisplayOrder) {
        if (studentDisplayOrder == undefined) {
            studentDisplayOrder = AppConstant.ENUM_FIRST_LAST
        }
        switch (studentDisplayOrder.toLowerCase()) {
            case AppConstant.ENUM_FIRST_LAST:
                student['displayName'] = student.firstName + " " + student.lastName;
                break;
            case AppConstant.ENUM_LAST_FIRST:
                student['displayName'] = student.lastName + ", " + student.firstName;
                break;
        }
        return student;
    }


    //_addDisplayName
    _addDisplayNameToStudentData(student, studentDisplayOrder, studentSortOrder) {
        if (studentDisplayOrder == undefined) {
            studentDisplayOrder = AppConstant.ENUM_FIRST_LAST
        }

        let firstLastName = student.firstName + " " + student.lastName
        // let lastFirstName = student.lastName + ", " + student.firstName
        let lastFirstName = student.lastName + " " + student.firstName
        //display name
        switch (studentDisplayOrder.toLowerCase()) {
            case AppConstant.ENUM_FIRST_LAST:
                student['displayName'] = firstLastName;
                break;
            case AppConstant.ENUM_LAST_FIRST:
                student['displayName'] = lastFirstName;
                break;
        }

        //SortName
        switch (studentSortOrder.toLowerCase()) {
            case AppConstant.ENUM_FIRST_LAST:
                student['sortName'] = firstLastName;
                break;
            case AppConstant.ENUM_LAST_FIRST:
                student['sortName'] = lastFirstName;
                break;
        }
        return student;
    }

    _validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    _validPointNumber = (pointNumber) => {
        let regx = /^[-]?[0-9]{1,10}$/;
        return regx.test(pointNumber);
    }

    _setnavigationleftButtonText(text) {
        if (text.length > 5) {
            return text.substring(0, 3) + '..'
        }
        return text
    }


    // CT||ct = customizeTerminology
    _getCustomizeTerminiologyLabelValue(ctKey, count) {
        let customizeTerminologyList = TeacherAssitantManager.customizeTerminology
        let index = customizeTerminologyList.findIndex((customizeTerminology) => customizeTerminology.default == ctKey);
        if (index > -1) {
            return count <= 1 ? customizeTerminologyList[index].singular : customizeTerminologyList[index].plural;
        }
    }

    //open calll app in phone
    _makePhoneCall(url) {
        url = 'tel:' + url
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + url);
            }
            else {
                return Linking.openURL(url);
            }
        }).catch(err => console.error('An error occurred', err));
    }


    /**
   * get subscription Data info
   */

    async getUserSubscriptionData() {
        // console.log("UserId" + this.state.userId)
        // this.setFlagForSearching()

        let userId = this.getUserID()
        let url = `${API.BASE_URL}users/payment/details`
        let API_METHOD = 'GET';

        requestInfo = {
            method: API_METHOD,
            headers: {},
        }

        let responseJson = await this._serviceMethod(url, requestInfo)
        if (responseJson.success) {
            await this._saveUserSubscriptionsDataToLocalDb(responseJson.data)
        }
    }


    keyboardAddListener(thisPointer) {
        Keyboard.addListener('keyboardDidShow', (event) => { this.onKeyboardDidShow(event, thisPointer) });
        Keyboard.addListener('keyboardDidHide', () => { this.keyboardDidHide(thisPointer) });
    }

    keyboardRemoveListener(thisPointer) {
        Keyboard.removeListener('keyboardDidShow', (event) => { this.onKeyboardDidShow(event, thisPointer) });
        Keyboard.removeListener('keyboardDidHide', () => { this.keyboardDidHide(thisPointer) });
        // Keyboard.removeListener('keyboardDidShow', thisPointer.onKeyboardDidShow);
        // Keyboard.removeListener('keyboardDidHide', thisPointer.keyboardDidHide);
    }

    onKeyboardDidShow = (e, thisPointer) => {
        thisPointer.setState({ keyBoardHeight: e.endCoordinates.height })
    }
    keyboardDidHide = (thisPointer) => {
        thisPointer.setState({ keyBoardHeight: 0 })
    }
    // keyboardAddListener(thisPointer) {
    //     Keyboard.addListener('keyboardDidShow', thisPointer.onKeyboardDidShow);
    //     Keyboard.addListener('keyboardDidHide', thisPointer.keyboardDidHide);
    // }

    // keyboardRemoveListener(thisPointer) {
    //     Keyboard.removeListener('keyboardDidShow', thisPointer.onKeyboardDidShow);
    //     Keyboard.removeListener('keyboardDidHide', thisPointer.keyboardDidHide);
    // }





    getFastImageComponent(image, style = { width: 40, height: 40 }) {
        let source = image
        if (isNaN(source)) {
            source = {
                uri: image.uri ? image.uri : image ? `${API.S3_URL}${image}` : "",
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable
            }
        }
        if (source == "") {
            return null
        }
        return (
            <FastImage
                style={style}
                source={source}
            />
        )
    }

    //getMailToUrl
    getMailToUrl(emailId = "", body = "", bcc = "", isSubject = true) {
        if (isSubject)
            return (`mailto:${emailId}?&bcc=${bcc}&subject=Teacher's Assistant Pro Version ${this.getBuildVersion()}&body=${body}`)

        return `mailto:${emailId}?&bcc=${bcc}&subject=&body=${body}`
    }

    //getCSV_TemPlateEmailData
    getCSV_TemPlateEmailData(emailId = "", body = "", bcc = "") {
        return `mailto:${emailId}?&bcc=${bcc}&subject=&body=Csv Template link : ${API.CSV_DOWNLOAD_LINK}`
    }


    //setCsvDownloadLinkandOpenTheDeafultEmail
    setCsvDownloadLinkandOpenTheDeafultEmail(responseJson,emailId="") {

        let dataLinkList = responseJson.data.link //.split("token=") //escape(responseJson.data.link)
        dataLinkList = Platform.OS == 'android' ? escape(responseJson.data.link) : dataLinkList
        
        let emailString = `This link is available for 7 days ${dataLinkList}`//token=${token}`;
        if (dataLinkList && dataLinkList != '') {
            var emailUrl = this.getMailToUrl(emailId, emailString);
            Linking.openURL(emailUrl)
                .catch(err => console.error('An error occurred', err));
        } else {
            //this._showToastMessage(TextMessage.NO_EMAIL_ID_TO_SEND)
        }
    }
}