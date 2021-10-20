
import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    FlatList, UIManager, LayoutAnimation, SafeAreaView, Dimensions
} from 'react-native'
import ActionSheet from 'react-native-actionsheet'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import API from '../constants/ApiConstant'
import API_PARAM from '../constants/ApiParms'
import Terminology from '../constants/Terminology'
import moment from 'moment';
import { EventRegister } from 'react-native-event-listeners'
import update from 'react-addons-update'
import SocketConstant from '../constants/SocketConstant'
import Loader from '../ActivityIndicator/Loader';
import ComingFrom from '../constants/ComingFrom'
import AppConstant from '../constants/AppConstant'
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
// import Dimensions from 'Dimensions';
import Toast, { DURATION } from 'react-native-easy-toast'
import Subscription from '../ActivityIndicator/Subscription'
export default class StudentActions extends React.PureComponent {

    constructor(props) {
        super(props)
        var stateParm = this.props.navigation.state.params
        var lblQuickJumpButton = this._setLblQuickJumButtonText(stateParm.settingsData);
        this.state = {
            studentData: JSON.parse(JSON.stringify(stateParm.item)),
            listData: [],
            isEditMode: false,
            actionListSelectedToDelete: [],
            selectedDate: 'All Dates',
            actionCount: 0,
            isApiHit: false,
            loading: false,
            animatedStyle: styles.rowTextContainter,
            isFetchingFromServer: false,
            page: 1,
            settingsData: stateParm.settingsData,
            lblQuickJumpButton: lblQuickJumpButton,
            // isShowThumbnailImages: false,
            isComingFromSharedScreen: stateParm.isComingFromSharedScreen,
            ShareDetailOptionMessage: '',
            isShareDetailActionSheet: false,
            shareDetailActionSheetIndex: 0,
            isAcendingOrder: false,
            totalPointValue: 0,
            isShowingSubscription: false
            // totalStudentCount: stateParm.totalStudentCount

        }

        // this._getListOfActions(true)
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.moveToNextScreen,
            gotoBack: this.moveToPreviousScreen,
            cancelShareAction: this._cancelShareAction,
            continueShareAction: this._continueShareAction
        })
        this._refreshScreen(true)
        // this._sub = this.props.navigation.addListener(
        //     'didFocus',
        //     this._refreshScreen
        // );
    }

    componentWillUnmount() {
        // if (this._sub)
        //     this._sub.remove();
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var title = params.title
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: `${title}`,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: () =>
                params.isheaderRightShow ?
                    <TouchableOpacity onPress={() => params.gotoBack()}>
                        <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.width60Per,
                        StyleTeacherApp.marginLeft14]}>

                            <Image
                                style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
                                source={require("../img/back_arrow_ios.png")} />
                            <Text style={[StyleTeacherApp.headerLeftButtonText]} numberOfLines={1}>{
                                TeacherAssitantManager.getInstance()._setnavigationleftButtonText(params.leftHeader)}</Text>
                        </View>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => params.cancelShareAction()}>
                        <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.width60Per,
                        StyleTeacherApp.marginLeft14]}>

                            <Image
                                style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
                                source={require("../img/back_arrow_ios.png")} />
                            <Text style={[StyleTeacherApp.headerLeftButtonText]} numberOfLines={1}>{
                                'Cancel'}</Text>
                        </View>
                    </TouchableOpacity>
            ,
            headerRight: () =>
                // !params.isComingFromSharedScreen ?
                params.isheaderRightShow ?
                    <TouchableOpacity
                        onPress={() => params.onAdd()}>
                        <Image style={StyleTeacherApp.rightImageViewHeader}
                            source={require('../img/icon_add.png')}>
                        </Image>



                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                        onPress={() => params.continueShareAction()}>
                        <Text style={StyleTeacherApp.headerRightButtonText}>
                            Continue
                        </Text>
                    </TouchableOpacity>
        }
    }


    render() {
        const { listData, lblQuickJumpButton } = this.state
        let image = this.state.studentData.image
        let isShowingImage = image != undefined && image.uri != undefined && this.state.settingsData.studentThumbnailImages
        let isShareDetailActionSheet = this.state.isShareDetailActionSheet
        let count = this.state.actionCount
        let lblAction = ''
        let isActionCountGreaterThan0 = count > 0
        if (count == 0) {
            if (!this.state.isApiHit) {
                lblAction = 'Loading...'
            } else {
                lblAction = '  Add Action To Get Started'
            }
        } else {
            lblAction = (TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, count)
                + AppConstant.COLLON + count)

        }

        return (
            <SafeAreaView style={styles.container} >
                <View style={styles.container}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <Loader loading={this.state.loading} />
                    <ActionSheet
                        ref={o => this.EditActionSheet = o}
                        title={AppConstant.APP_NAME}
                        options={['Actions', 'Student Details', 'Cancel']}
                        cancelButtonIndex={2}
                        onPress={(index) => { this._handleActionSheetIndex(index) }}
                    />

                    <ActionSheet
                        ref={o => this.ShareActionSheet = o}
                        title={AppConstant.APP_NAME}
                        options={['Email', 'Message', 'Phone Numbers', 'Cancel']}
                        cancelButtonIndex={3}
                        onPress={(index) => { this._handleShareActionSheetIndex(index) }}
                    />

                    <ActionSheet
                        ref={o => this.ShareDetailActionSheet = o}
                        title={AppConstant.APP_NAME}
                        options={['Blank ' + this.state.ShareDetailOptionMessage, 'Choose Action', 'Cancel']}
                        cancelButtonIndex={2}
                        onPress={(index) => { this._handleShareDetailActionSheetIndex(index) }}
                    />
                    {
                        this.state.isShowingSubscription && <Subscription
                            onPressBackBtn={() => {
                                this.setState({
                                    isShowingSubscription: false
                                })
                            }}
                        />
                    }

                    {
                        isShowingImage ?
                            <View style={styles.profilePicContainerCenter}>
                                <Image
                                    style={styles.profilePicImage}
                                    source={image}
                                />
                            </View>
                            : null
                    }
                    <View style={[isActionCountGreaterThan0 ? styles.headerContainer : styles.headerContainerCenter, { marginTop: 5 }]}>
                        {
                            isActionCountGreaterThan0 ?
                                <View style={{ width: '100%', flexDirection: "row" }}>
                                    <Text style={[styles.addactionsStyle]}>
                                        {lblAction}
                                    </Text>

                                    <Text style={[styles.addactionsStyle, { position: 'absolute', end: 10 }]}>
                                        {this.state.settingsData.showPointValues ? 'Point Value: ' + this.state.totalPointValue : ''}
                                    </Text>
                                </View>
                                : <Text style={[styles.addactionsStyle]}>
                                    {lblAction}
                                </Text>
                        }
                        {
                            isActionCountGreaterThan0 ?
                                <Text style={[styles.datesStyle]}>
                                    {this.state.selectedDate}
                                </Text> : null
                        }





                    </View>

                    <View style={styles.listContainer}>
                        <FlatList
                            style={styles.list}
                            data={this.state.listData}
                            extraData={this.state.listData}
                            renderItem={this._renderItem}
                            keyExtractor={(item, index) => `${index}`}
                            ItemSeparatorComponent={(sectionId, rowId) => (
                                <View key={rowId} style={styles.separator} />
                            )}
                            onEndReachedThreshold={0.8}
                            // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(listData)}
                            onEndReached={this.loadMoreStudentActions}
                            ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                        />
                    </View>
                    <View style={styles.bottomViewSeprator}
                    />
                    <View style={styles.bottomOuterView}>
                        <View style={styles.bottomInnerView}>
                            <TouchableOpacity
                                onPress={() => isShareDetailActionSheet ? this._selectUnselectAllAction(true) : this.gotoQuickJumpScreen()}>
                                <Text style={styles.text}>{isShareDetailActionSheet ? 'Select All ' : lblQuickJumpButton}</Text>
                            </TouchableOpacity>
                            {isShareDetailActionSheet ?
                                <TouchableOpacity onPress={() => this._selectUnselectAllAction(false)}>
                                    <Text style={styles.text}>Select None</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => this._handleEditClick()}>
                                    <Text style={styles.text}>{this.state.isEditMode ? 'Done' : 'Edit'}</Text>
                                </TouchableOpacity>
                            }
                            {
                                !isShareDetailActionSheet ?
                                    !this.state.isEditMode ?
                                        <TouchableOpacity style={{ alignItems: 'center' }}
                                            onPress={this._onPressSorting}>
                                            <Image style={styles.imageView}
                                                source={require("../img/sorting.png")} />
                                        </TouchableOpacity> : null
                                    : null

                            }

                            {
                                !isShareDetailActionSheet ?
                                    !this.state.isEditMode ?
                                        <TouchableOpacity style={{ alignItems: 'center' }}
                                            onPress={() => this._onPressShare()}
                                        >
                                            <Image style={styles.imageView}
                                                source={require("../img/print.png")} />
                                        </TouchableOpacity> : null
                                    : null
                            }
                            {
                                this.state.isEditMode ?
                                    <TouchableOpacity
                                        onPress={() => this._onDeleteStudentAction()}>
                                        <Text style={styles.text}>Delete</Text>
                                    </TouchableOpacity> : null
                            }

                            {
                                isShareDetailActionSheet ?
                                    <TouchableOpacity
                                        onPress={() => this._onPressMostRecent()}>
                                        <Text style={styles.text}>Most Recent</Text>
                                    </TouchableOpacity> : null
                            }

                        </View>
                    </View>
                </View>
            </SafeAreaView>


        )
    }

    _renderItem = ({ item, index }) => {
        var data = item.data
        return (

            <TouchableOpacity style={styles.rowContainer}
                onPress={() => this._handleRowClick(item, index)}>
                {
                    this.state.isEditMode || this.state.isShareDetailActionSheet ?
                        <View style={styles.iconImageContainer}>
                            {
                                item.deleteVisibility ?
                                    <Image style={styles.iconImage}
                                        name="search"
                                        source={require("../img/check_icon.png")} />
                                    : null
                            }
                        </View>
                        : null
                }
                <View style={this.state.animatedStyle}>
                    <Text numberOfLines={1} style={styles.colorPickerDataTypeAction}>
                        {data.pickerValue}
                    </Text>
                    <Text numberOfLines={1} style={styles.textDataTypeAction}>
                        {data.longText}
                    </Text>
                    <View style={styles.actionColorPreviewContainer} >
                        <Text numberOfLines={1} style={{
                            width: this.state.isEditMode || this.state.isShareDetailActionSheet
                                ? '43%' : '48%',
                            alignSelf: "center",
                            fontSize: 13
                        }}>
                            {data.created_Time}
                        </Text>
                        {data.colorList.map((elem, index) => {
                            //console.log('elem elem pagal parminder --> ', JSON.stringify(elem))
                            return (
                                <View key={index}
                                    style={{
                                        backgroundColor: TeacherAssitantManager.getInstance()._rgbToHex(data.colorList[index].red,
                                            data.colorList[index].green, data.colorList[index].blue),
                                        width: 20, height: 20, marginStart: 2,
                                        marginEnd: 2, alignSelf: "center"
                                    }}>
                                </View>
                            )
                        })}
                        {/* {data.colorList.length > 0 ?
                            <View style={{ backgroundColor: TeacherAssitantManager.getInstance()._rgbToHex(data.colorList[0].red, data.colorList[0].green, data.colorList[0].blue), width: 20, height: 20, marginStart: 2, marginEnd: 2, alignSelf: "center" }}>
                            </View>
                            : null}
                        {data.colorList.length > 1 ?
                            <View style={{ backgroundColor: TeacherAssitantManager.getInstance()._rgbToHex(data.colorList[1].red, data.colorList[1].green, data.colorList[1].blue), width: 20, height: 20, marginStart: 2, marginEnd: 2, alignSelf: "center" }}>
                            </View>
                            : null}
                        {data.colorList.length > 2 ?
                            <View style={{ backgroundColor: TeacherAssitantManager.getInstance()._rgbToHex(data.colorList[2].red, data.colorList[2].green, data.colorList[2].blue), width: 20, height: 20, marginStart: 2, marginEnd: 2, alignSelf: "center" }}>
                            </View>
                            : null}
                        {data.colorList.length > 3 ?
                            <View style={{ backgroundColor: TeacherAssitantManager.getInstance()._rgbToHex(data.colorList[3].red, data.colorList[3].green, data.colorList[3].blue), width: 20, height: 20, marginStart: 2, marginEnd: 2, alignSelf: "center" }}>
                            </View>
                            : null}
                        {data.colorList.length > 4 ?
                            <View style={{ backgroundColor: TeacherAssitantManager.getInstance()._rgbToHex(data.colorList[4].red, data.colorList[4].green, data.colorList[4].blue), width: 20, height: 20, marginStart: 2, marginEnd: 2, alignSelf: "center" }}>
                            </View>
                            : null}
                        {data.colorList.length > 5 ?
                            <View style={{ backgroundColor: TeacherAssitantManager.getInstance()._rgbToHex(data.colorList[5].red, data.colorList[5].green, data.colorList[5].blue), width: 20, height: 20, marginStart: 2, marginEnd: 2, alignSelf: "center" }}>
                            </View>
                            : null}
                        {data.colorList.length > 6 ?
                            <View style={{ backgroundColor: TeacherAssitantManager.getInstance()._rgbToHex(data.colorList[6].red, data.colorList[6].green, data.colorList[6].blue), width: 20, height: 20, marginStart: 2, marginEnd: 2, alignSelf: "center" }}>
                            </View>
                            : null} */}
                    </View>

                </View>

                <View style={styles.iconImageContainer}>
                    {
                        // item.selectionVisibilty ?
                        <Image style={styles.iconImage}
                            name="search"
                            source={require("../img/icon_arrow.png")} />
                        // : null
                    }
                </View>
            </TouchableOpacity>



        );
    };

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    _getListOfActions = (isFirstTime = false, isFromSorting = false) => {
        //var userId = TeacherAssitantManager.getInstance().getUserID()
        //'/studentsactions/students/:studentId/createdby/:createdBy/pagination/:page/:limit'
        //'/studentsactions/userid/:userId/students/:studentId/pagination/:page/:limit'
        var url = (API.BASE_URL + API.API_STUDENT_ACTION_ASSIGN + API.API_USER_ID + this.state.studentData.createdBy + "/" + API.API_STUDENTS + "/" +
            this.state.studentData._id + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT)
        if (this.state.isAcendingOrder) {
            url += '?order=1'
        }
        //console.log("url is ", url)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: 'GET',
            headers: {
                // Accept: 'application/json',
                // 'Content-Type': 'application/json',
                // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                // 'userId': TeacherAssitantManager.getInstance().getUserID(),
            }
        }).then((responseJson) => {
            // //console.log(responseJson.message);
            //this.state.listData = responseJson;
            if (responseJson.success) {

                var newArray = [...this.state.listData]
                if (isFromSorting) {
                    newArray = []
                }
                var data = responseJson.data
                //console.log('response===' + JSON.stringify(responseJson))
                var studentActions = responseJson.data.studentActions
                var studentActionsData = data.studentActionsData

                var listObject = {}
                var listFinalObject = {}
                var actionList = []
                var actionId = ''
                let totalPointValue = 0
                for (var i = 0; i < studentActionsData.length; i++) {
                    var studentActionObject = studentActionsData[i]
                    var action = studentActionObject.studentActionDetails
                    actionId = studentActionObject._id
                    listObject = this._createJsonObjectForList(action)
                    totalPointValue += listObject.totalPointValue
                    listFinalObject = {
                        actionFieldID: actionId,
                        data: listObject,
                        completeList: action,
                        deleteVisibility: false,
                        sortDate: listObject.sortDate,
                    }

                    actionList.push(listFinalObject)

                }


                this.setState({
                    listData: [...newArray, ...actionList],
                    actionCount: data.count,
                    page: this.state.page + 1,
                    isApiHit: true,
                    isFetchingFromServer: false,
                    selectedDate: this.state.settingsData.selectedDateRange == null ? "All Dates" : this.state.settingsData.selectedDateRange.name,
                    totalPointValue: totalPointValue
                })

                if (isFirstTime) {
                    this._addEventListener()
                }

            } else {
                this._showToastMessage(responseJson.message)
                this.setState({
                    isApiHit: true
                })
            }
        }).catch((error) => {
            console.error(error);
        });
    }


    _createJsonObjectForActionReport = (list, isFromChooseActionToShare = false) => {
        //console.log("data", list.length)
        var pickerValue = ''
        var longText = ''
        var created = ''
        var studentActionID = ''
        var colorList = []
        var sortDate = new Date()
        let totalPointValue = 0

        let entityData = {}

        for (var i = 0; i < list.length; i++) {
            var data = list[i]
            let actionFieldID = data.actionFieldID
            // if (data.actionFieldID.uiTypeStatus == true && data.actionFieldID.defaultTypeStatus == true) {
            switch (data.actionFieldID.dataType.toLowerCase()) {
                case API_PARAM.ACTION_DATE:
                    // var date = new Date(parseInt(data.value));
                    var date = new Date(data.value);
                    sortDate = new Date(data.value)
                    created = TeacherAssitantManager.getInstance()._changeDateFormat(date)

                    entityData[`${actionFieldID.default}`] = TeacherAssitantManager.getInstance()._changeDateFormat(date)
                    break;

                case API_PARAM.ACTION_PICKER:
                    let actionPickerValue = entityData[`${actionFieldID.default}`] || ""
                    let actionFieldPickerID = data.actionFieldPickerID
                    entityData[`${actionFieldID.default}`] = actionPickerValue == "" ? actionFieldPickerID.value : `${actionPickerValue},${actionFieldPickerID.value}`
                    break;

                case API_PARAM.ACTION_TEXT:
                    longText = data.value
                    entityData[`${actionFieldID.default}`] = data.value
                    break;

                case API_PARAM.ACTION_IMAGE:
                    actionPickerValue = entityData[`${actionFieldID.default}`] || ""
                    entityData[`${actionFieldID.default}`] = actionPickerValue == "" ? `${API.S3_URL}${data.value}` : `${actionPickerValue},${API.S3_URL}${data.value}`

                    break;

                case API_PARAM.ACTION_BOOLEAN:
                    entityData[`${actionFieldID.default}`] = data.value
                    break;

                case API_PARAM.ACTION_COLORPICKER:
                    var actionPickerObject = data.actionFieldPickerID
                    if (actionPickerObject != null) {
                        var colorObject = actionPickerObject.colorLabelID
                        if (colorObject != null) {
                            var _colorObject = {
                                blue: colorObject.blue,
                                green: colorObject.green,
                                red: colorObject.red,
                            }
                            pickerValue = (pickerValue.trim() == '' ? actionPickerObject.value :
                                pickerValue + ', ' + actionPickerObject.value)

                            entityData[`${actionFieldID.default}`] = pickerValue
                            totalPointValue += colorObject.point
                            entityData[`TotalPointValue`] = totalPointValue

                            if (!isFromChooseActionToShare) {
                                colorList.push(_colorObject)
                            }
                        }
                    }

                    break;
                case API_PARAM.ACTION_COLOR_LABEL_PICKER:
                    var actionPickerObject = data.colorLabelID
                    if (actionPickerObject != null) {
                        if (actionPickerObject != null) {
                            var colorObject = {
                                blue: actionPickerObject.blue,
                                green: actionPickerObject.green,
                                red: actionPickerObject.red,
                            }
                            pickerValue = (pickerValue.trim() == '' ? actionPickerObject.name :
                                pickerValue + ', ' + actionPickerObject.name)
                            entityData[`${actionFieldID.default}`] = pickerValue
                            totalPointValue += colorObject.point
                            entityData[`TotalPointValue`] = totalPointValue
                            if (!isFromChooseActionToShare) {
                                colorList.push(actionPickerObject)
                            }
                        }
                    }

                    break;
            }

            // }
            studentActionID = data.studentActionID
        }

        // entityData.SortDate = sortDate.getTime()
        return entityData

        // return {
        //     longText: longText,
        //     pickerValue: pickerValue,
        //     created_Time: created,
        //     colorList: colorList,
        //     studentActionID: studentActionID,
        //     sortDate: sortDate.getTime(),
        //     totalPointValue: totalPointValue
        // }
    }
    _createJsonObjectForList = (list, isFromChooseActionToShare = false) => {
        //console.log("data", list.length)
        var pickerValue = ''
        var longText = ''
        var created = ''
        var studentActionID = ''
        var colorList = []
        var sortDate = new Date()
        let totalPointValue = 0
        for (var i = 0; i < list.length; i++) {
            var data = list[i]
            if (data.actionFieldID.uiTypeStatus == true && data.actionFieldID.defaultTypeStatus == true) {
                switch (data.actionFieldID.dataType.toLowerCase()) {
                    case API_PARAM.ACTION_DATE:
                        // var date = new Date(parseInt(data.value));
                        var date = new Date(data.value);
                        sortDate = new Date(data.value)
                        created = TeacherAssitantManager.getInstance()._changeDateFormat(date)
                        break;

                    case API_PARAM.ACTION_PICKER:

                        break;

                    case API_PARAM.ACTION_TEXT:
                        longText = data.value
                        break;

                    case API_PARAM.ACTION_IMAGE:
                        break;

                    case API_PARAM.ACTION_BOOLEAN:
                        break;

                    case API_PARAM.ACTION_COLORPICKER:
                        var actionPickerObject = data.actionFieldPickerID
                        if (actionPickerObject != null) {
                            var colorObject = actionPickerObject.colorLabelID
                            if (colorObject != null) {
                                var _colorObject = {
                                    blue: colorObject.blue,
                                    green: colorObject.green,
                                    red: colorObject.red,
                                }
                                pickerValue = (pickerValue.trim() == '' ? actionPickerObject.value :
                                    pickerValue + ', ' + actionPickerObject.value)
                                totalPointValue += colorObject.point
                                if (!isFromChooseActionToShare) {
                                    colorList.push(_colorObject)
                                }
                            }
                        }

                        break;
                    case API_PARAM.ACTION_COLOR_LABEL_PICKER:
                        var actionPickerObject = data.colorLabelID
                        if (actionPickerObject != null) {
                            if (actionPickerObject != null) {
                                var colorObject = {
                                    blue: actionPickerObject.blue,
                                    green: actionPickerObject.green,
                                    red: actionPickerObject.red,
                                }
                                pickerValue = (pickerValue.trim() == '' ? actionPickerObject.name :
                                    pickerValue + ', ' + actionPickerObject.name)
                                totalPointValue += actionPickerObject.point
                                if (!isFromChooseActionToShare) {
                                    colorList.push(actionPickerObject)
                                }
                            }
                        }

                        break;
                }

            }
            studentActionID = data.studentActionID
        }


        return {
            longText: longText,
            pickerValue: pickerValue,
            created_Time: created,
            colorList: colorList,
            studentActionID: studentActionID,
            sortDate: sortDate.getTime(),
            totalPointValue: totalPointValue
        }
    }
    __getStudentActionsForPicker(data) {
        return data.value
    }

    _getStudentActionsForTextAndBoolean(data) {
        return {
            _id: data._id,
            studentActionID: data.studentActionID,
            dataType: data.actionFieldID.dataType,
            actionFieldID: data.actionFieldID,
            value: data.value,
            created: data.created
        };
    }

    _sortActionList(actionList) {
        actionList.sort(function (a, b) {
            return a.sortDate < b.sortDate
        });
        return actionList;
    }


    _removeEventListener() {
        EventRegister.removeEventListener(this.addStudentActionListener)
        EventRegister.removeEventListener(this.removeActionFieldListener)
        EventRegister.removeEventListener(this.updateActionFieldListener)
        EventRegister.removeEventListener(this.updateStudentListener)
        EventRegister.removeEventListener(this.updateUserSetting)
        EventRegister.removeEventListener(this.updateStudentPointValueListener)
        EventRegister.removeEventListener(this.removeColorLabelListener)
        EventRegister.removeEventListener(this.updateColorLabelListener)
    }

    // event listener for socket
    _addEventListener = () => {
        this.addStudentActionListener = EventRegister.addEventListener(SocketConstant.ON_ADD_STUDENT_ACTION, (data) => {
            //console.log("addStudentActionListener" + JSON.stringify(data))
            this._addDataToStudentAction(data)
        })

        this.removeActionFieldListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_STUDENT_ACTION_BULK, (data) => {
            //console.log('removeActionFieldListener');
            this._removeStudentAction(data)
        })

        this.updateActionFieldListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT_ACTION, (data) => {
            //console.log('updateActionFieldListener');
            //console.log("update Socket data" + JSON.stringify(data))
            this._updateStudentAction(data)
        })

        //student Deatils
        this.updateStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT, (data) => {
            //console.log('UpdateStudentListener');
            this._updateStudentData(data)
        })


        //setting function
        this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
            //console.log("addStudentListener", data)
            this._updateUserSetting(data)
        })

        this.updateStudentPointValueListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_POINTS_BULK, (data) => {
            //console.log("addStudentActionListener" + JSON.stringify(data))
            this._updateStudentPointValueListener(data)
        })


        // this.addColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_ADD_COLOR_LABEL, (data) => {
        //     //console.log("addColorLabelListener", data)
        //     this._addDataToColorLabel(data)
        // })

        this.removeColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_COLOR_LABEL_BULK, (data) => {
            //console.log('removeStudentListener');
            this._refreshScreen()
        })

        this.updateColorLabelListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_COLOR_LABEL, (data) => {
            //console.log('UpdateStudentListener');
            this._refreshScreen()
        })

        if (this.state.studentData.createdBy == TeacherAssitantManager.getInstance().getUserID()) {
            this.onSettingsDeleteAllForOwn = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
                //console.log('removeSharedStudentLister');

                this._onSettingsDeleteAllForStudent(data);

            })


        } else {
            this.onSettingsDeleteAllForSharedStudent = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
                //console.log('removeSharedStudentLister');

                this._onSettingsDeleteAllForSharedStudent(data);
            })
        }
    }

    _onSettingsDeleteAllForStudent(data) {
        if (data.Student) {
            this._setstateAndGetListOfAction();
        }
    }

    _onSettingsDeleteAllForSharedStudent(data) {
        if (data.forShared != undefined && data.forShared) {
            this._setstateAndGetListOfAction();
        }
    }


    _updateStudentPointValueListener = (data) => {
        var studentIndex = data.findIndex(studentObject => studentObject._id === this.state.studentData._id);

        // for (let index = 0; index < data.length; index++) {
        //     const element = data[index];
        if (studentIndex > -1) {
            this.setState({
                totalPointValue: data[studentIndex].points
            })


        }
        // }
    }

    //_removeColorLabel
    _removeColorLabel = (colorsIdList) => {

        if (this.state.listData.length > 0) {

            //console.log('_removeColorLabel')
            //console.log(colorsIdList._id)
            var array = [...this.state.listData];

            for (var i = 0; i < colorsIdList._id.length; i++) {
                //console.log('forloop _removeColorLabel')
                //console.log(colorsIdList._id[i])

                var index = array.findIndex(ColorObject => ColorObject.pickerDataId == colorsIdList._id[i]);
                //console.log('index' + index)

                if (index > -1) {
                    array.splice(index, 1);
                }
            }

            this.setState({
                listData: array,
                colorsIdNeedToDelete: [],
            })
        }


    }

    //_updateColorLabel
    _updateColorLabel(color) {

        if (this.state.listData.length > 0) {
            //console.log('_UpdateStudentData');

            //console.log(color);
            var array = this.state.listData

            var index = array.findIndex(colorObject => colorObject.pickerDataId == color._id);
            //console.log('index');
            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(this.state.listData[index]);
                var _color = this.state.listData[index];
                _color.data = color
                const updatedColorLabels = update(this.state.listData, { $splice: [[index, color.data]] });  // array.splice(start, deleteCount, item1)
                this.setState({ listData: updatedColorLabels });

            }
        }

    }

    _updateStudentAction = (data) => {


        var action = data.data
        var actionId = data.studentActionId
        var _listData = [...this.state.listData]
        if (_listData.length > 0) {
            //console.log('_UpdateStudentData');

            var index = _listData.findIndex(actionObject => actionObject.actionFieldID === actionId);

            //console.log(index);
            if (index > -1) {
                listObject = this._createJsonObjectForList(action)

                var listInsideObject = _listData[index];
                listInsideObject.data = listObject
                listInsideObject.completeList = action
                listInsideObject.sortDate = listObject.sortDate
                //this.state.listData[index].

                //const updatedActions = update(this.state.listData, { $splice: [[index, listInsideObject]] });  // array.splice(start, deleteCount, item1)

                this.setState({ listData: this._sortActionList(_listData) });

            }
        }
    }

    _refreshScreen = (isFirstTime = false) => {
        this.setState({
            page: 1,
        }, () => {
            this._getListOfActions(isFirstTime, true);
        });
    }



    _removeStudentAction = (data) => {
        // //console.log("removeActionFieldListener", actionsLIst)

        // this._refreshScreen();
        var actionsLIst = data.data

        if (this.state.listData.length > 0) {

            //console.log('_removeStudentData')
            //console.log(actionsLIst)
            var array = [...this.state.listData];
            let totalPointValue = 0
            for (var i = 0; i < actionsLIst._id.length; i++) {
                //console.log('for studentList')


                var index = array.findIndex(studentObject => studentObject.actionFieldID == actionsLIst._id[i]);
                //console.log('index' + index)

                if (index > -1) {
                    array.splice(index, 1);

                    //calculate total point value
                    for (var itemIndex = 0; itemIndex < array.length; itemIndex++) {
                        let actionItem = array[itemIndex]
                        totalPointValue += actionItem.data.totalPointValue
                    }


                }
            }


            // this.setLoading(false);
            this.setState({
                listData: array,
                actionListSelectedToDelete: [],
                actionCount: array.length,
                totalPointValue: totalPointValue,
                isEditMode: array.length == 0 ? false : true
            })
        }
    }

    _addDataToStudentAction = (data) => {

        //this._refreshScreen();
        let studentActionsList = data.studentActions
        let index = studentActionsList.findIndex(actionObject => actionObject.studentID === this.state.studentData._id);
        if (index > -1) {
            let studentObject = studentActionsList[index]
            let studentActionsDetails = data.studentActionsDetails
            let selectedDateRange = this.state.settingsData.selectedDateRange

            for (var i = 0; i < studentActionsDetails.length; i++) {
                let studentAction = studentActionsDetails[i]
                let dataType = studentAction.actionFieldID.dataType
                if (dataType.toLowerCase() == API_PARAM.ACTION_DATE.toLocaleLowerCase()) {

                    if (selectedDateRange == null) {
                        let action = data.studentActionsDetails;
                        let actionId = studentObject._id

                        //console.log("data", JSON.stringify(action))
                        if (action != undefined && action.length > 0) {
                            listObject = this._createJsonObjectForList(action)
                            listFinalObject = {
                                actionFieldID: actionId,
                                data: listObject,
                                completeList: action,
                                deleteVisibility: false,
                                sortDate: listObject.sortDate
                            }

                            let ActionsList = [...this.state.listData]
                            let indexActionId = ActionsList.findIndex(actionFiendObject => actionFiendObject.actionFieldID === actionId);
                            if (indexActionId == -1) {
                                this.state.listData.push(listFinalObject)
                                var complteList = this.state.listData
                                this._sortActionList(complteList)
                                this.setState({
                                    listData: complteList,
                                    actionCount: complteList.length
                                })
                            }
                        }
                    } else {
                        let studentActionCreatedDate = new Date(studentAction.value).getTime()

                        if (studentActionCreatedDate >= (new Date(selectedDateRange.startDate).getTime()) &&
                            studentActionCreatedDate <= (new Date(selectedDateRange.endDate).getTime())) {
                            let action = data.studentActionsDetails;
                            let actionId = studentObject._id

                            //console.log("data", JSON.stringify(action))
                            if (action != undefined && action.length > 0) {
                                listObject = this._createJsonObjectForList(action)
                                listFinalObject = {
                                    actionFieldID: actionId,
                                    data: listObject,
                                    completeList: action,
                                    deleteVisibility: false,
                                    sortDate: listObject.sortDate
                                }



                                let ActionsList = this.state.listData
                                let indexActionId = ActionsList.findIndex(actionFiendObject => actionFiendObject.actionFieldID === actionId);
                                if (indexActionId == -1) {
                                    this.state.listData.push(listFinalObject)
                                    let complteList = this.state.listData


                                    this.setState({
                                        listData: complteList,
                                        actionCount: complteList.length
                                    })
                                }
                            }
                        }
                    }
                    break;
                }
            }



        }
    }


    _updateStudentData(student) {

        //if (this.state.listData.length > 0) {
        //console.log('_UpdateStudentData');

        //console.log(student);

        if (this.state.studentData._id == student._id) {
            var _student = TeacherAssitantManager.getInstance()._addDisplayNameToStudentData
                (student, this.state.settingsData.studentDisplayOrder, this.state.settingsData.studentSortOrder)
            this.setState({
                studentData: _student
            }, function () {
                this.props.navigation.setParams({                // title: student.firstName + ' ' + student.lastName
                    title: _student.displayName
                });

                this.forceUpdate()
            })

            //console.log(this.state.studentData)

        }
    }


    //_updateUserSetting
    _updateUserSetting = (settingsUserData) => {

        if (settingsUserData.studentDisplayOrder != undefined) {
            var _student = TeacherAssitantManager.getInstance()._addDisplayNameToStudentData
                (this.state.studentData, this.state.settingsData.studentDisplayOrder, this.state.settingsData.studentSortOrder)
            this.props.navigation.setParams({
                title: _student.displayName
            });
        } else if (settingsUserData.selectedDateRange != undefined) {

            this._setstateAndGetListOfAction();

        } else if (settingsUserData.quickJumpButton != undefined) {


            this.setState({
                lblQuickJumpButton: this._setLblQuickJumButtonText(settingsUserData)

            })
            this.forceUpdate()

        } else if (settingsUserData.studentThumbnailImages != undefined) {
            var _settingsData = this.state.settingsData
            _settingsData.studentThumbnailImages = settingsUserData.studentThumbnailImages
            this.setState({
                settingsData: _settingsData,
                // isShowThumbnailImages: settingsUserData.studentThumbnailImages
            })
            this.forceUpdate()
        } else if (settingsUserData.showPointValues != undefined) {
            this.state.settingsData.showPointValue = settingsUserData.showPointValues
            this.setState({
                settingsData: this.state.settingsData
            })
            this.forceUpdate()
        }
    }

    moveToNextScreen = async () => {
        // this._removeEventListener()

        if (await this.showPickerModal()) {
            return
        }

        // let listData = [...this.state.listData]
        // if (listData.length >= 3) {

        //     alert("show the subscription screen")
        //     return
        // }


        this.setState({
            // listData: [],
            isEditMode: false
        })
        const { state, navigate } = this.props.navigation;
        navigate("StudentActionFields", {
            screen: "Add ", onGoBack: this.refreshActionList, headerRight: 'Save', studentId: this.state.studentData._id,
            comingFrom: ComingFrom.STUDENT_ACTIONS, createdBy: TeacherAssitantManager.getInstance().getUserID(),
            leftHeader: BreadCrumbConstant.CANCEL
        })
    }

    // title: student.firstName + ' ' + student.lastName
    _setHeaderTitle = (title) => this.props.navigation.setParams({ title: title });


    refreshActionList = () => {
        this._refreshScreen(true)
    }

    refresh = (istrue, name = "") => {
        // this._setHeaderTitle(title)
        // this._addEventListener()
        if (!istrue) {
            return
        }
        if (istrue && name !== "") {
            this._setHeaderTitle(name)
            return
        }



        // this._removeEventListener()
        // var stateParm = this.props.navigation.state.params
        // var lblQuickJumpButton = this._setLblQuickJumButtonText(stateParm.settingsData);
        // this.props.navigation.setParams({
        //     isheaderRightShow: true
        // });
        // this.setState({
        //     listData: [],
        //     // isEditMode: false,
        //     actionListSelectedToDelete: [],
        //     selectedDate: 'All Dates',
        //     // actionCount: 0,
        //     isApiHit: true,
        //     loading: false,
        //     animatedStyle: styles.rowTextContainter,
        //     isFetchingFromServer: false,
        //     page: 1,
        //     // settingsData: stateParm.settingsData,
        //     lblQuickJumpButton: lblQuickJumpButton,
        //     // isShowThumbnailImages: false,
        //     isComingFromSharedScreen: stateParm.isComingFromSharedScreen,
        //     ShareDetailOptionMessage: '',
        //     isShareDetailActionSheet: false,
        //     //  title: stateParm.title
        // }, ()=> {
        //     this._getListOfActions(true)
        // })

    }

    moveToPreviousScreen = (comingFrom = '') => {
        this._removeEventListener()
        //console.log("props", this.props)
        this.props.navigation.state.params.onGoBack(comingFrom);
        this.props.navigation.goBack();
    }

    _cancelShareAction = () => {
        let listData = [...this.state.listData]
        listData.forEach(element => {
            element.deleteVisibility = false
        });
        this.setState({
            actionListSelectedToDelete: [],
            listData
        }, () => {
            this._handleEditAction(true)
        })

    }

    _continueShareAction = () => {
        if (this.state.actionListSelectedToDelete.length == 0) {
            this._showToastMessage('Nothing to share')
            return
        }
        this._setStudentActionDataAndMoveToNextScreen()


    }


    gotoQuickJumpScreen = () => {
        var quickJumpScreen = ''
        var quickjumpData = {}

        switch (this.state.lblQuickJumpButton) {
            case AppConstant.HOME:
                quickJumpScreen = "HomeScreen"
                quickjumpData = {
                    isfromIntializationDataScreen: false,
                    onGoBack: this.refresh

                }
                this.props.navigation.navigate(quickJumpScreen, quickjumpData);
                break
            case AppConstant.CLASSES:
                quickJumpScreen = "ClassScreen"
                quickjumpData = {
                    isfromIntializationDataScreen: false,
                    onGoBack: this.refresh,
                    comingFrom: ComingFrom.STUDENT_ACTIONS, leftHeader: BreadCrumbConstant.HOME

                }
                this.props.navigation.navigate(quickJumpScreen, quickjumpData);
                break
            case AppConstant.STUDENT:
                this.moveToPreviousScreen(ComingFrom.STUDENT_ACTIONS)
                break
        }



    }

    //it will help to set edit is on off
    _handleEditClick = async () => {
        if (await this.showPickerModal()) {
            return
        }
        if (this.state.isEditMode) {
            this._handleEditAction();
        } else {
            this.EditActionSheet.show();
        }

    }

    //it will help to set edit is on off
    _handleActionSheetIndex = (index) => {
        switch (index) {
            case 0: //Actions
                this._handleEditAction();
                break;
            case 1: //StudentDetail
                this.moveToAddStudentDetailsScreen();
                break;
        }
    }

    // share screen sheet either for email, message or Phone number
    _handleShareActionSheetIndex = (index) => {

        switch (index) {
            case 0: //email
                this.setState({
                    ShareDetailOptionMessage: 'Email'
                }, function () {
                    this.ShareDetailActionSheet.show()
                })
                break;
            case 1: //message
                this.setState({
                    ShareDetailOptionMessage: 'Message'
                }, function () {
                    this.ShareDetailActionSheet.show()
                })
                break
            case 2: //PhoneNumber
                this._setStudentActionDataAndMoveToNextScreen(false);
                break;
        }

    }

    // share detail screen sheet either for blank message or detail message
    _handleShareDetailActionSheetIndex = (index) => {

        switch (index) {
            case 0: //blank email/Message
                this._setStudentActionDataAndMoveToNextScreen(false);
                break;
            case 1: //choose Action
                // this.setState({
                //     isShareDetailActionSheet: true
                // })

                this._handleEditAction(true);
                break;
        }

    }


    _setstateAndGetListOfAction() {
        this.setState({
            page: 1,
            listData: [],
            actionCount: 0,
            isAsyncLoader: true
        }, function () {
            this._getListOfActions();
        });
    }

    _setStudentActionDataAndMoveToNextScreen() {
        var studentActionString = ''
        if (this.state.actionListSelectedToDelete.length > 0) {

            let selectedActionList = [...this.state.actionListSelectedToDelete]

            var listData = [...this.state.listData]

            listData.forEach((element, index) => {

                // find index for selected action 
                let selectedActionIndex = selectedActionList.findIndex((id) => { return id == element.actionFieldID })
                if (selectedActionIndex == -1) {
                    return
                }

                var _element = this._createJsonObjectForActionReport(element.completeList, true)
                if (index > 0) {
                    studentActionString = `${studentActionString}\n`
                }
                let keysList = Object.keys(_element).sort()
                keysList.forEach(element => {
                    studentActionString = studentActionString == '' ?
                        `${element} : ${_element[element]}` :
                        `${studentActionString}\n${element} : ${_element[element]}`

                });
            });
        }
        // var headerRight = ''
        var screenTitle = 'Call'
        var shareDetailOptionMessage = this.state.ShareDetailOptionMessage
        if (shareDetailOptionMessage == 'Email') {
            //headerRight = 'Email'
            screenTitle = 'Choose Address'
        } else if (shareDetailOptionMessage == 'Message') {
            //headerRight = 'Message'
            screenTitle = 'Number'
        }



        this.props.navigation.navigate('ParentDetailScreenForSharingAction', {
            screenTitle: screenTitle,
            headerRight: shareDetailOptionMessage,
            leftHeader: BreadCrumbConstant.CANCEL,
            studentData: this.state.studentData,
            settingsData: this.state.settingsData,
            studentActionString: studentActionString,
            onGoBack: () => this.refresh(),
        });
    }

    //navifgate to AddStudentDetailsScreen for update student detail
    moveToAddStudentDetailsScreen() {
        const { state, navigate } = this.props.navigation;
        var studentData = this.state.studentData;
        navigate("AddStudentDetailsScreen", {
            data: "Update",
            title: "Update Student",
            studentUserId: studentData._id,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            parentName1: studentData.parent1Name,
            parentName2: studentData.parent2Name,
            parentPhone1: studentData.parent1Phone,
            parentPhone2: studentData.parent2Phone,
            parentEmail1: studentData.parent1Email,
            parentEmail2: studentData.parent2Email,
            other1: studentData.other1,
            other2: studentData.other2,
            other3: studentData.other3,
            editMode: true,
            studentCount: 0,
            comingFrom: ComingFrom.STUDENT_ACTIONS,
            parentsList: studentData.parents,
            leftHeader: BreadCrumbConstant.CANCEL,
            studentThumbnailImages: this.state.settingsData.studentThumbnailImages,
            image: studentData.image || "",
            isComingFromSharedScreen: this.state.isComingFromSharedScreen,
            createdBy: studentData.createdBy,
            onGoBack: this.refresh
        });
    }

    //it will help to get we are going to edit student action from action 
    _handleEditAction(isShareDetailActionSheet = false) {
        if (isShareDetailActionSheet) {
            if (!this.state.isShareDetailActionSheet) {
                //this.props.navigation.state.params.isheaderRightShow = false
                this.props.navigation.setParams({
                    isheaderRightShow: false
                });
                this.setState({
                    isShareDetailActionSheet: true
                }, () => {
                    this.collapseElement()
                });

            }
            else {
                this.props.navigation.setParams({
                    isheaderRightShow: true
                });
                this.setState({
                    isShareDetailActionSheet: false
                }, () => {
                    this.expandElement()
                });
            }
        } else {
            if (!this.state.isEditMode) {
                //this.props.navigation.state.params.isheaderRightShow = false
                // this.props.navigation.setParams({
                //     isheaderRightShow: false
                // });
                this.setState({
                    isEditMode: true
                }, function () {
                    this.collapseElement()
                });

            }
            else {
                this.setState({
                    isEditMode: false
                }, function () {
                    this.expandElement()
                });
            }
        }

    }

    _handleRowClick = (item, index) => {
        var createdBy = ''
        if (item.completeList.length > 0)
            createdBy = item.completeList[0].createdBy

        if (this.state.isEditMode || this.state.isShareDetailActionSheet) {
            if (createdBy == TeacherAssitantManager.getInstance().getUserID()) {
                let posts = this.state.listData.slice();
                let targetPost = posts[index];

                if (targetPost.deleteVisibility) {
                    var indexNeedToDelete = this.state.actionListSelectedToDelete.indexOf(targetPost.actionFieldID)
                    this.state.actionListSelectedToDelete.splice(indexNeedToDelete, 1);

                }
                else {
                    this.state.actionListSelectedToDelete.push(targetPost.actionFieldID)

                }
                targetPost.deleteVisibility = !targetPost.deleteVisibility;

                this.setState({ posts });

            }
            else {
                this._showToastMessage("You are not authorized to delete this action")
            }


        }
        else {
            //console.log("item", item)
            this.setState({
                // listData: [],
                isEditMode: false
            })
            const { state, navigate } = this.props.navigation;
            navigate("StudentActionFields", {
                screen: "Add ", onGoBack: this.refresh, headerRight: "Save", studentId: this.state.studentData._id,
                item: item, comingFrom: ComingFrom.STUDENT_ACTIONS, createdBy: createdBy, leftHeader: BreadCrumbConstant.CANCEL
            })

        }
    }
    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }


    _onDeleteStudentAction() {
        if (this.state.actionListSelectedToDelete.length > 0) {
            this.setLoading(true)
            //console.log("delete list", this.state.actionListSelectedToDelete)
            var url = API.BASE_URL + API.API_STUDENT_ACTION_ASSIGN + API.API_SELECTED_BULK_DELETE + API.API_STUDENTS + "/" + this.state.studentData._id
            //console.log("url", url)
            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: 'POST',
                headers: {
                    // Accept: 'application/json',
                    // 'Content-Type': 'application/json',
                    // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    // 'userId': TeacherAssitantManager.getInstance().getUserID(),
                },
                body: JSON.stringify({
                    _id: this.state.actionListSelectedToDelete
                })
            }).then((responseJson) => {
                //console.log('response===' + JSON.stringify(responseJson))
                this._showToastMessage(responseJson.message)
                this.setLoading(false)
                // this.setState({ page: 1, listData: [] }, function () {
                //     this._getListOfActions(true);
                // })
            })
                .catch((error) => {
                    this.setLoading(false)
                    //console.log("error===" + error)
                })
        } else {
            this._showToastMessage('Please select Student actions to delete.')
            // this.showAlert('Please select class to delete.')
        }
    }
    //easeInEaseOut animation Methods
    expandElement = () => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            animatedStyle: styles.rowTextContainter
        })
    }
    collapseElement = () => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            animatedStyle: styles.editRowTextContainter
        })
    }





    _setLblQuickJumButtonText(settingsData) {
        var lblQuickJumpButton = ''
        switch (settingsData.quickJumpButton.toLowerCase()) {
            case AppConstant.ENUM_HOME:
                lblQuickJumpButton = AppConstant.HOME;
                break;
            case AppConstant.ENUM_CLASSES:
                lblQuickJumpButton = AppConstant.CLASSES;
                break;
            case AppConstant.ENUM_STUDENT:
                lblQuickJumpButton = AppConstant.STUDENT;
                break;
        }
        return lblQuickJumpButton;
    }




    loadMoreStudentActions = () => {
        const { listData, actionCount, isFetchingFromServer } = this.state

        if (listData.length < actionCount && !isFetchingFromServer) {

            this.setState({ isFetchingFromServer: true }, function () {
                this._getListOfActions()
                //console.log('loadMoreStudents')
            })


        }
    }


    _onPressShare = async () => {
        if (await this.showPickerModal()) {
            return
        }
        this.ShareActionSheet.show()
    }

    _selectUnselectAllAction = (isSelectAllAction, isMostRecent = false) => {
        var listData = this.state.listData.slice();
        var actionListSelectedToDelete = []
        if (isMostRecent) {

            for (let index = 0; index < listData.length; index++) {
                //let element = listData[index];
                if (this.state.isAcendingOrder && index == listData.length - 1) {
                    listData[listData.length - 1].deleteVisibility = isSelectAllAction;
                } else if (!this.state.isAcendingOrder && index == 0) {
                    listData[0].deleteVisibility = isSelectAllAction;
                } else {
                    listData[index].deleteVisibility = false
                }
            }
        } else {

            listData.forEach(element => {
                element.deleteVisibility = isSelectAllAction
                if (isSelectAllAction) {
                    actionListSelectedToDelete.push(element.actionFieldID)
                }
            });
        }



        this.setState({
            listData: listData,
            actionListSelectedToDelete: actionListSelectedToDelete
        });
    }


    _onPressMostRecent = () => {
        this._selectUnselectAllAction(true, true)
    }


    _onPressSorting = () => {
        this.setState({
            isAcendingOrder: this.state.isAcendingOrder ? false : true,
            page: 1,
        }, function () {
            this._getListOfActions(false, true)
        })
    }

    async showPickerModal() {
        let listData = [...this.state.listData]
        // if (listData.length >= 3) {

        //     alert("show the subscription screen")
        //     return
        // }
        // const { totalStudents } = this.state
        let subscription = await TeacherAssitantManager.getInstance().getUserSubscriptionsDataToLocalDb()
        if (listData.length >= 3 && !subscription) {
            this.setState({ isShowingSubscription: true })
            return true
        }
        if (listData.length >= 3 && subscription && !subscription.is_active) {
            // if (isStudentItemPressed && selectedStudent <= 5) {
            //     return false
            // }
            this.setState({ isShowingSubscription: true })
            return true
        }
        return false
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

    },
    addactionsStyle: {
        marginLeft: 10,
        fontWeight: 'bold',
        fontSize: 18
    },
    list: {
        //  backgroundColor: 'blue',
        //height:0.9: 
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
        height: 32
    },
    rowTextContainter: {
        flex: 1
    },
    editRowTextContainter: { flex: 0.82 },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        // paddingTop: 5,
        // paddingBottom: 5,
        padding: 12,
        backgroundColor: 'white',
    },
    rowText: {
        color: "black",
        fontSize: 15,
        marginLeft: 10,
        flex: 1,
        //alignItems: 'center',
        justifyContent: "center",
        // backgroundColor : 'red'
    },
    separator: {
        marginStart: 15,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',

    },
    bottomViewSeprator: {
        flex: 0.002, backgroundColor: 'gray'
    },
    listContainer: {
        flex: 0.788,
    },
    headerContainer: {
        flex: 0.13, justifyContent: 'center'
    },
    headerContainerCenter: {
        flex: 0.13, justifyContent: 'center', alignItems: 'center'
    },
    iconImageContainer: {
        flex: 0.2, justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        height: 16,
        width: 16,

    },
    actionColorPreviewContainer: {
        flex: 1,
        flexDirection: "row",
        height: 25
    },
    datesStyle: {
        marginLeft: 10, fontWeight: 'bold', fontSize: 18, color: 'white', marginTop: 7, textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10

    },
    textDataTypeAction: { textAlignVertical: 'center', flex: 1, fontSize: 16, height: 25 },
    colorPickerDataTypeAction: { textAlignVertical: 'top', flex: 1, fontSize: 18, height: 25 },
    profilePicContainerCenter: {
        flex: 0.2, justifyContent: 'center', alignItems: 'center'
    },
    profilePicImage: {
        height: Dimensions.get('window').width / 4,
        width: Dimensions.get('window').width / 4,
        paddingTop: 10,
        paddingBottom: 5
    },

});

