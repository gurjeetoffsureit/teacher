import React from "react";

import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity, Platform, ToastAndroid,SafeAreaView
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { Keyboard } from 'react-native';
import StorageConstant from '../constants/StorageConstant'
import API from '../constants/ApiConstant';
import AppConstant from '../constants/AppConstant';
import ComingFrom from '../constants/ComingFrom';
import Loader from '../ActivityIndicator/Loader';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import Toast, { DURATION } from 'react-native-easy-toast';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import { Content } from 'native-base'

export default class LoginScreen extends React.PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            loading: false
        }
    }



    static navigationOptions = ({ navigation }) => {
        return {
            //title: `${navigation.state.params.screen}`,
            title: AppConstant.APP_NAME,
            headerLeft: ()=>null,
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,


        }
    };


    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    handleEmail = (text) => {
        this.setState = {
            email: text
        }
    }

    handlePassword = (text) => {
        this.setState = {
            password: text
        }
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    login = () => {
        Keyboard.dismiss;

        //console.log('press login button');
        if (this.state.email.trim() == '' || this.state.password.trim() == '') {
            this._showToastMessage("Please fill all the details")

            // this.showAlert("Please fill all the details")
        } else if (!this.validateEmail(this.state.email.trim())) {
            this._showToastMessage("Email is not valid")
            // this.showAlert("Email is not valid")
        } else if (this.state.password == '') {
            this._showToastMessage("Please fill password")
            // this.showAlert("Please fill password")
        } else {
            this.setLoading(true); //show activate indicator
            //every thing is valid then we hit login api

            var url = API.BASE_URL + API.API_LOGIN


            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.state.email.trim(),
                    password: this.state.password.trim(),
                }),

            }).then((responseJson) => {
                //console.log("login data is ==" + JSON.stringify(responseJson));

                if (responseJson.success) {
                    this.setLoading(false);
                    if (responseJson.data.termology.length > 0) {
                        TeacherAssitantManager.getInstance()._saveCustomizeTerminologyToLocalDb(responseJson.data.termology)
                    }
                    this.saveDataToAsyncStorage(responseJson)


                } else {
                    this.setLoading(false);
                    this._showToastMessage(responseJson.message)

                }
            }).catch((error) => {
                this.setLoading(false);
                console.error(error);
            });

        }
    }

    gotoSingupScreen = () => {
        const { state, navigate } = this.props.navigation;

        navigate("SignUpScreen", { screen: AppConstant.APP_NAME })

        this.setState({
            email: '',
            password: ''
        })
    }

    _gotoForgetScreen = () => {
        const { state, navigate } = this.props.navigation;
        navigate("ForgetScreen", { screen: AppConstant.APP_NAME })

        this.setState({
            email: '',
            password: ''
        })
    }

    saveDataToAsyncStorage = (jsonResponse) => {
        this.saveUserId(jsonResponse.data, jsonResponse.data.email)
        this.setState({
            email: '',
            password: ''
        })
    }

    saveUserId(data, email) {

        TeacherAssitantManager.getInstance().saveDataToAsyncStorage(StorageConstant.STORE_USER_ID, data._id).then((error) => {
            if (error == null) {
                TeacherAssitantManager.getInstance().saveDataToAsyncStorage(StorageConstant.STORE_EMAIL, email).then((error) => {
                    if (error == null) {
                        if (data.isDefaultDataCreated) {
                            TeacherAssitantManager.getInstance().saveDataToAsyncStorage(StorageConstant.STORE_INTIAL_DATA_STATUS, data.isDefaultDataCreated + '').then((error) => {
                                if (error == null) {
                                    this.goToHomeScreenScreen(data._id, email);
                                }
                            })
                        } else {
                            this.props.navigation.navigate("IntializationData")
                        }

                    }
                })
            }
        })
    }





    refresh = () => {
        this.setState({
            email: '',
            password: ''
        })
    }

    goToHomeScreenScreen = (userId, email) => {
        this._textInputRef.clear()
        this._textInputRefpassword.clear()

        const { state, navigate } = this.props.navigation;
        navigate("HomeScreen", {
            screen: AppConstant.APP_NAME, userId: userId,
            email: email,
            isfromIntializationDataScreen: false,
            screenLock: '',
            comingFrom: ComingFrom.LOGIN_SCREEN,
            onGoBack: () => this.refresh()

        })
    }

    _showToastMessage(message) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            this.toast.show(message, DURATION.LENGTH_SHORT);
        }
    }

    render() {
        const { state, navigate } = this.props.navigation;
        return (
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <Loader loading={this.state.loading} />
                        <Toast ref={o => this.toast = o}
                            position={'bottom'}
                            positionValue={200}
                        />
                        <Content>
                            <View style={styles.container}>
                                <View style={styles.imageContainer}>
                                    <Image style={styles.imageView}
                                        source={require('../img/icon_pro.png')}>
                                    </Image>
                                </View>
                                <Text style={styles.textView}>
                                    Existing User
                    </Text>
                                <TextInput style={styles.input}
                                    underlineColorAndroid="transparent"
                                    placeholder="Enter Email"
                                    placeholderTextColor="black"
                                    autoCapitalize="none"
                                    value={this.state.email}
                                    ref={(r) => { this._textInputRef = r; }}
                                    onChangeText={(text) => this.setState({ email: text })}
                                    keyboardType='email-address'
                                    returnKeyType={"next"}
                                    onSubmitEditing={() => { this._textInputRefpassword.focus(); }}
                                    blurOnSubmit={false} />

                                <TextInput style={styles.input}
                                    underlineColorAndroid="transparent"
                                    placeholder="Enter Password"
                                    placeholderTextColor="black"
                                    autoCapitalize="none"
                                    secureTextEntry={true}
                                    value={this.state.password}
                                    ref={(r) => { this._textInputRefpassword = r; }}
                                    onChangeText={(text) => this.setState({ password: text })} />
                                <View style={styles.forgetTextVIew}>
                                    <TouchableOpacity style={styles.forgetTextButton}
                                        onPress={this._gotoForgetScreen} >
                                        <Text >
                                            Forgot Password?
                            </Text>
                                    </TouchableOpacity>

                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        onPress={this.login}
                                        style={styles.button}>
                                        <Text style={styles.buttonText}>Login</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.bottomContainer}
                                    onPress={this.gotoSingupScreen} >
                                    <Text>
                                        {'New User? '}
                                        <Text style={{ color: '#0E72F1', }}>
                                            Sign Up
                            </Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Content>

                    </View>
                </SafeAreaView>
            </View>

        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    imageContainer: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'center',
        //marginTop: (Platform.OS === 'ios') ? 0 : 12
        marginTop: 12
    },
    imageView: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
        width: 100,
    },
    input: {
        margin: 10,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingStart: 8,
        paddingEnd: 8
    },
    textView: {
        margin: 10,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        fontSize: 20,
        marginTop: 20
    },

    forgetTextVIew: {
        marginRight: 10,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },

    forgetTextButton: {
        padding: 10,
        fontSize: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
        borderRadius: 5,
        height: 40,
        flex: 2,
        margin: 10,
        justifyContent: 'center',
        backgroundColor: '#4799EB',
    },
    buttonText: {
        color: 'white',
        alignSelf: 'center',
        fontSize: 18
    },
    bottomContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 0,
    }
});