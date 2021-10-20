import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView, ToastAndroid, Alert,
    TouchableOpacity, Platform, SafeAreaView, Image
} from 'react-native';
import AsyncStorage from "@react-native-community/async-storage";
import API from '../constants/ApiConstant'
import StorageConstant from '../constants/StorageConstant'
import { StackActions, NavigationActions } from 'react-navigation';
import { EventRegister } from 'react-native-event-listeners'
import SocketManger from '../Singletons/SocketManager';
import InternetManger from '../Singletons/InternetManger';
import SocketConstant from '../constants/SocketConstant';
import Terminology from '../constants/Terminology';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import ComingFrom from '../constants/ComingFrom'
import ActionSheet from 'react-native-actionsheet'
import AppConstant from '../constants/AppConstant'
import ScreenLockModal from '../Modal/ScreenLockModal'
import AppStateManger from "../Singletons/AppStateManager";
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import Toast, { DURATION } from 'react-native-easy-toast'

export default class HomeScreen extends React.PureComponent {

    constructor(props) {
        super(props)
        var stateParam = this.props.navigation.state.params
        var screenLock = stateParam.screenLock
        this.state = {
            studentCount: 0,
            sharedStudentsCount: 0,
            classCount: 0,
            userId: '',
            email: '',
            screenLock: screenLock,
            isShowScreenLockModal: screenLock.length == 4 ? true : false,
            isForceUpdate: false,
            subscription: undefined
        }

    }



    async componentDidMount() {
        // Obj= new SocketManger()
        SocketManger.sharedInstance()._connectSocket();
        InternetManger.sharedInstance()._initializeInternetInfo();
        AppStateManger.sharedInstance()._initializeAppState()

        let value = await TeacherAssitantManager.getInstance().getDataFromAsyncStorage(StorageConstant.STORE_EMAIL)

        this.setState({
            email: value
        }, async () => {

        })


        // let TeacherAssitantManagerInstance = this.getUserId();
        this._addEventListener();
        this.getStudentAndClassCount();
        await TeacherAssitantManager.getInstance().getUserSubscriptionData()
        await this.getUserSubscriptionsDataToLocalDb();

        // TeacherAssitantManager.getInstance().getDataFromAsyncStorage(StorageConstant.STORE_EMAIL).then((value) => {
        //     console.log("1.get value email")
        //     this.setState({
        //         email: value
        //     }, async () => {
        //         this.getStudentAndClassCount();
        //         await TeacherAssitantManager.getInstance().getUserSubscriptionData()
        //     })
        // })
        // setTimeout( async() => {
        // this.getStudentAndClassCount();
        // await TeacherAssitantManager.getInstance().getUserSubscriptionData()
        // }, 230);

        // this.getUserId();
        // this._addEventListener();
        // this.refreshScreen()




        // this._sub = this.props.navigation.addListener(
        //     'didFocus',
        //     this.refreshScreen
        // );

    }


    _addEventListener = () => {

        this.studentCount = EventRegister.addEventListener(SocketConstant.ON_COUNT_USER_STUDENT, (data) => {
            //console.log(data);
            this.setState({
                studentCount: data.studentCount,
            });
        })

        this.classCount = EventRegister.addEventListener(SocketConstant.ON_COUNT_USER_CLASS, (data) => {
            this.setState({
                classCount: data.classCount
            });
        })

        this.sharedStudentCount = EventRegister.addEventListener(SocketConstant.ON_COUNT_USER_SHARED_STUDENT, (data) => {
            //console.log(data);
            this.setState({
                sharedStudentsCount: data.sharedStudentsCount,
            });
        })

        // this.onSettingsResetToDefault = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
        //     //console.log('onSettingsResetToDefault');
        //     //if (data.) {
        //     this.getUserId()
        //     // }


        // })



        this.handleAppStateChange = EventRegister.addEventListener('handleAppStateChange', (isAppActive) => {
            //console.log(isAppActive);
            if (isAppActive) {
                TeacherAssitantManager.getInstance().getDataFromAsyncStorage(AppConstant.USER_SCREEN_LOCK).then((screenLock) => {
                    if (screenLock == null) {
                        screenLock = ''
                    }
                    this.setState({
                        isShowScreenLockModal: screenLock.length == 4 ? true : false,
                        screenLock: screenLock
                    })
                })
            }
        })




    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.studentCount)
        EventRegister.removeEventListener(this.classCount)
        EventRegister.removeEventListener(this.sharedStudentCount)
    }
    _onClick = (value) => {
        // this._removeEventListener();
        switch (value) {
            case AppConstant.STUDENTS:
                this.props.navigation.navigate("StudentScreen", {
                    studentCount: this.state.studentCount,
                    userId: this.state.userId,
                    onGoBack: () => this.refresh(),
                    comingFrom: ComingFrom.HOME_SCREEN,
                    leftHeader: BreadCrumbConstant.HOME,
                    createdBy: TeacherAssitantManager.getInstance().getUserID()
                })
                break;
            case AppConstant.SHARED_STUDENTS:
                this.props.navigation.navigate("StudentScreen", {
                    // this.props.navigation.navigate("Demo", {
                    studentCount: this.state.sharedStudentsCount,
                    userId: this.state.userId,
                    onGoBack: () => this.refresh(),
                    comingFrom: ComingFrom.HOME_SHARED_STUDENT,
                    leftHeader: BreadCrumbConstant.HOME
                })
                break;

            case AppConstant.CLASS:
                this.props.navigation.navigate("ClassScreen",
                    {
                        classCount: this.state.classCount, userId: this.state.userId,
                        onGoBack: () => this.refresh(), comingFrom: ComingFrom.HOME_SCREEN,
                        leftHeader: BreadCrumbConstant.HOME
                    })
                break;

            case AppConstant.RANDOMIZER:


                this.props.navigation.navigate("AddActionsToManyScreen", {
                    onGoBack: this.refresh, screen: TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_RANDOMIZER, 0),
                    selectedActionList: [], comingFrom: ComingFrom.HOME_RANDOMIZER,
                    leftHeader: BreadCrumbConstant.HOME
                })
                break;

            case AppConstant.ADD_ACTIONS_TO_MANY:
                this.props.navigation.navigate("StudentActionFields",
                    {
                        screen: "Add ", onGoBack: this.refresh, headerRight: TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, 0), studentId: '',
                        createdBy: TeacherAssitantManager.getInstance().getUserID(), comingFrom: ComingFrom.HOME_SCREEN,
                        leftHeader: BreadCrumbConstant.CANCEL
                    })

                // this.props.navigation.navigate("StudentActionFields",
                //     {
                //         screen: "Add ", onGoBack: this.refresh, headerRight: 'Students', studentId: '',
                //         createdBy: TeacherAssitantManager.getInstance().getUserID(), comingFrom: ComingFrom.HOME_SCREEN,
                //         leftHeader: BreadCrumbConstant.CANCEL
                //     })
                break;
            case AppConstant.EMAIL_BLAST:
                this.props.navigation.navigate("AddActionsToManyScreen", {
                    onGoBack: this.refresh, screen: "Email Blast",
                    selectedActionList: [], comingFrom: ComingFrom.HOME_EMAIL_BLAST,
                    leftHeader: BreadCrumbConstant.HOME
                })
                break;

            case AppConstant.SETTING:
                // this._removeEventListener()
                this.props.navigation.navigate("Settings", {
                    onGoBack: () => this.refresh(),
                    userId: this.state.userId,
                    leftHeader: BreadCrumbConstant.HOME
                })
                break;

            case AppConstant.LOGOUT:
                this.ActionSheet.show();
                break;

            case AppConstant.FAQ_AND_VIDEO_HELP:
                alert("Updates coming soon")
                // this.props.navigation.navigate("FAQsAndVideoHelp", { onGoBack: () => this.refresh(), leftHeader: BreadCrumbConstant.HOME })
                break;
        }
    }


    static navigationOptions = ({ navigation }) => {
        return {
            title: `${navigation.state.params.screen}`,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerLeft: () => null,
            headerStyle: StyleTeacherApp.headerStyle,
            gestureEnabled: false,
        }
    };

    getStudentAndClassCount = async () => {
        let userId = await TeacherAssitantManager.getInstance().getUserID()
        var url = API.BASE_URL + API.API_STUDENT_CLASS_COUNT + userId;
        //console.log("url", url)

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {
                // 'Content-Type': 'application/x-www-form-urlencoded',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId,
            }
        })
            .then((responseJson) => {
                //console.log("response==" + responseJson.data)

                if (responseJson.success) {
                    var responseJsonData = responseJson.data
                    this.setState({
                        studentCount: responseJsonData.studentsCount,
                        classCount: responseJsonData.classesCount,
                        sharedStudentsCount: responseJsonData.sharedStudentsCount
                    });
                } else {
                    // this._showToastMessage(responseJson.message)
                    // this.showAlert(responseJson.message)
                }

            })
            .catch(error => {
                //console.log("error== " + error)

            })
    }



    //it will help to set edit is on off
    _handleActionSheetIndex = (index) => {

        // this.ActionSheet.show();

        switch (index) {
            case 0: //Yes
                TeacherAssitantManager.userId = null;
                AsyncStorage.removeItem(StorageConstant.STORE_USER_ID).then((value) => {
                    this.setState({
                        userId: ''
                    })
                    AsyncStorage.removeItem(StorageConstant.STORE_EMAIL).then((value) => {
                        this.setState({
                            email: ''
                        })
                        AsyncStorage.removeItem(StorageConstant.STORE_INTIAL_DATA_STATUS).then((value) => {
                            const resetAction = StackActions.reset({
                                key: null,
                                index: 0,
                                actions: [
                                    NavigationActions.navigate({ routeName: 'LoginScreen' })
                                ],
                            });
                            this.props.navigation.dispatch(resetAction);
                        }).done();

                    }).done();

                }).done();
                break;
        }

    }



    refresh = () => {
        this.setState({ isForceUpdate: true }, async () => {
            this._addEventListener();
            this.getStudentAndClassCount()
            await this.getUserSubscriptionsDataToLocalDb();
            this.setState({ isForceUpdate: false })
        })

    }

    //getUserSubscriptionsDataToLocalDb
    async getUserSubscriptionsDataToLocalDb() {
        let subscription = await TeacherAssitantManager.getInstance().getUserSubscriptionsDataToLocalDb();
        if (subscription) {
            this.setState({
                subscription
            });
        }
    }

    getUserId() {
        let TeacherAssitantManagerInstance = TeacherAssitantManager.getInstance();
        if (this.props.navigation.state.params.isfromIntializationDataScreen) {
            // this.setState({
            //     userId: TeacherAssitantManager.getInstance().getUserID()
            // },function () {
            //     this.getStudentAndClassCount()
            // })
            this._setUserIdAndGetgetStudentAndClassCount(TeacherAssitantManagerInstance.getUserID());
        }
        else {
            if (this.props.navigation.state.params.comingFrom == ComingFrom.LOGIN_SCREEN) {
                TeacherAssitantManagerInstance.getUserID().then((value) => {
                    this._setUserIdAndGetgetStudentAndClassCount(value);
                });
            }
            else {
                //var usertId = TeacherAssitantManager.getInstance().getUserID()
                this._setUserIdAndGetgetStudentAndClassCount(TeacherAssitantManagerInstance.getUserID());
            }
        }
        return TeacherAssitantManagerInstance;
    }

    _setUserIdAndGetgetStudentAndClassCount(usertId) {
        this.setState({
            userId: usertId
        }, function () {
            this.getStudentAndClassCount();
        });
    }

    forceUpdate() {
        this.getStudentAndClassCount
    }



    _callBack = (isTrue) => {
        this.setState({
            isShowScreenLockModal: !isTrue
        })
    }

    _setTerminology() {
        let lblstudent = AppConstant.CT_STUDENT;
        lblstudent = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, this.state.studentCount)

        let lblSharedStudent = AppConstant.CT_STUDENT;
        lblSharedStudent = AppConstant.CT_SHARED + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, this.state.sharedStudentsCount)

        let lblClass = AppConstant.CT_CLASS;
        lblClass = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_CLASS, this.state.classCount)

        let lblRandomizer = AppConstant.CT_RANDOMIZER;
        lblRandomizer = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_RANDOMIZER, 0)

        let lblAction = AppConstant.CT_ACTION;
        lblAction = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 0)

        return { lblstudent, lblSharedStudent, lblClass, lblRandomizer, lblAction };
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        const { state, navigate } = this.props.navigation;
        const { subscription } = this.state
        let { lblstudent, lblSharedStudent, lblClass, lblRandomizer, lblAction } = this._setTerminology();
        return (
            <SafeAreaView style={styles.container}>
                <Toast ref={o => this.toast = o}
                    position={'bottom'}
                    positionValue={200}
                />
                <ScreenLockModal isShowScreenLockModal={this.state.isShowScreenLockModal}
                    password={this.state.isShowScreenLockModal ? this.state.screenLock : ''}
                    callBack={(isTrue) => this._callBack(isTrue)} />
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={'Logout'}
                    options={['YES', 'NO']} //- a title to show above the action sheet
                    message={'Do you really want to logout?'} // - a message to show below the title
                    tintColor={'red'} //- the color used for non-destructive button titles
                    //cancelButtonIndex={1}
                    destructiveButtonIndex={0}
                    onPress={(index) => { this._handleActionSheetIndex(index) }}
                />
                <ScrollView>
                    <View style={styles.container}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.buttonWithTopMargin}
                                onPress={() => this._onClick(AppConstant.STUDENTS)}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>{lblstudent + AppConstant.COLLON}{this.state.studentCount}</Text>

                                    {/* <Text style={[styles.buttonText, styles.textAlignLeft]}>{this.state.studentCount <= 1 ?
                                        TeacherAssitantManager.customizeTerminology
                                        :
                                        Terminology.studentPulral}{this.state.studentCount}</Text> */}
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        </View>
                        {
                            // subscription && subscription.is_active && <View style={styles.buttonContainer}>
                            //     <TouchableOpacity
                            //         style={styles.buttonWithTopMargin}
                            //         onPress={() => this._onClick(AppConstant.SHARED_STUDENTS)}>
                            //         <View style={styles.touchableOpacityItemViewContainer}>
                            //             {/* <Text style={[styles.buttonText, styles.textAlignLeft]}>{this.state.sharedStudentCount <= 1 ?
                            //                 Terminology.sharedStudentSingular
                            //                 :
                            //                 Terminology.sharedStudentPlural}{this.state.sharedStudentsCount}</Text> */}

                            //             <Text style={[styles.buttonText, styles.textAlignLeft]}>{lblSharedStudent + AppConstant.COLLON + this.state.sharedStudentsCount}</Text>
                            //             <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                            //                 <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                            //                     source={require('../img/icon_arrow.png')}>
                            //                 </Image>
                            //             </View>
                            //         </View>

                            //     </TouchableOpacity>
                            // </View>
                        }


                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.buttonWithTopMargin}
                                onPress={() => this._onClick(AppConstant.CLASS)}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    {/* <Text style={[styles.buttonText, styles.textAlignLeft]}>{this.state.classCount <= 1 ?
                                        Terminology.classSingluar :
                                        Terminology.classPulral}{this.state.classCount}</Text> */}

                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>{lblClass + AppConstant.COLLON + this.state.classCount}</Text>


                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.buttonWithTopMargin}
                                onPress={() => this._onClick(AppConstant.RANDOMIZER)}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>{lblRandomizer}</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            {subscription && subscription.is_active && <TouchableOpacity
                                style={styles.buttonWithTopMargin}
                                onPress={() => this._onClick(AppConstant.ADD_ACTIONS_TO_MANY)}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>Add {lblAction} to Many</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>

                            </TouchableOpacity>}
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.buttonWithTopMargin}
                                onPress={() => this._onClick(AppConstant.EMAIL_BLAST)}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>Email Blast</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.buttonWithTopMargin}
                                onPress={() => this._onClick(AppConstant.SETTING)}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>Settings</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.buttonWithTopMargin}
                                onPress={() => this._onClick(AppConstant.LOGOUT)}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>Logout</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.buttonWithTopMargin}
                                onPress={() => this._onClick(AppConstant.FAQ_AND_VIDEO_HELP)}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>FAQ's and Video Help</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                        <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                            source={require('../img/icon_arrow.png')}>
                                        </Image>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        </View>
                        <Text style={styles.loginRowText}>
                            {'Logged in as: ' + this.state.email}
                        </Text>
                        <Text style={styles.loginRowTextWithoutTopMargin}>
                            {'Version: ' + TeacherAssitantManager.getInstance().getBuildVersion()}
                        </Text>


                    </View>
                </ScrollView>
            </SafeAreaView>

        );
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
        elevation: 3
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        marginLeft: 10
    },
    rowText: {
        justifyContent: 'center',
        alignItems: 'center',
        color: 'black',
        fontSize: 18,
        marginLeft: 10,
        marginTop: 10
    },

    loginRowText: {
        justifyContent: 'center',
        alignItems: 'center',
        color: 'black',
        fontSize: 15,
        marginLeft: 10,
        marginTop: 20
    },
    loginRowTextWithoutTopMargin: {
        justifyContent: 'center',
        alignItems: 'center',
        color: 'black',
        fontSize: 15,
        marginLeft: 10,
        marginTop: 10
    },
    textAlignLeft: { textAlign: 'left' },
    positionAbsoluteWithEnd: {
        position: 'absolute', end: 10
    },
    touchableOpacityItemViewContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonWithTopMargin: {
        height: 50,
        flex: 1,
        marginTop: 15,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
    },
    imageNextContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20
    },
    imageView: {
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16
    },
});