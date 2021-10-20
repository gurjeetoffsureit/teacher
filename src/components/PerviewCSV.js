import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList, Image, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import StorageConstant from '../constants/StorageConstant'
import API from '../constants/ApiConstant';
import API_PARAM from '../constants/ApiParms';
import RNFS from 'react-native-fs';
import Loader from '../ActivityIndicator/Loader';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import Toast, { DURATION } from 'react-native-easy-toast'
import ComingFrom from '../constants/ComingFrom'
var self;

export default class PerviewCSV extends React.PureComponent {

    constructor(props) {
        super(props)
        self = this;
        this.state = {
            name: this.props.navigation.state.params.name,
            path: this.props.navigation.state.params.path,
            studentList: this.props.navigation.state.params.studentList,
            loading: false
        }

        //console.log("lenghth===" + this.state.studentList.length)


        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {



            this.state = {
                userId: value
            }

        }).done();

    }

    // setLoading=(isShowing)=>{
    //     this.setState({
    //         loading: isShowing
    //       });
    // }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.uploadFileToDropBoxcsvFile,
            moveToImportScreen: this.gotopreviousScreen
        })

        // //console.log(this.state.studentList.length);
        // //console.log("Student List",studentList);
    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    gotopreviousScreen = () => {

        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }
    uploadFileToDropBoxcsvFile = () => {

        this.setLoading(true);
        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
            //console.log("csv name is default", this.props.navigation.state.params.name)
            //console.log("csv name is", this.state.name)

            //console.log("Csv path default", this.props.navigation.state.params.path)

            //console.log("Csv path" + this.state.path)

            //console.log('userId====' + value)
            TeacherAssitantManager.getInstance()._serviceMethod(API.BASE_URL + API.API_IMPORT_CSV, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    'userId': TeacherAssitantManager.getInstance().getUserID(),
                },
                body: JSON.stringify({
                    fileName: this.state.name,
                    createdBy: value,
                }),
            })
                .then((responseJson) => {
                    // this.setLoading(false); //hide activate indicator  
                    //    this.showAlert(responseJson.message);
                    const { navigation } = self.props;
                    // navigation.navigate('HomeScreen')

                    // setTimeout(() => {
                        this.setLoading(false);
                        if (this.props.navigation.state.params.comingFrom && 
                            this.props.navigation.state.params.comingFrom === ComingFrom.SETTINGS_IMPORT_SCREEN){
                                this.props.navigation.pop(2)
                            }else{
                                navigation.navigate('HomeScreen')
                                // this.props.navigation.pop(3)
                                // this.props.navigation.state.params.onGoBack(true);
                            }
                    // }, 5000);
                    

                    //console.log('response sent successfully');
                    //console.log(responseJson);
                    //console.log(responseJson.message);
                    //console.log(responseJson.success);

                    //return responseJson;
                })
                .catch((error) => {
                    // this.setLoading(false); //hide activate indicator 

                    this.setLoading(false);
                    this._showToastMessage(error.message)
                    // this.showAlert(error.message);
                    //console.log('response sent not successfully' + JSON.stringify(error));
                    //return  error;
                });

        }).done();
    }

    readFile(path) {
        // const fileContents = FileSystem.readFile(path);
        const fileContents = RNFS.read(path);
        //console.log('read from file:' + JSON.stringify(fileContents));
    }


    renderItem = ({ item }) => (


        <View style={{ flex: 0.5, flexDirection: 'column', backgroundColor: 'white' }}>

            <View style={{ flex: 0.5, backgroundColor: 'white' }}>
                <View style={styles.innerContainer} >
                    <Text style={styles.text}>Full Name: </Text>
                    <Text>{item['Student First Name'] + " " + item['Student Last Name']}</Text>
                </View>

                <View style={styles.innerContainerWith5TopMargin} >
                    <Text style={styles.text}>Other1: </Text>
                    <Text>{item['Other 1']}</Text>
                </View>

                <View style={styles.innerContainerWith5TopMargin} >
                    <Text style={styles.text}>Other2: </Text>
                    <Text>{item['Other 2']}</Text>
                </View>

                <View style={styles.innerContainerWith5TopMargin} >
                    <Text style={styles.text}>Other3: </Text>
                    <Text>{item['Other 3']}</Text>
                </View>

                <View style={styles.innerContainerWith5TopMargin} >
                    <Text style={styles.text}>Class: </Text>
                    <Text>{item['Class Name']}</Text>
                </View>
            </View>





            <View style={{ height: 0.5, backgroundColor: 'gray', marginTop: 10 }}></View>

            <View style={{ flex: 0.5 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>


                    <View style={{ flex: 0.15, marginLeft: 10, marginTop: 10 }}>
                        <Text>  </Text>
                        <Text style={styles.textWithTopMargin}>Name:</Text>
                        <Text style={styles.textWithTopMargin}>Phone: </Text>
                        <Text style={styles.textWithTopMargin}>Email: </Text>



                    </View>
                    <View style={{ flex: 0.4, backgroundColor: 'white' }}>

                        <Text style={{ color: '#000', textAlign: 'center', marginTop: 10 }}>Parent 1 </Text>
                        <Text style={styles.textCenter}>{item['Parent 1 Name']} </Text>
                        <Text style={styles.textCenter}>{item['Parent 1 Phone']} </Text>
                        <Text style={styles.textCenter}>{item['Parent 1 Email']} </Text>

                    </View>
                    <View style={{ width: 0.5, backgroundColor: 'gray', alignItems: 'center', marginTop: 5 }}></View>


                    <View style={{ flex: 0.4 }}>

                        <Text style={{ color: '#000', textAlign: 'center', marginTop: 10 }}>Parent 2 </Text>
                        <Text style={styles.textCenter}>{item['Parent 2 Name']} </Text>
                        <Text style={styles.textCenter}>{item['Parent 2 Phone']} </Text>
                        <Text style={styles.textCenter}>{item['Parent 2 Email']} </Text>
                    </View>
                </View>

            </View>

            <View style={{ height: 0.5, backgroundColor: 'gray', marginTop: 10 }}></View>


        </View>




    );

    renderSeprator() {
        return (
            <View
                style={{
                    height: 1,
                    backgroundColor: "#CED0CE"
                }}
            />
        )
    }






    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: 'Preview',
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=>
                <TouchableOpacity onPress={() => params.moveToImportScreen()}>
                    <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.width60Per,
                    StyleTeacherApp.marginLeft14]}>
                        {/* <Image
              style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
              source={Platform.OS === "android" ? require("../img/back_arrow_android.png") : require("../img/back_arrow_ios.png")} /> */}
                        <Image
                            style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
                            source={require("../img/back_arrow_ios.png")} />
                        <Text style={[StyleTeacherApp.headerLeftButtonText]} numberOfLines={1}>{params.leftHeader}</Text>
                    </View>


                </TouchableOpacity>

            ,
            headerRight: () => 
                <TouchableOpacity 
                    onPress={() => params.onAdd()}>

                    <Text style={StyleTeacherApp.headerRightButtonText}>
                        Import
                                </Text>

                </TouchableOpacity>
            
        }
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {

        //console.log('render');
        //console.log('this.state when going : render');
        //console.log(this.state);
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <Loader loading={this.state.loading} />
                    <View style={styles.buttonImportView}>
                        <Text style={styles.selectBackFileText}>
                        </Text>
                    </View>
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <FlatList
                        style={styles.list}
                        data={this.state.studentList}
                        renderItem={this.renderItem}
                        keyExtractor={(item, index) => `${index}`}
                        onEndReached={this.loadMoreStudents}
                        ItemSeparatorComponent={(sectionId, rowId) => (
                            <View key={rowId} style={styles.separator} />
                        )}
                    />
                    {/* <FlatList
                    data={this.state.dataSource}
                    extraData={this.state}
                    renderItem = {this.renderItem}
                    keyExtractor = {item => item.path_display}
                    ItemSeparatorComponent = {this.renderSeprator}
                /> */}
                </View>
            </SafeAreaView>


            // <ScrollView>

            // </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        color: '#000',
        fontWeight: 'bold',



    },
    textWithTopMargin: {
        color: '#000',
        marginTop: 5,
        fontWeight: 'bold',
    },
    textCenter: {
        textAlign: 'center',
        marginTop: 5
    },
    innerContainer: {
        flexDirection: 'row'
        , marginLeft: 10,
        marginTop: 15,

    },
    innerContainerWith5TopMargin: {
        flexDirection: 'row'
        , marginLeft: 10,
        marginTop: 3

    },

    container: {
        flex: 1,
        backgroundColor: "#E7E7E7"

    },
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
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
    buttonText: {
        flex: 1,
        flexDirection: 'row',
        color: '#0E72F1',
        fontSize: 16,
        marginRight: 10,
        marginLeft: 10,
        justifyContent: 'center',
    },
    cellContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    classContainer: {
        flex: 0.9,
        flexDirection: 'column'
    },
    imageContainer: {
        flex: 0.05,
        flexDirection: 'row'
    },
    rowText: {
        justifyContent: 'center',
        alignItems: 'center',
        color: 'black',
        fontSize: 15,
        marginLeft: 10,
        flex: 0.9
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: 'white'
    },
    imageInfoContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageNextContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20
    },
    imageView: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 16,
        width: 16,
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',
    },
    touchStyle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageViewHeader: {
        color: '#0E72F1',
        fontSize: 20,
        marginRight: 10
    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10
    },
});