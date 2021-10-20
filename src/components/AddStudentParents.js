import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    SafeAreaView,
    TouchableOpacity,
    SectionList, Linking,
    Image, Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import StorageConstant from '../constants/StorageConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import { EventRegister } from 'react-native-event-listeners'
import SocketConstant from '../constants/SocketConstant'

import update from 'react-addons-update'
import AppConstant from "../constants/AppConstant";
import ComingFrom from "../constants/ComingFrom"
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";

import Toast, { DURATION } from 'react-native-easy-toast'
export default class AddStudentParents extends React.PureComponent {


    constructor(props) {
        super(props)
        var stateParmData = this.props.navigation.state.params
        var emailList = []
        var phoneList = []
        if (stateParmData.parentData.name != undefined && stateParmData.parentData.email.length > 0) {
            if (stateParmData.parentData.email[0].type == "Email:") {
                emailList = []
            } else {
                emailList = stateParmData.parentData.email
            }
        }

        if (stateParmData.parentData.name != undefined && stateParmData.parentData.phone.length > 0) {
            if (stateParmData.parentData.phone[0].type == "Phone number:") {
                phoneList = []
            } else {
                phoneList = stateParmData.parentData.phone
            }
        }

        this.state = {
            userId: stateParms.userId,
            createdBy: stateParms.createdBy,
            parentName: stateParmData.parentData.name == undefined ? '' : stateParmData.parentData.name,

            // phoneList: phoneList,
            parentData: stateParmData.parentData,
            listData: [
                { title: '', data: ['name'] },
                { title: 'Email', data: emailList },
                { title: 'AddEmail', data: ['AddEmail'] },
                { title: 'Phone', data: phoneList },
                { title: 'AddPhone', data: ['AddPhone'] },
            ],
            parentIndex: stateParmData.index
        }
        this.studentId = stateParmData.studentId
    }





    componentDidMount() {
        this.props.navigation.setParams({ onAdd: this.onAddPress, moveToStudent: this._gotoPreviousScreen })
        //this._addEventListener();

    }

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
            //if (data.classId != undefined) {
            this._addClassesToSelectedStudent(data)

        })

        this.deleteStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_STUDENT_CLASS_BULK, (data) => {
            //console.log('deleteStudentClassBulkListener');
            var _classId = this.state.classId
            if (_classId != undefined && _classId == data.classId) {
                // this._deleteStudentClassBulkListener(data.data)
            }

        })
    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.removeBulkClassListener)
        EventRegister.removeEventListener(this.updateClassListener)
    }
    //Socket Section


    refresh = (data, index, isFromEmail = false) => {
        Keyboard.dismiss
        if (data != undefined) {
            if (isFromEmail) {
                var listData = [...this.state.listData]
                var emailList = listData[1].data

                if (index > -1) {
                    emailList[index] = data
                } else {
                    emailList.push(data)
                }
                listData[1].data = emailList
                this.setState({
                    listData: listData
                })


            } else {
                var listData = [...this.state.listData]
                var phoneList = listData[3].data

                if (index > -1) {
                    phoneList[index] = data
                } else {
                    phoneList.push(data)
                }
                listData[3].data = phoneList
                this.setState({
                    listData: listData
                })
            }
        }

    }

    getAndSetUserId = () => {
        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
            //console.log("Get Value >> ", value);
            this.setState({
                userId: value
            })
            this.getClassDataForStudent();
        }).done();
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var isTrue = params.createdBy != TeacherAssitantManager.getInstance().getUserID()
        // var istrue = comingFrom == ComingFrom.HOME_SCREEN || comingFrom == ComingFrom.STUDENT_ACTIONS
        return {
            title: `${navigation.state.params.screenTitle}` + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_PARENT, 0),
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: () =>
                <TouchableOpacity onPress={() => params.moveToStudent()}>
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
                    disabled={isTrue}>
                    {
                        isTrue ? null :
                            <Text style={StyleTeacherApp.headerRightButtonText}>
                                {navigation.state.params.headerRight}
                            </Text>
                    }


                </TouchableOpacity>


        }
    }


    onAddPress = () => {
        this._gotoPreviousScreen(true)
    }

    _gotoPreviousScreen = (isFromSave = false) => {
        Keyboard.dismiss
        if (isFromSave) {
            var parentName = this.state.parentName
            if (parentName.trim().length > 0) {
                var emailList = [...this.state.listData[1].data]
                if (emailList.length == 0) {
                    emailList.push({
                        value: '', type: 'Email:'
                    })
                }

                var phoneList = [...this.state.listData[3].data]
                if (phoneList.length == 0) {
                    phoneList.push({
                        value: '', type: 'Phone number:'
                    })
                }
                var parentData = {}
                var stateParentdata = this.state.parentData
                if (stateParentdata.name != undefined) {
                    parentData = this.state.parentData
                    parentData.name = this.state.parentName
                    parentData.email = emailList
                    parentData.phone = phoneList
                } else {
                    parentData = {
                        email: emailList,
                        phone: phoneList,
                        name: this.state.parentName
                    }
                }
                this.props.navigation.state.params.onGoBack(parentData, true, this.state.parentIndex);
                this.props.navigation.goBack();
            } else {
                // TeacherAssitantManager.getInstance().showAlert("Name can't be Blank")
                this._showToastMessage("Name can't be Blank")
            }


        } else {
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
        }

    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    _onPressAddEmailAddress = (item, index) => {
        Keyboard.dismiss
        if (TeacherAssitantManager.getInstance().getUserID() == this.state.createdBy) {
            var propsNavigation = this.props.navigation
            var stateParmData = propsNavigation.state.params

            var studentData = {
                screenTitle: (stateParmData.parentData.name == undefined ? 'Add ' : 'Update ') + 'Email',
                onGoBack: this.refresh,
                headerRight: stateParmData.parentData.name == undefined ? 'Save' : 'Update',
                emailData: item,
                index: index,
                leftHeader: BreadCrumbConstant.CANCEL
            }
            propsNavigation.navigate("AddStudentParentsEmail", studentData)
        } else {
            this._showToastMessage('Not authorized')
        }


    }

    _onPressAddPhoneNumber = (item, index) => {
        Keyboard.dismiss
        if (TeacherAssitantManager.getInstance().getUserID() == this.state.createdBy) {
            var propsNavigation = this.props.navigation
            var stateParmData = propsNavigation.state.params
            // var phoneData ={}
            // if(index>-1){
            //     phoneData = this.state.listData[3].data[index]
            // }

            var studentData = {
                screenTitle: (stateParmData.parentData.name == undefined ? 'Add ' : 'Update ') + 'Phone',
                onGoBack: this.refresh,
                headerRight: stateParmData.parentData.name == undefined ? 'Save' : 'Update',
                phoneData: item,
                index: index,
                leftHeader: BreadCrumbConstant.CANCEL
            }
            propsNavigation.navigate("AddStudentParentsContact", studentData)
        } else {
            this._showToastMessage('Not authorized')
        }
    }

    _handleParentName = (text) => {
        this.setState({
            parentName: text
        })
    }

    _onPressMakeCall = (item) => {
        TeacherAssitantManager.getInstance()._makePhoneCall(item.value);

        //    var url =  'tel:'+ item.value
        //     Linking.canOpenURL(url).then(supported => {
        //         if (!supported) {
        //             //console.log('Can\'t handle url: ' + url);
        //         }
        //         else {
        //             return Linking.openURL(url);
        //         }
        //     }).catch(err => console.error('An error occurred', err));
    }

    _onPressSendEmail = (item) => {
        // var emailUrl = ("mailto:" + item.value + "?&bcc=&subject=Teacher's Assistant Pro Version " +
        //     TeacherAssitantManager.getInstance().getBuildVersion() + "&body=")
        
        var emailUrl = TeacherAssitantManager.getInstance().getMailToUrl(item.value)
        Linking.openURL(emailUrl)
            .catch(err => console.error('An error occurred', err));
    }

    renderSectionHeader = (section) => {
        return (

            <Text style={section.title == '' || section.title === 'AddParents' || section.title === 'AddPhone' || section.title === 'AddEmail' ?
                { height: 0 } :
                styles.textView}>
                {section.title === 'AddEmail' || section.title === 'AddPhone' ? '' : section.title}
            </Text>
        )
    }



    renderItem = (section, item, index) => {
        var title = section.title
        //console.log('title' + title)
        //console.log(section)
        return (
            <View>
                {title == "" && index == 0 ?
                    <View style={styles.textViewCOntainer}>
                        <Text style={styles.textStyle}>
                            Name
                        </Text>
                        <TextInput style={styles.textInputStyle}
                            underlineColorAndroid="transparent"
                            placeholder="Name"
                            placeholderTextColor="gray"
                            autoCapitalize="none"
                            ref={(r) => { this._textInputRef = r; }}
                            value={this.state.parentName}
                            onChangeText={this._handleParentName}

                        />

                    </View>
                    : null
                }
                {
                    title == "Email" ?
                        <View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                        flexDirection: 'row',
                                        paddingStart: 13
                                    }}
                                    onPress={() => this._onPressSendEmail(item)}
                                >

                                    <View style={{ height: 50, flex: 0.8, }}>
                                        <View style={{
                                            flexDirection: 'row', flex: 1,
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                        }}>
                                            <Text style={{ fontSize: 16 }} >{item.type}</Text>
                                            <Text style={{ marginLeft: 10, fontSize: 16, }}>{item.value}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.imageNextContainer}>
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', }}>
                                            <TouchableOpacity onPress={() => this._onPressAddEmailAddress(item, index)} >
                                                <Image style={styles.iconInfoImageView}
                                                    source={require('../img/icon_info.png')}>
                                                </Image>
                                            </TouchableOpacity>

                                            <Image style={styles.imageView}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>


                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 0.5, backgroundColor: 'gray' }} />

                        </View>
                        : null
                }
                {
                    title == "AddEmail" ?
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={() => this._onPressAddEmailAddress({}, -1)}
                                style={styles.button}>
                                <Text numberOfLines={1}
                                    style={styles.buttonText}>{"Add Email"}
                                </Text>

                                <View
                                    style={styles.imageNextContainer}>
                                    <Image
                                        style={styles.imageView}
                                        source={require('../img/icon_arrow.png')}>
                                    </Image>
                                </View>
                            </TouchableOpacity>
                        </View>
                        : null
                }
                {
                    title == "Phone" ?
                        <View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                        flexDirection: 'row',
                                        paddingStart: 13
                                    }}
                                    onPress={() => this._onPressMakeCall(item)
                                    }
                                >

                                    <View style={{ height: 50, flex: 0.8, }}>
                                        <View style={{
                                            flexDirection: 'row', flex: 1,
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                        }}>
                                            <Text style={{ fontSize: 16 }} >{item.type}</Text>
                                            <Text style={{ marginLeft: 10, fontSize: 16, paddingBottom: 1 }}>{item.value}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.imageNextContainer}>
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', }}>
                                            <TouchableOpacity onPress={() => this._onPressAddPhoneNumber(item, index)} >
                                                <Image style={styles.iconInfoImageView}
                                                    source={require('../img/icon_info.png')}>
                                                </Image>
                                            </TouchableOpacity>

                                            <Image style={styles.imageView}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>


                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 0.5, backgroundColor: 'gray', paddingTop: 1 }} />

                        </View>
                        : null
                }
                {
                    title == "AddPhone" ?
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={() => this._onPressAddPhoneNumber({}, -1)}
                                style={styles.button}>
                                <Text numberOfLines={1}
                                    style={styles.buttonText}>{"Add Phone Number"}
                                </Text>

                                <View
                                    style={styles.imageNextContainer}>
                                    <Image
                                        style={styles.imageView}
                                        source={require('../img/icon_arrow.png')}>
                                    </Image>
                                </View>
                            </TouchableOpacity>
                        </View>
                        : null
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

                        keyExtractor={(item, index) => `${index}`}

                    />
                </View>
            </SafeAreaView>
        )
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
        justifyContent: 'center',
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
        flex: 0.5,
        marginLeft: 1,
        marginTop: 13,
        height: 40,
        fontSize: 15,
        justifyContent: 'flex-start',
    },
    textInputStyle: {
        flex: 0.5,
        borderBottomWidth: 0.5,
        paddingStart: 8,
        paddingEnd: 8

    },
    textView: {
        marginLeft: 10,
        marginTop: 5,
        marginBottom: 5,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        fontSize: 16,
        color: 'gray',
    },

    button: {
        height: 50,
        flex: 1,
        marginTop: 1,
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
    },

    iconInfoImageView: {
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16,
        marginLeft: 4
    }
});