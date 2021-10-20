import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    FlatList,
    SafeAreaView, UIManager, LayoutAnimation
} from 'react-native'
import API from '../constants/ApiConstant'

import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import { EventRegister } from 'react-native-event-listeners'
import SocketConstant from '../constants/SocketConstant'
import API_PARAM from '../constants/ApiParms'
import update from 'react-addons-update'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import ComingFrom from "../constants/ComingFrom";
import Loader from '../ActivityIndicator/Loader';
import Toast, { DURATION } from 'react-native-easy-toast'
//use for actionColorPickerdata And Colorlabel Screen
export default class ColorPickerDataType extends React.PureComponent {

    //save action picker list
    _savePickerActionList = () => {
        let item = this.setDataForAddActionScreen(this.state.actionPickerNeedToSelect);
        if (this.state.comingFrom == ComingFrom.FILTER_OPTION) {

            this.setState({
                loading: true
            })

            let url = API.BASE_URL + API.API_USERS_SETTINGS_FILTERS_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID()

            //console.log("url is ", url)

            let selectedActionIdList = []

            item.selectedPickerList.forEach(element => {
                selectedActionIdList.push(element._id)
                selectedActionIdList.push(element.value)
                // actionValue:"Rad"
            });
            let body = {
                actionId: item._id,
                value: selectedActionIdList
            }
            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: 'POST',
                headers: {
                    // Accept: 'application/json',
                    // 'Content-Type': 'application/json',
                    // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    // 'userId': userId,
                },
                body: JSON.stringify(body)
            }).then((responseJson) => {
                //console.log('response===' + JSON.stringify(responseJson))
                if (responseJson.success) {
                    this.setState({
                        loading: false
                    })
                    this._showToastMessage(responseJson.message)
                    this.props.navigation.state.params.onGoBack();
                    this.props.navigation.goBack();
                } else {
                    this.setState({
                        loading: false
                    })
                    this._showToastMessage(responseJson.message)
                }


            }).catch((error) => {
                console.error(error);
            });
        } else {
            this.props.navigation.state.params.onGoBack(item, true);
            this.props.navigation.goBack();
        }

    }

    moveToPreviousScreen = () => {
        //console.log("props", this.props)
        this._removeEventListener()
        var actionPickerlist = this.state.selectedActionPicker
        // if (actionPickerlist.length > 0) {
        var item = this.setDataForAddActionScreen(actionPickerlist);
        this.props.navigation.state.params.onGoBack(item);
        // } else {
        //     this.props.navigation.state.params.onGoBack();
        // }
        this.props.navigation.goBack();

    }

    setDataForAddActionScreen(pickerList) {
        var selectedList = pickerList;
        var actionValue = '';
        for (var i = 0; i < selectedList.length; i++) {
            if (actionValue == '') {
                actionValue += (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER ? selectedList[i].value : selectedList[i].name);
            }
            else {
                actionValue += ', ' + (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER ? selectedList[i].value : selectedList[i].name);
            }
        }
        var item = {
            _id: this.state.item._id,
            dataType: this.state.item.dataType,
            selectedPickerList: pickerList,
            actionValue: actionValue
        };
        return item;
    }

    //getCloloList 
    _getColorList() {
        var userId = TeacherAssitantManager.getInstance().getUserID()
        var url = API.BASE_URL + API.API_LIST_USER_COLOR_LABELS + userId

        var headerValue =
        {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': userId,
        }
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: headerValue,
        })
            .then((responseJson) => {
                if (responseJson.success) {
                    this.state.listData = []
                    var newArray = this.state.listData;
                    var colorList = responseJson.data
                    var colorObject = {}
                    var studentListData = []
                    for (var i = 0; i < colorList.length; i++) {
                        var color = colorList[i];
                        var colorlist = this.state.actionPickerNeedToSelect
                        var index = colorlist.findIndex(picker => picker._id == color._id)
                        if (index > -1) {
                            colorObject = {
                                pickerDataId: color._id,
                                deleteVisibility: false,
                                data: color,
                                selectionVisibilty: true
                            }
                        }
                        else {
                            colorObject = {
                                pickerDataId: color._id,
                                deleteVisibility: false,
                                data: color,
                                selectionVisibilty: false
                            }
                        }
                        studentListData.push(colorObject)

                    }
                    //console.log("Student data is ", studentListData)

                    this.setState({
                        listData: [...newArray, ...studentListData],
                        isAsyncLoader: false
                    })
                } else {
                    this.setState({
                        isAsyncLoader: false
                    })
                    //this.setLoading(false)
                    this._showToastMessage(responseJson.message)
                }
                ////console.log('response===' + JSON.stringify(responseJson))

            })
            .catch((error) => {
                this.setState({
                    isAsyncLoader: false
                })
                //console.log("error===" + error)
            })



    }


    //_getListActionFieldsPickersActionField 
    _getListActionFieldsPickersActionField() {
        var url = API.BASE_URL + API.API_GET_LIST_ACTION_FIELDS_PICKER_ACTION_FIELD + this.state.item._id
        //console.log("colors url", url)
        var headerValue =
        {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        }

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: headerValue,
        })
            .then((responseJson) => {
                //console.log("colors REsponse", responseJson)
                if (responseJson.success) {
                    this.state.listData = []
                    var newArray = this.state.listData;
                    var pickerDataList = responseJson.data
                    var colorObject = {}
                    var studentListData = []
                    for (var i = 0; i < pickerDataList.length; i++) {
                        var pickerData = pickerDataList[i];
                        var pickerId = pickerData._id
                        //check if data is selected
                        //  var index = this.state.colorsIdNeedToSelect.findIndex(picker => picker._id == pickerData._id)
                        //console.log("value", this.state.actionPickerNeedToSelect)
                        var index = this.state.actionPickerNeedToSelect.findIndex(picker => picker._id == pickerId)
                        if (index > -1) {
                            colorObject = {
                                pickerDataId: pickerId,
                                deleteVisibility: false,
                                data: pickerData,
                                selectionVisibilty: true
                            }
                        }
                        else {
                            colorObject = {
                                pickerDataId: pickerId,
                                deleteVisibility: false,
                                data: pickerData,
                                selectionVisibilty: false
                            }
                        }
                        //if (pickerData.colorLabelID != null) {
                        studentListData.push(colorObject)
                        // }

                        this._updateSelectedListAndNeedToSelectPickerList(pickerId, pickerData);


                    }
                    //console.log("Student data is ", studentListData)

                    this.setState({
                        listData: [...newArray, ...studentListData],
                        isAsyncLoader: false

                    })


                    // this.setState({
                    //     listData: responseJson.data
                    // })
                    //this.setLoading(false)
                    //DeviceInfoManager.getInstance().showAlert(responseJson.message)
                    //this.moveToPreviousScreen();
                } else {
                    this.setState({
                        isAsyncLoader: false
                    })
                    this._showToastMessage(responseJson.message)
                }
                ////console.log('response===' + JSON.stringify(responseJson))

            })
            .catch((error) => {
                this.setState({
                    isAsyncLoader: false
                })
                //console.log("error===" + error)
            })
    }

    //it will help to set edit is on off
    _handleEditClick = (isaddNewPicker = false) => {
        var colorArray = this.state.listData;
        for (var i = 0; i < colorArray.length; i++) {
            var color = colorArray[i]
            color.deleteVisibility = false;
            //color.selectionVisibilty = false;
        }


        if (isaddNewPicker) {
            if (!this.state.isEditMode) {
                //this.props.navigation.state.params.isheaderRightShow = false
                this.props.navigation.setParams(
                    {
                        isheaderRightShow: false
                    }
                )
                this.setState({
                    isEditMode: true

                }, function () {
                    this.collapseElement()
                })

            } else {
                this.setState({
                    isEditMode: false
                }, function () {
                    this.expandElement()
                })
                this.props.navigation.setParams(
                    {
                        isheaderRightShow: true
                    }
                )

            }
        }

    }

    //_setVisiblityOfItem
    _setVisiblityOfItem = (item, index) => {
        if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER) { //ACTION_COLORPICKER
            if (this.state.isEditMode) {
                let posts = this.state.listData.slice();
                let targetPost = posts[index];
                if (targetPost.deleteVisibility) {
                    var indexNeedToDelete = this.state.actionPickerNeedToDelete.indexOf(targetPost.pickerDataId)
                    this.state.actionPickerNeedToDelete.splice(indexNeedToDelete, 1);
                }
                else {
                    this.state.actionPickerNeedToDelete.push(targetPost.pickerDataId)
                }
                targetPost.deleteVisibility = !targetPost.deleteVisibility;
                this.setState({ posts });
            }
            else {

                let posts = this.state.listData.slice();
                let targetPost = posts[index];
                if (targetPost.selectionVisibilty) {
                    var indexNeedToDelete = this.state.actionPickerNeedToSelect.findIndex(picker => picker._id == targetPost.pickerDataId)
                    if (indexNeedToDelete > -1) {
                        this.state.actionPickerNeedToSelect.splice(indexNeedToDelete, 1);
                    }

                }
                else {
                    this.state.actionPickerNeedToSelect.push(targetPost.data)
                }
                targetPost.selectionVisibilty = !targetPost.selectionVisibilty;
                this.setState({ posts });

            }
        } else {//colorPickerdataTyep

            let posts = this.state.listData.slice();
            let targetPost = posts[index];
            if (targetPost.selectionVisibilty) {
                var indexNeedToDelete = this.state.actionPickerNeedToSelect.findIndex(picker => picker._id == targetPost.data._id)
                if (indexNeedToDelete > -1) {
                    this.state.actionPickerNeedToSelect.splice(indexNeedToDelete, 1);
                }

            }
            else {
                this.state.actionPickerNeedToSelect.push(targetPost.data)
            }
            targetPost.selectionVisibilty = !targetPost.selectionVisibilty;
            this.setState({ posts });

            // }

        }


    }

    _updateSelectedListAndNeedToSelectPickerList(pickerId, pickerData) {
        var index = this.state.actionPickerNeedToSelect.findIndex(pickerObject => pickerObject._id === pickerId);
        if (index > -1) {
            //console.log('this.state.colorsIdNeedToSelect[index]');
            //console.log(this.state.actionPickerNeedToSelect[index]);
            this.state.actionPickerNeedToSelect[index] = pickerData;
        }
        index = this.state.selectedActionPicker.findIndex(pickerObject => pickerObject._id === pickerId);
        if (index > -1) {
            //console.log('this.state.colorsIdNeedToSelect[index]');
            //console.log(this.state.selectedActionPicker[index]);
            // pickerAction = this.state.colorsIdNeedToSelect[index];
            this.state.selectedActionPicker[index] = pickerData;
        }
        return index;
    }

    // _gotoAddColorScreen
    _gotoAddColorScreen(item) {
        //const { state, navigate } = this.props.navigation;
        const { state, navigate } = this.props.navigation;

        // if(!isUpdate){
        //     navigate("AddColorLabels", { screen: "Color Label", onGoBack: this.refresh, headerRight: "Save", userId: this.props.navigation.state.params.userId })

        // }else{
        navigate("AddColorLabels", {
            screen: "Color Label",
            color: item,
            headerRight: "Update",
            userId: this.props.navigation.state.params.userId,
            onGoBack: () => this.refresh()
        });
        // }



    }

    //_onDeleteCutomizeColors
    _onDeleteCutomizeColors() {
        if (this.state.actionPickerNeedToDelete.length > 0) {
            this._hitApiToDeleteColors()

        } else {
            this._showToastMessage('Nothing to delete')
        }
    }

    _hitApiToDeleteColors = () => {
        //console.log("UserId", this.props.navigation.state.params.userId)
        var userId = TeacherAssitantManager.getInstance().getUserID();
        // this.setLoading(true);
        this.setState({
            isLoaderShown: true
        })
        var deviceID = TeacherAssitantManager.getInstance().getDeviceID();
        var url = API.BASE_URL + API.API_SAVE_ACTION_FIELD_PICKER + API.API_BULK_DELETE_CLASS

        //console.log("url is", url)
        //console.log("selected color list", this.state.actionPickerNeedToDelete)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'POST',
            headers: {
                'clientid': deviceID + userId,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'userId': userId
            },
            body: JSON.stringify({
                _id: this.state.actionPickerNeedToDelete
            })
        })
            .then((responseJson) => {

                //console.log('response===' + JSON.stringify(responseJson))
                if (responseJson.success) {
                    this._updateListAfterDeletingColors(this.state.actionPickerNeedToDelete)
                } else {
                    // this.setLoading(false);
                    // this.setState({
                    //     isLoaderShown: false
                    // })

                }
                this._showToastMessage(responseJson.message)
            })
            .catch((error) => {
                this.setLoading(false);
                this.setState({
                    isLoaderShown: false
                })
                //console.log("error===" + error)
            })



    }
    _updateListAfterDeletingColors = (colorList) => {
        var deletedStudents = 0;

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            //console.log(colorList)
            var array = [...this.state.listData];

            for (var i = 0; i < colorList.length; i++) {
                //console.log('for studentList')
                //console.log(colorList[i])

                var index = array.findIndex(pickerObject => pickerObject.pickerDataId == colorList[i]);
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

    _moveToNexScreen = (pickerdata, isupdate = false) => {

        //this._handleEditClick(isupdate);
        this.props.navigation.setParams(
            {
                isheaderRightShow: true
            }
        )
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("AddPickerActionValue", {
            onGoBack: () => this.refresh(), userId: this.state.userId, isheaderRightShow: true,
            headerRight: !isupdate ? "Save" : "Update", screenTitle: this.state.item.singular,
            item: this.state.item, //add actions screem data
            pickerdata: pickerdata, leftHeader: BreadCrumbConstant.CANCEL
        })

        // navigate("AddPickerActionValue", {
        //     onGoBack: () => this.refresh(), userId: this.state.userId, isheaderRightShow: true,
        //     headerRight: !isupdate ? "Save" : "Update", screenTitle: this.props.navigation.state.params.screenTitle,
        //     item: this.state.item, //add actions screem data
        //     pickerdata: pickerdata, leftHeader: BreadCrumbConstant.CANCEL
        // })

    }



    // event listener for socket
    _addEventListener = () => {
        if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER) {
            this.addPickerActionListener = EventRegister.addEventListener(SocketConstant.ON_ADD_ACTION_FIELD_PICKER, (data) => {
                //console.log("Add action Picker", data)
                this._addDataToPickerActionData(data)
            })

            this.removePickerActionListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_ACTION_FIELD_PICKER_BULK, (data) => {
                //console.log("Delete action Picker", data)
                this._removePickerTypeData(data)
            })

            this.updatePickerActionListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_ACTION_FIELD_PICKER, (data) => {
                //console.log("Update action Picker", data)
                this._updatePickerTypeData(data)
            })
        } else {

            this.addColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_ADD_COLOR_LABEL, (data) => {
                //console.log("addColorLabelListener", data)
                this._addDataToColorLabel(data)
            })

            this.removeColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_COLOR_LABEL_BULK, (data) => {
                //console.log('removeStudentListener');
                this._removeColorLabel(data)
            })

            this.updateColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_COLOR_LABEL, (data) => {
                //console.log('UpdateStudentListener');
                this._updateColorLabel(data)
            })
        }

        this.onSettingsDeleteAll = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
            //console.log('removeSharedStudentLister');

            this._onSettingsDeleteAll(data);


        })

    }
    //help to remove Listner
    _removeEventListener = () => {
        if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER) {
            //actionColorPicker dataType
            if (EventRegister.removeEventListener(this.addPickerActionListener)) {
                if (EventRegister.removeEventListener(this.removePickerActionListener)) {
                    if (EventRegister.removeEventListener(this.updatePickerActionListener)) {

                    }
                }
            }
            // EventRegister.removeEventListener(this.removePickerActionListener)
            // EventRegister.removeEventListener(this.updatePickerActionListener)
        }
        else {
            //ColorPickerDataType
            EventRegister.removeEventListener(this.addColorLabelListener)
            EventRegister.removeEventListener(this.removeColorLabelListener)
            EventRegister.removeEventListener(this.updateColorLabelListener)
        }
        EventRegister.removeEventListener(this.onSettingsDeleteAll)


    }

    //add data to student
    _addDataToPickerActionData = (picker) => {

        //console.log('_addDataToStudent==' + picker)
        //console.log(picker)
        var index = this.state.listData.findIndex(pickerObject => pickerObject.pickerDataId === picker._id);
        //console.log('index');
        //console.log(index);
        if (index == -1) {
            this.state.listData.push({
                pickerDataId: picker._id,
                deleteVisibility: false,
                data: picker,
                selectionVisibilty: false
            })
            this.setState({
                listData: this.state.listData
            })
        }

    }

    //remove student data
    _removePickerTypeData = (pickerList) => {
        var deletedStudents = 0;

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            //console.log(pickerList._id)
            var array = [...this.state.listData];
            var actionPickerNeedToSelectList = [...this.state.actionPickerNeedToSelect];
            var selectedActionPickerList = [...this.state.selectedActionPicker]

            for (var i = 0; i < pickerList._id.length; i++) {
                //console.log('for studentList')
                var pickerId = pickerList._id[i]
                //console.log(pickerId)

                var index = array.findIndex(pickerObject => pickerObject.pickerDataId == pickerId);
                //console.log('index' + index)

                if (index > -1) {
                    array.splice(index, 1);
                }
                index = actionPickerNeedToSelectList.findIndex(pickerObject => pickerObject._id === pickerId);
                if (index > -1) {
                    actionPickerNeedToSelectList.splice(index, 1)
                }

                index = selectedActionPickerList.findIndex(pickerObject => pickerObject._id === pickerId);
                if (index > -1) {
                    selectedActionPickerList.splice(index, 1)
                }

            }

            this.setState({
                listData: array,
                colorsIdNeedToDelete: [],
                actionPickerNeedToSelect: actionPickerNeedToSelectList,
                selectedActionPicker: selectedActionPickerList,
            })
        }


    }


    _onSettingsDeleteAll(data) {
        if (data.clearData) {
            // this.state = {
            //     isAsyncLoader: true,
            //     loading: false
            // }
            this.setState({
                isAsyncLoader: true,
                loading: false
            },  () =>{
                this.getApiData();
            });
        }
    }

    _updatePickerTypeData(picker) {

        if (this.state.listData.length > 0) {
            //console.log('_UpdateStudentData');

            //console.log(picker);

            var index = this.state.listData.findIndex(pickerObject => pickerObject.pickerDataId === picker._id);
            //console.log('index');
            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(this.state.listData[index]);
                var pickerAction = this.state.listData[index];
                pickerAction.data = picker
                const updatedPickerActions = update(this.state.listData, { $splice: [[index, pickerAction.data]] });  // array.splice(start, deleteCount, item1)
                this.setState({ listData: updatedPickerActions });

                //if (this.state.actionPickerNeedToSelect.length > 0) {

                this._updateSelectedListAndNeedToSelectPickerList(picker._id, picker)


            }
        }

    }


    //_addDataToColorLabel
    _addDataToColorLabel = (color) => {
        var listDataObject = {}
        listDataObject = {
            // colorId: color._id,
            // visibility: false,
            // data: color

            pickerDataId: color._id,
            deleteVisibility: false,
            data: color,
            selectionVisibilty: false
        }
        this.state.listData.push(listDataObject)
        this.setState({
            listData: this.state.listData
        })


    }

    //_removeColorLabel
    _removeColorLabel = (colorsIdList) => {

        if (this.state.listData.length > 0) {

            //console.log('_removeColorLabel')
            //console.log(colorsIdList._id)
            var array = [...this.state.listData];

            for (var i = 0; i < colorsIdList._id.length; i++) {
                //console.log('forloop _removeColorLabel')
                //console.log(colorsIdList._id[i])

                var index = array.findIndex(ColorObject => ColorObject.pickerDataId == colorsIdList._id[i]);
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

    //_updateColorLabel
    _updateColorLabel(color) {

        if (this.state.listData.length > 0) {
            //console.log('_UpdateStudentData');

            //console.log(color);
            var array = this.state.listData

            var index = array.findIndex(colorObject => colorObject.pickerDataId == color._id);
            //console.log('index');
            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(this.state.listData[index]);
                var _color = this.state.listData[index];
                _color.data = color
                const updatedColorLabels = update(this.state.listData, { $splice: [[index, color.data]] });  // array.splice(start, deleteCount, item1)
                this.setState({ listData: updatedColorLabels });

            }
        }

    }

    constructor(props) {
        super(props)
        var stateParams = this.props.navigation.state.params
        var actionPickerNeedToSelect = JSON.parse(JSON.stringify(stateParams.item.selectedPickerList))
        var jsonStringfySelectedArray = JSON.parse(JSON.stringify(stateParams.item.selectedPickerList))
        this.state = {
            listData: [],
            userId: stateParams.userId,
            isEditMode: false,
            actionPickerNeedToDelete: [],
            actionPickerNeedToSelect: actionPickerNeedToSelect,
            selectedActionPicker: jsonStringfySelectedArray,//create deep copy
            item: stateParams.item.data,
            isAsyncLoader: true,
            animatedStyle: styles.rowTextContainter,
            isHideBottomView: stateParams.isHideBottomView,
            comingFrom: stateParams.comingFrom,
            loading: false
        }



        // this.selectedActionPicker = []
        // this.selectedActionPicker = stateParams.item.selectedPickerList

        //console.log("colorsIdNeedToSelect", this.state.actionPickerNeedToSelect)
    }


    //define header (navigation Bar)
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var title = params.screenTitle
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
        return {
            //title:`${navigation.state.param.title}`,
            title: '' + ` ${title}`,
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.goToBackScreeen()}>
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
                navigation.state.params.isheaderRightShow
                    ?
                    <TouchableOpacity
                        onPress={() => params.onAdd()}>
                        <Text style={StyleTeacherApp.headerRightButtonText}>
                            {navigation.state.params.headerRight}
                        </Text>
                    </TouchableOpacity> : <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
                    </View>
            

        }
    }

    getApiData() {
        if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER) {
            this._getListActionFieldsPickersActionField();
        }
        else {
            this._getColorList();
        }
        this._addEventListener();
    }

    refresh = () => {
        this.setState({
            isAsyncLoader: true,
            isEditMode: false
        })
        this.getApiData();
    }

    //easeInEaseOut animation Methods
    expandElement = () => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            animatedStyle: styles.rowTextContainter
        })
    }
    collapseElement = () => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            animatedStyle: styles.editRowTextContainter
        })
    }



    componentDidMount() {

        this.getApiData();
        this.props.navigation.setParams({
            onAdd: this._savePickerActionList,
            goToBackScreeen: this.moveToPreviousScreen
        })
    }

    _renderItem = ({ item, index }) => {
        var data = item.data
        var colorObject = {}
        var colorPreview = ''
        var value = ''
        var point = ''
        if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER) {
            value = data.value
            if (item.data.colorLabelID != null) {
                colorObject = item.data.colorLabelID
                colorPreview = TeacherAssitantManager.getInstance()._rgbToHex(colorObject.red, colorObject.green, colorObject.blue)
                point = colorObject.point
            }

        } else {
            data = item.data
            colorPreview = TeacherAssitantManager.getInstance()._rgbToHex(data.red, data.green, data.blue)
            value = data.name
            point = data.point
        }



        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._setVisiblityOfItem(item, index)} >
                    <View style={styles.rowContainer}>
                        {
                            this.state.isEditMode ?
                                <View style={styles.iconImageContainer}>
                                    {
                                        item.deleteVisibility ?
                                            <Image style={styles.iconImage}
                                                name="search"
                                                source={require("../img/check_icon.png")} /> : null
                                    }
                                </View>
                                : null
                        }
                        <View style={this.state.animatedStyle}>
                            <View style={{ backgroundColor: colorPreview, width: 40, height: 40, }}>
                            </View>
                            <View style={styles.rowText}>
                                <Text numberOfLines={1} style={styles.rowItemActionPickerText}>
                                    {`${value}`}
                                </Text>
                                <Text numberOfLines={1} style={styles.rowItemActionPickerText}>
                                    {`${point}`}
                                </Text>
                            </View>
                        </View>
                        {
                            this.state.isEditMode ?
                                <TouchableOpacity style={styles.touchStyle}
                                    onPress={() => this._moveToNexScreen(data, true)}>
                                    <View style={styles.infoIconImageContainer}>
                                        <Image style={styles.imageView}
                                            source={require('../img/icon_info.png')}>
                                        </Image>

                                    </View>
                                    <View style={styles.iconImageContainer}>
                                        <Image style={styles.imageView}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>

                                </TouchableOpacity>
                                : <View style={styles.iconImageContainer}>
                                    {
                                        item.selectionVisibilty ?
                                            <Image style={styles.iconImage}
                                                name="search"
                                                source={require("../img/check_icon.png")} />
                                            : null
                                    }
                                </View>
                        }


                    </View>
                </TouchableOpacity>
            </View>



        );
    };

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }


    //render the whle ui
    render() {
        const { listData, isFetchingFromServer, isHideBottomView, isAsyncLoader } = this.state
        return (
            <SafeAreaView style={styles.container}>
                <SyncingLoader isAsyncLoader={isAsyncLoader} textmessage={TextMessage.Loading} />
                <Loader loading={this.state.loading} />
                <Toast ref={o => this.toast = o}
                    position={'bottom'}
                    positionValue={200}
                />

                <View style={this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER && !isHideBottomView ?
                    styles.headerContainerForCustomizeColorLabel : styles.headerContainerForColorLabel}>

                    <FlatList
                        style={styles.list}
                        data={this.state.listData}
                        extraData={this.state.listData}
                        renderItem={this._renderItem}
                        keyExtractor={(item, index) => `${index}`}
                        ItemSeparatorComponent={(sectionId, rowId) => (
                            <View key={rowId} style={styles.separator} />
                        )}
                    // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(listData)}
                    // onEndReached={this.loadMoreColorLables}
                    // ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={isFetchingFromServer} />}
                    />
                </View>
                {
                    this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER && !isHideBottomView ?
                        <View style={styles.bottomViewSeprator}
                        /> : null
                }
                {
                    this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER && !isHideBottomView ?
                        <View style={styles.bottomOuterView}>
                            <View style={styles.bottomInnerView}>
                                <TouchableOpacity onPress={() => this._handleEditClick(true)}>
                                    <Text style={styles.text}>{!this.state.isEditMode ? "Edit" : "Done"}</Text>
                                </TouchableOpacity>
                                {
                                    this.state.isEditMode ?
                                        <TouchableOpacity
                                            onPress={() => this._onDeleteCutomizeColors()}>
                                            <Text style={styles.text}>Delete</Text>
                                        </TouchableOpacity> :
                                        <TouchableOpacity
                                            onPress={() => this._moveToNexScreen({ value: '' })}>
                                            <Image style={styles.imageViewHeader}
                                                source={require('../img/icon_add.png')}>
                                            </Image>
                                        </TouchableOpacity>



                                }
                            </View>
                        </View> : null
                }


            </SafeAreaView>



        )
    }



}
const styles = StyleSheet.create({
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    container: {
        flex: 1,

    },
    list: {
        backgroundColor: 'white',
    },
    bottomOuterView: {
        flex: 0.08,
        backgroundColor: 'white'
    },
    bottomInnerView: {
        flexDirection: 'row',
        flex: 1, alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 10,
        marginRight: 10
    },
    text: {
        fontSize: 18,
        color: '#4799EB'
    },
    imageView: {
        alignItems: 'center',
        width: 32,
        height: 32,
        alignSelf: "center"
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 5,
        margin: 12,
        // backgroundColor: 'white'
    },
    rowTextContainter: {
        flex: 0.8,
        flexDirection: 'row'
    },
    editRowTextContainter: {
        flex: 0.7,
        flexDirection: 'row'
    },
    rowText: {
        // color: "black",
        fontSize: 15,
        marginLeft: 10,
        flex: 1,
        //alignItems: 'center',
        justifyContent: "center",
        // backgroundColor : 'red'
    },
    touchStyle: {
        flex: 0.2,
        //alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        flexDirection: 'row',
        // backgroundColor:'green'

    },
    imageContainer: {
        flex: 0.1,
        alignItems: "center",
        justifyContent: "center"
    },
    imageInfoContainer: {
        flex: 0.1,
        alignItems: "center",
        justifyContent: "center"
    },
    imageView: {
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16
    },
    imageNextContainer: {
        flex: 0.1,
        //alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
    },
    headerRightButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    headerRightButtonText: {
        flex: 1,
        flexDirection: 'row',
        color: '#0E72F1',
        fontSize: 16,
        marginRight: 10,
        marginLeft: 10,
        justifyContent: 'center',
    },
    headerContainerForCustomizeColorLabel: { flex: 0.918 },
    headerContainerForColorLabel: { flex: 1 },



    bottomViewSeprator:
        { flex: 0.002, backgroundColor: 'gray' },

    iconImageContainer: {
        flex: 0.2, justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        height: 16,
        width: 16,

    },
    infoIconImageContainer: {
        fontSize: 15,
        marginLeft: 15,
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center",
    },
    // arrowIconImageContainer: { justifyContent: 'center', alignItems: "center", flex: 0.2 },
    rowItemActionPickerText: { height: '60%', justifyContent: 'center', }
});