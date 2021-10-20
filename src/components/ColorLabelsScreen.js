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
import update from 'react-addons-update'
import { EventRegister } from 'react-native-event-listeners'

import SocketConstant from '../constants/SocketConstant';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';

import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import Loader from '../ActivityIndicator/Loader';
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from '../constants/BreadCrumbConstant';
import AppConstant from '../constants/AppConstant';
import Toast, { DURATION } from 'react-native-easy-toast'

export default class ColorLabelsScreen extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            listData: [],
            userId: this.props.navigation.state.params.userId,
            isEditMode: false,
            colorsIdNeedToDelete: [],
            isAsyncLoader: true,
            animatedStyle: styles.rowTextContainter,

        }
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.moveToNextScreen,
            gotoBack: this.moveToPreviousScreen
        })
        this._getColorList()
        this._addEventListener()

    }

    moveToNextScreen = () => {
        this._removeEventListener();
        const { state, navigate } = this.props.navigation;
        navigate("AddColorLabels", {
            screen: "Color Label", onGoBack: this.refresh,
            headerRight: "Save", userId: this.props.navigation.state.params.userId, leftHeader: BreadCrumbConstant.CANCEL
        })

    }

    refresh = () => {
        this.setState({
            isEditMode: false,
            colorsIdNeedToDelete: [],
            isAsyncLoader: true,
        }, function () {
            this._getColorList()
            this._addEventListener()
            //this.expandElement()

        })

        //this.expandElement()

    }

    moveToPreviousScreen = () => {
        //console.log("props", this.props)
        this.props.navigation.state.params.onGoBack(false);
        this.props.navigation.goBack();
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
                        colorObject = {
                            colorId: color._id,
                            visibility: false,
                            data: color
                        }
                        studentListData.push(colorObject)

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
                    //this.setLoading(false)
                    this.setState({
                        isAsyncLoader: false
                    })
                    this._showToastMessage(responseJson.message)
                }
                ////console.log('response===' + JSON.stringify(responseJson))

            })
            .catch((error) => {

                //console.log("error===" + error)
            })
    }

    //it will help to set edit is on off
    _handleEditClick = () => {
        if (!this.state.isEditMode) {
            this.setState({
                isEditMode: true
            }, function () {
                this.collapseElement()
            })
            //this.collapseElement()
        } else {
            this.setState({
                isEditMode: false
            }, function () {
                this.expandElement()
            })
            //this.expandElement()
        }


    }

    //_setVisiblityOfItem
    _setVisiblityOfItem = (item, index) => {
        if (this.state.isEditMode) {
            let posts = this.state.listData.slice();
            let targetPost = posts[index];
            if (targetPost.visibility) {
                var indexNeedToDelete = this.state.colorsIdNeedToDelete.indexOf(targetPost.colorId)
                this.state.colorsIdNeedToDelete.splice(indexNeedToDelete, 1);
            }
            else {
                this.state.colorsIdNeedToDelete.push(targetPost.colorId)
            }
            targetPost.visibility = !targetPost.visibility;
            this.setState({ posts });
        }
        else {
            this._gotoAddColorScreen(item, true)
        }
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
            leftHeader: BreadCrumbConstant.CANCEL,
            onGoBack: () => this.refresh()
        });
        // }



    }

    //_onDeleteCutomizeColors
    _onDeleteCutomizeColors() {
        if (this.state.colorsIdNeedToDelete.length > 0) {

            // this.setLoading(true);
            this.setState({
                isLoaderShown: true
            })
            var url = API.BASE_URL + API.API_ADD_COLOR_LABLES + API.API_BULK_DELETE_CLASS
            var body = { _id: this.state.colorsIdNeedToDelete }
            var userId = TeacherAssitantManager.getInstance().getUserID()

            //console.log("url _onDeleteCutomizeColors is", url)
            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    'userId': TeacherAssitantManager.getInstance().getUserID(),
                },
                body: JSON.stringify( body )

            })
                .then((responseJson) => {

                    //console.log('response===' + JSON.stringify(responseJson))
                    //console.log('Body  _onDeleteCutomizeColors ' + JSON.stringify(body))
                    //console.log('userId ' + JSON.stringify(userId))

                    this.setLoading(false);
                    // if (!responseJson.success) {
                    //     // this.setLoading(false);

                    //     // this.refresh();

                    //     // this.setState({
                    //     //     isLoaderShown: false
                    //     // })
                    //     // var msg = responseJson.message;

                    //     //  this._updateListAfterDelete()
                    // } else {
                        // this.setLoading(false);
                        // this.setState({
                        //     isLoaderShown: false
                        // })
                        this._showToastMessage(responseJson.message)
                        // this.showAlert(responseJson.message)
                    // }
                })
                .catch((error) => {
                    this.setLoading(false);
                    this.setState({
                        isLoaderShown: false
                    })
                    //console.log("error===" + error)
                })
        } else {
            this._showToastMessage('Please select color label to delete.')
            // this.showAlert('Please select Student to delete.')
        }
    }
    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }
    _updateListAfterDelete = () => {
        // var deletedStudents=0;

        if (this.state.listData.length > 0) {

            var array = [...this.state.listData];

            for (var i = 0; i < this.state.colorsIdNeedToDelete.length; i++) {
                //console.log('for studentList')
                //console.log(this.state.colorsIdNeedToDelete[i])

                var index = array.findIndex(actionObject => actionObject.data._id == this.state.colorsIdNeedToDelete[i]);
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



    // event listener for socket
    _addEventListener = () => {
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

    //help to remove Listner
    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addColorLabelListener)
        EventRegister.removeEventListener(this.removeColorLabelListener)
        EventRegister.removeEventListener(this.updateColorLabelListener)
    }

    //_addDataToColorLabel
    _addDataToColorLabel = (color) => {
        var colorList = [...this.state.listData]
        var listDataObject = {}
        listDataObject = {
            colorId: color._id,
            visibility: false,
            data: color
        }
        colorList.push(listDataObject)
        this.setState({
            listData: colorList
        })


    }

    //_removeColorLabel
    _removeColorLabel = (colorsIdList) => {

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            //console.log(colorsIdList._id)
            var array = [...this.state.listData];

            for (var i = 0; i < colorsIdList._id.length; i++) {
                //console.log('for studentList')
                //console.log(colorsIdList._id[i])

                var index = array.findIndex(actionObject => actionObject.colorId == colorsIdList._id[i]);
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

            var index = array.findIndex(colorObject => colorObject.colorId == color._id);
            //console.log('index');
            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(this.state.listData[index]);
                var pickerAction = this.state.listData[index];
                pickerAction.data = color
                const updatedStudentActions = update(this.state.listData, { $splice: [[index, pickerAction.data]] });  // array.splice(start, deleteCount, item1)
                this.setState({ listData: updatedStudentActions });

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




    //define header (navigation Bar)
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        // var title = params.screen
        var title = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_COLOR_LABEL, 2)
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
                <TouchableOpacity
                    onPress={() => params.onAdd()}>
                    <Image style={StyleTeacherApp.rightImageViewHeader}
                        source={require('../img/icon_add.png')}>
                    </Image>
                </TouchableOpacity>
            

        }
    }

    _renderItem = ({ item, index }) => {
        //const { this.state.listData } = this.state
        var data = item.data
        var colorPreview = TeacherAssitantManager.getInstance()._rgbToHex(data.red, data.green, data.blue)


        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._setVisiblityOfItem(item, index)} >
                    <View style={styles.rowContainer}>
                        {
                            this.state.isEditMode ?
                                <View style={{
                                    flex: 0.2, justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    {
                                        item.visibility ?
                                            <Image style={{
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
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                <View style={{ backgroundColor: colorPreview, width: 40, height: 40, margin: 2 }}>


                                </View>
                                <View style={styles.rowTextView}>
                                    <Text numberOfLines={1}>
                                        {`${data.name}`}
                                    </Text>

                                </View>


                            </View>

                        </View>
                        <View style={styles.touchStyle}>
                            {/* <View style={styles.imageContainer}> */}
                            {/* <View style={styles.imageInfoContainer}> */}
                            <View style={{
                                // fontSize: 15,
                                marginLeft: 1,
                                flex: 0.8,
                                justifyContent: "center",
                            }}>
                                <Text style={{ alignSelf: "flex-end" }} numberOfLines={1}>
                                    {`${data.point}`}
                                </Text>

                            </View>
                            <View style={{ justifyContent: 'center', alignItems: "center", flex: 0.2 }}>
                                <Image style={styles.imageView}
                                    source={require('../img/icon_arrow.png')}>
                                </Image>
                            </View>

                        </View>

                    </View>
                </TouchableOpacity>
            </View>



        );
    };

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        // const { this.state.listData } = this.state
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
                            <View key={rowId} style={styles.separator}
                            />
                        )}
                        onEndReachedThreshold={0.8}
                        // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(this.state.listData)}
                        onEndReached={this.loadMoreColorLables}
                        ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}

                    />
                </View>
                <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                />
                <View style={styles.bottomOuterView}>
                    <View style={styles.bottomInnerView}>
                        <TouchableOpacity onPress={() => this._handleEditClick()}>
                            <Text style={styles.text}>{!this.state.isEditMode ? "Edit" : "Done"}</Text>
                        </TouchableOpacity>
                        {
                            this.state.isEditMode &&
                                <TouchableOpacity
                                    onPress={() => this._onDeleteCutomizeColors()}>
                                    <Text style={styles.text}>Delete</Text>
                                </TouchableOpacity>
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
        backgroundColor: 'white'
    },
    rowTextContainter: {
        flex: 0.9
    },
    editRowTextContainter: { flex: 0.7 },
    rowTextView: {
        // color: "black",
        // fontSize: 15,
        marginLeft: 10,
        flex: 0.9,
        //alignItems: 'center',
        justifyContent: "center",
    },
    touchStyle: {
        flex: 0.5,
        //alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        flexDirection: 'row',

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
});