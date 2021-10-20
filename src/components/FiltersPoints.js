import React from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableHighlight,
    ScrollView,
    Linking,
    Alert,
    Platform, Keyboard,
    TouchableOpacity, Image, Switch, SafeAreaView
} from 'react-native';

import dropboxKey from '../constants/DropboxConstant';
import Loader from '../ActivityIndicator/Loader';
import API from '../constants/ApiConstant'
import AppConstant from '../constants/AppConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import { EventRegister } from 'react-native-event-listeners'
import update from 'react-addons-update'
import SocketConstant from '../constants/SocketConstant'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import ActionSheet from 'react-native-actionsheet'
import ComingFrom from '../constants/ComingFrom'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'

var self;
export default class FiltersPoints extends React.PureComponent {
    constructor(props) {
        super(props);
        let pointsFilter = []
        pointsFilter = this.props.navigation.state.params.pointsFilter
        let isGreaterThan = true
        let isLessThan = false
        let isEqualTo = false
        if (pointsFilter.length > 0) {
            switch (pointsFilter[1]) {
                case "$eq":
                    isGreaterThan = false
                    isLessThan = false
                    isEqualTo = true
                    break;
                case "$gt":
                    isGreaterThan = true
                    isLessThan = false
                    isEqualTo = false
                    break;
                case "$lt":
                    isGreaterThan = false
                    isLessThan = true
                    isEqualTo = false
                    break;
            }
        }





        this.state = {
            isGreaterThan: isGreaterThan,
            isLessThan: isLessThan,
            isEqualTo: isEqualTo,
            txtPointValue: pointsFilter.length > 0 ? pointsFilter[0] : '',
            loading: false,
            pointsFilter: pointsFilter
        }

        // this.deleteAndCancelOptions = ['DELETE', 'CANCEL']
        // this.resetAndCancelOptions = ['RESET', 'CANCEL']
        self = this;

    }



    componentDidMount() {

        //this._getSettingData()
        // //console.log('componentDidMount');
        // Linking.getInitialURL().then((ev) => {
        //     if (ev) {
        //         this.handleOpenURL(ev);
        //     }
        // }).catch(err => {
        //     console.warn('An error occurred', err);
        // });
        // Linking.addEventListener('url', this.handleOpenURL);


        this.props.navigation.setParams({
            moveToHome: this.gotoPreviousScreen,
            onPressSavePointFilter: this.onPressSavePointFilter
        })
    }
    gotoPreviousScreen = () => {
        //this._removeEventListener()
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();

    }

    onPressSavePointFilter = () => {
        Keyboard.dismiss;
        let url = API.BASE_URL + API.API_USERS_SETTINGS_POINT_FILTERS + TeacherAssitantManager.getInstance().getUserID()

        //console.log("url is ", url)

        let pointValueArray = []
        let { isEqualTo, isGreaterThan, isLessThan, txtPointValue } = this.state

        if (!TeacherAssitantManager.getInstance()._validPointNumber(txtPointValue.trim())) {
            this._showToastMessage('Only postive or negtive number are accepted');
            return
        }
        if (isEqualTo) {
            pointValueArray = [txtPointValue, "$eq"]
        } else if (isGreaterThan) {
            pointValueArray = [txtPointValue, "$gt"]
        } else if (isLessThan) {
            pointValueArray = [txtPointValue, "$lt"]
        }


        let body = {
            value: pointValueArray
        }

        this.setState({
            loading: true
        })
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'POST',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': userId,
            },
            body: JSON.stringify(body)
        }).then((responseJson) => {
            //console.log('response===' + JSON.stringify(responseJson))
            if (responseJson.success) {
                this.setState({
                    loading: false
                })

                this._showToastMessage(responseJson.message)
                let self = this
                setTimeout(() => {
                    this.props.navigation.state.params.onGoBack(responseJson.data, false, true);
                    this.props.navigation.goBack();
                }, 300);

            } else {
                this.setState({
                    loading: false
                })
                this._showToastMessage(responseJson.message)
            }


        }).catch((error) => {
            console.error(error);
        });
        //this._movetoNextScreen(ComingFrom.EXPORT_DATA_REPORT_OPTION)
    }


    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    _onPress = (moveTo) => {
        switch (moveTo) {
            case AppConstant.GREATER_THAN:
                this.setState({
                    isGreaterThan: true,
                    isLessThan: false,
                    isEqualTo: false,
                })
                break;
            case AppConstant.LESS_THAN:
                this.setState({
                    isGreaterThan: false,
                    isLessThan: true,
                    isEqualTo: false,
                })
                break;
            case AppConstant.EQUAL_TO:
                this.setState({
                    isGreaterThan: false,
                    isLessThan: false,
                    isEqualTo: true,
                })
                break;
        }

    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: params.screenTitle,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.moveToHome()}>
                    <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.width60Per,
                    StyleTeacherApp.marginLeft14,]}>
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
            headerRight:  () => 
                <TouchableOpacity 
                    onPress={() => params.onPressSavePointFilter()}
                    disabled={params.headerRight == '' ? true : false}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {`${navigation.state.params.headerRight}`}
                    </Text>
                </TouchableOpacity>
            

        }
    }

    render() {

        return (
            <SafeAreaView style={styles.container}>
                <Toast ref={o => this.toast = o}
                    position={'bottom'}
                    positionValue={200}
                />
                <Loader loading={this.state.loading} />
                <KeyboardAwareScrollView style={styles.container} getTextInputRefs={() => { return [this._textInputRef]; }}>
                    <View style={styles.container} >
                        <View style={styles.sectionViewContainer}>
                            {/* <Text style={styles.sectionTitle}>DATE RANGE</Text> */}
                        </View>
                        <View style={styles.buttonContainer}>
                            <View
                                style={[{
                                    flexDirection: 'row', height: 50,
                                    flex: 1,
                                    marginTop: 0,
                                    backgroundColor: '#ffffff',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.35,
                                    shadowRadius: 2,
                                }]}>
                                <View style={{ justifyContent: "center", paddingBottom: 10 }}>
                                    <Text style={[styles.buttonText]}>Points: </Text>
                                </View>
                                <View style={{ justifyContent: "center", flex: 1 }}>
                                    <TextInput style={styles.input}
                                        underlineColorAndroid="transparent"
                                        placeholder="Enter Point Value"
                                        placeholderTextColor="black"
                                        autoCapitalize="none"
                                        value={this.state.txtPointValue}
                                        ref={(r) => { this._textInputRef = r; }}
                                        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                                        onChangeText={(text) => this.setState({ txtPointValue: text })}
                                        onSubmitEditing={() => { Keyboard.dismiss }}
                                    />
                                </View>

                            </View>
                        </View>
                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}></Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPress(AppConstant.GREATER_THAN)}
                                style={styles.buttonWithoutTopMargin}>
                                {/* <Text style={styles.buttonText}>Greater than {TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, 2)}</Text> */}
                                <Text style={styles.buttonText}>Greater than </Text>
                               
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                    {
                                        this.state.isGreaterThan ?
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/check_icon.png')}>
                                            </Image> : null
                                    }

                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPress(AppConstant.LESS_THAN)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>Less than</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                    {
                                        this.state.isLessThan ?
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/check_icon.png')}>
                                            </Image> : null}
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPress(AppConstant.EQUAL_TO)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>Equal to</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                    {
                                        this.state.isEqualTo ?
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/check_icon.png')}>
                                            </Image> : null}
                                </View>
                            </TouchableOpacity>
                        </View>

                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView >

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E7E7E7"
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    buttonWithTopMargin: {
        height: 50,
        flex: 2,
        marginTop: 15,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
    },
    buttonWithoutTopMargin: {
        height: 50,
        flex: 1,
        marginTop: 0,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 16,
        color: 'black'
    },
    sectionViewContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 40,
        marginLeft: 10
    },
    textAlignLeft: {
        textAlign: 'left'
    },
    positionAbsoluteWithEnd: {
        position: 'absolute', end: 10
    },
    textPositionAbsoluteWithEnd: {
        position: 'absolute', end: 30
    },
    touchableOpacityItemViewContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    input: {
        margin: 10,
        marginTop: 3,
        height: 40,
        borderColor: 'gray',
        // borderWidth: 1,
        borderRadius: 5,
        borderBottomWidth: 1,
        paddingStart: 8,
        paddingEnd: 8,
        flex: 1
    },
});