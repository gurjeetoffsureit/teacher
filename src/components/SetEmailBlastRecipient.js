import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ScrollView,
    Linking,
    Alert,
    Platform, FlatList,
    TouchableOpacity, Image, SafeAreaView
} from 'react-native';

import dropboxKey from '../constants/DropboxConstant';
import Loader from '../ActivityIndicator/Loader';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import API from '../constants/ApiConstant'
import ComingFrom from '../constants/ComingFrom'

import { EventRegister } from 'react-native-event-listeners'
import SocketConstant from '../constants/SocketConstant';
import update from 'react-addons-update'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import Toast, { DURATION } from 'react-native-easy-toast'

export default class SetEmailBlastRecipient extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            listData: [{ name: "All Students" }],
            page: 1,
            limit: 100,
            classCount: 0,
            isAsyncLoader: true,
            comingFrom: this.props.navigation.state.params.comingFrom
        }
    }
    componentDidMount() {

        this._getClassesList()
        this._addEventListener()
        this.props.navigation.setParams({
            //    onAdd: this.saveActions,
            gotoBack: this.moveToPreviousScreen
        })
    }

    // getting data from socket 
    // still to implement
    _addDataToFromSocket = (object) => {

        //console.log('_addDataToFromSocket')
        //console.log(object)
        if (this.state.classCount == this.state.listData.length) {
            this.state.listData.push(object)
            this.setState({
                listData: this.state.listData,
            });
        }
        this.setState({
            classCount: this.state.classCount + 1,
        });


    }

    // remove data 
    _removeDataFromClass = (object) => {

        var array = [...this.state.listData];
        var classIDList = object._id
        for (var i = 0; i < classIDList.length; i++) {
            ////console.log(data[i].studentID)

            var index = array.findIndex(classObject => classObject._id == classIDList[i]);
            //console.log('index' + index)

            if (index > -1) {
                array.splice(index, 1);
            }
        }
        this.setState({
            listData: array,
            classCount: this.state.classCount - 1
        })

        //console.log("data is", array)
    }

    _updateClassList = (object) => {


        var classList = this.state.listData

        var index = classList.findIndex(classObject => classObject._id == object._id);
        if (index > -1) {
            var _class = classList[index];
            _class.name = object.name;
            const updatedClasses = update(classList, { $splice: [[index, _class]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedClasses });
        }

    }

    _addEventListener = () => {
        this.addClasslistener = EventRegister.addEventListener(SocketConstant.ON_ADD_CLASS, (data) => {
            this._addDataToFromSocket(data)
        })

        this.removeBulkClassListener = EventRegister.addEventListener(SocketConstant.REMOVE_BULK_CLASS, (data) => {
            this._removeDataFromClass(data)
        })

        this.updateClassListener = EventRegister.addEventListener(SocketConstant.UPDATE_CLASS, (data) => {
            this._updateClassList(data)
        })
    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addClasslistener)
        EventRegister.removeEventListener(this.removeBulkClassListener)
        EventRegister.removeEventListener(this.updateClassListener)
    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing,
            isAsyncLoader: isShowing
        });
    }

    moveToPreviousScreen = () => {
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }


    _getClassesList = () => {
        this.setLoading(true)
        var userId = TeacherAssitantManager.getInstance().getUserID()
        //this.setLoading(true);
        //var url = API.BASE_URL + API.API_CLASSES + API.API_GET_BY_USER_ID + userId
        var url = API.BASE_URL + API.API_CLASSES + API.API_GET_BY_USER_ID + userId + API.API_PAGINATION + this.state.page + '/' + this.state.limit

        //console.log('class url===' + url)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {
                // 'Content-Type': 'application/x-www-form-urlencoded',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId
            }
        })
            .then((responseJson) => {
                //console.log("response==" + JSON.stringify(responseJson))
                if (responseJson.success) {
                    var newArray = this.state.listData
                    var responseData = responseJson.data
                    var classData = responseData.classesData;

                    this.setState({
                        listData: [...newArray, ...classData],
                        classCount: responseData.count,
                    });
                    //console.log("listData", this.state.listData)
                    this.setLoading(false);
                } else {
                    this.setLoading(false);
                    this._showToastMessage(responseJson.message)
                }

            })
            .catch(error => {
                //console.log("error==" + error)
                this.setLoading(false);
            })
    }

    refresh = (text) => {
        // if (text == true) {
        //     this.props.navigation.state.params.onGoBack();
        //     this.props.navigation.goBack();
        // }

    }

    _handleRowClick = (item, index) => {
        var classId = ''

        var screenData = {
            screenTitle: 'Select Students', headerRight: this.state.comingFrom == ComingFrom.STUDENT_ACTION_FIELDS?'Assign':'Email',
            selectedActionList: this.props.navigation.state.params.selectedActionList,
            selectedClassId: classId, onGoBack: this.refresh, comingFrom: ComingFrom.ACTION_TO_MANY
        }

        if (index != 0) {
            screenData.selectedClassId = item._id
            screenData.createdBy = item.createdBy
        }

        this.props.navigation.navigate("AllStudentsList", screenData)



    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var title = params.screen
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
        return {
            title: '' + ` ${title}`,
            gestureEnabled: false,
            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.gotoBack()}>
                    {
                        (Platform.OS === "android") ?
                            <Image
                                style={styles.imageViewHeader}
                                source={require("../img/back_arrow_android.png")}
                                text="dflslfasf"
                            /> :
                            <Image
                                style={styles.imageViewHeader}
                                source={require("../img/back_arrow_ios.png")}
                                text="dflslfasf"
                            />
                    }
                </TouchableOpacity>

                ,
        }
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        var isComingFromHomeScreen = this.state.comingFrom == ComingFrom.EmailBlastRecipient
        // var selectedStyle = (isComingFromHomeScreen?styles.HomeScreenConatinerFlexValue:
        //     styles.ActionToManyConatinerFlexValue)
        return (
            <SafeAreaView style={styles.container}>
            <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                {/* <View style={isComingFromHomeScreen?:styles.container}> */}
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
                    />
                    {

                        isComingFromHomeScreen ?
                            <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                            /> : null
                    }
                    {
                        isComingFromHomeScreen ?
                            <View style={styles.bottomOuterView}>
                                <View style={styles.bottomInnerView}>
                                    <TouchableOpacity style={styles.editView}
                                        onPress={() => this._gotToEmailBlast()}>
                                        <Text style={styles.textInnnerView}>Go to Email Blast</Text>
                                    </TouchableOpacity>
                                </View>
                            </View> : null
                    }
                {/* </View> */}
            </SafeAreaView>

        );
    }
_gotToEmailBlast(){
    this.moveToPreviousScreen()
}
    

    _renderItem = ({ item, index }) => {
        //console.log("item is", item)
        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._handleRowClick(item, index)}
                    style={styles.button}>
                    <Text style={styles.buttonText}>{item.name}</Text>
                    <Image
                        style={styles.imageView}
                        source={require('../img/icon_arrow.png')} />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    HomeScreenConatinerFlexValue: {
        flex: 0.9
    },
    ActionToManyConatinerFlexValue: {
        flex: 1
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#8E8E8E",
        marginLeft: 10,
        marginRight: 10
    },
    button: {
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        marginLeft: 10,
        marginRight: 10

    },

    buttonText: {
        color: 'black',
        fontSize: 18,
        marginLeft: 10,
        alignItems: 'flex-start',
        flex: 1,


    },
    imageView: {
        alignItems: 'flex-end',
        height: 16,
        width: 16,
        marginRight: 10,

    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    textInnnerView: {
        fontSize: 16,
        color: '#4799EB',
        textAlign: 'center'
    },
    bottomOuterView: {
        flex: 0.08,
        backgroundColor: 'white'
    },
    bottomInnerView: {
        // flexDirection: 'row',
        flex: 1, alignItems: 'center',
        justifyContent: 'center',
        // marginLeft: 10,
        // marginRight: 10
    },
});