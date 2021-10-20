import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text, Switch,
    View, ToastAndroid, FlatList, SafeAreaView, Alert

} from 'react-native'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager'
import API from '../constants/ApiConstant'
import API_PARAM from '../constants/ApiParms';
import update from 'react-addons-update'
import { EventRegister } from 'react-native-event-listeners'
import SocketConstant from '../constants/SocketConstant';
import Loader from '../ActivityIndicator/Loader';
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import ComingFrom from '../constants/ComingFrom'
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import moment from 'moment'
import AppConstant from "../constants/AppConstant";
import Toast, { DURATION } from 'react-native-easy-toast'

export default class StudentActionFields extends React.PureComponent {


    constructor(props) {
        super(props)
        var params = this.props.navigation.state.params
        var paramsItem = params.item
        //console.log('paramsItem ' + JSON.stringify(paramsItem))
        var isUpdate = paramsItem == undefined ? false : true
        if (params.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE || params.comingFrom == ComingFrom.FILTER_OPTION) {
            isUpdate = params.isUpdate
        }
        // //console.log("UserId", paramsItem)

        this.state = {
            userId: TeacherAssitantManager.getInstance().getUserID(),
            listData: [],
            isEditMode: false,
            ActionListSelectedToDelete: [],
            studentActionsDetails: [],
            studentActionID: paramsItem == undefined ? 'n/a' : paramsItem.actionFieldID,
            item: paramsItem,
            isUpdate: isUpdate,
            isFromAddActionsToManySetttingScreen: params.studentId == '' ? true : false,
            loading: false,
            isAsyncLoader: true,
            comingFrom: params.comingFrom,
            isFetchingFromServer: false,
            totalActions: 0,
            createdBy: params.createdBy,
            pointsFilter: []

        }
        //console.log("data", this.state.item)

        this._getListOfActions()



    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.saveActions,
            gotoBack: this.moveToPreviousScreen
        })
        this._addEventListener()
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    saveActions = () => {

        //check if its coming from AddToMany screen 
        if (this.state.isFromAddActionsToManySetttingScreen) {
            this.props.navigation.navigate("AddActionsToManyScreen", {
                onGoBack: this.refresh, screen: "Add Action To Many",
                selectedActionList: this.state.studentActionsDetails, comingFrom: ComingFrom.STUDENT_ACTION_FIELDS,
                leftHeader: BreadCrumbConstant.CANCEL,
            })

        } else {   //it will work when it comes from studentAction screen
            var studentId = this.props.navigation.state.params.studentId
            var studentActions = []


            let body = {}
            let url = ''
            if (this.state.isUpdate) {
                //if its coming from setting screen with selected option default action fields
                // if (this.state.comingFrom != undefined && this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
                //     url = API.BASE_URL + API.API_DEFAULT_ACTION_VALUES  // default action value
                // }
                if (this.state.comingFrom != undefined && this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
                    url = API.BASE_URL + API.API_DEFAULT_ACTION_VALUES  // default action value
                    body = this.state.studentActionsDetails
                    Alert.alert(
                        AppConstant.APP_NAME,
                        'Are you sure you want to clear?',
                        [
                            { text: 'Cancel', onPress: () => { } },//console.log('Cancel Pressed'), style: 'cancel' },
                            { text: 'Clear', onPress: () => this._callSaveApi(url, body), style: 'ok' }

                        ],
                        { cancelable: false }
                    )

                } else {
                    url = API.BASE_URL + API.API_STUDENT_ACTION_DETAILS + API.API_STUDENTS + "/" + studentId + "/" + API.API_STUDENT_ACTION_ASSIGN + this.state.studentActionID
                    body = this.state.studentActionsDetails
                    this._callSaveApi(url, body);
                }

            }
            else {
                //if its coming from setting screen with selected option default action fields
                if (this.state.comingFrom != undefined && this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
                    url = API.BASE_URL + API.API_DEFAULT_ACTION_VALUES
                    body = this.state.studentActionsDetails

                    this._callSaveApi(url, body)
                    // Alert.alert(
                    //     AppConstant.APP_NAME,
                    //     'Are you sure you want to clear?',
                    //     [
                    //         { text: 'Cancel', onPress: () => //console.log('Cancel Pressed'), style: 'cancel' },
                    //         { text: 'Clear', onPress: () => this._callSaveApi(url,body), style: 'Clear' }

                    //     ],
                    //     { cancelable: false }
                    // )
                    // this._callSaveApi(url,body);
                } else if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {
                    url = API.BASE_URL + API.API_USERS_SETTINGS_FILTERS_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID()
                    this._callSaveApi(url, body);
                }
                else {//  url=API.BASE_URL + API.API_STUDENT_ACTION_ASSIGN + API.API_ACTION_ASSIGN_AND_CREATE + "/" + (this.state.isUpdate ? this.state.studentActionID : '')
                    url = API.BASE_URL + API.API_STUDENT_ACTION_ASSIGN + API.API_ACTION_ASSIGN_AND_CREATE
                    var jsonStudentDetailsObject = {
                        studentID: studentId,
                        createdBy: TeacherAssitantManager.getInstance().getUserID()
                    }
                    studentActions.push(jsonStudentDetailsObject)
                    body = {
                        studentActions: studentActions,
                        studentActionsDetails: this.state.studentActionsDetails
                    }
                    //console.log(JSON.stringify(body))
                    this._callSaveApi(url, body);
                }


            }


        }
    }

    async _callSaveApi(url, rawObject) {
       
        this._setLoading(true);
        let isUpdate = this.state.isUpdate;
        const { response, item, body } = await TeacherAssitantManager.getInstance().uploadActionImage(rawObject, isUpdate)
        if (item.index > -1 && !response.Key) {
            this.setLoading(false);
            return;
        }
        var methodType = 'POST';
        let studentActionID = this.state.studentActionID;
        if (this.state.comingFrom != undefined &&
            (this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE)) {
            if (this.state.isUpdate) {
                methodType = 'DELETE';
            }
        }
        else if (this.state.comingFrom != undefined &&
            (ComingFrom.FILTER_OPTION == this.state.comingFrom)) {
            methodType = 'DELETE';
        }
        else if (studentActionID != 'n/a') {
            methodType = 'PUT';
        }
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: methodType,
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': TeacherAssitantManager.getInstance().getUserID(),
            },
            body: JSON.stringify(body)
        }).then((responseJson) => {
            //console.log("response==" + JSON.stringify(responseJson));
            //console.log("response==" + responseJson.message);
            if (responseJson.success) {
                this.setState({
                    loading: false
                }, () => {
                    this._showToastMessage(responseJson.message);
                    //coming from SETTINGS_DEFAULT_ACTION_VALUE option
                    if (this.state.comingFrom != undefined && this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
                        if (this.props.navigation.state.params.headerRight.toLowerCase() == 'save') {
                            this.setState({
                                isUpdate: true
                            });
                            this.props.navigation.setParams({
                                headerRight: 'Clear',
                            });
                        }
                        else {
                            var listdata = [...this.state.listData];
                            for (var index = 0; index < listdata.length; index++) {
                                listdata[index].selectedPickerList = [];
                                listdata[index].actionValue = '';
                            }
                            this.setState({
                                listdata: listdata,
                                studentActionsDetails: [],
                                isUpdate: false,
                            });
                            this.props.navigation.setParams({
                                headerRight: 'Save',
                            });
                        }
                        this._getListOfActions();
                    }
                    else if (this.state.comingFrom != undefined && this.state.comingFrom == ComingFrom.FILTER_OPTION) {
                        this._getListOfActions();
                    }
                    else {
                        this.moveToPreviousScreen(true);
                    }
                });
            }
            else {
                this._setLoading(false);
                this._showToastMessage(responseJson.message);
                // this.showAlert(responseJson.message)
            }
            // this.goToPreviousScreen()
        })
            .catch((error) => {
                //console.log("error===" + error);
            });
    }

    _setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    _getListOfActions() {
        // var userId = TeacherAssitantManager.getInstance().getUserID()
        // //console.log("AddClass  UserId", userId);

        var url = API.BASE_URL + API.API_ACTIONS + API.API_GET_BY_USER_ID + this.state.createdBy //get user list of action

        if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {
            url = API.BASE_URL + API.API_USERS_SETTINGS_FILTERS_BY_USER_ID + this.state.createdBy
        }

        // var url = API.BASE_URL + API.API_ACTIONS + API.API_GET_BY_USER_ID + userId //get user list of action

        // if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {
        //     url = API.BASE_URL + API.API_USERS_SETTINGS_FILTERS_BY_USER_ID + userId
        // }
        //console.log("url is ", url)

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId,
            }
        }).then((responseJson) => {
            //console.log('response===' + JSON.stringify(responseJson))
            if (responseJson.success) {

                let listData = []
                // it will work when we goint to see filter screen
                let pointsFilter = responseJson.pointsFilter
                if (pointsFilter != undefined) {
                    this.setState({
                        pointsFilter: pointsFilter
                    })
                }

                let responseListData = responseJson.data;
                let isComingFromDefaultActionFieldScreen = this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE
                let isComingFromFilterOptions = this.state.comingFrom == ComingFrom.FILTER_OPTION
                //var isHeaderRightSave = this.props.navigation.state.params.headerRight == 'Save'

                if (responseListData.length > 0) {
                    for (var i = 0; i < responseListData.length; i++) {
                        var response = responseListData[i]

                        if (this.state.comingFrom == ComingFrom.FILTER_OPTION && (response.dataType.toLowerCase() == API_PARAM.ACTION_TEXT ||
                            response.dataType.toLowerCase() == API_PARAM.ACTION_IMAGE)) {
                            return
                        }

                        if (!this.state.isUpdate) {

                            let dataType = response.dataType.toLowerCase()

                            if (dataType == API_PARAM.ACTION_DATE &&
                                response.uiTypeStatus == true &&
                                //response.defaultTypeStatus == true &&
                                this.state.comingFrom != ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
                                var date = new Date()
                                var jsonObject = {
                                    studentActionID: this.state.studentActionID,
                                    actionFieldID: response._id,
                                    value: date.toISOString(),
                                    createdBy: TeacherAssitantManager.getInstance().getUserID()
                                }
                                if (response.defaultActionValues.length == 0) {
                                    this.state.studentActionsDetails.push(jsonObject)
                                }

                            }

                            if (dataType == API_PARAM.ACTION_BOOLEAN &&
                                response.uiTypeStatus == false &&
                                //response.defaultTypeStatus == true &&
                                this.state.comingFrom != ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
                                var jsonObject = {
                                    studentActionID: this.state.studentActionID,
                                    actionFieldID: response._id,
                                    value: false,
                                    createdBy: TeacherAssitantManager.getInstance().getUserID()
                                }
                                if (response.defaultActionValues.length == 0) {
                                    this.state.studentActionsDetails.push(jsonObject)
                                }

                            }
                        }


                        var listDataObjet = {
                            visibilty: false,
                            data: response,
                            selectedPickerList: [],
                            actionValue: '',

                        }
                        if (response.dataType.toLowerCase() != API_PARAM.ACTION_TERMOLOGY) {
                            listData.push(listDataObjet)
                        }

                        // isisUpdate ==false its a case if we coming from student action screen and 
                        //adding a new action then its goes to set default action values 

                        //isComingFromDefaultActionFieldScreen is true if we are coming from SETTINGS_DEFAULT_ACTION_VALUE options
                        // in boithe case we will set it
                        if (isComingFromDefaultActionFieldScreen || isComingFromFilterOptions || !this.state.isUpdate) {
                            this._updateListWithPreviousScreenData(response.defaultActionValues, response.dataType, listData, i, responseListData.length)
                        }
                        // else if (isComingFromFilterOptions || !this.state.isUpdate) {
                        //     this._updateListWithPreviousScreenData(response.defaultActionValues, response.dataType)
                        // }

                    }
                    if (this.state.isUpdate && !isComingFromDefaultActionFieldScreen) {
                        //console.log("user id", this.state.studentActionID)
                        this._updateListWithPreviousScreenData(this.state.item.completeList, '', listData)
                    }

                    else {

                        this.setState({
                            listData: listData,
                            isAsyncLoader: false
                        })
                    }
                    // if (this.props.navigation.state.params.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
                    //     this.props.navigation.setParams({
                    //         headerRight: 'Save',
                    //     })
                    // }
                } else {
                    this.setState({
                        listData: listData,
                        isAsyncLoader: false
                    })
                    this.props.navigation.setParams({
                        headerRight: '',
                    })
                }

                if (this.state.comingFrom != undefined && this.state.comingFrom == ComingFrom.STUDENT_ACTIONS &&
                    this.state.createdBy != undefined && this.state.createdBy != TeacherAssitantManager.getInstance().getUserID()) {
                    this._showToastMessage("You are not authorized")
                }


            } else {
                this._showToastMessage(responseJson.message)
            }
        })
            .catch((error) => {
                console.error(error);
            });
    }




    _updateListWithPreviousScreenData = (completeList, dataType = '', listData, listIndex = -1, listLength = -1) => {

        for (var i = 0; i < completeList.length; i++) {
            var completeListItem = completeList[i]
            var actionFieldData = completeListItem.actionFieldID;
            var actionFieldPickerID = completeListItem.actionFieldPickerID;
            var index = -1
            var _actionFieldID = ''
            if (this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE || this.state.comingFrom == ComingFrom.FILTER_OPTION || !this.state.isUpdate) {
                index = listData.findIndex(actionsObject => actionsObject.data._id === actionFieldData);
                _actionFieldID = actionFieldData
            } else {
                index = listData.findIndex(actionsObject => actionsObject.data._id === actionFieldData._id);
                _actionFieldID = actionFieldData._id
                dataType = actionFieldData.dataType

            }

            if (index > -1) {

                var _actionData = listData[index]
                switch (dataType.toLowerCase()) {
                    case API_PARAM.ACTION_DATE:
                        _actionData.actionValue = completeListItem.value
                        _actionData.selectedPickerList.push(completeListItem)

                        var jsonObject = {
                            studentActionID: this.state.studentActionID,
                            actionFieldID: _actionFieldID,
                            value: completeListItem.value,
                            createdBy: TeacherAssitantManager.getInstance().getUserID()
                        }
                        this.state.studentActionsDetails.push(jsonObject)
                        break;

                    case API_PARAM.ACTION_PICKER:
                        if (actionFieldPickerID != null) {
                            _actionData.actionValue = _actionData.actionValue == '' ?
                                actionFieldPickerID.value : _actionData.actionValue + ', ' + completeListItem.actionFieldPickerID.value
                            _actionData.selectedPickerList.push(actionFieldPickerID)

                            var jsonObject = {
                                studentActionID: this.state.studentActionID,
                                actionFieldID: _actionFieldID,
                                actionFieldPickerID: actionFieldPickerID._id,
                                createdBy: TeacherAssitantManager.getInstance().getUserID()
                            }
                            this.state.studentActionsDetails.push(jsonObject)

                        }

                        break;
                    case API_PARAM.ACTION_COLOR_LABEL_PICKER:
                        var colorLabelID = completeListItem.colorLabelID;

                        if (colorLabelID != null) {
                            _actionData.actionValue = _actionData.actionValue == '' ?
                                colorLabelID.name : _actionData.actionValue + ', ' + colorLabelID.name
                            _actionData.selectedPickerList.push(colorLabelID)

                            var jsonObject = {
                                studentActionID: this.state.studentActionID,
                                actionFieldID: _actionFieldID,
                                colorLabelID: colorLabelID._id,
                                createdBy: TeacherAssitantManager.getInstance().getUserID()
                            }
                            this.state.studentActionsDetails.push(jsonObject)

                        }

                        break;

                    case API_PARAM.ACTION_TEXT:
                        _actionData.actionValue = completeListItem.value
                        _actionData.selectedPickerList.push(completeListItem._id)

                        var jsonObject = {
                            studentActionID: this.state.studentActionID,
                            actionFieldID: _actionFieldID,
                            value: completeListItem.value,
                            createdBy: TeacherAssitantManager.getInstance().getUserID()
                        }
                        this.state.studentActionsDetails.push(jsonObject)

                        break;

                    case API_PARAM.ACTION_IMAGE:
                        _actionData.actionValue = completeListItem.value
                        _actionData.selectedPickerList.push(completeListItem._id)

                        var jsonObject = {
                            studentActionID: this.state.studentActionID,
                            actionFieldID: _actionFieldID,
                            value: completeListItem.value,
                            createdBy: TeacherAssitantManager.getInstance().getUserID()
                        }
                        this.state.studentActionsDetails.push(jsonObject)
                        break;

                    case API_PARAM.ACTION_BOOLEAN:

                        _actionData.data.value = (completeListItem.value == 'true')

                        _actionData.actionValue = completeListItem.value

                        _actionData.selectedPickerList.push(completeListItem._id)

                        var jsonObject = {
                            studentActionID: this.state.studentActionID,
                            actionFieldID: _actionFieldID,
                            value: completeListItem.value,
                            createdBy: TeacherAssitantManager.getInstance().getUserID()
                        }
                        this.state.studentActionsDetails.push(jsonObject)

                        break;

                    case API_PARAM.ACTION_COLORPICKER:
                        if (actionFieldPickerID != null) {
                            _actionData.actionValue = _actionData.actionValue == '' ?
                                actionFieldPickerID.value : _actionData.actionValue + ', ' + actionFieldPickerID.value

                            _actionData.selectedPickerList.push(completeListItem.actionFieldPickerID)

                            var jsonObject = {
                                studentActionID: this.state.studentActionID,
                                actionFieldID: _actionFieldID,
                                actionFieldPickerID: actionFieldPickerID._id,
                                createdBy: TeacherAssitantManager.getInstance().getUserID()
                            }

                            this.state.studentActionsDetails.push(jsonObject)


                        }
                        break;

                }

            }
        }
        if (listIndex == -1) {
            this.setState({
                listData: listData,
                isAsyncLoader: false
            })
        } else if (listIndex == listLength - 1) {
            this.setState({
                listData: listData,
                isAsyncLoader: false
            })
        }

    }

    // _updateListWithPreviousScreenDataOLD = (completeList, dataType = '', listData) => {

    //     for (var i = 0; i < completeList.length; i++) {
    //         var completeListItem = completeList[i]
    //         var actionFieldData = completeListItem.actionFieldID;
    //         var actionFieldPickerID = completeListItem.actionFieldPickerID;
    //         var index = -1
    //         var _actionFieldID = ''
    //         if (this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE || this.state.comingFrom == ComingFrom.FILTER_OPTION || !this.state.isUpdate) {
    //             index = this.state.listData.findIndex(actionsObject => actionsObject.data._id === actionFieldData);
    //             _actionFieldID = actionFieldData
    //         } else {
    //             index = this.state.listData.findIndex(actionsObject => actionsObject.data._id === actionFieldData._id);
    //             _actionFieldID = actionFieldData._id
    //             dataType = actionFieldData.dataType

    //         }

    //         if (index > -1) {

    //             var _actionData = this.state.listData[index]
    //             switch (dataType.toLowerCase()) {
    //                 case API_PARAM.ACTION_DATE:

    //                     // if (this.state.comingFrom == ComingFrom.FILTER_OPTION) {

    //                     //     _actionData.actionValue = fromDate +' - '+ toDate
    //                     // } else {
    //                     _actionData.actionValue = completeListItem.value

    //                     // }

    //                     _actionData.selectedPickerList.push(completeListItem)

    //                     var jsonObject = {
    //                         studentActionID: this.state.studentActionID,
    //                         actionFieldID: _actionFieldID,
    //                         value: completeListItem.value,
    //                         createdBy: TeacherAssitantManager.getInstance().getUserID()
    //                     }
    //                     this.state.studentActionsDetails.push(jsonObject)
    //                     break;

    //                 case API_PARAM.ACTION_PICKER:
    //                     if (actionFieldPickerID != null) {
    //                         _actionData.actionValue = _actionData.actionValue == '' ?
    //                             actionFieldPickerID.value : _actionData.actionValue + ', ' + completeListItem.actionFieldPickerID.value
    //                         _actionData.selectedPickerList.push(actionFieldPickerID)

    //                         var jsonObject = {
    //                             studentActionID: this.state.studentActionID,
    //                             actionFieldID: _actionFieldID,
    //                             actionFieldPickerID: actionFieldPickerID._id,
    //                             createdBy: TeacherAssitantManager.getInstance().getUserID()
    //                         }
    //                         this.state.studentActionsDetails.push(jsonObject)

    //                     }

    //                     break;
    //                 case API_PARAM.ACTION_COLOR_LABEL_PICKER:
    //                     var colorLabelID = completeListItem.colorLabelID;

    //                     if (colorLabelID != null) {
    //                         _actionData.actionValue = _actionData.actionValue == '' ?
    //                             colorLabelID.name : _actionData.actionValue + ', ' + colorLabelID.name
    //                         _actionData.selectedPickerList.push(colorLabelID)

    //                         var jsonObject = {
    //                             studentActionID: this.state.studentActionID,
    //                             actionFieldID: _actionFieldID,
    //                             colorLabelID: colorLabelID._id,
    //                             createdBy: TeacherAssitantManager.getInstance().getUserID()
    //                         }
    //                         this.state.studentActionsDetails.push(jsonObject)

    //                     }

    //                     break;

    //                 case API_PARAM.ACTION_TEXT:
    //                     _actionData.actionValue = completeListItem.value
    //                     _actionData.selectedPickerList.push(completeListItem._id)

    //                     var jsonObject = {
    //                         studentActionID: this.state.studentActionID,
    //                         actionFieldID: _actionFieldID,
    //                         value: completeListItem.value,
    //                         createdBy: TeacherAssitantManager.getInstance().getUserID()
    //                     }
    //                     this.state.studentActionsDetails.push(jsonObject)

    //                     break;

    //                 case API_PARAM.ACTION_IMAGE:
    //                     _actionData.actionValue = completeListItem.value
    //                     _actionData.selectedPickerList.push(completeListItem._id)

    //                     var jsonObject = {
    //                         studentActionID: this.state.studentActionID,
    //                         actionFieldID: _actionFieldID,
    //                         value: completeListItem.value,
    //                         createdBy: TeacherAssitantManager.getInstance().getUserID()
    //                     }
    //                     this.state.studentActionsDetails.push(jsonObject)
    //                     break;

    //                 case API_PARAM.ACTION_BOOLEAN:

    //                     _actionData.data.value = (completeListItem.value == 'true')

    //                     _actionData.actionValue = completeListItem.value

    //                     _actionData.selectedPickerList.push(completeListItem._id)

    //                     var jsonObject = {
    //                         studentActionID: this.state.studentActionID,
    //                         actionFieldID: _actionFieldID,
    //                         value: completeListItem.value,
    //                         createdBy: TeacherAssitantManager.getInstance().getUserID()
    //                     }
    //                     this.state.studentActionsDetails.push(jsonObject)

    //                     break;

    //                 case API_PARAM.ACTION_COLORPICKER:
    //                     if (actionFieldPickerID != null) {
    //                         _actionData.actionValue = _actionData.actionValue == '' ?
    //                             actionFieldPickerID.value : _actionData.actionValue + ', ' + actionFieldPickerID.value

    //                         _actionData.selectedPickerList.push(completeListItem.actionFieldPickerID)

    //                         var jsonObject = {
    //                             studentActionID: this.state.studentActionID,
    //                             actionFieldID: _actionFieldID,
    //                             actionFieldPickerID: actionFieldPickerID._id,
    //                             createdBy: TeacherAssitantManager.getInstance().getUserID()
    //                         }

    //                         this.state.studentActionsDetails.push(jsonObject)


    //                     }
    //                     break;

    //             }

    //         }
    //     }

    //     this.setState({
    //         listData: this.state.listData,
    //         isAsyncLoader: false
    //     })
    // }


    _getActionListStatus() {
        var deviceID = TeacherAssitantManager.getInstance().getDeviceID();
        var userId = TeacherAssitantManager.getInstance().getUserID()
        var url = API.BASE_URL + API.API_ACTIONS + API.API_GET_BY_USER_ID + userId
        //console.log("url is ", url)

        return TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId,
            }
        }).then((responseJson) => {
            //console.log(responseJson.success);
            return responseJson;
        })
            .catch((error) => {
                return error;
            });

    }

    refresh = (item, isSelectedNewItem = false, isFromPointFilter = false) => {
        if (isFromPointFilter) {
            this.setState({
                pointsFilter: item
            })
            return
        }
        if (item != undefined) {
            //coming from SETTINGS_DEFAULT_ACTION_VALUE option

            // if (this.state.comingFrom == ComingFrom.FILTER_OPTION) {
            //     this._getListOfActions()
            //     return
            // }
            if (isSelectedNewItem && this.state.comingFrom != undefined && this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
                this.setState({
                    isUpdate: false,
                })

                this.props.navigation.setParams({
                    headerRight: 'Save',
                })

            }
            switch (item.dataType.toLowerCase()) {
                case API_PARAM.ACTION_DATE:
                    this._updateListForLongText(item)
                    break;
                case API_PARAM.ACTION_PICKER:
                    this._updateListForPicker(item)
                    break;
                case API_PARAM.ACTION_COLOR_LABEL_PICKER:
                    this._updateListForPicker(item)
                    break;
                case API_PARAM.ACTION_TEXT:
                    this._updateListForLongText(item)
                    break;
                case API_PARAM.ACTION_BOOLEAN:
                    this._updateListForSwitch(item)
                    break;
                case API_PARAM.ACTION_IMAGE:
                    this._updateListForImage(item)
                    break;
                case API_PARAM.ACTION_COLORPICKER:
                    this._updateListForPicker(item)
                    break;
            }
        }
        // else if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {
        //     // this.setState({
        //     //     listData: [],
        //     // },function(){
        //     this._getListOfActions()
        //     // })

        //     return
        // }


    }
    _updateListForLongText = (item) => {
        var index = this.state.listData.findIndex(object => object.data._id === item._id);
        if (index > -1) {
            var actionFiled = this.state.listData[index]
            actionFiled.actionValue = item.actionValue

            //this.state.listData[index].

            const updatedActions = update(this.state.listData, { $splice: [[index, actionFiled]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedActions });

            var jsonObject = {
                studentActionID: this.state.studentActionID,
                actionFieldID: item._id,
                value: item.actionValue,
                createdBy: TeacherAssitantManager.getInstance().getUserID()
            }

            //check if actionlist already contain that object then update it ow add object
            var index = this.state.studentActionsDetails.findIndex(object => object.actionFieldID === item._id);
            if (index > -1) {
                var objectFromStudentActionDetails = this.state.studentActionsDetails[index]
                objectFromStudentActionDetails.value = item.actionValue

                const updatedActions = update(this.state.studentActionsDetails, { $splice: [[index, objectFromStudentActionDetails]] });  // array.splice(start, deleteCount, item1)
                this.setState({ studentActionsDetails: updatedActions });
            }
            else {
                this.state.studentActionsDetails.push(jsonObject)
            }

        }

    }
    _updateListForSwitch = (item) => {
        var index = this.state.listData.findIndex(object => object.data._id === item._id);
        if (index > -1) {
            var actionFiled = this.state.listData[index]
            actionFiled.actionValue = item.actionValue

            //this.state.listData[index].

            const updatedActions = update(this.state.listData, { $splice: [[index, actionFiled]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedActions });

            var jsonObject = {
                studentActionID: this.state.studentActionID,
                actionFieldID: item._id,
                value: item.actionValue,
                createdBy: TeacherAssitantManager.getInstance().getUserID()
            }




            //check if actionlist already contain that object then update it ow add object
            var index = this.state.studentActionsDetails.findIndex(object => object.actionFieldID === item._id);
            if (index > -1) {
                var objectFromStudentActionDetails = this.state.studentActionsDetails[index]
                objectFromStudentActionDetails.value = item.actionValue
                const updatedActions = update(this.state.studentActionsDetails, { $splice: [[index, objectFromStudentActionDetails]] });  // array.splice(start, deleteCount, item1)
                this.setState({ studentActionsDetails: updatedActions });
            }
            else {
                this.state.studentActionsDetails.push(jsonObject)
            }
            //  this._prepareActionForSelectedStudent(item._id,actionFiled.selectedPickerList)

        }

    }

    _updateListForImage = (item) => {
        var index = this.state.listData.findIndex(object => object.data._id === item._id);
        if (index > -1) {
            var actionFiled = this.state.listData[index]
            actionFiled.actionValue = item.actionValue

            //this.state.listData[index].

            const updatedActions = update(this.state.listData, { $splice: [[index, actionFiled]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedActions });

            var jsonObject = {
                studentActionID: this.state.studentActionID,
                actionFieldID: item._id,
                value: item.actionValue,
                createdBy: TeacherAssitantManager.getInstance().getUserID()
            }

            //check if actionlist already contain that object then update it ow add object
            var index = this.state.studentActionsDetails.findIndex(object => object.actionFieldID === item._id);
            if (index > -1) {
                var objectFromStudentActionDetails = this.state.studentActionsDetails[index]
                objectFromStudentActionDetails.value = item.actionValue

                const updatedActions = update(this.state.studentActionsDetails, { $splice: [[index, objectFromStudentActionDetails]] });  // array.splice(start, deleteCount, item1)
                this.setState({ studentActionsDetails: updatedActions });
            }
            else {
                this.state.studentActionsDetails.push(jsonObject)
            }


        }


    }

    //help in update picker data type using id
    _updateListForPicker = (item) => {
        var index = this.state.listData.findIndex(object => object.data._id === item._id);
        if (index > -1) {
            var actionFiled = this.state.listData[index]
            actionFiled.selectedPickerList = item.selectedPickerList
            actionFiled.actionValue = item.actionValue

            //this.state.listData[index].

            const updatedStudents = update(this.state.listData, { $splice: [[index, actionFiled]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedStudents });

            this._deleteAllPickersFromFinalListAndAddNewPicker(item, actionFiled.selectedPickerList)


        }
    }
    _deleteAllPickersFromFinalListAndAddNewPicker = (item, selectedActionPickerList) => {
        var itemId = item._id
        var array = this.state.studentActionsDetails

        var index = array.findIndex(studentObject => studentObject.actionFieldID == itemId);

        if (index > -1) {
            array.splice(index, 1);
            this.setState({
                studentActionsDetails: array
            }, function () {
                this._deleteAllPickersFromFinalListAndAddNewPicker(item, selectedActionPickerList)
            })
            // call this method to remove other object if any exist ow it will go to else part.

        }
        else {

            if (selectedActionPickerList != undefined) {
                for (var i = 0; i < selectedActionPickerList.length; i++) {
                    var jsonObject = {}

                    if (item.dataType.toLowerCase() == API_PARAM.ACTION_COLOR_LABEL_PICKER) {
                        jsonObject = {
                            studentActionID: this.state.studentActionID,
                            actionFieldID: itemId,
                            colorLabelID: selectedActionPickerList[i]._id,
                            createdBy: TeacherAssitantManager.getInstance().getUserID()
                        }
                    }
                    else {
                        jsonObject = {
                            studentActionID: this.state.studentActionID,
                            actionFieldID: itemId,
                            actionFieldPickerID: selectedActionPickerList[i]._id,
                            colorLabelID: selectedActionPickerList[i]._id,
                            createdBy: TeacherAssitantManager.getInstance().getUserID()
                        }
                    }


                    this.state.studentActionsDetails.push(jsonObject)

                }
                this.setState({
                    studentActionsDetails: this.state.studentActionsDetails
                })

            }

        }
    }

    //help in update picker data type using id
    _updateListForDate = (item) => {
        var index = this.state.listData.findIndex(object => object.data._id === item._id);
        if (index > -1) {
            var actionFiled = this.state.listData[index]
            actionFiled.selectedPickerList = item.selectedPickerList
            actionFiled.actionValue = item.actionValue

            //this.state.listData[index].

            const updatedStudents = update(this.state.listData, { $splice: [[index, actionFiled]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedStudents });

            for (var i = 0; i < actionFiled.selectedPickerList.length; i++) {
                var jsonObject = {
                    studentActionID: this.state.studentActionID,
                    actionFieldID: item._id,
                    actionFieldPickerID: actionFiled.selectedPickerList[i]._id,
                    createdBy: TeacherAssitantManager.getInstance().getUserID()
                }
                //check if actionlist already contain that object then update it ow add object
                var index = this.state.studentActionsDetails.findIndex(object => object.actionFieldID === item._id);
                if (index > -1) {
                    const updatedActions = update(this.state.studentActionsDetails, { $splice: [[index, item]] });  // array.splice(start, deleteCount, item1)
                    this.setState({ studentActionsDetails: updatedActions });
                }
                else {
                    this.state.studentActionsDetails.push(jsonObject)
                }
            }


        }
    }

    moveToPreviousScreen = (isTrue = false) => {
        this._removeEventListener();
        this.props.navigation.state.params.onGoBack(isTrue);
        this.props.navigation.goBack();
    }



    //help to remove Listner
    _removeEventListener = () => {

        if (this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
            // EventRegister.removeEventListener(this.addDefaultActionValueListener)
            EventRegister.removeEventListener(this.removeDefaultActionValueListener)
        }
        //else {
        // EventRegister.removeEventListener(this.addStudentActionListener)
        // EventRegister.removeEventListener(this.removeStudentActionListener)
        // EventRegister.removeEventListener(this.updateStudentActionListener)

        EventRegister.removeEventListener(this.addColorLabelListener)
        EventRegister.removeEventListener(this.removeActionFieldListener)
        EventRegister.removeEventListener(this.updateActionFieldListener)
        EventRegister.removeEventListener(this.onSettingsDeleteAllForOwn)
        EventRegister.removeEventListener(this.onSettingsDeleteAllForSharedStudent)
        //}
    }

    // event listener for socket
    _addEventListener = () => {
        if (this.state.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE) {
            this.removeDefaultActionValueListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_DEFAULT_ACTION_VALUE, (data) => {
                this._removeDefaultActionValueListener(data)
            })
        }
        // else {
        // this.addStudentActionListener = EventRegister.addEventListener(SocketConstant.ADD_STUDENT, (data) => {
        //     //   this._addDataToStudentAction(data)
        // })

        // this.removeStudentActionListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_BULK_STUDNET, (data) => {
        //     //console.log('removeStudentListener');
        //     //  this.removeStudentAction(data)
        // })

        // this.updateStudentActionListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT, (data) => {
        //     //console.log('UpdateStudentListener');
        //     //   this._updateStudentAction(data)
        // })
        this.addColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_ADD_ACTION_FIELD, (data) => {
            this._addDataToActionField(data)
        })

        this.removeActionFieldListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_ACTION_FIELD_BULK, (data) => {
            //console.log('removeStudentListener');
            this._removeActionField(data)
        })

        this.updateActionFieldListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_ACTION_FIELD, (data) => {
            //console.log('UpdateStudentListener');
            this._updateActionField(data)
        })
        // }


        if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {
            this.onUpdateFilters = EventRegister.addEventListener(SocketConstant.ON_UPDATE_FILTERS, (data) => {
                this._getListOfActions()
            })
        } else {

            if (this.state.createdBy == TeacherAssitantManager.getInstance().getUserID()) {
                this.onSettingsDeleteAllForOwn = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
                    //console.log('removeSharedStudentLister');

                    this._onSettingsDeleteAllForOwn(data);

                })
            } else {
                this.onSettingsDeleteAllForSharedStudent = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
                    //console.log('removeSharedStudentLister');

                    this._onSettingsDeleteAllForSharedStudent(data);
                })
            }




        }







    }

    _onSettingsDeleteAllForSharedStudent(data) {
        if (data.forShared != undefined && data.forShared) {
            this.getActionListAfterSettingDeleteAllSocketResponse();
        }
    }

    _onSettingsDeleteAllForOwn(data) {
        if (data.clearData) {
            this.getActionListAfterSettingDeleteAllSocketResponse();
        }
    }

    getActionListAfterSettingDeleteAllSocketResponse() {
        if (this.state.item != undefined) {
            let item = this.state.item
            item.completeList = []

            this.setState({
                listData: [],
                isAsyncLoader: true,
                item: item
            }, function () {
                this._getListOfActions();
            });
        }

    }

    _addDefaultActionValueListener(data) {
        this.setState({
            isUpdate: false
        })
        this.props.navigation.setParams({
            headerRight: 'Save',
        })
    }


    _removeDefaultActionValueListener(data) {


    }

    //add data to student
    _addDataToActionField = (actionField) => {
        var listDataObject = {}
        listDataObject = {
            visibilty: false,
            data: actionField,
            selectedPickerList: [],
            actionValue: ''
        }


        this.state.listData.push(listDataObject)
        this.setState({
            listData: this.state.listData
        })


    }

    //remove student data
    _removeActionField = (actionFieldIdList) => {

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            //console.log(actionFieldIdList._id)
            var array = [...this.state.listData];

            for (var i = 0; i < actionFieldIdList._id.length; i++) {
                //console.log('for studentList')
                //console.log(actionFieldIdList._id[i])

                var index = array.findIndex(actionFieldObject => actionFieldObject.data._id == actionFieldIdList._id[i]);
                //console.log('index' + index)

                if (index > -1) {
                    array.splice(index, 1);
                }
            }

            this.setState({
                listData: array,
                colorsIdNeedToDelete: [],
            })
        }
    }


    _updateActionField(actionField) {

        if (this.state.listData.length > 0) {
            //console.log('_UpdateStudentData');

            //console.log(actionField);
            var array = this.state.listData

            var index = array.findIndex(actionFieldObject => actionFieldObject.data._id == actionField._id);
            //console.log('index');
            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(this.state.listData[index]);
                var _actionFiled = this.state.listData[index];
                _actionFiled.data = actionField
                const updatedStudentActions = update(this.state.listData, { $splice: [[index, _actionFiled.data]] });  // array.splice(start, deleteCount, item1)
                this.setState({ listData: updatedStudentActions });

            }
        }

    }



    //add data to student
    _addDataToStudentAction = (action) => {
        var listDataObject = {}
        listDataObject = {
            visibilty: false,
            data: action,
            selectedPickerList: [],
            actionValue: ''
        }
        this.state.listData.push(listDataObject)

    }

    //remove student data
    removeStudentAction = (actionList) => {

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            //console.log(actionList._id)
            var array = [...this.state.listData];

            for (var i = 0; i < actionList._id.length; i++) {
                //console.log('for studentList')
                //console.log(actionList._id[i])

                var index = array.findIndex(actionObject => actionObject.data._id == actionList._id[i]);
                //console.log('index' + index)

                if (index > -1) {
                    array.splice(index, 1);
                }
            }

            this.setState({
                listData: array,
                colorsIdNeedToDelete: [],
            })
        }


    }
    loadMoreStudentActions() {

        //  const { listData, totalActions, isFetchingFromServer } = this.state
        // if (listData.length < totalActions && !isFetchingFromServer) {

        //   this.setState({ isFetchingFromServer: true }, function () {
        //     this._getListOfActions()
        //     //console.log('loadMoreStudents')
        //   })


        // }
    }


    _updateStudentAction(action) {

        if (this.state.listData.length > 0) {
            //console.log('_UpdateStudentData');

            //console.log(action);
            var array = this.state.listData

            var index = array.findIndex(actionObject => actionObject.data._id == action._id[i]);
            //console.log('index');
            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(this.state.listData[index]);
                var pickerAction = this.state.listData[index];
                pickerAction.data = action
                const updatedStudentActions = update(this.state.listData, { $splice: [[index, pickerAction.data]] });  // array.splice(start, deleteCount, item1)
                this.setState({ listData: updatedStudentActions });
            }
        }

    }

    _onpressShowPointFilter = () => {
        const { state, navigate } = this.props.navigation;
        navigate("FiltersPoints", {
            screenTitle: "Filter options", onGoBack: this.refresh,
            leftHeader: BreadCrumbConstant.SETTINGS,
            headerRight: "Save", pointsFilter: this.state.pointsFilter
        })

    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var title = params.screen + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 0)
        if (params.comingFrom == ComingFrom.SETTINGS_DEFAULT_ACTION_VALUE || params.comingFrom == ComingFrom.FILTER_OPTION) {
            title = params.screen
        }

        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: '' + ` ${title}`,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,
            headerLeft: () =>
                <TouchableOpacity onPress={() => params.gotoBack()}>{
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
                }
                </TouchableOpacity>
            ,
            headerRight: () =>
                params.createdBy == undefined || params.createdBy == TeacherAssitantManager.getInstance().getUserID() ?
                    <TouchableOpacity
                        onPress={() => params.onAdd()}
                        disabled={params.headerRight == '' ? true : false}>
                        <Text style={StyleTeacherApp.headerRightButtonText}>
                            {`${navigation.state.params.headerRight}`}
                        </Text>
                    </TouchableOpacity>
                    : <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
                    </View>

        }
    }

    //render the whle ui
    render() {
        var isComingFromFilterOption = this.state.comingFrom == ComingFrom.FILTER_OPTION
        let { listData, isFetchingFromServer, isHideBottomView, pointsFilter } = this.state
        let isPointFilterHavingValue = pointsFilter.length > 0
        let pointValue = ''
        if (isPointFilterHavingValue) {
            switch (pointsFilter[1]) {
                case "$eq":
                    pointValue = '=' + pointsFilter[0]
                    break;
                case "$gt":
                    pointValue = '>' + pointsFilter[0]
                    break;
                case "$lt":
                    pointValue = '<' + pointsFilter[0]
                    break;
            }
        }

        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <Loader loading={this.state.loading} />
                    <View style={isComingFromFilterOption ? { flex: 0.998 } : { flex: 1 }}>
                        <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
                        <FlatList
                            style={{ flex: 1, marginBottom: 0, backgroundColor: 'white' }}
                            data={this.state.listData}
                            extraData={this.state.listData}
                            renderItem={this._renderItem}
                            keyExtractor={(item, index) => `${index}`}
                            ItemSeparatorComponent={(sectionId, rowId) => (
                                <View key={rowId} style={styles.separator} />
                            )}
                            onEndReachedThreshold={0.8}
                            // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(listData)}
                            onEndReached={this.loadMoreStudentActions}
                            ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                        />
                    </View>
                    {
                        isComingFromFilterOption ?
                            <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                            /> : null
                    }
                    {
                        isComingFromFilterOption ?
                            <View style={styles.bottomOuterView}>
                                <View style={[styles.bottomInnerView, { paddingLeft: 10, paddingRight: 6 }]}>
                                    <TouchableOpacity style={{ flexDirection: 'row', flex: 1, height: 40, }}
                                        onPress={() => this._onpressShowPointFilter(true)}>
                                        <View style={{ alignSelf: 'center', }}>
                                            <Text style={[styles.rowText, { textAlign: 'right', }]}>Point Value</Text>
                                        </View>
                                        <View style={
                                            { flex: 1, flexDirection: 'row', position: 'absolute', end: 2, alignSelf: 'center' }
                                        }>
                                            <Text style={[styles.rowText]}>{pointValue}</Text>
                                            <Image style={styles.imageViewHeader}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            : null
                    }
                </View>
            </SafeAreaView>
        )
    }

    _renderItem = ({ item, index }) => {
        //console.log("data is", item)
        var actionValue = ''


        data = item.data
        let lblActionFeilds = data.singular
        var isShowingImage = (data.dataType.toLowerCase() == API_PARAM.ACTION_IMAGE &&
            item.actionValue != undefined && item.actionValue != '')

        if (data.dataType.toLowerCase() == API_PARAM.ACTION_DATE && item.actionValue != '') {
            if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {
                let fromDate = item.actionValue[0]
                let toDate = item.actionValue[1]
                toDate = moment.utc(data.endDate).format('MM/DD/YYYY')
                fromDate = TeacherAssitantManager.getInstance()._changeDateFormat(new Date(fromDate), true)
                actionValue = fromDate + ' - ' + toDate
            } else {
                var date = new Date(item.actionValue);
                actionValue = TeacherAssitantManager.getInstance()._changeDateFormat(date)
            }



        } else if (data.dataType.toLowerCase() == API_PARAM.ACTION_IMAGE && item.actionValue != '') {
            actionValue = item.actionValue
        } else if (data.dataType.toLowerCase() == API_PARAM.ACTION_TEXT && item.actionValue != '') {
            actionValue = item.actionValue
        }
        else if (data.dataType.toLowerCase() == API_PARAM.ACTION_BOOLEAN && item.actionValue != '') {
            if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {
                if (item.actionValue != '') {
                    let isTrue = item.actionValue[0]
                    actionValue = isTrue ? 'Yes' : 'No'
                }

            } else {
                actionValue = item.actionValue
            }

        } else if (item.actionValue != '') {
            actionValue = item.actionValue
            let pickerList = actionValue.split(',')
            if (data.default == '') {
                lblActionFeilds = pickerList.length > 1 ? data.plural : data.singular
            } else {
                lblActionFeilds = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(data.default, pickerList.length)
            }

        }



        var isComingFromFilterOption = this.state.comingFrom != ComingFrom.FILTER_OPTION

        if (data.visible == true) {
            return (
                <View>
                    <TouchableOpacity
                        onPress={() => this._handleRowclick(item, index)}
                        disabled={item.data.dataType == 'BOOLEAN' && isComingFromFilterOption ? true : false}>
                        <View style={styles.rowContainer}>
                            {
                                this.state.isEditMode ?
                                    <View style={{
                                        flex: 0.1, justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        {
                                            item.visibility ? <Image style={{
                                                height: 16,
                                                width: 16,
                                            }}
                                                name="search"
                                                source={require("../img/check_icon.png")} /> : null
                                        }
                                    </View>
                                    : null
                            }
                            {
                                (isShowingImage) ?
                                    <View style={{
                                        flex: 0.1, marginLeft: 2, marginRight: 10,
                                        height: 40,
                                        alignItems: 'flex-start',
                                        justifyContent: 'center',
                                    }}>
                                        {
                                            TeacherAssitantManager.getInstance().getFastImageComponent(actionValue, {
                                                // alignSelf: 'center',
                                                width: 40,
                                                height: 40
                                            })
                                        }
                                    </View>
                                    : null
                            }
                            <View style={this.state.isEditMode || isShowingImage ?
                                {
                                    flex: 0.58,
                                    marginLeft: 10,
                                    height: 40,
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                } : styles.rowTextContainter}>
                                <Text style={[styles.rowText, {}]} numberOfLines={1}>
                                    {/* {//item.data.singular} */}
                                    {
                                        lblActionFeilds
                                    }
                                </Text>
                            </View>
                            <View style={styles.touchStyle}>
                                <View style={styles.imageContainer}>
                                    <View style={styles.imageNextContainer}>
                                        {
                                            item.data.dataType == 'BOOLEAN' && this.state.comingFrom != ComingFrom.FILTER_OPTION ?
                                                <Switch
                                                    style={{ flex: 1, flexDirection: 'row', alignItems: "center", marginTop: 5 }}
                                                    onValueChange={() => this._handleSwitch(item, index, item.data.value)}
                                                    value={item.data.value}
                                                />
                                                :
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: "center" }}>
                                                    <Text numberOfLines={1} style={[styles.rowText, { marginEnd: 2, fontSize: 11.5, textAlign: 'right' }]}>
                                                        {isShowingImage ? '' : actionValue}
                                                    </Text>
                                                    <Image style={styles.imageView}
                                                        source={require('../img/icon_arrow.png')}>
                                                    </Image>
                                                </View>
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }




    };
    _handleSwitch = (item, index, value) => {
        if (this.state.createdBy == TeacherAssitantManager.getInstance().getUserID()) {
            //console.log("item", item)
            //console.log("index", index)
            //console.log("value", value)
            this.state.listData[index].data.value = !value;
            this.setState({
                listData: this.state.listData
            })

            //console.log("data is", item)

            var item = {
                _id: item.data._id,
                dataType: item.data.dataType,
                actionValue: item.data.value
            }


            this.refresh(item, true)
        }

    }

    _handleEditClick = () => {
        this.setState({
            isEditMode: true
        })
    }

    _handleDoneClick = () => {
        var newArray = this.state.listData.slice();
        for (i = 0; i < newArray.length; i++) {
            if (newArray[i].visibility == true) {
                newArray[i].visibility = false
            }
        }

        this.setState({
            isEditMode: false,
            listData: newArray,
            ActionListSelectedToDelete: []
        })
    }

    _handleRowclick = (item, index) => {

        if (this.state.createdBy == undefined || this.state.createdBy == TeacherAssitantManager.getInstance().getUserID()) {
            const { state, navigate } = this.props.navigation;

            switch (item.data.dataType.toLowerCase()) {
                case API_PARAM.ACTION_DATE:

                    if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {

                        navigate("AddSettingDateRange", {
                            onGoBack: () => this.refresh(),
                            headerRight: "Save",
                            screenTitle: '',
                            item: item,
                            leftHeader: BreadCrumbConstant.CANCEL,
                            dateRangeData: undefined, isShowingQuickPickSection: true,
                            comingFrom: this.state.comingFrom
                        })
                    } else {
                        navigate("AddDateTime", {
                            screenTitle: item.data.singular,
                            headerRight: "Save",
                            onGoBack: this.refresh, item: item,
                            leftHeader: BreadCrumbConstant.CANCEL,


                        })
                    }


                    break;
                case API_PARAM.ACTION_PICKER:

                    let comingFrom = ComingFrom.STUDENT_ACTION_FIELDS
                    if (this.state.comingFrom == ComingFrom.FILTER_OPTION) {
                        comingFrom = this.state.comingFrom
                    }
                    navigate("PickerDataType", {
                        onGoBack: this.refresh,
                        userId: this.state.userId,
                        isheaderRightShow: true,
                        headerRight: "Save",
                        screenTitle: item.data.plural,
                        item: item,
                        comingFrom: comingFrom, leftHeader: BreadCrumbConstant.CANCEL,
                        isHideBottomView: this.state.comingFrom == ComingFrom.FILTER_OPTION ? true : false
                    })
                    break;
                case API_PARAM.ACTION_COLOR_LABEL_PICKER:
                case API_PARAM.ACTION_COLORPICKER:         // ACTION TEXT
                    navigate("ColorPickerDataType", {
                        onGoBack: this.refresh,
                        userId: this.state.userId,
                        isheaderRightShow: true,
                        headerRight: "Save",
                        screenTitle: item.data.plural,
                        item: item,
                        leftHeader: BreadCrumbConstant.CANCEL,
                        isHideBottomView: this.state.comingFrom == ComingFrom.FILTER_OPTION ? true : false,
                        comingFrom: this.state.comingFrom
                    })
                    break;
                case API_PARAM.ACTION_TEXT:
                    //console.log("ACTION_TEXT", item.data)

                    navigate("AddLongText", {
                        screenTitle: item.data.singular,
                        onGoBack: this.refresh,
                        headerRight: "Save",
                        item: item,
                        leftHeader: BreadCrumbConstant.CANCEL
                    })

                    break;
                case API_PARAM.ACTION_BOOLEAN:

                    if (ComingFrom.FILTER_OPTION == this.state.comingFrom) {
                        navigate("FilterTeacherAndParentResponse", {
                            onGoBack: () => this.refresh(),
                            headerRight: "Save",
                            screenTitle: '',
                            item: item,
                            leftHeader: BreadCrumbConstant.CANCEL,
                            dateRangeData: undefined,
                            isShowingQuickPickSection: true,
                            lblHeader: item.data.singular
                        })
                    }
                    break;
                case API_PARAM.ACTION_IMAGE:

                    navigate("AddActionImage", {
                        screenTitle: item.data.singular,
                        onGoBack: this.refresh,
                        item: item,
                        leftHeader: BreadCrumbConstant.CANCEL
                    })

                    break;
                // case API_PARAM.ACTION_COLORPICKER:

                //     navigate("ColorPickerDataType", {
                //         onGoBack: this.refresh,
                //         userId: this.state.userId, isheaderRightShow: true,
                //         headerRight: "Save", screenTitle: item.data.singular, item: item, leftHeader: BreadCrumbConstant.CANCEL,
                //         isHideBottomView: this.state.comingFrom == ComingFrom.STUDENT_SCREEN ? true : false
                //     })
                //     break;
            }
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    list: {
        backgroundColor: 'gray',
        height: 0.9
    },
    bottomOuterView: {
        height: 50,
        backgroundColor: 'white'
    },
    bottomInnerView: {
        flexDirection: 'row',
        flex: 1, alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 5,
        marginRight: 5
    },
    text: {
        fontSize: 18,
        color: '#4799EB'
    },
    imageView: {
        justifyContent: "flex-end",
        alignItems: 'flex-end',
        height: 16,
        width: 16,

    },
    imageContainer: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 5,
        justifyContent: "flex-end",
        alignItems: 'flex-end',
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white'
    },
    // rowImageContainer: {
    //     flex: 1,
    //     flexDirection: 'row',
    //     padding : 5,
    //     backgroundColor: 'white'
    // },
    rowText: {
        color: "black",
        fontSize: 15,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    rowTextContainter: {
        flex: 0.58,
        marginLeft: 5,
        height: 40,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    touchStyle: {
        flex: 0.42,
        alignItems: 'flex-start',
        justifyContent: 'center',
        // backgroundColor:'blue'
    },
    imageInfoContainer: {
        flex: 0.1,
        alignItems: "center",
        justifyContent: "center"
    },
    imageNextContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: 'flex-end',
        // backgroundColor:'green'
    },
    deleteView: {
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginRight: 10,
        right: 0,
        fontSize: 20,
        color: '#000000'
    },
    editView: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginLeft: 10,
        left: 0,
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#8E8E8E",
        marginLeft: 10,
        marginRight: 10
    },

    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16,
        marginLeft: 2,
    },
});