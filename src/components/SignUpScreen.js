import React from "react";

import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    TextInput,
    Button, Platform, ToastAndroid, Keyboard
} from 'react-native';
import API from '../constants/ApiConstant';
import StorageConstant from '../constants/StorageConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import AppConstant from "../constants/AppConstant";
import ComingFrom from "../constants/ComingFrom";
import Toast, { DURATION } from 'react-native-easy-toast';
import StyleTeacherApp from '../styles/StyleTeacherApp'

import { Content } from 'native-base'

export default class SignUpScreen extends React.PureComponent {
    _showToastMessage(message) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        }
        else {
            this.toast.show(message, DURATION.LENGTH_SHORT);
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        }
        // Text.defaultProps.allowFontScaling = false;

    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: `${navigation.state.params.screen}`,
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,
            headerLeft: ()=>null,
        }
    };

    handleFirstName = (text) => {
        this.setState = {
            firstName: text
        }
    }

    handleLastName = (text) => {
        this.setState = {
            lastName: text
        }

    }

    handlePassword = (text) => {
        this.setState = {
            password: text
        }

    }

    handleEmail = (text) => {
        this.setState = {
            email: text
        }

    }

    signUp = () => {
        Keyboard.dismiss;

        if (this.state.firstName.trim() == '') {
            this._showToastMessage("First Name is required")
            // this.showAlert("First Name is required")
        }
        else if (this.state.lastName.trim() == '') {
            this._showToastMessage("Last Name is required")
            // this.showAlert("Last Name is required")
        }
        else if (this.state.email.trim() == '') {
            this._showToastMessage("Email is required")
            // this.showAlert("Email is required")
        }
        else if (!this.validateEmail(this.state.email)) {
            this._showToastMessage("Email is not valid")
            // this.showAlert("Email is not valid")
        }
        else if (this.state.password.trim() == '') {
            this._showToastMessage("Password is required")
        }
        else if (this.state.password.trim().length < 6) {
            this._showToastMessage("The password must be 6 characters long or more is required")
        }
        else {
            var url = API.BASE_URL + API.API_SIGNUP
            //console.log('signup url :' + url)
            // everything is valid then hit api to register User
            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: this.state.firstName,
                    lastName: this.state.lastName,
                    email: this.state.email,
                    password: this.state.password,
                }),

            }).then((responseJson) => {
                //console.log(responseJson.message);
                if (responseJson.success) {
                    this.saveDataToAsyncStorage(responseJson)
                }
                else {
                    this._showToastMessage(responseJson.message);
                }
            }).catch((error) => {
                console.error(error);
            });
        }
    }

    saveDataToAsyncStorage = (jsonResponse) => {
        this.saveUserId(jsonResponse.data._id)
        // this.alert(getUserID())
    }

    saveUserId(userID) {
        TeacherAssitantManager.getInstance().saveDataToAsyncStorage(StorageConstant.STORE_USER_ID, userID).then((error) => {
            if (error == null) {
                TeacherAssitantManager.getInstance().saveDataToAsyncStorage(StorageConstant.STORE_EMAIL, this.state.email).then((error) => {
                    if (error == null) {
                        //TeacherAssitantManager.userId = userID
                        this.goToNextScreen();
                    }
                });
            }
        });
       
    }


    goToNextScreen = () => {

        this.setState({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
        })
        const { state, navigate } = this.props.navigation;
        this.props.navigation.navigate("IntializationData", { comingFrom: ComingFrom.SIGNUP_SCREEN })
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };




    goToSignInScreen = () => {

        // this.props.navigation.navigate('SignUpScreen')

        const { state, navigate } = this.props.navigation;
        navigate("LoginScreen", { screen: AppConstant.APP_NAME })
    }







    render() {
        const { state, navigate } = this.props.navigation;
        return (
            // <KeyboardAwareScrollView style={styles.container}  getTextInputRefs={() => 
            // { return [this._textInputRef,this._textInputRefLastName,this._textInputRefEmail,this._textInputRefpassword]; }}>

            <View style={{ flex: 1, backgroundColor: "#fff" }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <Toast ref={o => this.toast = o}
                            position={'bottom'}
                            positionValue={200}
                        />
                        <Content>
                            <View style={styles.imageContainer}>
                                <Image style={styles.imageView}
                                    source={require('../img/icon_pro.png')}>
                                </Image>
                            </View>

                            <TextInput style={styles.input}
                                underlineColorAndroid="transparent"
                                placeholder="Enter First Name"
                                placeholderTextColor="black"
                                autoCapitalize="sentences"
                                ref={(r) => { this._textInputRef = r; }}
                                onChangeText={(text) => this.setState({ firstName: text })}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this._textInputRefLastName.focus(); }} />

                            <TextInput style={styles.input}
                                underlineColorAndroid="transparent"
                                placeholder="Enter Last Name"
                                placeholderTextColor="black"
                                autoCapitalize="sentences"
                                ref={(r) => { this._textInputRefLastName = r; }}
                                onChangeText={(text) => this.setState({ lastName: text })}

                                returnKeyType={"next"}
                                onSubmitEditing={() => { this._textInputRefEmail.focus(); }} />


                            <TextInput style={styles.input}
                                underlineColorAndroid="transparent"
                                placeholder="Enter Email"
                                placeholderTextColor="black"
                                autoCapitalize="none"
                                ref={(r) => { this._textInputRefEmail = r; }}
                                onChangeText={(text) => this.setState({ email: text })}
                                keyboardType='email-address'

                                returnKeyType={"next"}
                                onSubmitEditing={() => { this._textInputRefpassword.focus(); }} />

                            <TextInput style={styles.input}
                                underlineColorAndroid="transparent"
                                placeholder="Enter Password"
                                placeholderTextColor="black"
                                autoCapitalize="none"
                                secureTextEntry={true}
                                ref={(r) => { this._textInputRefpassword = r; }}
                                onChangeText={(text) => this.setState({ password: text })}

                            // returnKeyType={"next"}
                            // onSubmitEditing={() => { this._textInputRefpassword.focus(); }}
                            />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    onPress={this.signUp}
                                    style={styles.button}>
                                    <Text style={styles.buttonText}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.bottomContainer}
                                onPress={this.goToSignInScreen}>
                                {/* <Text> Already have an account? Sign In</Text> */}
                                <Text>
                                        {'Already have an account? '}
                                        <Text style={{ color: '#0E72F1', }}>
                                            Sign In
                            </Text>
                                    </Text>
                            </TouchableOpacity>
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
        justifyContent: 'center'
    },
    imageView: {
        marginTop: 10,
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
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
        borderRadius: 5,
        height: 50,
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