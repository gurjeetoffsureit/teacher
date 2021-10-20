import React, { Component } from 'react';
import 
    AsyncStorage
 from '@react-native-community/async-storage';

window.navigator.userAgent = 'react-native';
import socketIO from 'socket.io-client'
import { EventRegister } from 'react-native-event-listeners'
import StorageConstant from '../constants/StorageConstant'
import SocketConstant from '../constants/SocketConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager'
import AppConstant from '../constants/AppConstant'

export default class SocketManger {

    static SocketMangerInstance = null;
    _connectSocket() {
        this.socket = socketIO.connect(SocketConstant.SOCKET_BASE_URL, {
            jsonp: false,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            transports: ['websocket']
        });
        this._registerDefaultListener();
        this._registerCustomListener();
    }

    /**
     * @returns {SocketManger}
     */
    static sharedInstance() {
        if (SocketManger.SocketMangerInstance == null) {
            SocketManger.SocketMangerInstance = new SocketManger();
        }
        return this.SocketMangerInstance;
    }


    _registerDefaultListener = () => {
        this.socket.on('connect', this._onSocketConnect);
        this.socket.on('disconnect', this._onSocketDisconnect);
    }

    _onSocketConnect = () => {
        this._onSocketDisconnect()
        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
            //console.log('value==' + value)
            this._subscribeUser(value)
        }).done();
    }

    _onSocketDisconnect = (data) => {
        //console.log('disconnet')
        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
            //console.log('value==' + value)
            this._onUserUnSubscribe(value)
        }).done();
    }

    _registerCustomListener = () => {

        //home
        this.socket.on(SocketConstant.ON_COUNT_USER_STUDENT, this._onMessageReceivedForStudentCount);
        this.socket.on(SocketConstant.ON_COUNT_USER_CLASS, this._onMessageReceivedForClassCount);
        this.socket.on(SocketConstant.ON_COUNT_USER_SHARED_STUDENT, this._onMessageReceivedForSharedStudentCount);


        //student screen
        this.socket.on(SocketConstant.ON_ADD_STUDNET, this._onMessageRecievedForAddStudent);
        this.socket.on(SocketConstant.ON_ADD_STUDENT_BULK, this._onMessageRecievedForAddStudentBulk);
        this.socket.on(SocketConstant.ON_DELETE_BULK_STUDNET, this._onMessageRecievedForStudentDelete);
        this.socket.on(SocketConstant.ON_UPDATE_STUDENT, this._onMessageRecievedForUpdateStudent);
        this.socket.on(SocketConstant.ON_UPDATE_STUDENT_BULK, this._onMessageRecievedForUpdateStudentBulk);


        //Classes Screen
        this.socket.on(SocketConstant.ON_ADD_CLASS, this._onMessageRecievedForClass);
        this.socket.on(SocketConstant.ON_ADD_CLASS_BULK, this.onMessageRecievedForAddClassBulk);
        this.socket.on(SocketConstant.REMOVE_CLASS, this._onMessageRecievedForRemoveClass);
        this.socket.on(SocketConstant.REMOVE_BULK_CLASS, this._onMessageRecievedForRemoveBulkClass);
        this.socket.on(SocketConstant.UPDATE_CLASS, this._onMessageReceivedForUpdateClass);

        // Student and Classes screen for multiple assign
        this.socket.on(SocketConstant.ON_DELETE_STUDENT_CLASS_BULK, this._onMessageReceivedForDeleteStudentClassBulk);
        this.socket.on(SocketConstant.ON_ADD_STUDENT_CLASS_BULK, this._onMessageReceivedForAddStudentClassBulk);

        //FOR COLOR LABLES
        this.socket.on(SocketConstant.ON_ADD_COLOR_LABEL, this.onMessageReceivedForAddColorLabels);
        this.socket.on(SocketConstant.ON_UPDATE_COLOR_LABEL, this.onMessageReceivedForUpdateColorLabels);
        this.socket.on(SocketConstant.ON_DELETE_COLOR_LABEL_BULK, this.onMessageReceivedForDeleteColorLabelsBulk);

        //FOR ACTION FIELD
        this.socket.on(SocketConstant.ON_ADD_ACTION_FIELD, this.onMessageReceivedForAddActionField);
        this.socket.on(SocketConstant.ON_UPDATE_ACTION_FIELD, this.onMessageReceivedForUpdateActionField);
        this.socket.on(SocketConstant.ON_DELETE_ACTION_FIELD_BULK, this.onMessageReceivedForDeleteActionFieldBulk);

        //FOR ACTION FIELD PICKER
        this.socket.on(SocketConstant.ON_ADD_ACTION_FIELD_PICKER, this.onMessageReceivedForAddActionFieldPicker);
        this.socket.on(SocketConstant.ON_UPDATE_ACTION_FIELD_PICKER, this.onMessageReceivedForUpdateActionFieldPicker);
        this.socket.on(SocketConstant.ON_DELETE_ACTION_FIELD_PICKER_BULK, this.onMessageReceivedForDeleteActionFieldPickerBulk);

        //FOR STUDENT ACTION FIELDS
        this.socket.on(SocketConstant.ON_ADD_STUDENT_ACTION, this.onMessageReceivedForAddStudentActions);
        this.socket.on(SocketConstant.ON_UPDATE_STUDENT_ACTION, this.onMessageReceivedForUpdateStudentActions);
        this.socket.on(SocketConstant.ON_DELETE_STUDENT_ACTION_BULK, this.onMessageReceivedForDeleteStudentActionBulk)
        this.socket.on(SocketConstant.ON_UPDATE_POINTS_BULK, this.onMessageReceivedForOnUpdatePointsBulk)


        //FOR DATE RANGE
        this.socket.on(SocketConstant.ON_ADD_DATE_RANGE, this.onMessageReceivedForAddDateRange);
        this.socket.on(SocketConstant.ON_UPDATE_DATE_RANGE, this.onMessageReceivedForUpdateDateRange);
        this.socket.on(SocketConstant.ON_DELETE_DATE_RANGE_BULK, this.onMessageReceivedForDateRangeBulk)

        //For SETTING ANOTHER TEACHERS SHARED DATA
        // this.socket.on(SocketConstant.ON_ADD_ANOTHER_TEACHER_SHARED_DATA, this.onMessageReceivedForAddAnotherTeachersSharedData);
        // // this.socket.on(SocketConstant.ON_UPDATE_ANOTHER_TEACHER_SHARED_DATA, this.onMessageReceivedForUpdateAnotherTeacherSharedData);
        // this.socket.on(SocketConstant.ON_DELETE_ANOTHER_TEACHER_SHARED_DATA_BULK, this.onMessageReceivedForDeleteAnotherTeacherSharedDataBulk);

        //Setting SharedDataWithAnotherTeacher
        this.socket.on(SocketConstant.ON_ADD_SHARED_DATA_WITH_ANOTHER_TEACHER, this.onMessageReceivedForAddSharedDataWithAnotherTeacher);
        // this.socket.on(SocketConstant.ON_UPDATE_SHARED_DATA_WITH_ANOTHER_TEACHER, this.onMessageReceivedForUpdateAnotherTeacherSharedData);
        this.socket.on(SocketConstant.ON_DELETE_SHARED_DATA_WITH_ANOTHER_TEACHER_BULK, this.onMessageReceivedForDeleteSharedDataWithAnotherTeacherBulk);

        //SETTING
        this.socket.on(SocketConstant.ON_UPDATE_USER_SETTING, this.onUpdateUserSetting)
        //this.socket.on(SocketConstant.ON_UPDATE_USER_SETTING_DEFAULT, this.onUpdateUserSettingDefault)
        this.socket.on(SocketConstant.ON_SETTINGS_DELETE_ALL, this.onSettingsDeleteAll)


        //SHARED DATA
        this.socket.on(SocketConstant.ON_ADD_SHARED_STUDENT_BULK, this.onMessageReceivedForOnAddShareStudent);
        this.socket.on(SocketConstant.ON_DELETE_SHARED_STUDENT_BULK, this.onMessageReceivedForDeleteSharedStudentsBulk)
        this.socket.on(SocketConstant.ON_UPDATE_SHARED_STUDENT, this.onMessageReceivedForOnUpdateShareStudent)

        //SHARED CLASS
        this.socket.on(SocketConstant.ON_DELETE_SHARED_CLASS, this.onMessageReceivedForDeleteSharedClass)

        //CUTOMIZED_DETAIL_FIELD
        this.socket.on(SocketConstant.ON_ADD_CUSTOMIZED_DETAIL_FIELD, this.onMessageReceivedForOnAddCutomizedDetailField)
        this.socket.on(SocketConstant.ON_DELETE_CUSTOMIZED_DETAIL_FIELD_BULK, this.onMessageReceivedForOnDeleteCutomizedDetailFieldBulk)
        this.socket.on(SocketConstant.ON_UPDATE_CUSTOMIZED_DETAIL_FIELD, this.onMessageReceivedForOnUpdateCutomizedDetailField)

        //DefaultActionValue
        this.socket.on(SocketConstant.ON_ADD_DEFAULT_ACTION_VALUE, this.onMessageReceivedForOnAddDefaultActionValue)
        this.socket.on(SocketConstant.ON_DELETE_DEFAULT_ACTION_VALUE, this.onMessageReceivedForOnDeleteDefaultActionValueBulk)

        //Randomizer
        this.socket.on(SocketConstant.ON_UPDATE_STUDENT_MARK, this.onMessageReceivedForOnUpdateStudentMark)

        //Customize Terminology
        this.socket.on(SocketConstant.ON_UPDATE_TERMOLOGY, this.onMessageReceivedForOnUpdateTermology)


        //OnUpdateFilters
        this.socket.on(SocketConstant.ON_UPDATE_FILTERS, this.onMessageReceivedForOnUpdateFilters)

        //export
        this.socket.on(SocketConstant.ON_UPDATE_USERBACKUP, this.onMessageReceivedForOnUpdateUserBackup)

        //ON_SUBSCRIPTION_BUY
        this.socket.on(SocketConstant.ON_SUBSCRIPTION_BUY, this.onMessageReceivedForOnSubscriptionBuy)

        //ON_SUBSCRIPTION_CANCEL
        this.socket.on(SocketConstant.ON_SUBSCRIPTION_CANCEL, this.onMessageReceivedForOnSubscriptionCancel)

        // ON_UPDATE_FILTERS: "onUpdateFilters"


    }


    //user will join the room
    _subscribeUser = (userID) => {
        var data = {
            userId: userID
        }
        this.socket.emit('subscribe', data);
    }

    _onUserUnSubscribe = (userID) => {
        var data = {
            userId: userID
        }
        this.socket.emit('unsubscribe', data);
    }

    //home Screen for student Count
    _onMessageReceivedForStudentCount(data) {
        EventRegister.emit(SocketConstant.ON_COUNT_USER_STUDENT, data)
    }

    //home Screen for classes count
    _onMessageReceivedForClassCount = (data) => {
        EventRegister.emit(SocketConstant.ON_COUNT_USER_CLASS, data)
    }

    //home Screen for shared student Count
    _onMessageReceivedForSharedStudentCount = (data) => {
        EventRegister.emit(SocketConstant.ON_COUNT_USER_SHARED_STUDENT, data)
    }

    //student screen to add students
    _onMessageRecievedForAddStudent(data) {
        EventRegister.emit(SocketConstant.ADD_STUDENT, data)
    }

    //student screen to add Bulk students
    _onMessageRecievedForAddStudentBulk(data) {
        EventRegister.emit(SocketConstant.ON_ADD_STUDENT_BULK, data)
    }

    //student screen to update students
    _onMessageRecievedForUpdateStudent = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_STUDENT, data)
    }

    //student screen to update students Bulk
    _onMessageRecievedForUpdateStudentBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_STUDENT_BULK, data)
    }

    //student screen to delete multiple students
    _onMessageRecievedForStudentDelete = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_BULK_STUDNET, data)
    }

    //Classes Screen to add Classes
    _onMessageRecievedForClass = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_CLASS, data)
    }

    //Classes Screen to add Classes Bulk
    onMessageRecievedForAddClassBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_CLASS_BULK, data)
    }

    //Classes Screen to remove classes
    _onMessageRecievedForRemoveClass = (data) => {
        EventRegister.emit(SocketConstant.REMOVE_CLASS, data)
    }

    //Classes Screen to remove bulk classes
    _onMessageRecievedForRemoveBulkClass = (data) => {
        EventRegister.emit(SocketConstant.REMOVE_BULK_CLASS, data)
    }

    //Classes Screen to update classes
    _onMessageReceivedForUpdateClass = (data) => {
        EventRegister.emit(SocketConstant.UPDATE_CLASS, data)
    }

    // Student and Classes screen for multiple student delete from classes and students
    _onMessageReceivedForDeleteStudentClassBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_STUDENT_CLASS_BULK, data)
    }

    // Student and Classes screen for multiple student add from class and students
    _onMessageReceivedForAddStudentClassBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_STUDENT_CLASS_BULK, data)
    }

    //FOR COLOR LABLES to add color labels
    onMessageReceivedForAddColorLabels = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_COLOR_LABEL, data)
    }

    //FOR COLOR LABLES to update color labels
    onMessageReceivedForUpdateColorLabels = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_COLOR_LABEL, data)
    }

    //FOR COLOR LABLES to delete bulk color labels
    onMessageReceivedForDeleteColorLabelsBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_COLOR_LABEL_BULK, data)
    }

    //FOR ACTION FIELD to add Action fields
    onMessageReceivedForAddActionField = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_ACTION_FIELD, data)
    }

    //FOR ACTION FIELD to update action fields
    onMessageReceivedForUpdateActionField = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_ACTION_FIELD, data)
    }

    //FOR ACTION FIELD to delete multiple actions
    onMessageReceivedForDeleteActionFieldBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_ACTION_FIELD_BULK, data)
    }

    //FOR ACTION FIELD PICKER to add action fields pickers
    onMessageReceivedForAddActionFieldPicker = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_ACTION_FIELD_PICKER, data)
    }

    //FOR ACTION FIELD PICKER to update Action Field pickers
    onMessageReceivedForUpdateActionFieldPicker = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_ACTION_FIELD_PICKER, data)
    }

    //FOR ACTION FIELD PICKER to delete multiple action field picker bulk
    onMessageReceivedForDeleteActionFieldPickerBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_ACTION_FIELD_PICKER_BULK, data)
    }

    //FOR STUDENT ACTION FIELDS during assign actions
    onMessageReceivedForAddStudentActions = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_STUDENT_ACTION, data)
    }

    //FOR STUDENT ACTION FIELDS while updating student actions
    onMessageReceivedForUpdateStudentActions = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_STUDENT_ACTION, data)
    }

    //FOR STUDENT ACTION FIELDS on bulk delete actions
    onMessageReceivedForDeleteStudentActionBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_STUDENT_ACTION_BULK, data)
    }

    onMessageReceivedForOnUpdatePointsBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_POINTS_BULK, data)
    }

    //FOR DATE RANGE
    onMessageReceivedForAddDateRange = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_DATE_RANGE, data)
    }

    onMessageReceivedForUpdateDateRange = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_DATE_RANGE, data)
    }

    onMessageReceivedForDateRangeBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_DATE_RANGE_BULK, data)
    }

    // //For SETTING ANOTHER TEACHERS SHARED DATA
    // onMessageReceivedForAddAnotherTeachersSharedData = (data) => {
    //     EventRegister.emit(SocketConstant.ON_ADD_ANOTHER_TEACHER_SHARED_DATA, data)
    // }

    // // onMessageReceivedForUpdateAnotherTeacherSharedData = (data) => {
    // //     EventRegister.emit(SocketConstant.ON_UPDATE_ANOTHER_TEACHER_SHARED_DATA, data)
    // // }

    // onMessageReceivedForDeleteAnotherTeacherSharedDataBulk = (data) => {
    //     EventRegister.emit(SocketConstant.ON_DELETE_ANOTHER_TEACHER_SHARED_DATA_BULK, data)
    // }

    //For SETTING SHARED DATA WITH ANOTHER TEACHERS SHARED DATA
    onMessageReceivedForAddSharedDataWithAnotherTeacher = (data) => {
        //console.log("onMessageReceivedForAddSharedDataWithAnotherTeacher  " + JSON.stringify(data))
        EventRegister.emit(SocketConstant.ON_ADD_SHARED_DATA_WITH_ANOTHER_TEACHER, data)
    }

    // onMessageReceivedForUpdateSharedDataWithAnotherTeacher = (data) => {
    //     EventRegister.emit(SocketConstant.ON_UPDATE_SHARED_DATA_WITH_ANOTHER_TEACHER, data)
    // }

    onMessageReceivedForDeleteSharedDataWithAnotherTeacherBulk = (data) => {
        //console.log("onMessageReceivedForDeleteSharedDataWithAnotherTeacherBulk " + JSON.stringify(data))
        EventRegister.emit(SocketConstant.ON_DELETE_SHARED_DATA_WITH_ANOTHER_TEACHER_BULK, data)
    }
    onMessageReceivedForOnAddShareStudent = (data) => {
        //console.log("onMessageReceivedForOnAddShareStudent " + JSON.stringify(data))
        EventRegister.emit(SocketConstant.ON_ADD_SHARED_STUDENT_BULK, data)
    }
    onMessageReceivedForDeleteSharedStudentsBulk = (data) => {
        //console.log("onMessageReceivedForDeleteSharedStudentsBulk" + JSON.stringify(data))
        EventRegister.emit(SocketConstant.ON_DELETE_SHARED_STUDENT_BULK, data)
    }
    onMessageReceivedForOnUpdateShareStudent = (data) => {
        //console.log("onMessageReceivedForOnUpdateShareStudent" + JSON.stringify(data))
        EventRegister.emit(SocketConstant.ON_UPDATE_SHARED_STUDENT, data)
    }
    onMessageReceivedForDeleteSharedClass = (data) => {
        //console.log("onMessageReceivedForDeleteSharedClass" + JSON.stringify(data))
        EventRegister.emit(SocketConstant.ON_DELETE_SHARED_CLASS, data)
    }

    //for setting screen
    onUpdateUserSetting = (data) => {
        if (data.resetToDefault) {
            EventRegister.emit(SocketConstant.ON_UPDATE_USER_SETTING_DEFAULT, data)
        } else {
            if (data.screenLock != undefined) {
                TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.USER_SCREEN_LOCK, data.screenLock)
            }
            EventRegister.emit(SocketConstant.ON_UPDATE_USER_SETTING, data)
        }


    }


    onSettingsDeleteAll = (data) => {
        EventRegister.emit(SocketConstant.ON_SETTINGS_DELETE_ALL, data)
    }

    // onUpdateUserSettingDefault = (data) => {        
    //     EventRegister.emit(SocketConstant.ON_UPDATE_USER_SETTING_DEFAULT, data)
    // }
    // onUpdateUserSettingResetDefault = (data) => {        
    //     EventRegister.emit(SocketConstant.onUpdateUserSettingResetDefault, data)
    // }
    // onUpdateUserSettingResetDefault2 = (data) => {        
    //     EventRegister.emit(SocketConstant.onUpdateUserSettingResetDefault2, data)
    // }
    // onUpdateUserSettingResetDefault3 = (data) => {        
    //     EventRegister.emit(SocketConstant.onUpdateUserSettingResetDefault3, data)
    // }
    // onUpdateUserSettingResetDefault4 = (data) => {        
    //     EventRegister.emit(SocketConstant.onUpdateUserSettingResetDefault4, data)
    // }

    //CutomizedDetailField
    onMessageReceivedForOnAddCutomizedDetailField = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_CUSTOMIZED_DETAIL_FIELD, data)
    }

    onMessageReceivedForOnDeleteCutomizedDetailFieldBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_CUSTOMIZED_DETAIL_FIELD_BULK, data)
    }

    onMessageReceivedForOnUpdateCutomizedDetailField = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_CUSTOMIZED_DETAIL_FIELD, data)
    }


    //DefaultActionValue
    onMessageReceivedForOnAddDefaultActionValue = (data) => {
        EventRegister.emit(SocketConstant.ON_ADD_DEFAULT_ACTION_VALUE, data)
    }

    onMessageReceivedForOnDeleteDefaultActionValueBulk = (data) => {
        EventRegister.emit(SocketConstant.ON_DELETE_DEFAULT_ACTION_VALUE, data)
    }

    //randoimizer
    onMessageReceivedForOnUpdateStudentMark = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_STUDENT_MARK, data)
    }

    //customize terminology
    onMessageReceivedForOnUpdateTermology = (data) => {
        TeacherAssitantManager.getInstance()._saveCustomizeTerminologyToLocalDb(data)
    }

    //onUpdateFilters
    onMessageReceivedForOnUpdateFilters = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_FILTERS, data)
    }

    //export
    onMessageReceivedForOnUpdateUserBackup = (data) => {
        EventRegister.emit(SocketConstant.ON_UPDATE_USERBACKUP, data)
    }

    //onsuscriptions
    onMessageReceivedForOnSubscriptionBuy = (data) => {
        //console.log("onMessageReceivedForOnSubscriptionBuy")
        EventRegister.emit(SocketConstant.ON_SUBSCRIPTION_BUY, data)
    }

    onMessageReceivedForOnSubscriptionCancel = (data) => {
        //console.log("onMessageReceivedForOnSubscriptionCancel")
        EventRegister.emit(SocketConstant.ON_SUBSCRIPTION_CANCEL, data)
    }




}