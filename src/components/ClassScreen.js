import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,

    TouchableOpacity, Platform, SafeAreaView,
    FlatList, UIManager, LayoutAnimation
} from 'react-native';
import API from '../constants/ApiConstant'
import { EventRegister } from 'react-native-event-listeners'
import Terminology from '../constants/Terminology'
import SocketConstant from '../constants/SocketConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import update from 'react-addons-update'
import ComingFrom from '../constants/ComingFrom'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader';
import AppConstant from "../constants/AppConstant";
import Loader from '../ActivityIndicator/Loader';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'

export default class ClassScreen extends React.PureComponent {

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.onAddPress, onLeftHeaderClick: this._onLeftHeaderClick,
            onCount: this.onCountSet
        });

        // this._sub = this.props.navigation.addListener(
        //     'didFocus',
        //     this.refreshScreen
        // );

        this.refreshScreen()
        this._addEventListener()
    }


    refreshScreen = () => {
        this.setState({ page: 1, classesList: [], isAsyncLoader: true }, function () {
            this.getClassData();
        })
    }

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            isEditMode: false,
            classIds: [],
            classesList: [],
            editText: 'Edit',
            loading: false,
            page: 1,
            classCount: 0,
            isAsyncLoader: true,
            isFetchingFromServer: false,
            animatedStyle: styles.rowTextContainter,
            comingFrom: this.props.navigation.state.params.comingFrom
        }
    }
    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }


    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        // this.state = {
        //     classCount: 0
        // }
        return {
            title: ` ${navigation.getParam('classCount', '0')}`,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,
            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.onLeftHeaderClick()}>

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
                    <Image
                        style={StyleTeacherApp.rightImageViewHeader}
                        source={require("../img/icon_add.png")}
                    />
                </TouchableOpacity>
        }
    }

    onAddPress = () => {
        const { state, navigate } = this.props.navigation;
        navigate("AddClass", {
            title: "Add",
            userId: this.props.navigation.state.params.userId,
            className: '',
            classCount: this.props.navigation.state.params.classCount,
            headerRight: 'Save',
            leftHeader: BreadCrumbConstant.CANCEL,
            createdBy: TeacherAssitantManager.getInstance().getUserID(),
            onGoBack: () => this.refresh()

        })
        this.setState({
            isEditMode: false, editText: 'Edit'
        })
    }

    refresh() {
        //  this.getClassData();
    }

    _onLeftHeaderClick = () => {
        this._removeEventListener()
        var comingFrom = this.state.comingFrom
        switch (this.state.comingFrom) {
            case ComingFrom.HOME_SCREEN:
                this.props.navigation.state.params.onGoBack();
                this.props.navigation.goBack();
                break
            case ComingFrom.STUDENT_ACTIONS:
                this.props.navigation.pop(3)
                this.props.navigation.state.params.onGoBack(true);
                break
        }
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {/* <View style={styles.container}> */}
                <Loader loading={this.state.loading} />
                <Toast ref={o => this.toast = o}
                    position={'bottom'}
                    positionValue={200}
                />
                <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
                {/* <View style={{ flex: 0.918 }}></View> */}
                {/* <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                    /> */}

                <View style={{ flex: 0.918 }}>
                    <FlatList
                        style={{ flex: 1, backgroundColor: 'white' }}
                        data={this.state.classesList}
                        extraData={this.state.classesList}
                        renderItem={this.renderCell}
                        onRefresh={() => this.getClassDataWithLoader()}
                        refreshing={this.state.loading}
                        onEndReached={this.loadMoreStudents}
                        onEndReachedThreshold={0.8}
                        // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(this.state.classesList)}
                        keyExtractor={(item, index) => `${index}`}
                        ItemSeparatorComponent={(sectionId, rowId) => (
                            <View key={rowId} style={styles.separator} />
                        )}
                        ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                    />
                </View>
                <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                />
                <View style={styles.bottomOuterView}>
                    <View style={styles.bottomInnerView}>
                        {/* <View style={styles.bottomView}> */}
                        <TouchableOpacity style={styles.editView}
                            onPress={() => this._onEditPress()}>
                            <Text style={styles.textInnnerView}>{this.state.editText}</Text>
                        </TouchableOpacity>
                        {
                            this.state.isEditMode ?
                                <TouchableOpacity style={styles.deleteView}
                                    onPress={() => this._onDeletePress()}>
                                    <Text style={styles.textInnnerView}>Delete</Text>
                                </TouchableOpacity> : null
                        }
                        {/* </View> */}
                    </View>
                </View>

                {/* <View style={styles.containerBottom}>

                        <View style={styles.bottomView}>
                            <TouchableOpacity style={styles.editView}
                                onPress={() => this._onEditPress()}>
                                <Text style={styles.textInnnerView}>{this.state.editText}</Text>
                            </TouchableOpacity>
                            {
                                this.state.isEditMode ?
                                    <TouchableOpacity style={styles.deleteView}
                                        onPress={() => this._onDeletePress()}>
                                        <Text style={styles.textInnnerView}>Delete</Text>
                                    </TouchableOpacity> : null
                            }
                        </View>
                    </View> */}
                {/* </View> */}
            </SafeAreaView>
        )
    }

    renderCell = (item, index) => {
        var item = item.item
        var index = this.state.classesList.indexOf(item)
        var isSearched = (TeacherAssitantManager.getInstance().getUserID() == item.listdata.createdBy) ? "" : "Shared "
        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._pressDeleteRow(item, index)}
                >
                    <View style={styles.rowContainer}>
                        {
                            this.state.isEditMode ?
                                <View style={styles.deleteContainer}>
                                   

                                    {
                                        item.visibilty ?
                                            <View style={styles.imageContainer}>
                                                <Image style={styles.imageView}
                                                    source={require('../img/check_icon.png')}>
                                                </Image>
                                            </View> : null
                                    }
                                </View> : null
                        }
                        <View style={this.state.isEditMode ? { flex: 0.8 } : styles.classContainer}>
                            <Text style={styles.rowText}>
                                {isSearched}{item.listdata.name.trim()}
                            </Text>
                            <Text style={styles.rowText}>
                                {
                                    TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, item.studentCount)
                                    + AppConstant.COLLON + item.studentCount
                                    // item.studentCount > 1 ? Terminology.studentPulral + item.studentCount : Terminology.studentSingular + item.studentCount
                                }
                            </Text>
                            {/* <Text style={styles.rowText}>
                            Student:
                            </Text> */}
                        </View>

                        <TouchableOpacity style={styles.touchStyle}
                            onPress={() => this._pressRow(item, index)}>
                            <View style={styles.imageContainer}>
                                <View style={styles.imageInfoContainer}>
                                    <Image style={styles.imageView}
                                        source={require('../img/icon_info.png')}>
                                    </Image>

                                </View>
                                <View style={styles.imageNextContainer}>
                                    <Image style={styles.imageView}
                                        source={require('../img/icon_arrow.png')}>
                                    </Image>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

            </View>
        )
    }

    _pressDeleteRow = (data, index) => {

        //console.log("data", data)
        //console.log("index", index)

        if (this.state.isEditMode) {
            var newArray = this.state.classesList.slice();
            var _class = newArray[index]
            if (_class.listdata.createdBy == TeacherAssitantManager.getInstance().getUserID()) {
                newArray[index] = {
                    listdata: _class.listdata,
                    visibilty: _class.visibilty == false ? true : false,
                    studentCount: _class.studentCount
                };

                if (data.visibilty) {
                    var newIndex = this.state.classIds.indexOf(data.listdata._id)
                    this.state.classIds.splice(newIndex, 1);
                } else {
                    this.state.classIds.push(data.listdata._id)
                }

                this.setState({
                    classesList: newArray,
                    classData: newArray,
                });
                //console.log('class ids==' + JSON.stringify(this.state.classIds))
            }
            else {
                this._showToastMessage(TextMessage.YOU_ARE_NOT_AUTHORIZED)
                // TeacherAssitantManager.getInstance().showAlert(TextMessage.YOU_ARE_NOT_AUTHORIZED)
            }
        }
        else {
            this._pressClasssName(data, index)
        }


    }

    _pressClasssName = (rowData, rowId) => {
        const { state, navigate } = this.props.navigation;

        if (this.state.isEditMode) {
            this._pressDeleteRow(rowData, rowId)
        } else {
            var rowInfor = rowData.listdata
            navigate("StudentScreen",
                {
                    userId: this.props.navigation.state.params.userId,
                    className: rowInfor.name,
                    classId: rowInfor._id,
                    createdBy: rowInfor.createdBy,
                    onGoBack: () => this.refresh(),
                    comingFrom: ComingFrom.CLASSES_SCREEN,
                    leftHeader: BreadCrumbConstant.CLASSES

                })
            this.setState({
                isEditMode: false, editText: 'Edit',

            })
        }
    }

    _pressRow = (rowData, rowId) => {
        const { state, navigate } = this.props.navigation;
        navigate("AddClass",
            {
                title: "Update ",
                createdBy: rowData.listdata.createdBy,
                className: rowData.listdata.name,
                classCount: this.props.navigation.state.params.classCount,
                classId: rowData.listdata._id,
                headerRight: 'Update',
                leftHeader: BreadCrumbConstant.CANCEL,
                onGoBack: () => this.refresh()
            })

        this.setState({
            isEditMode: false, editText: 'Edit',

        })
    }

    _onEditPress = () => {

        if (this.state.editText === 'Edit') {
            this.setState({
                isEditMode: true,
                editText: 'Done'
            }, function () {
                this.collapseElement()
            })

        } else {
            this.setState({
                isEditMode: false,
                editText: 'Edit'
            }, function () {
                this.expandElement()
            })

        }

        // if(this.state.editText==='Done'){
        var listobject = {}
        var listData = []

        var classesList = this.state.classesList
        for (var i = 0; i < classesList.length; i++) {
            //var object = 
            classesList[i].visibilty = false
            // listobject = {
            //     visibilty: false,
            //     listdata: this.state.classesList[i].listdata,
            //     //studentCount: 0
            // }

            // listData.push(listobject)
        }

        this.setState({
            classesList: this.state.classesList,
            //classData: listData,
            classIds: []
        })
        // }
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

    //easeInEaseOut animation Methods
    collapseElement = () => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            animatedStyle: styles.editRowTextContainter
        })
    }

    _onDeletePress = () => {
        if (this.state.classIds.length > 0) {
            this.setLoading(true)
            //console.log("delete list", this.state.classIds)
            var url = API.BASE_URL + API.API_CLASSES + API.API_BULK_DELETE_CLASS
            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: 'POST',
                headers: {
                    // Accept: 'application/json',
                    // 'Content-Type': 'application/json',
                    // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    // 'userId': TeacherAssitantManager.getInstance().getUserID(),
                },
                body: JSON.stringify({
                    _id: this.state.classIds
                })
            })
                .then((responseJson) => {

                    //console.log('response===' + JSON.stringify(responseJson))
                    if (responseJson.success) {
                        this.setLoading(false)
                        this._showToastMessage(responseJson.message)
                        this.refreshScreen()
                        // this.showAlert(responseJson.message)

                        // this.updateListAfterDelete()
                    } else {
                        this.setLoading(false)
                        this._showToastMessage(responseJson.message)
                        //this.showAlert(responseJson.message)
                    }
                })
                .catch((error) => {
                    this.setLoading(false)
                    //console.log("error===" + error)
                })

        } else {
            this._showToastMessage('Please select class to delete.')
            // this.showAlert('Please select class to delete.')
        }
    }

    updateListAfterDelete = () => {
        var listobject = {}
        var listData = []
        for (var i = 0; i < this.state.classesList.length; i++) {
            if (this.state.classIds.indexOf(this.state.classesList[i].listdata._id) < 0) {
                listobject = {
                    visibilty: false,
                    listdata: this.state.classesList[i].listdata,
                    studentCount: 0
                }
                listData.push(listobject)
            }
        }

        this.updateClassCount(listData.length)

        this.setState({
            classesList: listData,
            classData: listData
        });
    }

    /**
   * This method will get call for pagination
   */

    loadMoreStudents = () => {

        //console.log('this.state.classesList.length' + this.state.classesList.length)
        //console.log('this.state.classCount' + this.state.classCount)

        if (this.state.classesList.length < this.state.classCount && !this.state.isLoadingMore) {
            this.setState({
                isFetchingFromServer: true,
                isLoadingMore: true
            }, function () {
                this.getClassData()
            })
        }
    }

    getClassDataWithLoader = () => {
        this.setLoading(true)
        this.getClassData();
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

        this.addClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_ADD_CLASS_BULK, (data) => {
            this._addClassBulkFromSocket(data)
        })

        this.deleteStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_STUDENT_CLASS_BULK, (data) => {
            //console.log('deleteStudentClassBulkListener');
            this._deleteStudentClassBulkListener(data)
        })

        this.addStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_ADD_STUDENT_CLASS_BULK, (data) => {
            //console.log('addStudentClassBulkListener' + JSON.stringify(data));
            this._addStudentClassBulk(data)
        })

        this.classCount = EventRegister.addEventListener(SocketConstant.ON_COUNT_USER_CLASS, (data) => {
            //console.log('classCount');
            this.setState({
                classCount: data.classCount
            })
            this.updateClassCount(data.classCount)
        })

        this.onSettingsDeleteAll = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
            //console.log('removeSharedStudentLister');

            this._onSettingsDeleteAll(data);


        })

        //For shared Data
        this.removeSharedClassListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_SHARED_CLASS, (data) => {
            this._removeSharedClassData(data)
        })
    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addClasslistener)
        EventRegister.removeEventListener(this.removeBulkClassListener)
        EventRegister.removeEventListener(this.updateClassListener)
        EventRegister.removeEventListener(this.deleteStudentClassBulkListener)
        EventRegister.removeEventListener(this.addStudentClassBulkListener)
        EventRegister.removeEventListener(this.classCount)
        EventRegister.removeEventListener(this.addClassBulkListener)
        EventRegister.removeEventListener(this.removeSharedClassListener)
        EventRegister.removeEventListener(this.onSettingsDeleteAll)
    }


    getClassData() {
        var userId = TeacherAssitantManager.getInstance().getUserID();
        var url = API.BASE_URL + API.API_CLASSES_WITH_STUDENT_COUNT + API.API_GET_BY_USER_ID + userId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;
        //console.log('class url===' + url);
        //console.log("userId", userId);
        headerValues = {
            // 'Content-Type': 'application/x-www-form-urlencoded',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': userId
        };
        requestInfo = {
            method: 'GET',
            headers: headerValues
        };
        TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
            //console.log("response== getClassData getClassData", JSON.stringify(responseJson));
            if (responseJson.success) {
                var newArray = this.state.classesList;
                var classDataList = [];
                var listDataObjet = {};
                var responseData = responseJson.data;
                var classData = responseData.classesData;
                for (var i = 0; i < classData.length; i++) {
                    var _class = classData[i];
                    listDataObjet = {
                        visibilty: false,
                        listdata: _class,
                        studentCount: _class.studentCount
                    };
                    classDataList.push(listDataObjet);
                }
                if (classData.length == 0) {
                    newArray = [];
                }
                this.setState({
                    classCount: responseData.count,
                    classesList: [...newArray, ...classDataList],
                    isLoading: false,
                    //page: responseData.pageCount + 1
                    page: this.state.page + 1,
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false
                });
                this.updateClassCount(responseData.count);
            }
            else {
                this.setState({
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false
                });
                this._showToastMessage(responseJson.message);
                //this.showAlert(responseJson.message)
            }
            this.setLoading(false);
        })
            .catch(error => {
                this.setState({
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false
                });
                //console.log("error==" + error);
            });
    }

    _onSettingsDeleteAll(data) {
        if (data.resetToDefault) {
            this.setState({ page: 1, classesList: [], }, ()=> {
                this.getClassData();
            })
        }
    }
    _removeSharedClassData = (data) => {
        //console.log("_removeSharedClassData" + JSON.stringify(data))
        if (data.isRevoked == true) {
            this.setState({
                classIds: [],
                classesList: [],
                loading: false,
                page: 1,
            }, function () {
                this.getClassData()
            })
        }
    }

    _deleteStudentClassBulkListener = (data) => {
        //console.log("data", data)
        var classList = this.state.classesList
        var classId = data.classId

        var index = classList.findIndex(classobject => classobject.listdata._id == classId)
        if (index > -1) {
            var _class = classList[index];
            _class.studentCount = data.studentCount;
            const updatedClasses = update(classList, { $splice: [[index, _class.studentCount]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedClasses });
        }
    }

    _addStudentClassBulk = (data) => {
        //console.log("data", data)
        var classList = this.state.classesList
        var classId = data.classId
        var index = classList.findIndex(classobject => classobject.listdata._id == classId)
        if (index > -1) {
            var _class = classList[index];
            if (data.data != void 0) {
                _class.studentCount = data.data.length;
            }
            else {
                _class.studentCount = data.studentsData.length;
            }
            const updatedClasses = update(classList, { $splice: [[index, _class.studentCount]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedClasses });
        }
    }

    // getting data from socket 
    _addDataToFromSocket = (object) => {
        //console.log('_addDataToFromSocket')
        //console.log(object)
        var classList = this.state.classesList
        var index = classList.findIndex(classobject => classobject.listdata._id == object._id)
        if (index == -1 && this.state.classCount == this.state.classesList.length) {
            this.state.classesList.push({
                visibilty: false,
                listdata: object,
                studentCount: 0
            })
        }
        this.setState({
            classesList: this.state.classesList,
        });
    }
    //add Class
    _addClassBulkFromSocket = (list) => {
        var classList = this.state.classesList
        //console.log('_addDataToFromSocket')

        for (var i = 0; i < list.length; i++) {
            var object = list[i]
            //console.log(object)


            var index = classList.findIndex(classobject => classobject.listdata._id == object._id)
            if (index == -1) {
                classList.push({
                    visibilty: false,
                    listdata: object,
                    studentCount: 0
                })
            }


        }
        this.setState({
            classesList: classList,
        });


    }



    // remove data 
    _removeDataFromClass = (object) => {
        //console.log('remove data==' + JSON.stringify(object))
        var listData = []
        var classList = this.state.classesList
        for (var i = 0; i < classList.length; i++) {
            if (object._id.indexOf(classList[i].listdata._id) < 0) {
                listobject = classList[i]
                listobject.visibilty = false
                // listobject = {
                //     visibilty: false,
                //     listdata: classList[i].listdata,
                //     studentCount: 0
                // }
                listData.push(listobject)
            }
        }

        //  this.updateClassCount(listData.length)

        this.setState({
            classesList: listData,
            classIds: []
            // classData: listData
        });
    }

    _updateClassList = (object) => {


        var classList = this.state.classesList

        var index = classList.findIndex(classobject => classobject.listdata._id == object._id)
        if (index > -1) {
            var _class = classList[index];
            _class.listdata = object;
            if (object.studentCount != undefined) {
                _class.studentCount = object.studentCount
            }
            const updatedClasses = update(classList, { $splice: [[index, _class.listdata]] });  // array.splice(start, deleteCount, item1)
            this.setState({ listData: updatedClasses });
        }

    }

    updateClassCount = (count) => {
        var classCount = ''
        //var lblClass = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_CLASS,count)
        //if (count > 1) {
        classCount = (TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_CLASS, count) +
            AppConstant.COLLON + count)
        // } else {
        //     classCount = lblClass + AppConstant.COLLON + count
        // }

        this.props.navigation.setParams({ classCount: classCount })
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // flexDirection: 'column',
        backgroundColor: "#E7E7E7"
    },
    containerClassList: {
        flex: 0.92
    },
    containerBottom: {
        flex: 0.08,
        backgroundColor: 'white'
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
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
    buttonText: {
        color: 'black',
        fontSize: 18,
        marginLeft: 10
    },
    cellContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    classContainer: {
        flex: 0.9,
        flexDirection: 'column'
    },
    imageContainer: {
        flex: 0.05,
        flexDirection: 'row',
        marginLeft: 5
    },
    rowText: {
        justifyContent: 'center',
        alignItems: 'center',
        color: 'black',
        fontSize: 15,
        marginLeft: 15,
        flex: 0.9
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: 'white'
    },
    imageInfoContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageNextContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20
    },
    imageView: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 16,
        width: 16,
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',
    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    touchStyle: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    rowTextContainter: {
        flex: 0.9
    },
    editRowTextContainter: {
        flex: 0.8
    },
    // bottomView:{
    //     width: '100%', 
    //     height: 50, 
    //     backgroundColor: 'white', 
    //     justifyContent: 'center', 
    //     alignItems: 'center',
    //     position: 'absolute',
    //     bottom: 0
    // },
    // editView:{
    //     width: '100%', 
    //     backgroundColor: 'white', 
    //     justifyContent: 'center', 
    //     alignItems: 'center',
    //     position: 'absolute',
    //     marginLeft: 10,
    //     left: 0,
    //     fontSize: 20,
    //     color: 'blue'
    // },
    // deleteView:{

    //     backgroundColor: 'white', 
    //     justifyContent: 'center', 
    //     alignItems: 'center',
    //     position: 'absolute',
    //     marginRight: 10,
    //     right: 0,
    //     fontSize: 20,
    //     color: 'blue'
    // },
    deleteContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 10
    },

    bottomView: {
        width: '100%',
        height: 48,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0
    },

    editView: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginLeft: 10,
        left: 0,

    },
    textInnnerView: {
        fontSize: 20,
        color: '#4799EB'
    },
    list: {
        backgroundColor: 'gray',
        height: 0.918
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
});