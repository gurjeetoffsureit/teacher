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
    FlatList,
    TouchableOpacity, Image, Switch, SafeAreaView
} from 'react-native';

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
import moment from 'moment'
import ComingFrom from '../constants/ComingFrom'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'

// var self;
export default class SettingExportReportOptions extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isWithAndWithoutActions: true,
            isWithActions: false,
            listData: [this._getAllDateObject()],
            isEditMode: false,
            dateRangeNeedToDelete: [],
            isAsyncLoader: true,
            animatedStyle: styles.rowTextContainter,
            totalDateRange: 0,
            isFetchingFromServer: false,
            // settingId: previousScreenData.settingId,
            dateRangeId: '',
            page: 1,
        }
        // this.deleteAndCancelOptions = ['DELETE', 'CANCEL']
        // this.resetAndCancelOptions = ['RESET', 'CANCEL']
        // self = this;

    }



    componentDidMount() {
        this._getDateRangeList()
        this._addEventListener()
        this.props.navigation.setParams({
            moveToHome: this.gotoPreviousScreen,
            onPressContinue: this.onPressContinue
        })
    }

    gotoPreviousScreen = () => {
        this._removeEventListener()
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();

    }

    onPressContinue = () => {
        // this._movetoNextScreen(ComingFrom.EXPORT_DATA_REPORT_OPTION)
        this._removeEventListener()
        this.props.navigation.navigate("AddActionsToManyScreen", {
            onGoBack: this.refresh, screen: "Report",
            selectedActionList: [], comingFrom: ComingFrom.EXPORT_DATA_REPORT_OPTION,
            leftHeader: BreadCrumbConstant.CANCEL,
            dateRangeId: this.state.dateRangeId,
            isWithActions: this.state.isWithActions ? true : false
        });
    }

    _movetoNextScreen(cominfFrom) {
        this._removeEventListener()
        this.props.navigation.navigate("AddActionsToManyScreen", {
            onGoBack: this.refresh, screen: "Report",
            selectedActionList: [], comingFrom: cominfFrom,
            leftHeader: BreadCrumbConstant.CANCEL,
            isWithActions: this.state.isWithActions ? true : false
        });
    }

    refresh = () => {
        this._addEventListener()
    }

    _getAllDateObject() {
        return {
            data: {
                _id: "0",
                name: "All " + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_DATE, 2),
                selected: false,
            }, selectionVisibilty: true
        };
    }

    _onPress = (moveTo) => {

        switch (moveTo) {
            case AppConstant.WITH_AND_WITHOUT:
                this.setState({
                    isWithActions: false,
                    isWithAndWithoutActions: true
                })
                break;
            case AppConstant.WITH_ACTION_ONLY:
                this.setState({
                    isWithActions: true,
                    isWithAndWithoutActions: false
                })
                break;
        }

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

    //_setVisiblityOfItem
    _setVisiblityOfItem = (item, index) => {
        let posts = this.state.listData.slice();
        // let targetPost = posts[index];
        // if (this.state.isEditMode && index > 0) {

        //     if (targetPost.deleteVisibility) {
        //         var indexNeedToDelete = this.state.dateRangeNeedToDelete.indexOf(targetPost.dateRangeId)
        //         this.state.dateRangeNeedToDelete.splice(indexNeedToDelete, 1);
        //     }
        //     else {
        //         this.state.dateRangeNeedToDelete.push(targetPost.dateRangeId)
        //     }
        //     targetPost.deleteVisibility = !targetPost.deleteVisibility;
        //     this.setState({ posts });
        //     //console.log("ListData", this.state.dateRangeNeedToDelete)
        // }
        // else {
        let dateRangeId = ''
        for (var i = 0; i < posts.length; i++) {
            var selectedPost = posts[i];
            if (index == i) {
                selectedPost.selectionVisibilty = true;
                dateRangeId = selectedPost.dateRangeId == undefined ? '' : selectedPost.dateRangeId
            } else {
                selectedPost.selectionVisibilty = false;
            }
        }
        // if (dateRangeId == '') {
        //     this.setState({ listData: posts });
        // } else {
        this.setState({ listData: posts, dateRangeId: dateRangeId });
        //}

        // }


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
                    var newArray = [...this.state.listData]
                    var responseData = responseJson.data
                    var dateRangeList = responseData.dateRangesData
                    var index = dateRangeList.findIndex(dateRange => dateRange.selected == true)
                    if (index > -1) {
                        newArray[0].selectionVisibilty = false
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
        // this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
        //     //console.log("addStudentListener", data)
        //     this._updateUserSetting(data)
        // })
    }

    //help to remove Listner
    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addDateRangeListener)
        EventRegister.removeEventListener(this.removeDateRangeListener)
        EventRegister.removeEventListener(this.updateDateRangeListener)
       // EventRegister.removeEventListener(this.updateUserSetting)
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

                <TouchableOpacity
                    onPress={() => params.onPressContinue()}
                    disabled={params.headerRight == '' ? true : false}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {`${navigation.state.params.headerRight}`}
                    </Text>
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
                            item.selectionVisibilty ?
                                <View style={styles.iconImageContainer}>


                                    <Image style={styles.iconImage}
                                        name="search"
                                        source={require("../img/check_icon.png")} />


                                </View> : null
                        }


                    </View>
                </TouchableOpacity>
            </View>



        );
    };


    render() {


        return (
            <SafeAreaView style={styles.container}>

                {/* <ScrollView> */}

                <View style={{ flex: 0.3 }} >

                    <View style={styles.sectionViewContainer}>
                        <Text style={styles.sectionTitle}>STUDENTS</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => this._onPress(AppConstant.WITH_AND_WITHOUT)}
                            style={styles.buttonWithoutTopMargin}>
                            <Text style={styles.buttonText}>With and Without {TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 2)}</Text>
                            <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                {
                                    this.state.isWithAndWithoutActions ?
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/check_icon.png')}>
                                        </Image> : null
                                }

                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => this._onPress(AppConstant.WITH_ACTION_ONLY)}
                            style={styles.buttonWithoutTopMargin}>
                            <Text style={styles.buttonText}>With {TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 2)} Only</Text>
                            <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                {
                                    this.state.isWithActions ?
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/check_icon.png')}>
                                        </Image> : null}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionViewContainer}>
                        <Text style={styles.sectionTitle}>DATE RANGE</Text>
                    </View>



                    {/* <View style={styles.buttonContainer}>
                            <TouchableOpacity disabled={false}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>All {TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_DATE, 2)}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                    <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                        source={require('../img/check_icon.png')}>
                                    </Image>
                                </View>
                            </TouchableOpacity>
                        </View> */}

                </View>

                <View style={{ flex: 0.7 }}>
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
                        // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(this.state.listData)}
                        onEndReached={this.loadMoreDateRanges}
                        ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                    />
                </View>
                {/* </ScrollView> */}
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
        position: 'absolute', end: 35
    },
    textPositionAbsoluteWithEnd: {
        position: 'absolute', end: 30
    },
    touchableOpacityItemViewContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    list: {
        flex: 1,
        // backgroundColor: 'white',
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 12,
        // paddingBottom: 5,
        // margin: 12,
        backgroundColor: 'white'
    },
    iconImageContainer: {
        flex: 0.2, justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        height: 16,
        width: 16,

    },
    rowTextContainter: {
        flex: 0.8,
        flexDirection: 'row'
    },
    rowItemActionPickerText: { flex: 1, justifyContent: 'center', marginTop: 1.5, marginBottom: 0.5 },

    rowItemDateText: { justifyContent: 'center', marginTop: 0.5 },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',
    },
});