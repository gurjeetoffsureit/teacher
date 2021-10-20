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
import Toast, { DURATION } from 'react-native-easy-toast'

export default class SettingCustomizeDetailFields extends React.PureComponent {
    constructor(props) {
        super(props)
        // var stateParams = this.props.navigation.state.params
        // //console.log("data is", stateParams.item.selectedPickerList)
        // var actionPickerNeedToSelect = JSON.parse(JSON.stringify(stateParams.item.selectedPickerList))
        // var selectedActionPicker = JSON.parse(JSON.stringify(stateParams.item.selectedPickerList))

        this.state = {
            listData: [],
            // userId: stateParams.userId,
            isEditMode: false,
            cutsomizeDetailsFieldsNeedToDelete: [],
             // comingFrom: stateParams.comingFrom,
            // actionPickerNeedToSelect: actionPickerNeedToSelect,
            // selectedActionPicker: selectedActionPicker,
            // item: stateParams.item.data, //add actions screen data,
            // isAsyncLoader: true,
            // animatedStyle: styles.rowTextContainter,
            // isFetchingFromServer:false,
            // totalPickers:0,

        }
    }



    componentDidMount() {
        this._getCutomizeDetailFileds()
        this.props.navigation.setParams({
            onAdd: this._moveToNexScreen,
            gotoBack: this.moveToPreviousScreen
        })
        // this._sub = this.props.navigation.addListener(
        //     'didFocus',
        //     this.refreshScreen
        // );
    }

    // refreshScreen = () => {
    //     this.setState({ page: 1, listData: [], }, function () {
    //         // this._getCutomizeDetailFileds();
    //     })
    // }

    // componentWillUnmount() {
    //     if (this._sub)
    //         this._sub.remove();
    // }
    //save action picker list

    _moveToNexScreen = (data, isupdate = false) => {

        //this._handleEditClick(isupdate);
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("AddSettingCustomizeDetailFields", {
            onGoBack: this.refresh, userId: TeacherAssitantManager.getInstance().getUserID(), isheaderRightShow: true,
            headerRight: !isupdate ? "Save" : "Update", screenTitle: this.props.navigation.state.params.screenTitle,
            item: this.state.item, //add actions screem data
            customizeDetailFieldData: data, leftHeader: BreadCrumbConstant.CANCEL
        })

    }

    //refesh the screen when we come back to this screen
    refresh = () => {
        this.setState({
            isEditMode: false,

        })
        this._getCutomizeDetailFileds();
    }


    moveToPreviousScreen = () => {
        this._removeEventListener()
        this.props.navigation.state.params.onGoBack();
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
    _getCutomizeDetailFileds() {
        var userId = TeacherAssitantManager.getInstance().getUserID();
        var url = API.BASE_URL + API.API_GET_CUSTOMIZE_DETAIL_FIELDS + userId + API.API_PERSIST
        var headerValue =
        {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        }

        //console.log("_getCutomizeDetailFileds url is", url)

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: headerValue,
        })
            .then((responseJson) => {
                if (responseJson.success) {
                    this.state.listData = []
                    var newArray = this.state.listData;

                    var cutomizeDetailFiledList = responseJson.data

                    var cutomizeDetailFiled = {}
                    var _cutomizeDetailFiledList = []
                    for (var i = 0; i < cutomizeDetailFiledList.length; i++) {
                        var _cutomizeDetailFiled = cutomizeDetailFiledList[i];

                        cutomizeDetailFiled = {
                            cutomizeDetailFiledId: _cutomizeDetailFiled._id,
                            deleteVisibility: false,
                            data: _cutomizeDetailFiled,
                        }
                        _cutomizeDetailFiledList.push(cutomizeDetailFiled)

                    }
                    //console.log("Student data is ", _cutomizeDetailFiledList)

                    this.setState({
                        listData: [...newArray, ..._cutomizeDetailFiledList],
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
                this._addEventListener()
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
                        isheaderRightShow: true
                    }
                )
                this.setState({
                    isEditMode: true
                }, function () {
                    this.collapseElement();
                })
             } 
            else {
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
            if (!targetPost.data.isDefault) {
                if (targetPost.deleteVisibility) {
                    var indexNeedToDelete = this.state.cutsomizeDetailsFieldsNeedToDelete.indexOf(targetPost.cutomizeDetailFiledId)
                    this.state.cutsomizeDetailsFieldsNeedToDelete.splice(indexNeedToDelete, 1);
                }
                else {
                    this.state.cutsomizeDetailsFieldsNeedToDelete.push(targetPost.cutomizeDetailFiledId)
                }
                targetPost.deleteVisibility = !targetPost.deleteVisibility;
                this.setState({ posts });
                //console.log("ListData", this.state.cutsomizeDetailsFieldsNeedToDelete)
            } else {
                this._showToastMessage('Default Fields cannot be deleted')
            }

        }
    }


    //delete selected picker from the back end
    _onDeletePress = () => {

        //console.log("UserId", this.props.navigation.state.params.userId)
        if (this.state.cutsomizeDetailsFieldsNeedToDelete.length > 0) {

            //console.log("arrayListNeed to Delete" + JSON.stringify(this.state.actionPickerNeedToDelete))
            this.setState({
                isLoaderShown: true
            })
            var url = API.BASE_URL + API.API_CREATE_OR_DELETE_CUSTOMIZE_DETAILS_FIELDS
            //console.log('delete url  ' + url)
            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: 'DELETE',
                headers: {
                },
                body: JSON.stringify({
                    _id: this.state.cutsomizeDetailsFieldsNeedToDelete
                })
            })
                .then((responseJson) => {

                    //console.log('response===' + JSON.stringify(responseJson))
                    if (responseJson.success) {
                        this.setLoading(false);
                        this._getCutomizeDetailFileds()
                      
                        // this.setState({ page: 1, listData:[]},function(){
                        //     this._updateListAfterDelete()
                        // })
                        //    this._updateListAfterDelete()
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
                //console.log('actionPickerNeedToDelete',this.state.actionPickerNeedToDelete[i])

                var index = array.findIndex(actionObject => actionObject.data._id == this.state.actionPickerNeedToDelete[i]);
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
        this.addCustomizeDetailFieldListener = EventRegister.addEventListener(SocketConstant.ON_ADD_CUSTOMIZED_DETAIL_FIELD, (data) => {
            this._addCustomizeDetailFieldData(data)
        })

        this.removeCustomizeDetailFieldListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_CUSTOMIZED_DETAIL_FIELD_BULK, (data) => {
            //console.log('removeStudentListener');
            this._removeCustomizeDetailFieldData(data)
        })

        this.updateCustomizeDetailFieldListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_CUSTOMIZED_DETAIL_FIELD, (data) => {
            //console.log('UpdateStudentListener');
            this._updateCustomizeDetailFieldData(data)
        })
    }

    //help to remove Listner
    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addCustomizeDetailFieldListener)
        EventRegister.removeEventListener(this.removeCustomizeDetailFieldListener)
        EventRegister.removeEventListener(this.updateCustomizeDetailFieldListener)
    }

    //_addCustomizeDetailFieldData
    _addCustomizeDetailFieldData = (cutomizeDetailFiled) => {

        var array = [...this.state.listData]

        array.push({
            cutomizeDetailFiledId: cutomizeDetailFiled._id,
            deleteVisibility: false,
            data: cutomizeDetailFiled,
        })

        this.setState({
            listData: array
        })





    }

    //_removeCustomizeDetailFieldData
    _removeCustomizeDetailFieldData = (customizeDetailFieldList) => {
        //console.log("arrayListNeed to Delete" + JSON.stringify(customizeDetailFieldList))


        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            // //console.log(pickerList[i])
            var array = [...this.state.listData];

            for (var i = 0; i < customizeDetailFieldList._id.length; i++) {
                //console.log('for studentList')
                var customizeDetailFieldId = customizeDetailFieldList._id[i]
                //console.log(customizeDetailFieldId)
                var index = array.findIndex(pickerObject => pickerObject.data._id == customizeDetailFieldId);
                //console.log('index' + index)
                if (index > -1) {
                    array.splice(index, 1);
                }

            }

            this.setState({
                listData: array,
                cutsomizeDetailsFieldsNeedToDelete: [],

            })
        }


    }

    //_updateCustomizeDetailFieldData
    _updateCustomizeDetailFieldData(cutomizeDetailFiled) {

        if (this.state.listData.length > 0) {
            //console.log('_UpdateStudentData');
            //console.log(cutomizeDetailFiled);
            var index = this.state.listData.findIndex(cutomizeDetailFiledObject => cutomizeDetailFiledObject.data._id === cutomizeDetailFiled._id);
            //console.log('index');
            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(this.state.listData[index]);
                var pickerAction = this.state.listData[index];
                pickerAction.data = cutomizeDetailFiled
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
                navigation.state.params.isheaderRightShow
                    ?
                    <TouchableOpacity
                        onPress={() => params.onAdd()}>
                        <Image style={StyleTeacherApp.rightImageViewHeader}
                            source={require('../img/icon_add.png')}>
                        </Image>
                    </TouchableOpacity> : null
            

        }
    }

    _renderItem = ({ item, index }) => {
        var data = item.data
        var isTrue = this.state.isEditMode
        return (
            <View>

                <TouchableOpacity
                    onPress={() => this._setVisiblityOfItem(item, index)}
                    disabled={!isTrue}>
                    <View style={styles.rowContainer}>
                        {
                            isTrue ?
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
                        <View style={isTrue ? styles.editRowTextContainter : styles.rowTextContainter}>
                            <View style={styles.rowText}>
                                <Text numberOfLines={1} style={styles.rowItemActionPickerText}>
                                    {data.customizedDetailField}
                                </Text>

                            </View>

                        </View>
                        {
                            isTrue ?
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
                        onEndReachedThreshold={0.8}
                        // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(listData)}
                        onEndReached={this.loadMorePickers}
                        ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                        ItemSeparatorComponent={(rowId) => (
                            <View key={rowId} style={styles.separator} />
                        )}
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
                                    onPress={() => this._onDeletePress()}>
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
    // separator: {
    //     flex: 1,
    //     height: StyleSheet.hairlineWidth,
    //     backgroundColor: '#8E8E8E',
    // },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#8E8E8E",
        marginLeft: 10,
        marginRight: 10
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