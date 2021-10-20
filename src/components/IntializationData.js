import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity, ActivityIndicator
} from 'react-native';

import API from '../constants/ApiConstant'
import AppConstant from '../constants/AppConstant'
import StorageConstant from '../constants/StorageConstant'
import { StackActions, NavigationActions } from 'react-navigation';
import ClassScreen from './ClassScreen';
import { EventRegister } from 'react-native-event-listeners'
import SocketManger from '../Singletons/SocketManager';
import SocketConstant from '../constants/SocketConstant';
import TextMessages from '../constants/TextMessages';
import ComingFrom from '../constants/ComingFrom';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';

export default class IntializationData extends React.PureComponent {

    goToHomeScreenScreen = () => {
        const { state, navigate } = this.props.navigation;
        navigate("HomeScreen", { screen: AppConstant.APP_NAME, isfromIntializationDataScreen: true, screenLock: '', comingFrom: ComingFrom.INTIALIZATION_DATA })
    }

    _createInitialData() {

        this.setState({
            isActivityIndicatorShow: true
        })
        //this._createInitialUserData(TeacherAssitantManager.getInstance().getUserID());
        if (this.comingFrom == ComingFrom.SPLASH_SCREEN) {
            this._createInitialUserData(TeacherAssitantManager.getInstance().getUserID());
        } else {
            TeacherAssitantManager.getInstance().getUserID().then((userId) => {
                // userId = _userId
                this._createInitialUserData(userId);
            })
        }
    }

    _onPressRetryAction = () => {
        this.state = {
            msgLabel: TextMessages.SETTING_UP_INITIAL_DATA,
            isActivityIndicatorShow: false,
            isgotErrorResponse: false,
        };
        this._createInitialData(true)
    }

    _createInitialUserData(userId) {
        var url = API.BASE_URL + API.API_CREATE_INITIAL_DATA + userId;
        //console.log('url' + url)
        var headerVlaue = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'clientid': TeacherAssitantManager.getInstance().getClientID(),
            'userId': userId,
        };
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'POST',
            headers: headerVlaue,
        }).then((initialDefaultDataResponseJson) => {
            //console.log("Singup REsponse " + JSON.stringify(initialDefaultDataResponseJson));
            //console.log(initialDefaultDataResponseJson.message);
            this.setState({
                isActivityIndicatorShow: false
            });
            if (initialDefaultDataResponseJson.success) {
                TeacherAssitantManager.getInstance().saveDataToAsyncStorage(StorageConstant.STORE_INTIAL_DATA_STATUS, 'true').then((error) => {
                    this.goToHomeScreenScreen();
                });
                TeacherAssitantManager.getInstance()._saveCustomizeTerminologyToLocalDb(initialDefaultDataResponseJson.data.termology)
            }
            else {
                this.setState({
                    isgotErrorResponse: true
                });
                this.setState({
                    msgLabel: initialDefaultDataResponseJson.message,
                });
                // TeacherAssitantManager.getInstance().showAlert(initialDefaultDataResponseJson.message);
            }
        }).catch((error) => {
            //console.log("Singup Error " + JSON.stringify(error));
            this.setState({ isActivityIndicatorShow: false }, function () {
                setTimeout(() => {
                    alert(`Error is : ${error}`);
                }, 100);
            });
            console.error(error);
        });
    }

    componentDidMount() {
        this._createInitialData()
    }

    constructor(props) {
        super(props)
        this.state = {
            msgLabel: TextMessages.SETTING_UP_INITIAL_DATA,
            isActivityIndicatorShow: false,
            isgotErrorResponse: false,
            //comingFrom: this.props.navigation.state.params.comingFrom
        }
        this.comingFrom = this.props.navigation.state.params.comingFrom
        // Text.defaultProps.allowFontScaling = false;

    }
    static navigationOptions = {
        headerShown: null,
        gestureEnabled: false
    }

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    animating={this.state.isActivityIndicatorShow} />
                <Text style={styles.textStyle}>{this.state.msgLabel}</Text>
                {
                    this.state.isgotErrorResponse ?
                        <TouchableOpacity onPress={this._onPressRetryAction} style={styles.button} >
                            <Text> Retry</Text>
                        </TouchableOpacity> : null
                }

            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch'
    },
    button: {
        alignItems: 'center', justifyContent: 'center', height: 40,
        width: 120, marginLeft: 10, borderBottomWidth: 1, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1
    },
    buttonText: {
        color: 'blue',
        fontSize: 22,
        alignSelf: 'center'
    },
    textStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        margin: 10
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 100,
        width: 100,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});
