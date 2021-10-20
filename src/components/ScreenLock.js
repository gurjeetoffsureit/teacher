
import React from "react";
import {
    TouchableOpacity, Image, Platform, StyleSheet, Text, View, FlatList, TextInput, KeyboardAvoidingView,
    SafeAreaView, Switch, Alert
} from 'react-native'
import API from '../constants/ApiConstant'

import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import AppConstant from "../constants/AppConstant";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'
import OtpInputs from 'react-native-otp-inputs'

export default class ScreenLock extends React.PureComponent {
    constructor(props) {
        super(props)

        var previousScreenData = this.props.navigation.state.params
        this.state = {
            settingId: previousScreenData.settingId,
            password: '',
            confirmPassword: '',
            lblPassword: TextMessage.ENTER_PINCODE,
            isFromSplashSCreen: previousScreenData.isFromSplashSCreen,
            settingScreenLock: previousScreenData.settingScreenLock,
            otp1Code: '',
            otp2Code: '',
            otp3Code: '',
            otp4Code: '',
            screenLock: previousScreenData.screenLock


        }
    }


    componentDidMount() {
        this.props.navigation.setParams({
            gotoBack: this.moveToPreviousScreen
        })


    }

    //define header (navigation Bar)
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state

        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,
            title: 'Screen Lock',
            headerLeft: ()=>!params.isFromSplashSCreen ?
                <TouchableOpacity onPress={() => params.gotoBack()}>{
                    <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
                        {/* <Image
          style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
          source={Platform.OS === "android" ? require("../img/back_arrow_android.png") : require("../img/back_arrow_ios.png")} /> */}
                        <Image
                            style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
                            source={require("../img/back_arrow_ios.png")} />
                        <Text style={[StyleTeacherApp.headerLeftButtonText]}>{params.leftHeader}</Text>
                    </View>
                }
                </TouchableOpacity> : null
            ,
            headerRight:  () =>
                <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
                </View>

        }
    }

    moveToPreviousScreen = (code = this.state.screenLock) => {

        //this._removeEventListener()
        // if (code == "") {
        //     this.props.navigation.state.params.onGoBack();
        // } else {
        this.props.navigation.state.params.onGoBack(code);
        //}

        this.props.navigation.goBack();
    }




    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    _otpInputsHandleChange = (code, isFromConfrimOtp = false) => {
        if (isFromConfrimOtp) {
            this.setState({
                otp2Code: code
            }, function () {
                if (this.state.otp1Code == code) {
                    var body = {
                        screenLock: code
                    }
                    TeacherAssitantManager.getInstance()._updateUserSetting(body, this.state.settingId).then((responseJson) => {
                        //console.log("response", JSON.stringify(responseJson));
                        if (responseJson.success) {
                            //this.setLoading(false);
                            this.moveToPreviousScreen(code);
                        }
                        else {
                            this.setLoading(false);
                            this._showToastMessage(responseJson.message);
                        }
                    }).catch((error) => {
                        //this.setLoading(false);
                        console.error(error);
                    });
                } else {
                    if (this.state.otp2Code.length == 4) {
                        this._showToastMessage(TextMessage.PASSWORD_DOES_NOT_MATCH_PLEASE_REENTER_PASSWORD);
                    }

                }
            })




        } else {
            this.setState({
                otp1Code: code
            })
        }

    }


    //render the whle ui
    render() {

        //console.log('is true : ', this.state.otp1Code.length == 4)
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <View style={[styles.sectionViewContainer, { marginTop: 10 }]}>
                        <Text style={[styles.sectionTitle, styles.textAlignCenter]}>Password</Text>
                    </View>
                    <View style={{ justifyContent: 'center', flex: 0.1, marginBottom: 10 }}>
                        <OtpInputs handleChange={code => this._otpInputsHandleChange(code)}
                            numberOfInputs={4}
                            autoCapitalize={'none'}
                            clearTextOnFocus={false}
                            focusedBorderColor={'black'}
                            inputTextErrorColor={'#ff0000'}
                            keyboardType={'phone-pad'}
                            unFocusedBorderColor={'#C8C8C8'}
                        />
                    </View>
                    <View style={[styles.sectionViewContainer, { marginTop: Platform.OS === 'android' ? 40 : 40 }]}>
                        <Text style={[styles.sectionTitle, styles.textAlignCenter,]}>Confirm Password</Text>
                    </View>
                    <View style={{ justifyContent: 'center', flex: 0.1, marginBottom: 10 }}>
                        <OtpInputs handleChange={code => this._otpInputsHandleChange(code, true)}
                            numberOfInputs={4}
                            autoCapitalize={'none'}
                            clearTextOnFocus={false}
                            focusedBorderColor={'black'}
                            inputTextErrorColor={'#ff0000'}
                            keyboardType={'phone-pad'}
                            unFocusedBorderColor={'#C8C8C8'}
                        />
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
        backgroundColor: 'white'

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
    rowTextContainter: {
        flex: 0.8,
        flexDirection: 'row'
    },
    editRowTextContainter: {
        flex: 0.7,
        flexDirection: 'row'
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


    bottomViewSeprator:
        { flex: 0.002, backgroundColor: 'gray' },

    iconImageContainer: {
        flex: 0.2, justifyContent: 'center',
        alignItems: 'center',
    },

    iconImageContainerForEditMode: {
        flex: 0.2, justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        height: 16,
        width: 16,

    },
    infoIconImageContainer: {
        // fontSize: 15,
        marginLeft: 15,
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center",
    },
    //arrowIconImageContainer: { justifyContent: 'center', alignItems: "center", flex: 0.2 },
    rowItemActionPickerText: { flex: 1, justifyContent: 'center', marginTop: 1.5, marginBottom: 0.5 },

    rowItemDateText: { justifyContent: 'center', marginTop: 0.5 },
    //this is for ScreenLock
    positionAbsoluteWithEnd: {
        position: 'absolute', end: 10
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        marginLeft: 10,
    },
    textAlignCenter: { textAlign: "center" },
    sectionTitle: { fontSize: 16, color: 'black' },
    sectionViewContainer: { alignItems: 'flex-start', justifyContent: 'center', height: 40, marginLeft: 10 },
    input: {
        margin: 10,
        height: 40,
        width: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingStart: 8,
        paddingEnd: 8,

    },
});