import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    FlatList,
    SafeAreaView,
    TextInput
} from 'react-native'
import API from '../constants/ApiConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import API_PARAM from '../constants/ApiParms';
import Loader from '../ActivityIndicator/Loader';
import { EventRegister } from 'react-native-event-listeners'
import SocketConstant from '../constants/SocketConstant';
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";

import Toast, { DURATION } from 'react-native-easy-toast'
import { Keyboard } from 'react-native';

export default class AddPickerActionValue extends React.PureComponent {
    constructor(props) {
        super(props)

        var stateParams = this.props.navigation.state.params;
        // stateParams.pickerdata.colorLabelID._id
        this.state = {
            listData: [],
            userId: stateParams.userId,
            isEditMode: false,
            colorLabelID: stateParams.headerRight == "Save" ?
                '' :
                (stateParams.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER) ?
                    (stateParams.pickerdata.colorLabelID == null ? '' : stateParams.pickerdata.colorLabelID._id) :
                    '',
            item: stateParams.item,
            pickerdata: stateParams.pickerdata,
            pickerValue: stateParams.pickerdata.value,
            loading: false,
            selectedDataType: stateParams.item.dataType.toLowerCase(),
            isAsyncLoader: true

        }
    }
    // componentDidMount() {
    //     //hit Api Here
       
    // }
    componentDidMount() {
        if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER) {
            this._getColorList()
            this._addEventListener()
        }
        this.props.navigation.setParams({
            onAdd: this._savePickerData,
            gotoBack: this.moveToPreviousScreen
        })

    }

    _savePickerData = () => {

        Keyboard.dismiss

        if (this.state.pickerValue.trim() == '') {
            this._showToastMessage('Please add' + ' ' + this.props.navigation.state.params.screenTitle)
            // TeacherAssitantManager.getInstance().showAlert('Please add' + ' ' + this.props.navigation.state.params.screenTitle)
        }
        else if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER && this.state.listData.length == 0) {
            this._showToastMessage('Please add custom colors')
            // TeacherAssitantManager.getInstance().showAlert('Please add custom colors')
        }
        else if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_COLORPICKER && this.state.colorLabelID.trim() == '') {
            this._showToastMessage('Please select custom color')
            // TeacherAssitantManager.getInstance().showAlert('Please select custom color')
        }
        else {
            this.setState({
                loading: true
            });
            // console.log("flksdf", this.state.pickerdata._id)
            var url = API.BASE_URL + API.API_SAVE_ACTION_FIELD_PICKER + "/unique" + (this.props.navigation.state.params.headerRight.toLowerCase() == 'save' ? '' : '/' + this.state.pickerdata._id)
            // var url = API.BASE_URL + API.API_SAVE_ACTION_FIELD_PICKER + (this.props.navigation.state.params.headerRight.toLowerCase() == 'save' ? '' : '/' + this.state.pickerdata._id)
            var userId = TeacherAssitantManager.getInstance().getUserID()
            var headerValue =
            {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId
            }
            var bodyValue = {}
            if (this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_PICKER) {
                bodyValue = {
                    createdBy: userId,
                    actionFieldID: this.state.item._id,
                    value: this.state.pickerValue,
                    isDefault: this.state.item.isDefault
                }
            } else {
                bodyValue = {
                    createdBy: userId,
                    actionFieldID: this.state.item._id,
                    value: this.state.pickerValue,
                    isDefault: this.state.item.isDefault,
                    colorLabelID: this.state.colorLabelID

                }
            }

            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: this.props.navigation.state.params.headerRight.toLowerCase() == 'save' ? 'POST' : 'PUT',
                headers: headerValue,
                body: JSON.stringify(bodyValue)
            })
                .then((responseJson) => {
                    if (responseJson.success) {
                        this.setState({
                            loading: false
                        });
                        this._showToastMessage(responseJson.message)
                        // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                        let self = this
                        setTimeout(() => {
                            self.moveToPreviousScreen();
                        }, 300);

                    } else {
                        this.setState({
                            loading: false
                        });
                        this._showToastMessage(responseJson.message)
                        // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                    }
                })
                .catch((error) => {

                    // console.log("error===" + error)
                })


        }



    }

    moveToPreviousScreen = () => {
        Keyboard.dismiss;

        // console.log("props", this.props)
        this.props.navigation.state.params.onGoBack(false);
        this.props.navigation.goBack();
    }



    //getCloloList 
    _getColorList() {

        var userId = TeacherAssitantManager.getInstance().getUserID();

        var url = API.BASE_URL + API.API_LIST_USER_COLOR_LABELS + userId

        var headerValue =
        {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': userId
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
                        var colorID = color._id
                        colorObject = {
                            colorId: colorID,
                            data: color,
                            selectionVisibilty: this.state.colorLabelID == colorID ? true : false
                        }
                        studentListData.push(colorObject)

                    }
                    // console.log("Student data is ", studentListData)

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
                    // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                }
                //console.log('response===' + JSON.stringify(responseJson))

            })
            .catch((error) => {
                this.setState({
                    isAsyncLoader: false

                })
                // console.log("error===" + error)
            })



    }

    _handleEditClick = () => {
        var colorArray = this.state.listData;
        for (var i = 0; i < colorArray.length; i++) {
            colorArray[i].visibility = false;
            colorArray[i].selectionVisibilty = false;
        }
        if (!this.state.isEditMode) {
            //this.props.navigation.state.params.isheaderRightShow = false
            this.props.navigation.setParams(
                {
                    isheaderRightShow: false
                }
            )
            this.setState({
                isEditMode: true

            })
        } else {
            this.setState({
                isEditMode: false
            })
            this.props.navigation.setParams(
                {
                    isheaderRightShow: true
                }
            )
        }


    }

    //_setVisiblityOfItem
    _setVisiblityOfItem = (item, index) => {

        var colorArray = this.state.listData;
        for (var i = 0; i < colorArray.length; i++) {
            colorArray[i].selectionVisibilty = false;
        }

        let posts = this.state.listData.slice();
        let targetPost = posts[index];
        //if (targetPost.selectionVisibilty) {
        //var indexNeedToDelete = this.state.colorsIdNeedToDelete.indexOf(targetPost.colorId)
        this.setState({
            colorLabelID: targetPost.colorId
        });
        //}
        // else {
        //     this.state.colorsIdNeedToDelete.push(targetPost.colorId)
        // }
        targetPost.selectionVisibilty = !targetPost.selectionVisibilty;
        this.setState({ posts });
    }

    //_onDeleteCutomizeColors
    _onDeleteCutomizeColors() {
        if (this.state.colorsIdNeedToDelete.length > 0) {

        } else {
            this._showToastMessage('Nothing to delete')
            // TeacherAssitantManager.getInstance().showAlert('Nothing to delete')
        }
    }
    _addEventListener = () => {

        this.addColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_ADD_COLOR_LABEL, (data) => {
            // if( this.state.selectedDataType==API_PARAM.ACTION_COLORPICKER) {
            this._addDataToColorLabel(data)
            // }
        })

        this.removeColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_COLOR_LABEL_BULK, (data) => {
            // console.log('removeStudentListener');
            //if( this.state.selectedDataType==API_PARAM.ACTION_COLORPICKER) {
            this._removeColorLabel(data)
            // }
        })

        this.updateColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_COLOR_LABEL, (data) => {
            // console.log('UpdateStudentListener');
            //if( this.state.selectedDataType==API_PARAM.ACTION_COLORPICKER) {
            this._updateColorLabel(data)
            // }
        })
    }
    //add data to student
    _addDataToColorLabel = (color) => {
        let listDataObject =  {
            colorId: color._id,
            selectionVisibilty: false,
            data: color
        }
        // this.state.listData.push(listDataObject)
        let _listData = [...this.state.listData]
        _listData.push(listDataObject)
        this.setState({
            listData: _listData
        })




    }

    //remove student data
    _removeColorLabel = (colorsIdList) => {

        if (this.state.listData.length > 0) {

            // console.log('_removeStudentData')
            // console.log(colorsIdList._id)
            let array = [...this.state.listData];

            for (var i = 0; i < colorsIdList._id.length; i++) {
                // console.log('for studentList')
                // console.log(colorsIdList._id[i])

                let index = array.findIndex(actionObject => actionObject.colorId == colorsIdList._id[i]);
                // console.log('index' + index)

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


    _updateColorLabel(color) {

        if (this.state.listData.length > 0) {
            // console.log('_UpdateStudentData');

            // console.log(color);
            let array = [...this.state.listData]

            let index = array.findIndex(colorObject => colorObject.colorId == color._id);
            // console.log('index');
            // console.log(index);
            if (index > -1) {
                var pickerAction = array[index];
                pickerAction.data = color
                array[index] = pickerAction
                this.setState({ listData: array });
            }
        }

    }

    //define header (navigation Bar)
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            //title:`${navigation.state.param.title}`,
            title: '' + ` ${navigation.state.params.screenTitle}`,
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=><TouchableOpacity onPress={() => params.gotoBack()}>
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
            headerRight:  () => navigation.state.params.isheaderRightShow
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
        var colorPreview = TeacherAssitantManager.getInstance()._rgbToHex(data.red, data.green, data.blue)


        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._setVisiblityOfItem(item, index)} >
                    <View style={styles.rowContainer}>
                        {
                            this.state.isEditMode ?
                                <View style={styles.iconImageContainer}>
                                    {
                                        item.visibility ?
                                            <Image style={styles.iconImage}
                                                name="search"
                                                source={require("../img/check_icon.png")} /> : null
                                    }
                                </View>
                                : null
                        }
                        <View style={styles.rowTextContainter}>
                            <View style={{ backgroundColor: colorPreview, width: 40, height: 40, margin: 2 }}>


                            </View>
                            <View style={styles.rowText}>
                                <Text numberOfLines={1} style={styles.rowItemActionPickerText}>
                                    {`${data.name}`}
                                </Text>
                                <Text style={{ height: '40%' }} numberOfLines={1}>
                                    {`${data.point}`}
                                </Text>

                            </View>

                        </View>
                        {
                            this.state.isEditMode ?
                                <View style={styles.touchStyle}>
                                    {/* <View style={styles.imageContainer}> */}
                                    {/* <View style={styles.imageInfoContainer}> */}
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

                                </View>
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
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_PICKER ? 'white' : 'transparent' }]}>
                <Loader loading={this.state.loading} />
                <Toast ref={o => this.toast = o}
                    position={'bottom'}
                    positionValue={200}
                />
                <View style={styles.headerContainer}>
                    <TextInput style={styles.pickerInputText}
                        underlineColorAndroid="transparent"
                        placeholder={"Add " + this.props.navigation.state.params.screenTitle}
                        value={this.state.pickerValue}
                        onChangeText={(text) => this.setState({ pickerValue: text })}
                    ></TextInput>
                </View>
                {
                    this.state.item.dataType.toLowerCase() == API_PARAM.ACTION_PICKER ?
                        null
                        :
                        <View style={styles.listContainer}>
                            <Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold', marginLeft: 15, marginBottom: 10 }}> Colors </Text>
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
                            />
                        </View>
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
    // rowTextContainter: {
    //     flex: 0.8,
    //     flexDirection: 'row'
    // },
    rowTextContainter: {
        flex: 0.7,
        flexDirection: 'row',
        marginLeft: 10
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
    pickerInputText: {
        margin: 40,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        paddingStart: 8,
        paddingEnd: 8

    },
    headerContainer: {
        // flex: 0.15,
        justifyContent: "center"
    },
    listContainer: { flex: 0.999 },

    bottomViewSeprator:
        { flex: 0.002, backgroundColor: 'gray' },

    iconImageContainer: {
        flex: 0.25, justifyContent: 'center',
        alignItems: 'flex-end',
    },
    iconImage: {
        height: 16,
        width: 16,

    },
    infoIconImageContainer: {
        marginLeft: 15,
        flex: 0.75,
        justifyContent: "center",
        alignItems: "center",
    },
    rowItemActionPickerText: { height: '60%', justifyContent: 'center', marginTop: 2 }


});