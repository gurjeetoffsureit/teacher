import React from "react";

import {
  View,
  Text,
  StyleSheet,

  BackHandler
} from 'react-native';

import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';

import StorageConstant from '../constants/StorageConstant'
import AppConstant from '../constants/AppConstant'

import API from '../constants/ApiConstant'
import ComingFrom from '../constants/ComingFrom'




export default class SplashScreen extends React.PureComponent {

  constructor(props) {
    super(props)
   
  }


  static navigationOptions = {
    headerShown: null,
    gestureEnabled: false
  }

  componentDidMount() {
    setTimeout(() => {
      TeacherAssitantManager.getInstance().getDataFromAsyncStorage(StorageConstant.STORE_USER_ID).then((value) => {
        this.moveToFirstScreent(value);
      })
    }, 1000)

    BackHandler.addEventListener('hardwareBackPress removeEventListener', this.handleBackButton);
  }

  handleBackButton() {
    // ToastAndroid.show('Back button is pressed', ToastAndroid.SHORT);
    return true;
  }

  moveToFirstScreent = (value) => {
    if (value == null || value == '') {
      this.props.navigation.navigate("LoginScreen", { screen: AppConstant.APP_NAME })
    }
    else {

      // TeacherAssitantManager.getInstance().getDataFromAsyncStorage(StorageConstant.STORE_INTIAL_DATA_STATUS).then((statusValue) => {
      //   if (statusValue == null || statusValue != 'true') {
      //     this.props.navigation.navigate("IntializationData")
      //   } else {

      //       this.props.navigation.navigate("HomeScreen", { screen: AppConstant.APP_NAME, isfromIntializationDataScreen: false})


      //   }

      // })


      TeacherAssitantManager.getInstance().getUserID().then(userId => {
        var url = API.BASE_URL + API.API_USER_SETTINGS_BY_USER_ID + userId + '?initial=true'
        var headerValue =
        {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
          // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        }

        //console.log("picker data url is", url)
        //fetch
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
          method: 'GET',
          headers: headerValue,
        })
          .then( async (responseJson) => {
            if (responseJson.success) {
              let settingData = responseJson.data
              if (settingData.termology.length > 0) {
                await TeacherAssitantManager.getInstance()._saveCustomizeTerminologyToLocalDb(settingData.termology)
              }

              if(settingData.subscription){
                await TeacherAssitantManager.getInstance()._saveUserSubscriptionsDataToLocalDb(settingData.subscription)
              }

              TeacherAssitantManager.getInstance().getDataFromAsyncStorage(StorageConstant.STORE_INTIAL_DATA_STATUS).then((statusValue) => {
                if (statusValue == null || statusValue != 'true') {

                  this.goToIntializationDataScreen()
                } else {
                  this.props.navigation.navigate("HomeScreen",
                    { screen: AppConstant.APP_NAME, screenLock: settingData.screenLock, isfromIntializationDataScreen: false })
                }

              })
            } else {
              this.goToIntializationDataScreen()
            }
          })
          .catch((error) => {
            //console.log("Singup Error " + JSON.stringify(error));
            alert(`Error is : ${error}`);
            //console.log("error===" + error)
          })
      })
        .catch((error) => {
          //console.log("error===" + error)
        })




    }
  }

  goToIntializationDataScreen = () => {
    this.props.navigation.navigate("IntializationData", { comingFrom: ComingFrom.SPLASH_SCREEN })
  }

  render() {
    return (
      <View style={styles.container}>
        {/* <Image source={require('../img/splash.png')} style={styles.backgroundImage} />     */}
        <Text style={styles.textStyle}>{AppConstant.APP_NAME}</Text>
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
    alignSelf: 'stretch',
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center'
  },
  buttonText: {
    color: 'blue',
    fontSize: 22,
    alignSelf: 'center'
  },
  textStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 30,
    fontWeight: 'bold'
  }
});