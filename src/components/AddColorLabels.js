import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    Slider, TextInput, SafeAreaView
} from 'react-native'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'

import API from '../constants/ApiConstant'

import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';

import Loader from '../ActivityIndicator/Loader';
import { Keyboard } from 'react-native';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import AppConstant from '../constants/AppConstant';

import Toast, { DURATION } from 'react-native-easy-toast'

var param = ''

export default class AddColorLabels extends React.PureComponent {



    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: '' + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_COLOR_LABEL, 0),
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=><TouchableOpacity onPress={() => params.gotoBack()}>
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
            headerRight:  () =><TouchableOpacity
                    onPress={() => params.onAdd()}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {`${navigation.state.params.headerRight}`}
                    </Text>
                </TouchableOpacity>
            

        }
    }

    constructor(props) {
        super(props)
        param = this.props.navigation.state.params

        if (param.headerRight == "Save") {
            this.state = {
                colorName: '',
                colorPoints: '',
                redSliderValue: 0,
                greenSliderValue: 0,
                blueSliderValue: 0,
                colorPreview: TeacherAssitantManager.getInstance()._rgbToHex(0, 0, 0),
                userId: param.userId,
                loading: false
            }
        } else {
            var colorData = param.color.data
            this.state = {
                colorId: colorData._id,
                colorName: colorData.name,
                colorPoints: colorData.point + "",
                redSliderValue: colorData.red,
                greenSliderValue: colorData.green,
                blueSliderValue: colorData.blue,
                colorPreview: '',
                userId: param.userId,
                loading: false,
                colorPreview: TeacherAssitantManager.getInstance()._rgbToHex(colorData.red, colorData.green, colorData.blue),
            }
        }
    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

   

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this._saveColor,
            gotoBack: this.moveToPreviousScreen
        })
    }

    // help to move to pervious screen
    moveToPreviousScreen = () => {
        Keyboard.dismiss;

        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    // it will help to save api using api into database
    _saveColor = () => {
        Keyboard.dismiss  
        if (this.state.colorName.trim() == '' && this.state.colorPoints.trim() == '') {
            // TeacherAssitantManager.getInstance().showAlert('Please fill both details');
            this._showToastMessage('Please fill both details');
        } else if (this.state.colorName.trim() == '') {
            // TeacherAssitantManager.getInstance().showAlert('Please fill color name');
            this._showToastMessage('Please fill color name');
        } else if (this.state.colorPoints.trim() == '') {
            // TeacherAssitantManager.getInstance().showAlert('Please fill point value');
            this._showToastMessage('Please fill point value');
        } else if(!TeacherAssitantManager.getInstance()._validPointNumber(this.state.colorPoints.trim()) ){
            this._showToastMessage('Only postive or negtive number are accepted');
        }
        else {
            this.setLoading(true)
            var userId = TeacherAssitantManager.getInstance().getUserID();
            var url = API.BASE_URL + API.API_SAVE_COLOR_LABEL + "/unique" + (param.headerRight == "Save" ? '' : '/' + this.state.colorId)
            // var headerValue =
            // {
            //     Accept: 'application/json',
            //     'Content-Type': 'application/json',
            //     'clientid': TeacherAssitantManager.getInstance().getClientID(),
            //     'userId': userId
            // }
            var bodyValue = {
                createdBy: userId,
                name: this.state.colorName.trim(),
                point: this.state.colorPoints.trim(),
                red: this.state.redSliderValue,
                green: this.state.greenSliderValue,
                blue: this.state.blueSliderValue
            }
            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: (param.headerRight == "Save" ? 'POST' : 'PUT'),
                headers: {},
                body: JSON.stringify(bodyValue)
            })
                .then((responseJson) => {
                    if (responseJson.success) {
                        this.setLoading(false)
                        // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                        this._showToastMessage(responseJson.message)
                        
                        setTimeout(() => {
                            this.moveToPreviousScreen();
                        }, 300);  
                    } else {

                        // setTimeout(function () {
                        this.setLoading(false)
                        this._showToastMessage(responseJson.message)
                        // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                        // ,500});

                    }
                    //console.log('response===' + JSON.stringify(responseJson))
                })
                .catch((error) => {
                    // console.log("error===" + error)
                })
        }
    }

    handleColorName = (text) => {
        this.setState({
            colorName: text
        })
    }

    hanldeColorPoints = (text) => {
        
            this.setState({
                colorPoints: text
            })
    }

    //update color
    _updateBackgroundColor(red, green, blue) {
        this.setState({
            redSliderValue: red,
            greenSliderValue: green,
            blueSliderValue: blue,
            colorPreview: this._rgbToHex(red, green, blue)
        });
    }

    //covert color code into hexacode
    _convertSingleCode = (colorCode) => {
        let hexCode = colorCode.toString(16);

        return (hexCode.length == 1) ? ('0' + hexCode) : hexCode;
    }

    //convert Rdb color code into hexacode
    _rgbToHex = (red, green, blue) => {
        if (isNaN(red) || isNaN(green) || isNaN(blue)) {
            alert('Incorrect RGB Color Code!!!');
            return;
        }
        else {
            return '#' + this._convertSingleCode(red) + this._convertSingleCode(green) + this._convertSingleCode(blue);
        }
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, }} >
                <KeyboardAwareScrollView style={{ flex: 1, }} getTextInputRefs={() => { return [this._textInputRef]; }}>
                    <Loader loading={this.state.loading} />
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <View style={{ flex: 1, }} >
                        {/* intpuView */}
                        <View style={{ flex: 0.18, flexDirection: 'row', margin: 3, }}>
                            <TextInput style={styles.input}
                                underlineColorAndroid="transparent"
                                placeholder="Color Name"
                                placeholderTextColor="black"
                                autoCapitalize="sentences"
                                value={this.state.colorName}
                                ref={(r) => { this._textInputRef = r; }}
                                onChangeText={this.handleColorName} />

                            <TextInput style={styles.input}
                                underlineColorAndroid="transparent"
                                placeholder="Points"
                                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                                maxLength={6}
                                placeholderTextColor="black"
                                autoCapitalize="none"
                                ref={(r) => { this._textInputRef = r; }}
                                value={this.state.colorPoints}
                                onChangeText={this.hanldeColorPoints} />
                        </View>

                        {/* start of sildersection */}
                        <View style={{ flex: 0.2, flexDirection: 'row', marginLeft: 3, marginRight: 3, marginBottom: 3, marginTop: 15 }}>
                            <View style={{ flex: 0.2, }}>
                                <View style={{ flex: 1, marginLeft: 20, marginTop: 3, marginBottom: 3, marginRight: 15, backgroundColor: this.state.colorPreview }}>

                                </View>
                            </View>

                            <View style={{ flex: 0.85 }}>
                                {/* red */}
                                <View style={{ flex: 0.33, flexDirection: 'row', }}>
                                    <Slider
                                        step={1}
                                        minimumValue={0}
                                        maximumValue={255}
                                        minimumTrackTintColor="#2256f4"
                                        //onValueChange={(ChangedValue) => this.setState({ redSliderValue: ChangedValue })}
                                        onValueChange={(ChangedValue) => this._updateBackgroundColor(ChangedValue, this.state.greenSliderValue, this.state.blueSliderValue)}
                                        style={{ width: '72%', alignSelf: 'center', marginStart: 10, marginEnd: 10 }}
                                    />
                                    <Text style={{ alignSelf: 'center', margin: 10 }}>Red</Text>
                                </View>
                                {/* green */}
                                <View style={{ flex: 0.34, flexDirection: 'row', }}>
                                    <Slider
                                        step={1}
                                        minimumValue={0}
                                        maximumValue={255}
                                        minimumTrackTintColor="#2256f4"
                                        //onValueChange={(ChangedValue) => this.setState({ greenSliderValue: ChangedValue })}
                                        onValueChange={(ChangedValue) => this._updateBackgroundColor(this.state.redSliderValue, ChangedValue, this.state.blueSliderValue)}
                                        style={{ width: '72%', alignSelf: 'center', marginStart: 10, marginEnd: 10 }}
                                    />
                                    <Text style={{ alignSelf: 'center' }}>Green</Text>
                                </View>
                                {/* blue */}
                                <View style={{ flex: 0.33, flexDirection: 'row', }}>
                                    <Slider
                                        step={1}
                                        minimumValue={0}
                                        maximumValue={255}
                                        minimumTrackTintColor="#2256f4"
                                        //onValueChange={(ChangedValue) => this.setState({ blueSliderValue: ChangedValue })}
                                        onValueChange={(ChangedValue) => this._updateBackgroundColor(this.state.redSliderValue, this.state.greenSliderValue, ChangedValue)}
                                        style={{ width: '72%', alignSelf: 'center', marginStart: 10, marginEnd: 10 }}
                                    />
                                    <Text style={{ alignSelf: 'center', margin: 10 }}>Blue</Text>
                                </View>
                            </View>

                            {/* End of silderSection */}

                        </View>
                    </View>
                </KeyboardAwareScrollView>
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
    imageView: {
        alignItems: 'center',
        width: 32,
        height: 32
    },
    input: {
        height: 40,
        marginTop: 30,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingStart: 8,
        paddingEnd: 8,
        flex: 0.5
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
});

