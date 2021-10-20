import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ScrollView,
    Linking,
    Alert,
    Platform,
    TouchableOpacity, Image, Switch, SafeAreaView, WebView
} from 'react-native';

import dropboxKey from '../constants/DropboxConstant';
import Loader from '../ActivityIndicator/Loader';
import API from '../constants/ApiConstant'
import AppConstant from '../constants/AppConstant'
import UrlConstant from '../constants/UrlConstant'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import { EventRegister } from 'react-native-event-listeners'
import update from 'react-addons-update'
import SocketConstant from '../constants/SocketConstant'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import ActionSheet from 'react-native-actionsheet'
import ComingFrom from '../constants/ComingFrom'

import StyleTeacherApp from '../styles/StyleTeacherApp'

var self;
export default class FAQsAndVideoHelp extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            isNeedToFinish: false,
            //this willbe use for sort and diplay order 
            studentOrderList: [{ 'data': { 'name': 'First, Last' }, 'selectionVisibilty': false },
            { 'data': { 'name': 'Last, First' }, 'selectionVisibilty': false }],
            studentQuickJumpList: [{ 'data': { 'name': 'Home' }, 'selectionVisibilty': false },
            { 'data': { 'name': 'Classes' }, 'selectionVisibilty': false },
            { 'data': { 'name': 'Students' }, 'selectionVisibilty': false }],
            showPointValue: false,
            showThumbnailValue: false,
            lblSortOrder: '',
            lblDisplayOrder: '',
            lblQuickJump: '',
            //actionSheet variables
            actionSheetTitle: AppConstant.APP_NAME,
            actionSheetOptions: [],
            actionSheetMessage: ''
        }
        this.deleteAndCancelOptions = ['DELETE', 'CANCEL']
        this.resetAndCancelOptions = ['RESET', 'CANCEL']
        self = this;

    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    componentDidMount() {
        //console.log('componentDidMount')


        this.props.navigation.setParams({
            moveToHome: this.gotoPreviousScreen
        })
    }
    gotoPreviousScreen = () => {
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();

    }




    _onPressOption(option) {
        var url = ''
        switch (option) {
            case AppConstant.SYNC_TIPS:
                url = UrlConstant.SYNCTIPS_URL
                break;
            case AppConstant.FREQUENTLY_ASKED_QUESTIONS:
                url = UrlConstant.
                    break;
            case AppConstant.SYNC_TIPS:
                url = UrlConstant.
                    break;
            case AppConstant.SYNC_TIPS:
                url = UrlConstant.SYNCTIPS_URL
                break;
            case AppConstant.WHATS_NEW:
                url = UrlConstant.WHATSNEW_URL
                break;
            case AppConstant.IMPORT_EXPORT:
                url = UrlConstant.IMPORTEXPORT_URL
                break;
            case AppConstant.OVERVIEW_VIDEO:
                url = UrlConstant.OVERVIEWVIDEO_URL
                break;
            case AppConstant.ADDING_DATA:
                url = UrlConstant.ADDINGDATA_URL
                break;
            case AppConstant.DELETING_DATA:
                url = UrlConstant.DELETING_DATA_URL
                break;
            case AppConstant.ADD_ACTION_TO_MANY_STUDENTS:
                url = UrlConstant.ADD_TO_MANY_URL
                break;
            case AppConstant.DATA_RANGES_AND_QUICK_JUMP:
                url = UrlConstant.DATA_RANGES_QUICK_JUMP_URL
                break;
            case AppConstant.RANDOMIZER:
                url = UrlConstant.RANDOMIZE_VIDEO_URL
                break;
            case AppConstant.SET_DEFAULT_ACTION_VALUES:
                url = UrlConstant.SET_DEFAULT_ACTION_VALUES_URL
                break;
            case AppConstant.COMPLETE_CUSTOMIZATION:
                url = UrlConstant.COMPLETE_CUSTOMIZATION_URL
                break;
            case AppConstant.EMAIL_BLAST:
                url = UrlConstant.EMAIL_BLAST_VIDEO_URL
                break;
            case AppConstant.ACTIONS_POINTS_AND_COLORS:
                url = UrlConstant.ACTIONS_POINTS_COLORS_URL
                break;
            case AppConstant.PIN_CODE_SECURITY:
                url = UrlConstant.PINCODE_URL
                break;
            case AppConstant.FILTER_AND_SEARCH:
                url = UrlConstant.FILTER_SEARCH_URL
                break;
            case AppConstant.CHANGE_THE_DEFAULT_IPAD_LOGO:
                url = UrlConstant.CHANGE_DEAFULT_TAB_LOGO_URL
                break;
            case AppConstant.QUICKLY_BACK_UP_DATA:
                url = UrlConstant.QUICKLY_BACKUP_DATA_URL
                break;
            case AppConstant.EMAIL:
                url = UrlConstant.MAILTO_URL
                break;
            case AppConstant.POSITIVE_REVIEWS_PLEASE:
                url = (Platform.OS === 'android') ? UrlConstant.POSITIVE_REVIEWS_PLEASE_ANDROID_URL : UrlConstant.POSITIVE_REVIEWS_PLEASE_IOS_URL
                break;
            case AppConstant.TWITTER:
                url = UrlConstant.TWITTER_URL
                break;
            case AppConstant.FACEBOOK:
                url = UrlConstant.FACEBOOK_URL
                break;
        }
        if (url != '') {
            Linking.openURL(url).catch(err => console('An error occurred', err));
        }

    }


    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: 'Resources',
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,
            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.moveToHome()}>
                   <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter,StyleTeacherApp.width60Per,
                        StyleTeacherApp.marginLeft14]}>
                        {/* <Image
              style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
              source={Platform.OS === "android" ? require("../img/back_arrow_android.png") : require("../img/back_arrow_ios.png")} /> */}
                        <Image
                            style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
                            source={require("../img/back_arrow_ios.png")} />
                        <Text style={[StyleTeacherApp.headerLeftButtonText]} numberOfLines={1}>{
                            TeacherAssitantManager.getInstance()._setnavigationleftButtonText(params.leftHeader)  }</Text>
                    </View>
                </TouchableOpacity>
            ,
            headerRight:  () => 
                <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
                </View>

            

        }
    }

    render() {

        const { lblSortOrder, lblDisplayOrder, lblQuickJump, showThumbnailValue, showPointValue, actionSheetTitle,
            actionSheetOptions,
            actionSheetMessage } = this.state
        return (
            <SafeAreaView style={styles.container}>
                <View>
                    <ActionSheet
                        ref={o => this.ActionSheetObject = o}
                        title={actionSheetTitle}
                        options={actionSheetOptions} //- a title to show above the action sheet
                        message={
                            actionSheetMessage} // - a message to show below the title
                        tintColor={['red', 'blue']} //- the color used for non-destructive button titles
                        //cancelButtonIndex={1}
                        destructiveButtonIndex={0}
                        onPress={(index) => { this._handleActionSheetIndex(index) }}
                    />
                    <Loader loading={this.state.loading} />
                    <ScrollView>
                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>SINGLE USER SYNC</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.SYNC_TIPS)}
                                style={styles.buttonWithoutTopMargin}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>{AppConstant.SYNC_TIPS}</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                                </View>

                            </TouchableOpacity>
                        </View>

                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>FAQ</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.FREQUENTLY_ASKED_QUESTIONS)}
                                style={styles.buttonWithoutTopMargin}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>{AppConstant.FREQUENTLY_ASKED_QUESTIONS}</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                                </View>

                            </TouchableOpacity>
                        </View>


                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>HELP</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.WHATS_NEW)}
                                style={styles.buttonWithoutTopMargin}>
                                <View style={styles.touchableOpacityItemViewContainer}>
                                    <Text style={[styles.buttonText, styles.textAlignLeft]}>{AppConstant.WHATS_NEW}</Text>
                                    <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                                </View>

                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.IMPORT_EXPORT)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={[styles.buttonText, styles.textAlignLeft]}>{AppConstant.IMPORT_EXPORT}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>

                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.OVERVIEW_VIDEO)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={[styles.buttonText, styles.textAlignLeft]}>{AppConstant.OVERVIEW_VIDEO}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.ADDING_DATA)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.ADDING_DATA}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.DELETING_DATA)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.DELETING_DATA}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.ADD_ACTION_TO_MANY_STUDENTS)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.ADD_ACTION_TO_MANY_STUDENTS}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => this._onPressOption(AppConstant.DATA_RANGES_AND_QUICK_JUMP)}
                            style={styles.buttonWithoutTopMargin}>
                            <Text style={[styles.buttonText, styles.textAlignLeft]}>{AppConstant.DATA_RANGES_AND_QUICK_JUMP}</Text>
                            <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                        </TouchableOpacity>

                        {/* Default Action values SECTION */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.RANDOMIZER)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.RANDOMIZER}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.SET_DEFAULT_ACTION_VALUES)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.SET_DEFAULT_ACTION_VALUES}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.COMPLETE_CUSTOMIZATION)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.COMPLETE_CUSTOMIZATION}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.EMAIL_BLAST)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.EMAIL_BLAST}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.ACTIONS_POINTS_AND_COLORS)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.ACTIONS_POINTS_AND_COLORS}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.PIN_CODE_SECURITY)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.PIN_CODE_SECURITY}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.FILTER_AND_SEARCH)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.FILTER_AND_SEARCH}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.CHANGE_THE_DEFAULT_IPAD_LOGO)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.CHANGE_THE_DEFAULT_IPAD_LOGO}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.QUICKLY_BACK_UP_DATA)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.QUICKLY_BACK_UP_DATA}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>

                        {/*Support suggestion section*/}
                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>{AppConstant.SUPPORT_SUGGESTIONS}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.EMAIL)}
                            
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.EMAIL}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.HOME_PAGE)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.HOME_PAGE}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>

                        {/*Write a Review section*/}
                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>{AppConstant.WRITE_A_REVIEW}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.POSITIVE_REVIEWS_PLEASE)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.POSITIVE_REVIEWS_PLEASE}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>

                        {/*Social Media section*/}
                        <View style={styles.sectionViewContainer}>
                            <Text style={styles.sectionTitle}>{AppConstant.SOCIAL_MEDIA}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.TWITTER)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.TWITTER}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this._onPressOption(AppConstant.FACEBOOK)}
                                style={styles.buttonWithoutTopMargin}>
                                <Text style={styles.buttonText}>{AppConstant.FACEBOOK}</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                        </View>



                    </ScrollView>
                </View>
            </SafeAreaView>
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
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    sectionTitle: { fontSize: 16, color: 'black' },
    sectionViewContainer: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', height: 40, marginLeft: 10 },
    textAlignLeft: { textAlign: 'left' },
    positionAbsoluteWithEnd: {
        position: 'absolute', end: 10
    },
    touchableOpacityItemViewContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' }
});
