import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SectionList, Linking,
    Alert, ToastAndroid, SafeAreaView,
    TextInput, Platform, FlatList, PermissionsAndroid, Keyboard
} from "react-native";
import API from "../constants/ApiConstant";
import SocketConstant from "../constants/SocketConstant";

import Loader from '../ActivityIndicator/Loader';
import { EventRegister } from 'react-native-event-listeners'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';

import update from 'react-addons-update'
import ComingFrom from '../constants/ComingFrom'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import AppConstant from "../constants/AppConstant";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import ApiConstant from "../constants/ApiConstant";
import Toast, { DURATION } from 'react-native-easy-toast'

export default class ParentDetailScreenForSharingAction extends React.PureComponent {

    constructor(props) {
        super(props);
        var stateParms = this.props.navigation.state.params
        var studentListData = []

        studentListData.push(this._getStudentObject(stateParms.studentData, false, stateParms.headerRight))

        this.state = {
            studentData: stateParms.studentData,
            settingsData: stateParms.settingsData,
            studentActionString: stateParms.studentActionString,
            headerRight: stateParms.headerRight,
            listData: studentListData,
            selectedStudentsEmailIdList: []
        };

        //this._getStudentObject(stateParms.studentData, false)


    }


    componentDidMount() {

        this.props.navigation.setParams({ onAdd: this.onRightHeaderClick, goBack: this.goToPreviousScreen });
        // this.getStudentData();
        // this._addEventListener()
    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    goToPreviousScreen = (comingFrom = '') => {
        Keyboard.dismiss;
        this._removeEventListener()
        if (comingFrom = '') {
            this.props.navigation.state.params.onGoBack();
        } else {
            this.props.navigation.state.params.onGoBack(ComingFrom.ALL_STUDENTS_LIST);
        }
        this.props.navigation.goBack();
    }


    /**
     * This method create top title bar
     */
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        var title = params.screenTitle
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
        return {
            title: '' + ` ${title}`,
            gestureEnabled: false,
            headerTitleStyle: [StyleTeacherApp.headerTitleStyle],
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: () =>
                <TouchableOpacity onPress={() => params.goBack()}>
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
            headerRight: () =>
                <TouchableOpacity
                    onPress={() => params.onAdd()}
                    disabled={`${navigation.state.params.headerRight}` == '' ? true : false}>

                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {`${navigation.state.params.headerRight}`}
                    </Text>
                </TouchableOpacity>


        };
    };

    /**
     * This method handle titlebar right click ( add button)
     */

    onRightHeaderClick = () => {
        Keyboard.dismiss
        var emailString = ''
        var selectedStudentsEmailIdList = this.state.selectedStudentsEmailIdList
        selectedStudentsEmailIdList.forEach(element => {
            emailString = emailString == '' ? element.email : emailString + ',' + element.email
        });
        if (emailString != '') {
            var body = this.state.studentActionString
            // var emailUrl = (this.state.headerRight == 'Message' ?
            //     "sms:" + emailString + (Platform.OS === 'ios' ? `&body=${body}` : `?body=${body}`)
            //     : ("mailto:" + this.state.settingsData.toTeacherEmail + "?&bcc=" + emailString +
            //         "&subject=Teacher's Assistant Pro Version " +
            //         TeacherAssitantManager.getInstance().getBuildVersion() + "&body=" + body))
            var emailUrl = this.state.headerRight == 'Message'
                ?
                "sms:" + emailString + (Platform.OS === 'ios' ? `&body=${body}` : `?body=${body}`)
                :
                TeacherAssitantManager.getInstance().getMailToUrl(this.state.settingsData.toTeacherEmail, body, emailString)

            Linking.openURL(emailUrl)
                .catch(err => console.error('An error occurred', err));
        } else {
            this._showToastMessage(`Please select atleast one ${this.state.headerRight == 'Message' ? 'mobile number' : 'email id'}`)
        }
        //  }

    }




    _updateStudentDataForEmailBlast = () => {
        //var listData = this.state.listData
        var selectedStudentsEmailIdList = this.state.selectedStudentsEmailIdList
        var index = 0

        //var bodyList = {}
        var bodyData = {}
        for (index; index < selectedStudentsEmailIdList.length; index++) {
            var element = selectedStudentsEmailIdList[index];
            if (bodyData[element.studentId]) {

                if (bodyData[element.studentId].parents[element.parentId]) {
                    bodyData[element.studentId].parents[element.parentId].push(element.emailId)
                } else {
                    if (!bodyData[element.studentId].parents[element.parentId]) {
                        bodyData[element.studentId].parents[element.parentId] = [];
                    }
                    bodyData[element.studentId].parents[element.parentId].push(element.emailId);
                }
            } else {
                bodyData[element.studentId] = {
                    studentId: element.studentId,
                    parents: {}
                }
                if (!bodyData[element.studentId].parents[element.parentId]) {
                    bodyData[element.studentId].parents[element.parentId] = [];
                }
                bodyData[element.studentId].parents[element.parentId].push(element.emailId);

            }
        }
        // var bodyList = []
        // for (index; index < selectedStudentsEmailIdList.length; index++) {
        //     var element = selectedStudentsEmailIdList[index];
        //     var bodyListItemIndex = bodyList.findIndex((_element) => _element[element.studentId])
        //     //var bodyListItemIndex = bodyList.indexOf(bodyList[element.studentId])
        //     if (bodyListItemIndex > -1) {
        //         var item = bodyList[bodyListItemIndex]

        //         if(item[element.studentId].parents[element.parentId]){
        //         // if (item.parents.parentId == element.parentId) {
        //             item[element.studentId].parents[element.parentId].push(element.emailId)
        //         } else {
        //             // var data = {
        //             //     studentId: element.studentId,
        //             //     parents: {}
        //             // }
        //             if (!item[element.studentId].parents[element.parentId]) {
        //                 item[element.studentId].parents[element.parentId] = [];
        //             }
        //             item[element.studentId].parents[element.parentId].push(element.emailId);
        //         }

        //     } else {
        //         //var emailIdList = []
        //         //emailIdList.push(element.emailId)
        //          var data = {}
        //         //     studentId: element.studentId,
        //         //     parents: {}
        //         // }
        //         if(!data[element.studentId]){
        //             data[element.studentId] = {
        //                 studentId: element.studentId,
        //                 parents: {}}
        //         }
        //         if (!data[element.studentId].parents[element.parentId]) {
        //             data[element.studentId].parents[element.parentId] = [];
        //         }
        //         data[element.studentId].parents[element.parentId].push(element.emailId);

        //         bodyList.push(data)
        //     }
        // }

        //var body = bodyList


        var url = API.BASE_URL + API.API_STUDENTS_UPDATE_EMAIL_BLAST + TeacherAssitantManager.getInstance().getUserID()
        if (this.state.selectedClassId) {
            url += '?class=' + this.state.selectedClassId
        }

        //console.log("body" + JSON.stringify(bodyData))

        //console.log("url is", url);

        this.setLoading(true)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'POST',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': TeacherAssitantManager.getInstance().getUserID(),
            },
            body: JSON.stringify(bodyData)

        })
            .then((responseJson) => {
                // //console.log("response==" + responseJson.message);
                // //console.log("response==" + JSON.stringify(responseJson));

                if (responseJson.success) {
                    this.setLoading(false)
                    this.goToPreviousScreen()
                } else {
                    this.setLoading(false)
                    this._showToastMessage(responseJson.message)
                }
            })
            .catch((error) => {
                this.setLoading(false)
                //console.log("error==" + error)
            });




    }

    _saveMultipleStudentsActions = (rawObject) => {
        // rawObject.isAddActionToMany = true
        this.setLoading(true)
        var url = API.BASE_URL + API.API_STUDENT_ACTION_ASSIGN + API.API_ACTION_ASSIGN_AND_CREATE + "/" + (this.state.isUpdate ? this.state.studentActionID : '')

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: this.state.isUpdate ? 'PUT' : 'POST',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': TeacherAssitantManager.getInstance().getUserID(),
            },
            body: JSON.stringify(rawObject)
        })
            // .then((response) => response.json())
            .then((responseJson) => {
                //console.log("response==" + JSON.stringify(responseJson));
                //console.log("response==" + responseJson.message);

                if (responseJson.success) {
                    this.setLoading(false)

                    this.props.navigation.navigate("HomeScreen")
                    this._showToastMessage(responseJson.message)

                    // this.goToPreviousScreen()
                } else {
                    this.setLoading(false)
                    this._showToastMessage(responseJson.message)
                    // this.showAlert(responseJson.message)
                }
                // this.goToPreviousScreen()

            })
            .catch((error) => {
                //console.log("error===" + error)
            });
    }

    /**
     * This method will set few states empty and call to api hit method to get list of students
     */
    searchStudent = () => {
        // this.showAlert("searched")
        //this.setLoading(true);
        this.setState({
            offset: 0,
            page: 1,
            listData: [],
            isLoaderShown: true,
            isAsyncLoader: true
        }, function () {
            //console.log("value " + this.state.offset)

            this.getStudentData()
        });
    }

    /**
     * This method will show and hide cancel and search botton for search text.
     */

    ShowHideTextComponentView = () => {

        if (!this.state.searchText == '') {
            //show Cancel icon
            this.setState({ isTextEmpty: false })

        }
        else {
            //show search icon
            this.setState({ isTextEmpty: true })

        }
        this.searchStudent()
    }

    /**
     * This method handle click of cancel button in search edit text
     */

    cancelSearching = () => {

        this.textInput.clear()
        this.state.searchText = ''
        this.ShowHideTextComponentView()

    }

    /**
     * This method add text watcher to search edit text
     */
    handleSearchText = (text) => {


        this.setState({
            searchText: text
            , isTextEmpty: true

        }, function () {
            if (text == '' && this.state.isSearched == true) {
                this.searchStudent()
            }
        });



    }

    /**
     * This method will get call for pagination
     */

    loadMoreStudents = () => {

        if (this.state.listData.length < this.state.totalStudents && !this.state.isLoadingMore) {

            this.setState({
                offset: this.state.listData.length,
                isFetchingFromServer: true,
                isLoadingMore: true
            }, function () {
                if (this.state.offset < this.state.totalStudents) {
                    //   this.showAlert(this.state.offset+" offset "+ this.state.limit)
                    this.getStudentData()
                }

            });
        }
    }

    _hitApiToSaveAndUpdateStudentDetails = (studentData, isLastElement = false) => {



        // this.setLoading(true);
        var url = ApiConstant.BASE_URL + ApiConstant.API_STUDENTS + "/" + studentData._id
        var requestInfo = {
            method: 'PUT',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': TeacherAssitantManager.getInstance().getUserID()

            },
            body: JSON.stringify({
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                parents: studentData.parents,
                createdBy: studentData.createdBy,
            }),

        }
        //console.log("Add student", url)



        TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
            //console.log(responseJson.message);

            if (!responseJson.success) {
                this._showToastMessage(responseJson.message)
            }


        }).catch((error) => {

            console.error(error);
        });
    }


    _onPressParentEmail(item, itemIndex) {
        if (this.state.headerRight == '') {
            TeacherAssitantManager.getInstance()._makePhoneCall(item.email.value);
            // var url =  'tel:'+ item.email.value
            // Linking.canOpenURL(url).then(supported => {
            //     if (!supported) {
            //         //console.log('Can\'t handle url: ' + url);
            //     }
            //     else {
            //         return Linking.openURL(url);
            //     }
            // }).catch(err => console.error('An error occurred', err));
        } else {
            var listData = [...this.state.listData]

            var index = listData.findIndex((sectionData) => sectionData.studentId != undefined &&
                sectionData.studentId == item.studentId)

            if (index > -1) {
                var sectionData = listData[index]
                var emailData = sectionData.data[itemIndex]


                if (item.visibility) {
                    var indexNeedToDelete = this.state.selectedStudentsEmailIdList.findIndex((element) => element.emailId == item.email._id)
                    this.state.selectedStudentsEmailIdList.splice(indexNeedToDelete, 1);
                }
                else {
                    this.state.selectedStudentsEmailIdList.push({
                        studentId: item.studentId,
                        emailId: emailData.email._id,
                        parentId: emailData.parentId,
                        email: emailData.email.value
                    })
                }

                emailData.visibility = !item.visibility
                this.setState({
                    listData: listData
                })
            }
        }

    }



    _onPressAddParentEmail(item) {
        const { state, navigate } = this.props.navigation;
        var studentData = item.studentData
        navigate("AddStudentDetailsScreen", {
            data: "Update",
            title: "Update Student",
            studentUserId: studentData._id,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            parentName1: '',
            parentName2: '',
            parentPhone1: '',
            parentPhone2: '',
            parentEmail1: '',
            parentEmail2: '',
            other1: '',
            other2: '',
            other3: '',
            editMode: true,
            studentCount: 0,
            comingFrom: ComingFrom.EMAIL_BLAST_SPECIFY_RECIPIENT,
            parentsList: studentData.parents,
            leftHeader: BreadCrumbConstant.CANCEL,
            studentThumbnailImages: this.state.settingsData.studentThumbnailImages,
            image: studentData.image || "",
            isComingFromSharedScreen: false,
            onGoBack: () => this.refresh()
        });
    }

    _selectUnselectAllStudents = (isSelectAll) => {
        var completeList = this.state.listData
        var studentIds = []

        completeList.forEach((element) => {
            if (element.title == 'Parent') {
                var emailList = element.data
                if (emailList.length > 0) {
                    emailList.forEach(emailElement => {
                        emailElement.visibility = isSelectAll
                        if (isSelectAll) {
                            studentIds.push({
                                studentId: element.studentId, emailId: emailElement.email._id, parentId: emailElement.parentId
                            })
                        }

                    })
                }
            }
        })

        // if (studentIds.length > 0) {
        this.setState({
            selectedStudentsEmailIdList: [...studentIds]
        })

        //console.log(this.state.selectedStudentsEmailIdList)
        // }

        // var completeIndex = 0
        // for (completeIndex; completeIndex < completeList.length; completeIndex++) {
        //     var element = completeList[completeIndex]
        //     if (element.title == 'Parent') {
        //         var emailList = element.data
        //         var completeListEmailIndex = 0
        //         for(completeListEmailIndex;completeListEmailIndex<emailList.length;completeListEmailIndex++){
        //             var emailElement = emailList[completeListEmailIndex]
        //             emailElement.visibility = isSelectAll

        //             //find Student data based on studentId from completeList
        //             var studentIndex = completeList.findIndex((emailItem) => emailItem.studentData != undefined &&
        //                 emailItem.studentData._id == emailElement.studentId)
        //             if (studentIndex > -1) {
        //                 var studentData = completeList[studentIndex].studentData //studentData
        //                 var parentList = studentData.parents //Parents
        //                 var isReturnTrue = false

        //                 var parentIndex = 0
        //                 var emailIndex = 0

        //                 for (parentIndex; parentIndex < parentList.length; parentIndex++) {
        //                     var emailList = parentList[parentIndex].email
        //                     if(emailList.length>0){
        //                         for (emailIndex; emailIndex < emailList.length; emailIndex++) {
        //                             var emailItem = emailList[emailIndex]
        //                             if (emailItem._id == emailElement.email._id) {
        //                                 emailItem.emailBlast = emailElement.visibility
        //                                 isReturnTrue = true
        //                                 if(completeIndex == completeList.length-1){
        //                                     this._hitApiToSaveAndUpdateStudentDetails(studentData,true);
        //                                 }else{
        //                                     this._hitApiToSaveAndUpdateStudentDetails(studentData);
        //                                 }

        //                             }
        //                         }
        //                     }else if(completeIndex == completeList.length-1){
        //                         this.setLoading(false)

        //                     }

        //                     // emailIndex = 0
        //                     // if (isReturnTrue) {
        //                     //     isReturnTrue = false
        //                     //     break;
        //                     // }
        //                 }
        //             }
        //         }

        //     }else if(completeIndex == completeList.length-1){
        //         // this.setLoading(false)
        //         this.setState({
        //             listData:completeList,
        //             loading:false

        //         })

        //     }

        // }


        // completeList.forEach((element, completeListIndex) => {
        //     if (element.title == 'Parent') {
        //         var emailList = element.data
        //         emailList.forEach(emailElement => {
        //             emailElement.visibility = isSelectAll

        //             //find Student data based on studentId from completeList
        //             var studentIndex = completeList.findIndex((emailItem) => emailItem.studentData != undefined &&
        //                 emailItem.studentData._id == emailElement.studentId)
        //             if (studentIndex > -1) {
        //                 var studentData = completeList[studentIndex].studentData //studentData
        //                 var parentList = studentData.parents //Parents
        //                 var isReturnTrue = false

        //                 var parentIndex = 0
        //                 var emailIndex = 0
        //                 if (parentList.length > 0) {
        //                     for (parentIndex; parentIndex < parentList.length; parentIndex++) {
        //                         var emailList = parentList[parentIndex].email
        //                         if (emailList.length > 0) {
        //                             for (emailIndex; emailIndex < emailList.length; emailIndex++) {
        //                                 var emailItem = emailList[emailIndex]
        //                                 if (emailItem._id == emailElement.email._id) {
        //                                     emailItem.emailBlast = emailElement.visibility
        //                                     isReturnTrue = true
        //                                     if (completeListIndex == completeList.length - 2) {
        //                                         this.setLoading(false)
        //                                     }
        //                                     //this._hitApiToSaveAndUpdateStudentDetails(studentData);
        //                                     // break;
        //                                 }
        //                             }
        //                         } else {
        //                             if (completeListIndex == completeList.length - 2) {
        //                                 this.setLoading(false)
        //                             }
        //                         }

        //                         // emailIndex = 0
        //                         // if (isReturnTrue) {
        //                         //     isReturnTrue = false
        //                         //     break;
        //                         // }
        //                     }
        //                 } else {
        //                     if (completeListIndex == completeList.length - 2) {
        //                         this.setLoading(false)
        //                     }
        //                 }

        //             }
        //         })
        //     }


        // });

    }



    renderSectionHeader = (section) => {
        return (

            <Text style={section.title === 'AddEmail' ? { height: 0 } : styles.sectionListTitleTextView}>
                {section.displayName}
            </Text>
        )
    }

    renderItem = (section, item, index) => {
        return (
            <View>
                {
                    // section.title == 'Parent' && item.email.length > 0 && item.email.type != 'Email:' ?
                    section.title == 'Parent' ?
                        <View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#ffffff',
                                        flexDirection: 'row',
                                        paddingStart: 13
                                    }}
                                    onPress={() => this._onPressParentEmail(item, index)}
                                >

                                    <View flex={1} >
                                        <Text numberOfLines={1}
                                            style={styles.boldText}>{item.name}
                                        </Text>
                                        <View style={{ flexDirection: 'row', flex: 1, marginBottom: 5 }}>
                                            <Text style={{ fontSize: 12 }} >{item.email.type}</Text>
                                            <Text style={{ marginLeft: 10, fontSize: 12, }}>{item.email.value}</Text>
                                        </View>
                                    </View>
                                    {item.visibility ?
                                        <View style={[styles.imageNextContainer, styles.marginRight10]}>
                                            <Image style={styles.imageView}
                                                source={require('../img/check_icon.png')}>
                                            </Image>
                                        </View>
                                        : null}

                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 0.5, backgroundColor: 'gray' }} />

                        </View> :
                        null

                }
            </View>
        )
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }



    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <SectionList

                        sections={this.state.listData}

                        renderSectionHeader={({ section }) => this.renderSectionHeader(section)}

                        renderItem={({ section, item, index }) => this.renderItem(section, item, index)}
                    />
                </View>
            </SafeAreaView>
        )
    }








    /**
     * This method will gets call when user come back on this scren from add or update studetnDetailscreen
     */
    refresh() {



    };



    /**
     * This method set Flag for searching, isSearching is true if search is enabled. 
     */
    setFlagForSearching = () => {
        if (this.state.searchText == '') {
            this.setState({ isSearched: false })
        }
        else {
            Keyboard.dismiss;
            this.setState({ isSearched: true })

        }
    }


    //help to prepare student object 
    _getStudentObject(student, isFromSocketEvent = false, headerRight = '') {
        var _emailList = []

        var parentsList = student.parents
        parentsList.forEach(parentElement => {

            var emailList = headerRight == 'Email' ? parentElement.email : parentElement.phone

            emailList.forEach(emailElement => {
                if (headerRight == 'Email' && emailElement.type != 'Email:') {
                    _emailList.push({
                        studentId: student._id, parentId: parentElement._id,
                        name: parentElement.name, email: emailElement,
                        visibility: emailElement.emailBlast
                    })
                } else if (headerRight == 'Message' || headerRight == '' && emailElement.type != "Phone number:") {
                    _emailList.push({
                        studentId: student._id, parentId: parentElement._id,
                        name: parentElement.name, email: emailElement,
                        visibility: emailElement.emailBlast
                    })
                }

            });
        });
        if (isFromSocketEvent) {
            return _emailList
        } else {
            return {
                studentId: student._id,
                data: _emailList,
                displayName: student.displayName,
                title: 'Parent',
                //studentData: student
            };
        }

    }


    /**
     * 
     * @param {*} studentsData 
     * @param {*} studentListData 
     */
    _setDataForActionToMany(studentsData, studentListData) {
        var thisState = this.state;
        for (var i = 0; i < studentsData.length; i++) {
            var student = studentsData[i];
            if (thisState.selectedStudentsEmailIdList.length > 0 && thisState.selectedStudentsEmailIdList.indexOf(student._id) > -1) {
                //this.state.studentIds.push(student._id);
                studentListData.push(this._getStudentObject(student, true));
            }
            else {
                studentListData.push(this._getStudentObject(student, false));
            }
            // studentListData.push(this._getStudentObject(student, false));
        }
        //return studentListData;
    }

    _setDataForClassStudent(studentsData, studentListData) {
        var thisState = this.state;
        for (var i = 0; i < studentsData.length; i++) {
            //console.log("studentsData", studentsData);
            //console.log("this.state.studentIds", thisState.studentIds);
            var student = studentsData[i];

            if (thisState.selectedStudentsEmailIdList.length > 0 && thisState.selectedStudentsEmailIdList.indexOf(student._id) > -1) {
                //this.state.studentIds.push(student._id);
                studentListData.push(this._getStudentObject(student, true));
            }
            else {
                studentListData.push(this._getStudentObject(student, false));
            }
        }
    }

    /**
     * Hit Api to get students list
     */
    getStudentData() {
        ////console.log("UserId" + this.state.userId)
        this.setFlagForSearching()
        var userId = TeacherAssitantManager.getInstance().getUserID()

        var url = (API.BASE_URL + API.API_STUDENTS + API.API_GET_BY_USER_ID + userId + API.API_PAGINATION
            + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT)

        if (this.state.comingFrom == ComingFrom.EMAIL_BLAST_SPECIFY_RECIPIENT && this.state.selectedClassId != '') {
            url = (API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_GET_BY_USER_ID + this.state.createdBy + "/classid/" + this.state.selectedClassId +
                API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT)
        }

        //console.log("url", url)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'POST',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId,
            },
            body: JSON.stringify({
                search: '',
                createdBy: userId,
            }),

        }).then((responseJson) => {
            //console.log(responseJson.message);
            if (responseJson.success) {

                var newArray = this.state.listData;
                //console.log("jsonREsponse is " + responseJson)
                var studentListData = []
                var data = responseJson.data
                var studentsData = data.studentsData

                var thisState = this.state;

                for (var i = 0; i < studentsData.length; i++) {
                    // //console.log("studentsData", studentsData);
                    // //console.log("this.state.studentIds", thisState.studentIds);
                    var student = studentsData[i];
                    studentListData.push(this._getStudentObject(student, false));
                    studentListData.push({ title: 'AddEmail', data: ['Add Email'], studentData: student })
                }


                this.setState({
                    totalStudents: data.count,
                    // page: responseJson.data.pageCount + 1,
                    page: this.state.page + 1,
                    listData: [...newArray, ...studentListData],
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false,
                    settingsData: data.settingsData
                })
                //console.log("Student data is ", studentListData)
                this.props.navigation.setParams({ studentCount: responseJson.data.count })
            } else {
                this.setState({ isAsyncLoader: false, isFetchingFromServer: false })
                this._showToastMessage(responseJson.message)
            }
        }).catch((error) => {
            this.setState({
                isAsyncLoader: false,
                isFetchingFromServer: false,
                isLoadingMore: false
            })
            console.error(error);
        });
    }


    // event listener for socket
    _addEventListener = () => {
        this.addStudentListener = EventRegister.addEventListener(SocketConstant.ADD_STUDENT, (data) => {
            // if (this.state.comingFrom == ComingFrom.STUDENT_SCREEN ||
            //     (this.state.selectedClassId == '' && this.state.comingFrom == ComingFrom.ACTION_TO_MANY)) {
            var classId = this.state.selectedClassId
            var comingFrom = this.state.comingFrom

            this._addDataToStudent(data)
            //}

        })

        this.removeStudentListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_BULK_STUDNET, (data) => {
            //console.log('removeStudentListener');
            // if (this.state.comingFrom == ComingFrom.STUDENT_SCREEN ||
            //     (this.state.selectedClassId == '' && this.state.comingFrom == ComingFrom.ACTION_TO_MANY)) {
            this._removeStudentData(data)
            // }

        })

        this.updateStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT, (data) => {
            //console.log('UpdateStudentListener');
            // if (this.state.comingFrom == ComingFrom.STUDENT_SCREEN ||
            //     (this.state.selectedClassId == '' && this.state.comingFrom == ComingFrom.ACTION_TO_MANY)) {
            this._updateStudentData(data)
            //}
        })

        this.updateStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT_BULK, (data) => {
            //console.log('UpdateStudentListener');
            this._updateStudentBulkData(data)
        })


        // this.updateStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT_BULK, (data) => {
        //     //console.log('UpdateStudentListener');
        //     this._updateStudentBulkData(data)
        // })


        //setting function
        this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
            //console.log("addStudentListener", data)
            this._updateUserSetting(data)
        })


    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addStudentListener)
        EventRegister.removeEventListener(this.removeStudentListener)
        EventRegister.removeEventListener(this.updateStudentListener)
        EventRegister.removeEventListener(this.deleteStudentClassBulkListener)
        EventRegister.removeEventListener(this.addStudentClassBulkListener)
        EventRegister.removeEventListener(this.updateUserSetting)



    }

    //add data to student
    _addDataToStudent = (student) => {

        if (this.state.listData.length > 0) {

            //var listData = [...this.state.listData]
            var index = this.state.listData.findIndex((sectionData) => sectionData.studentId == student._id)
            if (index == -1) {
                //console.log('_addDataToStudent==' + student)
                //console.log(student)
                var studentcouter = 0
                var index = 0
                for (index; index < this.state.listData.length; index++) {
                    var item = this.state.listData[index]
                    if (item.title == 'AddEmail') {
                        studentcouter = studentcouter + 1
                    }
                }

                if (studentcouter == this.state.totalStudents) {
                    //console.log('enter this.state.listData.length == this.state.totalStudents')
                    // listData.push(listDataObjet)
                    this.state.listData.push(this._getStudentObject(student, false));
                    this.state.listData.push({ title: 'AddEmail', data: ['Add Email'], studentData: student })
                } else {
                    //console.log('not enter this.state.listData.length == this.state.totalStudents')
                }

                this.setState({
                    totalStudents: this.state.totalStudents + 1,
                    listData: this.state.listData
                })

            }

        }
    }

    //remove student data
    _removeStudentData = (studentList) => {
        var deletedStudents = 0;

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            //console.log(studentList._id)
            var array = [...this.state.listData];

            for (var i = 0; i < studentList._id.length; i++) {
                //console.log('for studentList')
                //console.log(studentList._id[i])

                var index = array.findIndex(studentObject => studentObject.studentData != undefined &&
                    studentObject.studentData._id == studentList._id[i]);
                //console.log('index' + index)

                if (index > -1) {
                    array.splice(index, 1);
                    array.splice((index - 1), 1);
                    deletedStudents = deletedStudents + 1
                }
            }

            var studentcount = this.state.totalStudents - deletedStudents
            //console.log("studentCount", studentcount)
            this.props.navigation.setParams({ studentCount: studentcount })
            this.setLoading(false);
            this.setState({
                listData: array,
                selectedStudentsEmailIdList: [],
                totalStudents: studentcount

            })
        }


    }







    _updateStudentData(student) {

        if (this.state.listData.length > 0) {
            //console.log('_UpdateStudentData');

            //console.log(student);

            var listData = [...this.state.listData]
            var index = listData.findIndex((sectionData) => sectionData.studentId == student._id)
            if (index > -1) {
                var sectionListData = listData[index]
                sectionListData.displayName = student.displayName // display name
                sectionListData.data = this._getStudentObject(student, true)// parentList
            }
            this.setState({
                listData: listData
            })
        }



    }

    _updateStudentBulkData(studentList) {

        if (this.state.listData.length > 0) {
            //console.log('_UpdateStudentData');

            //console.log(student);

            var listData = [...this.state.listData]
            let studentIndex = 0;
            for (studentIndex; studentIndex < studentList.length; studentIndex++) {
                var student = studentList[studentIndex];
                var index = listData.findIndex((sectionData) => sectionData.studentId == student._id)
                if (index > -1) {
                    var sectionListData = listData[index]
                    sectionListData.data = TeacherAssitantManager.getInstance()._addDisplayNameToStudentData(student,
                        this.state.settingsData.studentDisplayOrder, this.state.settingsData.studentSortOrder)//updaet data with Display Name
                    sectionListData.data = this._getStudentObject(student, true)// parentList
                }
            }

            this.setState({
                listData: listData
            })
        }



    }



    //_updateUserSetting
    _updateUserSetting = (settingData) => {

        if (settingData.studentSortOrder != undefined || settingData.studentDisplayOrder != undefined) {
            this.setState({
                page: 1,
                listData: [],
                studentIds: [],
                isAsyncLoader: true
            }, function () {

                this.getStudentData()
            });
        }
    }


    //deleteStudent from class (assignerd will unassigned)
    _deleteStudentClassBulkListener(data) {


    }

    // addStudent into selected class (unassignerd will assigned)
    _addStudentClassBulk(data) {
        for (var i = 0; i < data.length; i++) {
            var index = this.deleteStudentClassBulkData.findIndex(object => object.student)
        }


    }

}

const styles = StyleSheet.create({

    containerClassList: {
        flex: 0.94,
        flexDirection: 'row'
        //marginBottom: 10
    },
    containerBottom: {
        flex: 0.06,
    },
    container: {
        flex: 1,
        backgroundColor: "#E7E7E7"
    },
    buttonContainer: {
        flexDirection: "row"
    },
    button: {
        height: 50,
        flex: 2,
        marginTop: 15,
        justifyContent: "center",
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2
    },
    // rowText: {
    //   justifyContent: "center",
    //   alignItems: "center",
    //   fontSize: 15,
    //   marginLeft: 10,
    //   flex: 1,
    // },

    rowText: {
        fontSize: 15,
        marginLeft: 10,
        justifyContent: "flex-start",
        textAlignVertical: 'center'
    },

    SearchImageContainer: {
        position: "absolute",
        right: 0,
        width: 25,
        marginEnd: 10,
        height: 25

    },
    list: {
        // marginTop: 5,
        flex: 1,
        backgroundColor: "white"
    },
    searchImage: {
        position: "absolute",
        right: 0,
        width: 25,
        height: 25
    },
    rowTextContainter: {
        flex: 0.9, justifyContent: "center",
    },
    input: {
        marginStart: 5,
        marginEnd: Platform.OS !== 'ios' ? 40 : 5
    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 5,
        margin: 12,
        backgroundColor: 'white'
    },

    searchingBox: {
        backgroundColor: "white",
        margin: 10,
        width: "96%",
        height: 40,
        justifyContent: "center",
        borderRadius: 5,
        alignContent: "center"
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
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#8E8E8E"
    },
    imageContainer: {
        flex: 0.05,
        flexDirection: 'row',
        marginLeft: 5
    },
    imageNextContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',

    },
    marginLeft20: { marginLeft: 20 },
    marginLeft10: { marginLeft: 10 },
    marginRight10: { marginRight: 10 },

    touchStyle: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
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
    deleteView: {
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginRight: 10,
        right: 0,
    },
    deleteContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
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
    sectionListTitleTextView: {
        margin: 10,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        fontSize: 15,
        marginTop: 20,
        color: 'gray'
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
    buttonParent: {
        height: 50,
        flex: 1,
        marginTop: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        flexDirection: 'row'
    },
});
