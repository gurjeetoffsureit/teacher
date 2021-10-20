import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text, Alert,
    View, ToastAndroid, FlatList, UIManager, LayoutAnimation, SafeAreaView

} from 'react-native'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager'
import API from '../constants/ApiConstant'
import { EventRegister } from 'react-native-event-listeners'
import update from 'react-addons-update'
import Loader from '../ActivityIndicator/Loader';
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'

import SocketConstant from '../constants/SocketConstant';
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from '../constants/BreadCrumbConstant';
import ComingFrom from '../constants/ComingFrom';
import ApiParms from '../constants/ApiParms';
import AppConstant from '../constants/AppConstant';
import Toast, { DURATION } from 'react-native-easy-toast'

export default class CustomizeActionFieldsScreen extends React.PureComponent {
    constructor(props) {
        super(props)
        var stateParam = this.props.navigation.state.params
        this.state = {
            userId: stateParam.userId,
            listData: [],
            isEditMode: false,
            loading: false,
            ActionListSelectedToDelete: [],
            isAsyncLoader: true,
            animatedStyle: styles.rowTextContainter,
            totalActions: 0,
            isFetchingFromServer: false,
            comingFrom: stateParam.comingFrom,
            //isRightHeaderShow: stateParam.isRightHeaderShow

        }
        this._getListOfActions()
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.moveToNextScreen,
            gotoBack: this.moveToPreviousScreen
        })

    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
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


    moveToNextScreen = () => {
        this._removeEventListener()
        this.setState({
            listData: []
        })
        const { state, navigate } = this.props.navigation;
        navigate("AddCustomizeActionFields", {
            screen: "Add Action Field", onGoBack: this.refresh, headerRight: "Save",
            userId: this.props.navigation.state.params.userId, leftHeader: BreadCrumbConstant.CANCEL, comingFrom: this.props.navigation.state.params.comingFrom
        })

    }

    _getListOfActions(isFromRefresh = false) {
        //this.setLoading(true)
        //console.log("AddClass  UserId", this.state.userId);
        var userId = TeacherAssitantManager.getInstance().getUserID()
        var url = API.BASE_URL + API.API_ACTIONS + API.API_GET_BY_USER_ID + userId
        let isCustomizeTerminology = this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY
        if (isCustomizeTerminology) {
            url += '?termology=true'
        }
        //console.log("url is ", url)

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId
            }
        }).then((responseJson) => {
            // //console.log(responseJson.message);
            //this.state.listData = responseJson;
            if (responseJson.success) {
                //console.log("data is" + JSON.stringify(responseJson))
                //var isComingFromCustomizeTerminilogy = this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY
                let responsedata = responseJson.data
                let respopnseDataCount = responseJson.data.length

                for (var i = 0; i < respopnseDataCount; i++) {
                    // let field = responsedata[i]
                    let listDataObjet = {
                        visibilty: false,
                        data: responsedata[i]
                    }

                    // if (isComingFromCustomizeTerminilogy = this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY) {
                    //     this.state.listData.push(listDataObjet)
                    // } else if (field.dataType != ApiParms.ACTION_TERMOLOGY) {
                    this.state.listData.push(listDataObjet)
                    // }



                }

                this.setState({
                    isAsyncLoader: false,
                    listData: this.state.listData,

                    // isLoading: false
                });

                if (isCustomizeTerminology) {
                    this._saveCustomizeTerminologyToLocalDb();
                }


                //register Socket Event

                //this.setLoading(false)

            } else {
                this.setState({
                    isAsyncLoader: false
                });
                this._showToastMessage(responseJson.message)
                //this.showAlert(responseJson.message);
                //register Socket Event
                // this._addEventListener()
                // this.setLoading(false)
            }
            this._addEventListener()
            // if(isFromRefresh){
            //     this.setState({
            //         isEditMode: false,
            //     }, function () {            
            //         this.expandElement()})
            // }

        }).catch((error) => {
            console.error(error);
        });


    }

    refresh = () => {

        this.setState({
            listData: [],
            loading: false,
            ActionListSelectedToDelete: [],
            isAsyncLoader: true,
        }, function () {
            this._getListOfActions(true)
        })

        //  })






        //this._addEventListener()

    }

    moveToPreviousScreen = () => {
        //console.log("props", this.props)
        this._removeEventListener()
        this.props.navigation.state.params.onGoBack(false);
        this.props.navigation.goBack();
    }



    // event listener for socket
    _addEventListener = () => {
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
    }

    //help to remove Listner
    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addColorLabelListener)
        EventRegister.removeEventListener(this.removeActionFieldListener)
        EventRegister.removeEventListener(this.updateActionFieldListener)
    }

    //add data to student
    _addDataToActionField = (actionField) => {
        var listDataObject = {}
        listDataObject = {
            visibilty: false,
            data: actionField
        }
        this.state.listData.push(listDataObject)
        this.setState({
            listData: this.state.listData
        }, function () {
            if (this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY) {
                this._saveCustomizeTerminologyToLocalDb();
            }

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
            }, function () {
                if (this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY) {
                    this._saveCustomizeTerminologyToLocalDb();
                }
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
                this.setState({ listData: updatedStudentActions }, function () {
                    if (this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY) {
                        this._saveCustomizeTerminologyToLocalDb();
                    }
                });
            }
        }
    }

    loadMoreActions() {
        //         const { listData, totalActions, isFetchingFromServer } = this.state
        // if (listData.length < totalActions && !isFetchingFromServer) {

        //   this.setState({ isFetchingFromServer: true }, function () {
        //     this._getListOfActions()
        //     //console.log('loadMoreStudents')
        //   })


        // }
    }

    _saveCustomizeTerminologyToLocalDb() {
        var listdata = this.state.listData
        ctList = []
        listdata.forEach(element => {
            ctList.push(element.data)
        });
        if (ctList.length > 0) {
            TeacherAssitantManager.getInstance()._saveCustomizeTerminologyToLocalDb(ctList)
        }
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var title = params.screen
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }

        var isCustomizeTerminology = params.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY
        return {
            //title:`${navigation.state.param.title}`,
            title: '' + ` ${title}`,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
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
                <TouchableOpacity
                    onPress={() => params.onAdd()}
                    disabled={isCustomizeTerminology}>
                    {!isCustomizeTerminology ?
                        <Image style={StyleTeacherApp.rightImageViewHeader}
                            source={require('../img/icon_add.png')}>
                        </Image> : null

                    }

                </TouchableOpacity>
            
        }
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        const { listData } = this.state
        var isCustomizeTerminology = this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <Loader loading={this.state.loading} />
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
                    <View style={{ flex: 0.92 }}>

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
                            onEndReached={this.loadMoreActions}
                            ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                        />
                    </View>
                    <View style={styles.list}></View>
                    <View style={styles.bottomOuterView}>
                        <View style={styles.bottomInnerView}>
                            {
                                isCustomizeTerminology ?
                                    <TouchableOpacity onPress={() => this._showWarningAlert()} style={styles.resetButtonView} >
                                        <Text style={styles.text}>Reset All</Text>
                                    </TouchableOpacity>
                                    : null
                            }
                            {
                                !isCustomizeTerminology ?
                                    this.state.isEditMode ?
                                        <TouchableOpacity onPress={() => this._handleDoneClick()}
                                            style={styles.editView}>
                                            <Text style={styles.text}>Done</Text>
                                        </TouchableOpacity> :
                                        <TouchableOpacity onPress={() => this._handleEditClick()} style={styles.editView} >
                                            <Text style={styles.text}>Edit</Text>
                                        </TouchableOpacity>

                                    : null

                            }
                            {
                                !isCustomizeTerminology && this.state.isEditMode ?
                                    <TouchableOpacity
                                        style={styles.deleteView}
                                        onPress={() => this._onDeleteActions()}>
                                        <Text style={{ fontSize: 18, color: '#4799EB' }}>Delete</Text>
                                    </TouchableOpacity> : null
                            }

                        </View>

                    </View>
                </View>
            </SafeAreaView>



        )
    }


    _renderItem = ({ item, index }) => {

        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._handleRowclick(item, index)} >
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
                        <View style={this.state.animatedStyle}>
                            {
                                this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY ?
                                    <Text style={styles.rowText} numberOfLines={1}>
                                        {item.data.default}
                                    </Text>
                                    :
                                    <Text style={item.data.visible == true ? styles.rowText : styles.rowTextGray} numberOfLines={1}>
                                        {item.data.singular}
                                    </Text>
                            }

                        </View>
                        {/* <TouchableOpacity style={styles.touchStyle}
                        > */}
                        <View style={styles.imageContainer}>
                            {/* <View style={styles.imageInfoContainer}>

                                    <Image style={styles.imageView}
                                        source={require('../img/icon_info.png')}>
                                    </Image>

                                </View> */}
                            <View style={styles.imageNextContainer}>
                                <Image style={styles.imageView}
                                    source={require('../img/icon_arrow.png')}>
                                </Image>
                            </View>
                        </View>
                        {/* </TouchableOpacity> */}

                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    _onDeleteActions = () => {
        //console.log("url is", API.BASE_URL + API.API_ACTIONS + API.API_BULK_DELETE_CLASS)
        if (this.state.ActionListSelectedToDelete.length > 0) {

            // this.setLoading(true);
            this.setState({
                isLoaderShown: true
            })
            var url = API.BASE_URL + API.API_ACTIONS + API.API_BULK_DELETE_CLASS;
            //console.log("url is", url)

            fetch(url, {
                method: 'POST',
                headers: {
                    'clientid': TeacherAssitantManager.getInstance().getDeviceID(),
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'userId': TeacherAssitantManager.getInstance().getUserID()
                },
                body: JSON.stringify({
                    _id: this.state.ActionListSelectedToDelete
                })
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    //console.log('response===' + JSON.stringify(responseJson))
                    if (responseJson.success) {
                        this.setLoading(false);
                        // this.setState({
                            this.refresh();
                        // })
                        // var msg = responseJson.message;

                        //this._updateListAfterDelete()
                    } else {
                        this.setLoading(false);
                        this.setState({
                            isLoaderShown: false
                        })
                        this._showToastMessage(responseJson.message)
                        // this.showAlert(responseJson.message)
                    }
                })
                .catch((error) => {
                    this.setLoading(false);
                    this.setState({
                        isLoaderShown: false
                    })
                    //console.log("error===" + error)
                })
        } else {
            this._showToastMessage('Please select actions to delete.')
            // this.showAlert('Please select Student to delete.')
        }


    }

    _updateListAfterDelete = () => {
        // var deletedStudents=0;

        if (this.state.listData.length > 0) {

            var array = [...this.state.listData];

            for (var i = 0; i < this.state.ActionListSelectedToDelete.length; i++) {
                //console.log(this.state.ActionListSelectedToDelete[i])

                var index = array.findIndex(actionObject => actionObject.data._id == this.state.ActionListSelectedToDelete[i]);

                if (index > -1) {
                    array.splice(index, 1);
                    //deletedStudents=deletedStudents+1
                }
            }

            // var studentcount = this.state.totalStudents - deletedStudents
            // //console.log("studentCount", studentcount)
            // this.props.navigation.setParams({ studentCount: studentcount })
            this.setLoading(false);
            this.setState({
                listData: array,
                ActionListSelectedToDelete: [],
            })
        }

    }
    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }


    _showWarningAlert = () => {

        Alert.alert(
            AppConstant.APP_NAME,
            'Are you sure you want to reset all terminology?',
            [
                { text: 'Cancel', onPress: () => {}},//console.log('Cancel Pressed!') },
                { text: 'Reset', onPress: this._onPressResetButton },
            ],
            { cancelable: false }
        )





    }

    _onPressResetButton = () => {
        //to rerset cutomize terminilogy
        var url = API.BASE_URL + API.API_RESET_TERMOLOGY + TeacherAssitantManager.getInstance().getUserID()
        this.setLoading(true)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId
            }
        }).then((responseJson) => {
            // //console.log(responseJson.message);
            //this.state.listData = responseJson;
            if (responseJson.success) {
                //console.log("data is" + JSON.stringify(responseJson))
                this.refresh()
                let responsedata = responseJson.data
                let respopnseDataCount = responseJson.data.length
                this.setState({
                    listData: []
                }, function () {
                    for (var i = 0; i < respopnseDataCount; i++) {
                        let field = responsedata[i]
                        let listDataObjet = {
                            visibilty: false,
                            data: responsedata[i]
                        }
                        if (this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY) {
                            this.state.listData.push(listDataObjet)
                        } else if (field.dataType != ApiParms.ACTION_TERMOLOGY) {
                            this.state.listData.push(listDataObjet)
                        }
                    }
                    this.setState({
                        listData: this.state.listData,
                        isAsyncLoader: false
                    });
                })
            
                // this.props.navigation.state.params.onGoBack(false);
            } else {
                this.setState({
                    isAsyncLoader: false
                });
                this._showToastMessage(responseJson.message)
                //this.showAlert(responseJson.message);
                //register Socket Event
                // this._addEventListener()
                // this.setLoading(false)
            }

            this.setLoading(false)
            //this._addEventListener()
        }).catch((error) => {
            console.error(error);
        });
    }

    _handleEditClick = () => {
        this.setState({
            isEditMode: true
        }, function () {
            this.collapseElement()
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
        }, function () {
            this.expandElement()
        })



    }
    _handleRowclick = (item, index) => {

        if (this.state.isEditMode) {
            let posts = this.state.listData.slice();
            let targetPost = posts[index];
            if (!targetPost.data.defaultTypeStatus) {
                if (targetPost.visibility) {
                    var indexNeedToDelete = this.state.ActionListSelectedToDelete.indexOf(targetPost.data._id)
                    this.state.ActionListSelectedToDelete.splice(indexNeedToDelete, 1);
                }
                else {
                    this.state.ActionListSelectedToDelete.push(targetPost.data._id)
                }
                targetPost.visibility = !targetPost.visibility;
                this.setState({ posts });

            }
            else {
                this._showToastMessage(TextMessage.DEFAULT_FIELD_CANNOT_BE_DELETED)
            }

        }
        else {
            this.setState({
                listData: []
            })
            const { state, navigate } = this.props.navigation;
            let screen = "Edit Action Field"
            let headerRight = 'Update'

            if (this.state.comingFrom == ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY) {
                screen = item.data.singular
                headerRight = 'Save'
            }

            navigate("AddCustomizeActionFields", {
                screen: screen, onGoBack: this.refresh, headerRight: headerRight, userId: this.props.navigation.state.params.userId,
                item: item.data, leftHeader: BreadCrumbConstant.CANCEL, comingFrom: this.state.comingFrom
            })
        }


        //console.log("deleted list is", this.state.ActionListSelectedToDelete)

    }



}
const styles = StyleSheet.create({
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#8E8E8E",
        marginLeft: 10,
        marginRight: 10
    },
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
        flexDirection: 'column'
    },
    list: {
        backgroundColor: 'gray',
        height: 0.918
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
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16
    },
    imageContainer: {
        flex: 0.05,
        flexDirection: 'row',
        marginLeft: 5
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 5,
        margin: 12,
        backgroundColor: 'white'
    },
    rowText: {
        justifyContent: "center",
        alignItems: "center",
        color: "black",
        fontSize: 15,
        marginLeft: 10,
        flex: 0.9
    },
    rowTextGray: {
        justifyContent: "center",
        alignItems: "center",
        color: "gray",
        fontSize: 15,
        marginLeft: 10,
        flex: 0.9
    },
    rowTextContainter: {
        flex: 0.9
    },
    editRowTextContainter: { flex: 0.8 },
    touchStyle: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    imageInfoContainer: {
        flex: 0.1,
        alignItems: "center",
        justifyContent: "center"
    },
    imageNextContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20
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
    resetButtonView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});