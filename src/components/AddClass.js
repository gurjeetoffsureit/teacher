import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView, Image
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import StorageConstant from '../constants/StorageConstant';
import API from '../constants/ApiConstant';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import Loader from '../ActivityIndicator/Loader';
import { Keyboard } from 'react-native';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import AppConstant from "../constants/AppConstant";
import Toast, { DURATION } from 'react-native-easy-toast';

export default class AddClass extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            className: this.props.navigation.state.params.className,
            userId: '',
            loading: false,
            createdBy: this.props.navigation.state.params.createdBy
        }
    }

    handleClassName = (text) => {
        this.setState({ className: text })
    }

    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    componentDidMount() {
        this.getAndSetUserId()
        this.props.navigation.setParams({
            onAdd: this.onAddPress,
            moveToClassScreen: this.gotoClassessScreen
        })
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: '' + ` ${navigation.state.params.title}` + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_CLASS, 0),
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=><TouchableOpacity onPress={() => params.moveToClassScreen()}>
                    <View style={[StyleTeacherApp.flexDirectionRow, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.width60Per,
                    StyleTeacherApp.marginLeft14]}>
                        <Image
                            style={[StyleTeacherApp.leftImageViewHeader, StyleTeacherApp.justifyContentCenter, StyleTeacherApp.alignItemsCenter]}
                            source={require("../img/back_arrow_ios.png")} />
                        <Text style={[StyleTeacherApp.headerLeftButtonText]} numberOfLines={1}>{
                            TeacherAssitantManager.getInstance()._setnavigationleftButtonText(params.leftHeader)}</Text>
                    </View>
                </TouchableOpacity>
            ,
            headerRight: () => <TouchableOpacity 
                onPress={() => params.onAdd()}
                disabled={params.createdBy != TeacherAssitantManager.getInstance().getUserID()}>
                <Text style={StyleTeacherApp.headerRightButtonText}>
                    {params.createdBy == TeacherAssitantManager.getInstance().getUserID() ? `${params.headerRight}` : ''}
                </Text>
            </TouchableOpacity>
            
        }
    }

    getAndSetUserId = () => {
        AsyncStorage.getItem(StorageConstant.STORE_USER_ID).then((value) => {
            // console.log("Get Value >> ", value);
            this.setState({ userId: value })
        }).done();
    }

    onAddPress = () => {
        Keyboard.dismiss;
        if (this.state.className == '') {
            this._showToastMessage("Class Name is required")
        }
        else {
            this.saveClassNameOnServer()
        }
    }

    saveClassNameOnServer = () => {
        this.setLoading(true);
        const TITLE = this.props.navigation.state.params.title + TeacherAssitantManager.getInstance()._getCustomizeTerminiologyLabelValue(AppConstant.CT_CLASS, 0) == "Update Class" ? this.props.navigation.state.params.classId : '';
        // console.log('Title',TITLE);
        var url = API.BASE_URL + API.API_CLASSES + "/unique/" + (TITLE);
        // console.log("Add class url", url)
        TeacherAssitantManager.getInstance()._serviceMethod(url, {
            method: TITLE ? 'PUT' : 'POST',
            headers: {
            },
            body: JSON.stringify({
                name: this.state.className,
                createdBy: this.state.userId,
            }),
        }).then((responseJson) => {
            // console.log(responseJson.message);

            // console.log("responseJson responseJson saveClassNameOnServer --> ", JSON.stringify(responseJson))

            if (responseJson.success) {
                this.setLoading(false);
                this._showToastMessage(responseJson.message)
                let self = this
                setTimeout(() => {
                    self.gotoClassessScreen();
                }, 300);
            } else {
                this.setLoading(false);
                this._showToastMessage(responseJson.message)
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    gotoClassessScreen = () => {
        Keyboard.dismiss;
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View >
                    <Loader loading={this.state.loading} />
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200} />
                    <TextInput style={styles.input}
                        underlineColorAndroid="transparent"
                        placeholder="Enter Class Name"
                        placeholderTextColor="black"
                        autoCapitalize="none"
                        value={this.state.className}
                        onChangeText={this.handleClassName} />
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E7E7E7"
    },
    textViewCOntainer: {
        flex: 1,
        flexDirection: 'row',
        margin: 10,
        height: 40,
        justifyContent: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    textViewOtherCOntainer: {
        flex: 1,
        backgroundColor: "#ffffff",

    },
    textStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 0.4,
        fontSize: 15,
    },
    textInputStyle: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textView: {
        margin: 10,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        fontSize: 15,
        marginTop: 20,
        color: 'gray'
    },
    button: {
        height: 50,
        flex: 2,
        marginTop: 15,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    buttonText: {
        color: '#0E72F1',
        fontSize: 20,
        marginRight: 10
    },
    input: {
        margin: 40,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        paddingStart: 8,
        paddingEnd: 8
    },
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    }
});