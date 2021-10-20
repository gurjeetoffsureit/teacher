import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    Platform, Image,
    PermissionsAndroid, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import dropboxKey from '../constants/DropboxConstant';
import RNFS from 'react-native-fs';
import StorageConstant from '../constants/StorageConstant'
import Loader from '../ActivityIndicator/Loader';
import API from '../constants/ApiConstant';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import AppConstant from "../constants/AppConstant";
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from '../constants/BreadCrumbConstant';
import Toast, { DURATION } from 'react-native-easy-toast'
// import {fs} from 'fs'

var self;

export default class ImportCSV extends React.PureComponent {
    constructor(props) {
        super(props)
        const { dropboxData, accessToken } = this.props.navigation.state.params
        let dataSource = dropboxData.filter((item)=>{
            return item.name.indexOf('.csv') > -1
        })
        this.state = {
            dataSource,
            accessToken,
            loading: false

        }

        self = this;
    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }


    //help to download file from drop box
    downloadDropBoxcsvFile = (item) => {
        if (item.name.indexOf('.csv') > -1) {
            // var { path, fileName } = this._downloadCSvOrDat(item,'.csv');
            this._downloadCsvOrDat(item, '.csv');
        } else if (item.name.indexOf('.dat') > -1) {
            Alert.alert(
                AppConstant.APP_NAME,
                'Are you sure you want to import ' + item.name,
                [
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                    {
                        text: 'OK', onPress: () => this._downloadCsvOrDat(item, '.dat')
                    },
                ],
                { cancelable: false }
            )
                ;
        } else {
            this._showToastMessage('File is not compatible')
            //this.showAlert('File is not compatible');
        }
    }


    _downloadCsvOrDat = (item, fileExtenison) => {
        this.setLoading(true); //show activate indicator    
        //console.log('downloadDropBoxcsvFile preseed');
        //console.log(item);
        var path = '';
        var fileName = TeacherAssitantManager.getInstance().getUserID() + '_' + new Date().getTime() + fileExtenison;
        if (Platform.OS === 'ios') {
            //item.name = fileName
            path = RNFS.DocumentDirectoryPath + '/' + fileName;
            this.saveFileToStroage(path, item, fileName, fileExtenison);
            //console.log('ios : ' + path);
        }
        else {
            this.readAndroidStroagePermission(item, fileName, fileExtenison);
            //console.log('Android : ' + path);
        }
        // return { path, fileName };
    }

    saveFileToStroage(path, item, fileName, fileExtenison) {
        //var path = RNFS.DocumentDirectoryPath + '/' + item.name;
        //console.log('path :' + path);
        RNFS.downloadFile({
            fromUrl: dropboxKey.DBX_DOWNLOAD_URL,
            toFile: path,
            headers: {
                "Authorization": "Bearer " + this.state.accessToken,
                "Dropbox-API-Arg": JSON.stringify({ path: item.path_display })
            }
        }).promise.then((response) => {
            if (response.statusCode == 200) {
                //hide activate indicator
                //console.log('FILES Downloaded!')
                //console.log(response);

                if (fileName.indexOf('.csv') > -1) {
                    this.uploadCsvOrDatFile(path, fileName, fileExtenison);
                } else {
                    RNFS.readFile(path, 'utf8') // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)

                        .then((contents) => {
                            //console.log(contents);
                            this.uploadCsvOrDatFile(path, fileName, fileExtenison, contents);
                        })
                        .catch((err) => {
                            //console.log(err.message, err.code);
                        });
                }




            } else {
                this.setLoading(false);//hide activate indicator
                this._showToastMessage('SERVER ERROR')
                //  this.showAlert('SERVER ERROR');
                //console.log('SERVER ERROR')
            }
        })
    }

    refresh = (text) => {
        if (text == true) {
            this.props.navigation.state.params.onGoBack(text);
            this.props.navigation.goBack();
        }


    }




    uploadCsvOrDatFile(path, fileName, fileExtenison, datFileData = '') {
        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
            //console.log("Get Value >> ", value);

            if (fileExtenison == '.csv') {
                //this.setLoading(true); //show activate indicator  
                let formdata = new FormData();
                formdata.append("createdBy", value)

                if (Platform.OS === 'ios') {
                    formdata.append("file_name", { uri: path, name: fileName, type: 'multipart/form-data' })
                } else {
                    formdata.append("file_name", { uri: 'file://' + path, name: fileName, type: 'multipart/form-data' })
                }

                //console.log("UserId", this.props.navigation.state.params.userId)
                fetch(API.BASE_URL + API.API_UPLOAD_PREVIEW_CSV, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'clientid': TeacherAssitantManager.getInstance().getClientID(),
                        'userId': TeacherAssitantManager.getInstance().getUserID(),
                    },
                    body: formdata,
                })
                    .then((response) => response.json())
                    .then((responseJson) => {

                        //console.log('response sent successfully');

                        if (responseJson.success) {
                            //console.log('if responseJson.success');
                            //console.log('student list===' + responseJson.data);
                            var studentList = [];
                            studentList = responseJson.data


                            //console.log('student list after===' + studentList);
                            this.setLoading(false);
                            const { navigation } = self.props;
                            navigation.navigate('PerviewCSV', {
                                name: responseJson.filename, path: path,
                                studentList: studentList, userId: this.props.navigation.state.params.userId, leftHeader: BreadCrumbConstant.CANCEL,
                                onGoBack: this.refresh
                            })
                        } else {
                            this.setLoading(false);
                            //console.log('responseJson.not success ');
                            this._showToastMessage(responseJson.message)
                            //  this.showAlert(responseJson.message)
                        }
                        //console.log(responseJson);
                        //console.log(responseJson.message);
                        //console.log(responseJson.success);

                        //return responseJson;
                    })
                    .catch((error) => {
                        // this.setLoading(false); //hide activate indicator 

                        //this.setLoading(false);
                        this._showToastMessage(error.message)
                        //  this.showAlert(error.message);
                        //console.log('response sent not successfully' + JSON.stringify(error));
                        //return  error;
                    })
            } else {

                TeacherAssitantManager.getInstance()._serviceMethod(API.BASE_URL + API.API_UPLOAD_PREVIEW_DAT + TeacherAssitantManager.getInstance().getUserID(), {
                    method: 'post',
                    headers: {
                        // 'Content-Type': 'multipart/form-data',
                        // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                        // 'userId': TeacherAssitantManager.getInstance().getUserID(),
                    },
                    body: JSON.stringify({
                        file: datFileData
                    }),
                })
                    .then((responseJson) => {

                        //console.log('response sent successfully');
                        this.setLoading(false);
                        if (responseJson.success) {
                            this.props.navigation.pop(2)
                            this.props.navigation.state.params.onGoBack(true);

                        } else {
                            //console.log('responseJson.not success ');
                            this._showToastMessage(responseJson.message)
                            //  this.showAlert(responseJson.message)
                        }
                        //return responseJson;
                    })
                    .catch((error) => {
                        // this.setLoading(false); //hide activate indicator 

                        //this.setLoading(false);
                        this._showToastMessage(error.message)
                        //  this.showAlert(error.message);
                        //console.log('response sent not successfully' + JSON.stringify(error));
                        //return  error;
                    })

            }


        }).done();
    }


    readAndroidStroagePermission(item, fileName, fileExtenison) {
        //let path = '';
        this.requestReadExternalStoragePermission().then((response) => {
            if (response) {
                //path = RNFS. DocumentDirectoryPath +  '/' + name
                this.saveFileToStroage(RNFS.DocumentDirectoryPath + '/' + fileName, item, fileName, fileExtenison);

                //return path;
            } else {
                this.setLoading(false)
                this.readAndroidStroagePermission(name, fileName, fileExtenison);
            }

        });
        // //console.log('abc');
        // return path;
    }

    async requestReadExternalStoragePermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    'title': AppConstant.APP_NAME,
                    'message': AppConstant.APP_NAME + ' need your external stroage'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {

                //console.log("You can use the camera")
                return true
            }
            else if (granted === PermissionsAndroid.RESULTS.DENIED) {
                this.requestReadExternalStoragePermission
            }
            else {
                this.requestReadExternalStoragePermission
                //console.log("Camera permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    }



    getAndSetUserId = () => {
        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {


            //console.log("Get Value >> ", value);

            return value

            //     this.setState({
            //        userId:value
            //    })

        }).done();
    }



    //reading item for list and show as row of list
    renderItem = ({ item }) => (

        <View style={styles.container} >
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => this.downloadDropBoxcsvFile(item)}>
                    <Text style={styles.buttonText}>{item.name}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
    
    //provide seprator to each row
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




    componentDidMount() {

        this.props.navigation.setParams({
            moveToSettingScreen: this.gotoPreviousScreen
        })
    }

    gotoPreviousScreen = () => {
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();

    }



    //Provide Navigation header
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: 'Import',
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: () =>
                <TouchableOpacity onPress={() => params.moveToSettingScreen()}>
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


        }
    }


    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    //render ui to screen
    render() {
        //console.log('render');
        //console.log('this.state when going : render');
        //console.log(this.state);
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'column', }}>
                    <Loader loading={this.state.loading} />
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <View style={styles.selectBackFileView}>
                        <Text style={styles.selectBackFileText}>
                            Select a backup file
                        </Text>
                    </View>
                    <FlatList
                        style={{ flex: 0.94 }}
                        data={this.state.dataSource}
                        extraData={this.state}
                        renderItem={this.renderItem}
                        keyExtractor={(item, index) => `${index}`}
                        ItemSeparatorComponent={this.renderSeprator}
                    />
                </View>
            </SafeAreaView>

        );
    }
}

const styles = StyleSheet.create({
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
        marginTop: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        marginLeft: 10
    },

    separator: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'red'
    },

    selectBackFileView: {
        flex: 0.06
    },
    selectBackFileText: {
        marginLeft: 5,
        marginTop: 7.5
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
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