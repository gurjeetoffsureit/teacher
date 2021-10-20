import React, { Component } from 'react';
import {
    ToastAndroid,
    Alert,
    Platform, AppState
} from 'react-native';
import NetInfo from "@react-native-community/netinfo"
window.navigator.userAgent = 'react-native';

import { EventRegister } from 'react-native-event-listeners'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import AppConstant from '../constants/AppConstant';


//import WS from 'react-native-websocket'


export default class AppStateManger extends Component {

    constructor(props) {
        super(props)
        // this.state = { appState: "" }
    }

    static AppStateMangerInstance = null;

    /**
export default class AppStateManger extends Component {
     * @returns {AppStateManger}
     */
    static sharedInstance() {
        if (AppStateManger.AppStateMangerInstance == null) {
            AppStateManger.AppStateMangerInstance = new AppStateManger();
        }

        return this.AppStateMangerInstance;
    }


    _initializeAppState() {
        AppState.addEventListener('change', this._handleAppStateChange);
        // this.state = {
        //     appState: AppState.currentState
        // }

    }

    //   componentWillUnmount() {
    //     AppState.removeEventListener('change', this._handleAppStateChange);
    //   }

    _handleAppStateChange = (nextAppState) => {

        if (nextAppState === 'active') {
            //console.log('App has come to the foreground!')
            TeacherAssitantManager.getInstance().getDataFromAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT).then((value) => {
                if (value == 'true' || value == null) {
                    TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, 'false').then((error) => {

                    })
                } else {
                    EventRegister.emit('handleAppStateChange', true)
                }
            })

        }
        // this.setState({ appState: nextAppState });
    }
}






