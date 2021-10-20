
import React from "react";
import {
    TouchableOpacity, StyleSheet, Text, View, SafeAreaView, Modal, TextInput,
    Dimensions
} from 'react-native';

import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import TextMessage from "../constants/TextMessages";
import AppConstant from "../constants/AppConstant";
import Toast, { DURATION } from 'react-native-easy-toast'

const { height, width } = Dimensions.get('window')
export default class AlertWithTextBox extends React.PureComponent {

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    constructor(props) {
        super(props)
        this.state = {
            txtFileNameValue: this.props.filename,
        }
    }

    moveToPreviousScreen = (code = "") => {

        //this._removeEventListener()
        // if (code == "") {
        //     this.props.navigation.state.params.onGoBack();
        // } else {
        this.props.navigation.state.params.onGoBack(code);
        //}

        this.props.navigation.goBack();
    }

    _onFinishCheckingCode = (code, isfromTextInputRef4CodeForReenterPassword = false) => {
        //console.log(this.props.password)
        //console.log(code)
        this.setState({
            otp1Code: '',
            otp2Code: '',
            otp3Code: '',
            otp4Code: '',
        })
        this._textInputRef1Code.clear();
        this._textInputRef2Code.clear();
        this._textInputRef3Code.clear();
        if (this.state.lblPassword == TextMessage.ENTER_PINCODE) {
            this._textInputRef4Code.clear()
        } else {
            this._textInputRef4CodeForReenterPassword.clear()
        }
        if (this.props.password == code) {

            this.props.callBack(true);
        } else {
            this.setState({
                lblPassword: TextMessage.ENTER_PINCODE_AGAIN
            })
            this._textInputRef1Code.focus()
            this._showToastMessage(TextMessage.PASSWORD_DOES_NOT_MATCH_PLEASE_REENTER_PASSWORD);
            if (isfromTextInputRef4CodeForReenterPassword) {
                this.setState({
                    lblPassword: TextMessage.ENTER_PINCODE
                })
            }

        }
    }

    _onKeyPress = (event, inputType) => {
        // if (event.nativeEvent.key == 'Backspace') {
        if (event.nativeEvent.key === 'Backspace') {
            // Return if duration between previous key press and backspace is less than 20ms
            if (Math.abs(this.lastKeyEventTimestamp - event.timeStamp) < 20) return;

            // Your code here
            switch (inputType) {
                case this._textInputRef1Code:
                    this._textInputRef1Code.focus();
                    this._textInputRef1Code.clear();
                    this.setState({
                        otp1Code: ''
                    })
                    break
                case this._textInputRef2Code:
                    this._textInputRef1Code.focus();
                    this._textInputRef1Code.clear();
                    this.setState({
                        otp1Code: ''
                    })
                    break
                case this._textInputRef3Code:
                    this._textInputRef2Code.focus();
                    this._textInputRef2Code.clear();
                    this.setState({
                        otp2Code: ''
                    })
                    break
                case this._textInputRef4Code:
                    this._textInputRef3Code.focus();
                    this._textInputRef3Code.clear();
                    this.setState({
                        otp3Code: ''
                    })
                    break
            }

        } else {
            // Record non-backspace key event time stamp
            this.lastKeyEventTimestamp = event.timeStamp;
        }
    }


    componentDidMount() {
    }

    _onPressCancel = () => {
        this.props._responseFromAlert(false, this.state.txtFileNameValue)
    }
    _onPressOk = () => {
        this.props._responseFromAlert(true, this.state.txtFileNameValue)
    }

    //render the whle ui
    render() {
        this.setState({
            filename: this.props.filename
        })
        return (
            <Modal transparent={true}
                animationType={'none'}
                visible={this.props.isshowAlertWithTextBox}
                onRequestClose={() => { //console.log('close modal') 
            }}>

                <SafeAreaView style={styles.safeAreaContainer}>
                    <View style={[styles.container]}>
                        {/* <View style={[styles.container, { marginTop: ((height / 2) - 100) }]}> */}
                        <Toast ref={o => this.toast = o}
                            position={'bottom'}
                            positionValue={200}
                        />
                        <View style={styles.appNameContainer}>
                            <Text style={[styles.sectionTitle, styles.textAlignCenter]}>{AppConstant.APP_NAME}</Text>
                        </View>
                        <View style={styles.sectionViewContainer}>
                            <Text style={[styles.sectionTitle, styles.textAlignCenter]}>{TextMessage.ARE_YOU_SURE_YOU_WANT_TO_CHANGE_THE_FILE_NAME}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <TextInput style={[styles.input, styles.textAlignCenter]}
                                underlineColorAndroid="transparent"
                                placeholder=""
                                placeholderTextColor="black"
                                autoCapitalize="sentences"
                                ref={(r) => { this._textInputRef1Code = r; }}
                                onChangeText={(text) => {
                                    if (text != '') {
                                        this.setState({ txtFileNameValue: text })
                                    }

                                }}
                                value={this.state.txtFileNameValue}
                            />

                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={this._onPressCancel}
                                style={styles.button}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={this._onPressOk}
                                style={styles.button}>
                                <Text style={styles.buttonText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 5,
        height: 40,
        flex: 2,
        margin: 10,
        justifyContent: 'center',
        backgroundColor: '#4799EB',
        alignItems: 'center'
    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    safeAreaContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: "center"
    },
    container: {
        alignSelf: "center",
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 8
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
        color: 'white',
        fontSize: 18,
        marginLeft: 10,
    },
    textAlignCenter: { textAlign: "center" },
    sectionTitle: { fontSize: 16, color: 'black' },
    sectionViewContainer: { alignItems: 'flex-start', height: 40, marginLeft: 10 },
    appNameContainer: { alignItems: 'center', justifyContent: 'center', height: 40, marginLeft: 10 },
    input: {
        margin: 10,
        height: 40,
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingStart: 8,
        paddingEnd: 8,

    },
});