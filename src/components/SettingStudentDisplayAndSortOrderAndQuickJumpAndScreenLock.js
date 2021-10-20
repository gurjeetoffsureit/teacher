
import React from "react";
import {
    TouchableOpacity, Image, Platform, StyleSheet, Text, View, FlatList,
    SafeAreaView, Switch, Alert
} from 'react-native'


import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import AppConstant from "../constants/AppConstant";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'

export default class SettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock extends React.PureComponent {
    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    constructor(props) {
        super(props)

        var settingScreenData = this.props.navigation.state.params
        var studentOrderList = JSON.parse(JSON.stringify(settingScreenData.studentOrderList))
        this.state = {
            listData: studentOrderList,
            isEditMode: false,
            dateRangeNeedToDelete: [],
            isAsyncLoader: false,
            totalRanges: 0,
            isFetchingFromServer: false,
            screenLockValue: settingScreenData.screenLockValue,
            isScreenLock: (settingScreenData.screenLockValue.length == 4 ? true : false),
            settingId: settingScreenData.settingId,
            comingFor: settingScreenData.comingFor


        }

    }

  
    componentDidMount() {
        this.props.navigation.setParams({
            gotoBack: this.moveToPreviousScreen
        })


    }

    moveToPreviousScreen = () => {

        //this._removeEventListener()
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    setDataForAddActionScreen(pickerList) {
        var selectedList = pickerList;
        var actionValue = '';
        for (var i = 0; i < selectedList.length; i++) {
            if (actionValue == '') {
                actionValue += selectedList[i].value
            } else {
                actionValue += ',' + selectedList[i].value
            }
        }
        var item = {
            _id: this.state.item._id,
            dataType: this.state.item.dataType,
            selectedPickerList: pickerList,
            actionValue: actionValue
        };
        return item;
    }





    //_setVisiblityOfItem
    _setVisiblityOfItem = (item, index) => {
        let posts = this.state.listData.slice();

        for (var i = 0; i < posts.length; i++) {
            var selectedPost = posts[i];
            if (index == i) {
                selectedPost.selectionVisibilty = true;

                //hit selection api
                this._saveDataOnRowClick(selectedPost.data.name)
            } else {
                selectedPost.selectionVisibilty = false;
            }
        }
        this.setState({ posts });
        // }


    }

    _saveDataOnRowClick(value) {
        var body = {}
        switch (this.state.comingFor) {
            case AppConstant.SORT_DATA:
                body = {
                    studentSortOrder: (value == AppConstant.FIRST_LAST ? AppConstant.ENUM_FIRST_LAST.toUpperCase() : AppConstant.ENUM_LAST_FIRST.toUpperCase())
                }
                break;
            case AppConstant.DISPLAY_ORDER:
                body = {
                    studentDisplayOrder: value == AppConstant.FIRST_LAST ? AppConstant.ENUM_FIRST_LAST.toUpperCase() : AppConstant.ENUM_LAST_FIRST.toUpperCase()
                }
                break;
            case AppConstant.QUICK_JUMP_BUTTON:
                switch (value) {
                    case AppConstant.HOME:
                        body = {
                            quickJumpButton: AppConstant.ENUM_HOME.toUpperCase()
                        }
                        break;
                    case AppConstant.CLASSES:
                        body = {
                            quickJumpButton: AppConstant.ENUM_CLASSES.toUpperCase()
                        }
                        break;
                    case AppConstant.STUDENT:
                        body = {
                            quickJumpButton: AppConstant.ENUM_STUDENT.toUpperCase()
                        }
                        break
                }

                break;

        }


        this.setLoading(true)

        TeacherAssitantManager.getInstance()._updateUserSetting(body, this.state.settingId).then((responseJson) => {
            //console.log("response", JSON.stringify(responseJson));
            if (responseJson.success) {
                this.setLoading(false);
                //this.moveToPreviousScreen();
            }
            else {
                this.setLoading(false);
                this._showToastMessage(responseJson.message);
            }
        }).catch((error) => {
            this.setLoading(false);
            console.error(error);
        });;

    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }





    //define header (navigation Bar)
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        var title = params.screenTitle
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
        return {
            //title:`${navigation.state.param.title}`,
            title: '' + ` ${title}`,
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.gotoBack()}>
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

    _handleScreenLockSwitch = (value, isAlertCancelPressed = false) => {
        //console.log("value", value)
        // this.state.listData[index].data.value = !value;
        this.setState({
            isScreenLock: isAlertCancelPressed ? (!value) : value,
            screenLockValue : !value ?'':this.state.screenLockValue
        })

        if (!isAlertCancelPressed && !this.state.isScreenLock) {
            Alert.alert(
                TextMessage.ARE_YOUR_SURE,
                TextMessage.IF_YOU_FORGET_YOUR_PIN_YOU_CANNOT_RECOVER_YOUR_DATA,
                [
                    { text: 'Cancel', onPress: () => this._handleScreenLockSwitch(value, true), style: 'cancel' },
                    { text: 'Proceed', onPress: () => this._moveToScreenLock(), },
                ],
                { cancelable: false }
            )
        } else {
            var body = {
                screenLock: ''
            }
            TeacherAssitantManager.getInstance()._updateUserSetting(body, this.state.settingId).then((responseJson) => {
                //console.log("response", JSON.stringify(responseJson));
                if (responseJson.success) {
                    this.setState({
                        isScreenLock: false,
                        screenLockValue: ''
                    })
                }
                else {
                    //this.setLoading(false);
                    this._showToastMessage(responseJson.message);
                }
            }).catch((error) => {
                //this.setLoading(false);
                console.error(error);
            });
        }
    }


    _moveToScreenLock = () => {
        const { navigation } = this.props;
        navigation.navigate('ScreenLock', {
            settingId: this.state.settingId,
            onGoBack: this.refresh,
            isFromSplashSCreen: false,
            leftHeader:BreadCrumbConstant.CANCEL,
            screenLock:this.state.screenLockValue
        });

    }

    refresh = (code) => {
        if (code == "" && this.state.screenLockValue.length != 4) {
            this.setState({
                isScreenLock: false,
            })
        } else {

            this.setState({
                isScreenLock: true,
                screenLockValue: code
            })
        }

    };


    _renderItem = ({ item, index }) => {

        var data = item.data


        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._setVisiblityOfItem(item, index)} >
                    <View style={styles.rowContainer}>

                        <View style={index > 0 && this.state.isEditMode ? styles.editRowTextContainter : styles.rowTextContainter}>
                            <View style={styles.rowText}>
                                <Text numberOfLines={1} style={styles.rowItemActionPickerText}>
                                    {data.name}
                                </Text>
                            </View>

                        </View>
                        <View style={styles.iconImageContainer}>
                            {
                                item.selectionVisibilty ?
                                    <Image style={styles.iconImage}
                                        name="search"
                                        source={require("../img/check_icon.png")} />
                                    : null
                            }
                        </View>



                    </View>
                </TouchableOpacity>
            </View>



        );


    };


    //render the whle ui
    render() {
        // const { listData, comingFor, isScreenLock,screenLockValue } = this.state
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    {
                        this.state.comingFor == AppConstant.SCREEN_LOCK ?
                            <View style={{ flex: 1 }} >

                                <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
                                    <View style={styles.rowContainer}>

                                        {/* <View style={styles.touchableOpacityItemViewContainer}> */}
                                        <Text style={[styles.buttonText, styles.textAlignLeft]}>Screen Lock</Text>
                                        <Switch style={[styles.buttonText, styles.positionAbsoluteWithEnd]}
                                            onValueChange={this._handleScreenLockSwitch}
                                            value={this.state.isScreenLock}
                                        />
                                    </View>
                                </View>
                                {(this.state.screenLockValue.length == 4) ?
                                    <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
                                        <TouchableOpacity onPress={this._moveToScreenLock} style={[styles.rowContainer, styles.touchableOpacityItemViewContainer]}>

                                            {/* <View style={styles.touchableOpacityItemViewContainer}> */}
                                            <Text style={[styles.buttonText, styles.textAlignLeft]}>Change Password</Text>
                                            {/* <Switch style={[styles.buttonText, styles.positionAbsoluteWithEnd]}
                                            onValueChange={this._handleScreenLockSwitch}
                                            value={this.state.screenLockValue}
                                        /> */}
                                        </TouchableOpacity>
                                    </View> : null
                                }
                                {/* <TouchableOpacity onPress={() => this._moveToScreenLock()}
                                    style={[styles.buttonContainer, styles.buttonWithTopMargin]}>
                                    <View style={styles.touchableOpacityItemViewContainer}>
                                        <Text style={[styles.buttonText, styles.textAlignLeft]}>Change Password</Text>
                                    </View>
                                </TouchableOpacity> */}
                            </View >
                            :
                            <View style={{ flex: 1 }}>
                                <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
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
                                    // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(this.state.listData)}
                                    onEndReached={this.loadMoreData}
                                    ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                                />
                            </View>
                    }
                </View>
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
    container: {
        flex: 1,

    },
    list: {
        backgroundColor: 'white',
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
        height: 32,
        alignSelf: "center"
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 5,
        margin: 12,
        // backgroundColor: 'white'
    },
    rowTextContainter: {
        flex: 0.8,
        flexDirection: 'row'
    },
    editRowTextContainter: {
        flex: 0.7,
        flexDirection: 'row'
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
    touchStyle: {
        flex: 0.2,
        //alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        flexDirection: 'row',
        // backgroundColor:'green'

    },
    imageContainer: {
        flex: 0.1,
        alignItems: "center",
        justifyContent: "center"
    },
    imageInfoContainer: {
        flex: 0.1,
        alignItems: "center",
        justifyContent: "center"
    },
    imageView: {
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16
    },
    imageNextContainer: {
        flex: 0.1,
        //alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
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


    bottomViewSeprator:
        { flex: 0.002, backgroundColor: 'gray' },

    iconImageContainer: {
        flex: 0.2, justifyContent: 'center',
        alignItems: 'center',
    },

    iconImageContainerForEditMode: {
        flex: 0.2, justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        height: 16,
        width: 16,

    },
    infoIconImageContainer: {
        // fontSize: 15,
        marginLeft: 15,
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center",
    },
    //arrowIconImageContainer: { justifyContent: 'center', alignItems: "center", flex: 0.2 },
    rowItemActionPickerText: { flex: 1, justifyContent: 'center', marginTop: 1.5, marginBottom: 0.5 },

    rowItemDateText: { justifyContent: 'center', marginTop: 0.5 },
    //this is for ScreenLock
    positionAbsoluteWithEnd: {
        position: 'absolute', end: 10
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        marginLeft: 10,
    },
    textAlignLeft: { textAlign: 'left' },
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
    touchableOpacityItemViewContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' }
});