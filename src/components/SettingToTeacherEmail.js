import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    AsyncStorage, Image, SafeAreaView
} from 'react-native';
import StorageConstant from '../constants/StorageConstant'
import API from '../constants/ApiConstant';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import { Keyboard } from 'react-native';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import TextMessage from "../constants/TextMessages";
import Toast, { DURATION } from 'react-native-easy-toast'

var self;
export default class SettingToTeacherEmail extends React.PureComponent {

   
    constructor(props) {
        super(props)
        var params = this.props.navigation.state.params
        this.state = {
            toTeacherEmail: params.toTeacherEmail,
            settingId: params.settingId
        }
        self = this
    }

    handlelongText = (text) => {
        this.setState({ toTeacherEmail: text })
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.onAddPress,
            moveToPreviousScreen: this.moveToPreviousScreen
        })
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: '' + ` ${navigation.state.params.screenTitle}`,
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.moveToPreviousScreen()}>
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
                    onPress={() => params.onAdd()}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {navigation.state.params.headerRight}
                    </Text>
                </TouchableOpacity>
        }
    }


    onAddPress() {
        var email = self.state.toTeacherEmail
        if (!TeacherAssitantManager.getInstance()._validateEmail(email)) {
            self._showToastMessage(TextMessage.ENTER_VALID_EMAIL_ADDRESS)
            return
        }

        Keyboard.dismiss
        // this.moveToPreviousScreen();
        var body = { toTeacherEmail: email }



        //this.setLoading(true)

        TeacherAssitantManager.getInstance()._updateUserSetting(body, self.state.settingId).then((responseJson) => {
            //console.log("response", JSON.stringify(responseJson));
            if (responseJson.success) {
                //this.setLoading(false);
                this.moveToPreviousScreen();
            }
            else {
                //this.setLoading(false);
                this._showToastMessage(responseJson.message);
            }
        }).catch((error) => {
            // this.setLoading(false);
            console.error(error);
        });;

    }

    _showToastMessage=(message)=> {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }


    moveToPreviousScreen = () => {
        Keyboard.dismiss;
        //const{state,params,navigate} = this.props.navigation
        this.props.navigation.state.params.onGoBack(false);
        this.props.navigation.goBack();

    }

    render() {
        // var title = this.props.navigation.state.params.screenTitle
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }} >
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <TextInput style={styles.longInputType}
                        underlineColorAndroid="transparent"
                        placeholder={"Add to address"}
                        placeholderTextColor="black"
                        autoCapitalize="none"
                        value={this.state.toTeacherEmail}
                        onChangeText={(text) => this.handlelongText(text)} />
                </View>
            </SafeAreaView>

        )
    }
}

const styles = StyleSheet.create({
    textInputStyle: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    RightHeaderbuttonText: {
        color: '#0E72F1',
        fontSize: 20,
        marginRight: 10
    },
    longInputType: {
        fontSize: 16,
        margin: 15,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        paddingStart: 8,
        paddingEnd: 8,
        height: 50
    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
});