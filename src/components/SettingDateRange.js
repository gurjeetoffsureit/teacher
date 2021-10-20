
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
import AppConstant from '../constants/AppConstant'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import moment from 'moment'
import Toast, { DURATION } from 'react-native-easy-toast'

export default class SettingDateRange extends React.PureComponent {

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    constructor(props) {
        super(props)
        var previousScreenData = this.props.navigation.state.params
        this.state = {
            listData: [this._getAllDateObject()],
            isEditMode: false,
            dateRangeNeedToDelete: [],
            isAsyncLoader: true,
            animatedStyle: styles.rowTextContainter,
            totalDateRange: 0,
            isFetchingFromServer: false,
            settingId: previousScreenData.settingId,
            page: 1,
        }


    }

    componentDidMount() {
        this._getDateRangeList()
        this._addEventListener()
        this.props.navigation.setParams({
            onRightHeaderClick: this._moveToNexScreen,
            gotoBack: this.moveToPreviousScreen
        });

        this.refreshScreen()

        // this._sub = this.props.navigation.addListener(
        //     'didFocus',
        //     this.refreshScreen
        // );
    }


    refreshScreen = () => {
    
        this.setState({ page: 1 }, function () {
        //   this.hitApiToGetStudentsList();
    
        })
      }
    //save action picker list
    onRightHeaderClick = () => {

        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    //refesh the screen when we come back to this screen
    refresh = () => {

        this.setState({
            listData: [this._getAllDateObject()],
            isEditMode: false,
            dateRangeNeedToDelete: [],
            isAsyncLoader: false,
            totalDateRange: 0,
            page: 1
        }, function () {
            this.expandElement()
            this._getDateRangeList();
            this._addEventListener()
        })
    }


    moveToPreviousScreen = () => {

        this._removeEventListener()
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    _getAllDateObject() {
        return {
            data: {
                _id: "000000000000000",
                name: "All " + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_DATE, 2),
                selected: false,
            }, selectionVisibilty: true
        };
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



    //getDateRangeList 
    _getDateRangeList() {
        //var userId = TeacherAssitantManager.getInstance().getUserID();
        //http://192.168.88.39:4000/dateranges/createdby/5b7e7f6829143b23102bd3db/pagination/1/10
        var url = API.BASE_URL + API.API_DATE_RANGES_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID() +
            API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;

        //console.log("picker data url is", url)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {},
        })
            .then((responseJson) => {
                if (responseJson.success) {
                    var newArray = this.state.listData;
                    var responseData = responseJson.data
                    var dateRangeList = responseData.dateRangesData
                    var index = dateRangeList.findIndex(dateRange => dateRange.selected == true)
                    if (index > -1) {
                        this.state.listData[0].selectionVisibilty = false
                    }

                    var studentListData = []
                    for (var i = 0; i < dateRangeList.length; i++) {
                        var dateRange = dateRangeList[i];
                        var colorObject = {
                            dateRangeId: dateRange._id,
                            deleteVisibility: false,
                            data: dateRange,
                            selectionVisibilty: dateRange.selected
                        }
                        //}
                        studentListData.push(colorObject)

                    }
                    //console.log("Student data is ", studentListData)

                    this.setState({
                        listData: [...newArray, ...studentListData],
                        isAsyncLoader: false,
                        page: this.state.page + 1,
                        totalDateRange: responseData.count,
                    })
                } else {
                    this.setState({
                        isAsyncLoader: false

                    })
                    this._showToastMessage(responseJson.message)
                }

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
                // 
            } else {
                this.props.navigation.setParams(
                    {
                        isheaderRightShow: true
                    }
                )

                this.setState({
                    isEditMode: false,
                    dateRangeNeedToDelete: []
                }, function () {
                    this.expandElement()
                })

                // this.expandElement()
            }
        }



    }

    //_setVisiblityOfItem
    _setVisiblityOfItem = (item, index) => {
        let posts = this.state.listData.slice();
        let targetPost = posts[index];
        if (this.state.isEditMode && index > 0) {

            if (targetPost.deleteVisibility) {
                var indexNeedToDelete = this.state.dateRangeNeedToDelete.indexOf(targetPost.dateRangeId)
                this.state.dateRangeNeedToDelete.splice(indexNeedToDelete, 1);
            }
            else {
                this.state.dateRangeNeedToDelete.push(targetPost.dateRangeId)
            }
            targetPost.deleteVisibility = !targetPost.deleteVisibility;
            this.setState({ posts });
            //console.log("ListData", this.state.dateRangeNeedToDelete)
        }
        else {
            for (var i = 0; i < posts.length; i++) {
                var selectedPost = posts[i];
                if (index == i) {
                    selectedPost.selectionVisibilty = true;
                    if (index == 0) {
                        var body = {
                            selectedDateRange: null
                        }
                    } else {
                        var body = {
                            selectedDateRange: selectedPost.data._id
                        }
                    }

                    //hit selection api
                    this._saveDataOnRowClick(body)
                } else {
                    selectedPost.selectionVisibilty = false;
                }
            }
            this.setState({ posts });
        }


    }



    _saveDataOnRowClick(body) {

        this.setLoading(true)

        var url = API.BASE_URL + API.API_USER_SETTINGS_UPDATE + this.state.settingId;

        //console.log("url is", url)

        var headerValue = {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        }
        requestInfo = {
            method: 'PUT',
            headers: {},
            body: JSON.stringify(body)
        }
        //console.log("Body", body)

        TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
            //console.log("response", JSON.stringify(responseJson));
            if (responseJson.success) {
                this.setLoading(false)
            } else {

                this.setLoading(false)
                this._showToastMessage(responseJson.message)
            }
        }).catch((error) => {
            this.setLoading(false)
            console.error(error);
        });

    }


    //will move to AddPickerActionValue screen
    _moveToNexScreen = (dateRangeData, isupdate = false) => {

        //this._handleEditClick(isupdate);
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("AddSettingDateRange", {
            onGoBack: () => this.refresh(), isheaderRightShow: true,
            headerRight: !isupdate ? "Save" : "Update", screenTitle: (!isupdate ? "Add " : "Update "),
            item: this.state.item, leftHeader: BreadCrumbConstant.CANCEL,
            dateRangeData: dateRangeData
        })

    }

    //delete selected picker from the back end
    _onDeletePickers = () => {

        // //console.log("UserId", this.props.navigation.state.params.userId)
        if (this.state.dateRangeNeedToDelete.length > 0) {
            var listData = this.state.listData
            for (var i = 0; i < listData.length; i++) {
                var seleselectedDateRange = listData[i];
                var index = this.state.dateRangeNeedToDelete.indexOf(seleselectedDateRange.dateRangeId)
                if (index > -1 && seleselectedDateRange.selectionVisibilty) {
                    this._showToastMessage('Selected date range can not be deleted')
                    return
                }

            }

            //console.log("arrayListNeed to Delete" + JSON.stringify(this.state.dateRangeNeedToDelete))
            this.setState({
                isLoaderShown: true
            })
            var url = API.BASE_URL + API.API_DATE_RANGES_BULK_DELETE

            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: 'POST',
                headers: {
                    // Accept: 'application/json',
                    // 'Content-Type': 'application/json',
                    // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    // 'userId': TeacherAssitantManager.getInstance().getUserID(),
                },
                body: JSON.stringify({
                    _id: this.state.dateRangeNeedToDelete
                })
            })
                .then((responseJson) => {
                    //console.log('response===' + JSON.stringify(responseJson))
                    if (responseJson.success) {
                        this.setLoading(false);

                        this.setState({ page: 1,listData: [this._getAllDateObject()],})
                        // , function () {
                        //     this._getDateRangeList();
                        
                        //     })
                        //  this._getDateRangeList();


                        //////////////
                        // this.setState({
                        //     isLoaderShown: false
                        // })

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
        }



    }

    _updateListAfterDelete = () => {
        // var deletedStudents=0;

        if (this.state.listData.length > 0) {

            var array = [...this.state.listData];

            for (var i = 0; i < this.state.dateRangeNeedToDelete.length; i++) {
                //console.log('for studentList')
                //console.log(this.state.dateRangeNeedToDelete[i])

                var index = array.findIndex(actionObject => actionObject.data._id == this.state.dateRangeNeedToDelete[i]);
                //console.log('index' + index)

                if (index > -1) {
                    array.splice(index, 1);
                }
            }


            this.setLoading(false);
            this.setState({
                listData: array,
                colorsIdNeedToDelete: [],
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
        this.addDateRangeListener = EventRegister.addEventListener(SocketConstant.ON_ADD_DATE_RANGE, (data) => {
            this._addDateRangeData(data)
        })

        this.removeDateRangeListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_DATE_RANGE_BULK, (data) => {
            //console.log('removeStudentListener');
            this._removeDateRangeData(data)
        })

        this.updateDateRangeListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_DATE_RANGE, (data) => {
            //console.log('UpdateStudentListener');
            this._updateDateRangeData(data)
        })

        //setting function
        this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
            //console.log("addStudentListener", data)
            this._updateUserSetting(data)
        })
    }

    //help to remove Listner
    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addDateRangeListener)
        EventRegister.removeEventListener(this.removeDateRangeListener)
        EventRegister.removeEventListener(this.updateDateRangeListener)
        EventRegister.removeEventListener(this.updateUserSetting)
    }

    //_updateUserSetting
    _updateUserSetting = (settingData) => {


        if (settingData.selectedDateRange == null) {
            if (this.state.listData.length > 0) {
                for (var i = 0; i < this.state.listData.length; i++) {
                    var pickerAction = this.state.listData[i];
                    pickerAction.selectionVisibilty = false
                    if (i == 0) {
                        pickerAction.selectionVisibilty = true
                    }
                }
                this.setState({ listData: this.state.listData });

            }
        } else {
            if (this.state.listData.length > 0) {
                //console.log('_UpdateStudentData');

                ////console.log(picker);
                var data = this.state.listData
                var index = this.state.listData.findIndex(pickerObject => pickerObject.data._id === settingData.selectedDateRange);
                if (index > -1) {
                    for (var i = 0; i < this.state.listData.length; i++) {
                        var pickerAction = this.state.listData[i];
                        pickerAction.selectionVisibilty = false
                        if (i == index) {
                            pickerAction.selectionVisibilty = true
                        }
                    }

                    this.setState({ listData: this.state.listData });
                }
            }
        }

    }

    //add data to student
    _addDateRangeData = (dateRange) => {

        //console.log('_addDataToStudent==' + dateRange)
        //console.log(dateRange)

        var array = [...this.state.listData];
        //if (this.state.item._id == dateRange.actionFieldID) {
        array.push({
            pickerDataId: dateRange._id,
            deleteVisibility: false,
            data: dateRange,
            selectionVisibilty: false
        })

        this.setState({
            listData: array
        })
        //}




    }

    //remove student data
    _removeDateRangeData = (daterangeList) => {
        //console.log("arrayListNeed to Delete" + JSON.stringify(daterangeList))

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            // //console.log(pickerList[i])
            var array = [...this.state.listData];
            var dateRangeNeedToDelete = [...this.state.dateRangeNeedToDelete];
            //var selectedActionPickerList = [...this.state.selectedActionPicker]

            for (var i = 0; i < daterangeList._id.length; i++) {
                //console.log('for studentList')
                // //console.log(pickerList[i])
                var pickerId = daterangeList._id[i]
                //console.log(pickerId)
                var index = array.findIndex(pickerObject => pickerObject.data._id == pickerId);
                //console.log('index' + index)
                if (index > -1) {
                    array.splice(index, 1);
                }
                index = dateRangeNeedToDelete.findIndex(pickerObject => pickerObject._id === pickerId);
                if (index > -1) {
                    dateRangeNeedToDelete.splice(index, 1)
                }
            }

            this.setState({
                listData: array,
                dateRangeNeedToDelete: [],
            })
        }


    }


    _updateDateRangeData(picker) {
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
            }
        }

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

    loadMoreDateRanges = () => {
        //const {totalDateRange, isFetchingFromServer } = this.state
        if (this.state.listData.length < this.state.totalDateRange && !this.state.isFetchingFromServer) {

            this.setState({ isFetchingFromServer: true }, function () {
                this._getDateRangeList()
                //console.log('loadMoreStudents')
            })


        }

    }


    //define header (navigation Bar)
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            // title: '' + ` ${navigation.state.params.screenTitle}`,
            title: TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_DATE_RANGE, 0),
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.gotoBack()}>
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
                <TouchableOpacity onPress={() => params.onRightHeaderClick()}>
                    <Image style={StyleTeacherApp.rightImageViewHeader}
                        source={require('../img/icon_add.png')}>
                    </Image>
                </TouchableOpacity>
            

        }
    }

    _renderItem = ({ item, index }) => {
        var data = item.data
        var fromDate = ''
        var toDate = ''
        if (index != 0) {
            toDate = moment.utc(data.endDate).format('MM/DD/YYYY')
            fromDate = TeacherAssitantManager.getInstance()._changeDateFormat(new Date(data.startDate), true)
        }

        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._setVisiblityOfItem(item, index)} >
                    <View style={styles.rowContainer}>
                        {
                            index > 0 && this.state.isEditMode ?
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

                        <View style={index > 0 ? this.state.animatedStyle : styles.rowTextContainter}>
                            <View style={styles.rowText}>
                                <Text numberOfLines={1} style={styles.rowItemActionPickerText}>
                                    {data.name}
                                </Text>
                                {index != 0 ?
                                    <Text numberOfLines={1} style={styles.rowItemDateText}>
                                        {fromDate + ' - ' + toDate}
                                    </Text> : null
                                }

                            </View>

                        </View>
                        {
                            index > 0 && this.state.isEditMode ?
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
                                :
                                !this.state.isEditMode ?
                                    <View style={styles.iconImageContainer}>
                                        {
                                            item.selectionVisibilty ?
                                                <Image style={styles.iconImage}
                                                    name="search"
                                                    source={require("../img/check_icon.png")} />
                                                : null
                                        }
                                    </View> : null
                        }


                    </View>
                </TouchableOpacity>
            </View>



        );
    };


    //render the whle ui
    render() {
        const { listData } = this.state
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 0.918 }}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
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
                        onEndReached={this.loadMoreDateRanges}
                        // ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                    />
                </View>
                <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                />
                <View style={styles.bottomOuterView}>
                    <View style={styles.bottomInnerView}>
                        <TouchableOpacity onPress={() => this._handleEditClick(true)}>
                            <Text style={styles.text}>{!this.state.isEditMode ? "Edit" : "Done"}</Text>
                        </TouchableOpacity>

                        {
                            this.state.isEditMode ?
                                <TouchableOpacity
                                    onPress={() => this._onDeletePickers()}>
                                    <Text style={styles.text}>Delete</Text>
                                </TouchableOpacity> :
                                null
                        }
                    </View>
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

    iconImageContainerForEditMode: {
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
    rowItemActionPickerText: { flex: 1, justifyContent: 'center', marginTop: 1.5, marginBottom: 0.5 },

    rowItemDateText: { justifyContent: 'center', marginTop: 0.5 }
});