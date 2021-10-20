import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import API from '../constants/ApiConstant'
import { EventRegister } from 'react-native-event-listeners'
import update from 'react-addons-update'
import Terminology from '../constants/Terminology'
import SocketConstant from '../constants/SocketConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import AppConstant from "../constants/AppConstant";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'

export default class AllClassForStudents extends React.PureComponent {

    constructor(props) {
        super(props)
        var selectedClassForStudent = JSON.parse(JSON.stringify(this.props.navigation.state.params.selectedClassForStudent))
        var selectedClassesToDeleteForStudent = JSON.parse(JSON.stringify(this.props.navigation.state.params.selectedClassesToDeleteForStudent))
        this.state = {
            listData: [],
            selectedClassForStudent: selectedClassForStudent,
            selectedClassesToDeleteForStudent: selectedClassesToDeleteForStudent,
            status: false,
            page: 1,
            studentId: this.props.navigation.state.params.studentId,
            classCount: 0,
            selectedClassesPage: 1,
            selectedClassesCount: 0,
            isAsyncLoader: true,
            isFetchingFromServer: false,
            isLoadingMore: false
        }
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var classCount = navigation.getParam('classesCount', '0')

        var lblClass = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_CLASS, classCount) + AppConstant.COLLON + classCount
        return {
            // let lblClass = AppConstant.CT_CLASS;
            // lblClass = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_CLASS,this.state.classCount)

            // title: navigation.getParam('classesCount', '0') > 1 ? Terminology.classPulral + `${navigation.getParam('classesCount', '0')}` : Terminology.classSingluar + `${navigation.getParam('classesCount', '0')}`,
            // title: navigation.getParam('classesCount', '0') > 1 ? Terminology.classPulral + `${navigation.getParam('classesCount', '0')}` : Terminology.classSingluar + `${navigation.getParam('classesCount', '0')}`,
            title: lblClass,
            //  navigation.getParam('classesCount', '0') > 1 ? Terminology.classPulral + `${navigation.getParam('classesCount', '0')}` : Terminology.classSingluar + `${navigation.getParam('classesCount', '0')}`,
            headerTitleStyle: [StyleTeacherApp.headerTitleStyle, StyleTeacherApp.justifyContentCenter],
            //title: ` ${navigation.state.params.studentNAme}`,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.moveToAddStudentDetailsScreen()}>
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
            headerRight:  () => <TouchableOpacity
                onPress={() => params.onAdd()}>
                <Text style={StyleTeacherApp.headerRightButtonText}>
                    Save
                            </Text>
            </TouchableOpacity>
            
        }
    }


    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.onRightButtonPressed, moveToAddStudentDetailsScreen: this.goToPreviousScreen
        })
        this.refreshScreen()
        this._addEventListener();

        // this._sub = this.props.navigation.addListener(
        //     'didFocus',
        //     this.refreshScreen
        // );
    }


    refreshScreen = () => {
        this.getAllClasses();
        // this.setState({
        //     page: 1,
        //     listData: [],
        //     isAsyncLoader: true
        // }, function () {
        //     this.getAllClasses();
        //     // this._addEventListener();
        // })
    }


    _addEventListener = () => {

        this.addClasslistener = EventRegister.addEventListener(SocketConstant.ON_ADD_CLASS, (classObject) => {
            this._addClass(classObject);
        })

        this.removeBulkClassListener = EventRegister.addEventListener(SocketConstant.REMOVE_BULK_CLASS, (classIdList) => {
            //console.log('removeBulkClassListener')
            this._removeBluckClasses(classIdList);
        })

        this.updateClassListener = EventRegister.addEventListener(SocketConstant.UPDATE_CLASS, (classObject) => {
            this._updateClassList(classObject)
        })

        this.deleteStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_STUDENT_CLASS_BULK, (data) => {
            //console.log('UpdateStudentListener');
            this._deleteStudentClassBulkListener(data)
        })

        this.addStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_ADD_STUDENT_CLASS_BULK, (data) => {
            //console.log('UpdateStudentListener');
            this._addStudentClassBulk(data)
        })

        this.onSettingsDeleteAll = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
            //console.log('onSettingsDeleteAll');
            if (data.resetToDefault) {
                setTimeout(() => {
                    this.goToPreviousScreen()
                }, 450);
                
            }
            // this._onSettingsDeleteAll(data);


        })
    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addClasslistener)
        EventRegister.removeEventListener(this.removeBulkClassListener)
        EventRegister.removeEventListener(this.updateClassListener)
        EventRegister.removeEventListener(this.deleteStudentClassBulkListener)
        EventRegister.removeEventListener(this.addStudentClassBulkListener)
    }

    //deleteclass from Student (assignerd will unassigned)
    _deleteStudentClassBulkListener(data) {

        if (data.studentId !== undefined && data.studentId === this.state.studentId) {
            var classIdList = data.data;
            for (var i = 0; i < classIdList.length; i++) {
                var index = this.state.listData.findIndex(classObject => classObject.classList._id == classIdList[i].classID);
                if (index > -1) {
                    var _class = this.state.listData[index]
                    _class.visibility = false
                    const updatedStudents = update(this.state.listData, { $splice: [[index, _class]] });
                    this.setState({ listData: updatedStudents });
                }
            }
        }
    }

    // addclass into selected Student (unassignerd will assigned)
    _addStudentClassBulk(data) {
        var classIdList = data.data;
        for (var i = 0; i < classIdList.length; i++) {
            if (classIdList[i].studentId == this.state.studentId) {
                var index = this.state.listData.findIndex(classObject => classObject.classList._id == classIdList[i].classID);
                if (index > -1) {
                    var _class = this.state.listData[index]
                    _class.visibility = true
                    const updatedStudents = update(this.state.listData, { $splice: [[index, _class]] });
                    this.setState({ listData: updatedStudents });
                }
            }
        }
    }

    onRightButtonPressed = () => {
        this.goToPreviousScreen(this.state.selectedClassForStudent, this.state.selectedClassesToDeleteForStudent, true)
    }

    goToPreviousScreen = (selectedClasses = [], selectedClassesToDelete = [], issave = false) => {
        this._removeEventListener()
        if (!issave) {
            this.props.navigation.state.params.onGoBack();
        } else {
            var classes = {
                selectedClasses: selectedClasses,
                selectedClassesToDelete: selectedClassesToDelete
            }
            this.props.navigation.state.params.onGoBack(classes);
        }
        this.props.navigation.goBack();
    }

    _updateClassList(classObject) {
        var index = this.state.listData.findIndex(_classObject => _classObject.classList._id == classObject._id);
        if (index > -1) {
            var _class = this.state.listData[index]
            _class.classList = classObject
            const updatedStudents = update(this.state.listData, { $splice: [[index, _class.classList]] });
            this.setState({ listData: updatedStudents });
        }
    }

    _removeBluckClasses(classIdList) {
        var array = [...this.state.listData];
        for (var i = 0; i < classIdList._id.length; i++) {
            //console.log('for studentList');
            //console.log(classIdList._id[i]);
            var index = this.state.listData.findIndex(classObject => classObject.classList._id == classIdList._id[i]);
            //var index = array.findIndex(studentObject => studentObject.studentId ==studentList._id[i]);
            //console.log('index' + index);
            if (index > -1) {
                array.splice(index, 1);
                var classesCount = this.props.navigation.getParam('classesCount', '0');
                classesCount -= 1;
                this.props.navigation.setParams({ classesCount: classesCount });
            }
        }
        this.setState({
            listData: array,
        });
    }

    loadMoreStudents = () => {
        var state = this.state

        if (state.listData.length < state.classCount && state.isLoadingMore) {
            this.getAllClasses()
        }
    }

    //it will help to add class on screen using socket listner
    _addClass(data) {
        var index = this.state.listData.findIndex(classObject => classObject.classList._id == data._id);
        if (index == -1) {
            var listDataObjet = {};
            listDataObjet = {
                classList: data,
                visibility: false
            };

            if (this.state.classCount == this.state.listData.length) {
                this.state.listData.push(listDataObjet);
                this.setState({
                    listData: this.state.listData
                });
            }

            var classCount = this.props.navigation.getParam('classesCount', '0');
            classCount += 1;
            this.props.navigation.setParams({ classesCount: classCount });
        }
    }


    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        const { listData } = this.state
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <Text style={{ padding: 10, color: '#1e1e1e', backgroundColor: '#E5E5E5' }}> Select Classes for ({this.props.navigation.state.params.studentNAme})</Text>

                    <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
                    <FlatList
                        style={styles.list}
                        data={listData}
                        extraData={listData}
                        renderItem={this.renderCell}
                        keyExtractor={(item, index) => `${index}`}
                        onEndReachedThreshold={0.8}
                        // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(listData)}
                        ItemSeparatorComponent={(sectionId, rowId) => (
                            <View key={rowId} style={styles.separator} />
                        )}
                        onEndReached={this.loadMoreStudents}
                        ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                    />

                    <View style={{ flex: 0.1, justifyContent: 'center', backgroundColor: '#ffffff', }}>
                        <TouchableOpacity style={styles.deleteView}
                            onPress={() => this._onAddClasses()}>
                            <Image style={{ alignItems: 'center', width: 20, height: 20, marginTop: 2 }}
                                source={require("../img/icon_add.png")} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

        )
    }

    _onAddClasses = () => {
        this._removeEventListener()
        const { state, navigate } = this.props.navigation;
        navigate("AddClass", {
            title: "Add ",
            userId: this.props.navigation.state.params.userId,
            className: '',
            headerRight: 'Save',
            leftHeader: BreadCrumbConstant.CANCEL,
            createdBy: TeacherAssitantManager.getInstance().getUserID(),
            onGoBack: () => this.refresh()
        })

        this.setState({
            classData: [], isEditMode: false, editText: 'Edit'
        })
        var newArray = []
        this.setState({
            listData: newArray,
        });
    }

    refresh() {
        this.setState({
            page: 1,
            listData: [],
            isAsyncLoader: true
        }, function () {
            this.getAllClasses();
            // this._addEventListener();
        })
    }

    renderCell = ({ item, index }) => {
        return (
            <TouchableOpacity style={styles.classContainer}
                onPress={() => this._pressClasssName(item, index)}>
                <View style={styles.rowContainer}>

                    <Text style={styles.rowText}>
                        {`${item.classList.name}`}
                    </Text>
                    {
                        item.visibility ? <View style={styles.imageContainer}>
                            <Image style={styles.imageView}
                                source={require('../img/check_icon.png')}>
                            </Image>
                        </View>
                            : null
                    }
                </View>
            </TouchableOpacity>
        )
    }

    _pressClasssName = (item, index) => {

        let posts = this.state.listData.slice();
        let targetPost = posts[index];
        if (targetPost.visibility) {
            var index = this.state.selectedClassForStudent.findIndex(_class => _class._id == targetPost.classList._id)
            if (index > -1) {
                this.state.selectedClassesToDeleteForStudent.push(targetPost.classList);
            }
            this.state.selectedClassForStudent.splice(index, 1);
        }
        else {
            var index = this.state.selectedClassesToDeleteForStudent.findIndex(_class => _class._id == targetPost.classList._id)
            if (index > -1) {
                this.state.selectedClassesToDeleteForStudent.splice(index, 1);
            }
            this.state.selectedClassForStudent.push(targetPost.classList)
        }
        targetPost.visibility = !targetPost.visibility;
        this.setState({ posts });
    }

    getAllClasses = () => {
        var deviceID = TeacherAssitantManager.getInstance().getDeviceID();
        var userId = TeacherAssitantManager.getInstance().getUserID()
        const { studentId } = this.state;
        var url = API.BASE_URL + API.API_CLASSES + API.API_GET_BY_USER_ID + userId + API.API_WITH_SELECTION_STUDENTID + studentId + API.API_PAGINATION + this.state.page + '/' + 50
        // var url = API.BASE_URL + API.API_CLASSES + API.API_GET_BY_USER_ID + userId + API.API_WITH_SELECTION_STUDENTID + studentId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT

        //console.log('this class id===' + this.props.navigation.state.params.userId)
        //console.log('getAllClasses url: ' + url)

        var requestInfo = {
            method: 'GET',
            headers: {
            }
        }
        TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
            //console.log("response  getAllClasses ==" + JSON.stringify(responseJson))

            if (responseJson.success) {
                

                this.props.navigation.setParams({ classesCount: responseJson.data.count })


                var responseData = responseJson.data
                var classData = responseData.classesData
                var _classlist = [...this.state.listData]

                // this.setState({
                //     // listData: []
                // })

                //console.log('aaaa length of class ids==' + this.props.navigation.state.params.selectedClassForStudent.length)

                //console.log('class ids from previous screen ===' + this.state.selectedClassForStudent.length)
                var selectedclasses = this.state.selectedClassForStudent
                var selectedClassesToDeleteForStudent = this.state.selectedClassesToDeleteForStudent
                var isInDeleteList = false
                for (var i = 0; i < classData.length; i++) {
                    var _class = classData[i];
                    //console.log('_class = ' + JSON.stringify(_class))

                    if (_class.selected) {
                        var index = selectedClassesToDeleteForStudent.findIndex(_classObject => _classObject._id == _class._id)
                        if (index > -1) {
                            _class.selected = false
                            isInDeleteList = true;
                        } else {
                            isInDeleteList = false;
                        }

                        var indexselectedclasses = selectedclasses.findIndex(_classObject => _classObject._id == _class._id)
                        if (_class.selected && indexselectedclasses == -1) { // if already not in seleted array list
                            //now check is its existed in delet list then remove from it
                            var index = selectedClassesToDeleteForStudent.findIndex(_classObject => _classObject._id == _class._id)
                            if (index > -1) {
                                selectedClassesToDeleteForStudent.splice(index, 1)
                            }
                            selectedclasses.push(_class) // add to selected class list                                
                        } else if (isInDeleteList && indexselectedclasses > -1) {
                            selectedclasses.splice(indexselectedclasses, 1) // remove  
                        }

                    } else {
                        var index = selectedclasses.findIndex(_classObject => _classObject._id == _class._id)
                        if (index > -1) {
                            _class.selected = true
                        }
                        if (_class.selected) {
                            var index = selectedClassesToDeleteForStudent.findIndex(_classObject => _classObject._id == _class._id)
                            if (index > -1) {
                                selectedClassesToDeleteForStudent.splice(index, 1)
                            }
                        }
                    }

                    var listItem = {
                        classList: _class,
                        visibility: _class.selected
                    }

                    _classlist.push(listItem)
                }
                this.setState({
                    listData: [..._classlist],
                    classCount: responseData.count,
                    //page: responseData.pageCount + 1
                    page: this.state.page + 1,
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false
                })
                //  })


            } else {
                this.setState({
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false
                })
                // this._showToastMessage(responseJson.message)
                // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                // this.showAlert(responseJson.message)
            }
        })
            .catch(error => {
                this.setState({
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false
                })
                //console.log("error==" + error)
            })


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
    buttonText: {
        color: '#0E72F1',
        fontSize: 16,
        marginRight: 10
    },
    rowContainer: {
        backgroundColor: 'white',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 10,
        flexDirection: 'row',
        flex: 1
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',
    },
    rowText: {
        flex: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        color: 'black',
        fontSize: 15,
    },
    imageContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10

    },
    imageView: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 18,
        width: 18,
    },
    classContainer: {
        flex: 0.9,
        flexDirection: 'column',
        paddingLeft: 10,
        paddingRight: 10


    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10
    },
    bottomView: {
        width: '100%',
        height: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0
    },
    deleteView: {

        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginRight: 20,
        right: 0,
        fontSize: 20,
    },
    list: {
        // marginTop: 5,
        flex: 1,
        backgroundColor: "white"
    },


});