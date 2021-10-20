import ApiConstant from "../constants/ApiConstant";
const SocketConstant = {

  // //Aws Env new server
  // SOCKET_BASE_URL: 'http://18.216.15.197/',

  //  SOCKET_BASE_URL: 'http://18.216.15.197:5000',
  //  SOCKET_BASE_URL: 'http://18.222.110.241/',
  //  SOCKET_BASE_URL: 'https://app.cleveriosapps.com/',
  //  SOCKET_BASE_URL: 'http://app.cleveriosapps.com/',
   SOCKET_BASE_URL: ApiConstant.DOMAIN_NAME,

  //  SOCKET_BASE_URL: 'ec2-18-222-110-241.us-east-2.compute.amazonaws.com',

  //Harcharan local system:
  // SOCKET_BASE_URL: "http://192.168.88.13:5000/",dsacvdscvdcvsdcvsd

 

  //gurjeet system
  // SOCKET_BASE_URL: 'http://localhost:4000/',

  ADD_STUDENT: 'addStudent',
  ADD_STUDENT_BULK: 'addStudentBulk',
  REMOVE_STUDENT: 'onDeleteStudentBulk',
  ADD_CLASS: 'addClass',

  UPDATE_STUDNET_COUNT: 'updateStudentCount',
  UPDATE_CLASS_COUNT: 'updateClassCount',

  REMOVE_CLASS: 'onDeleteClass',
  ON_ADD_CLASS: 'onAddClass',
  ON_ADD_CLASS_BULK: 'onAddClassBulk',

  REMOVE_BULK_CLASS: 'onDeleteClassBulk',
  UPDATE_CLASS: 'onUpdateClass',

  //Home
  ON_COUNT_USER_STUDENT: 'onCountUserStudent',
  ON_COUNT_USER_CLASS: 'onCountUserClass',
  ON_COUNT_USER_SHARED_STUDENT: 'onCountSharedStudent',


  ON_ADD_STUDNET: 'onAddStudent',
  ON_ADD_STUDENT_BULK: 'onAddStudentBulk',
  ON_DELETE_BULK_STUDNET: 'onDeleteStudentBulk',
  ON_UPDATE_STUDENT: 'onUpdateStudent',
  ON_UPDATE_STUDENT_BULK: 'onUpdateStudentBulk',


  ON_DELETE_STUDENT_CLASS_BULK: 'onDeleteStudentClassBulk',
  ON_ADD_STUDENT_CLASS_BULK: 'onAddStudentClassBulk',

  //On Color Labels
  ON_ADD_COLOR_LABEL: 'onAddColorLabel',
  ON_DELETE_COLOR_LABEL_BULK: 'onDeleteColorLabelBulk',
  ON_UPDATE_COLOR_LABEL: 'onUpdateColorLabel',

  //Action Fields
  ON_ADD_ACTION_FIELD: 'onAddActionField',
  ON_DELETE_ACTION_FIELD_BULK: 'onDeleteActionFieldBulk',
  ON_UPDATE_ACTION_FIELD: 'onUpdateActionField',

  //Action Field picker
  ON_ADD_ACTION_FIELD_PICKER: 'onAddActionFieldPicker',
  ON_DELETE_ACTION_FIELD_PICKER_BULK: 'onDeleteActionFieldPickerBulk',
  ON_UPDATE_ACTION_FIELD_PICKER: 'onUpdateActionFieldPicker',

  //Student Action fields
  ON_ADD_STUDENT_ACTION: 'onAddStudentActionBulk',
  ON_DELETE_STUDENT_ACTION_BULK: 'onDeleteStudentActionBulk',
  ON_UPDATE_STUDENT_ACTION: 'onUpdateStudentAction',
  ON_UPDATE_POINTS_BULK:'onUpdatePointsBulk',

  //Setting Date Range
  ON_ADD_DATE_RANGE: 'onAddDateRange',
  ON_DELETE_DATE_RANGE_BULK: 'onDeleteDateRangeBulk',
  ON_UPDATE_DATE_RANGE: 'onUpdateDateRange',

  // //Setting Another Teachers Shared Data
  ON_ADD_SHARED_STUDENT_BULK: 'onAddUserSharedBulk',
  ON_DELETE_SHARED_STUDENT_BULK: 'onDeleteUserSharedBulk',
  ON_UPDATE_SHARED_STUDENT: 'onUpdateSharedStudent',
  // //ON_UPDATE_ANOTHER_TEACHER_SHARED_DATA:'onUpdateAnotherTeacherSharedData',
  // ON_DELETE_ANOTHER_TEACHER_SHARED_DATA_BULK:'onDeleteUserShared',

  //Setting SharedDataWithAnotherTeacher
  ON_ADD_SHARED_DATA_WITH_ANOTHER_TEACHER: 'onAddUserShared',
  //ON_UPDATE_SHARED_DATA_WITH_ANOTHER_TEACHER:'onUpdateSharedDataWithAnotherTeacher',
  ON_DELETE_SHARED_DATA_WITH_ANOTHER_TEACHER_BULK: 'onDeleteUserShared',

  //setting screen
  ON_UPDATE_USER_SETTING: 'onUpdateUserSetting',
  ON_UPDATE_USER_SETTING_DEFAULT :'onUpdateUserSettingDefault ',
  ON_SETTINGS_DELETE_ALL :'OnSettingsDeleteAll',
  

  //Shared Class
  ON_DELETE_SHARED_CLASS: 'onDeleteSharedClass',

  //CutomizedDetailField
  ON_ADD_CUSTOMIZED_DETAIL_FIELD: 'onAddCustomizedDetailField',
  ON_DELETE_CUSTOMIZED_DETAIL_FIELD_BULK: 'onDeleteCustomizedDetailFieldBulk',
  ON_UPDATE_CUSTOMIZED_DETAIL_FIELD: 'onUpdateCustomizedDetailField',

  //DefaultActionValue
  ON_ADD_DEFAULT_ACTION_VALUE: 'onAddDefaultActionValue',
  ON_DELETE_DEFAULT_ACTION_VALUE: 'onDeleteDefaultActionValueBulk',


  //Randomizer
  ON_UPDATE_STUDENT_MARK: 'onUpdateStudentMark',

  //Customize Terminology
  ON_UPDATE_TERMOLOGY: 'onUpdateTermology',

  //clear Filter 
  ON_UPDATE_FILTERS: "onUpdateFilters",

  //Export
  ON_UPDATE_USERBACKUP:'onUpdateUserBackup',


  //OnSubscriptionBuy
  ON_SUBSCRIPTION_BUY:'OnSubscriptionBuy',
  ON_SUBSCRIPTION_CANCEL:'OnWebhook'



};
export default SocketConstant;




