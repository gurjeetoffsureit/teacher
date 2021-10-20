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
import breadCrumb from "../constants/BreadCrumbConstant";
var self;
export default class SettingShareData extends React.PureComponent {
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
      
        //console.log('componentDidMount');
        Linking.getInitialURL().then((ev) => {
            if (ev) {
                this.handleOpenURL(ev);
            }
        }).catch(err => {
            console.warn('An error occurred', err);
        });
        Linking.addEventListener('url', this.handleOpenURL);


        this.props.navigation.setParams({
            moveToHome: this.gotoPreviousScreen
        })
    }
    gotoPreviousScreen = () => {
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();

    }

    componentWillUnmount() {
        //console.log('componentWillUnmount');
        Linking.removeEventListener('url', (event) => this.handleOpenURL(event));


    }


   

    
    _onPressAnotherTeachersSharedData = () => {
        const { state, navigate } = this.props.navigation;
        // "Another Teacher's Shared Data"
        navigate("SettingAnotherTeachersSharedData", { screenTitle: "Another Teacher...", onGoBack: this.refresh,
        leftHeader:BreadCrumbConstant.CANCEL })

    }

    _onPressShareDataWithAnotherTeacher = () => {
        var sortOrderdata = [...this.state.studentOrderList]
        var index = sortOrderdata.findIndex(sortOrder => sortOrder.data.name == this.state.lblSortOrder)
        if (index > -1) {
            sortOrderdata[index].selectionVisibilty = true
        }
        // "Share Data With Another Teacher"
        const { state, navigate } = this.props.navigation;
        navigate("SettingShareDataWithAnotherTeacher", { screenTitle: "Share Data With...", 
        onGoBack: this.refresh, studentOrderList: sortOrderdata,leftHeader:BreadCrumbConstant.CANCEL })

    }

    refresh(){

    }



    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: 'Share Data',
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
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
                        
                        <TouchableOpacity onPress={this._onPressAnotherTeachersSharedData}
                                style={styles.buttonWithTopMargin}>
                                <Text style={styles.buttonText}>Another Teacher's Shared data</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this._onPressShareDataWithAnotherTeacher}
                                style={styles.buttonWithTopMargin}>
                                <Text style={styles.buttonText}>Share Data With Another Teacher</Text>
                                <View style={[StyleTeacherApp.nextScreenArrowNavigationImageContainer, styles.positionAbsoluteWithEnd]}>
                                            <Image style={StyleTeacherApp.nextScreenArrowNavigationImage}
                                                source={require('../img/icon_arrow.png')}>
                                            </Image>
                                        </View>
                            </TouchableOpacity>
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