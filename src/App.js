import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation';
import SpalshScreen from './components/SplashScreen'
import LoginScreen from './components/LoginScreen'
import SignUpScreen from './components/SignUpScreen'
import HomeScreen from './components/HomeScreen'
import StudentScreen from './components/StudentScreen'
import ClassScreen from './components/ClassScreen'
import AddStudentDetailsScreen from './components/AddStudentDetailsScreen'
import AddClass from './components/AddClass'
import Settings from './components/Setting'
// import ClassStudent from './components/ClassStudent'
import AllClassesForSharedStudent from './components/AllClassesForSharedStudent'
import AllClassForStudents from './components/AllClassForStudents'
import ImportCSV from './components/ImportCSV'
import PerviewCSV from './components/PerviewCSV'
import StudentActions from './components/StudentActions'
import ColorLabelsScreen from './components/ColorLabelsScreen'
import AddColorLabels from './components/AddColorLabels'
import CustomizeActionFieldsScreen from './components/CustomizeActionFieldsScreen'
import AddCustomizeActionFields from './components/AddCustomizeActionFields'
import StudentActionFields from './components/StudentActionFields'
import AddLongText from './components/AddLongText'
import ColorPickerDataType from './components/ColorPickerDataType'
import PickerDataType from './components/PickerDataType'
import AddActionImage from './components/AddActionImage'
import AddPickerActionValue from './components/AddPickerActionValue'
import AddDateTime from './components/AddDateTime'
import IntializationData from './components/IntializationData'
import AddActionsToManyScreen from './components/AddActionsToManyScreen'
import AllStudentsList from './components/AllStudentsList'
import SettingDateRange from './components/SettingDateRange'
import AddSettingDateRange from './components/AddSettingDateRange'
import SettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock from './components/SettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock'
import SettingShareData from './components/SettingShareData'
import SettingAnotherTeachersSharedData from './components/SettingAnotherTeachersSharedData'
import SettingShareDataWithAnotherTeacher from './components/SettingShareDataWithAnotherTeacher'
import FAQsAndVideoHelp from './components/FAQsAndVideoHelp'
import ScreenLock from './components/ScreenLock'
import EmailBlastRecipient from './components/EmailBlastRecipient'
import SetEmailBlastRecipient from './components/SetEmailBlastRecipient'
import SettingCustomizeDetailFields from './components/SettingCustomizeDetailFields'
import AddSettingCustomizeDetailFields from './components/AddSettingCustomizeDetailFields'

import AddStudentParents from './components/AddStudentParents'
import AddStudentParentsEmail from './components/AddStudentParentsEmail'
import AddStudentParentsContact from './components/AddStudentParentsContact'
import EmailBlastSpecifyRecipient from './components/EmailBlastSpecifyRecipient'
import SettingToTeacherEmail from './components/SettingToTeacherEmail'
import Randomizer from './components/Randomizer'
import ParentDetailScreenForSharingAction from './components/ParentDetailScreenForSharingAction'
import ForgetScreen from './components/ForgetScreen'
import FilterTeacherAndParentResponse from './components/FilterTeacherAndParentResponse'
import SettingExportData from './components/SettingExportData'
import SettingExportReportOptions from './components/SettingExportReportOptions'
import FiltersPoints from './components/FiltersPoints'









// import { Provider } from 'react-redux';
// import store from './reducers/index';
// import StudentActions from './actions/StudentsActions';

// import SocketManager from '../src/components/SocketManager'

export default class App extends Component {
    constructor(props) {
        super(props)


        // Obj = new SocketManager();
    }


    render() {
        const AppNavigator = createStackNavigator({
            SplashScreen: { screen: SpalshScreen },
            LoginScreen: { screen: LoginScreen },
            SignUpScreen: { screen: SignUpScreen },
            HomeScreen: { screen: HomeScreen },
            StudentScreen: { screen: StudentScreen },
            ClassScreen: { screen: ClassScreen },
            AddStudentDetailsScreen: { screen: AddStudentDetailsScreen },
            AddClass: { screen: AddClass },
            Settings: { screen: Settings },
            // ClsssStudent: {screen: ClassStudent},
            AllClassesForSharedStudent: { screen: AllClassesForSharedStudent },
            AllClassForStudents: { screen: AllClassForStudents },
            ImportCSV: { screen: ImportCSV },
            PerviewCSV: { screen: PerviewCSV },
            StudentActions: { screen: StudentActions },
            ColorLabelsScreen: { screen: ColorLabelsScreen },
            AddColorLabels: { screen: AddColorLabels },
            CustomizeActionFieldsScreen: { screen: CustomizeActionFieldsScreen },
            AddCustomizeActionFields: { screen: AddCustomizeActionFields },
            StudentActionFields: { screen: StudentActionFields },
            AddLongText: { screen: AddLongText },
            PickerDataType: { screen: PickerDataType },
            ColorPickerDataType: { screen: ColorPickerDataType },
            AddActionImage: { screen: AddActionImage },
            AddPickerActionValue: { screen: AddPickerActionValue },
            AddDateTime: { screen: AddDateTime },
            IntializationData: { screen: IntializationData },
            AddActionsToManyScreen: { screen: AddActionsToManyScreen },
            AllStudentsList: { screen: AllStudentsList },
            SettingDateRange: { screen: SettingDateRange },
            AddSettingDateRange: { screen: AddSettingDateRange },
            SettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock: { screen: SettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock },
            SettingShareData: { screen: SettingShareData },
            SettingAnotherTeachersSharedData: { screen: SettingAnotherTeachersSharedData },
            SettingShareDataWithAnotherTeacher: { screen: SettingShareDataWithAnotherTeacher },
            FAQsAndVideoHelp: { screen: FAQsAndVideoHelp },
            ScreenLock: { screen: ScreenLock },
            EmailBlastRecipient: { screen: EmailBlastRecipient },
            SetEmailBlastRecipient: { screen: SetEmailBlastRecipient },
            SettingCustomizeDetailFields: { screen: SettingCustomizeDetailFields },
            AddSettingCustomizeDetailFields: { screen: AddSettingCustomizeDetailFields },
            AddStudentParents: { screen: AddStudentParents },
            AddStudentParentsEmail: { screen: AddStudentParentsEmail },
            AddStudentParentsContact: { screen: AddStudentParentsContact },
            EmailBlastSpecifyRecipient: { screen: EmailBlastSpecifyRecipient },
            SettingToTeacherEmail: { screen: SettingToTeacherEmail },
            Randomizer: { screen: Randomizer },
            ParentDetailScreenForSharingAction: { screen: ParentDetailScreenForSharingAction },
            ForgetScreen: { screen: ForgetScreen },
            FilterTeacherAndParentResponse: { screen: FilterTeacherAndParentResponse },
            SettingExportData: { screen: SettingExportData },
            SettingExportReportOptions: { screen: SettingExportReportOptions },
            FiltersPoints: { screen: FiltersPoints },
            
            


        })

        return (
            <AppNavigator />
        );
    }
}




// export default AppNavigator;
