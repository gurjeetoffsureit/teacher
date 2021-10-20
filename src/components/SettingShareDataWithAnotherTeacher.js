import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert, Keyboard, SafeAreaView,
    TextInput, Platform, FlatList, Dimensions
} from "react-native";
import API from "../constants/ApiConstant";
import SocketConstant from "../constants/SocketConstant";
import Loader from '../ActivityIndicator/Loader';
import { EventRegister } from 'react-native-event-listeners'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import ActionSheet from 'react-native-actionsheet'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import AppConstant from "../constants/AppConstant";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import Toast, { DURATION } from 'react-native-easy-toast'

export default class SettingShareDataWithAnotherTeacher extends React.PureComponent {
    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    constructor(props) {
        super(props);

        var stateParams = this.props.navigation.state.params
        this.state = {
            userId: TeacherAssitantManager.getInstance().getUserID(),
            searchText: '',
            loading: false,
            isSearched: false,
            listData: [],
            page: 1,
            isAsyncLoader: false,
            selectedUser: {},
            isFetchingFromServer: false,
            totalUser: 0,
            isShowingSearchImage: true,
            keyBoardHeight: 0,
        };


    }



    componentDidMount() {
        this.props.navigation.setParams({ onLeftHeaderClick: this.onLeftHeaderClick });
        TeacherAssitantManager.getInstance().keyboardAddListener(this)
        // Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow);
        // Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
        this._addEventListener()
    }

    componentWillUnmount() {
        TeacherAssitantManager.getInstance().keyboardRemoveListener(this)
        // Keyboard.removeListener('keyboardDidShow', this.onKeyboardDidShow);
        // Keyboard.removeListener('keyboardDidHide', this.keyboardDidHide);
    }

    // onKeyboardDidShow = (e) => {
    //     this.setState({ keyBoardHeight: e.endCoordinates.height })
    // }
    // keyboardDidHide = () => {
    //     this.setState({ keyBoardHeight: 0 })
    // }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    onLeftHeaderClick = () => {
        this._removeEventListener()
        // this.props.navigation.pop(1)
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    /**
     * This method create top title bar
     */
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        var { height, width } = Dimensions.get('window');
        var title = params.screenTitle
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
        return {
            title:
                title
            ,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: () =>
                <TouchableOpacity onPress={() => params.onLeftHeaderClick()}>
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
                <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter]}>
                </View>

        };
    };



    /**
     * This method will set few states empty and call to api hit method to get list of students
     */
    searchStudent = (searchText = '') => {
        // this.showAlert("searched")
        //this.setLoading(true);
        this.setState({
            page: 1,
            isAsyncLoader: false,
            listData: searchText == '' ? [] : this.state.listData,
            isShowingSearchImage: searchText == '' ? true : false

        }, function () {
            //this.hitApiToGetStudentsList()
        });
    }

    /**
     * This method will show and hide cancel and search botton for search text.
     */

    ShowHideTextComponentView = () => {

        if (this.state.searchText !== '') {
            //show Cancel icon
            this.setState({ isShowingSearchImage: false })

        }
        else {
            //show search icon
            this.setState({ isShowingSearchImage: true, listData: [] })

        }
        this.searchStudent()
    }

    /**
     * This method handle click of cancel button in search edit text
     */

    cancelSearching = () => {

        this.textInput.clear()
        this.state.searchText = ''
        this.ShowHideTextComponentView()

    }

    /**
     * This method add text watcher to search edit text
     */
    handleSearchText = (text) => {

        if (text !== '' && (text.trim()).length >= 3) {
            this.setState({
                searchText: text,
                //isShowingSearchImage: false 

            }, function () {

                this._hitApiToGetUserBySharedByMe()
            });

        }

        this.searchStudent(text)






    }

    // event listener for socket
    _addEventListener = () => {

        this.addShareDataWithAnotherTeacher = EventRegister.addEventListener(SocketConstant.ON_ADD_SHARED_DATA_WITH_ANOTHER_TEACHER, (data) => {
            //console.log("addStudentListener", data)
            this._addShareDataWithAnotherTeacher(data)
        })

        // this.updateShareDataWithAnotherTeacher = EventRegister.addEventListener(SocketConstant.ON_UPDATE_SHARED_DATA_WITH_ANOTHER_TEACHER, (data) => {
        //     //console.log("addStudentListener", data)
        //     this._updateShareDataWithAnotherTeacher(data)
        // })

        this.removeShareDataWithAnotherTeacher = EventRegister.addEventListener(SocketConstant.ON_DELETE_SHARED_DATA_WITH_ANOTHER_TEACHER_BULK, (data) => {
            //console.log('removeStudentListener');
            this._removeShareDataWithAnotherTeacher(data)
        })


    }

    _removeEventListener = () => {
        EventRegister.removeEventListener(this.addShareDataWithAnotherTeacher)
        EventRegister.removeEventListener(this.updateShareDataWithAnotherTeacher)
        EventRegister.removeEventListener(this.removeShareDataWithAnotherTeacher)
    }

    //_addShareDataWithAnotherTeacher
    _addShareDataWithAnotherTeacher = (user) => {


        var array = this.state.listData.slice();
        if (array.length > 0) {
            var index = array.findIndex(userObject => userObject.data._id === user.sharedWith);

            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(array[index]);
                //var _student = array[index];
                array[index].visibility = true

                // if shared Data is not defined add shared dAta object
                if (array[index].data.sharedData == undefined) {
                    array[index].data['sharedData'] = {}
                    array[index].data.sharedData['_id'] = user._id
                }
                else {
                    array[index].data.sharedData._id = user._id
                }

                //console.log("array is" + JSON.stringify(array))
                this.setState({
                    listData: array
                })

            }
        }

    }

    //_updateShareDataWithAnotherTeacher
    _updateShareDataWithAnotherTeacher = (user) => {
        var array = this.state.listData.slice();
        if (array.length > 0) {
            var index = array.findIndex(userObject => userObject.studentId === user._id);

            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(array[index]);
                var _student = array[index];
                _student.data = user
                this.setState({
                    listData: array,
                })

            }
        }
    }

    //_removeShareDataWithAnotherTeacher
    _removeShareDataWithAnotherTeacher = (user) => {
        var array = [...this.state.listData]

        if (array.length > 0) {
            var index = array.findIndex(userObject => userObject.data._id === user.sharedWith);

            //console.log(index);
            if (index > -1) {
                //console.log('this.state.listData[index]');
                //console.log(array[index]);
                //  var _student = array[index];
                array[index].visibility = false
                this.setState({
                    listData: array,
                })

            }
        }
        // var array = [...this.state.listData]
        // if (array.length > 0) {

        //     var _userList = userList._id
        //     //console.log(_userList);
        //     for (var i = 0; i < _userList.length; i++) {
        //         //console.log('_updateShareDataWithAnotherTeacher');
        //         //
        //         var index = array.findIndex(userObject => userObject.studentId === _userList[i]);
        //         //console.log(index);
        //         if (index > -1) {
        //             array.splice(index, 1);
        //             this.setState({
        //                 listData: array,
        //             })
        //         }
        //     }

        // }

    }



    //it will help to set edit is on off
    _handleActionSheetIndex = (index, selectedUser) => {

        switch (index) {
            case 0://yes
                //if (this.state.isSelectedUser) {
                if (this.state.listData.length > 0) {
                    var array = [...this.state.listData]
                    var index = array.findIndex(user => user.data._id == selectedUser.data._id)
                    if (index > -1) {
                        if (selectedUser.visibility) {
                            this._revokeDataWithSelectedUser(array, index)
                        } else {
                            this._sharingDataWithSelectedUser(array, index)
                        }

                    }
                }

                // } else {

                // }
                break;
        }

    }





    _showActionSheet = (item, index) => {
        this.setState({
            selectedUser: item,
            //selectedUserName: item.data.firstName + ' ' + item.data.lastName,
            //isSelectedUser: item.visibility
        }, function () {
            if (item.visibility) {
                this.DestructiveActionSheet.show()
            } else {
                this.ActionSheet.show()
            }

        })

    }

    _revokeDataWithSelectedUser(array, index) {

        if (array[index].data.sharedData != undefined) {
            this.setLoading(true)
            //console.log("_revokeDataWithSelectedUser" + JSON.stringify(array[index]))
            var url = API.BASE_URL + API.API_USERS_SHAREDS_DELETE + array[index].data.sharedData._id;
            //console.log("_revokeDataWithSelectedUser", url)

            requestInfo = {
                method: 'DELETE',
                headers: {},
            }

            TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
                //console.log("response", JSON.stringify(responseJson));
                if (responseJson.success) {
                    this.setLoading(false)
                    //array[index].visibility = !array[index].visibility
                    this.setState({
                        //listData: array,
                        //isSelectedUser:false,
                        selectedUser: {}
                    })
                } else {
                    this.setLoading(false)
                    this.setState({
                        //listData: array,
                        //isSelectedUser:false,
                        selectedUser: {}
                    })
                    this._showToastMessage(responseJson.message)
                }
            }).catch((error) => {
                this.setLoading(false)
                this.setState({
                    //listData: array,
                    //isSelectedUser:false,
                    selectedUser: {}
                })
                console.error(error);
            });

        }



    }

    _sharingDataWithSelectedUser(array, index) {
        this.setLoading(true)
        var searchText = this.state.searchText
        var sharedByUserId = TeacherAssitantManager.getInstance().getUserID()
        var url = API.BASE_URL + API.API_USERS_SHARED_CREATE;
        //console.log("_sharingDataWithSelectedUser", url)

        var headerValue = {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        }
        requestInfo = {
            method: 'POST',
            headers: {},
            body: JSON.stringify({ sharedBy: sharedByUserId, sharedWith: array[index].data._id })
        }

        TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
            //console.log("response", JSON.stringify(responseJson));
            if (responseJson.success) {
                this.setLoading(false)
                // var responseData = responseJson.data
                // var list = responseData.usersData
                // var filterData = list.filter(x => String(x.firstName).includes(searchText));
                // var filterData = [...filterData, ...list.filter(x => String(x.lastName).includes(searchText))];

                // array[index].visibility = !array[index].visibility
                this.setState({
                    //listData: array,
                    //isSelectedUser:false,
                    selectedUser: {}
                })

                // this.setState({
                //     listData: filterData,
                //     isAsyncLoader: false,
                //     page: this.state.page + 1,
                //     totalUser: responseData.count,
                //     isFetchingFromServer: false

                // })
            } else {
                this.setLoading(false)
                this._showToastMessage(responseJson.message)
            }
        }).catch((error) => {
            this.setLoading(false)
            console.error(error);
        });



    }

    /**
      * Hit Api to get users list  with i have shared data
      */

    _hitApiToGetUserBySharedByMe() {
        //this.setLoading(true)
        this.setState({
            isAsyncLoader: true
        })

        var url = (API.BASE_URL + API.API_USERS + TeacherAssitantManager.getInstance().getUserID() + API.API_USERS_BY_SHARED_BY_ME_WITH_SEARCH_AND_PAGINATION
            + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT);
        var headerValue = {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
            // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        }
        //console.log("user ", url)
        requestInfo = {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                search: this.state.searchText,
            })
        }

        TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
            //console.log("response", JSON.stringify(responseJson));
            if (responseJson.success) {
                this.setLoading(false)
                var users = [...this.state.listData]
                var responseData = responseJson.data
                var list = responseData.usersData
                var userList = []
                for (var i = 0; i < list.length; i++) {
                    var _userData = list[i]
                    userList.push({
                        data: _userData,
                        visibility: _userData.selected
                    })
                }


                this.setState({
                    // listData: [...users, ...userList],
                    listData: userList,
                    isAsyncLoader: false,
                    page: this.state.page + 1,
                    totalUser: responseData.count,
                    isFetchingFromServer: false

                })
            } else {
                this.setState({
                    isAsyncLoader: false,
                    isFetchingFromServer: false
                })
                this._showToastMessage(responseJson.message)
            }
        }).catch((error) => {
            this.setState({
                isAsyncLoader: false,
                isFetchingFromServer: false
            })
            console.error(error);
        });

    }

    /**
   * This method will get call for pagination
   */

    loadMoreStudents = () => {
        const { listData, totalUser, isFetchingFromServer } = this.state
        if (listData.length < totalUser && !isFetchingFromServer) {
            this.setState({ isFetchingFromServer: true }, function () {
                this._hitApiToGetUserBySharedByMe()
                //console.log('loadMoreStudents')
            })


        }
    }

    _renderItem = ({ item, index }) => {
        const { email } = item.data;
        let indexofAtTheRate = email.indexOf('@')
        let indexofPeriod = email.lastIndexOf('.')
        let noOfIndexDiff = indexofPeriod - indexofAtTheRate
        if(noOfIndexDiff>3){
            noOfIndexDiff = 3
        } 
        let emailValue = `${email.substring(0, 3)}...${email.substring(indexofAtTheRate, indexofAtTheRate+noOfIndexDiff)}...com`

        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._showActionSheet(item, index)} >
                    <View style={styles.rowContainer}>
                        <View style={{ width: '88%' }}>
                            <Text style={styles.rowText} numberOfLines={1}>
                                {`${item.data.firstName} ${item.data.lastName.substring(0, 2)}...`}
                            </Text>
                            <Text style={styles.rowText} numberOfLines={1}>
                                {`${emailValue}`}
                            </Text>
                        </View>
                        {item.visibility ?
                            <View style={styles.imageContainer}>
                                <View style={styles.imageNextContainer}>
                                    <Image style={styles.imageView}
                                        source={require('../img/check_icon.png')}>
                                    </Image>
                                </View>
                            </View>
                            :
                            null
                        }

                    </View>
                </TouchableOpacity>
            </View>



        );
    };


    render() {

        const { listData, isShowingSearchImage, selectedUser } = this.state
        // var message = 
        let isAndroid = Platform.OS === 'android'
        return (
            <SafeAreaView style={styles.container}>

                <View style={{ flex: 1 }}>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    {
                        (selectedUser.visibility != undefined && selectedUser.visibility) ?
                            <ActionSheet
                                ref={o => this.DestructiveActionSheet = o}
                                title={'Share Data'}
                                options={['YES', 'NO']}
                                tintColor={['red', 'blue']}
                                destructiveButtonIndex={0}
                                message={TextMessage.ARE_YOU_SURE_YOU_WANT_TO_REVOKE_SHARE_DATA_FROM + (selectedUser.data != undefined ? (selectedUser.data.firstName + ' ' + selectedUser.data.lastName) : '') + '?'}
                                onPress={(index) => { this._handleActionSheetIndex(index, selectedUser) }}
                            />
                            :
                            <ActionSheet
                                ref={o => this.ActionSheet = o}
                                title={'Share Data'}
                                options={['YES', 'NO']}
                                message={TextMessage.ARE_YOU_SURE_YOU_WANT_TO_SHARE_DATA_WITH + (selectedUser.data != undefined ? (selectedUser.data.firstName + ' ' + selectedUser.data.lastName) : '') + '?'}
                                onPress={(index) => { this._handleActionSheetIndex(index, selectedUser) }}
                            />

                    }

                    <View style={{ flex: 1 }}>
                        <Loader loading={this.state.loading} />


                        <View style={{ backgroundColor: "#919193", flexDirection: "row" }}>{

                            <View style={styles.searchingBox}>
                                {
                                    // isIOS ?
                                    //     <View > </View>
                                    //     :
                                    isShowingSearchImage ?
                                        <TouchableOpacity style={styles.SearchImageContainer}
                                            onPress={this.ShowHideTextComponentView} >
                                            <Image style={styles.searchImage}
                                                name="search"
                                                source={require("../img/icon_search.png")} />
                                        </TouchableOpacity>
                                        :
                                         <TouchableOpacity style={styles.SearchImageContainer}
                                            onPress={this.cancelSearching} >
                                            <Image style={{ position: "absolute", right: 0, width: 20, height: 20, marginTop: 2 }}
                                                name="search"
                                                source={require("../img/ic_cross.png")} />
                                        </TouchableOpacity>

                                }
                                <TextInput
                                    style={styles.input}
                                    underlineColorAndroid="transparent"
                                    placeholder="Search"
                                    placeholderTextColor="black"
                                    autoCapitalize="none"
                                    returnKeyType="search"
                                    ref={input => { this.textInput = input }}
                                    onChangeText={(this.handleSearchText)}
                                    onSubmitEditing={(this.ShowHideTextComponentView)}
                                    clearButtonMode="never"
                                    autoCorrect={false}
                                />
                            </View>
                        }

                        </View>



                        <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />

                        <FlatList
                            style={{
                                flex: 1,
                                backgroundColor: "white"
                            }}
                            contentContainerStyle={{
                                paddingBottom: this.state.keyBoardHeight,
                                // backgroundColor: "green"
                            }}
                            data={listData}
                            extraData={listData}
                            renderItem={this._renderItem}
                            keyExtractor={(item, index) => `${index}`}
                            onEndReached={this.loadMoreStudents}
                            onEndReachedThreshold={0.8}
                            // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(listData)}
                            ItemSeparatorComponent={(sectionId, rowId) => (
                                <View key={rowId} style={styles.separator} />
                            )}
                            ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
                        />

                    </View>
                </View>

            </SafeAreaView>



        )
    }
}

const styles = StyleSheet.create({

    containerClassList: {
        flex: 0.94,
        flexDirection: 'row'
        //marginBottom: 10
    },
    containerBottom: {
        flex: 0.06,
    },
    container: {
        flex: 1,
        backgroundColor: "#E7E7E7"
    },
    buttonContainer: {
        flexDirection: "row"
    },
    button: {
        height: 50,
        flex: 2,
        marginTop: 15,
        justifyContent: "center",
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2
    },
    rowText: {
        justifyContent: "center",
        alignItems: "center",
        color: "black",
        fontSize: 15,
        marginLeft: 10,
        flex: 0.9
    },
    SearchImageContainer: {
        position: "absolute",
        right: 0,
        width: 25,
        marginEnd: 10,
        height: 25

    },
    list: {
        // marginTop: 5,
        flex: 1,
        backgroundColor: "white"
    },
    searchImage: {
        position: "absolute",
        right: 0,
        width: 25,
        height: 25
    },
    rowTextContainter: {
        flex: 0.9
    },
    editRowTextContainter: {
        flex: 0.8
    },
    input: {
        marginStart: 5,
        marginEnd: Platform.OS !== 'ios' ? 40 : 5
    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 5,
        margin: 12,
        backgroundColor: 'white'
    },

    searchingBox: {
        backgroundColor: "white",
        margin: 10,
        width: "96%",
        height: 40,
        justifyContent: "center",
        borderRadius: 5,
        alignContent: "center"
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
    imageViewPrintout: {
        alignItems: 'center',
        width: 32,
        height: 32,
        marginStart: 10
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#8E8E8E"
    },
    imageContainer: {
        flex: 0.05,
        flexDirection: 'row',
        marginLeft: 5
    },
    imageNextContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20
    },
    touchStyle: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },

    bottomView: {
        width: '100%',
        height: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0
    },
    editView: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginLeft: 10,
        left: 0,

    },
    textInnnerView: {
        fontSize: 20,
        color: '#4799EB'
    },
    textCenterBlack: {
        fontSize: 16,
        color: '#000000'
    },
    deleteView: {

        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginRight: 10,
        right: 0,
        fontSize: 20,
        color: '#000000'
    },
    deleteContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
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
    fitterImageOUterView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    }
});
