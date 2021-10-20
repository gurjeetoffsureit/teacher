import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import SpalshScreen from "./src/components/SplashScreen" //'/src/components/SplashScreen'
import LoginScreen from './src/components/LoginScreen'
import SignUpScreen from './src/components/SignUpScreen'
import HomeScreen from './src/components/HomeScreen'
import StudentScreen from './src/components/StudentScreen'
import ClassScreen from './src/components/ClassScreen'
import AddStudentDetailsScreen from './src/components/AddStudentDetailsScreen'
import AddClass from './src/components/AddClass'
import Settings from './src/components/Setting'
import AllClassesForSharedStudent from './src/components/AllClassesForSharedStudent'
import AllClassForStudents from './src/components/AllClassForStudents'
import ImportCSV from './src/components/ImportCSV'
import PerviewCSV from './src/components/PerviewCSV'
import StudentActions from './src/components/StudentActions'
import ColorLabelsScreen from './src/components/ColorLabelsScreen'
import AddColorLabels from './src/components/AddColorLabels'
import CustomizeActionFieldsScreen from './src/components/CustomizeActionFieldsScreen'
import AddCustomizeActionFields from './src/components/AddCustomizeActionFields'
import StudentActionFields from './src/components/StudentActionFields'
import AddLongText from './src/components/AddLongText'
import ColorPickerDataType from './src/components/ColorPickerDataType'
import PickerDataType from './src/components/PickerDataType'
import AddActionImage from './src/components/AddActionImage'
import AddPickerActionValue from './src/components/AddPickerActionValue'
import AddDateTime from './src/components/AddDateTime'
import IntializationData from './src/components/IntializationData'
import AddActionsToManyScreen from './src/components/AddActionsToManyScreen'
import AllStudentsList from './src/components/AllStudentsList'
import SettingDateRange from './src/components/SettingDateRange'
import AddSettingDateRange from './src/components/AddSettingDateRange'
import SettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock from './src/components/SettingStudentDisplayAndSortOrderAndQuickJumpAndScreenLock'
import SettingShareData from './src/components/SettingShareData'
import SettingAnotherTeachersSharedData from './src/components/SettingAnotherTeachersSharedData'
import SettingShareDataWithAnotherTeacher from './src/components/SettingShareDataWithAnotherTeacher'
import FAQsAndVideoHelp from './src/components/FAQsAndVideoHelp'
import ScreenLock from './src/components/ScreenLock'
import EmailBlastRecipient from './src/components/EmailBlastRecipient'
import SetEmailBlastRecipient from './src/components/SetEmailBlastRecipient'
import SettingCustomizeDetailFields from './src/components/SettingCustomizeDetailFields'
import AddSettingCustomizeDetailFields from './src/components/AddSettingCustomizeDetailFields'

import AddStudentParents from './src/components/AddStudentParents'
import AddStudentParentsEmail from './src/components/AddStudentParentsEmail'
import AddStudentParentsContact from './src/components/AddStudentParentsContact'
import EmailBlastSpecifyRecipient from './src/components/EmailBlastSpecifyRecipient'
import SettingToTeacherEmail from './src/components/SettingToTeacherEmail'
import Randomizer from './src/components/Randomizer'
import ParentDetailScreenForSharingAction from './src/components/ParentDetailScreenForSharingAction'
import ForgetScreen from './src/components/ForgetScreen'
import FilterTeacherAndParentResponse from './src/components/FilterTeacherAndParentResponse'
import SettingExportData from './src/components/SettingExportData'
import SettingExportReportOptions from './src/components/SettingExportReportOptions'
import FiltersPoints from './src/components/FiltersPoints'









// import { Provider } from 'react-redux';
// import store from './reducers/index';
// import StudentActions from './actions/StudentsActions';

// import SocketManager from '../src/components/SocketManager'

// export default class App extends Component {
//     constructor(props) {
//         super(props)


//         // Obj = new SocketManager();
//     }


//     render() {
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

//         return (
//             <AppNavigator />
//         );
//     }
// }

const RootNavigator = createAppContainer(AppNavigator)


export default RootNavigator;


// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow strict-local
//  */

// import React from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
//   View,
//   Text,
//   StatusBar,
// } from 'react-native';

// import {
//   Header,
//   LearnMoreLinks,
//   Colors,
//   DebugInstructions,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

// const App: () => React$Node = () => {
//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView>
//         <ScrollView
//           contentInsetAdjustmentBehavior="automatic"
//           style={styles.scrollView}>
//           <Header />
//           {global.HermesInternal == null ? null : (
//             <View style={styles.engine}>
//               <Text style={styles.footer}>Engine: Hermes</Text>
//             </View>
//           )}
//           <View style={styles.body}>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Step One</Text>
//               <Text style={styles.sectionDescription}>
//                 Edit <Text style={styles.highlight}>App.js</Text> to change this
//                 screen and then come back to see your edits.
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>See Your Changes</Text>
//               <Text style={styles.sectionDescription}>
//                 <ReloadInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Debug</Text>
//               <Text style={styles.sectionDescription}>
//                 <DebugInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Learn More</Text>
//               <Text style={styles.sectionDescription}>
//                 Read the docs to discover what to do next:
//               </Text>
//             </View>
//             <LearnMoreLinks />
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   scrollView: {
//     backgroundColor: Colors.lighter,
//   },
//   engine: {
//     position: 'absolute',
//     right: 0,
//   },
//   body: {
//     backgroundColor: Colors.white,
//   },
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: Colors.black,
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//     color: Colors.dark,
//   },
//   highlight: {
//     fontWeight: '700',
//   },
//   footer: {
//     color: Colors.dark,
//     fontSize: 12,
//     fontWeight: '600',
//     padding: 4,
//     paddingRight: 12,
//     textAlign: 'right',
//   },
// });

// export default App;
