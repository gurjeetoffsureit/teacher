import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    Alert,
    Platform,
    TouchableOpacity,
    PermissionsAndroid,
    SafeAreaView,
    Image,
    Linking
} from 'react-native';
import { Keyboard, Dimensions } from 'react-native';
import StorageConstant from '../constants/StorageConstant'
import ApiConstant from '../constants/ApiConstant';
import { KeyboardAwareScrollView, KeyboardAwareListView } from 'react-native-keyboard-aware-scrollview'
import Loader from '../ActivityIndicator/Loader';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import ImagePicker from 'react-native-image-crop-picker';
// import Dimensions from 'Dimensions';
import ActionSheet from 'react-native-actionsheet'
import { EventRegister } from 'react-native-event-listeners'
import SocketConstant from '../constants/SocketConstant'
import { selectContact } from 'react-native-select-contact';
import update from 'react-addons-update'
import AppConstant from "../constants/AppConstant";
import ComingFrom from "../constants/ComingFrom"
import DeviceInfo from 'react-native-device-info';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import Swipeout from 'react-native-swipeout';
import AsyncStorage from "@react-native-community/async-storage";

import { Content } from 'native-base'

export default class AddStudentDetailsScreen extends React.PureComponent {


    constructor(props) {
        super(props)
        var stateParmData = this.props.navigation.state.params
        this.customizeDetailFieldList = []
        // if(stateParmData.image == undefined || stateParmData.image.uri == undefined){

        // }
        var pic = (stateParmData.image == "" ? require("../img/camera_icon.png") : stateParmData.image)
        var listData = [
            { title: '', data: ['pic', 'FirstName', 'LastName', 'AddClass'] },
            { title: 'Details', data: this.customizeDetailFieldList },
            { title: 'Parents', data: stateParmData.parentsList },
        ]
        if (!stateParmData.isComingFromSharedScreen) {
            listData.push({ title: 'AddParents', data: ['AddParents'] })
        }

        this.state = {
            studentCount: stateParmData.studentCount,
            firstName: stateParmData.firstName,
            lastName: stateParmData.lastName,
            other1: stateParmData.other1,
            other2: stateParmData.other2,
            other3: stateParmData.other3,
            parentName1: stateParmData.parentName1,
            parentName2: stateParmData.parentName2,
            parentEmail1: stateParmData.parentEmail1,
            parentEmail2: stateParmData.parentEmail2,
            parentPhone1: stateParmData.parentPhone1,
            parentPhone2: stateParmData.parentPhone2,
            editMode: stateParmData.editMode,
            createdBy: stateParmData.createdBy,
            selectedClassForStudent: [],
            selectedClassesToDeleteForStudent: [],
            className: '',
            loading: false,
            selectedFile: pic,
            limit: 10,
            page: 1,
            comingFrom: stateParmData.comingFrom,
            listData: listData,
            studentThumbnailImagesValue: stateParmData.studentThumbnailImages,
            isComingFromSharedScreen: stateParmData.isComingFromSharedScreen,
            isAsyncLoader: false,
            title: this.props.navigation.state.params.title
            // isApiHit: stateParmData.isApiHit


        }
        this.studentId = this.props.navigation.state.params.studentUserId
        // Obj =  new SocketManager();
    }


    componentDidMount() {
        this.props.navigation.setParams({ onAdd: this.onAddPress, moveToStudent: this.moveToStudentScreen })
        this.getAndSetUserId()
        this._getCutomizedDetailFields()
        this._addEventListener();
    }





    refreshScreen = () => {

        // this.moveToStudentScreen();
        // this._updateClassList();
        // this._addClassesToSelectedStudent();
        // this._addEventListener();
        // this._hitApiToSaveAndUpdateStudentDetails();
        // this.getClassDataForStudent();
        // this._getCutomizedDetailFields();
        // this._chooseProfilePick();
    }


    moveToStudentScreen = () => {
        Keyboard.dismiss;

        this.props.navigation.state.params.onGoBack(false);
        this.props.navigation.goBack();
    }


    // componentDidMount() {
    //     this.props.navigation.setParams({ onAdd: this.onAddPress, moveToStudent: this.moveToStudentScreen })
    //     this.refreshScreen()
    //     // this._addEventListener();

    // }

    //Socket Section
    //its hep to set class name labels
    _setClassNamesToClassNameLbl(classList) {
        var classNames = '';
        for (var i = 0; i < classList.length; i++) {
            var _class = classList[i];
            if (i == 0) {
                classNames = _class.name;
            }
            else {
                classNames = classNames + ", " + _class.name;
            }
        }
        this.setState({
            className: classNames
        });
    }


    _updateClassList(_classData) {
        var selectedClassForStudent = this.state.selectedClassForStudent
        var index = selectedClassForStudent.findIndex(_classObject => _classObject._id == _classData._id);
        if (index > -1) {
            var _class = selectedClassForStudent[index]
            _class.name = _classData.name
            // _class = _classData
            const updatedList = update(selectedClassForStudent, { $splice: [[index, _class.name]] });
            this.setState({ selectedClassForStudent: updatedList }, function () {
                //selectedClassForStudent = this.state.selectedClassForStudent
                this._setClassNamesToClassNameLbl(this.state.selectedClassForStudent);
            });

        }
    }



    _removeBluckClasses(classIdList) {
        var array = [...this.state.selectedClassForStudent];

        for (var i = 0; i < classIdList._id.length; i++) {
            //console.log('for studentList');
            //console.log(classIdList._id[i]);
            var index = array.findIndex(_classObject => _classObject._id == classIdList._id[i]);
            if (index > -1) {
                array.splice(index, 1);
            }
        }
        this.setState({
            selectedClassForStudent: array,
        }, function () {
            this._setClassNamesToClassNameLbl(array);
        });
    }

    // addStudent into selected class (unassignerd will assigned)
    _addClassesToSelectedStudent(data) {
        var classList = []
        if (data.classesData != undefined) {
            var classList = [...data.classesData]
        }

        if (data.classId != undefined) {
            var studentObject = data.data
            //console.log("_addStudentClassBulk ", studentObject)
            var studentsData = data.studentsData
            var index = studentsData.findIndex(studentObject => studentObject._id == this.studentId)
            if (index > -1) {
                this._setClassNamesToClassNameLbl(classList);
            }
        } else if (data.studentId != undefined && data.studentId == this.studentId) {
            this._setClassNamesToClassNameLbl(classList);
        }


    }

    //_updateUserSetting
    _updateUserSetting = (settingData) => {

        if (settingData.studentThumbnailImages != undefined) {
            this.setState({
                studentThumbnailImagesValue: settingData.studentThumbnailImages
            })
        }
    }

    //_addCustomizeDetailFieldData
    _addCustomizeDetailFieldData = (cutomizeDetailFiled) => {

        var listData = [...this.state.listData]
        var CustomoizeDetailsSection = listData[1]
        if (CustomoizeDetailsSection.title == "Details") {
            var customoizeDetailsList = CustomoizeDetailsSection.data
            var index = customoizeDetailsList.findIndex((customoizeDetail) =>
                customoizeDetail.customizedDetailFieldID == cutomizeDetailFiled._id)
            if (index == -1) {
                customoizeDetailsList.push({
                    customizedDetailField: cutomizeDetailFiled.defaultName,
                    customizedDetailFieldID: cutomizeDetailFiled._id,
                    value: ""
                })
                listData[1].data = customoizeDetailsList
                this.setState({
                    listData: listData
                })
            }

        }

        // array.push({
        //     cutomizeDetailFiledId: cutomizeDetailFiled._id,
        //     deleteVisibility: false,
        //     data: cutomizeDetailFiled,
        // })

        // this.setState({
        //     listData: array
        // })





    }

    //_removeCustomizeDetailFieldData
    _removeCustomizeDetailFieldData = (customizeDetailFieldList) => {
        //console.log("arrayListNeed to Delete" + JSON.stringify(customizeDetailFieldList))

        var listData = [...this.state.listData]
        var customoizeDetailsSection = listData[1]
        if (customoizeDetailsSection.title == "Details") {
            var customoizeDetailsList = customoizeDetailsSection.data
            for (var i = 0; i < customizeDetailFieldList._id.length; i++) {
                var index = customoizeDetailsList.findIndex((customoizeDetail) =>
                    customoizeDetail.customizedDetailFieldID == customizeDetailFieldList._id[i])
                if (index > -1) {
                    customoizeDetailsList.splice(index, 1);
                }
            }
            listData[1].data = customoizeDetailsList
            this.setState({
                listData: listData
            })



        }



    }

    //_updateCustomizeDetailFieldData
    _updateCustomizeDetailFieldData(cutomizeDetailFiled) {

        var listData = [...this.state.listData]
        var CustomoizeDetailsSection = listData[1]
        if (CustomoizeDetailsSection.title == "Details") {
            var customoizeDetailsList = CustomoizeDetailsSection.data
            var index = customoizeDetailsList.findIndex((customoizeDetail) =>
                customoizeDetail.customizedDetailFieldID == cutomizeDetailFiled._id)
            if (index > -1) {
                customoizeDetailsList[index].customizedDetailField = cutomizeDetailFiled.customizedDetailField
                listData[1].data = customoizeDetailsList
                this.setState({
                    listData: listData
                })
            }

        }


    }

    _addEventListener = () => {

        this.removeBulkClassListener = EventRegister.addEventListener(SocketConstant.REMOVE_BULK_CLASS, (classIdList) => {
            //console.log('removeBulkClassListener')
            this._removeBluckClasses(classIdList);
        })

        this.updateClassListener = EventRegister.addEventListener(SocketConstant.UPDATE_CLASS, (classObject) => {
            this._updateClassList(classObject)
        })

        //for class
        this.addStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_ADD_STUDENT_CLASS_BULK, (data) => {
            //console.log('addStudentClassBulkListener');
            this._addClassesToSelectedStudent(data)

        })

        this.deleteStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_STUDENT_CLASS_BULK, (data) => {
            //console.log('deleteStudentClassBulkListener');
            var _classId = this.state.classId
            if (_classId != undefined && _classId == data.classId) {
                // this._deleteStudentClassBulkListener(data.data)
            }

        })

        //setting function
        this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
            //console.log("addStudentListener", data)
            this._updateUserSetting(data)
        })

        //customized Details Fields
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

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.removeBulkClassListener)
        EventRegister.removeEventListener(this.updateClassListener)
        //for class
        EventRegister.removeEventListener(this.addStudentClassBulkListener)
        EventRegister.removeEventListener(this.deleteStudentClassBulkListener)

        //setting function
        EventRegister.removeEventListener(this.updateUserSetting)
        //customized Details Fields
        EventRegister.removeEventListener(this.addCustomizeDetailFieldListener)
        EventRegister.removeEventListener(this.removeCustomizeDetailFieldListener)
        EventRegister.removeEventListener(this.updateCustomizeDetailFieldListener)
    }
    //Socket Section


    refresh = (data, isFromParent = false, parentIndex = -1) => {
        this._addEventListener()
        if (data != undefined) {
            if (isFromParent) {
                var listData = [...this.state.listData]
                var parents = listData[2]
                if (parents.title == "Parents") {
                    var parentsData = parents.data
                    //var index = parentsData.findIndex((parent) => parent._id == data._id)
                    if (parentIndex > -1) {
                        parentsData[parentIndex] = data
                    } else {
                        parentsData.push(data)
                    }
                    listData[2].data = parentsData
                    this.setState({
                        listData: listData
                    })
                }
            } else {
                var classNames = ""
                var selectedClasses = data.selectedClasses
                for (var i = 0; i < selectedClasses.length; i++) {
                    var _class = selectedClasses[i]
                    if (i == 0) {
                        classNames = _class.name
                    } else {
                        classNames = classNames + ", " + _class.name
                    }
                }

                this.setState({
                    className: classNames,
                    selectedClassForStudent: selectedClasses,
                    selectedClassesToDeleteForStudent: data.selectedClassesToDelete
                })
            }


        } else {
            this.getClassDataForStudent();
        }
    }

    getAndSetUserId = () => {
        const { title } = this.state

        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
            //console.log("Get Value >> ", value);
            this.setState({
                userId: value
            })
            if (title === 'Update Student') {
                this.getClassDataForStudent();
            }
        }).done();
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var comingFrom = navigation.state.params.comingFrom
        // var istrue = (comingFrom == ComingFrom.HOME_SCREEN || (comingFrom == ComingFrom.STUDENT_ACTIONS && !params.isComingFromSharedScreen)||
        // !params.isComingFromSharedScreen)

        var istrue = !params.isComingFromSharedScreen
        return {
            title: (istrue ? `${navigation.state.params.title}` : 'Student Details'),
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: () => <TouchableOpacity onPress={() => params.moveToStudent()}>
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
            headerRight: () => istrue ?
                <TouchableOpacity
                    onPress={() => params.onAdd()}
                    disabled={params.isApiHit}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {navigation.state.params.data}
                    </Text>
                </TouchableOpacity>
                : null


        }
    }


    onAddPress = () => {
        Keyboard.dismiss

        if (this.state.firstName == '') {
            // TeacherAssitantManager.getInstance().showAlert("First Name is required")
            this._showToastMessage("First Name is required");
            //  this.showAlert("First Name is required")
        }
        else if (this.state.lastName == '') {
            //TeacherAssitantManager.getInstance().showAlert("Last Name is required")
            this._showToastMessage("Last Name is required");
            // this.showAlert("Last Name is required")
        }
        else if (!this.state.parentEmail1 == '' && !this.validateEmail(this.state.parentEmail1)) {
            // TeacherAssitantManager.getInstance().showAlert("Parent email 1 is not valid")
            this._showToastMessage("Parent email 1 is not valid");
            // this.showAlert("Parent email 1 is not valid")
        }
        else if (!this.state.parentEmail2 == '' && !this.validateEmail(this.state.parentEmail2)) {
            // TeacherAssitantManager.getInstance().showAlert("Parent email 2 is not valid")
            this._showToastMessage("Parent email 2 is not valid");
            //this.showAlert("Parent email 2 is not valid")
        }
        else {
            //everything is working, so hit api to save data on server
            this._hitApiToSaveAndUpdateStudentDetails()
        }
    }

    _hitApiToSaveAndUpdateStudentDetails = async () => {
        this.setLoading(true);
        const { selectedFile } = this.state
        let isUpdate = this.props.navigation.state.params.data == "Update"

        let pic = ""
        if (selectedFile.uri) {
            pic = selectedFile.uri
        } else if (isNaN(selectedFile)) {
            pic = selectedFile
        }
        // selectedFile.uri ? selectedFile.uri : isUpdate ? selectedFile : ""

        if (pic != "" && pic != selectedFile) {
            let imageInfo = {
                isUplaodingMedia: true,
                path: pic,
                entity: "STUDENT_IMAGE"
            }
            let response = await TeacherAssitantManager.getInstance()._serviceMethod("", {}, imageInfo);

            if (!response.Key) {
                this.setLoading(false);
                return;
            }
            pic = response.Key


        }

        var url = ApiConstant.BASE_URL + ApiConstant.API_STUDENTS + (isUpdate ? "/" + this.props.navigation.state.params.studentUserId : '')
        var parents = this.state.listData[2].data
        var customizedDetailField = this.state.listData[1].data
        //console.log('abcd', JSON.stringify(customizedDetailField))



        let body = JSON.stringify({
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            parents: parents,
            customizedDetailField: customizedDetailField,
            createdBy: TeacherAssitantManager.getInstance().getUserID(),
            image: pic
        })
        let requestInfo = {
            method: isUpdate ? 'PUT' : 'POST',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': TeacherAssitantManager.getInstance().getUserID()

            },
            body

        }
        // console.log("Add student body", body)
        // console.log("Add student requestInfo", requestInfo)

        // return
        TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
            console.log(responseJson);

            if (responseJson.success) {
                // ("Parent email 2 is not valid")
                this.studentId = responseJson.data._id
                this._saveSeletectedClasses(responseJson.message);



            } else {
                this.setLoading(false);
                this._showToastMessage(responseJson.message);
                //this.showAlert(responseJson.message);
            }
            // })

        }).catch((error) => {
            this.setLoading(false);
            console.error(error);
        });
    }

    gotoStudentsScreen = () => {
        this._removeEventListener()

        setTimeout(() => {
            this.props.navigation.state.params.onGoBack(true, this.state.firstName + ' ' + this.state.lastName);
            this.props.navigation.goBack();
        }, 200)

    }





    //saveClasses for particular student
    _saveSeletectedClasses = (message) => {

        var arrayToSend = {}
        var studentArrayWithClass = []
        //console.log('class ids size==' + this.state.selectedClassForStudent.length)
        let userId = TeacherAssitantManager.getInstance().getUserID()
        for (var i = 0; i < this.state.selectedClassForStudent.length; i++) {
            arrayToSend = {
                studentID: this.studentId,
                classID: this.state.selectedClassForStudent[i]._id,
                createdBy: userId
            }

            studentArrayWithClass.push(arrayToSend)
        }

        var studentArrayWithClassToDelete = []
        //console.log('class ids size==' + this.state.selectedClassesToDeleteForStudent.length)

        for (var i = 0; i < this.state.selectedClassesToDeleteForStudent.length; i++) {
            // arrayToSend = {
            //     studentID: this.studentId,
            //     classID: this.state.selectedClassesToDeleteForStudent[i]._id
            // }

            studentArrayWithClassToDelete.push(this.state.selectedClassesToDeleteForStudent[i]._id)
        }

        let bodyValue = {
            deleteData: studentArrayWithClassToDelete,
            addData: studentArrayWithClass,
        }


        var url = ApiConstant.BASE_URL + ApiConstant.API_STUDENTS_CLASSES + 'updateinbulkforstudent/' + this.studentId
        var requestInfo = {
            method: 'POST',
            headers: {
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': TeacherAssitantManager.getInstance().getUserID(),
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyValue)
        }




        TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo)
            .then((responseJson) => {
                //console.log("response==" + JSON.stringify(responseJson));
                //console.log("response==" + responseJson.message);

                if (responseJson.success) {

                    this.setLoading(false);
                    //TeacherAssitantManager.getInstance().showAlertWithDelay(message)
                    this._showToastMessageAndMoveToPeriviousScreen(message);



                    //this.goToPreviousScreen()
                } else {
                    this.setLoading(false);
                    //TeacherAssitantManager.getInstance().showAlert(responseJson.message)
                    this._showToastMessage(responseJson.message);
                    // this.showAlert(responseJson.message)
                }
                // this.goToPreviousScreen()

            })
            .catch((error) => {
                //console.log("error===" + error)
            });
    }

    //emit data to socket 
    _emitDataToSocket = () => {

        var data = {
            firstName: this.state.firstName,
            lastName: this.state.lastName,

            other1: this.state.other1,
            other2: this.state.other2,
            other3: this.state.other3,

            parent1Name: this.state.parentName1,
            parent1Phone: this.state.parentPhone1,
            parent1Email: this.state.parentEmail1,
            parent2Name: this.state.parentName2,
            parent2Phone: this.state.parentPhone2,
            parent2Email: this.state.parentEmail2,
            createdBy: this.state.userId,
        }

        Obj._onAddStudent(data)
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }


    handleFirstName = (text) => {
        this.setState({ firstName: text })
    }
    handleLastName = (text) => {
        this.setState({ lastName: text })
    }
    _handleCustomizeDetailField = (text, index) => {
        var listData = [...this.state.listData]
        var customizedDetailFields = listData[1]
        if (customizedDetailFields.title == "Details") {
            var customizedDetailFieldsList = customizedDetailFields.data
            var customizedDetailFieldData = customizedDetailFieldsList[index]
            customizedDetailFieldData.value = text
            customizedDetailFieldsList[index] = customizedDetailFieldData
            listData[1].data = customizedDetailFieldsList
            this.setState({
                listData: listData
            })
        }

        //this.setState({ other1: text })
    }
    _showToastMessageAndMoveToPeriviousScreen(message) {
        this._showToastMessage(message);

        setTimeout(() => {
            this.gotoStudentsScreen();
        }, 300)
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    // handleOther2 = (text) => {
    //     this.setState({ other2: text })
    // }
    // handleOther3 = (text) => {
    //     this.setState({ other3: text })
    // }
    // handleParentName1 = (text) => {
    //     this.setState({ parentName1: text })
    // }
    // handleParentPhone1 = (text) => {
    //     this.setState({ parentPhone1: text })
    // }
    // handleParentEmail1 = (text) => {
    //     this.setState({ parentEmail1: text })
    // }
    // handleParentName2 = (text) => {
    //     this.setState({ parentName2: text })
    // }

    // handleParentEmail2 = (text) => {
    //     this.setState({ parentEmail2: text })
    // }
    // handleParentPhone2 = (text) => {
    //     this.setState({ parentPhone2: text })

    // }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    _handleCameraClick = () => {
        // if (this.props.navigation.state.params.comingFrom != ComingFrom.HOME_SHARED_STUDENT) {
        this.ActionSheet.show();
        // } 
    }

    _onPressAddClass = () => {
        this._removeEventListener()

        var propsNavigation = this.props.navigation
        stateParms = propsNavigation.state.params

        var classesForStudent = {
            studentId: stateParms.studentUserId,
            selectedClassForStudent: this.state.selectedClassForStudent,
            selectedClassesToDeleteForStudent: this.state.selectedClassesToDeleteForStudent,
            userId: stateParms.userId,
            createdBy: stateParms.createdBy,
            studentNAme: (this.state.firstName == '' && this.state.lastName == '' ? 'New Student' : this.state.firstName + " " + this.state.lastName),
            onGoBack: this.refresh,
            leftHeader: BreadCrumbConstant.CANCEL

        }
        if (ComingFrom.HOME_SHARED_STUDENT == this.state.comingFrom) {
            propsNavigation.navigate("AllClassesForSharedStudent", classesForStudent)
        } else {
            propsNavigation.navigate("AllClassForStudents", classesForStudent)
        }

    }

    getClassDataForStudent = () => {
        //console.log("AddStudentDetailsScreen  UserId", this.state.userId);
        var url = ApiConstant.BASE_URL + ApiConstant.API_CLASSES + ApiConstant.API_GET_BY_USER_ID + this.state.createdBy + ApiConstant.API_STUDENT_ID + this.props.navigation.state.params.studentUserId + ApiConstant.API_PAGINATION + this.state.page + '/' + this.state.limit
        //console.log("getClassDataForStudent url ", url)

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {}
        }).then((responseJson) => {
            //console.log("response==" + responseJson.data)
            if (responseJson.success) {

                var classNames = this.state.className

                var responseData = responseJson.data
                var classesData = responseData.classesData
                for (var i = 0; i < classesData.length; i++) {
                    var _class = classesData[i]
                    if (_class != null && _class != undefined) {
                        this.state.selectedClassForStudent.push(_class);
                        if (i == 0) {
                            classNames = _class.name
                        } else {
                            classNames = classNames + ", " + _class.name
                        }

                    }
                }

                if (responseJson.data.length == 0) {
                    classNames = ""
                }

                this.setState({
                    className: classNames
                })

                //console.log('class name==' + classNames)
            } else {
                if (this.props.navigation.state.params.data == "Update") {
                    // TeacherAssitantManager.getInstance().showAlert(responseJson.message);
                    this._showToastMessage(responseJson.message)
                    //this.showAlert(responseJson.message);
                }
            }
        })
            .catch(error => {
                //console.log("error==" + error)

            })
    }


    _getCutomizedDetailFields() {
        this.setState({
            isAsyncLoader: true
        })
        this.props.navigation.setParams({ isApiHit: true });
        var url = (ApiConstant.BASE_URL + ApiConstant.API_CUTOMIZED_DETAIL_FIELDS_FOR_STUDENT + this.props.navigation.state.params.studentUserId +
            ApiConstant.API_GET_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID())
        if (this.state.isComingFromSharedScreen) {
            url = url + '?isFromSharedScreen=true'
        }
        //console.log('_getCutomizedDetailFields url ' + url)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {}
        }).then((responseJson) => {
            //console.log("response", JSON.stringify(responseJson));
            if (responseJson.success) {
                var data = responseJson.data
                var listData = [...this.state.listData]
                var customizedDetailFields = listData[1]
                if (customizedDetailFields.title == "Details") {
                    var customizedDetailFieldsList = customizedDetailFields.data
                    customizedDetailFieldsList = data
                    listData[1].data = customizedDetailFieldsList
                    this.setState({
                        listData: listData
                    })

                }
                this.setState({
                    isAsyncLoader: false
                })
                this.props.navigation.setParams({ isApiHit: false });
            }
            else {
                this.setState({ isAsyncLoader: false, isLoadingMore: false })
                this.setState({
                    isAsyncLoader: false
                })
                this.props.navigation.setParams({ isApiHit: false });
                // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                this._showToastMessage(responseJson.message)
            }
        }).catch((error) => {
            this.setState({
                isAsyncLoader: false
            })
            console.error(error);
        });;
    }

    _onPressAddParents(parentData = {}, index = -1) {
        this._removeEventListener()

        var propsNavigation = this.props.navigation
        stateParms = propsNavigation.state.params
        //title: "Add "+ TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_CLASS,0),
        var studentData = {
            studentId: stateParms.studentUserId,
            userId: stateParms.userId,
            createdBy: stateParms.createdBy,
            screenTitle: (parentData.name == undefined ? 'Add ' : 'Update '),
            onGoBack: this.refresh,
            headerRight: parentData.name == undefined ? 'Save' : 'Update',
            parentData: parentData,
            leftHeader: BreadCrumbConstant.CANCEL,
            index: index
        }
        // if (ComingFrom.HOME_SHARED_STUDENT == this.state.comingFrom) {
        //     //propsNavigation.navigate("AllClassesForSharedStudent", studentData)
        // } else {
        propsNavigation.navigate("AddStudentParents", studentData)
        //}
    }

    _openContactList() {

        if (Platform.OS === 'android') {
            TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, 'true').then((error) => {
                this.getContactDetails();
            })
        } else {
            this.getContactDetails();
        }
    }

    async getContactDetails() {
        selectContact()
            .then(contact => {
                this.importingContactInfo = false;
                if (!contact) {
                    return null;
                }
                this._makeParentDetails(contact)
            });
    }

    _makeParentDetails(contact) {
        console.log(contact)
        var listData = [...this.state.listData]
        var parents = listData[2]
        if (parents.title == "Parents") {

            let parentsData = parents.data

            let emailList = parentsData.email == undefined ? [] : parentsData.email
            contact.emails.forEach(email => {
                emailList.push({ value: email.address, type: email.type, emailBlast: false })
            });


            let phoneList = parentsData.phone == undefined ? [] : parentsData.phone

            // phoneNumbers
            // let  emailList = parentsData.email == undefined ? [] : parentsData.email

            contact.phones.forEach(phone => {
                console.log(phone)
                let trimPhoneNumber = phone.number.trim().replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\-/g, '')
                let label = phone.type
                phoneList.push({ value: trimPhoneNumber, type: label.slice(0, 1).toUpperCase() + label.slice(1, label.length) })
            });

            parentsData.push({
                email: emailList,
                phone: phoneList,
                name: `${contact.givenName} ${contact.familyName ? contact.familyName : ""}`
            })
            listData[2].data = parentsData
            this.setState({
                listData: listData
            })
        }
    }

    _requestAndroidContactPermission() {
        this._getAndroidContactPermissionStatus().then((response) => {
            if (response) {
                this._openContactList();
            } else {
                this._requestAndroidContactPermission();
            }
        })
    }

    async _getAndroidContactPermissionStatus() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,

                {
                    'title': AppConstant.APP_NAME,
                    'message': AppConstant.APP_NAME + ' need your external stroage'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {

                //console.log("You can use the camera")
                return true
            } else {
                this._getAndroidContactPermissionStatus()
                //console.log("Camera permission denied")
            }
        } catch (err) {
            console.warn(err)
        }

    }

    //it will help to set edit is on off
    _handleActionSheetIndex = (index, isFromParents = false) => {
        if (isFromParents) {
            switch (index) {
                case 0: //Manually
                    this._onPressAddParents();
                    break;
                case 1: //Contacts
                    if (Platform.OS == 'ios') {
                        this._openContactList();
                        break;
                    } else {
                        if (DeviceInfo.getAPILevel() >= 23) {
                            this._requestAndroidContactPermission();
                        }
                        else {
                            this._openContactList();
                        }
                        break;
                    }
                    break;
            }
        } else {
            switch (index) {
                case 0: //open profile pic ActionsSheet
                    Alert.alert(
                        "Teacher's Assistant Pro 3",
                        "Select  Photo",
                        [
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel"
                            },
                            { text: "Camera", onPress: () => { this._chooseProfilePickFromCamera() } },
                            { text: "Gallery", onPress: () => { this._chooseProfilePickFromGallery() } }
                        ]
                    );
                    // this._chooseProfilePick();
                    break;
                case 1: //Contacts
                    this._handleRemoveImageClick()
                    break;
            }
        }



    }

    _chooseProfilePickFromGallery() {
        const options = {
            width: 500,
            height: 500,
            mediaType: 'photo',
            forceJpg: true,
            includeBase64: true,
            includeExif: true,
        };
        TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, 'true').then((error) => {

            ImagePicker.openPicker(options).then(response => {
                //console.log('Response = ', JSON.stringify(response));
                //console.log('Response = ', response);
                if (response.didCancel) {
                    //console.log('User cancelled photo picker');
                }
                else if (response.error) {
                    if (Platform.OS == "ios" && response.error == "Photo library permissions not granted" ||
                        response.error == "Camera permissions not granted") {
                        // Works on both iOS and Android
                        Alert.alert(
                            AppConstant.APP_NAME,
                            'Please go to settings and enable required permission',
                            [
                                { text: 'Settings', onPress: () => Linking.openURL('app-settings:') },
                            ],
                            { cancelable: false }
                        )

                    } else {
                        //console.log('ImagePicker Error: ', response.error);
                        //TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, '').then((error) => {})
                    }

                }
                else if (response.customButton) {
                    //console.log('User tapped custom button: ', response.customButton);
                }
                else {

                    this.setState({
                        selectedFile: { uri: response.path }
                        // selectedFile: { uri: 'data:image/jpeg;base64,' + response.data }
                    });
                    //TeacherAssitantManager.getInstance().showAlert('Still to implement, saving a Profile Picture')
                }
            }).catch((error) => {
                // imagePickerErrorCallBack(error)
                //console.log("image error>>>>>>>", error);
            });
        })

    }


    _chooseProfilePickFromCamera() {
        const options = {
            width: 500,
            height: 500,
            mediaType: 'photo',
            forceJpg: true,
            includeBase64: true,
            includeExif: true,
        };
        TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, 'true').then((error) => {

            ImagePicker.openCamera(options).then(response => {
                //console.log('Response = ', JSON.stringify(response));
                //console.log('Response = ', response);
                if (response.didCancel) {
                    //console.log('User cancelled photo picker');
                }
                else if (response.error) {
                    if (Platform.OS == "ios" && response.error == "Photo library permissions not granted" ||
                        response.error == "Camera permissions not granted") {
                        // Works on both iOS and Android
                        Alert.alert(
                            AppConstant.APP_NAME,
                            'Please go to settings and enable required permission',
                            [
                                { text: 'Settings', onPress: () => Linking.openURL('app-settings:') },
                            ],
                            { cancelable: false }
                        )

                    } else {
                        //console.log('ImagePicker Error: ', response.error);
                        //TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, '').then((error) => {})
                    }

                }
                else if (response.customButton) {
                    //console.log('User tapped custom button: ', response.customButton);
                }
                else {
                    //TeacherAssitantManager.getInstance().showAlert(JSON.stringify(response.fileName))
                    // var fileNameArray = response.path.split('.')
                    // // let source = { uri: 'data:image/jpeg;base64,' + response.data };
                    // let abdc = JSON.stringify(response.data)
                    this.setState({
                        selectedFile: { uri: `${response.path}` }
                        // selectedFile: { uri: 'data:image/jpeg;base64,' + response.data }
                    });
                    //TeacherAssitantManager.getInstance().showAlert('Still to implement, saving a Profile Picture')
                }
            }).catch((error) => {
                // imagePickerErrorCallBack(error)
                //console.log("image error>>>>>>>", error);
            });
        })

    }

    _handleRemoveImageClick = () => {
        if (this.state.selectedFile.uri || this.state.selectedFile != "") {
            this.setState({
                selectedFile: require("../img/camera_icon.png")
            })
        }

    }

    _handleParentInfo = (parentData, index) => {
        this._onPressAddParents(parentData, index)
    }

    renderSectionHeader1 = (section) => {
        return (

            <Text style={section.title == '' || section.title === 'AddParents' ? { height: 0 } : styles.textView}>
                {section.title === 'AddParents' ? '' : section.title}
            </Text>
        )
    }
    renderSectionHeader = (section) => {
        return (

            <Text style={styles.textView}>
                {section}
            </Text>
        )
    }

    _deleteClick = (index) => {
        if (this.state.listData.length > 0) {
            //console.log('listData======>', listData);
            var listData = [...this.state.listData]
            var parents = listData[2]
            if (parents.title == "Parents") {
                var parentsData = parents.data
                if (index > -1) {
                    parentsData.splice(index, 1);
                }
                listData[2].data = parentsData
                this.setState({
                    listData: listData
                })
            }
        }
    }

    renderItem = (section, item, index) => {
        var title = section.title
        var swipeoutBtns = [{
            text: 'Delete',
            backgroundColor: 'red',
            onPress: () => {
                this._deleteClick(index);
            }
        }];
        //console.log('title' + title)
        //console.log(section)
        return (
            <View>
                {title == "" && index == 0 && this.state.studentThumbnailImagesValue &&
                    <TouchableOpacity onPress={this._handleCameraClick} style={{ flex: 0.92, justifyContent: 'center' }}
                        disabled={this.props.navigation.state.params.isComingFromSharedScreen}>
                        <Image
                            style={{
                                alignSelf: 'center',
                                width: Dimensions.get('window').width / 2.56,
                                height: Dimensions.get('window').width / 2.56,
                                padding: 10,
                                marginTop: 10
                            }}
                            source={this.state.selectedFile}
                        />
                    </TouchableOpacity>
                }
                {title == "" && index == 1 &&
                    <View style={styles.textViewCOntainer}>
                        <Text style={styles.textStyle}>
                            First
                        </Text>
                        <TextInput style={styles.textInputStyle}
                            underlineColorAndroid="transparent"
                            placeholder="Student First Name"
                            placeholderTextColor="gray"
                            autoCapitalize="none"
                            returnKeyType={"next"}
                            ref={(r) => { this._textInputRef = r; }}
                            value={this.state.firstName}
                            onSubmitEditing={() => { this._textLastNameInputRef.focus(); }}
                            onChangeText={this.handleFirstName}
                        />
                    </View>
                }
                {title == "" && index == 2 &&
                    <View style={styles.textViewCOntainer}>
                        <Text style={styles.textStyle}>Last</Text>
                        <TextInput style={styles.textInputStyle}
                            ref={(r) => { this._textLastNameInputRef = r; }}
                            underlineColorAndroid="transparent"
                            placeholder="Student Last Name"
                            placeholderTextColor="gray"
                            autoCapitalize="none"
                            value={this.state.lastName}
                            returnKeyType={"next"}
                            onChangeText={this.handleLastName}
                        />
                    </View>
                }
                {title == "" && index == 3 &&

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={this._onPressAddClass}
                            style={styles.button}
                        >
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <Text numberOfLines={1}
                                    style={styles.buttonText}>{"Add Class"}
                                </Text>

                                <Text numberOfLines={1}
                                    style={styles.buttonText}>{this.state.className}
                                </Text>
                            </View>


                            <View style={styles.imageNextContainer}>
                                <Image style={styles.imageView}
                                    source={require('../img/icon_arrow.png')}>
                                </Image>
                            </View>
                        </TouchableOpacity>
                    </View>
                }

                {
                    title == "Details" &&
                    <View style={styles.textViewOtherCOntainer}>
                        <View style={styles.textViewCOntainer}>
                            <Text style={styles.textStyle}>
                                {item.customizedDetailField}
                            </Text>
                            <TextInput style={styles.textInputStyle}
                                underlineColorAndroid="transparent"
                                placeholder={"Student's " + item.customizedDetailField + ' Details'}
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                value={item.value}
                                multiline={false}
                                numberOfLines={1}
                                onChangeText={(text) => this._handleCustomizeDetailField(text, index)}
                            />
                        </View>
                    </View>
                }
                {
                    title == "Parents" &&
                    <Swipeout right={swipeoutBtns}
                        autoClose={true} >
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: '#ffffff',
                                    flexDirection: 'row',
                                    paddingStart: 13
                                }}
                                onPress={() => this._handleParentInfo(item, index)}
                            >

                                <View flex={1} >
                                    <Text numberOfLines={1}
                                        style={styles.boldText}>{item.name}
                                    </Text>
                                    {item.phone.length > 0 && <View style={{ flexDirection: 'row', flex: 1, paddingBottom: 1 }}>
                                        <Text style={{ fontSize: 12 }} >{item.phone[0].type}</Text>
                                        <Text style={{ marginLeft: 10, fontSize: 12, paddingBottom: 1 }}>{item.phone[0].value}</Text>
                                    </View>}
                                    {item.email.length > 0 && <View style={{ flexDirection: 'row', flex: 1, }}>
                                        <Text style={{ fontSize: 12 }} >{item.email[0].type}</Text>
                                        <Text style={{ marginLeft: 10, fontSize: 12, paddingBottom: 1 }}>{item.email[0].value}</Text>
                                    </View>}
                                </View>

                                <View style={styles.imageNextContainer}>
                                    <Image style={styles.imageView}
                                        source={require('../img/icon_arrow.png')}>
                                    </Image>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 0.5, backgroundColor: 'gray' }} />

                    </Swipeout>
                }
                {
                    title == "AddParents" &&
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => { this.ActionSheetForParents.show() }}
                            style={styles.buttonParent}>
                            <Text numberOfLines={1}
                                style={styles.buttonText}>{"Add Parent"}
                            </Text>

                            <View style={styles.imageNextContainer}>
                                <Image style={styles.imageView}
                                    source={require('../img/icon_arrow.png')}>
                                </Image>
                            </View>
                        </TouchableOpacity>
                    </View>
                }


            </View >


        )
    }

    render() {

        // var B = ['Banana', 'Coconut', 'Coconut', 'Coconut', 'Banana', 'Coconut', 'Coconut', 'Coconut', 'Banana', 'Coconut', 'Coconut', 'Coconut'];
        // var C = ['Coconut', 'Coconut', 'Banana', 'Coconut', 'Coconut', 'Coconut', 'Banana', 'Coconut', 'Coconut', 'Coconut', 'Banana', 'Coconut', 'Coconut',
        //     'Coconut', 'Banana', 'Coconut', 'Coconut', 'Coconut', 'Coconut'];

        let listData = this.state.listData
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1 }}>
                    <Loader loading={this.state.loading} />
                    <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <ActionSheet
                        ref={o => this.ActionSheet = o}
                        title={AppConstant.APP_NAME}
                        options={['Select a Photo', 'Remove', 'Cancel']}
                        cancelButtonIndex={2}
                        onPress={(index) => { this._handleActionSheetIndex(index) }}
                    />
                    <ActionSheet
                        ref={o => this.ActionSheetForParents = o}
                        title={AppConstant.APP_NAME}
                        options={['Manually', 'Contacts', 'Cancel']}
                        cancelButtonIndex={2}
                        onPress={(index) => { this._handleActionSheetIndex(index, true) }}
                    />

                    <Content>
                        {this.renderCameraComponent()}
                        {this.renderFirstNameComponent()}
                        {this.renderLastNameComponent()}
                        {this.renderAddClassComponent()}
                        {this.renderSectionHeader("Details")}
                        {
                            listData[1].data.map((data, idx) => {
                                return this.renderDetailComponent(data, idx)
                            })}
                        {this.renderSectionHeader("Parents")}
                        {
                            listData[2].data.map((data, idx) => {
                                return this.renderParentDetailListComponent(data, idx)
                            })
                        }
                        {this.renderAddParentDetailComponent()}
                    </Content>
                    {/* <KeyboardAwareListView style={styles.container} getTextInputRefs={() => { return [this._textInputRef]; }}>
                    {/* <ScrollView> 
                    
                        <View style={styles.container}> */}



                    {/* <SectionList

                                sections={this.state.listData}

                                renderSectionHeader={({ section }) => this.renderSectionHeader(section)}

                                renderItem={({ section, item, index }) => this.renderItem(section, item, index)}

                                keyExtractor={(item, index) => index}
                                scrollEnabled={false}

                            /> */}
                    {/* </View> */}

                    {/* </ScrollView> */}
                    {/* {/* </KeyboardAwareListView> */}

                </View>

            </SafeAreaView>
        )
    }


    renderCameraComponent() {
        return <TouchableOpacity onPress={this._handleCameraClick} style={{ flex: 0.92, justifyContent: 'center' }} disabled={this.props.navigation.state.params.isComingFromSharedScreen}>
            {TeacherAssitantManager.getInstance().getFastImageComponent(this.state.selectedFile, {
                alignSelf: 'center',
                width: Dimensions.get('window').width / 2.56,
                height: Dimensions.get('window').width / 2.56,
                padding: 10,
                marginTop: 10
            })}
        </TouchableOpacity>;
    }

    renderFirstNameComponent() {
        return <View style={styles.textViewCOntainer}>
            <Text style={styles.textStyle}>First</Text>
            <TextInput style={styles.textInputStyle} underlineColorAndroid="transparent" placeholder="Student First Name" placeholderTextColor="gray" autoCapitalize="none" ref={(r) => { this._textInputRef = r; }} value={this.state.firstName} onChangeText={this.handleFirstName} />
        </View>;
    }

    renderLastNameComponent() {
        return <View style={styles.textViewCOntainer}>
            <Text style={styles.textStyle}>Last</Text>
            <TextInput style={styles.textInputStyle} ref={(r) => { this._textLastNameInputRef = r; }} underlineColorAndroid="transparent" placeholder="Student Last Name" placeholderTextColor="gray" autoCapitalize="none" value={this.state.lastName} onChangeText={this.handleLastName} />
        </View>;
    }

    renderAddClassComponent() {
        return <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={this._onPressAddClass} style={styles.button}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text numberOfLines={1} style={styles.buttonText}>{"Add Class"}
                    </Text>

                    <Text numberOfLines={1} style={styles.buttonText}>{this.state.className}
                    </Text>
                </View>


                <View style={styles.imageNextContainer}>
                    <Image style={styles.imageView} source={require('../img/icon_arrow.png')}>
                    </Image>
                </View>
            </TouchableOpacity>
        </View>;
    }

    renderDetailComponent(item, index) {
        return <View key={index} style={styles.textViewOtherCOntainer}>
            <View style={styles.textViewCOntainer}>
                <Text style={styles.textStyle}>
                    {item.customizedDetailField}
                </Text>
                <TextInput style={styles.textInputStyle} underlineColorAndroid="transparent" placeholder={"Student's " + item.customizedDetailField + ' Details'} placeholderTextColor="gray" autoCapitalize="none" value={item.value} multiline={false} numberOfLines={1} onChangeText={(text) => this._handleCustomizeDetailField(text, index)} />
            </View>
        </View>;
    }

    renderParentDetailListComponent(item, index) {
        var swipeoutBtns = [{
            text: 'Delete',
            backgroundColor: 'red',
            onPress: () => {
                this._deleteClick(index);
            }
        }];

        return <Swipeout
            key={index}
            right={swipeoutBtns} autoClose={true}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    flexDirection: 'row',
                    paddingStart: 13
                }} onPress={() => this._handleParentInfo(item, index)}>

                    <View flex={1}>
                        <Text numberOfLines={1} style={styles.boldText}>{item.name}
                        </Text>
                        {item.phone.length > 0 && <View style={{ flexDirection: 'row', flex: 1, paddingBottom: 1 }}>
                            <Text style={{ fontSize: 12 }}>{item.phone[0].type}</Text>
                            <Text style={{ marginLeft: 10, fontSize: 12, paddingBottom: 1 }}>{item.phone[0].value}</Text>
                        </View>}
                        {item.email.length > 0 && <View style={{ flexDirection: 'row', flex: 1, }}>
                            <Text style={{ fontSize: 12 }}>{item.email[0].type}</Text>
                            <Text style={{ marginLeft: 10, fontSize: 12, paddingBottom: 1 }}>{item.email[0].value}</Text>
                        </View>}
                    </View>

                    <View style={styles.imageNextContainer}>
                        <Image style={styles.imageView} source={require('../img/icon_arrow.png')}>
                        </Image>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{ height: 0.5, backgroundColor: 'gray' }} />

        </Swipeout>;
    }

    renderAddParentDetailComponent() {
        return <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => { this.ActionSheetForParents.show(); }} style={styles.buttonParent}>
                <Text numberOfLines={1} style={styles.buttonText}>{"Add Parent"}
                </Text>
                <View style={styles.imageNextContainer}>
                    <Image style={styles.imageView} source={require('../img/icon_arrow.png')}>
                    </Image>
                </View>
            </TouchableOpacity>
        </View>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E7E7E7"
    },
    textViewCOntainer: {
        flex: 1,
        flexDirection: 'row',
        margin: 10,
        height: 40,
        justifyContent: 'center'
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    textViewOtherCOntainer: {
        flex: 1,
        backgroundColor: "#ffffff",

    },
    textStyle: {
        flex: 0.35,
        margin: 10,
        height: 40,
        fontSize: 15,
        justifyContent: 'flex-start'
    },
    textInputStyle: {
        flex: 0.65,
        borderBottomWidth: 0.5,
        paddingStart: 8,
        paddingEnd: 8

    },
    textView: {
        margin: 10,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        fontSize: 15,
        marginTop: 20,
        color: 'gray'
    },

    button: {
        height: 50,
        flex: 1,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        // backgroundColor: 'green',
        flexDirection: 'row',
    },
    buttonParent: {
        height: 50,
        flex: 1,
        marginTop: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        flexDirection: 'row'
    },
    buttonText: {
        flex: 1,
        flexDirection: 'row',
        color: '#0E72F1',
        fontSize: 16,
        marginRight: 10,
        marginLeft: 10,
        justifyContent: 'center',
    },
    boldText: {
        flex: 1,
        flexDirection: 'row',
        color: '#000000',
        fontSize: 18,
        marginRight: 10,
        justifyContent: 'center',
        paddingTop: 10,
    },
    imageNextContainer: {
        flex: 0.2,
        alignItems: 'center',
        justifyContent: 'center',

    },

    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    imageView: {
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16,
        marginLeft: 10
    }
});