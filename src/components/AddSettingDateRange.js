import React from "react";
import {
    TouchableOpacity, Image, Platform, StyleSheet, Text, View, TextInput, ImageBackground, Keyboard,
    DatePickerIOS, DatePickerAndroid, TimePickerAndroid, SafeAreaView
} from 'react-native'
import API_PARAM from '../constants/ApiParms'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager'
import Loader from '../ActivityIndicator/Loader'
import API from '../constants/ApiConstant'
import moment, { parseTwoDigitYear } from 'moment';
import TextMessage from "../constants/TextMessages";
// import Switch from 'react-native-customisable-switch';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import AppConstant from '../constants/AppConstant';
import SegmentedControlTab from 'react-native-segmented-control-tab'
import ComingFrom from "../constants/ComingFrom";

import DatePicker from 'react-native-date-picker'
import SegmentedControl from '@react-native-community/segmented-control';
import Toast, { DURATION } from 'react-native-easy-toast'
var self;
export default class AddSettingDateRange extends React.PureComponent {
    constructor(props) {
        super(props);
        let stateParams = this.props.navigation.state.params
        let dateRangeData = stateParams.dateRangeData
        let { selectedFromDateNeedtoShow, fromdate, selectedToDateNeedToShow, toDate, dateRangeName,
            dateRangeId, fromHours, fromMinutes, toHours, toMinutes } = this._setValuesToDateObject(dateRangeData, stateParams);


        this.state = {
            isFromChoseDate: true,
            isToChoseDate: false,
            fromChoseDate: Platform.OS === 'android' ? selectedFromDateNeedtoShow : fromdate,
            toChoseDate: Platform.OS === 'android' ? selectedToDateNeedToShow : toDate,
            loading: false,
            selectedFromDateNeedtoShow: selectedFromDateNeedtoShow,
            selectedToDateNeedToShow: selectedToDateNeedToShow,
            txtDateRange: dateRangeName,
            dateRangeId: dateRangeId,
            fromDateData: {
                year: this._getCurrentYear(fromdate),
                month: this._getCurrentMonth(fromdate),
                day: this._getCurrentDay(fromdate),
                completeDate: this._getTodaysDate(fromdate),
                hour: fromHours,
                minute: fromMinutes,
                completeTime: this._convertTimeTo12HourFormat(fromHours, fromMinutes)
            },

            toDateData: {
                year: this._getCurrentYear(toDate),
                month: this._getCurrentMonth(toDate),
                day: this._getCurrentDay(toDate),
                completeDate: this._getTodaysDate(toDate),
                hour: toHours,
                minute: toMinutes,
                completeTime: this._convertTimeTo12HourFormat(toHours, toMinutes)
            },

            isShowingQuickPickSection: stateParams.isShowingQuickPickSection != undefined ? stateParams.isShowingQuickPickSection : false,
            comingFrom: stateParams.comingFrom,
            previousActionValue: stateParams.item,
            quickPickSelectedValue: -1,
            selectedFromToIndex: 0

        };

        self = this



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
        if (this.state.isFromChoseDate) {
            // console.log('newDate' + newDate)
            // this.state.fromChoseDate = newDate
            this.setState({
                fromChoseDate: newDate,
                quickPickSelectedValue: -1
            })
        } else {
            // console.log('newDate' + newDate)
            // this.state.toChoseDate = newDate
            this.setState({
                toChoseDate: newDate,
                quickPickSelectedValue: -1
            })
        }

    }

    _setValuesToDateObject(dateRangeData, stateParams) {
        let fromdate = new Date();
        let toDate = new Date();
        let isDateRangeDataUndefined = dateRangeData == undefined
        if (isDateRangeDataUndefined && ComingFrom.FILTER_OPTION == stateParams.comingFrom) {
            let isActionValueEmpty = stateParams.item.actionValue == ''
            fromdate = isActionValueEmpty ? fromdate : new Date(stateParams.item.actionValue[0]);
            toDate = isActionValueEmpty ? toDate : moment.utc(stateParams.item.actionValue[1]);
            if (!isActionValueEmpty) {
                toDate = new Date(toDate.year(), toDate.month(), toDate.date(), toDate.get('hour'), toDate.get('minute'), toDate.get('second'));
            }
        } else {
            fromdate = !isDateRangeDataUndefined ? new Date(dateRangeData.startDate) : fromdate;
            toDate = !isDateRangeDataUndefined ? moment.utc(dateRangeData.endDate) : toDate;
            if (!isDateRangeDataUndefined) {
                toDate = new Date(toDate.year(), toDate.month(), toDate.date(), toDate.get('hour'), toDate.get('minute'), toDate.get('second'));
            }
        }


        let dateRangeName = dateRangeData != undefined ? dateRangeData.name : '';
        let dateRangeId = dateRangeData != undefined ? dateRangeData._id : '';
        let selectedFromDateNeedtoShow = TeacherAssitantManager.getInstance()._getDateFromDateObject(fromdate);
        let selectedToDateNeedToShow = TeacherAssitantManager.getInstance()._getDateFromDateObject(toDate);
        let fromHours = this._getCurrentHour(fromdate);
        let fromMinutes = this._getCurrentMinutes(fromdate);
        let toHours = this._getCurrentHour(toDate);
        let toMinutes = this._getCurrentMinutes(toDate);
        return {
            selectedFromDateNeedtoShow, fromdate, selectedToDateNeedToShow, toDate, dateRangeName, dateRangeId,
            fromHours, fromMinutes, toHours, toMinutes
        };
    }

    setLoading(istrue) {
        this.setState({
            loading: istrue
        })
    }

    moveToPreviousScreen = () => {
        // console.log("props", this.props)
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this._saveDateRange,
            gotoBack: this.moveToPreviousScreen
        })
        // this._addEventListener()
    }

    _saveDateRange = () => {
        var fromMilliseconds = ''
        var toMilliseconds = ''


        var fromDate = this.state.fromChoseDate
        var toDate = this.state.toChoseDate
        if (Platform.OS === 'android') {
            fromDate = this.state.fromDateData
            toDate = this.state.toDateData
        }



        // var fromDate = Platform.OS === 'android' ? new Date(fromDate + " " + ":00" + ":" + ":00" + ":00") : new Date(this.state.fromChoseDate); // some mock date

        // fromDate = Platform.OS === 'android' ? new Date(fromDate + " " + ":00" + ":" + ":00" + ":00") : new Date(this.state.fromChoseDate); // some mock date
        // // fromMilliseconds = fromDate.getTime();
        // fromMilliseconds = fromDate.toISOString();

        // toDate = Platform.OS === 'android' ? new Date(toDate + " " + ':23' + ":" + ':59' + ":59") : new Date(this.state.toChoseDate); // some mock date
        // toMilliseconds = toDate.getTime();
        // toMilliseconds = toDate.toISOString();

        fromDate = Platform.OS === 'android' ? new Date(fromDate.completeDate + " " + fromDate.hour + ":" + fromDate.minute + ":00") : new Date(this.state.fromChoseDate); // some mock date
        //fromMilliseconds = fromDate.getTime();
        fromMilliseconds = fromDate.toISOString();

        toDate = Platform.OS === 'android' ? new Date(toDate.completeDate + " " + toDate.hour + ":" + toDate.minute + ":00") : new Date(this.state.toChoseDate); // some mock date
        //toMilliseconds = toDate.getTime();
        toMilliseconds = toDate.toISOString();


        Keyboard.dismiss
        let comingFrom = this.state.comingFrom
        if (comingFrom == undefined && this.state.txtDateRange.trim() == '') {
            this._showToastMessage('Please fill date range value');
            // TeacherAssitantManager.getInstance().showAlert('Please fill date range value');
        }
        else if (new Date(toMilliseconds).getTime() < new Date(fromMilliseconds).getTime()) {
            this._showToastMessage(TextMessage.TO_DATE_CAN_NOT_BE_SMALLER_THAN_FROM_DATE);
            // TeacherAssitantManager.getInstance().showAlert(TextMessage.TO_DATE_CAN_NOT_BE_SMALLER_THAN_FROM_DATE);
        }
        else {

            let url = ''
            let bodyValue = {}
            let headerRight = this.props.navigation.state.params.headerRight
            this.setLoading(true)
            if (comingFrom != undefined && comingFrom == ComingFrom.FILTER_OPTION) {
                url = API.BASE_URL + API.API_USERS_SETTINGS_FILTERS_BY_USER_ID + TeacherAssitantManager.getInstance().getUserID()

                // console.log("url is ", url)
                bodyValue = {
                    actionId: this.state.previousActionValue.data._id,
                    value: [fromMilliseconds, toMilliseconds]
                }


            } else {



                var userId = TeacherAssitantManager.getInstance().getUserID();

                url = API.BASE_URL + API.API_DATE_RANGES_CREATE_UNIQUE + (headerRight == "Save" ? '' : '/' + this.state.dateRangeId)

                bodyValue = {
                    createdBy: userId,
                    name: this.state.txtDateRange.trim(),
                    startDate: fromMilliseconds,
                    endDate: toMilliseconds,
                }
            }


            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: (headerRight == "Save" ? 'POST' : 'PUT'),
                headers: {},
                body: JSON.stringify(bodyValue)
            })
                .then((responseJson) => {
                    if (responseJson.success) {
                        this.setLoading(false)
                        // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                        this._showToastMessage(responseJson.message)

                        let self = this
                        setTimeout(() => {
                            self.moveToPreviousScreen();
                        }, 300);

                    } else {

                        // setTimeout(function () {
                        this.setLoading(false)
                        // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                        this._showToastMessage(responseJson.message)
                        // ,500});

                    }
                    //console.log('response===' + JSON.stringify(responseJson))

                })
                .catch((error) => {

                    // console.log("error===" + error)
                })

        }

    }


    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: '' + ` ${navigation.state.params.screenTitle}` + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_DATE_RANGE, 0),
            // title: '' + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_DATE_RANGE, 0),
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
            headerRight: () =>
                <TouchableOpacity
                    onPress={() => params.onAdd()}>
                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        {`${navigation.state.params.headerRight}`}
                    </Text>
                </TouchableOpacity>


        }
    }
    _handleDatePicker = (text) => {

        this.openAndroidDatePicker(text)

    }
    async openAndroidDatePicker(text) {
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: new Date()

            });
            if (action !== DatePickerAndroid.dismissedAction) {
                month = month + 1

                if (text == 'from') {
                    //Add date data to state object
                    var dateObject = this.state.fromDateData
                    dateObject.month = month
                    dateObject.year = year
                    dateObject.day = day
                    dateObject.completeDate = month + "/" + day + "/" + year


                    self.setState({
                        fromDateData: dateObject,
                        selectedFromDateNeedtoShow: dateObject.completeDate
                    })
                    // this.setState({
                    //     fromChoseDate: month + "/" + day + "/" + year,

                    // })

                } else {
                    var dateObject = this.state.toDateData
                    dateObject.month = month
                    dateObject.year = year
                    dateObject.day = day
                    dateObject.completeDate = month + "/" + day + "/" + year

                    self.setState({
                        toDateData: dateObject,
                        selectedToDateNeedToShow: dateObject.completeDate
                    })


                }

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
                hour: 0,
                minute: 0,
                is24Hour: false, // Will display '2 PM'
            });
            if (action !== TimePickerAndroid.dismisssedAction) {
                var dateObject = this.state.dateData
                // hour = this._convertHoursToProperFormat(hour)
                minute = this._convertMinutesToProperFormat(minute)
                // // //add initial values to object
                dateObject.hour = hour + ""
                dateObject.minute = minute + ""


                //add final date to object
                dateObject.completeTime = this._convertTimeTo12HourFormat(hour, minute)

                this.setState({
                    dateData: dateObject
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
            minutes = '0' + minutes.toString();
        }
        return minutes;

    }

    _convertTimeTo12HourFormat = (hour, minute) => {
        var timeType = ''
        if (hour >= 12) {
            hour = hour - 12;
            timeType = 'PM';
        }
        else {
            // If the Hour is Not less than equals to 11 then Set the Time format as PM.
            timeType = 'AM';
        }
        return hour + ":" + minute + " " + timeType;

    }


    handleIndexChange = (index) => {
        this.setState({
            quickPickSelectedValue: index,
        });

        switch (index) {
            case 0:
                if (Platform.OS == 'ios') {
                    let date = new Date()
                    this.setState({
                        fromChoseDate: date,
                        toChoseDate: date
                    })
                } else {
                    let date = new Date()
                    let fromHours = this._getCurrentHour(date);
                    let fromMinutes = this._getCurrentMinutes(date);
                    this.setState({
                        fromDateData: this._getDateObjectFromQuickPlayOption(date, fromHours, fromMinutes),
                        selectedFromDateNeedtoShow: TeacherAssitantManager.getInstance()._getDateFromDateObject(date),
                        toDateData: this._getDateObjectFromQuickPlayOption(date, fromHours, fromMinutes),
                        selectedToDateNeedToShow: TeacherAssitantManager.getInstance()._getDateFromDateObject(date)
                    })
                }

                break;
            case 1:
                let todayTimeStamp = + new Date; // Unix timestamp in milliseconds
                let oneDayTimeStamp = 1000 * 60 * 60 * 24; // Milliseconds in a day
                let diff = todayTimeStamp - oneDayTimeStamp;
                let fromDate = new Date(diff);
                // var yesterdayString = yesterdayDate.getFullYear() + '-' + (yesterdayDate.getMonth() + 1) + '-' + yesterdayDate.getDate();
                if (Platform.OS == 'ios') {
                    let date = new Date()
                    this.setState({
                        fromChoseDate: fromDate,
                        toChoseDate: date
                    })
                } else {
                    let date = new Date()
                    let fromHours = this._getCurrentHour(fromDate);
                    let fromMinutes = this._getCurrentMinutes(fromDate);
                    let toHours = this._getCurrentHour(date);
                    let toMinutes = this._getCurrentMinutes(date);
                    this.setState({
                        fromDateData: this._getDateObjectFromQuickPlayOption(fromDate, fromHours, fromMinutes),
                        selectedFromDateNeedtoShow: TeacherAssitantManager.getInstance()._getDateFromDateObject(fromDate),
                        toDateData: this._getDateObjectFromQuickPlayOption(date, toHours, toMinutes),
                        selectedToDateNeedToShow: TeacherAssitantManager.getInstance()._getDateFromDateObject(date)
                    })

                    // this.setState({
                    //     fromDateData: fromDate,
                    //     selectedFromDateNeedtoShow: fromDate.month() + fromDate.date() + fromDate.year(),
                    //     toDateData: date,
                    //     selectedToDateNeedToShow: date.month() + date.date() + date.year()
                    // })
                }
                break;
            case 2:
                todayTimeStamp = + new Date; // Unix timestamp in milliseconds
                oneDayTimeStamp = 1000 * 60 * 60 * 24 * 7; // Milliseconds in a day
                diff = todayTimeStamp - oneDayTimeStamp;
                fromDate = new Date(diff);
                if (Platform.OS == 'ios') {
                    let date = new Date()
                    this.setState({
                        fromChoseDate: fromDate,
                        toChoseDate: date
                    })
                } else {
                    let date = new Date()
                    let fromHours = this._getCurrentHour(fromDate);
                    let fromMinutes = this._getCurrentMinutes(fromDate);
                    let toHours = this._getCurrentHour(date);
                    let toMinutes = this._getCurrentMinutes(date);


                    this.setState({
                        fromDateData: this._getDateObjectFromQuickPlayOption(fromDate, fromHours, fromMinutes),
                        selectedFromDateNeedtoShow: TeacherAssitantManager.getInstance()._getDateFromDateObject(fromDate),
                        toDateData: this._getDateObjectFromQuickPlayOption(date, toHours, toMinutes),
                        selectedToDateNeedToShow: TeacherAssitantManager.getInstance()._getDateFromDateObject(date)
                    })
                    // this.setState({
                    //     fromDateData: fromDate,
                    //     selectedFromDateNeedtoShow: fromDate.month() + fromDate.date() + fromDate.year(),
                    //     toDateData: date,
                    //     selectedToDateNeedToShow: date.month() + date.date() + date.year()
                    // })
                }
                break;
        }
    }


    _getDateObjectFromQuickPlayOption(date, hours, minutes) {
        return {
            year: this._getCurrentYear(date),
            month: this._getCurrentMonth(date),
            day: this._getCurrentDay(date),
            completeDate: this._getTodaysDate(date),
            hour: hours,
            minute: minutes,
            completeTime: this._convertTimeTo12HourFormat(hours, minutes)
        };
    }
    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} >
                <View style={[styles.container]}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <Loader loading={this.state.loading} />
                    {/* <View style={styles.headerContainer}> */}
                    {this.state.isShowingQuickPickSection ? <View style={[{ padding: 10, marginTop: 10, marginBottom: 20 }]}>
                        <Text style={{ fontSize: 18, color: 'black', marginBottom: 10 }}>Quick Pick:</Text>
                        <SegmentedControlTab
                            values={['Today', 'Yesterday', 'Last Seven Days']}
                            selectedIndex={this.state.quickPickSelectedValue}
                            onTabPress={this.handleIndexChange}
                            styles={
                                { padding: 10 }
                            }
                        />
                    </View> : <TextInput style={styles.pickerInputText}
                        underlineColorAndroid="transparent"
                        placeholder='Name'
                        value={this.state.txtDateRange}
                        onChangeText={(text) => this.setState({ txtDateRange: text })}
                        textAlign={'center'}
                    />
                    }


                    {

                        <SegmentedControl style={{ width: '78%', alignSelf: 'center', height: '6.5%' }}
                            values={['From', 'To']}
                            selectedIndex={this.state.selectedFromToIndex}
                            // selectedIndex={0}
                            onChange={this._segmentControlOnChangeAction}
                        />
                    }
                    {

                        <View style={styles.container}>
                            <DatePicker
                                style={{ marginLeft: Platform.OS == "ios" ? 30 : 0 }}
                                mode={"date"}
                                date={this.state.isFromChoseDate ? new Date(this.state.fromChoseDate) : new Date(this.state.toChoseDate)}
                                // maximumDate={chosenDate}
                                onDateChange={(date) => this._setDate(date)}
                            />
                            {/* <DatePickerIOS
                                date={this.state.isFromChoseDate ? this.state.fromChoseDate : this.state.toChoseDate}
                                mode="date"
                                onDateChange={(date) => this._setDate(date)}
                            /> */}
                        </View>
                    }


                </View>
            </SafeAreaView>
        )
    }


    _segmentControlOnChangeAction = (event) => {
        if (event.nativeEvent.selectedSegmentIndex == 0) {
            this.setState({
                isFromChoseDate: true,
                isToChoseDate: false,
                selectedFromToIndex: event.nativeEvent.selectedSegmentIndex
            })
            // this.isFromChoseDate = true
            // this.isToChoseDate = false
        } else {
            this.setState({
                isFromChoseDate: false,
                isToChoseDate: true,
                selectedFromToIndex: event.nativeEvent.selectedSegmentIndex
            })
            // this.isFromChoseDate = false
            // this.isToChoseDate = true
        }
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

