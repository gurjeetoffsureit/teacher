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
    SectionList,
    Image,
    SafeAreaView
} from 'react-native';
import { Keyboard } from 'react-native';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import SegmentedControlTab from 'react-native-segmented-control-tab'
import StyleTeacherApp from '../styles/StyleTeacherApp'

export default class AddStudentParentsContact extends React.PureComponent {


    constructor(props) {
        super(props)
        var stateParmData = this.props.navigation.state.params
        var segementControllerList = ['Home', 'Work', 'Mobile', 'Other']
        var selectedIndex = 0
        if (stateParmData.phoneData.value != undefined) {
            var index = segementControllerList.findIndex((item) => item.toLocaleLowerCase() == stateParmData.phoneData.type.toLocaleLowerCase())
            if (index > -1) {
                selectedIndex = index
            }
        }
        this.state = {
            //studentId: stateParms.studentId,
            userId: stateParms.userId,
            createdBy: stateParms.createdBy,
            selectedIndex: selectedIndex,
            segementControllerList: segementControllerList,
            phoneNumber: stateParmData.phoneData.value == undefined ? '' : stateParmData.phoneData.value
        }
        this.studentId = stateParmData.studentId
    }

    
    _moveToPerviousScreen = (isfromSave = false) => {
        Keyboard.dismiss;
        if (isfromSave) {
            var phoneNumber = this.state.phoneNumber
            // if(phoneNumber.length<){
            //     TeacherAssitantManager.getInstance.showAlert('Enter valid email address')
            //     return
            // }
            var phone = {
                value: this.state.phoneNumber,
                type: this.state.segementControllerList[this.state.selectedIndex]
            }
            this.props.navigation.state.params.onGoBack(phone, this.props.navigation.state.params.index, !isfromSave);
            this.props.navigation.goBack();
        } else {
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
        }
    }


    componentDidMount() {
        this.props.navigation.setParams({ onAdd: this.onAddPress, moveToPerviousScreen: this._moveToPerviousScreen })
        //this._addEventListener();

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
                <TouchableOpacity onPress={() => params.moveToPerviousScreen()}>
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
                        {navigation.state.params.headerRight}
                    </Text>

                </TouchableOpacity>
            

        }
    }


    onAddPress = () => {
        this._moveToPerviousScreen(true)


    }



    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    handlePhoneNumber = (text) => {
        this.setState({
            phoneNumber: text
        })
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
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    {/* <Loader loading={this.state.loading} /> */}
                    <View style={styles.textViewCOntainer}>
                        <Text style={styles.textStyle}>
                            Phone
                            </Text>
                        <TextInput style={styles.textInputStyle}
                            underlineColorAndroid="transparent"
                            placeholder="Add Phone"
                            placeholderTextColor="gray"
                            autoCapitalize="none"
                            ref={(r) => { this._textInputRef = r; }}
                            value={this.state.phoneNumber}
                            keyboardType='numeric'
                            maxLength={13}
                            onChangeText={(text) => this.handlePhoneNumber(text)}

                        />

                    </View>
                    <View style={{ flex: 1, padding: 10, height: 100, marginTop: 10 }}>
                        <SegmentedControlTab
                            values={this.state.segementControllerList}
                            selectedIndex={this.state.selectedIndex}
                            onTabPress={this.handleIndexChange}
                            styles={
                                { padding: 10 }
                            }
                        />
                    </View>
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
    }
});