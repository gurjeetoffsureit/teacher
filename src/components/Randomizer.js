import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SectionList,
    Alert, ToastAndroid, SafeAreaView,
    TextInput, Platform, FlatList, PermissionsAndroid, Keyboard,
    Linking
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
import SegmentedControlTab from 'react-native-segmented-control-tab'
import ActionSheet from 'react-native-actionsheet'
import Toast, { DURATION } from 'react-native-easy-toast'

export default class Randomizer extends React.PureComponent {

    constructor(props) {
        super(props);
        var stateParms = this.props.navigation.state.params

        this.state = {
            offset: 0,
            totalStudents: 0,
            loading: false,
            isAsyncLoader: true,
            isLoadingMore: false,
            listData: [],
            isLoaderShown: true,
            page: 1,
            pageCount: 0,
            //studentProfilePic: require("../img/camera_icon.png"),
            selectedClassId: stateParms.selectedClassId, // it will be empty if coming from Allstudents click and will have classId if clicked on any particular class
            createdBy: stateParms.createdBy,
            comingFrom: stateParms.comingFrom,
            isFetchingFromServer: false,
            settingsData: {},
            segmentControlTabList: ['Size', 'Number'],
            selectedIndex: 0,
            sizeOrNumberValue: 1,
            sizeValue: 1,
            numberValue: 1,
            selectedItemsNeedToAttachMarks: []
        };
    }

    componentDidMount() {

        this.props.navigation.setParams({ onAdd: this.onRightHeaderClick, goBack: this.goToPreviousScreen });
        this._getInitialRandomizerStudentData(false, true);
        this._addEventListener()
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
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
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
        this._updateMarksOfStudent();
    }

    _updateMarksOfStudent = (isClearMarks = false) => {
        var selectedItemsNeedToAttachMarks = this.state.selectedItemsNeedToAttachMarks
        var index = 0
        if (selectedItemsNeedToAttachMarks.length == 0) {
            this._showToastMessage('Please select at least one student')
            return
        }
        var bodyData = {}
        var url = API.BASE_URL + API.API_RANDOMIZER + API.API_MARK + TeacherAssitantManager.getInstance().getUserID()
        var classId = this.state.selectedClassId
        if (classId != '') {
            url += '?class=' + classId
        }
        if (!isClearMarks && selectedItemsNeedToAttachMarks.length > 0) {
            bodyData = {
                marks: selectedItemsNeedToAttachMarks
            }
        }

        // if(bodyData.marks!=undefined){
        //console.log("body" + JSON.stringify(bodyData))
        //}


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

                // if (responseJson.success) {
                //     this.setLoading(false)
                //     //this.goToPreviousScreen()
                // } else {
                this.setLoading(false)
                this._showToastMessage(responseJson.message)
                //}
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

            //this.getStudentData()
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

        if (this.state.page <= this.state.pageCount && !this.state.isLoadingMore) {
            this.setState({
                offset: this.state.listData.length,
                isFetchingFromServer: true,
                isLoadingMore: true
            }, function () {
                // if (this.state.offset < this.state.totalStudents) {
                this._getRandomizerStudentDataWithNewChange(true)
                // }

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


    _onPressStudent(item, itemIndex) {

        var listData = [...this.state.listData]

        var sectionIndex = 0
        for (sectionIndex; sectionIndex < listData.length; sectionIndex++) {
            var datalist = listData[sectionIndex].data;
            var studentIndex = 0
            for (studentIndex; studentIndex < datalist.length; studentIndex++) {
                var student = datalist[studentIndex];
                if (student.studentId == item.studentId) {
                    switch (student.markType) {
                        case 0:
                            student.markType = 1
                            var index = this.state.selectedItemsNeedToAttachMarks.findIndex((_student) => _student.studentId == item.studentId)
                            if (index == -1) {
                                this.state.selectedItemsNeedToAttachMarks.push({
                                    studentId: item.studentId,
                                    markType: student.markType
                                })
                            }
                            break;
                        case 1:
                            student.markType = 2
                            var index = this.state.selectedItemsNeedToAttachMarks.findIndex((student) => student.studentId == item.studentId)
                            if (index > -1) {
                                this.state.selectedItemsNeedToAttachMarks[index].markType = student.markType
                            }
                            break;
                        case 2:
                            student.markType = 0
                            var index = this.state.selectedItemsNeedToAttachMarks.findIndex((student) => student.studentId == item.studentId)
                            if (index > -1) {
                                this.state.selectedItemsNeedToAttachMarks.splice(index, 1);
                            }
                            break;
                    }

                    this.setState({
                        listData: listData
                    })

                    break;
                }
            }
        }

    }




    _onPressIncrementedDecrementedValue = (isIncremented) => {

        if (this.state.selectedIndex == 0) {
            switch (isIncremented) { // this is for when Size is selected
                case true:
                    var value = this.state.sizeValue + 1
                    this.setState({
                        sizeOrNumberValue: value,
                        sizeValue: value,
                    }, function () {
                        this._getRandomizerStudentDataWithNewChange()
                    })
                    break;

                default:
                    var value = this.state.sizeValue - 1
                    if (value < 1) {
                        value = 1
                    }
                    this.setState({
                        sizeOrNumberValue: value,
                        sizeValue: value,
                    }, function () {
                        this._getRandomizerStudentDataWithNewChange()
                    })
                    break;
            }
        } else {// this is for when Number is selected
            switch (isIncremented) { // this is for when Size is selected
                case true:
                    var value = this.state.numberValue + 1
                    this.setState({
                        sizeOrNumberValue: value,
                        numberValue: value,
                    }, function () {
                        this._getRandomizerStudentDataWithNewChange()
                    })
                    break;

                default:
                    var value = this.state.numberValue - 1
                    if (value < 1) {
                        value = 1
                    }
                    this.setState({
                        sizeOrNumberValue: value,
                        numberValue: value,
                    }, function () {
                        this._getRandomizerStudentDataWithNewChange()
                    })
                    break;
            }
        }

    }



    handleIndexChange = (index) => {
        this.setState({
            selectedIndex: index,
            sizeOrNumberValue: index == 0 ? this.state.sizeValue : this.state.numberValue
        }, function () {
            this._getRandomizerStudentDataWithNewChange()
        });
    }

    _onPressSort = () => {
        this.setState({ page: 1 }, function () {
            if (this.state.selectedIndex == 0)
                this._getInitialRandomizerStudentData(true, false)
            else this._getRandomizerData(false, false, true)
        })

    }

    _onPressClearMarksForAllStudents = () => {

        this.setState({
            selectedItemsNeedToAttachMarks: []
        })
        var completeList = this.state.listData
        completeList.forEach((element) => {
            var studentData = element.data
            if (studentData.length > 0) {
                studentData.forEach(studentElement => {
                    studentElement.markType = 0
                })
            }
        })
        this._updateMarksOfStudent(true)
    }

    _onPressRandomize = () => {
        this.setState({ page: 1, listData: [] }, function () {
            if (this.state.selectedIndex == 0) this._getInitialRandomizerStudentData(false, true)
            else this._getRandomizerData(false, true)
        })
    }

    _onPressEmailListing = () => {
        this.EmailActionSheet.show()
    }

    _handleEmailActionSheetIndex = (index) => {
        switch (index) {
            case 0: //email
                var body = ''
                var listData = this.state.listData

                var isNextGroup = false
                listData.forEach(element => {
                    var data = element.data
                    var count = 0
                    data.forEach(dataElement => {
                        if (body == '') {
                            body = this.setAndGetStudentByGroup(element, dataElement)
                        } else {
                            if (isNextGroup) {
                                body = body + '\n\n' + this.setAndGetStudentByGroup(element, dataElement)
                                isNextGroup = false
                            } else {
                                body = body + '\n' + dataElement.name
                            }
                        }
                        count += 1
                        if (count == data.length) {
                            isNextGroup = true
                        }
                    });
                });

                if (body != '') {
                    // var emailUrl = ("mailto:" + this.state.settingsData.toTeacherEmail + "?&bcc=&subject=Teacher's Assistant Pro Version " +
                    //     TeacherAssitantManager.getInstance().getBuildVersion() + "&body=" + body)
                    var emailUrl = TeacherAssitantManager.getInstance().getMailToUrl(this.state.settingsData.toTeacherEmail, body,)
                    Linking.openURL(emailUrl)
                        .catch(err => console.error('An error occurred', err));
                }
                break;
        }

    }


    setAndGetStudentByGroup(element, dataElement) {
        return element.displayName + '\n\n' + dataElement.name;
    }

    renderSectionHeader = (section) => {
        // if(this.state.selectedIndex ==1)return null
        return (
            <Text style={styles.sectionListTitleTextView}>
                {section.displayName}
            </Text>
        )
    }



    renderItem = (section, item, index) => {
        return (
            <View>
                {/* {
                    section.title == 'Parent' ? */}
                <View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: '#ffffff',
                                flexDirection: 'row',
                                paddingStart: 13
                            }}
                            onPress={() => this._onPressStudent(item, index)}
                        >

                            <View style={{ flex: 1, justifyContent: "center", height: 40 }} >
                                <Text numberOfLines={1}
                                    style={styles.boldText}>{item.name}
                                </Text>
                            </View>
                            {item.markType == 1 ?
                                <View style={[styles.imageNextContainer, styles.marginRight10]}>
                                    <Image style={styles.imageView}
                                        source={require('../img/green_check_icon.png')}>
                                    </Image>
                                </View>
                                : null}

                            {item.markType == 2 ?
                                <View style={[styles.imageNextContainer, styles.marginRight10]}>
                                    <Image style={styles.imageView}
                                        source={require('../img/ic_cross_red.png')}>
                                    </Image>
                                </View>
                                : null}

                        </TouchableOpacity>
                    </View>
                </View>
                {/* :
                        null

                } */}
            </View>
        )
    }


    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }



    render() {
        // //console.log('this.state.listData render  --> ', JSON.stringify(this.state.listData))
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <ActionSheet
                        ref={o => this.EmailActionSheet = o}
                        title={AppConstant.APP_NAME}
                        options={['Email List', 'Cancel']}
                        cancelButtonIndex={1}
                        onPress={(index) => { this._handleEmailActionSheetIndex(index) }}
                    />
                    <Loader loading={this.state.loading} />
                    <View style={{ flex: 0.916 }}>


                        <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />

                        <SectionList

                            sections={this.state.listData}

                            renderSectionHeader={({ section }) => this.renderSectionHeader(section)}

                            renderItem={({ section, item, index }) => this.renderItem(section, item, index)}

                            keyExtractor={(item, index) => `${index}`}
                            onEndReached={this.loadMoreStudents}
                            onEndReachedThreshold={0.8}
                            // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(this.state.listData)}
                            ItemSeparatorComponent={(sectionId, rowId) => (
                                <View key={rowId} style={styles.separator} />
                            )}
                            ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                        />
                    </View>
                    <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                    />
                    <View style={styles.bottomOuterView}>
                        <View style={{
                            flexDirection: 'row',
                            flex: 1,
                            marginLeft: 10,
                            marginRight: 10,
                            alignItems: 'center'
                        }}>
                            <Text style={[styles.upperBottomSectionTextFont, styles.textAlignLeft, { flex: .6 }]}>Groups</Text>
                            <View style={{
                                flexDirection: 'row', borderRadius: 5, borderWidth: .5, borderColor: 'blue',
                                marginStart: 5, flex: 1
                            }}>
                                {/* <Text style={[styles.upperBottomSectionText, styles.textAlignLeft]}>Size</Text>
                                <Text style={[styles.upperBottomSectionText, styles.textAlignLeft]}>Number</Text> */}
                                <SegmentedControlTab
                                    values={this.state.segmentControlTabList}
                                    selectedIndex={this.state.selectedIndex}
                                    onTabPress={this.handleIndexChange}
                                    styles={
                                        { padding: 10 }
                                    }
                                />
                            </View>
                            <View style={{ flexDirection: 'row', marginStart: 5, flex: 1, justifyContent: 'space-evenly' }}>
                                <TouchableOpacity
                                    onPress={() => this._onPressIncrementedDecrementedValue(false)}
                                    style={{ height: 35, width: 40, justifyContent: "center", }}>
                                    <Text style={[styles.blueColor, {
                                        fontSize: 25, fontWeight: "bold", textAlign: 'center',
                                        textAlignVertical: 'center'
                                    }]}>-</Text>
                                </TouchableOpacity>

                                <View style={{ height: 35, width: 35, justifyContent: "center" }}>
                                    <Text style={[styles.blackColor, { fontSize: 18, textAlign: 'center', textAlignVertical: 'center' }]}>
                                        {this.state.sizeOrNumberValue}
                                    </Text>
                                </View>



                                <TouchableOpacity
                                    onPress={() => this._onPressIncrementedDecrementedValue(true)}
                                    style={{ height: 35, width: 40, justifyContent: "center" }}>
                                    <Text style={[styles.blueColor, {
                                        fontSize: 25, fontWeight: "bold", textAlign: 'center',
                                        textAlignVertical: 'center'
                                    }]}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={{ flex: 0.002, backgroundColor: 'gray' }}
                    />
                    <View style={styles.bottomOuterView}>
                        <View style={{
                            flexDirection: 'row',
                            flex: 1,
                            marginLeft: 10,
                            marginRight: 10,
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity style={[styles.upperBottomSectionTextFont, styles.textAlignLeft, { flex: .5 }]}
                                onPress={() => this._onPressSort()}
                            >
                                <Text style={[styles.bottomText, styles.blueColor]}>Sort</Text>
                            </TouchableOpacity>


                            <View style={{
                                flexDirection: 'row', flex: 1, height: 35, alignItems: 'center'
                            }}>
                                <TouchableOpacity style={[styles.upperBottomSectionTextFont, styles.textAlignLeft]}
                                    onPress={() => this._onPressClearMarksForAllStudents()}
                                >
                                    <Text style={[styles.bottomText, styles.blueColor]}>Clear Marks</Text>
                                </TouchableOpacity>
                            </View>


                            <View style={{ flexDirection: 'row', marginStart: 5, flex: 1, height: 35, alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.upperBottomSectionTextFont, styles.textAlignLeft]}
                                    onPress={() => this._onPressRandomize()}
                                >
                                    <Text style={[styles.bottomText, styles.blueColor]}>Randomize</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, { position: 'absolute', end: 0 }]}
                                    onPress={() => this._onPressEmailListing()}>
                                    <Image style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: 30,
                                        width: 25
                                    }}
                                        source={require('../img/print.png')}>
                                    </Image>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>


            </SafeAreaView >
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
    _getStudentObject(student, isFromSocketEvent = false, studentIndex) {
        var _emailList = []
        _emailList.push({
            studentId: student._id, parentId: '',
            name: student.displayName, email: '',
            markType: 0
        })
        // var parentsList = student.parents
        // parentsList.forEach(parentElement => {
        //     var emailList = parentElement.email
        //     emailList.forEach(emailElement => {
        //         if (emailElement.type != 'Email:') {
        // _emailList.push({
        //     studentId: student._id, parentId: parentElement._id,
        //     name: parentElement.name, email: emailElement,
        //     visibility: emailElement.emailBlast
        // })
        //             if (emailElement.emailBlast) {
        //                 this.state.selectedStudentsEmailIdList.push({
        //                     studentId: student._id, emailId: emailElement._id, parentId: parentElement._id,
        //                 })
        //             }

        //         }

        //     });
        // });
        if (isFromSocketEvent) {
            return _emailList
        } else {
            return {
                studentId: student._id,
                data: _emailList,
                displayName: studentIndex != -1 ? 'Group ' + studentIndex + 1 : '',
                // title: 'Parent',
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
    _getInitialRandomizerStudentData = (isForSort = false, isForRandomizer = false) => {
       
        this.setFlagForSearching()
        var userId = TeacherAssitantManager.getInstance().getUserID()

        var url = (API.BASE_URL + API.API_RANDOMIZER + API.API_GET_BY_USER_ID + userId + API.API_PAGINATION
            + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT)
        if (isForSort) {
            this.setLoading(true)
            url += '?sort=true'
        }
        if (isForRandomizer) {
            this.setLoading(true)
            url += '?randomize=true'
        }
        
        var body = {}
        if (this.state.selectedClassId != '') {
            body = {
                "class": this.state.selectedClassId
            }
        }

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'POST',
            headers: {},
            body: JSON.stringify(body),

        }).then((responseJson) => {
            
            if (responseJson.success) {

                var newArray = this.state.listData;
                
                var studentListData = []
                var data = responseJson.data

                var groupData = data.studentsData
                if (groupData.length > 0) {
                    
                    var groupIndex = 0
                   
                    for (groupIndex; groupIndex < groupData.length; groupIndex++) {
                        var studentList = groupData[groupIndex];
                        var studentIndex = 0;
                        var _emailList = [];
                        for (studentIndex; studentIndex < studentList.length; studentIndex++) {
                            var student = studentList[studentIndex];
                            var markType = 0;
                            if (student.mark) {
                                markType = student.mark.mark;
                            }
                            var _student = {
                                studentId: student._id,
                                name: student.displayName,
                                markType: markType
                            };
                            if (markType != 0) {
                                this.state.selectedItemsNeedToAttachMarks.push({
                                    studentId: student._id,
                                    markType: markType
                                });
                            }
                            _emailList.push(_student);
                        }
                        if (_emailList.length > 0) {
                            var studentObject = {
                                data: _emailList,
                                displayName: studentIndex != -1 ? 'Group ' + this.getGroupNumber(groupIndex) : '',
                            };
                            studentListData.push(studentObject);
                        }
                    }
                    var sizeOrNumberValue = this.getAndSetAccordingToSizeAndNumber(data);
                    let { classGroupSize, classGroupNumber } = this._getClassItemAndSetClassGroupSizeAndNumber(data);

                    this.setState({
                        totalStudents: data.count,
                        pageCount: data.pageCount,
                        page: this.state.page + 1,
                        listData: studentListData,
                        sizeOrNumberValue: sizeOrNumberValue,
                        sizeValue: this.state.selectedClassId == '' ? data.settingsData.allGroup.size : classGroupSize,
                        numberValue: this.state.selectedClassId == '' ? data.settingsData.allGroup.number : classGroupNumber,

                    })
                    
                    this.props.navigation.setParams({ studentCount: responseJson.data.count })
                }

                this.setState({
                    settingsData: data.settingsData,
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false,

                })
                
                this.setLoading(false)
                

            } else {
                this.setLoading(false)
                this.setState({ isAsyncLoader: false, isFetchingFromServer: false })
                this._showToastMessage(responseJson.message)
            }
        }).catch((error) => {
            this.setLoading(false)
            this.setState({
                isAsyncLoader: false,
                isFetchingFromServer: false,
                isLoadingMore: false
            })
            console.error(error);
        });
    }

    _getClassItemAndSetClassGroupSizeAndNumber(data) {
        let itemClassGroup = {};
        let classGroups = data.settingsData.classGroups;
        if (classGroups.length > 0) {
            let index = classGroups.findIndex(item => item.classId == this.state.selectedClassId);
            if (index > -1) {
                itemClassGroup = classGroups[index];
            }
        }
        let classGroupSize = 1;
        let classGroupNumber = 1;
        if (itemClassGroup.classId != undefined) {
            classGroupSize = itemClassGroup.size;
            classGroupNumber = itemClassGroup.number;
        }
        return { classGroupSize, classGroupNumber };
    }

    getAndSetAccordingToSizeAndNumber(data) {
        var sizeOrNumberValue = '0';
        if (this.state.selectedClassId == '') { // all groups
            if (this.state.selectedIndex == 0) {
                sizeOrNumberValue = data.settingsData.allGroup.size;
            }
            else {
                sizeOrNumberValue = data.settingsData.allGroup.number;
            }
        }
        else { // all classes
            let classGroups = data.settingsData.classGroups;
            if (classGroups.length > 0) {
                let index = classGroups.findIndex(item => item.classId == this.state.selectedClassId);
                if (index > -1) {
                    let classGroup = classGroups[index];
                    sizeOrNumberValue = this.setSizeOrNumberValue(sizeOrNumberValue, classGroup.size, classGroup.number);
                }
                else {
                    sizeOrNumberValue = this.setSizeOrNumberValue(sizeOrNumberValue);
                }
            }
            else {
                sizeOrNumberValue = this.setSizeOrNumberValue(sizeOrNumberValue);
            }
        }
        return sizeOrNumberValue;
    }

    setSizeOrNumberValue(sizeOrNumberValue, size = 1, number = 1) {
        if (this.state.selectedIndex == 0) {
            sizeOrNumberValue = size;
        }
        else {
            sizeOrNumberValue = number;
        }
        return sizeOrNumberValue;
    }

    _setResponseData(groupIndex, groupData, studentListData, data) {
        for (groupIndex; groupIndex < groupData.length; groupIndex++) {
            var studentList = groupData[groupIndex];
            var studentIndex = 0;
            var _emailList = [];
            for (studentIndex; studentIndex < studentList.length; studentIndex++) {
                var student = studentList[studentIndex];
                var markType = 0;
                if (student.mark) {
                    markType = student.mark.mark;
                }
                var _student = {
                    studentId: student._id,
                    name: student.displayName,
                    markType: markType
                };
                if (markType != 0) {
                    this.state.selectedItemsNeedToAttachMarks.push({
                        studentId: student._id,
                        markType: markType
                    });
                }
                _emailList.push(_student);
            }
            if (_emailList.length > 0) {
                var studentObject = {
                    data: _emailList,
                    displayName: studentIndex != -1 ? 'Group ' + this.getGroupNumber(groupIndex) : '',
                };
                studentListData.push(studentObject);
            }
        }
        var sizeOrNumberValue = '0';
        if (this.state.selectedClassId == '') { // all groups
            if (this.state.selectedIndex == 0) {
                sizeOrNumberValue = data.settingsData.allGroup.size;
            }
            else {
                sizeOrNumberValue = data.settingsData.allGroup.number;
            }
        }
        else { // all classes
            if (this.state.selectedIndex == 0) {
                sizeOrNumberValue = data.settingsData.classGroup.size;
            }
            else {
                sizeOrNumberValue = data.settingsData.classGroup.number;
            }
        }
        return { sizeOrNumberValue, groupIndex, studentListData };
    }

    getGroupNumber(groupIndex) {
        return (groupIndex + 1);
    }

    _getRandomizerStudentDataWithNewChange = (isFromLoadingMore = false) => {
        ////console.log("UserId" + this.state.userId)
        if (isFromLoadingMore) {
            this._getRandomizerData(isFromLoadingMore);
        } else {
            this.setState({
                page: 1
            }, function () {
                // this.setFlagForSearching()
                this.setLoading(true)
                this._getRandomizerData();
            })
        }


    }

    _getRandomizerData(isFromLoadingMore = false, isRandomize = undefined, isForSort = undefined) {
        
        var userId = TeacherAssitantManager.getInstance().getUserID();
        var body = {};
        var allGroup = {};
        var classGroup = {};
        let { settingsData } = this.state
        if (this.state.selectedClassId != '') {
            if (settingsData.allGroup == undefined) {
                this.setLoading(false)
                return
            }
            allGroup = {
                size: this.state.settingsData.allGroup.size,
                number: this.state.settingsData.allGroup.number
            };
            if (this.state.selectedIndex == 0) { //size    

                let classGroups = settingsData.classGroups;
                if (classGroups.length > 0) {
                    let index = classGroups.findIndex(item => item.classId == this.state.selectedClassId);
                    if (index > -1) {
                        let classItem = classGroups[index];
                        classGroup = {
                            size: this.state.sizeValue,
                            number: classItem.number
                        };
                    }
                    else {
                        classGroup = {
                            size: this.state.sizeValue,
                            number: this.state.numberValue
                        };
                    }
                }
                else {
                    classGroup = {
                        size: this.state.sizeValue,
                        number: this.state.numberValue
                    };
                }

                 body = {
                    class: this.state.selectedClassId,
                    settings: {
                        allGroup: allGroup,
                        classGroup: classGroup
                    }
                };
            }
            else { //number
                if (settingsData.classGroup == undefined) {
                    this.setLoading(false)
                    return
                }
                let classGroupsList = settingsData.classGroups;
                if (classGroupsList.length > 0) {
                    let classGroupItemindex = classGroupsList.findIndex(item => item.classId == this.state.selectedClassId);
                    if (classGroupItemindex > -1) {
                        let _classItem = classGroupsList[classGroupItemindex];
                        classGroup = {
                            size: _classItem.size,
                            number: this.state.numberValue
                        };
                    }
                    else {
                        classGroup = {
                            size: this.state.sizeValue,
                            number: this.state.numberValue
                        };
                    }
                }
                else {
                    classGroup = {
                        size: this.state.sizeValue,
                        number: this.state.numberValue
                    };
                }


                body = {
                    class: this.state.selectedClassId,
                    number: true,
                    settings: {
                        allGroup: allGroup,
                        classGroup: classGroup
                    }
                };
            }
        }
        else {

            if (settingsData.classGroup == undefined) {
                this.setLoading(false)
                return
            }
            classGroup = {
                size: settingsData.classGroup.size,
                number: settingsData.classGroup.number
            };
            if (this.state.selectedIndex == 0) { //size                
                allGroup = {
                    size: this.state.sizeValue,
                    number: this.state.settingsData.allGroup.number
                };
                body = {
                    settings: {
                        allGroup: allGroup,
                        classGroup: classGroup
                    }
                };
            }
            else { //number
                if (settingsData.allGroup == undefined) {
                    this.setLoading(false)
                    return
                }
                allGroup = {
                    size: this.state.settingsData.allGroup.size,
                    number: this.state.numberValue
                };
                body = {
                    number: true,
                    settings: {
                        allGroup: allGroup,
                        classGroup: classGroup
                    }
                };
            }
        }
        var url = (API.BASE_URL + API.API_RANDOMIZER + API.API_GET_BY_USER_ID + userId + API.API_PAGINATION
            + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT);
        this.setLoading(true)

        if (isRandomize) url += '?randomize=true';
        if (isForSort) url += '?sort=true'

      TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'POST',
            headers: { },
            body: JSON.stringify(body),
        }).then((responseJson) => {
            if (responseJson.success) {
                var newArray = !isFromLoadingMore ? [] : this.state.listData;

                var studentListData = [];
                var data = responseJson.data;
                var groupData = data.studentsData;

                //by default group
                var groupIndex = 0;
                for (groupIndex; groupIndex < groupData.length; groupIndex++) {
                    var studentList = groupData[groupIndex];
                    var studentIndex = 0;
                    var _emailList = [];
                    for (studentIndex; studentIndex < studentList.length; studentIndex++) {
                        var student = studentList[studentIndex];
                        var markType = 0;
                        if (student.mark) {
                            markType = student.mark.mark;
                        }
                        var _student = {
                            studentId: student._id,
                            name: student.displayName,
                            markType: markType
                        };
                        if (markType != 0) {
                            this.state.selectedItemsNeedToAttachMarks.push({
                                studentId: student._id,
                                markType: markType
                            });
                        }
                        _emailList.push(_student);
                    }
                    if (_emailList.length > 0) {
                        var studentObject = {
                            data: _emailList,
                            displayName: studentIndex != -1 ? 'Group ' + (!isFromLoadingMore ? this.getGroupNumber(groupIndex) : newArray.length + this.getGroupNumber(groupIndex)) : '',
                        };
                        studentListData.push(studentObject);
                    }
                }
                
                var sizeOrNumberValue = this.getAndSetAccordingToSizeAndNumber(data);
                let { classGroupSize, classGroupNumber } = this._getClassItemAndSetClassGroupSizeAndNumber(data);
                this.setState({
                    loading: false,
                    totalStudents: data.count,
                    pageCount: data.pageCount,
                    page: this.state.page + 1,
                    listData: isFromLoadingMore ? [...newArray, ...studentListData] : studentListData,
                    isAsyncLoader: false,
                    isFetchingFromServer: false,
                    isLoadingMore: false,
                    settingsData: data.settingsData,
                    sizeOrNumberValue: sizeOrNumberValue,
                    sizeValue: this.state.selectedClassId == '' ? data.settingsData.allGroup.size : classGroupSize,
                    numberValue: this.state.selectedClassId == '' ? data.settingsData.allGroup.number : classGroupNumber,
                });
                
                this.props.navigation.setParams({ studentCount: responseJson.data.count });
            }
            else {
                this.setState({
                    loading: false,
                });
                this.setState({ isAsyncLoader: false, isFetchingFromServer: false });
                this._showToastMessage(responseJson.message);
            }
        }).catch((error) => {
            this.setState({
                loading: false,
            });
            console.error(error);
        });
    }


    _refreshScreen = () => {
        this.setState({
            offset: 0,
            totalStudents: 0,
            loading: false,
            isAsyncLoader: true,

            isLoadingMore: false,
            listData: [],
            isLoaderShown: true,
            page: 1,
            pageCount: 0,

            isFetchingFromServer: false,
            settingsData: {},

            //randomizer variables
            segmentControlTabList: ['Size', 'Number'],
            selectedItemsNeedToAttachMarks: []
        }, function () {
            this._getInitialRandomizerStudentData()
        })
    }


    // event listener for socket
    _addEventListener = () => {
        this.addStudentListener = EventRegister.addEventListener(SocketConstant.ADD_STUDENT, (data) => {
            this._refreshScreen()
        })

        this.removeStudentListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_BULK_STUDNET, (data) => {
             this._refreshScreen()
        })

        this.updateStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT, (data) => {
            this._refreshScreen()
        })


        //setting function
        this.updateStudentMark = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT_MARK, (data) => {
            this._refreshScreen()
        })

        this.onSettingsDeleteAllForOwn = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
            this._onSettingsDeleteAll(data);

        })


    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addStudentListener)
        EventRegister.removeEventListener(this.removeStudentListener)
        EventRegister.removeEventListener(this.updateStudentListener)
        EventRegister.removeEventListener(this.deleteStudentClassBulkListener)
        EventRegister.removeEventListener(this.addStudentClassBulkListener)
        EventRegister.removeEventListener(this.onUpdateStudentMark)
        EventRegister.removeEventListener(this.onSettingsDeleteAllForOwn)



    }

    //add data to student
    _addDataToStudent = (student) => {

        if (this.state.listData.length > 0) {
            var index = this.state.listData.findIndex((sectionData) => sectionData.studentId == student._id)
            if (index == -1) {
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









    _onSettingsDeleteAll(data) {
        if (data.clearData) {
            this._refreshScreen();
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

    //_updateUserSetting
    _updateUserSetting = (settingData) => {

        if (settingData.studentSortOrder != undefined || settingData.studentDisplayOrder != undefined) {
            this.setState({
                page: 1,
                listData: [],
                studentIds: [],
                isAsyncLoader: true
            }, function () {

                //this.getStudentData()
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
    bottomText: {
        fontSize: 18,
    },
    upperBottomSectionTextFont: {
        fontSize: 18,
    },
    blackColor: {
        color: '#000000'
    },
    blueColor: {
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
        margin: 7,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        fontSize: 15,
        color: 'gray'
    },
    boldText: {
        color: '#000000',
        fontSize: 18,
        marginRight: 10,
    },

    positionAbsoluteWithEnd: {
        position: 'absolute', end: 10
    },
    textPositionAbsoluteWithEnd: {
        position: 'absolute', end: 35
    },
    touchableOpacityItemViewContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    textAlignLeft: { textAlign: 'left' },
});
