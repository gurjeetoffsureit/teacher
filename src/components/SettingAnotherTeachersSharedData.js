import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert, ToastAndroid, SafeAreaView,
  Platform, FlatList,
} from "react-native";

import API from "../constants/ApiConstant";
import SocketConstant from "../constants/SocketConstant";
import { EventRegister } from 'react-native-event-listeners'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import update from 'react-addons-update'
import ComingFrom from '../constants/ComingFrom'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import AppConstant from "../constants/AppConstant";
import ActionSheet from 'react-native-actionsheet'
import Loader from '../ActivityIndicator/Loader';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'

// var DATA = {
//   "success": true, "message": "Successfully loggedin", "data": [{ "firstName": "jyot", "lastName": "Dhiman", "password": "admin123", "isDefaultDataCreated": true, "_id": "5b628ca2b50f4b2064211668", "email": "jyot@gmail.com", "lastLoggedIn": "2018-08-02T04:46:26.151Z", "created": "2018-08-02T04:46:26.151Z", "__v": 0 },
//   { "firstName": "jyot", "lastName": "Dhiman", "password": "admin123", "isDefaultDataCreated": true, "_id": "5b628ca2b50f4b2064211668", "email": "jyot@gmail.com", "lastLoggedIn": "2018-08-02T04:46:26.151Z", "created": "2018-08-02T04:46:26.151Z", "__v": 0 },
//   { "firstName": "jyot", "lastName": "Dhiman", "password": "admin123", "isDefaultDataCreated": true, "_id": "5b628ca2b50f4b2064211668", "email": "jyot@gmail.com", "lastLoggedIn": "2018-08-02T04:46:26.151Z", "created": "2018-08-02T04:46:26.151Z", "__v": 0 },
//   { "firstName": "jyot", "lastName": "Dhiman", "password": "admin123", "isDefaultDataCreated": true, "_id": "5b628ca2b50f4b2064211668", "email": "jyot@gmail.com", "lastLoggedIn": "2018-08-02T04:46:26.151Z", "created": "2018-08-02T04:46:26.151Z", "__v": 0 }
//   ]
// };



//Coming from 
//SettingShareData
export default class SettingAnotherTeachersSharedData extends React.PureComponent {

  constructor(props) {
    super(props);
    
    var stateParams = this.props.navigation.state.params
    this.state = {
      userId: TeacherAssitantManager.getInstance().getUserID(),
      totalUser: 0,
      loading: false,
      listData: [],
      page: 1,
      isAsyncLoader: true,
      isFetchingFromServer: false,
      actionSheetTitle: AppConstant.APP_NAME,
      actionSheetMessage: '',
      isAutoCloseSwipeout: true,
      selectedUser: {},

    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ onLeftHeaderClick: this.onLeftHeaderClick });
    //this.setLoading(true)
    this._hitApiToGetUserListShareWithMe();
    this._addEventListener()
  }

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
    var title = params.screenTitle
        // if (title.length > 15) {
        //     title = title.substring(0, 15) + '...'
        // }
    return {
      title: title,
      gestureEnabled: false,
      headerTitleStyle: StyleTeacherApp.headerTitleStyle,
      headerStyle: StyleTeacherApp.headerStyle,

      headerLeft: ()=>
        <TouchableOpacity onPress={() => params.onLeftHeaderClick()}>
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


    };
  };

  /**
   * This method will get call for pagination
   */

  loadMoreStudents = () => {
    const { listData, totalUser, isFetchingFromServer } = this.state
    if (listData.length < totalUser && !isFetchingFromServer) {

      this.setState({ isFetchingFromServer: true }, function () {
        this._hitApiToGetUserListShareWithMe()
        //console.log('loadMoreStudents')
      })


    }
  }
  deleteNote = (item) => {
    this.setState({
      actionSheetOptions: this.deleteAndCancelOptions,
      actionSheetMessage: TextMessage.ARE_YOU_SURE_YOU_WANT_TO_DELETE_SHARE_DATA_FROM + item.data.firstName + ' ' + item.data.lastName + "?",
      isAutoCloseSwipeout: true,
      selectedUser: item,
    }, function () {
      this.ActionSheet.show()
    })

  }
  //it will help to set edit is on/off
  _handleActionSheetIndex = (index) => {
    if (index == 0) {
      if (this.state.listData.length > 0) {
        var array = [...this.state.listData]
        var userIndex = array.findIndex(user => user.data._id == this.state.selectedUser.data._id)
        if (userIndex > -1) {
          if (this.state.selectedUser.visibility) {
            this._revokeDataWithSelectedUser(array, userIndex)
          }
        }
      }
      //this._revokeDataWithSelectedUser()
    } else {
      this.setState({
        isAutoCloseSwipeout: true
      })
    }

  }

  _revokeDataWithSelectedUser(array, index) {
    this.setLoading(true)

    // if (array[index].data.sharedData == undefined) {
    //   return
    // } 

    var url = API.BASE_URL + API.API_USERS_SHAREDS_DELETE + array[index].data.sharedData._id;
    //console.log("response", JSON.stringify(url));
    requestInfo = {
      method: 'DELETE',
      headers: {},
    }

    TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
      //console.log("response", JSON.stringify(responseJson));
      if (responseJson.success) {
        this.setLoading(false)
        array.splice(index, 1)
        this.setState({
          listData: array.length == 0 ? [] : array,
          //isSelectedUser:false,
          selectedUser: {}
        })
      } else {
        this.setLoading(false)
        this._showToastMessage(responseJson.message)
      }
    }).catch((error) => {
      this.setLoading(false)
      console.error(error);
    });



  }

  _renderItem = ({ item, index }) => {

    return (
      <View>
        <TouchableOpacity
          onPress={() => this.deleteNote(item, index)} >
          <View style={styles.rowContainer}>
            <View style={{ width: '88%' }}>
              <Text style={styles.rowText} numberOfLines={1}>
                {`${item.data.firstName}` + " " + `${item.data.lastName}`}
              </Text>
              <Text style={styles.rowText} numberOfLines={1}>
                {item.data.email}
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



  // _renderItem = ({ item, index }) => {

  //   return (
  //     <TouchableOpacity onPress={() => this.deleteNote(item)}
  //       style={styles.rowContainer}>
  //       <View >
  //         <Text style={styles.rowText} numberOfLines={1}>
  //           {`${item.data.firstName}` + " " + `${item.data.lastName}`}
  //         </Text>
  //         <Text style={styles.rowText} numberOfLines={1}>
  //           {item.data.email}
  //         </Text>
  //       </View>
  //       {item.visibility ?
  //                           <View style={styles.imageContainer}>
  //                               <View style={styles.imageNextContainer}>
  //                                   <Image style={styles.imageView}
  //                                       source={require('../img/check_icon.png')}>
  //                                   </Image>
  //                               </View>
  //                           </View>
  //                           :
  //                           null
  //                       }


  //     </TouchableOpacity>
  //   );
  // };

  _showToastMessage(message) {
    this.toast.show(message, DURATION.LENGTH_SHORT);
}


  render() {
    const { listData, actionSheetTitle,
      actionSheetOptions,
      actionSheetMessage } = this.state
    return (
      <SafeAreaView style={styles.container}>
      <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
        <ActionSheet
          ref={o => this.ActionSheet = o}
          title={'Share Data'}
          options={['Yes', 'No']}
          tintColor={['red', 'blue']}
          destructiveButtonIndex={0}
          message={actionSheetMessage}
          onPress={(index) => { this._handleActionSheetIndex(index) }}
        />
        <Loader loading={this.state.loading} />
        <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
        <FlatList
          style={styles.list}
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
      </SafeAreaView>
    )
  }
  /**
   * This method retunrs json response from server after hitting Api
   */

  _getStudentListFromJson = () => {
    var userId = TeacherAssitantManager.getInstance().getUserID()
    var url = ''
    var API_METHOD = ''
    var requestInfo = {}

    var headerValue = {
      // Accept: 'application/json',
      // 'Content-Type': 'application/json',
      // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
      // 'userId': userId,
    }

    var bodyValue = {
      search: '',
      createdBy: userId,
    }
    //console.log("searched Text ", this.state.searchText)

    url = API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_GET_BY_USER_ID + userId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;

    API_METHOD = 'POST';
    requestInfo = {
      method: API_METHOD,
      headers: headerValue,
      body: JSON.stringify(bodyValue),
    }

    //console.log("url", url)
    //console.log("requestInfo", requestInfo)

    return fetch(url, requestInfo).then((response) => response.json())
      .then((responseJson) => {
        //console.log(responseJson.success);
        this.setLoading(false);
        return responseJson;
      })
      .catch((error) => {
        this.setLoading(false);
        return error;
      });
  }


  /**
   * _hitApiToGetUserListShareWithMe*/

  _hitApiToGetUserListShareWithMe() {
    //console.log("UserId" + this.state.userId)
    var userId = TeacherAssitantManager.getInstance().getUserID()
    //var url = ''
    var API_METHOD = ''
    var requestInfo = {}

    var headerValue = {

    }

    //console.log("searched Text ", this.state.searchText)
    //formation url : users/:userId/sharedwithme/pagination/:page/:limit'
    var url = API.BASE_URL + API.API_USERS + TeacherAssitantManager.getInstance().getUserID() + API.API_USERS_BY_SHARED_WITH_ME_WITH_PAGINATION
      + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;
    API_METHOD = 'GET';
    requestInfo = {
      method: API_METHOD,
      headers: headerValue,
      //body: JSON.stringify(bodyValue),
    }

    //console.log("url", url)
    //console.log("requestInfo", requestInfo)

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
          listData: [...users, ...userList],
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

  _addActionCountInList = (actionList) => {
    for (var i = 0; i < actionList.length; i++) {
      var actionObject = actionList[i]

      var index = this.state.listData.findIndex(studentObject => studentObject.studentId === actionObject._id);
      //console.log(index);
      if (index > -1) {
        this.state.listData[index].actionCount = actionObject.count
        // const updatedStudents = update(this.state.listData, { $splice: [[index,   _student.actionCount]] });  // array.splice(start, deleteCount, item1)       
      }
    }
    //console.log("actions check", this.state.listData)
    this.setState({
      listData: this.state.listData
    })
  }

  // event listener for socket
  _addEventListener = () => {

    this.addTeacherSharedData = EventRegister.addEventListener(SocketConstant.ON_ADD_SHARED_DATA_WITH_ANOTHER_TEACHER, (data) => {
      //console.log("addStudentListener" + JSON.stringify(data))
      this._addAnotherTeacherSharedData(data)
    })

    // this.updateAnotherTeacherSharedData = EventRegister.addEventListener(SocketConstant.ON_UPDATE_ANOTHER_TEACHER_SHARED_DATA, (data) => {
    //   //console.log("addStudentListener", data)
    //   this._updateAnotherTeacherSharedData(data)
    // })

    this.removeAnotherTeacherSharedData = EventRegister.addEventListener(SocketConstant.ON_DELETE_SHARED_DATA_WITH_ANOTHER_TEACHER_BULK, (data) => {
      //console.log('removeStudentListener' + JSON.stringify(data));
      this._removeAnotherTeacherSharedData(data)
    })


  }

  _removeEventListener = () => {
    EventRegister.removeEventListener(this.addTeacherSharedData)
    // EventRegister.removeEventListener(this.updateAnotherTeacherSharedData)
    EventRegister.removeEventListener(this.removeAnotherTeacherSharedData)
  }

  //add data to student
  _addAnotherTeacherSharedData = (sharedObject) => {
    var array = [...this.state.listData]
    if (TeacherAssitantManager.getInstance().getUserID() == sharedObject.sharedWith) {
      array.push({
        data: sharedObject.sharedBy,
        visibility: true
      })
      this.setState({
        listData: array
      })
    }
  }

  //remove student data
  _removeAnotherTeacherSharedData = (sharedObject) => {
    var array = [...this.state.listData]
    if (array.length > 0 && TeacherAssitantManager.getInstance().getUserID() == sharedObject.sharedWith) {

      var index = array.findIndex(userObject => userObject.data._id == sharedObject.sharedBy);
      //console.log(index);
      if (index > -1) {
        array.splice(index, 1);
        this.setState({
          listData: array,
        })
      }


    }


  }




  _updateAnotherTeacherSharedData(student) {

    var array = [...this.state.listData]
    if (array.length > 0) {
      //console.log('_updateShareDataWithAnotherTeacher');

      //console.log(user);

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



  
}

const styles = StyleSheet.create({



  container: {
    flex: 1,
    backgroundColor: "#E7E7E7"
  },


  rowText: {
    justifyContent: "center",
    alignItems: "center",
    color: "black",
    fontSize: 15,
    marginLeft: 10,
    flex: 0.9
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
  imageContainer: {
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
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#8E8E8E"
  },

  imageNextContainer: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20
  },

});

