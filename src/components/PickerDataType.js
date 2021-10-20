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
import update from 'react-addons-update'
import SocketConstant from '../constants/SocketConstant'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import ComingFrom from "../constants/ComingFrom";
import Loader from '../ActivityIndicator/Loader';
import Toast, { DURATION } from 'react-native-easy-toast'

export default class PickerDataType extends React.PureComponent {
    constructor(props) {
        super(props)
        var stateParams = this.props.navigation.state.params
        //console.log("data is", stateParams.item.selectedPickerList)
        var actionPickerNeedToSelect = JSON.parse(JSON.stringify(stateParams.item.selectedPickerList))
        var selectedActionPicker = JSON.parse(JSON.stringify(stateParams.item.selectedPickerList))

        this.state = {
            listData: [],
            userId: stateParams.userId,
            isEditMode: false,
            actionPickerNeedToDelete: [],
            actionPickerNeedToSelect: actionPickerNeedToSelect,
            selectedActionPicker: selectedActionPicker,
            item: stateParams.item.data, //add actions screen data,
            isAsyncLoader: true,
            animatedStyle: styles.rowTextContainter,
            isFetchingFromServer: false,
            totalPickers: 0,
            isHideBottomView: stateParams.isHideBottomView,
            comingFrom: stateParams.comingFrom,
            loading: false

        }
    }

 
    componentDidMount() {
        this._getListActionFieldsPickersActionField(true)

        this.props.navigation.setParams({
            onAdd: this._savePickerActionList,
            gotoBack: this.moveToPreviousScreen
        })

        this.refreshScreen()
        // this._sub = this.props.navigation.addListener(
        //     'didFocus',
        //     this.refreshScreen
        // );
    }

    //save action picker list
    _savePickerActionList = () => {
        let item = this.setDataForAddActionScreen(this.state.actionPickerNeedToSelect)
        if (this.state.comingFrom == ComingFrom.FILTER_OPTION) {

            this.setState({
                loading: true
            })

            let url = API.BASE_URL + API.API_USERS_SETTINGS_FILTERS_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID()

            //console.log("url is ", url)

            let selectedActionIdList = []

            item.selectedPickerList.forEach(element => {
                selectedActionIdList.push(element._id)
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

        // const { state, navigate } = this.props.navigation;
        // navigate("AddColorLabels", { screen: "Color Label", onGoBack: this.refresh, headerRight: "Save", userId: this.props.navigation.state.params.userId ,item:this.props.navigation.state.params.item})

    }

    //refesh the screen when we come back to this screen
    refresh = () => {
        this.setState({
            isEditMode: false
        })
        this.props.navigation.setParams(
            {
                isheaderRightShow: true
            }
        )
        this._getListActionFieldsPickersActionField(true)

    }


    moveToPreviousScreen = () => {
        this._removeEventListener()
        this.props.navigation.state.params.onGoBack(this.setDataForAddActionScreen(this.state.selectedActionPicker));
        this.props.navigation.goBack();
    }

    setDataForAddActionScreen(pickerList) {
        var selectedList = pickerList;
        var actionValue = '';
        for (var i = 0; i < selectedList.length; i++) {
            if (actionValue == '') {
                actionValue += selectedList[i].value
            } else {
                actionValue += ',' + selectedList[i].value
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
    _getListActionFieldsPickersActionField(isFirstTime = false) {
        var userId = TeacherAssitantManager.getInstance().getUserID();
        var url = API.BASE_URL + API.API_GET_LIST_ACTION_FIELDS_PICKER_ACTION_FIELD + this.state.item._id
        var headerValue =
        {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        }

        //console.log("picker data url is", url)

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: headerValue,
        })
            .then((responseJson) => {
                if (responseJson.success) {
                    this.state.listData = []
                    var newArray = this.state.listData;
                    var pickerDataList = responseJson.data
                    var colorObject = {}
                    var studentListData = []
                    for (var i = 0; i < pickerDataList.length; i++) {
                        var pickerData = pickerDataList[i];

                        //check if data is selected
                        var index = this.state.actionPickerNeedToSelect.findIndex(picker => picker._id == pickerData._id)

                        if (index > -1) {
                            colorObject = {
                                pickerDataId: pickerData._id,
                                deleteVisibility: false,
                                data: pickerData,
                                selectionVisibilty: true
                            }
                        }
                        else {
                            colorObject = {
                                pickerDataId: pickerData._id,
                                deleteVisibility: false,
                                data: pickerData,
                                selectionVisibilty: false
                            }
                        }
                        studentListData.push(colorObject)

                        this._updateSelectedListAndNeedToSelectPickerList(pickerData._id, pickerData);

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
                    this._showToastMessage(responseJson.message)
                }

                if (isFirstTime) {
                    this._addEventListener()
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
                    this.collapseElement();
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
            //console.log("ListData", this.state.actionPickerNeedToDelete)
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
    }


    //will move to AddPickerActionValue screen
    _moveToNexScreen = (pickerdata, isupdate = false) => {

        //this._handleEditClick(isupdate);
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("AddPickerActionValue", {
            onGoBack: () => this.refresh(), userId: this.state.userId, isheaderRightShow: true,
            headerRight: !isupdate ? "Save" : "Update", screenTitle: this.state.item.singular,
            item: this.state.item, leftHeader: BreadCrumbConstant.CANCEL,
            pickerdata: pickerdata
        })

    }


    refreshScreen = () => {
        this.setState({  listData: [],isAsyncLoader: true}, function () {
            this._getListActionFieldsPickersActionField(true)
            // this.getClassData();
        })
    }

    //delete selected picker from the back end
    _onDeletePickers = () => {

        //console.log("UserId", this.props.navigation.state.params.userId)
        if (this.state.actionPickerNeedToDelete.length > 0) {

            //console.log("arrayListNeed to Delete" + JSON.stringify(this.state.actionPickerNeedToDelete))
            this.setState({
                isLoaderShown: true
            })
            TeacherAssitantManager.getInstance()._serviceMethod(API.BASE_URL + API.API_SAVE_ACTION_FIELD_PICKER + API.API_BULK_DELETE_CLASS, {
                method: 'POST',
                headers: {

                    // Accept: 'application/json',
                    // 'Content-Type': 'application/json',
                    // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    // 'userId': TeacherAssitantManager.getInstance().getUserID(),
                },
                body: JSON.stringify({
                    _id: this.state.actionPickerNeedToDelete
                })
            })
                .then((responseJson) => {

                    //console.log('response===' + JSON.stringify(responseJson))
                    if (responseJson.success) {
                        this.setLoading(false);
                        // this.setState({
                        //     isLoaderShown: false
                        // })
                        this.refreshScreen()

                        //  this._updateListAfterDelete()
                    } else {
                        this.setLoading(false);
                        this.setState({
                            isLoaderShown: false
                        })

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
        } else {

            this._showToastMessage('Please select atleast one item to delete.')
            // this.showAlert('Please select Student to delete.')
        }



    }
    _updateListAfterDelete = () => {
        // var deletedStudents=0;

        if (this.state.listData.length > 0) {

            var array = [...this.state.listData];

            for (var i = 0; i < this.state.actionPickerNeedToDelete.length; i++) {
                //console.log('for studentList')
                //console.log(this.state.actionPickerNeedToDelete[i])

                var index = array.findIndex(actionObject => actionObject.data._id == this.state.actionPickerNeedToDelete[i]);
                //console.log('index' + index)

                if (index > -1) {
                    array.splice(index, 1);
                }
            }


            this.setLoading(false);
            this.setState({
                listData: array,
                actionPickerNeedToDelete: [],
            })
        }

    }
    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }


    // event listener for socket
    _addEventListener = () => {
        this.addPickerActionListener = EventRegister.addEventListener(SocketConstant.ON_ADD_ACTION_FIELD_PICKER, (data) => {
            this._addDataToPickerActionData(data)
        })

        this.removePickerActionListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_ACTION_FIELD_PICKER_BULK, (data) => {
            //console.log('removeStudentListener');
            this._removePickerTypeData(data)
        })

        this.updatePickerActionListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_ACTION_FIELD_PICKER, (data) => {
            //console.log('UpdateStudentListener');
            this._updatePickerTypeData(data)
        })

        this.onSettingsDeleteAll = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
            //console.log('removeSharedStudentLister');
            this._onSettingsDeleteAll(data);
                })
    }

    //help to remove Listner
    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addPickerActionListener)
        EventRegister.removeEventListener(this.removePickerActionListener)
        EventRegister.removeEventListener(this.updatePickerActionListener)
        EventRegister.removeEventListener(this.onSettingsDeleteAll)
    }

    //add data to student
    _addDataToPickerActionData = (picker) => {

        //console.log('_addDataToStudent==' + picker)
        //console.log(picker)
        if (this.state.item._id == picker.actionFieldID) {
            var index = this.state.listData.findIndex(pickerObject => pickerObject.data._id === picker._id);
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




    }

    //remove student data
    _removePickerTypeData = (pickerList) => {
        //console.log("arrayListNeed to Delete" + JSON.stringify(pickerList))
        var deletedStudents = 0;

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            // //console.log(pickerList[i])
            var array = [...this.state.listData];
            var actionPickerNeedToSelectList = [...this.state.actionPickerNeedToSelect];
            var selectedActionPickerList = [...this.state.selectedActionPicker]

            for (var i = 0; i < pickerList._id.length; i++) {
                //console.log('for studentList')
                // //console.log(pickerList[i])
                var pickerId = pickerList._id[i]
                //console.log(pickerId)
                var index = array.findIndex(pickerObject => pickerObject.data._id == pickerId);
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
                actionPickerNeedToDelete: [],
                actionPickerNeedToSelect: actionPickerNeedToSelectList,
                selectedActionPicker: selectedActionPickerList,
            })
        }


    }


    _onSettingsDeleteAll(data) {
        if (data.clearData) {
            this.setState({
                isAsyncLoader: true,
                loading: false
            }, function () {
                this._getListActionFieldsPickersActionField(true);
            });
        }
    }

    _updatePickerTypeData(picker) {
        if (this.state.item._id == picker.actionFieldID) {
            if (this.state.listData.length > 0) {
                //console.log('_UpdateStudentData');

                //console.log(picker);

                var index = this.state.listData.findIndex(pickerObject => pickerObject.data._id === picker._id);
                //console.log('index');
                //console.log(index);
                if (index > -1) {
                    //console.log('this.state.listData[index]');
                    //console.log(this.state.listData[index]);
                    var pickerAction = this.state.listData[index];
                    pickerAction.data = picker
                    const updatedPickerActions = update(this.state.listData, { $splice: [[index, pickerAction.data]] });  // array.splice(start, deleteCount, item1)
                    this.setState({ listData: updatedPickerActions });

                    this._updateSelectedListAndNeedToSelectPickerList(picker._id, picker)

                    // var index = this.state.actionPickerNeedToSelect.findIndex(pickerObject => pickerObject._id === picker._id);
                    // if (index > -1) {
                    //     //console.log('this.state.colorsIdNeedToSelect[index]');
                    //     //console.log(this.state.actionPickerNeedToSelect[index]);
                    //     // pickerAction = this.state.colorsIdNeedToSelect[index];
                    //     this.state.actionPickerNeedToSelect[index] = picker

                    // }

                    // index = this.state.selectedActionPicker.findIndex(pickerObject => pickerObject._id === picker._id);
                    // if (index > -1) {
                    //     //console.log('this.state.colorsIdNeedToSelect[index]');
                    //     //console.log(this.state.selectedActionPicker[index]);
                    //     // pickerAction = this.state.colorsIdNeedToSelect[index];
                    //     this.state.selectedActionPicker[index] = picker


                    // }

                }
            }
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
    loadMorePickers() {
        //       const { listData, totalPickers, isFetchingFromServer } = this.state
        // if (listData.length < totalPickers && !isFetchingFromServer) {

        //   this.setState({ isFetchingFromServer: true }, function () {
        //     this._getDateRangeList()
        //     //console.log('loadMoreStudents')
        //   })


        // }
    }

    //define header (navigation Bar)
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var title = params.screenTitle
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: '' + ` ${title}`,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.gotoBack()}>{
                    <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.width60Per,
                    StyleTeacherApp.marginLeft14,]}>
                        {/* <Image
              style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
              source={Platform.OS === "android" ? require("../img/back_arrow_android.png") : require("../img/back_arrow_ios.png")} /> */}
                        <Image
                            style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
                            source={require("../img/back_arrow_ios.png")} />
                        <Text style={[StyleTeacherApp.headerLeftButtonText]} numberOfLines={1}>{params.leftHeader}</Text>
                    </View>
                }
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
                    </TouchableOpacity> :
                    <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
                    </View>
            

        }
    }

    _renderItem = ({ item, index }) => {
        var data = item.data

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
                        <View style={this.state.isEditMode ? styles.editRowTextContainter : styles.rowTextContainter}>
                            <View style={styles.rowText}>
                                <Text numberOfLines={1} style={styles.rowItemActionPickerText}>
                                    {`${data.value}`}
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
        const { listData, isFetchingFromServer, isHideBottomView } = this.state
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <Loader loading={this.state.loading} />
                    <View style={!isHideBottomView ? { flex: 0.918 } : { flex: 1 }}>
                        <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
                        <FlatList
                            style={styles.list}
                            data={this.state.listData}
                            extraData={this.state.listData}
                            renderItem={this._renderItem}
                            keyExtractor={(item, index) => `${index}`}
                            ItemSeparatorComponent={(sectionId, rowId) => (
                                <View key={rowId} style={styles.separator} />
                            )}
                            onEndReachedThreshold={0.8}
                            // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(listData)}
                            onEndReached={this.loadMorePickers}
                            ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={isFetchingFromServer} />}
                        />
                    </View>
                    {
                        !isHideBottomView ?
                            <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                            /> : null
                    }
                    {
                        !isHideBottomView ?
                            <View style={styles.bottomOuterView}>
                                <View style={styles.bottomInnerView}>
                                    <TouchableOpacity onPress={() => this._handleEditClick(true)}>
                                        <Text style={styles.text}>{!this.state.isEditMode ? "Edit" : "Done"}</Text>
                                    </TouchableOpacity>
                                    {
                                        this.state.isEditMode
                                            ?
                                            <TouchableOpacity
                                                onPress={() => this._onDeletePickers()}>
                                                <Text style={styles.text}>Delete</Text>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity
                                                onPress={() => this._moveToNexScreen({ value: '' })}>
                                                <Image style={styles.imageViewHeader}
                                                    source={require('../img/icon_add.png')}>
                                                </Image>
                                            </TouchableOpacity>



                                    }
                                </View>
                            </View>
                            : null
                    }
                </View>
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
        color: "black",
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
        // fontSize: 15,
        marginLeft: 15,
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center",
    },
    //arrowIconImageContainer: { justifyContent: 'center', alignItems: "center", flex: 0.2 },
    rowItemActionPickerText: { flex: 1, justifyContent: 'center', marginTop: 2 }
});