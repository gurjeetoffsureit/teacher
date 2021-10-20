import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    ScrollView,
    Alert,
    Platform,
    ToastAndroid,
    TouchableOpacity,
    SectionList, SafeAreaView,
    Image,
    Switch
} from 'react-native';
import { Keyboard } from 'react-native';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import SegmentedControlTab from 'react-native-segmented-control-tab'

import StyleTeacherApp from '../styles/StyleTeacherApp'
import TextMessage from "../constants/TextMessages";
import Toast, { DURATION } from 'react-native-easy-toast'

export default class AddStudentParentsEmail extends React.PureComponent {


    constructor(props) {
        super(props)
        var stateParmData = this.props.navigation.state.params
        var segementControllerList = ['Home', 'Work', 'Other']
        var selectedIndex = 0
        if (stateParmData.emailData.value != undefined) {
            var index = segementControllerList.findIndex((item) => item.toLowerCase() == stateParmData.emailData.type.toLowerCase())
            if (index > -1) {
                selectedIndex = index
            }
        }
        this.state = {
            //studentId: stateParms.studentId,
            userId: stateParms.userId,
            createdBy: stateParms.createdBy,
            email: stateParmData.emailData.value == undefined ? '' : stateParmData.emailData.value,
            segementControllerList: segementControllerList,
            selectedIndex: selectedIndex,
            emailData: stateParmData.emailData,
            emailBlastValue: stateParmData.emailData.value == undefined ? false : stateParmData.emailData.emailBlast,
        }
        this.studentId = stateParmData.studentId
    }

   
    _moveToPeriviousScreen = (isfromSave) => {

        Keyboard.dismiss;
        if (isfromSave) {
            if (!this._validateEmail(this.state.email)) {
                //TeacherAssitantManager.getInstance().showAlert(TextMessage.ENTER_VALID_EMAIL_ADDRESS)
                this._showToastMessage(TextMessage.ENTER_VALID_EMAIL_ADDRESS)
                return
            }
            var email = {
                value: this.state.email,
                type: this.state.segementControllerList[this.state.selectedIndex],
                emailBlast: this.state.emailBlastValue
            }
            this.props.navigation.state.params.onGoBack(email, this.props.navigation.state.params.index, isfromSave);
            this.props.navigation.goBack();
        } else {
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
        }

    }


    componentDidMount() {
        this.props.navigation.setParams({ onPressSave: this.onPressSave, moveToPreviousScreen: this._moveToPeriviousScreen })

    }


    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        // var comingFrom = navigation.state.params.comingFrom
        // var istrue = comingFrom == ComingFrom.HOME_SCREEN || comingFrom == ComingFrom.STUDENT_ACTIONS
        return {
            title: `${navigation.state.params.screenTitle}`,
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
            headerRight:  () => 
                <TouchableOpacity 
                    onPress={() => params.onPressSave()}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {navigation.state.params.headerRight}
                    </Text>

                </TouchableOpacity>
            

        }
    }


    onPressSave = () => {
        this._moveToPeriviousScreen(true)


    }

    gotoStudentsScreen = () => {
        //this._removeEventListener()
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    _validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    _onPressAddEmailAddress = () => {

    }

    handleEmail = (text) => {
        this.setState({ email: text })
    }

    handleIndexChange = (index) => {
        this.setState({
            selectedIndex: index,
        });
    }
    _handleEmailBlastSwitch = (value) => {
        //console.log("value", value)
        // this.state.listData[index].data.value = !value;
        this.setState({
            emailBlastValue: value
        })
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    {/* <Loader loading={this.state.loading} /> */}
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <View style={styles.textViewCOntainer}>
                        <Text style={styles.textStyle}>
                            Email
                            </Text>
                        <TextInput style={styles.textInputStyle}
                            underlineColorAndroid="transparent"
                            placeholder="Add Email"
                            placeholderTextColor="gray"
                            autoCapitalize="none"
                            ref={(r) => { this._textInputRef = r; }}
                            value={this.state.email}
                            onChangeText={(text) => this.handleEmail(text)}

                        />

                    </View>
                    <View style={[{ padding: 10, marginTop: 10 }]}>
                        <SegmentedControlTab
                            values={this.state.segementControllerList}
                            selectedIndex={this.state.selectedIndex}
                            onTabPress={this.handleIndexChange}
                            styles={
                                { padding: 10 }
                            }
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <View style={[styles.touchableOpacityItemViewContainer, styles.buttonWithTopMargin]}>
                            <Text style={[styles.buttonText, styles.textAlignLeft]}>Include in Email Blast</Text>
                            <Switch style={[styles.buttonText, styles.positionAbsoluteWithEnd]}
                                onValueChange={this._handleEmailBlastSwitch}
                                value={this.state.emailBlastValue}
                            />
                        </View>
                    </View>

                    {/* <View style={styles.buttonContainer}>
                    <SegmentedControlTab
                        values={this.state.segementControllerList}
                        selectedIndex={this.state.selectedIndex}
                        onTabPress={this.handleIndexChange}
                        styles={
                            { padding: 10 }
                        }
                    />
                </View>

                <View style={styles.buttonContainer}>
                        <View style={styles.touchableOpacityItemViewContainer}>
                            <Text style={[styles.buttonText, styles.textAlignLeft]}>Email Blast</Text>
                            <Switch style={[styles.buttonText, styles.positionAbsoluteWithEnd]}
                                onValueChange={this._handleEmailBlastSwitch}
                                value={this.state.emailBlastValue}
                            />
                        </View>
                </View> */}
                </View>
            </SafeAreaView>


        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E7E7E7"
    },
    textViewCOntainer: {
        //flex: 1,
        flexDirection: 'row',
        margin: 10,
        height: 40,
        justifyContent: 'center'
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    textViewOtherCOntainer: {
        flex: 1,
        backgroundColor: "#ffffff",

    },
    textStyle: {
        flex: 0.35,
        margin: 10,
        height: 40,
        fontSize: 15,
        justifyContent: 'flex-start'
    },
    textInputStyle: {
        flex: 0.65,
        borderBottomWidth: 0.5,
        paddingStart: 8,
        paddingEnd: 8

    },
    textView: {
        margin: 10,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        fontSize: 15,
        marginTop: 20,
        color: 'gray'
    },

    button: {
        height: 50,
        flex: 1,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        // backgroundColor: 'green',
        flexDirection: 'row',
    },
    buttonParent: {
        height: 50,
        flex: 1,
        marginTop: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        flexDirection: 'row'
    },
    buttonText: {
        flex: 1,
        flexDirection: 'row',
        color: '#0E72F1',
        fontSize: 16,
        marginRight: 10,
        marginLeft: 10,
        justifyContent: 'center',
    },
    boldText: {
        flex: 1,
        flexDirection: 'row',
        color: '#000000',
        fontSize: 18,
        marginRight: 10,
        justifyContent: 'center',
        paddingTop: 10,
    },
    imageNextContainer: {
        flex: 0.2,
        alignItems: 'center',
        justifyContent: 'center',

    },

    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    imageView: {
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16,
        marginLeft: 10
    },
    buttonWithTopMargin: {
        height: 50,
        flex: 1,
        marginTop: 15,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
    },
    touchableOpacityItemViewContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    textAlignLeft: { textAlign: 'left' },
    positionAbsoluteWithEnd: {
        position: 'absolute', end: 10
    },
});