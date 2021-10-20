import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert, ToastAndroid, SafeAreaView,
  Dimensions,
  TextInput, Platform, FlatList, PermissionsAndroid, LayoutAnimation, UIManager, Linking
} from "react-native";
const { width } = Dimensions.get('window')
import API from "../constants/ApiConstant";
import SocketConstant from "../constants/SocketConstant";
import { Keyboard } from 'react-native';
import Loader from '../ActivityIndicator/Loader';
import { EventRegister } from 'react-native-event-listeners'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import update from 'react-addons-update'
import ActionSheet from 'react-native-actionsheet'
import ComingFrom from '../constants/ComingFrom'
import API_PARAM from "../constants/ApiParms";
import { selectContact } from 'react-native-select-contact';

// import ContactsWrapper from 'react-native-contacts-wrapper';
import DeviceInfo from 'react-native-device-info';
import SyncingLoader from '../ActivityIndicator/SyncingLoader'
import TextMessage from "../constants/TextMessages";
import FlatListFooterLoader from '../ActivityIndicator/FlatListFooterLoader'
// import nextFrame from 'next-frame';
import AppConstant from "../constants/AppConstant";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast';
import Subscription from '../ActivityIndicator/Subscription'
const isIOS = Platform.OS == 'ios'

//Coming from 
//1.ClassScreen
//2. HomeScreen
export default class StudentScreen extends React.PureComponent {
  _showToastMessage(message) {
    this.toast.show(message, DURATION.LENGTH_SHORT);
  }

  constructor(props) {
    super(props);

    var stateParams = this.props.navigation.state.params
    this.state = {
      comingFrom: stateParams.comingFrom,
      userId: TeacherAssitantManager.getInstance().getUserID(),
      searchText: '',
      totalStudents: 0,
      loading: false,
      status: true,
      isSearched: false,
      listData: [],
      isEditMode: false,
      studentsIdNeedToDelet: [],
      page: 1,
      isFilterApply: false,
      //studentProfilePic: require("../img/camera_icon.png"),
      isAsyncLoader: true,
      isFetchingFromServer: false,
      isLoadingMore: false,
      animatedStyle: styles.rowTextContainter,
      isFromStudentAction: false,
      isShowThumbnailImages: false,

      //START: ClassScreen
      classId: stateParams.classId == 'undefined' ? '' : stateParams.classId,
      className: stateParams.className == 'undefined' ? '' : stateParams.className,
      createdBy: stateParams.createdBy == 'undefined' ? '' : stateParams.createdBy,
      studentIds: [],
      settingsData: {},
      title: this.props.navigation.state.params.studentCount,
      //END:


      // subscription: {},
      isShowingSubscription: false,
      keyBoardHeight: 0,
    };


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

  async componentDidMount() {
    TeacherAssitantManager.getInstance().keyboardAddListener(this)
    //  alert(JSON.stringify(this.props.navigation.state.params))
    //this.setLoading(true)
    this._addEventListener()
    // this.props.navigation.setParams({ title, onRightHeaderClick: this.onRightHeaderClick, onLeftHeaderClick: this.onLeftHeaderClick });

    // if (this.props.navigation.state.params.comingFrom == 'ClassScreen') {
    //   this.hitApiToGetStudentsList();
    // }
    // else this._sub = this.props.navigation.addListener(
    //   'didFocus',
    // this.getUserSubscriptionData()

    this.refreshScreen()
    // );

    // this.setState({ subscription })

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
      this.hitApiToGetStudentsList();

    })
  }

  // onLeftHeaderClick = () => {

  //   this._removeEventListener()
  //   if (!this.state.isFromStudentAction) {
  //     this.props.navigation.state.params.onGoBack();
  //     this.props.navigation.goBack();
  //   } else {
  //     const { state, navigate } = this.props.navigation;
  //     navigate("HomeScreen", { screen: AppConstant.APP_NAME, isfromIntializationDataScreen: false })
  //   }

  // }

  onLeftHeaderClick = () => {

    this._removeEventListener()
    if (!this.state.isFromStudentAction) {
      this.props.navigation.state.params.onGoBack();
      this.props.navigation.goBack();
    } else {
      this._navigateBackToHomeScreen();
    }

  }

  static navigationOptions = {
    headerShown: null
  }

  //onPressButtonShowingSusbscriptionModal
  async onPressButtonShowingSusbscriptionModal() {
    const { isAsyncLoader } = this.state
    if (isAsyncLoader) {
      return true
    }
    let isShowing = await this.showPickerModal()

    if (isShowing) {
      return true
    }
    return false
  }



  /**
   * This method handle titlebar right click ( add button)
   */

  onRightHeaderClick = async () => {
    if (await this.onPressButtonShowingSusbscriptionModal()) {
      return
    }
    // const { isAsyncLoader } = this.state
    // if (isAsyncLoader) {
    //   return
    // }
    // let isShowing = await this.showPickerModal()

    // if (isShowing) {
    //   return
    // }

    var comingfrom = this.state.comingFrom
    switch (comingfrom) {
      case ComingFrom.HOME_SCREEN:
        this.ActionSheet.show();
        break;
      case ComingFrom.CLASSES_SCREEN:
        this._removeEventListener()
        var nextScreenData = {
          screenTitle: this.state.className,
          studentIds: this.state.studentIds,
          selectedClassId: this.state.classId,
          comingFrom: ComingFrom.STUDENT_SCREEN,
          comingFromClass_StudentSCreen: ComingFrom.CLASSES_SCREEN_STUDENT_SCREEN,
          headerRight: 'Save',
          onGoBack: this.refresh,
          leftHeader: BreadCrumbConstant.CANCEL
          // leftHeader:
        }
        this.props.navigation.navigate("AllStudentsList", nextScreenData)

        this.setState({
          studentsIdNeedToDelet: [],
          isEditMode: false
        })
        break;
    }
  }

  async showPickerModal(selectedStudent, isStudentItemPressed = false) {
    const { totalStudents } = this.state
    let subscription = await TeacherAssitantManager.getInstance().getUserSubscriptionsDataToLocalDb()
    if (!subscription && totalStudents >= 5) {
      if (isStudentItemPressed && selectedStudent <= 5) {
        return false
      }
      this.setState({ isShowingSubscription: true })
      return true
    }
    if (subscription && !subscription.is_active && totalStudents >= 5) {
      if (isStudentItemPressed && selectedStudent <= 5) {
        return false
      }
      this.setState({ isShowingSubscription: true })
      return true
    }
    return false
  }

  /**
   * This method will set few states empty and call to api hit method to get list of students
   */
  searchStudent = () => {
    // this.showAlert("searched")
    //this.setLoading(true);
    this.setState({
      page: 1,
      listData: [],
      isAsyncLoader: true
    }, function () {
      this.hitApiToGetStudentsList()
    });
  }

  /**
   * This method will show and hide cancel and search botton for search text.
   */

  ShowHideTextComponentView = () => {
    if (!this.state.searchText == '') {
      this.setState({ status: false })
    }
    else {
      this.setState({ status: true })
    }
    this.searchStudent()
  }

  cancelSearching = () => {
    this.textInput.clear()
    this.state.searchText = ''
    this.ShowHideTextComponentView()
  }

  handleSearchText = (text) => {
    this.setState({
      searchText: text
      , status: true

    }, function () {
      if (text == '' && this.state.isSearched == true) {
        this.searchStudent()
      }
    });
  }

  loadMoreStudents = () => {
    const { listData, totalStudents, isLoadingMore } = this.state
    if (listData.length < totalStudents && !isLoadingMore) {
      this.setState({ isFetchingFromServer: true, isLoadingMore: true }, function () {
        this.hitApiToGetStudentsList()
        //console.log('loadMoreStudents')
      })
    }
  }

  _navigateBackToHomeScreen() {
    const { state, navigate } = this.props.navigation;
    navigate("HomeScreen", { screen: AppConstant.APP_NAME, isfromIntializationDataScreen: false });
  }

  _moveToNextScreen(studentName = '') {
    var student = {
      studentUserId: 'new',
      data: "Save",
      title: "Add Student",
      firstName: "",
      lastName: "",
      parentName1: "",
      parentName2: "",
      parentPhone1: "",
      parentPhone2: "",
      parentEmail1: "",
      parentEmail2: "",
      other1: "",
      other2: "",
      other3: "",
      parentsList: [],
      isEditMode: false,
      comingFrom: this.state.comingFrom,
      isComingFromSharedScreen: false,
      onGoBack: this.refresh,
      leftHeader: BreadCrumbConstant.CANCEL,
      studentThumbnailImages: this.state.settingsData.studentThumbnailImages,
      image: '',
      isApiHit: false,
      createdBy: TeacherAssitantManager.getInstance().getUserID(),
    }
    // it will check student is selected from contact app
    if (studentName != '') {
      var StudentNameList = studentName.split(' ');
      //console.log('StudentNameList' + StudentNameList)
      student.firstName = StudentNameList[0]
      var lstname = StudentNameList[1]
      if (StudentNameList.length == 3) {
        lstname = lstname + ' ' + StudentNameList[2]
      }

      student.lastName = lstname == undefined ? 'NOT ENTERED ***' : lstname
    }
    const { state, navigate } = this.props.navigation;
    navigate("AddStudentDetailsScreen", student);
  }

  async getAndroidContactPermissionStatus() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,

        {
          'title': AppConstant.APP_NAME,
          'message': AppConstant.APP_NAME + ' need your external stroage'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {

        //console.log("You can use the camera")
        return true
      } else {
        this.getAndroidContactPermissionStatus()
        //console.log("Camera permission denied")
      }
    } catch (err) {
      console.warn(err)
    }

  }

  _requestAndroidContactPermission() {
    this.getAndroidContactPermissionStatus().then((response) => {
      if (response) {
        this._openContactList();
      } else {
        this._requestAndroidContactPermission();
      }
    })
  }

  //it will help to set edit is on off
  _handleActionSheetIndex = (index) => {

    // this.ActionSheet.show();

    switch (index) {
      case 0: //Manually
        this._moveToNextScreen();
        break;
      case 1: //Contacts
        if (Platform.OS === 'android') {
          this._requestAndroidContactPermission();
        }
        else {
          this._openContactList();
        }
        break;
    }

  }


  async _openContactList() {
    if (Platform.OS === 'android') {
      TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, 'true').then((error) => {
        this.getContactDetails();
      })
    } else {
      this.getContactDetails();
    }

  }

  // _openContactList() {
  //   if (Platform.OS === 'android') {
  //     TeacherAssitantManager.getInstance().saveDataToAsyncStorage(AppConstant.IS_GOING_TO_GET_CONTACT, 'true').then((error) => {
  //       ContactsWrapper.getContact()
  //         .then((contact) => {
  //           this.importingContactInfo = false;
  //           console.log("email is", contact.name);
  //           this._moveToNextScreen(contact.name);
  //         })
  //         .catch((error) => {
  //           console.log("ERROR CODE: ", error.code);
  //           console.log("ERROR MESSAGE: ", error.message);
  //         });

  //     })
  //   } else {
  //     this.getContactDetails();
  //   }


  // }

  _onPressFilter = async () => {
    if (await this.onPressButtonShowingSusbscriptionModal()) {
      return
    }
    const { state, navigate } = this.props.navigation;
    navigate("StudentActionFields", {
      screen: "Filter", onGoBack: this.refresh, headerRight: 'Clear',
      comingFrom: ComingFrom.FILTER_OPTION,
      leftHeader: BreadCrumbConstant.STUDENTS, isUpdate: false,
      createdBy: TeacherAssitantManager.getInstance().getUserID()
    })
  }

  _onPressShareEmail = async () => {
    if (await this.onPressButtonShowingSusbscriptionModal()) {
      return
    }
    this.EmailActionSheet.show()
  }

  _handleEmailActionSheetIndex = (index) => {
    switch (index) {
      case 0: //email
        let apiRequest = this.getApiRequestData();
        TeacherAssitantManager.getInstance()._serviceMethod(API.BASE_URL + `studentList/` + TeacherAssitantManager.getInstance().getUserID(), apiRequest)
          .then((responseJson) => {

            //console.log('response sent successfully');
            this.setLoading(false);
            if (responseJson.success) {
              TeacherAssitantManager.getInstance().setCsvDownloadLinkandOpenTheDeafultEmail(responseJson, this.state.settingsData.toTeacherEmail)
            } else {
              this._showToastMessage(responseJson.message)
            }
          })
          .catch((error) => {
            this._showToastMessage(error.message)
          })
        break;
    }

  }

  //getApiRequestData
  getApiRequestData() {
    let apiRequest = {
      method: 'post',
      headers: {},
    };

    if (this.state.classId != "") {
      apiRequest.body = { class: this.state.classId };
      apiRequest.body = JSON.stringify(apiRequest.body);

    }
    return apiRequest;
  }

  _renderItem = ({ item, index }) => {
    let imagePath = item.data.image || ""
    let isShwoingImage = this.state.settingsData.studentThumbnailImages && imagePath != ""
    let isHomeOrSharedScreen = (this.state.comingFrom == ComingFrom.HOME_SCREEN || this.state.comingFrom == ComingFrom.HOME_SHARED_STUDENT)
    let showPointValue = this.state.settingsData.showPointValues
    let lblAction = (TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_ACTION, item.actionCount)
      + AppConstant.COLLON + item.actionCount)
    //item.actionCount < 2 ? (Terminology.actionSingular + item.actionCount) : (Terminology.actionPlural + item.actionCount)
    return (
      <View>
        <TouchableOpacity
          onPress={() => this._setVisiblityOfItem(item, index)} >
          <View style={[styles.rowContainer,]}>
            {
              this.state.isEditMode ?
                <View style={{ flex: 0.1, justifyContent: 'center', alignItems: 'center', }}>
                  {
                    item.visibility ?
                      <Image style={{ height: 16, width: 16, }}
                        name="search"
                        source={require("../img/check_icon.png")} /> : null
                  }
                </View>
                : null
            }
            {isShwoingImage && TeacherAssitantManager.getInstance().getFastImageComponent(imagePath)}

            <View style={this.state.animatedStyle}>
              <Text style={styles.studentNameText} numberOfLines={1}>
                {item.data.displayName}
              </Text>
              <View style={{ flex: 0.8, flexDirection: 'row' }}>
                <Text style={styles.rowText} numberOfLines={1}>
                  {lblAction}
                </Text>
                <Text style={[styles.rowText, { position: 'absolute', end: isShwoingImage ? 8 : 2 }]} numberOfLines={1}>
                  {showPointValue ? 'Point Value: ' + item.points : ''}
                </Text>
              </View>

            </View>
            <TouchableOpacity style={styles.touchStyle}
              onPress={() => this._pressRow(item.data, index)}
              disabled={!isHomeOrSharedScreen}>
              <View style={styles.imageContainer}>
                <View style={styles.imageInfoContainer}>
                  {
                    //this info icon need to show only in case of when it coming from Home screen. 
                    (isHomeOrSharedScreen ?
                      <Image style={styles.imageView}
                        source={require('../img/icon_info.png')}>
                      </Image> :
                      null)
                  }
                </View>
                <View style={styles.imageNextContainer}>
                  <Image style={styles.imageView}
                    source={require('../img/icon_arrow.png')}>
                  </Image>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </View>
    );
  };

  async getContactDetails() {
    selectContact()
      .then(contact => {
        this.importingContactInfo = false;
        if (!contact) {
          return null;
        }

        // let { contact, selectedPhone } = selection;

        this._moveToNextScreen(`${contact.givenName} ${contact.familyName ? contact.familyName : ""}`);
        // console.log(`Selected ${selectedPhone.type} phone number ${selectedPhone.number} from ${contact.name}`);
        // return selectedPhone.number;
      });
  }

  render() {
    const { listData, title, isShowingSubscription, comingFrom } = this.state
    // let isIos = Platform.OS === 'ios'
    return (
      <SafeAreaView style={styles.container}>
        <Toast ref={o => this.toast = o}
          position={'bottom'}
          positionValue={200} />

        <ActionSheet
          ref={o => this.ActionSheet = o}
          title={AppConstant.APP_NAME}
          options={['Manually', 'Contacts', 'Cancel']}
          cancelButtonIndex={2}
          onPress={(index) => { this._handleActionSheetIndex(index) }} />

        <ActionSheet
          ref={o => this.EmailActionSheet = o}
          title={AppConstant.APP_NAME}
          options={['Email List', 'Cancel']}
          cancelButtonIndex={1}
          onPress={(index) => { this._handleEmailActionSheetIndex(index) }} />

        {
          isShowingSubscription && <Subscription
            onPressBackBtn={() => {
              this.setState({
                isShowingSubscription: false
              })
            }}
          />
        }

        <Header title={title}
          onLeftHeaderClick={this.onLeftHeaderClick}
          onRightHeaderClick={this.onRightHeaderClick}
          comingFrom={comingFrom} />

        <View style={{ flex: 1 }}>
          <Loader loading={this.state.loading} />
          <View style={{ backgroundColor: "#919193", flexDirection: "row" }}>
            {(this.state.comingFrom == ComingFrom.HOME_SCREEN ||
              this.state.comingFrom == ComingFrom.HOME_SHARED_STUDENT) ?
              <View style={styles.searchingBox}>
                {isIOS
                  ?
                  null
                  :
                  this.state.status ?
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
              </View> :
              null
            }

          </View>



          <SyncingLoader isAsyncLoader={this.state.isAsyncLoader} textmessage={TextMessage.Loading} />
          <FlatList
            style={styles.list}
            data={listData}
            extraData={listData}
            contentContainerStyle={{
              paddingBottom: this.state.keyBoardHeight,
              // backgroundColor: "green"
            }}
            renderItem={this._renderItem}
            keyExtractor={(item, index) => `${index}`}
            onEndReached={this.loadMoreStudents}
            onEndReachedThreshold={0.8}
            ItemSeparatorComponent={(sectionId, rowId) => (
              <View key={rowId} style={styles.separator} />
            )}
            ListFooterComponent={<FlatListFooterLoader isFetchingFromServer={this.state.isFetchingFromServer} />}
          />

        </View>
        <View style={{ flex: 0.002, backgroundColor: 'gray' }}
        />
        <View style={styles.bottomOuterView}>
          <View style={styles.bottomInnerView}>

            {
              this.state.isEditMode ?
                <View style={styles.bottomInnerView}>
                  <TouchableOpacity
                    onPress={(this.handleDoneClick)}>
                    <Text style={styles.textInnnerView}>Done</Text>
                  </TouchableOpacity>

                  <Text style={styles.textCenterBlack}>{
                    (this.state.comingFrom == ComingFrom.CLASSES_SCREEN) ?
                      TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, this.state.totalStudents)
                      + AppConstant.COLLON + this.state.totalStudents
                      : ""
                  }</Text>


                  <TouchableOpacity
                    onPress={() => this._onDeleteStudents()}>
                    <Text style={styles.textInnnerView}>Delete</Text>
                  </TouchableOpacity>

                </View>
                :
                <View style={styles.bottomInnerView}>

                  <TouchableOpacity
                    onPress={(this.handleEditClick)}
                    disabled={this.state.createdBy != undefined &&
                      this.state.createdBy != TeacherAssitantManager.getInstance().getUserID()}>
                    <Text style={styles.textInnnerView}>{this.state.createdBy != undefined &&
                      this.state.createdBy == TeacherAssitantManager.getInstance().getUserID() ? 'Edit' : ''}</Text>
                  </TouchableOpacity>

                  <Text style={styles.textCenterBlack}>{
                    (this.state.comingFrom == ComingFrom.CLASSES_SCREEN) ?
                      TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, this.state.totalStudents)
                      + AppConstant.COLLON + this.state.totalStudents
                      : ''
                  }

                  </Text>


                  <View style={styles.fitterImageOUterView}>
                    <TouchableOpacity style={{ alignItems: 'center', marginEnd: 10 }}
                      onPress={() => this._onPressFilter()}
                    >
                      <Text style={styles.textInnnerView}>{this.state.isFilterApply ? '**Filtered**' : 'Filter'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ alignItems: 'center' }}
                      onPress={() => this._onPressShareEmail()}
                    >
                      <Image style={{
                        alignItems: 'center',
                        width: 32,
                        height: 32
                      }}
                        source={require("../img/print.png")} />
                    </TouchableOpacity>
                  </View>


                </View>
            }
          </View>
        </View>
      </SafeAreaView>
    )
  }

  handleDoneClick = () => {
    var newArray = this.state.listData.slice();
    for (i = 0; i < newArray.length; i++) {
      if (newArray[i].visibility == true) {
        newArray[i].visibility = false
      }
    }

    this.setState({
      isEditMode: false,
      listData: newArray
    }, function () {
      this.expandElement()
    })


  }

  handleEditClick = async () => {
    // if (await this.onPressButtonShowingSusbscriptionModal()) {
    //   return
    // }
    this.setState({
      isEditMode: true
    }, function () {
      this.collapseElement()
    })



  }

  _onDeleteStudents = () => {
    //console.log("UserId", this.props.navigation.state.params.userId)
    if (this.state.studentsIdNeedToDelet.length > 0) {
      this.setLoading(true)
      var url = ''
      var body = {}
      switch (this.state.comingFrom) {
        case ComingFrom.HOME_SCREEN:
          url = API.BASE_URL + API.API_STUDENTS + API.API_BULK_DELETE_CLASS
          body = { _id: this.state.studentsIdNeedToDelet }
          break;
        case ComingFrom.CLASSES_SCREEN:
          url = API.BASE_URL + API.API_STUDENTS_CLASSES + API.API_DELETE_BULK_FOR_CLASS + "/" + this.state.classId;
          // url=API.BASE_URL+ API.API_STUDENTS_CLASSES+ API.API_DELETE_BULK +"/";

          body = this.state.studentsIdNeedToDelet
          break;
      }
      //console.log("data which is sending to backend", this.state.studentsIdNeedToDelet)
      //console.log("Delete url", url)

      TeacherAssitantManager.getInstance()._serviceMethod(url, {
        method: 'POST',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
          // 'userId': TeacherAssitantManager.getInstance().getUserID(),
        },
        body: JSON.stringify(body)
      })
        .then((responseJson) => {
          //console.log('response===' + JSON.stringify(responseJson))
          if (responseJson.success) {
            this.setLoading(false);

            var msg = responseJson.message;
            // this._showToastMessage(responseJson.message)
            this.updateListAfterDelete(msg)
          } else {
            this.setLoading(false);

            this._showToastMessage(responseJson.message)
            // this.showAlert(responseJson.message)
          }
        })
        .catch((error) => {
          this.setLoading(false);
          //console.log("error==" + error)
        })
    } else {
      this._showToastMessage('Please select at least one student ')
    }
  }

  updateListAfterDelete(msg) {

    // if (this.state.comingFrom == ComingFrom.CLASSES_SCREEN) {
    this._showToastMessage(msg)
    var deletedStudents = 0;
    var studentList = this.state.studentsIdNeedToDelet
    if (this.state.listData.length > 0) {
      var array = [...this.state.listData];
      for (var i = 0; i < studentList.length; i++) {
        var index = array.findIndex(studentObject => studentObject.studentId == studentList[i]);
        //console.log('index' + index)
        if (index > -1) {
          array.splice(index, 1);
          deletedStudents = deletedStudents + 1
        }
      }
      var studentcount = this.state.totalStudents - deletedStudents
      //console.log("studentCount", studentcount)
      this.setState({ title: studentcount })
      // this.props.navigation.setParams({ title: 'your content' })

      // this.props.navigation.setParams({ studentCount })
      this.setLoading(false);
      this.setState({
        listData: array,
        studentsIdNeedToDelet: [],
        totalStudents: studentcount

      })
    }

    // }

  }



  enableEdit = () => {
    this.setState({
      editableState: true
    })
  }

  async showingSubscriptionModalUsingStudentCount(studentCoutnNumber) {
    // let studentCoutnNumber =index + 1
    let isShowing = await this.showPickerModal(studentCoutnNumber, true)

    if (this.state.totalStudents > 5 && studentCoutnNumber > 5 && isShowing) {
      return true
    }
    return false
  }

  _setVisiblityOfItem = async (item, index) => {
    let studentCoutnNumber = index + 1
    // let isShowing = await this.showPickerModal(studentCoutnNumber, true)

    // let isShowing = await this.showPickerModal(studentCoutnNumber, true)

    // if (this.state.totalStudents > 5 && studentCoutnNumber > 5 && isShowing) {
    //   return true
    // }
    if (await this.showingSubscriptionModalUsingStudentCount(studentCoutnNumber)) {
      return
    }

    // if (this.state.totalStudents > 5 && index + 1 > 5) {
    //   alert("show the subscription screen")
    //   return
    // }
    if (this.state.isEditMode) {
      let posts = this.state.listData.slice();
      let targetPost = posts[index];
      if (targetPost.visibility) {
        var indexNeedToDelete = this.state.studentsIdNeedToDelet.indexOf(targetPost.studentId)
        this.state.studentsIdNeedToDelet.splice(indexNeedToDelete, 1);
      }
      else {
        this.state.studentsIdNeedToDelet.push(targetPost.studentId)
      }
      targetPost.visibility = !targetPost.visibility;
      this.setState({ posts });
    }
    else {
      this.gotoStudentActionScreen(item)
    }
    //console.log("updated studentsIdNeedToDeleteAfter clicking on item", this.state.studentsIdNeedToDelet)
  }

  gotoStudentActionScreen(item) {

    // this._removeEventListener()
    const { state, navigate } = this.props.navigation;
    let count = this.props.navigation.getParam('studentCount', '0')
    let lblstudent = TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_STUDENT, count)

    var leftHeader = lblstudent //BreadCrumbConstant.STUDENTS
    if (this.state.comingFrom == ComingFrom.CLASSES_SCREEN) {
      leftHeader = state.params.className
    }
    navigate("StudentActions", {
      // title: item.data.firstName + " " + item.data.lastName,
      title: item.data.displayName,
      studentUserId: item.data._id,
      item: item.data,
      settingsData: this.state.settingsData,
      userId: this.props.navigation.state.params.userId,
      onGoBack: this.refresh,
      leftHeader: leftHeader,
      comingFrom: this.state.comingFrom,
      isheaderRightShow: true,
      // totalStudentCount: count,
      // isComingFromSharedScreen: (this.state.comingFrom == ComingFrom.HOME_SHARED_STUDENT || 
      //   item.data.createdBy!= TeacherAssitantManager.getInstance().getUserID()) ? true:false,
      isComingFromSharedScreen: item.data.createdBy != TeacherAssitantManager.getInstance().getUserID() ? true : false,
    });
  }



  //pass data to student details screen
  _pressRow = async (rowData, index) => {
    //this._removeEventListener()
    // let isShowing = await this.showPickerModal()

    // if (isShowing) {
    //   return
    // }
    // if (this.state.totalStudents > 5 && index + 1 > 5) {
    //   alert("show the subscription screen")
    //   return
    // }
    if (await this.showingSubscriptionModalUsingStudentCount(index + 1)) {
      return
    }
    const { state, navigate } = this.props.navigation;
    navigate("AddStudentDetailsScreen", {
      data: "Update",
      title: "Update Student",
      studentUserId: rowData._id,
      firstName: rowData.firstName,
      lastName: rowData.lastName,
      parentName1: rowData.parent1Name,
      parentName2: rowData.parent2Name,
      parentPhone1: rowData.parent1Phone,
      parentPhone2: rowData.parent2Phone,
      parentEmail1: rowData.parent1Email,
      parentEmail2: rowData.parent2Email,
      other1: rowData.other1,
      other2: rowData.other2,
      other3: rowData.other3,
      editMode: true,
      studentCount: this.props.navigation.state.params.studentCount,
      userId: this.props.navigation.state.params.userId,
      createdBy: rowData.createdBy,
      comingFrom: this.state.comingFrom,
      onGoBack: this.refresh,
      parentsList: rowData.parents,
      leftHeader: BreadCrumbConstant.CANCEL,
      studentThumbnailImages: this.state.settingsData.studentThumbnailImages,
      image: rowData.image || "",
      isApiHit: false,
      // isComingFromSharedScreen: (this.state.comingFrom == ComingFrom.HOME_SHARED_STUDENT || 
      //   rowData.createdBy!= TeacherAssitantManager.getInstance().getUserID()) ? true:false,
      isComingFromSharedScreen: rowData.createdBy != TeacherAssitantManager.getInstance().getUserID() ? true : false,
    });
  };

  /**
   * This method will gets call when user come back on this scren from add or update studetnDetailscreen
   */
  refresh = (comingFrom) => {
    if (this.state.isEditMode) {
      this.setState({
        isEditMode: false,
        animatedStyle: styles.rowTextContainter,
      })
    }

    if (comingFrom == ComingFrom.STUDENT_ACTIONS) {
      comingFrom = ComingFrom.HOME_SCREEN
      this.setState({
        page: 1,
        listData: [],
        studentIds: [],
        isAsyncLoader: true,
        comingFrom: comingFrom,
        isFromStudentAction: true,
        isEditMode: false
      }, function () {
        this.props.navigation.setParams({ studentCount: 0, className: undefined, comingFrom: comingFrom, leftHeader: BreadCrumbConstant.HOME });
        this.hitApiToGetStudentsList()
      });

    }
    else if (comingFrom == ComingFrom.ALL_STUDENTS_LIST) {

      this._resetAndCallStudentApi();
      //all students list that need to send on next screen for selection process

    }






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

  /**
   * This method retunrs json response from server after hitting Api
   */

  getStudentListFromJson = () => {

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
      search: this.state.searchText,
      createdBy: userId,
    }
    //console.log("searched Text ", this.state.searchText)
    switch (this.state.comingFrom) {
      case ComingFrom.HOME_SCREEN: {
        url = API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_GET_BY_USER_ID + userId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;
      }
        break;
      case ComingFrom.CLASSES_SCREEN: {
        url = API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_GET_BY_USER_ID + this.state.createdBy + "/classid/" + this.state.classId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;

      }
        break;
      case ComingFrom.HOME_SHARED_STUDENT:

        //'/students/withactioncount/sharedwithme/userid/:userId/pagination/:page/:limit'
        url = API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_SHARED_WITH_ME_USER_ID + userId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;
        break;

    }
    API_METHOD = 'POST';
    requestInfo = {
      method: API_METHOD,
      headers: headerValue,
      body: JSON.stringify(bodyValue),

    }

    //console.log("url", url)
    //console.log("requestInfo", requestInfo)

    return TeacherAssitantManager.getInstance()._serviceMethod(url, API_METHOD, headerValue, bodyValue)
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

  _resetAndCallStudentApi() {
    this.setState({
      page: 1,
      listData: [],
      studentIds: [],
      isAsyncLoader: true,
    }, function () {
      this.hitApiToGetStudentsList();
    });
  }

  /**
   * Hit Api to get students list
   */

  hitApiToGetStudentsList() {
    //console.log("UserId" + this.state.userId)
    this.setFlagForSearching()

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
      search: this.state.searchText,
      createdBy: userId,
    }
    //console.log("searched Text ", this.state.searchText)
    switch (this.state.comingFrom) {
      case ComingFrom.HOME_SCREEN: {
        url = API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_GET_BY_USER_ID + userId +
          API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;
      }
        break;
      case ComingFrom.CLASSES_SCREEN: {
        // url = API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_GET_BY_USER_ID + this.state.createdBy +
        //   "/classid/" + this.state.classId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;


        url = (API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + '/' + TeacherAssitantManager.getInstance().getUserID() +
          API.API_GET_BY_USER_ID + this.state.createdBy + "/classid/" + this.state.classId + API.API_PAGINATION +
          this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT);


        //  url =  /students/withactioncount/:userId/createdby/:createdBy/classid/:classId/pagination/:page/:limit
        // url = (API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_SHARED_WITH_ME_USER_ID+
        //   TeacherAssitantManager.getInstance().getUserID() +'/by/'+ userId + API.API_PAGINATION + this.state.page + '/' + 
        //   AppConstant.API_PAGINATION_LIMIT);

      }
        break;
      case ComingFrom.HOME_SHARED_STUDENT:
        url = API.BASE_URL + API.API_STUDENTS_LIST_WITH_ACTION_COUNT + API.API_SHARED_WITH_ME_USER_ID + userId + API.API_PAGINATION + this.state.page + '/' + AppConstant.API_PAGINATION_LIMIT;
        break;

    }

    API_METHOD = 'POST';
    requestInfo = {
      method: API_METHOD,
      headers: headerValue,
      body: JSON.stringify(bodyValue),
    }
    //console.log("url hitApiToGetStudentsList", url)
    //console.log("requestInfo", requestInfo)

    TeacherAssitantManager.getInstance()._serviceMethod(url, requestInfo).then((responseJson) => {
      if (responseJson.success) {
        var newArray = [];

        //new work
        if (this.state.page != 1) newArray = this.state.listData


        var listDataObjet = {}
        var studentListData = []
        var data = responseJson.data

        var studentsData = data.studentsData

        for (var i = 0; i < studentsData.length; i++) {
          var student = studentsData[i]

          listDataObjet = {
            studentId: student._id,
            visibility: false,
            data: student,
            actionCount: student.actionCount,
            points: student.points != undefined ? student.points : 0
          }

          if (this.state.comingFrom == ComingFrom.CLASSES_SCREEN) {
            //all students list that need to send on next screen for selection process
            this.state.studentIds.push(student._id)
          }

          studentListData.push(listDataObjet)
        }

        //studentListData = this._sortStudentList(studentListData)

        this.setState({
          isFetchingFromServer: false,
          totalStudents: responseJson.data.count,
          //  page: responseJson.data.pageCount + 1,
          page: this.state.page + 1,
          listData: [...newArray, ...studentListData],
          isAsyncLoader: false,
          isLoadingMore: false,
          settingsData: data.settingsData,
          title: responseJson.data.count,
          isFilterApply: data.settingsData.filters.length > 0 ? true : data.settingsData.pointsFilter.length > 0 ? true : false
        })

        //  this._addActionCountInList(responseJson.data.studentActionCount)
        //console.log("Student data is ", studentListData)

        if (this.state.comingFrom == ComingFrom.HOME_SCREEN || this.state.comingFrom == ComingFrom.HOME_SHARED_STUDENT) {
          this.props.navigation.setParams({ studentCount: responseJson.data.count })
        }

      } else {
        this.setState({ isAsyncLoader: false, isLoadingMore: false })
        this._showToastMessage(responseJson.message)
        // this.showAlert(responseJson.message);
      }
    }).catch((error) => {
      console.error(error);
    });;



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

  //Register Events for HOme sceen
  _addHomeScreenEvents() {
    this.addStudentListener = EventRegister.addEventListener(SocketConstant.ADD_STUDENT, (data) => {
      //console.log("addStudentListener " + JSON.stringify(data))
      this._addDataToStudent(data)
    })

    this.addStudentBulkListener = EventRegister.addEventListener(SocketConstant.ON_ADD_STUDENT_BULK, (data) => {
      //console.log("addStudentListener", data)
      this._addStudentBulk(data)
    })

    this.removeStudentListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_BULK_STUDNET, (data) => {
      //console.log('removeStudentListener');
      this._removeStudentData(data)
    })

    this.onSettingsDeleteAllForStudent = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
      //console.log('onSettingsDeleteAllForStudent');

      this._onSettingsDeleteAllForStudent(data);


    })
  }

  _onSettingsDeleteAllForStudent(data) {
    if (data.Student) {
      this.setState({
        page: 1,
        listData: [],
        studentIds: [],
        isAsyncLoader: true
      }, () => {
        this.hitApiToGetStudentsList();
      });
    } else if (data.resetToDefault) {
      this.setState({
        page: 1,
        listData: [],
        studentIds: [],
      }, () => {
        this.hitApiToGetStudentsList();
      });
    }
  }

  _addSharedStudentEvents() {
    this.addSharedStudentListener = EventRegister.addEventListener(SocketConstant.ON_ADD_SHARED_STUDENT_BULK, (data) => {
      //console.log("addStudentListener " + JSON.stringify(data))
      this._addStudentBulkForSharedStudent(data)
    })

    this.removeSharedStudentLister = EventRegister.addEventListener(SocketConstant.ON_DELETE_SHARED_STUDENT_BULK, (data) => {
      //console.log('removeSharedStudentLister');
      this._removeStudentData(data)
    })

    this.updateSharedStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_SHARED_STUDENT, (data) => {
      //console.log('removeSharedStudentLister');
      this._updateStudentData(data)

    })


    this.addSharedStudentCountListener = EventRegister.addEventListener(SocketConstant.ON_COUNT_USER_SHARED_STUDENT, (data) => {
      //console.log('addSharedStudentCountListener');
      if (!this.state.isSearched) {
        this._updateSharedStudentCount(data);
      }
    })

    this.onSettingsDeleteAllForSharedStudent = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
      //console.log('onSettingsDeleteAllForSharedStudent');
      this._onSettingsDeleteAllForSharedStudent(data);

    })

  }

  _onSettingsDeleteAllForSharedStudent(data) {
    if (data.forShared) {
      this.setState({
        page: 1,
        listData: [],
        studentIds: [],
        isAsyncLoader: true
      }, function () {
        this.hitApiToGetStudentsList();
      });
    } else if (data.resetToDefault) {
      this.setState({
        page: 1,
        listData: [],
        studentIds: [],
      }, () => {
        this.hitApiToGetStudentsList();
      });
    }
  }

  //Register events for Classes Screen
  _addClassesScreenEvents() {

    this.addStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_ADD_STUDENT_CLASS_BULK, (data) => {
      //console.log('addStudentClassBulkListener');
      var _classId = this.state.classId
      if (_classId != undefined && _classId == data.classId) {
        this._addStudentClassBulk(data)
      }
      else if (data.studentId != undefined) {   //This method will get fired when a class is assigned to particular student from  Student side
        this._addStudentToSelectedClassFromStudentSide(data)
      }
    })

    this.deleteStudentClassBulkListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_STUDENT_CLASS_BULK, (data) => {
      //console.log('deleteStudentClassBulkListener');
      var _classId = this.state.classId
      if (_classId != undefined && _classId == data.classId) {
        this._deleteStudentClassBulkListener(data.data)
      }
      else if (data.studentId != undefined) {   //This method will get fired when a class is assigned to particular student from  Student side
        //   this._delteStudentsCassBulkFromStudentSide(data)
      }

    })

    this.onSettingsDeleteAllForResetAll = EventRegister.addEventListener(SocketConstant.ON_SETTINGS_DELETE_ALL, (data) => {
      //console.log('removeSharedStudentLister');
      if (data.resetToDefault) {
        if (data.resetToDefault) {
          this.setState({
            page: 1,
            listData: [],
            studentIds: [],
          }, () => {
            // this.hitApiToGetStudentsList();
            setTimeout(() => {
              this.onLeftHeaderClick()
            }, 450);

          });

        }
        // this.onLeftHeaderClick()
      }

      // this._onSettingsDeleteAll(data);


    })



  }


  //_updateUserSetting
  _updateUserSetting = (settingsUserData) => {

    if (settingsUserData.studentSortOrder != undefined || settingsUserData.studentDisplayOrder != undefined ||
      (settingsUserData.selectedDateRange != undefined || settingsUserData.selectedDateRange == null)) {
      // var _settingsData = this.state.settingsData
      // _settingsData.studentThumbnailImages = settingsUserData.studentThumbnailImages
      this.setState({
        page: 1,
        listData: [],
        studentIds: [],
        isAsyncLoader: true
      }, function () {
        this.hitApiToGetStudentsList()
      });
    } else if (settingsUserData.studentThumbnailImages != undefined) {
      // var _settingsData = this.state.settingsData
      this.state.settingsData.studentThumbnailImages = settingsUserData.studentThumbnailImages
      this.setState({
        settingsData: this.state.settingsData,
        isShowThumbnailImages: settingsUserData.studentThumbnailImages
      })
    } else if (settingsUserData.showPointValues != undefined) {
      this.state.settingsData.showPointValue = settingsUserData.showPointValues
      this.setState({
        settingsData: this.state.settingsData
      })
    }
  }

  // event listener for socket
  _addEventListener = () => {
    switch (this.state.comingFrom) {
      case ComingFrom.HOME_SCREEN:
        this._addHomeScreenEvents()
        break;
      case ComingFrom.CLASSES_SCREEN:
        this._addClassesScreenEvents();
        break;
      case ComingFrom.HOME_SHARED_STUDENT:
        this._addSharedStudentEvents()
        break;
    }

    this.onSubscriptionBuy = EventRegister.addEventListener(SocketConstant.ON_SUBSCRIPTION_BUY, async (data) => {
      await TeacherAssitantManager.getInstance()._saveUserSubscriptionsDataToLocalDb(data.subscription)
    })

    //common socket function we need 
    //setting function

    this.updateUserSetting = EventRegister.addEventListener(SocketConstant.ON_UPDATE_USER_SETTING, (data) => {
      //console.log("updateUserSetting", data)
      this._updateUserSetting(data)
    })

    this.updateStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT, (data) => {
      //console.log('UpdateStudentListener');
      this._updateStudentData(data)
    })

    this.updateStudentListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT_BULK, (data) => {
      //console.log('UpdateStudentListener');
      this._updateStudentBulkData(data)
    })

    this.studentCount = EventRegister.addEventListener(SocketConstant.ON_COUNT_USER_STUDENT, (data) => {
      //console.log('studentCount');
      if (!this.state.isSearched) {
        this._updateStudentCount(data);
      }
    })

    this.removeStudentActionListener = EventRegister.addEventListener(SocketConstant.ON_DELETE_STUDENT_ACTION_BULK, (data) => {
      //console.log('removeStudentListener');
      this._removeStudentActionBulkData(data)
    })

    this.addStudentActionListener = EventRegister.addEventListener(SocketConstant.ON_ADD_STUDENT_ACTION, (data) => {
      //console.log("addStudentActionListener" + JSON.stringify(data))
      this._addDataToStudentAction(data)
    })

    // this.updateActionFieldListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_STUDENT_ACTION, (data) => {
    //   //console.log('updateActionFieldListener');
    //   //console.log("update Socket data" + JSON.stringify(data))
    //   this._updateStudentAction(data)
    // })


    this.updateStudentPointValueListener = EventRegister.addEventListener(SocketConstant.ON_UPDATE_POINTS_BULK, (data) => {
      //console.log("addStudentActionListener" + JSON.stringify(data))
      this._updateStudentPointValue(data)
    })



    this.onUpdateFilters = EventRegister.addEventListener(SocketConstant.ON_UPDATE_FILTERS, (data) => {
      this._resetAndCallStudentApi();
    })
  }

  _removeEventListener = () => {
    EventRegister.removeEventListener(this.addStudentListener)
    EventRegister.removeEventListener(this.removeStudentListener)
    EventRegister.removeEventListener(this.updateStudentListener)
    EventRegister.removeEventListener(this.deleteStudentClassBulkListener)
    EventRegister.removeEventListener(this.studentCount)
    EventRegister.removeEventListener(this.addStudentActionListener)
    EventRegister.removeEventListener(this.removeStudentActionListener)
    EventRegister.removeEventListener(this.addStudentClassBulkListener)
    EventRegister.removeEventListener(this.onSettingsDeleteAllForStudent)
    EventRegister.removeEventListener(this.onSettingsDeleteAllForSharedStudent)
    //setting
    EventRegister.removeEventListener(this.updateUserSetting)
    EventRegister.removeEventListener(this.onSettingsDeleteAllForResetAll)

    //Shared STudents
    EventRegister.removeEventListener(this.addSharedStudentListener)
    EventRegister.removeEventListener(this.addSharedStudentCountListener)
    EventRegister.removeEventListener(this.onUpdateFilters)
  }

  async _updateStudentCount(data) {
    var count = await data.studentCount
    this.setState({
      totalStudents: count
    }, function () {
      this.props.navigation.setParams({ studentCount: count });
    });
  }
  async _updateSharedStudentCount(data) {
    var count = await data.sharedStudentsCount
    this.setState({
      totalStudents: count
    }, function () {
      this.props.navigation.setParams({ studentCount: count });
    });
  }




  _addStudentToSelectedClassFromStudentSide = (data) => {

    var classesData = data.classesData



    var index = classesData.findIndex(classObject => classObject._id === this.state.classId);
    if (index > -1) {
      var studentsData = data.studentsData;
      var afterRemovalrestList = []
      for (var i = 0; i < studentsData.length; i++) {
        var studentObject = studentsData[i]
        //if (isAdd) {
        this._addSocketStudentsToList(studentObject)
        // }
      }

      //var listData = this.state.listData;
      let sortList = this._sortStudentList(this.state.listData)
      this.setState({
        listData: sortList,
        totalStudents: sortList.length,
        studentIds: this.state.studentIds
      })



      //console.log("listData", this.state.listData)

    }
  }

  _addSocketStudentsToList = (studentObject) => {
    var studentId = studentObject._id
    var student = {
      // firstName: studentObject.firstName,
      // lastName: studentObject.lastName,
      ...studentObject
    }
    let listDataObjet = {
      studentId: studentId,
      visibility: false,
      data: student,
      actionCount: 0
    }

    let listData = [...this.state.listData]
    let index = listData.findIndex((ele) => ele.studentId == studentId)
    if (index == -1) {
      listData.push(listDataObjet)
    } else {
      listData[index] = listDataObjet
    }
    let studentIds = [...this.state.studentIds]
    index = studentIds.findIndex((ele) => ele == studentId)
    if (index == -1) {
      studentIds.push(studentId)
    }

    this.setState({
      listData,
      studentIds
    })
    // this.state.listData.push(listDataObjet)
    // this.state.studentIds.push(studentId)
  }

  _delteStudentsCassBulkFromStudentSide = (data) => {
    var classesData = data.classesData

    var index = classesData.findIndex(classObject => classObject._id == this.state.classId);
    if (index > -1) {
      var studentsData = data.studentsData;
      for (var i = 0; i < studentsData.length; i++) {
        var socketStudentObject = studentsData[i]
        var array = [...this.state.listData];
        var index = array.findIndex(studentObject => studentObject.studentId == socketStudentObject._id);
        //console.log('index' + index)

        if (index > -1) {
          array.splice(index, 1);
        }
      }

      this.setLoading(false);
      this.setState({
        listData: array,
        studentsIdNeedToDelet: [],

      })
    }


  }

  _addStudentBulk(studentList) {
    //  await nextFrame(); 
    var array = [...this.state.listData]

    for (var i = 0; i < studentList.length; i++) {
      var student = studentList[i]
      var index = array.findIndex(studentObject => studentObject.studentId === student._id);
      if (index == -1 && (array.length == this.state.totalStudents)) {
        //console.log('_addDataToStudent==' + student);
        //console.log(student);
        array.push({
          studentId: student._id,
          visibility: false,
          data: student,
          actionCount: 0,
          points: student.points != undefined ? student.points : 0
        });
      }
    }

    let sortList = this._sortStudentList(array)
    this.setState({ listData: sortList });

  }
  _addStudentBulkForSharedStudent(studentList) {
    //  await nextFrame(); 
    var array = [...this.state.listData]

    for (var i = 0; i < studentList.length; i++) {
      var student = studentList[i]

      var index = array.findIndex(studentObject => studentObject.studentId === student._id);
      if (index == -1) {
        //console.log('_addDataToStudent==' + student);
        //console.log(student);
        array.push({
          studentId: student._id,
          visibility: false,
          data: student,
          actionCount: 0,
          points: student.points != undefined ? student.points : 0
        });
      }
    }
    let sortList = this._sortStudentList(array)
    this.setState({
      listData: sortList,
    });
  }

  _addDisplayName(student) {
    switch (this.state.settingsData.studentDisplayOrder.toLowerCase()) {
      case AppConstant.ENUM_FIRST_LAST:
        student['displayName'] = student.firstName + " " + student.lastName;
        break;
      case AppConstant.ENUM_LAST_FIRST:
        student['displayName'] = student.lastName + ", " + student.firstName;
        break;
    }
    return student;
  }


  //add data to student
  _addDataToStudent = (student) => {

    var array = [...this.state.listData]
    var index = array.findIndex(studentObject => studentObject.studentId === student._id);
    if (index == -1) {
      //console.log('_addDataToStudent==' + student);
      //console.log(student);
      //console.log("data is" + JSON.stringify(student))
      var listDataObject = {
        studentId: student._id,
        visibility: false,
        data: TeacherAssitantManager.getInstance()._addDisplayNameToStudentData(student, this.state.settingsData.studentDisplayOrder, this.state.settingsData.studentSortOrder),
        actionCount: 0,
        points: 0
      };

      // array.push(listDataObject);
      // let sortList = this._sortStudentList(array);
      let studentcount = this.state.totalStudents + 1


      if (this.state.isSearched) {
        if (array.length == this.state.totalStudents && String(student.displayName.toLowerCase()).includes(this.state.searchText.toLowerCase())) {
          // array.push(listDataObject);
          // let sortList = this._sortStudentList(array);
          // this.setStudentCountAndSortedListToState(studentcount, sortList);
          this.addNewStuddentToCurrentList(array, listDataObject, studentcount);
        } else if (String(student.displayName.toLowerCase()).includes(this.state.searchText.toLowerCase())) {
          // array.push(listDataObject);
          // let sortList = this._sortStudentList(array);
          // this.setStudentCountAndSortedListToState(studentcount, sortList);
          this.addNewStuddentToCurrentList(array, listDataObject, studentcount);
        }


      } else {

        let isAddingStudentToCurrentList = false

        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          let elementName = element.data.sortName.charAt(0)
          let studentName = listDataObject.data.sortName.charAt(0)
          if (elementName.toLowerCase() === studentName.toLowerCase()) {
            isAddingStudentToCurrentList = true
            break
          }

        }

        if (isAddingStudentToCurrentList) {
          // array.push(listDataObject);
          // let sortList = this._sortStudentList(array);
          // this.setStudentCountAndSortedListToState(studentcount, sortList);
          this.addNewStuddentToCurrentList(array, listDataObject, studentcount);

          return
        }

        if (array.length == this.state.totalStudents) {
          // array.push(listDataObject);
          // let sortList = this._sortStudentList(array);
          // this.setStudentCountAndSortedListToState(studentcount, sortList);
          this.addNewStuddentToCurrentList(array, listDataObject, studentcount);
        } else {
          this.setState({
            totalStudents: studentcount,
            title: studentcount
          }, () => {
            this.props.navigation.setParams({ studentCount: studentcount });
          });
        }
      }
    }
  }

  addNewStuddentToCurrentList(array, listDataObject, studentcount) {
    array.push(listDataObject);
    let sortList = this._sortStudentList(array);
    this.setStudentCountAndSortedListToState(studentcount, sortList);
  }

  setStudentCountAndSortedListToState(studentcount, sortList) {
    this.setState({
      totalStudents: studentcount,
      listData: sortList,
      title: studentcount
    }, () => {
      this.props.navigation.setParams({ studentCount: studentcount });
    });
  }

  _sortStudentList(_listData) {
    _listData.sort((student1, student2) => {
      let student1SortName = student1.data.sortName
      let student2SortName = student2.data.sortName
      if (student1SortName != undefined && student2SortName != undefined) {
        student1SortName = student1SortName.toLocaleLowerCase()
        student2SortName = student2SortName.toLocaleLowerCase()
        if (student1SortName > student2SortName) {
          return 1;
        }
        if (student1SortName < student2SortName) {
          return -1;
        }
        return 0

        // if ( a.last_nom < b.last_nom ){
        //   return -1;
        // }
        // if ( a.last_nom > b.last_nom ){
        //   return 1;
        // }
        // return 0;
      }

    });
    return _listData;
  }

  _removeStudentActionBulkData(data) {
    //console.log("_removeStudentActionBulkData " + JSON.stringify(data))

    // var selectedDateRange = this.state.settingsData.selectedDateRange
    // if (selectedDateRange == null || data.studentAction == undefined) {
    if (this.state.listData.length > 0) {
      var studentId = data.studentId
      var dataActionList = data.data
      //console.log('_removeStudentData')

      var array = [...this.state.listData];

      var index = this.state.listData.findIndex(studentObject => studentObject.studentId === studentId);

      //console.log(index);
      if (index > -1) {
        //console.log('this.state.listData[index]');
        //console.log(this.state.listData[index]);
        var _student = this.state.listData[index];
        var actionCount = _student.actionCount - dataActionList._id.length
        _student.actionCount = ((actionCount < 0) ? 0 : actionCount)
        const updatedStudents = update(this.state.listData, { $splice: [[index, _student.data]] });  // array.splice(start, deleteCount, item1)
        this.setState({ listData: updatedStudents });

      }
    }


  }


  _updateStudentPointValue(data) {
    //console.log("_updateStudentPointValue " + JSON.stringify(data))
    if (this.state.listData.length > 0) {

      var dataPointValueList = data

      var array = [...this.state.listData];
      let isPointUpdated = false
      for (let index = 0; index < dataPointValueList.length; index++) {
        const element = dataPointValueList[index];
        var studentIndex = array.findIndex(studentObject => studentObject.studentId === element._id);
        //console.log(studentIndex);
        if (studentIndex > -1) {
          //console.log('this.state.listData[index]');
          //console.log(array[studentIndex]);
          array[studentIndex].points = element.points
          isPointUpdated = true
        }
      }
      if (isPointUpdated) {
        this.setState({ listData: array });
      }


    }


  }

  _addDataToStudentAction(data) {

    //console.log("_addDataToStudentAction " + JSON.stringify(data))

    // if (data.isAddActionToMany) {


    // } else {
    let studentActionsDetails = data.studentActionsDetails
    let array = [...this.state.listData];
    let selectedDateRange = this.state.settingsData.selectedDateRange
    for (let i = 0; i < studentActionsDetails.length; i++) {
      let studentAction = studentActionsDetails[i]
      let dataType = studentAction.actionFieldID.dataType
      if (dataType.toLowerCase() == API_PARAM.ACTION_DATE.toLocaleLowerCase()) {
        let studentActionsList = data.studentActions
        for (let actionIndex = 0; actionIndex < studentActionsList.length; actionIndex++) {
          if (selectedDateRange == null) {
            let index = array.findIndex(studentObject => studentObject.studentId === studentActionsList[actionIndex].studentID);
            if (index > -1) {
              let _student = array[index]
              let count = _student.actionCount + 1
              _student.actionCount = count
              array[index] = _student

            }
          } else {
            let studentActionCreatedDate = new Date(studentAction.value).getTime()
            let startDate = new Date(selectedDateRange.startDate).getTime()
            let endDate = new Date(selectedDateRange.endDate).getTime()
            if (studentActionCreatedDate >= startDate &&
              studentActionCreatedDate <= endDate) {
              let _index = array.findIndex(studentObject => studentObject.studentId == studentActionsList[actionIndex].studentID);
              if (_index > -1) {

                let _student = array[_index]
                let count = _student.actionCount + 1
                _student.actionCount = count

                array[_index] = _student
                // this.setState({ listData: array });
              }
            }
          }
        }
        this.setState({ listData: array });
        break;
      }
    }
  }

  _updateStudentAction = (data) => {


    // var action = data.data
    // var actionId = data.studentActionId
    // var _listData = [...this.state.listData]
    // if (_listData.length > 0) {
    //     //console.log('_UpdateStudentData');

    //     var index = _listData.findIndex(actionObject => actionObject.actionFieldID === actionId);

    //     //console.log(index);
    //     if (index > -1) {
    //         listObject = this._createJsonObjectForList(action)

    //         var listInsideObject = _listData[index];
    //         listInsideObject.data = listObject
    //         listInsideObject.completeList = action
    //         listInsideObject.sortDate = listObject.sortDate
    //         //this.state.listData[index].

    //         //const updatedActions = update(this.state.listData, { $splice: [[index, listInsideObject]] });  // array.splice(start, deleteCount, item1)

    //         this.setState({ listData: this._sortActionList(_listData) });

    //     }
    // }
  }



  //remove student data
  _removeStudentData = (studentList) => {


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
        }
      }


      this.setLoading(false);

      if (this.state.comingFrom == ComingFrom.HOME_SHARED_STUDENT) {
        this.props.navigation.setParams({ studentCount: array.length })
        this.setState({
          listData: array,
          studentsIdNeedToDelet: [],
          totalStudents: array.length

        })
      }
      else {
        this.setState({
          listData: array,
          studentsIdNeedToDelet: [],

        })
      }
    }
  }

  _updateStudentData(student) {
    var array = [...this.state.listData]
    if (array.length > 0) {
      //console.log('_UpdateStudentData');

      //console.log(student);

      var index = array.findIndex(studentObject => studentObject.studentId === student._id);

      //console.log(index);
      if (index > -1) {
        //console.log('this.state.listData[index]');
        //console.log(array[index]);
        var _student = array[index];

        _student.data = TeacherAssitantManager.getInstance()._addDisplayNameToStudentData(student, this.state.settingsData.studentDisplayOrder, this.state.settingsData.studentSortOrder)
        //array[index] = _student
        let sortList = this._sortStudentList(array)
        this.setState({
          listData: sortList,
        })

      }
    }
  }

  _updateStudentBulkData(studentList) {
    // var isUpdated = false
    var array = [...this.state.listData]
    if (array.length > 0) {
      //console.log('_UpdateStudentData');

      // //console.log(studentList);
      let studentIndex = 0;
      for (studentIndex; studentIndex < studentList.length; studentIndex++) {
        var student = studentList[studentIndex];
        var index = array.findIndex(studentObject => studentObject.studentId === student._id);
        //console.log(index);
        if (index > -1) {
          //console.log('this.state.listData[index]');
          //console.log(array[index]);
          var _student = array[index];
          _student.data = TeacherAssitantManager.getInstance()._addDisplayNameToStudentData(student,
            this.state.settingsData.studentDisplayOrder, this.state.settingsData.studentSortOrder)
          // isUpdated = true
        }
      }
      // if (isUpdated) {
      let sortList = this._sortStudentList(array)
      this.setState({
        listData: sortList,
      })
      // }


    }
  }


  //deleteStudent from class (assignerd will unassigned)
  _deleteStudentClassBulkListener(data) {
    //console.log("_deleteStudentClassBulkListener ", data)


    var array = [...this.state.listData];
    var selectedIds = this.state.studentIds

    for (var i = 0; i < data.length; i++) {

      //console.log(data[i].studentID)

      var index = array.findIndex(studentObject => studentObject.studentId == data[i].studentID);
      var selectedIdsIndex = selectedIds.findIndex(studentObject => studentObject == data[i].studentID);


      if (index > -1) {
        array.splice(index, 1);
      }
      if (selectedIdsIndex > -1) {
        selectedIds.splice(selectedIdsIndex, 1)
      }
    }

    this.setState({
      listData: array,
      studentIds: selectedIds,
      studentsIdNeedToDelet: [],
      totalStudents: array.length

    })

    //console.log("data is", array)





  }


  // addStudent into selected class (unassignerd will assigned)
  _addStudentClassBulk(data) {
    var studentDetailArray = data.data == undefined ? [] : data.data
    //console.log("_addStudentClassBulk ", studentDetailArray)
    var studentsData = data.studentsData

    for (i = 0; i < studentDetailArray.length; i++) {
      var student = {
        firstName: '',
        lastName: '',
        displayName: '',
        image: {},
        sortName: ''

      }

      var studentId = studentDetailArray[i].studentID;

      var index = studentsData.findIndex(studentObject => studentObject._id == studentId)
      if (index > -1) {
        var studentObject = studentsData[index]
        student.firstName = studentObject.firstName
        student.lastName = studentObject.lastName
        student.displayName = studentObject.displayName
        student.image = studentObject.image
        student.sortName = studentObject.sortName
        //console.log("student" + JSON.stringify(student))

        listDataObjet = {
          studentId: studentId,
          visibility: false,
          data: student,
          actionCount: studentObject.actionCount
        }
        this.state.listData.push(listDataObjet)
        this.state.studentIds.push(studentId)
      }
    }
    // var listData = this.state.listData;
    let sortList = this._sortStudentList(this.state.listData)
    sortList = this._sortStudentList(sortList)
    this.setState({
      listData: sortList,
      totalStudents: sortList.length,
      studentIds: this.state.studentIds
    })

  }




}


const Header = ({ onLeftHeaderClick, title, onRightHeaderClick, comingFrom }) => {
  let screenTitle = "Students:"
  let isDisabled = false
  if (comingFrom == ComingFrom.HOME_SHARED_STUDENT) {
    screenTitle = "Share Students:"
    isDisabled = true
  }

  return (
    <View style={{ height: 44, alignItems: 'center', flexDirection: 'row' }}>

      <TouchableOpacity style={{ flexDirection: 'row' }}
        onPress={() => onLeftHeaderClick()} >
        <Image style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
          source={require("../img/back_arrow_ios.png")} />

        <Text style={[StyleTeacherApp.headerLeftButtonText]} numberOfLines={1}>Home</Text>
      </TouchableOpacity>


      <Text style={{ flex: 1, textAlign: 'center', fontSize: width * .04, color: 'black' }}>{`${screenTitle} ${title}`}</Text>

      <TouchableOpacity style={{ width: width / 6.2, alignItems: 'flex-end', marginBottom: 0 }}
        disabled={isDisabled}
        onPress={() => onRightHeaderClick()}>
        {!isDisabled && < Image style={StyleTeacherApp.rightImageViewHeader}
          source={require("../img/icon_add.png")} />}
      </TouchableOpacity>
    </View>

  )
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
  studentNameText: {
    justifyContent: "center",
    alignItems: "center",
    color: "black",
    fontSize: 17,
    marginLeft: 10,
    flex: 0.9
  },
  rowText: {
    justifyContent: "center",
    alignItems: "center",
    color: "#A9A9A9",
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
    flex: 0.2,
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
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5
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
    // flex: 0.08,
    height: 50,
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

  },
});
