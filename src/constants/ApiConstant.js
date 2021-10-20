/*
api route paths
*/
//this domain is using for socket also as base url
const DOMAIN_NAME = 'http://app.cleveriosapps.com/'
// const DOMAIN_NAME = "http://192.168.88.171:5000/" // local

const S3_URL = "https://s3.us-east-2.amazonaws.com/teachersapp/"
const API = {

  //Aws Env new server
  DOMAIN_NAME,
  S3_URL,
  // BASE_URL: 'http://192.168.88.116:5000/', 
  BASE_URL: `${DOMAIN_NAME}api/`,
  // BASE_URL: `${DOMAIN_NAME}`, //local server

  //Harcharan local system:
  //  BASE_URL: BASE_URL, 

  CSV_DOWNLOAD_LINK: `${DOMAIN_NAME}api/import/csv/template`,

  API_SIGNUP: 'users',
  API_LOGIN: 'users/login',
  API_STUDENTS: 'students',
  API_STUDENTS_LIST_WITH_ACTION_COUNT: 'students/withactioncount',
  API_CLASSES: 'classes',
  API_CLASSES_WITH_STUDENT_COUNT: 'classes/withstudentcount',

  API_STUDENTS_CLASSES: 'studentsclasses/',
  API_ASSIGN_BULK_FOR_STUDENTS: 'assigninbulkforstudent/',
  API_ASSIGN_BULK_FOR_CLASSES: 'assigninbulkforclass/',
  API_SEND_FILE: 'classes/upload',
  API_STUDENT_CLASS_COUNT: 'studentclasscount/',
  API_ADD_COLOR_LABLES: 'colorlabels',
  API_ADD_ACTION_FIELDS: 'actionsFields',
  API_ACTION_PICKER: 'actionfieldspickers',
  API_HELPER_ACTION_FIELD_ID: '/actionfield/',

  API_IMPORT_CSV: 'classes/importcsv',
  API_UPLOAD_PREVIEW_CSV: 'classes/uploadpreview',
  API_UPLOAD_PREVIEW_DAT: 'import/',
  API_BULK_DELETE_CLASS: '/bulkdelete',
  API_ACTIONS: 'actionsfields',
  API_SAVE_COLOR_LABEL: 'colorlabels',
  API_LIST_USER_COLOR_LABELS: 'colorlabels/createdby/',
  API_SAVE_ACTION_FIELD_PICKER: 'actionfieldspickers',
  API_GET_LIST_ACTION_FIELDS_PICKER_ACTION_FIELD: 'actionfieldspickers/actionfield/',
  API_STUDENT_ACTION_ASSIGN: 'studentsactions/',
  API_ACTION_ASSIGN_AND_CREATE: 'create_and_assign_to_students',
  API_CREATE_INITIAL_DATA: 'initialdata/',
  API_DELETE_BULK_FOR_CLASS: 'deleteinbulkforclass',
  API_STUDENT_ACTION_DETAILS: 'studentsactionsdetails/',

  //mediaUploading
  API_MEDIA_UPLOAD: 'storage',

  //DateRanges
  API_DATE_RANGES_BY_USER_ID: 'dateranges/createdby/',
  API_DATE_RANGES_BULK_DELETE: 'dateranges/bulkdelete',
  API_DATE_RANGES_CREATE_UNIQUE: 'dateranges/unique',
  API_DATE_RANGES_UPDATE_UNIQUE: 'dateranges/unique/',

  //setting
  API_USER_SETTINGS_BY_USER_ID: 'userssettings/user/',
  API_USER_SETTINGS_UPDATE: 'userssettings/',
  API_USERS_SETTINGS_DELETE_ALL_STUDENT_ACTIONS_BY_USER_ID: 'userssettings/deleteall/studentactions/user/',
  API_USERS_SETTINGS_DELETE_ALL_STUDENTS_BY_USER_ID: 'userssettings/deleteall/students/user/',
  API_USERS_SETTINGS_DELETE_ALL_DATA_BY_USER_ID: 'userssettings/deleteall/data/user/',
  API_USERS_SETTINGS_RESET_ALL_DATA_BY_USER_ID: 'userssettings/resetall/data/user/',
  API_USERS_SETTINGS_FILTERS_BY_USER_ID: 'usersettings/filters/',
  API_USERS_SETTINGS_POINT_FILTERS: 'usersettings/pointFilters/',


  //ShareData
  //formation url : users/:userId/sharedbyme/withsearch/pagination/:page/:limit
  API_USERS_BY_SHARED_BY_ME_WITH_SEARCH_AND_PAGINATION: '/sharedbyme/withsearch',
  //formation url : users/:userId/sharedwithme/pagination/:page/:limit'
  API_USERS_BY_SHARED_WITH_ME_WITH_PAGINATION: '/sharedwithme',
  API_USERS_SHARED_CREATE: 'usersshareds',
  API_USERS_SHAREDS_DELETE: 'usersshareds/',


  //Customize Detail Fields
  API_GET_CUSTOMIZE_DETAIL_FIELDS: 'customizedDetailFields?createdBy=', //createdBy is equal toi userId
  API_CREATE_OR_DELETE_CUSTOMIZE_DETAILS_FIELDS: 'customizedDetailFields',//
  API_UPDATE_CUSTOMIZE_DETAILS_FIELDS: 'customizedDetailFields/',//FOR UPDATION AND DELETE WE NEED TO ADD ID OF CUTOMIze DETAIL FIELDS

  //customizedDetailFields on addsetudent detailScreen
  API_CUTOMIZED_DETAIL_FIELDS_FOR_STUDENT: 'customizedDetailFields/forStudent/',

  //defaultActionFields
  API_DEFAULT_ACTION_VALUES: 'defaultActionValues',

  //EmailBlast
  API_STUDENTS_UPDATE_EMAIL_BLAST: 'students/updateEmailBlast/',

  //Randomizer
  API_RANDOMIZER: 'randomizer',

  //customize terminology 
  API_RESET_TERMOLOGY: 'resetTermology/',

  //ForgetPassword
  API_FORGOT_PASSWORD: 'forgotPassword',

  //Export creation
  API_EXPORT: 'export/',
  API_STUDENTS_REPORT_LISTING: 'studentsReportListing/',
  API_STUDENT_DEMOGRAPHICS_REPORT: 'studentDemographicsReport/',
  API_STUDENT_ACTIONS_REPORT: 'studentActionsReport/',
  API_STUDENT_TEXT_REPORT: 'studentTextReport/',

  //Api keys for formation of url
  API_USERS: 'users/',
  API_STUDENT_ID: '/studentId/',
  API_PAGINATION: '/pagination/',
  API_SELECTED_BULK_DELETE: 'selectedbulkdelete/',
  API_GET_BY_USER_ID: '/createdby/',
  API_WITH_SELECTION_STUDENTID: '/withselection/studentid/',
  API_USER_ID: 'userid/',
  API_SHARED_WITH_ME_USER_ID: '/sharedwithme/userid/',
  API_PERSIST: '&persist=true',
  API_MARK: '/mark/', // in Randoimizer mor adding marks to student

  API_BUY_SUBSCRIPTION: "users/buy",
  API_BUY_SUBSCRIPTION_RETORE: "users/package/restore",






};
export default API;