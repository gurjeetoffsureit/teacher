
import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    Alert, SafeAreaView, Dimensions
} from 'react-native'
// import ImagePicker from 'react-native-image-picker';
// import Dimensions from 'Dimensions';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import AppConstant from '../constants/AppConstant';
import ImagePicker from 'react-native-image-crop-picker';
export default class AddActionImage extends React.PureComponent {
    constructor(props) {
        super(props)
        var previousData = this.props.navigation.state.params.item
        this.state = {
            selectedFile: previousData.actionValue == '' ? "" :  previousData.actionValue,
            selectedUri: previousData.actionValue||"",
            previousData: previousData.data
        }

    }


    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.moveToNextScreen,
            gotoBack: this.moveToPreviousScreen
        })
    }


    moveToPreviousScreen = () => {
        // console.log("props", this.props)
        var item = {
            _id: this.state.previousData._id,
            dataType: this.state.previousData.dataType,
            actionValue: this.state.selectedUri
        }
        this.props.navigation.state.params.onGoBack(item);
        this.props.navigation.goBack();
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            //title:`${navigation.state.param.title}`,
            title: '' + ` ${navigation.state.params.screenTitle}`,
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: () => <TouchableOpacity onPress={() => params.gotoBack()}>
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
            headerRight: () => <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
            </View>,
        }
    }

    gotoHomeScreen = () => {
        this.props.navigation.pop()
        this.props.navigation.state.params.onGoBack();
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <View style={{ flex: 0.92, justifyContent: 'center' }}>
                        {TeacherAssitantManager.getInstance().getFastImageComponent(this.state.selectedFile, {
                             alignSelf: 'center',
                             width: Dimensions.get('window').width - 20,
                             height: Dimensions.get('window').width - 20
                        })}
                        {/* <Image
                            style={{
                                alignSelf: 'center',
                                width: Dimensions.get('window').width - 20,
                                height: Dimensions.get('window').width - 20
                            }}
                            source={this.state.selectedFile}
                        /> */}
                    </View>
                    <View style={styles.list} />
                    <View style={styles.bottomOuterView}>

                        <View style={styles.bottomInnerView}>
                            <TouchableOpacity
                                onPress={this._handleCameraClick}
                                style={{ alignItems: 'flex-start' }}>
                                <Image style={styles.imageView}
                                    source={require("../img/camera_icon.png")} />
                            </TouchableOpacity>

                            <TouchableOpacity style={{ alignItems: 'flex-end' }}
                                onPress={this._handleRemoveImageClick}>
                                <Text style={styles.text}>Remove Image</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </SafeAreaView>
        )
    }
    _handleCameraClick = () => {
        Alert.alert(
            "Teacher's Assistant Pro 3",
            "Select  Photo",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "Camera", onPress: () => { this._chooseProfilePickFromCamera() } },
                { text: "Gallery", onPress: () => { this._chooseProfilePickFromGallery() } }
            ]
        );
    }

    _chooseProfilePickFromGallery() {
        const options = {
            width: 500,
            height: 500,
            mediaType: 'photo',
            forceJpg: true,
            includeBase64: true,
            includeExif: true,
        };
        TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, 'true').then((error) => {

            ImagePicker.openPicker(options).then(response => {
                //console.log('Response = ', JSON.stringify(response));
                //console.log('Response = ', response);
                if (response.didCancel) {
                    //console.log('User cancelled photo picker');
                }
                else if (response.error) {
                    if (Platform.OS == "ios" && response.error == "Photo library permissions not granted" ||
                        response.error == "Camera permissions not granted") {
                        // Works on both iOS and Android
                        Alert.alert(
                            AppConstant.APP_NAME,
                            'Please go to settings and enable required permission',
                            [
                                { text: 'Settings', onPress: () => Linking.openURL('app-settings:') },
                            ],
                            { cancelable: false }
                        )

                    } else {
                        //console.log('ImagePicker Error: ', response.error);
                        //TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, '').then((error) => {})
                    }

                }
                else if (response.customButton) {
                    //console.log('User tapped custom button: ', response.customButton);
                }
                else {
                    var uri = { uri: `${response.path}` }
                    this.setState({
                        selectedFile: uri,
                        selectedUri: uri
                    });
                }
            }).catch((error) => {
                // imagePickerErrorCallBack(error)
                //console.log("image error>>>>>>>", error);
            });
        })

    }


    _chooseProfilePickFromCamera() {
        const options = {
            width: 500,
            height: 500,
            mediaType: 'photo',
            forceJpg: true,
            includeBase64: true,
            includeExif: true,
        };
        TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, 'true').then((error) => {

            ImagePicker.openCamera(options).then(response => {
                //console.log('Response = ', JSON.stringify(response));
                //console.log('Response = ', response);
                if (response.didCancel) {
                    //console.log('User cancelled photo picker');
                }
                else if (response.error) {
                    if (Platform.OS == "ios" && response.error == "Photo library permissions not granted" ||
                        response.error == "Camera permissions not granted") {
                        // Works on both iOS and Android
                        Alert.alert(
                            AppConstant.APP_NAME,
                            'Please go to settings and enable required permission',
                            [
                                { text: 'Settings', onPress: () => Linking.openURL('app-settings:') },
                            ],
                            { cancelable: false }
                        )

                    } else {
                        //console.log('ImagePicker Error: ', response.error);
                        //TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, '').then((error) => {})
                    }

                }
                else if (response.customButton) {
                    //console.log('User tapped custom button: ', response.customButton);
                }
                else {
                    var uri = { uri: `${response.path}` }
                    this.setState({
                        selectedFile: uri,
                        selectedUri: uri
                    });
                }
            }).catch((error) => {
                // imagePickerErrorCallBack(error)
                //console.log("image error>>>>>>>", error);
            });
        })

    }

    _handleRemoveImageClick = () => {
        this.setState({
            selectedFile: "",
            selectedUri: ''
        })
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
        flexDirection: 'column',
        justifyContent: 'center'
    },
    list: {
        backgroundColor: 'blue',
        height: 0.9
    },
    bottomOuterView: {
        flex: 0.08,
        backgroundColor: 'white'
    },
    bottomInnerView: {
        flexDirection: 'row',
        flex: 1, alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 10,
        marginRight: 10,
    },
    text: {
        fontSize: 18,
        color: '#4799EB'
    },
    imageView: {
        alignItems: 'center',
        width: 32,
        height: 32
    }
});

