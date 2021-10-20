import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    ImageBackground, SafeAreaView
} from 'react-native'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import DatePicker from 'react-native-date-picker'
export default class AddDateTime extends React.PureComponent {
    constructor(props) {
        super(props);
        var previousActionValue = this.props.navigation.state.params.item
        var today = previousActionValue.actionValue != '' ? new Date(previousActionValue.actionValue) : new Date();
        var hours = this._getCurrentHour(today)
        var minutes = this._getCurrentMinutes(today)
        this.state = {
            chosenDate: today,
            actionFieldData: previousActionValue.data,
            isForceRender: false,
            mode: "datetime",
            isShowing: Platform.OS === "ios",
            dateData: {
                year: this._getCurrentYear(today),
                month: this._getCurrentMonth(today),
                day: this._getCurrentDay(today),
                completeDate: this._getTodaysDate(today),
                hour: hours,
                minute: minutes,
                completeTime: this._convertTimeTo12HourFormat(hours, minutes)
            }
        };
    }
    _getCurrentYear = (today) => {
        return today.getFullYear();
    }
    _getCurrentMonth = (today) => {
        return parseInt(today.getMonth() + 1)
    }
    _getCurrentDay = (today) => {
        return today.getDate()
    }
    _getTodaysDate = (today) => {
        return parseInt(today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear()
    }
    _getCurrentHour = (today) => {
        return (today.getHours());
    }
    _getCurrentMinutes = (today) => {
        return this._convertMinutesToProperFormat(today.getMinutes());
    }


    _setDate = (newDate) => {
        // console.log('newDate' + newDate)
        this.setState({ chosenDate: newDate })
    }

    moveToPreviousScreen = () => {
        // console.log("props", this.props)
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.saveActions,
            gotoBack: this.moveToPreviousScreen
        })
        // this._addEventListener()
    }
    convertDateToMilliSeconds() {
        var milliseconds = ''
        var dateObject = this.state.dateData;
        var date = new Date(dateObject.completeDate + " " + dateObject.hour + ":" + dateObject.minute + ":00")// some mock date
        milliseconds = date.getTime();
        return milliseconds;
    }

    saveActions = () => {


        // var milliseconds = ''

        // var dateObject = this.state.dateData;

        // var date = Platform.OS === 'android' ? new Date(dateObject.completeDate + " " + dateObject.hour + ":" + dateObject.minute + ":00") : new Date(this.state.chosenDate); // some mock date
        // milliseconds = date.getTime();

        // console.log("miliseconds" + milliseconds)
        var isoDateString = ''

        var dateObject = this.state.dateData;

        var chooseDate = this.state.chosenDate
        var date = new Date(chooseDate)
        isoDateString = date.toISOString();

        // console.log("miliseconds" + isoDateString)


        //  console.log(this.state.chosenDate)

        //   var date = this.state.chosenDate
        if (isoDateString != '') {
            //  var timestamp = moment.utc(date).format()
            var item = {
                _id: this.state.actionFieldData._id,
                dataType: this.state.actionFieldData.dataType,
                actionValue: isoDateString
            }
            this.props.navigation.state.params.onGoBack(item);
        } else {
            this.props.navigation.state.params.onGoBack();
        }
        this.props.navigation.goBack();

    }

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
            headerRight: () => <TouchableOpacity
                onPress={() => params.onAdd()}>
                <Text style={StyleTeacherApp.headerRightButtonText}>
                    {navigation.state.params.headerRight}
                </Text>
            </TouchableOpacity>


        }
    }
    _handleDatePicker = () => {
        this.openAndroidDatePicker()
    }
    async openAndroidDatePicker() {
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: new Date(this.convertDateToMilliSeconds)

            });
            if (action !== "dismissedAction") {
                month = month + 1
                //Add date data to state object
                var dateObject = this.state.dateData
                dateObject.month = month
                dateObject.year = year
                dateObject.day = day
                dateObject.completeDate = month + "/" + day + "/" + year

                this.setState({
                    dateData: dateObject,
                    isForceRender: !this.state.isForceRender
                })


            }
        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }
    }
    _handleTimePicker = () => {
        this.openAndroidTimePicker()

    }
    async openAndroidTimePicker() {
        try {
            const { action, hour, minute } = await TimePickerAndroid.open({
                hour: this.state.dateData.hour,
                minute: this.state.dateData.minute,
                is24Hour: false, // Will display '2 PM'
            });
            if (action !== "dismissedAction") {
                var dateObject = this.state.dateData
                // hour = this._convertHoursToProperFormat(hour)
                minute = this._convertMinutesToProperFormat(minute)

                // if (hour == 0) {
                //     hour = 12;
                // }
                // // //add initial values to object
                dateObject.hour = hour
                dateObject.minute = minute


                //add final date to object
                dateObject.completeTime = this._convertTimeTo12HourFormat(hour, minute)

                this.setState({
                    dateData: dateObject,
                    isForceRender: !this.state.isForceRender
                })


            }


        } catch ({ code, message }) {
            console.warn('Cannot open time picker', message);
        }
    }
    _convertHoursToProperFormat = (hour) => {
        // IF current hour is grater than 12 then minus 12 from current hour to make it in 12 Hours Format.
        if (hour > 12) {
            hour = hour - 12;
        }

        // If hour value is 0 then by default set its value to 12, because 24 means 0 in 24 hours time format. 
        if (hour == 0) {
            hour = 12;
        }
        return hour;
    }

    _convertMinutesToProperFormat = (minutes) => {
        if (minutes < 10) {
            minutes = 0 + minutes;
        }
        return minutes;

    }

    _convertTimeTo12HourFormat = (hour, minute) => {
        var timeType = ''

        if (hour >= 12) {

            hour = hour > 12 ? hour - 12 : hour;
            timeType = 'PM';
        }
        else {
            // If the Hour is Not less than equals to 11 then Set the Time format as PM.
            timeType = 'AM';
        }
        if (hour == 0) {
            hour = 12;
        }
        if (hour < 9) {
            hour = '0' + hour
        }
        if (minute < 9) {
            minute = '0' + minute
        }
        return hour + ":" + minute + " " + timeType;

    }




    render() {
        const { isShowing, chosenDate, mode } = this.state
        return (
            <SafeAreaView style={styles.container}>
                <View style={Platform.OS === 'android' ? styles.containerForAndroid : styles.container}>


                    <DatePicker
                        style={{ marginLeft: Platform.OS == "ios" ? 30 : 0 }}
                        mode={"datetime"}
                        date={chosenDate}
                        // maximumDate={chosenDate}
                        onDateChange={(date) => this._setDate(date)}
                    />
                </View>
            </SafeAreaView>

        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    containerForAndroid: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
})

