import React from "react";
import {
    TouchableOpacity, Image, Platform, StyleSheet, Text, View, TextInput, ImageBackground, Keyboard,
    DatePickerIOS, DatePickerAndroid, TimePickerAndroid, SafeAreaView, SegmentedControlIOS
} from 'react-native'
import API_PARAM from '../constants/ApiParms'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager'
import Loader from '../ActivityIndicator/Loader'
import API from '../constants/ApiConstant'
import moment, { parseTwoDigitYear } from 'moment';
import TextMessage from "../constants/TextMessages";
// import Switch from 'react-native-customisable-switch';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from '../constants/BreadCrumbConstant';
import SegmentedControlTab from 'react-native-segmented-control-tab'
import Toast, { DURATION } from 'react-native-easy-toast'

export default class FilterTeacherAndParentResponse extends React.PureComponent {
    constructor(props) {
        super(props);
        var stateParams = this.props.navigation.state.params
        let selectedIndex = -1
        let isActionValueEmpty = stateParams.item.actionValue == ''
        if (!isActionValueEmpty) {
            if (stateParams.item.actionValue[0]) {
                selectedIndex = 0
            } else {
                selectedIndex = 1
            }
        }
        this.state = {
            selectedIndex: selectedIndex,
            lblHeader: stateParams.lblHeader,
            item: stateParams.item,
            loading: false
        }
    }



    moveToPreviousScreen = () => {
        //console.log("props", this.props)
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this._saveSelectedResponse,
            gotoBack: this.moveToPreviousScreen
        })
    }

    _saveSelectedResponse = () => {

        this.setState({
            loading: true
        })

        let url = API.BASE_URL + API.API_USERS_SETTINGS_FILTERS_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID()

        //console.log("url is ", url)

        let body = {
            actionId: this.state.item.data._id,
            value: [this.state.selectedIndex == 0 ? true : false]
        }
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
                this._showToastMessage(responseJson.message)
                var self = this
                setTimeout(() => {
                    self.props.navigation.state.params.onGoBack();
                    self.props.navigation.goBack();
                }, 300);

            }

            this.setState({
                loading: false
            })
        }).catch((error) => {
            console.error(error);
        });


    }


    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: '' + ` ${navigation.state.params.screenTitle}`,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.gotoBack()}>
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
            headerRight:  () => 
                <TouchableOpacity
                    onPress={() => params.onAdd()}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {`${navigation.state.params.headerRight}`}
                    </Text>
                </TouchableOpacity>
            

        }
    }


    handleIndexChange = (index) => {
        this.setState({
            selectedIndex: index,
        });
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }


    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} >
                <View style={[styles.container]}>
                    <Loader loading={this.state.loading} />
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <View style={[{ flex: 1, padding: 10, marginTop: 10, marginBottom: 20 }]}>

                        <View style={[{ flex: 1 }]}>
                            <View style={[{ alignSelf: 'center' }]}>
                                <Text style={{ fontSize: 18, color: 'black', marginBottom: 20 }}>{this.state.lblHeader}</Text>
                            </View>

                            <View style={[{ width: '50%', alignSelf: 'center' }]}>
                                <SegmentedControlTab
                                    values={['Yes', 'No']}
                                    selectedIndex={this.state.selectedIndex}
                                    onTabPress={this.handleIndexChange}

                                />
                            </View>

                        </View>

                    </View>
                </View>
            </SafeAreaView>
        )
    }



}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 15,
        backgroundColor: 'white'
    },
    containerForAndroid: {
        flex: 1,
        alignItems: 'center',
        marginTop: 15,
        backgroundColor: 'white'
    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    headerRightButtonText: {
        color: '#0E72F1',
        fontSize: 20,
        marginRight: 10
    },

    headerContainer: {
        flex: 2,
        justifyContent: "center"

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
})

