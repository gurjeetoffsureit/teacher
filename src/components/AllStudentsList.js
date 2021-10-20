import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert, ToastAndroid, SafeAreaView,
  TextInput, Platform, FlatList, Keyboard,
} from "react-native";
import API from "../constants/ApiConstant";
import SocketConstant from "../constants/SocketConstant";
import _ from 'lodash';
import Loader from '../ActivityIndicator/Loader';
import { EventRegister } from 'react-native-event-listeners'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import update from 'react-addons-update'
import ComingFrom from '../constants/ComingFrom'
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import AppConstant from "../constants/AppConstant";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
import StyleTeacherApp from '../styles/StyleTeacherApp'
import Toast, { DURATION } from 'react-native-easy-toast'

export default class AllStudentsList extends React.PureComponent {

  constructor(props) {
    super(props);
    var stateParms = this.props.navigation.state.params
    this.state = {
      //START: AddActionToMany
      count: 0,
      searchText: '',
      isTextEmpty: true,
      isSearched: false,
      isSelected: false,
      //END: AddActionToMany

      offset: 0,
      totalStudents: 0,
      loading: false,
      isAsyncLoader: true,

      isLoadingMore: false,

      listData: [],
      isLoaderShown: true,
      selectedStudentsList: stateParms.comingFrom == ComingFrom.STUDENT_SCREEN ? stateParms.studentIds : [],
      page: 1,
      //studentProfilePic: require("../img/camera_icon.png"),
      selectedClassId: stateParms.selectedClassId, // it will be empty if coming from Allstudents click and will have classId if clicked on any particular class
      createdBy: stateParms.createdBy,
      comingFrom: stateParms.comingFrom,
      comingFromClass_StudentSCreen: stateParms.comingFromClass_StudentSCreen ? stateParms.comingFromClass_StudentSCreen : "",
      isFetchingFromServer: false,
      settingsData: {},
      isWithActions: stateParms.isWithActions != undefined ? stateParms.isWithActions : false,
      dateRangeId: stateParms.dateRangeId != undefined ? stateParms.dateRangeId : '',
      isSelectAllStudent: false,

      keyBoardHeight: 0,

    };
  }

  componentDidMount() {
    TeacherAssitantManager.getInstance().keyboardAddListener(this)
    this.props.navigation.setParams({ onAdd: this.onRightHeaderClick, goBack: this.goToPreviousScreen });
    // this.getStudentData();
    this._addEventListener();
    this.refreshScreen()
    // this._sub = this.props.navigation.addListener(
    //   'didFocus',
    //   this.refreshScreen
    // );
  }

  componentWillUnmount() {
    TeacherAssitantManager.getInstance().keyboardRemoveListener(this)
    // Keyboard.removeListener('keyboardDidShow', this.onKeyboardDidShow);
    // Keyboard.removeListener('keyboardDidHide', this.keyboardDidHide);
  }

  setLoading(isShowing) {
    this.setState({
      loading: isShowing
    });
  }


  refreshScreen = () => {
    this.setState({ page: 1, listData: [], isAsyncLoader: true }, () => {
      this.getStudentData();
    })
  }

  goToPreviousScreen = (comingFrom = '') => {
    Keyboard.dismiss;
    this._removeEventListener()
    if (comingFrom = '') {
      this.props.navigation.state.params.onGoBack();
    } else {
      this.props.navigation.state.params.onGoBack(ComingFrom.ALL_STUDENTS_LIST);
    }
    this.props.navigation.goBack();
  }



  /**
   * This method create top title bar
   */
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    var title = params.screenTitle
    if (params.comingFrom == ComingFrom.ACTION_TO_MANY || params.comingFrom == ComingFrom.EXPORT_DATA_STUDENT_DEMOGRAPHICS ||
      params.comingFrom == ComingFrom.EXPORT_DATA_STUDENT_ACTIONS || params.comingFrom == ComingFrom.EXPORT_DATA_REPORT_OPTION) {
      title += TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, 2)
    }

    // if (title.length > 15) {
    //   title = title.substring(0, 15) + '...'
    // }
    return {
      title: '' + ` ${title}`,
      gestureEnabled: false,
      headerTitleStyle: [StyleTeacherApp.headerTitleStyle, StyleTeacherApp.justifyContentCenter],
      headerStyle: StyleTeacherApp.headerStyle,

      headerLeft: () =>
        <TouchableOpacity onPress={() => params.goBack()}>
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

    };
  };

  /**
   * This method handle titlebar right click ( add button)
   */

  onRightHeaderClick = () => {
    Keyboard.dismiss

    switch (this.state.comingFrom) {
      case ComingFrom.ACTION_TO_MANY:
        this._saveDataForActionToMany();
        break;
      case ComingFrom.STUDENT_SCREEN:
        this._saveDataForClasses();
        break
      case ComingFrom.HOME_EMAIL_BLAST:
      case ComingFrom.SETTINGS_EMAIL_BLAST_SPECIFY_RECIPIENT:
        this._setDataForEmail()
        break
      case ComingFrom.EXPORT_DATA_REPORT_OPTION:
        this._getStudentTextReport();
        break
      case ComingFrom.EXPORT_DATA_STUDENT_DEMOGRAPHICS:
        this._getStudentDemographicsOrActionCsv(API.API_STUDENT_DEMOGRAPHICS_REPORT)
        break
      case ComingFrom.EXPORT_DATA_STUDENT_ACTIONS:
        this._getStudentDemographicsOrActionCsv(API.API_STUDENT_ACTIONS_REPORT)
        break
    }

  }

  _getStudentDemographicsOrActionCsv = (url) => {
    if (this.state.selectedStudentsList.length == 0) {
      this._showToastMessage('Please select atleast one student')
      return
    }
    this.setLoading(true);

    let apiRequest = this.getApiRequestData();



    TeacherAssitantManager.getInstance()._serviceMethod(API.BASE_URL + url + TeacherAssitantManager.getInstance().getUserID(), apiRequest)
      .then((responseJson) => {

        //console.log('response sent successfully');
        this.setLoading(false);
        if (responseJson.success) {
          TeacherAssitantManager.getInstance().setCsvDownloadLinkandOpenTheDeafultEmail(responseJson,this.state.settingsData.toTeacherEmail)
        } else {
          this._showToastMessage(responseJson.message)
        }
      })
      .catch((error) => {
        this._showToastMessage(error.message)
      })
  }

  //getApiRequestData
  getApiRequestData() {
    let apiRequest = {
      method: 'post',
      headers: {},
    };

    if (this.state.selectedClassId != "") {
      apiRequest.body = { class: this.state.selectedClassId };
      if (!this.state.isSelectAllStudent) {
        apiRequest.body = {
          ...apiRequest.body,
          ids: this.state.selectedStudentsList
        };
      }

      apiRequest.body = JSON.stringify(apiRequest.body);

    } else if (!this.state.isSelectAllStudent) {
      apiRequest.body = JSON.stringify({ ids: this.state.selectedStudentsList });
    }
    return apiRequest;
  }

  // //setCsvDownloadLinkandOpenTheDeafultEmail
  // setCsvDownloadLinkandOpenTheDeafultEmail(responseJson) {
  //   let dataLinkList = responseJson.data.link //.split("token=") //escape(responseJson.data.link)
  //   let emailString = `This link is available for 7 days ${dataLinkList}`//token=${token}`;
  //   if (dataLinkList && dataLinkList != '') {
  //     var emailUrl = TeacherAssitantManager.getInstance().getMailToUrl(this.state.settingsData.toTeacherEmail, emailString);
  //     Linking.openURL(emailUrl)
  //       .catch(err => console.error('An error occurred', err));
  //   } else {
  //     //this._showToastMessage(TextMessage.NO_EMAIL_ID_TO_SEND)
  //   }
  // }

  _saveDataForActionToMany = () => {
    // //console.log("Assign Clicked")

    if (this.state.selectedStudentsList.length == 0) {
      this._showToastMessage("Select at least one student")
      // TeacherAssitantManager.getInstance().showAlert("Select atleast one student")
    }
    else {
      var selectedActionsList = this.props.navigation.state.params.selectedActionList
      var selectedStudents = this.state.selectedStudentsList


      let rawObject = {}

      if (this.state.isSelectAllStudent) {
        rawObject = {
          studentActions: [
            {
              createdBy: TeacherAssitantManager.getInstance().getUserID()
            }
          ],
          studentActionsDetails: selectedActionsList
        }

      } else {
        var studentActions = []

        for (var i = 0; i < selectedStudents.length; i++) {
          var jsonStudentDetailsObject = {
            studentID: selectedStudents[i],
            createdBy: TeacherAssitantManager.getInstance().getUserID()
          }
          studentActions.push(jsonStudentDetailsObject)
        }

        rawObject = {
          studentActions: studentActions,
          studentActionsDetails: selectedActionsList
        }
      }

      this._saveMultipleStudentsActions(rawObject)
      //console.log("Loop Finished and object created")
    }
  }

  _saveDataForClasses = () => {
    var arrayToSend = {}
    var studentArrayWithClass = []
    var selectedStudent = this.state.selectedStudentsList
    //console.log('student ids==' + selectedStudent.length)
    let userId = TeacherAssitantManager.getInstance().getUserID()
    var _classId = this.state.selectedClassId

    for (var i = 0; i < selectedStudent.length; i++) {
      arrayToSend = {
        classID: _classId,
        studentID: selectedStudent[i],
        createdBy: userId
      }
      studentArrayWithClass.push(arrayToSend)
    }

    var url = API.BASE_URL + API.API_STUDENTS_CLASSES + API.API_ASSIGN_BULK_FOR_CLASSES + _classId
    //console.log("UserId", this.props.navigation.state.params.userId)
    //console.log("student id array===" + JSON.stringify(studentArrayWithClass))

    //console.log("url is", url);

    this.setLoading(true)
    TeacherAssitantManager.getInstance()._serviceMethod(url, {
      method: 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
        // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
        // 'userId': TeacherAssitantManager.getInstance().getUserID(),
      },
      body: JSON.stringify(studentArrayWithClass)

    })
      .then((responseJson) => {
        // //console.log("response==" + responseJson.message);
        // //console.log("response==" + JSON.stringify(responseJson));

        if (responseJson.success) {
          this.setLoading(false)
          this.goToPreviousScreen()
        } else {
          this.setLoading(false)
          this._showToastMessage(responseJson.message)
          // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
        }
      })
      .catch((error) => {
        //console.log("error==" + error)
      });
  }

  _getStudentTextReport() {
    this.setLoading(true);
    let apiRequest = this.getApiRequestData();

    TeacherAssitantManager.getInstance()._serviceMethod(API.BASE_URL + API.API_STUDENT_TEXT_REPORT + TeacherAssitantManager.getInstance().getUserID(), apiRequest)
      .then((responseJson) => {
        //console.log('response sent successfully');
        this.setLoading(false);
        if (responseJson.success) {
          TeacherAssitantManager.getInstance().setCsvDownloadLinkandOpenTheDeafultEmail(responseJson,this.state.settingsData.toTeacherEmail)
        }
        else {
          //console.log('responseJson.not success ');
          this._showToastMessage(responseJson.message);
        }
      })
      .catch((error) => {
        // this.setLoading(false); //hide activate indicator 
        //this.setLoading(false);
        this._showToastMessage(error.message);
        //  this.showAlert(error.message);
        //console.log('response sent not successfully' + JSON.stringify(error));
      });
  }

  _getCustomizdDeatilFieldString(element, emailString) {
    let customizedDetailFieldList = element.customizeddetailfielddatas;
    for (let index = 0; index < customizedDetailFieldList.length; index++) {
      const detailFieldElement = customizedDetailFieldList[index];
      emailString = emailString + '\n' + detailFieldElement.value + ':' + detailFieldElement.customizeddetailfields.customizedDetailField;
    }
    return emailString;
  }

  getActionString(actionList) {
    let actionString = ''
    for (let index = 0; index < actionList.length; index++) {
      const actionElement = actionList[index];
      if (index == 0) {
        actionString += ('\n Action: ' + actionElement.action + '\n Date: ' + TeacherAssitantManager.getInstance()._changeDateFormat(new Date(actionElement.date)) +
          '\n TeacherResponse: ' + ((actionElement.teacherResponse == "false" || actionElement.teacherResponse == "") ? "No" : "Yes") + '\n ParentNotified: ' + ((actionElement.parentNotified == "false" || actionElement.parentNotified == "") ? "No" : "Yes"));
      } else {
        actionString += ('\n\n Action: ' + actionElement.action + '\n Date: ' + TeacherAssitantManager.getInstance()._changeDateFormat(new Date(actionElement.date)) +
          '\n TeacherResponse: ' + ((actionElement.teacherResponse == "false" || actionElement.teacherResponse == "") ? "No" : "Yes") + '\n ParentNotified: ' + ((actionElement.parentNotified == "false" || actionElement.parentNotified == "") ? "No" : "Yes"));

      }
    }

    //console.log('actionString' + actionString)
    return actionString;
  }

  _setDataForEmail() {



    var emailString = ''
    var selectedStudent = this.state.selectedStudentsList


    var studentIdIndex = 0
    for (studentIdIndex; studentIdIndex < selectedStudent.length; studentIdIndex++) {
      var studentIndex = this.state.listData.findIndex((stduent) => stduent.studentId != undefined &&
        stduent.studentId == selectedStudent[studentIdIndex])
      if (studentIndex > -1) {
        var itemStudent = this.state.listData[studentIndex]
        var elementParentList = itemStudent.data.parents;
        if (elementParentList.length > 0) {
          var parentIndex = 0
          for (parentIndex; parentIndex < elementParentList.length; parentIndex++) {
            var elementEmailList = elementParentList[parentIndex].email;
            if (elementEmailList.length > 0) {
              var emailIndex = 0
              for (emailIndex; emailIndex < elementEmailList.length; emailIndex++) {
                var email = elementEmailList[emailIndex]
                if (email.emailBlast) {
                  emailString = emailString.length == 0 ? email.value : emailString + ',' + email.value
                }
              }
            }
          }
        }
      }
    }
    if (emailString != '') {
      // var emailUrl = ("mailto:" + this.state.settingsData.toTeacherEmail + "?&bcc=" + emailString + "&subject=Teacher's Assistant Pro Version " +
      //   TeacherAssitantManager.getInstance().getBuildVersion() + "&body=")
      var emailUrl = TeacherAssitantManager.getInstance().getMailToUrl(this.state.settingsData.toTeacherEmail, "", emailString, false)


      Linking.openURL(emailUrl)
        .catch(err => console.error('An error occurred', err));
    } else {
      this._showToastMessage(TextMessage.NO_EMAIL_ID_TO_SEND)
      // TeacherAssitantManager.getInstance().showAlert(TextMessage.NO_EMAIL_ID_TO_SEND)
    }

  }



  _saveMultipleStudentsActions = async (rawObject) => {
    // rawObject.isAddActionToMany = true
    this.setLoading(true)
    // let body = rawObject
    let isUpdate = this.state.isUpdate;
    const { response, item, body } = await TeacherAssitantManager.getInstance().uploadActionImage(rawObject, isUpdate)

    if (item.index > -1 && !response.Key) {
      this.setLoading(false);
      return;
    }


    var url = API.BASE_URL + API.API_STUDENT_ACTION_ASSIGN + API.API_ACTION_ASSIGN_AND_CREATE + (this.state.isUpdate ? "/" + this.state.studentActionID : '')
    if (this.state.isSelectAllStudent) {
      url = url + '?selectAll=true'
    }
    // let abcd =  JSON.stringify(rawObject)
    // alert(this.state.isSelectAllStudent)
    // //console.log('url _saveMultipleStudentsActions is: ', abcd);
    TeacherAssitantManager.getInstance()._serviceMethod(url, {
      method: this.state.isUpdate ? 'PUT' : 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
        // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
        // 'userId': TeacherAssitantManager.getInstance().getUserID(),
      },
      body: JSON.stringify(body)
    })
      // .then((response) => response.json())
      .then((responseJson) => {
        //console.log("response==========" + JSON.stringify(responseJson));
        //console.log("rawObject==========" + JSON.stringify(rawObject));
        // //console.log("response==" + responseJson.message);

        if (responseJson.success) {
          this.setLoading(false)

          this.props.navigation.navigate("HomeScreen")
          this._showToastMessage(responseJson.message)
          // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)

          // this.goToPreviousScreen()
        } else {
          this.setLoading(false)
          this._showToastMessage(responseJson.message)
          // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
          // this.showAlert(responseJson.message)
        }
        // this.goToPreviousScreen()

      })
      .catch((error) => {
        //console.log("error===" + error)
      });
  }

  /**
   * This method will set few states empty and call to api hit method to get list of students
   */
  searchStudent = () => {
    // this.showAlert("searched")
    //this.setLoading(true);
    this.setState({
      offset: 0,
      page: 1,
      listData: [],
      isLoaderShown: true,
      isAsyncLoader: true
    }, function () {
      //console.log("value " + this.state.offset)

      this.getStudentData()
    });
  }

  /**
   * This method will show and hide cancel and search botton for search text.
   */

  ShowHideTextComponentView = () => {

    if (!this.state.searchText == '') {
      //show Cancel icon
      this.setState({ isTextEmpty: false })

    }
    else {
      //show search icon
      this.setState({ isTextEmpty: true })

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


    this.setState({ searchText: text, isTextEmpty: true }, function () {
      if (text == '' && this.state.isSearched == true) {
        this.searchStudent()
      }
    });
  }

  /**
   * This method will get call for pagination
   */

  loadMoreStudents = () => {

    if (this.state.listData.length < this.state.totalStudents && !this.state.isLoadingMore) {

      this.setState({
        offset: this.state.listData.length,
        isFetchingFromServer: true,
        isLoadingMore: true
      }, function () {
        if (this.state.offset < this.state.totalStudents) {
          //   this.showAlert(this.state.offset+" offset "+ this.state.limit)
          this.getStudentData()
        }
      });
    }
  }

  _renderItem = ({ item, index }) => {
    let image = item.data.image
    // //console.log('itemmmmmmmmmmmm', JSON.stringify(item));
    return (
      <View>
        <TouchableOpacity
          onPress={() => this._setVisiblityOfItem(index)} >
          <View style={styles.rowContainer}>
            {
              image != undefined && image.uri != undefined && this.state.settingsData.studentThumbnailImages ?
                <Image
                  style={{
                    width: 40,
                    height: 40,
                  }}
                  source={image}
                /> : null
            }

            <View style={styles.rowTextContainter}>
              <Text style={styles.rowText}>
                {`${item.data.displayName}`}
              </Text>
            </View>
            {
              <View style={{ flex: 0.1, justifyContent: 'center', alignItems: 'center', }}>
                {
                  item.visibility ?
                    <Image style={{ height: 16, width: 16, }}
                      name="search"
                      source={require("../img/check_icon.png")} /> : null
                }
              </View>
            }
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  _showToastMessage(message) {
    this.toast.show(message, DURATION.LENGTH_SHORT);
  }

  render() {
    let { count, comingFrom } = this.state
    var isTrue = comingFrom == ComingFrom.ACTION_TO_MANY ||
      comingFrom == ComingFrom.HOME_EMAIL_BLAST ||
      comingFrom == ComingFrom.SETTINGS_EMAIL_BLAST_SPECIFY_RECIPIENT ||
      comingFrom == ComingFrom.EXPORT_DATA_STUDENT_DEMOGRAPHICS ||
      comingFrom == ComingFrom.EXPORT_DATA_STUDENT_ACTIONS ||
      comingFrom == ComingFrom.EXPORT_DATA_REPORT_OPTION

    let isIOS = Platform.OS == 'ios'
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Toast ref={o => this.toast = o}
            position={'bottom'}
            positionValue={200}
          />
          <Loader loading={this.state.loading} />
          <View style={isTrue ? { flex: 0.918 } : { flex: 1 }}>
            {
              isTrue &&
              <View style={{ backgroundColor: "#919193", flexDirection: "row" }}>
                <View style={styles.searchingBox}>
                  {
                    isIOS ?
                      null
                      :
                      this.state.isTextEmpty ?
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
                    clearButtonMode="always"
                  />

                </View>
              </View>
            }
            <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />

            <FlatList
              style={styles.list}
              data={this.state.listData}
              contentContainerStyle={{
                paddingBottom: this.state.keyBoardHeight,
                // backgroundColor: "green"
              }}
              extraData={this.state.listData}
              renderItem={this._renderItem}
              keyExtractor={(item, index) => `${index}`}
              onEndReached={this.loadMoreStudents}
              onEndReachedThreshold={0.8}
              // onEndThreshold={TeacherAssitantManager.getInstance().getFlatListThrashHoldIndex(this.state.listData)}
              ItemSeparatorComponent={(sectionId, rowId) => (
                <View key={rowId} style={styles.separator} />
              )}
              ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
            />
          </View>
          {
            isTrue ?
              <View style={{ flex: 0.002, backgroundColor: 'gray' }}
              /> : null
          }
          {
            isTrue ?
              <View style={styles.bottomOuterView}>
                <View style={styles.bottomInnerView}>

                  <TouchableOpacity style={styles.editView}
                    disabled={this.state.listData.length == 0}
                    onPress={() => this._selectUnselectAllStudents(false)}>
                    <Text style={styles.textInnnerView}>Select None</Text>
                  </TouchableOpacity>

                  {/* <View style={styles.deleteView}>
                    <Text style={styles.textInnnerView}>Count: {count} </Text>
                  </View> */}


                  <TouchableOpacity style={styles.deleteView}
                    disabled={this.state.listData.length == 0}
                    onPress={() => this._selectUnselectAllStudents(true)}>
                    <Text style={styles.textInnnerView}>Select All</Text>
                  </TouchableOpacity>


                </View>
              </View> : null
          }
        </View>
      </SafeAreaView>
    )
  }

  _setVisiblityOfItem = (index) => {
    let posts = this.state.listData.slice();

    let targetPost = posts[index];
    if (targetPost.visibility) {
      var indexNeedToDelete = this.state.selectedStudentsList.indexOf(targetPost.studentId)
      this.state.selectedStudentsList.splice(indexNeedToDelete, 1);
    }
    else {
      this.state.selectedStudentsList.push(targetPost.studentId)
    }
    targetPost.visibility = !targetPost.visibility;
    this._counter();
    this.setState({ posts, isSelectAllStudent: false });
  }

  incrementCounter = () => {
    this.setState({
      count: this.state.count + 1
    })
  }

  decrementCounter = () => {
    this.setState({
      count: this.state.count - 1
    })
  }

  _counter = () => {
    const { listData } = this.state;
    let data = _.filter(listData, function (o) { return o.visibility; });
    if (data) {
      this.setState({ count: data.length });
    } else {
      this.setState({ count: 0 });
    }
  }

  _selectUnselectAllStudents = (isSelected) => {
    //TeacherAssitantManager.getInstance().showAlert("kldsfjkldfskldafsjklfsdljk")
    var completeList = this.state.listData
    // this.setState({
    //   selectedStudentsList: []
    // }, function () { })

    this.setState({
      selectedStudentsList: []
    })

    var selectedStudentIds = []
    for (var i = 0; i < completeList.length; i++) {
      var student = completeList[i]
      student.visibility = isSelected
      if (isSelected) {
        selectedStudentIds.push(student.studentId)
      }
    }
    this.setState({
      // listData: completeList,
      selectedStudentsList: selectedStudentIds,
      isSelectAllStudent: isSelected
    }, () => {
      this._counter();
    })
  }

  _selectAllStudents = (isSelectAllStudent) => {
    var completeList = this.state.listData
    var studentIds = []

    for (let index in completeList) {
      completeList[index].visibility = true
    }

    this.setState({ listData: [] }, function () {
      this.setState({
        listData: completeList,
        isSelectAllStudent: isSelectAllStudent,

        selectedStudentsList: completeList
      })
    })

    return
    completeList.forEach((element) => {

      if (element.title == 'Parent') {
        var emailList = element.data
        if (emailList.length > 0) {
          emailList.forEach(emailElement => {
            emailElement.visibility = isSelectAll
            if (isSelectAll) {
              studentIds.push({
                studentId: element.studentId, emailId: emailElement.email._id, parentId: emailElement.parentId
              })
            }

          })
        }
      }
    })
    this.setState({
      selectedStudentsEmailIdList: [...studentIds],
      isSelectAll: isSelectAll
    })
    //console.log(this.state.selectedStudentsEmailIdList)
  }

  /**
   * This method will gets call when user come back on this scren from add or update studetnDetailscreen
   */
  refresh() {

  };



  /**
   * This method set Flag for searching, isSearching is true if search is enabled. 
   */
  setFlagForSearching = () => {
    if (this.state.searchText == '') {
      this.setState({ isSearched: false })
    }
    else {
      Keyboard.dismiss;
      this.setState({ isSearched: true })

    }
  }


  //help to prepare student object 
  _getStudentObject(student, visibility) {
    //console.log('student', student);

    return {
      studentId: student._id,
      visibility: visibility,
      data: student,
      actionCount: 0
    };
  }

  /**
   * 
   * @param {*} studentsData 
   * @param {*} studentListData 
   */
  _setDataForActionToMany(studentsData, studentListData) {
    var thisState = this.state;
    for (var i = 0; i < studentsData.length; i++) {
      var student = studentsData[i];
      if (thisState.selectedStudentsList.length > 0 && thisState.selectedStudentsList.indexOf(student._id) > -1) {
        //this.state.studentIds.push(student._id);
        studentListData.push(this._getStudentObject(student, true));
      }
      else {
        studentListData.push(this._getStudentObject(student, false));
      }
      // studentListData.push(this._getStudentObject(student, false));
    }
    //return studentListData;
  }

  _setDataForClassStudent(studentsData, studentListData) {
    var thisState = this.state;
    for (var i = 0; i < studentsData.length; i++) {
      //console.log("studentsData", studentsData);
      // //console.log("this.state.studentIds", this.state.studentIds);
      var student = studentsData[i];

      if (thisState.selectedStudentsList.length > 0 && thisState.selectedStudentsList.indexOf(student._id) > -1) {
        //this.state.studentIds.push(student._id);
        studentListData.push(this._getStudentObject(student, true));
      }
      else {
        studentListData.push(this._getStudentObject(student, false));
      }
    }
  }

  /**
   * Hit Api to get students list
   */
  getStudentData() {

    ////console.log("UserId" + this.state.userId)
    this.setFlagForSearching()
    var userId = TeacherAssitantManager.getInstance().getUserID()

    var url = ''

    //this section will work for EXPORT_DATA_REPORT_OPTION (setting>export>text report with action or all)
    if (this.state.comingFrom == ComingFrom.EXPORT_DATA_REPORT_OPTION) {
      url = (API.BASE_URL + API.API_STUDENTS_REPORT_LISTING + userId +
        API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT)
      url = this.getUrlAccordingToParameters(url);
      // //console.log('url getStudentData getStudentData',url);
    } else {
      //this for others parts
      url = (API.BASE_URL + API.API_STUDENTS + API.API_GET_BY_USER_ID + userId + API.API_PAGINATION
        + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT)
      if ((this.state.comingFrom == ComingFrom.ACTION_TO_MANY
        || this.state.comingFrom == ComingFrom.EXPORT_DATA_STUDENT_DEMOGRAPHICS ||
        this.state.comingFrom == ComingFrom.EXPORT_DATA_STUDENT_ACTIONS ||
        this.state.comingFrom == ComingFrom.HOME_EMAIL_BLAST) &&
        this.state.selectedClassId != '') {
        url = (API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_GET_BY_USER_ID + this.state.createdBy +
          "/classid/" + this.state.selectedClassId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT)
      }
    }

    //console.log("url", url)
    let bodyVaLue = {
      method: 'POST',
      headers: {},
      body: JSON.stringify({
        search: this.state.searchText,
        createdBy: userId,
      }),
    }

    if (this.state.comingFrom == ComingFrom.EXPORT_DATA_REPORT_OPTION) {
      bodyVaLue = {
        method: 'GET',
        headers: {},
      }
    }

    TeacherAssitantManager.getInstance()._serviceMethod(url, bodyVaLue).then((responseJson) => {
      //console.log(responseJson.message);
      if (responseJson.success) {
        var newArray = this.state.listData;
        //console.log("jsonREsponse is " + JSON.stringify(responseJson))

        var studentListData = []
        var data = responseJson.data
        // //console.log('dataaaaa',data);

        var studentsData = data.studentsData
        //console.log('dataaaaa  --> ', studentsData);

        var thisState = this.state;

        for (var i = 0; i < studentsData.length; i++) {
          //console.log("studentsData", studentsData);
          //console.log("this.state.studentIds", thisState.studentIds);
          var student = studentsData[i];
          if (thisState.selectedStudentsList.length > 0 && thisState.selectedStudentsList.indexOf(student._id) > -1) {
            studentListData.push(this._getStudentObject(student, true));
          }
          else {
            if (this.state.isSelectAllStudent) {
              this.state.selectedStudentsList.push(student._id)
            }

            studentListData.push(this._getStudentObject(student, this.state.isSelectAllStudent));
          }
        }

        //console.log("JSON.stringify([...newArray, ...studentListData]2 --> ", JSON.stringify([...newArray, ...studentListData]))
        //console.log("JSON.stringify([...newArray, ...studentListData]3 --> ", JSON.stringify(newArray))

        this.setState({
          totalStudents: responseJson.data.count,
          // page: responseJson.data.pageCount + 1,
          page: this.state.page + 1,
          listData: [...newArray, ...studentListData],
          isAsyncLoader: false,
          isFetchingFromServer: false,
          isLoadingMore: false,
          settingsData: data.settingsData
        })

        //console.log("Student data is ", studentListData)
        this.props.navigation.setParams({ studentCount: responseJson.data.count })
      } else {
        this.setState({ isAsyncLoader: false, isFetchingFromServer: false })
        this._showToastMessage(responseJson.message)
      }
    }).catch((error) => {
      this.setState({
        isAsyncLoader: false,
        isFetchingFromServer: false,
        isLoadingMore: false
      })
      console.error(error);
    });
  }


  // event listener for socket
  _addEventListener = () => {
    this.addStudentListener = EventRegister.addEventListener(SocketConstant.ADD_STUDENT, (data) => {
      if (this.state.comingFrom == ComingFrom.STUDENT_SCREEN ||
        (this.state.selectedClassId == '' && this.state.comingFrom == ComingFrom.ACTION_TO_MANY)) {
        var classId = this.state.selectedClassId
        var comingFrom = this.state.comingFrom

        this._addDataToStudent(data)
      }

    })

    this.removeStudentListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_BULK_STUDNET, (data) => {
      //console.log('removeStudentListener');
      if (this.state.comingFrom == ComingFrom.STUDENT_SCREEN ||
        (this.state.selectedClassId == '' && this.state.comingFrom == ComingFrom.ACTION_TO_MANY)) {
        this._removeStudentData(data)
      }

    })

    this.updateStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT, (data) => {
      //console.log('UpdateStudentListener');
      if (this.state.comingFrom == ComingFrom.STUDENT_SCREEN ||
        (this.state.selectedClassId == '' && this.state.comingFrom == ComingFrom.ACTION_TO_MANY)) {
        this._UpdateStudentData(data)
      }
    })


    //setting function
    this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
      //console.log("addStudentListener", data)
      this._updateUserSetting(data)
    })

    this.onSettingsDeleteAll = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
      //console.log('onSettingsDeleteAll');
      if (data.resetToDefault) {
        const { comingFrom, comingFromClass_StudentSCreen } = this.state
        let comingFromScreen = comingFrom
        if (comingFromClass_StudentSCreen) {
          comingFromScreen = comingFromClass_StudentSCreen
        }
        setTimeout(() => {
          switch (comingFromScreen) {
            case ComingFrom.ACTION_TO_MANY:
              this.navigateBackToNScreen(3);
              break;
            case ComingFrom.CLASSES_SCREEN_STUDENT_SCREEN:
              // this.props.navigation.pop(3)
              this.navigateBackToNScreen(3);
              break
            case ComingFrom.HOME_EMAIL_BLAST:
              this.navigateBackToNScreen(2);
              break
            // case ComingFrom.EXPORT_DATA_REPORT_OPTION:
            //   this._getStudentTextReport();
            //   //}
            //   break
            case ComingFrom.EXPORT_DATA_STUDENT_DEMOGRAPHICS:
              this.navigateBackToNScreen(2);
              break
            case ComingFrom.EXPORT_DATA_STUDENT_ACTIONS:
              this.navigateBackToNScreen(2);
              break
          }


        }, 450);

      }
      // this._onSettingsDeleteAll(data);


    })



    // this.deleteStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_STUDENT_CLASS_BULK, (data) => {
    //   //console.log('UpdateStudentListener');
    //   var classID = this.state.selectedClassId
    //   var comingFrom = this.state.comingFrom
    //   if (classID != '' && this.state.selectedClassId == data.classId &&
    //     comingFrom == COMING_FROM.STUDENT_SCREEN) {
    //     // this._deleteStudentClassBulkListener(data)
    //     this.deleteStudentClassBulkData = data.data
    //   }
    // })

    // this.addStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_ADD_STUDENT_CLASS_BULK, (data) => {
    //   //console.log('UpdateStudentListener');
    //   var classID = this.state.selectedClassId
    //   var comingFrom = this.state.comingFrom
    //   if (classID != '' && this.state.selectedClassId == data.classId &&
    //     comingFrom == COMING_FROM.STUDENT_SCREEN) {
    //     this._addStudentClassBulk(data.data)
    //   }
    // })


  }

  _removeEventListener = () => {
    EventRegister.removeEventListener(this.addStudentListener)
    EventRegister.removeEventListener(this.removeStudentListener)
    EventRegister.removeEventListener(this.updateStudentListener)
    EventRegister.removeEventListener(this.deleteStudentClassBulkListener)
    EventRegister.removeEventListener(this.addStudentClassBulkListener)
    EventRegister.removeEventListener(this.updateUserSetting)
    EventRegister.removeEventListener(this.onSettingsDeleteAll)



  }

  //add data to student
  _addDataToStudent = (student) => {

    if (this.state.isSearched == false) {


      var index = this.state.listData.findIndex(studentObject => studentObject.studentId === student._id);
      if (index == -1) {
        //console.log('_addDataToStudent==' + student)
        //console.log(student)

        var listDataObjet = {}
        listDataObjet = {
          studentId: student._id,
          visibility: false,
          data: student,
          actionCount: 0
        }
        if (this.state.listData.length == this.state.totalStudents) {
          //console.log('enter this.state.listData.length == this.state.totalStudents')
          this.state.listData.push(listDataObjet)
        } else {
          //console.log('not enter this.state.listData.length == this.state.totalStudents')
        }

        var _studentCount = this.state.totalStudents + 1
        this.setState({
          totalStudents: _studentCount
        }, function () {
          this.props.navigation.setParams({ studentCount: _studentCount })
        })
        //console.log("totalStudents", this.state.totalStudents)
      }

    }
  }

  //remove student data
  _removeStudentData = (studentList) => {
    var deletedStudents = 0;

    if (this.state.listData.length > 0) {

      //console.log('_removeStudentData')
      //console.log(studentList._id)
      var array = [...this.state.listData];

      for (var i = 0; i < studentList._id.length; i++) {
        //console.log('for studentList')
        //console.log(studentList._id[i])

        var index = array.findIndex(studentObject => studentObject.studentId == studentList._id[i]);
        //console.log('index' + index)

        if (index > -1) {
          array.splice(index, 1);
          deletedStudents = deletedStudents + 1
        }
      }

      var studentcount = this.state.totalStudents - deletedStudents
      //console.log("studentCount", studentcount)
      this.props.navigation.setParams({ studentCount: studentcount })
      this.setLoading(false);
      this.setState({
        listData: array,
        selectedStudentsList: [],
        totalStudents: studentcount
      })
      //console.log('arrayyyyy', JSON.stringify(listData));
    }
  }

  navigateBackToNScreen(screenIndex) {
    this.props.navigation.pop(screenIndex);
  }

  getUrlAccordingToParameters(url) {
    if (this.state.isWithActions) {
      url += '?withActions=true';
      if (this.state.selectedClassId != '') {
        url += '&classId=' + this.state.selectedClassId;
        if (this.state.dateRangeId != '') {
          url += '&dateRangeId=' + this.state.dateRangeId;
        }
      }
      else if (this.state.dateRangeId != '') {
        url += '&dateRangeId=' + this.state.dateRangeId;
      }
    }
    else if (this.state.selectedClassId != '') {
      url += '?classId=' + this.state.selectedClassId;
      if (this.state.dateRangeId != '') {
        url += '&dateRangeId=' + this.state.dateRangeId;
      }
    }
    else if (this.state.dateRangeId != '') {
      url += '?dateRangeId=' + this.state.dateRangeId;
    }
    return url;
  }

  _UpdateStudentData(student) {

    if (this.state.listData.length > 0) {
      //console.log('_UpdateStudentData');

      //console.log(student);

      var index = this.state.listData.findIndex(studentObject => studentObject.studentId === student._id);
      //console.log('index');
      //console.log(index);
      if (index > -1) {
        //console.log('this.state.listData[index]');
        //console.log(this.state.listData[index]);
        var _student = this.state.listData[index];
        _student.data = student
        //this.state.listData[index].

        const updatedStudents = update(this.state.listData, { $splice: [[index, _student.data]] });  // array.splice(start, deleteCount, item1)
        this.setState({ listData: updatedStudents });
        //console.log('aaaaaa', JSON.stringify(listData))
      }
    }

  }

  //_updateUserSetting
  _updateUserSetting = (settingData) => {

    if (settingData.studentSortOrder != undefined || settingData.studentDisplayOrder != undefined) {
      this.setState({
        page: 1,
        listData: [],
        studentIds: [],
        isAsyncLoader: true
      }, function () {

        this.getStudentData()
      });
    } else if (settingData.studentThumbnailImages != undefined) {
      // var _settingData = this.state.settingsData
      this.state.settingsData.studentThumbnailImages = settingData.studentThumbnailImages
      this.setState({
        settingsData: this.state.settingsData
      })
    } else if (settingData.toTeacherEmail != undefined) {
      // var _settingData = this.state.settingsData
      this.state.settingsData.toTeacherEmail = settingData.toTeacherEmail
      this.setState({
        settingsData: this.state.settingsData
      })
    }
  }


  //deleteStudent from class (assignerd will unassigned)
  _deleteStudentClassBulkListener(data) {


  }

  // addStudent into selected class (unassignerd will assigned)
  _addStudentClassBulk(data) {
    for (var i = 0; i < data.length; i++) {
      var index = this.deleteStudentClassBulkData.findIndex(object => object.student)
    }


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
  // rowText: {
  //   justifyContent: "center",
  //   alignItems: "center",
  //   fontSize: 15,
  //   marginLeft: 10,
  //   flex: 1,
  // },

  rowText: {
    fontSize: 15,
    marginLeft: 10,
    justifyContent: "flex-start",
    textAlignVertical: 'center'
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
    flex: 0.9, justifyContent: "center",
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
  deleteView: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    marginRight: 10,
    right: 0,
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
});
