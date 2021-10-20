import React, { Component } from 'react';
import {
    ToastAndroid,
    Alert,
    Platform
} from 'react-native';
import NetInfo from '@react-native-community/netinfo'
window.navigator.userAgent = 'react-native';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';


//import WS from 'react-native-websocket'
import Toast, { DURATION } from 'react-native-easy-toast'

export default class InternetManger extends Component {


    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    constructor(props) {
        super(props)
    }

    static InternetMangerInstance = null;

    /**
     * @returns {InternetManger}
     */
    static sharedInstance() {
        if (InternetManger.InternetMangerInstance == null) {
            InternetManger.InternetMangerInstance = new InternetManger();
        }

        return this.InternetMangerInstance;
    }

    _initializeInternetInfo(){
        // NetInfo.addEventListener(state => {
        //     console.log("Connection type", state.type);
        //     console.log("Is connected?", state.isConnected);
        //   });
        NetInfo.addEventListener((state)=>{this.handleConnectionChange(state.isConnected)});

        // NetInfo.fetch().done(
        //   (isConnected) => { this.setState({ status: isConnected }); }
        // );

    }
    
    handleConnectionChange = (isConnected) => {
        // this.setState({ status: isConnected });
        
        if(!isConnected){
            TeacherAssitantManager.getInstance().showAlert("No internet available")
            // this._showToastMessage("No internet available")
        }

     //   console.log(`is connected: ${this.state.status}`);
}

componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectionChange);
}



 
}