import React from "react";
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TextInput, Keyboard
} from 'react-native'
import API from '../constants/ApiConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import Loader from '../ActivityIndicator/Loader';
import StyleTeacherApp from '../styles/StyleTeacherApp'

import Toast, { DURATION } from 'react-native-easy-toast'
export default class AddSettingCustomizeDetailFields extends React.PureComponent {

    constructor(props) {
        super(props)
        var stateParams = this.props.navigation.state.params;
        this.state = {
            customizeDetailFieldValue: stateParams.customizeDetailFieldData != undefined ? stateParams.customizeDetailFieldData.customizedDetailField : '',
            customizeDetailFieldData: stateParams.customizeDetailFieldData,
            loading: false,
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this._saveAndUpadteCustomizeDetailsFields,
            gotoBack: this.moveToPreviousScreen
        })
    }

    _saveAndUpadteCustomizeDetailsFields = () => {
        Keyboard.dismiss
        if (this.state.customizeDetailFieldValue.trim() == '') {
            // TeacherAssitantManager.getInstance().showAlert('Please add' + ' ' + this.props.navigation.state.params.screenTitle)
            this._showToastMessage('Please add' + ' ' + this.props.navigation.state.params.screenTitle)
            return
        }
        this.setState({ loading: true });
        var isTrue = this.props.navigation.state.params.headerRight.toLowerCase() == 'save'
        var url = API.BASE_URL + (isTrue ?
            API.API_CREATE_OR_DELETE_CUSTOMIZE_DETAILS_FIELDS :
            API.API_UPDATE_CUSTOMIZE_DETAILS_FIELDS + this.state.customizeDetailFieldData._id)
        var userId = TeacherAssitantManager.getInstance().getUserID()
        var bodyValue = {
            "customizedDetailField": this.state.customizeDetailFieldValue,
            "createdBy": userId
        }

        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: isTrue ? 'POST' : 'PUT',
            headers: {},
            body: JSON.stringify(bodyValue)
        })
            .then((responseJson) => {
                if (responseJson.success) {
                    this.setState({
                        loading: false
                    });
                    // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                    this._showToastMessage(responseJson.message)
                    let self = this
                    setTimeout(() => {
                        self.moveToPreviousScreen();
                    }, 300);

                } else {
                    this.setState({
                        loading: false
                    });
                    // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                    this._showToastMessage(responseJson.message)
                }
            })
            .catch((error) => {

                // console.log("error===" + error)
            })
    }

    moveToPreviousScreen = () => {
        Keyboard.dismiss;
        // console.log("props", this.props)
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    //define header (navigation Bar)
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: '' + ` ${navigation.state.params.screenTitle}`,
            gestureEnabled: false,
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
            headerRight: () => navigation.state.params.isheaderRightShow
                ?
                <TouchableOpacity
                    onPress={() => params.onAdd()}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {navigation.state.params.headerRight}
                    </Text>
                </TouchableOpacity> : null

        }
    }


    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    //render the whle ui
    render() {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
                <Loader loading={this.state.loading} />
                <Toast ref={o => this.toast = o}
                    position={'bottom'}
                    positionValue={200}
                />
                <View style={styles.headerContainer}>
                    <TextInput style={styles.pickerInputText}
                        underlineColorAndroid="transparent"
                        placeholder={"Add " + this.props.navigation.state.params.screenTitle}
                        value={this.state.customizeDetailFieldValue}
                        onChangeText={(text) => this.setState({ customizeDetailFieldValue: text })}
                    ></TextInput>
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
    },
    list: {
        backgroundColor: 'white',
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
        marginRight: 10
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
        margin: 12
    },
    rowTextContainter: {
        flex: 0.7,
        flexDirection: 'row',
        marginLeft: 10
    },
    rowText: {
        color: "black",
        fontSize: 15,
        marginLeft: 10,
        flex: 1,
        justifyContent: "center",
    },
    touchStyle: {
        flex: 0.2,
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
    pickerInputText: {
        margin: 40,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        paddingStart: 8,
        paddingEnd: 8
    },
    headerContainer: {
        justifyContent: "center"
    },
    listContainer: { flex: 0.999 },

    bottomViewSeprator: {
        flex: 0.002,
        backgroundColor: 'gray'
    },
    iconImageContainer: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    iconImage: {
        height: 16,
        width: 16,
    },
    infoIconImageContainer: {
        // fontSize: 15,
        marginLeft: 15,
        flex: 0.75,
        justifyContent: "center",
        alignItems: "center",
    },
    rowItemActionPickerText: {
        height: '60%',
        justifyContent: 'center',
        marginTop: 2
    }
});