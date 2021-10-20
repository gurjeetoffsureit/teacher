import React from "react";
import {
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    ToastAndroid, Switch, SafeAreaView
} from 'react-native'
import API_PARAM from '../constants/ApiParms'
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager'
import API from '../constants/ApiConstant'
import Loader from '../ActivityIndicator/Loader';
import { Keyboard } from 'react-native';
import TextMessage from "../constants/TextMessages";
// import Switch from 'react-native-customisable-switch';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
import ComingFrom from '../constants/ComingFrom';

import Toast, { DURATION } from 'react-native-easy-toast'

export default class AddCustomizeActionFields extends React.PureComponent {
    constructor(props) {
        super(props)
        var stateParams = this.props.navigation.state.params
        var previouData = stateParams.item
        this.state = {
            singular: previouData === undefined ? '' : previouData.singular,
            plural: previouData === undefined ? '' : previouData.plural,
            listData: API_PARAM.ACTION_LIST,
            selectedAction: previouData === undefined ? '' : previouData.dataType,
            isUpdate: previouData === undefined ? false : true,
            ActionVisibility: previouData === undefined ? true : previouData.visible,
            userId: TeacherAssitantManager.getInstance().getUserID(),
            actionId: previouData === undefined ? '' : previouData._id,
            defaultTypeStatus: false,
            uiTypeStatus: false,
            loading: false,
            comingFrom: stateParams.comingFrom,
        }
        this._setSelectedActionTypeSelected()
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.saveActions,
            gotoBack: this.moveToPreviousScreen
        })
    }
    moveToPreviousScreen = () => {
        Keyboard.dismiss;

        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }
    _setSelectedActionTypeSelected = () => {
        for (var i = 0; i < this.state.listData.length; i++) {
            var data = this.state.listData[i]
            if (data.value == this.state.selectedAction) {
                data.isSelected = true
            }
            else {
                data.isSelected = false
            }
        }
    }
    setLoading(isShowing) {
        this.setState({
            loading: isShowing
        });
    }

    saveActions = () => {
        Keyboard.dismiss;

        if (this._validation()) {
            var isTrue = this.state.comingFrom != ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY && this.props.navigation.state.params.headerRight == "Save"
            this.setLoading(true)
            // console.log("AddClass  UserId", this.state.userId);
            // console.log("url is ", API.BASE_URL + API.API_ACTIONS)
            var url = (isTrue ? API.BASE_URL + API.API_ACTIONS + "/unique/" :
                API.BASE_URL + API.API_ACTIONS + "/unique/" + this.state.actionId)
            var body = {
                createdBy: this.state.userId,
                singular: this.state.singular,
                plural: this.state.plural,
                dataType: this.state.selectedAction,
                visible: this.state.ActionVisibility,
            }
            TeacherAssitantManager.getInstance()._serviceMethod(url, {
                method: isTrue ? 'POST' : 'PUT',
                headers: {
                    // Accept: 'application/json',
                    // 'Content-Type': 'application/json',
                    // 'clientid': TeacherAssitantManager.getInstance().getClientID(),
                    // 'userId': TeacherAssitantManager.getInstance().getUserID()
                },
                body: JSON.stringify(body),

            }).then((responseJson) => {
                // console.log(responseJson.message);
                if (responseJson.success) {
                    // this.showAlert(responseJson.message)
                    this.setLoading(false)
                    this._showToastMessage(responseJson.message)
                    // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                    let self = this
                    setTimeout(() => {
                        self.moveToPreviousScreen();
                    }, 300);

                } else {
                    this.setLoading(false)
                    // this.showAlert(responseJson.message);
                    this._showToastMessage(responseJson.message)
                    // TeacherAssitantManager.getInstance().showAlertWithDelay(responseJson.message)
                }
            }).catch((error) => {
                console.error(error);
            });
        }
    }

    _validation() {
        if (this.state.singular.trim() == '') {
            this._showToastMessage(TextMessage.ALL_DETAILS_ARE_REQUIRED_TO_FILL)
            // TeacherAssitantManager.getInstance().showAlert(TextMessage.ALL_DETAILS_ARE_REQUIRED_TO_FILL)
            // this.showAlert("All details are required to fill")
        }
        else if (this.state.plural.trim() == '') {
            this._showToastMessage(TextMessage.ALL_DETAILS_ARE_REQUIRED_TO_FILL)
            // TeacherAssitantManager.getInstance().showAlert(TextMessage.ALL_DETAILS_ARE_REQUIRED_TO_FILL)
            // this.showAlert("All details are required to fill")
        }
        else if (this.state.selectedAction.trim() == '') {
            this._showToastMessage(TextMessage.SELECT_A_DATATYPE_TO_CREATE_ACTION)
            // TeacherAssitantManager.getInstance().showAlert(TextMessage.SELECT_A_DATATYPE_TO_CREATE_ACTION)
            // this.showAlert("Select datatype to create action")
        }
        else {
            return true;
        }
    }


    _handleSingular = (text) => {
        this.setState({
            singular: text
        })
    }
    _handlePlural = (text) => {
        this.setState({
            plural: text
        })
    }



    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            title: '' + ` ${navigation.state.params.screen}`,
            gestureEnabled: false,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=><TouchableOpacity onPress={() => params.gotoBack()}>
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
            headerRight: () => <TouchableOpacity
                    onPress={() => params.onAdd()}>
                <Text style={StyleTeacherApp.headerRightButtonText}>
                    {`${navigation.state.params.headerRight}`}
                </Text>
            </TouchableOpacity>
            

        }
    }
    setSelectedDataTypeText() {
        var dataType = ""
        switch (this.state.selectedAction.toLowerCase()) {
            case API_PARAM.ACTION_COLORPICKER:
                dataType = "PICKER"
                break;
            case API_PARAM.ACTION_COLOR_LABEL_PICKER:
                dataType = "PICKER"
                break;
            default:
                dataType = this.state.selectedAction
                break;
        }
        return dataType;
    }

    _showToastMessage(message) {
        this.toast.show(message, DURATION.LENGTH_SHORT);
    }

    render() {

        var isNotCustomizeTerminilogy = this.state.comingFrom != ComingFrom.SETTINGS_CUSTOMIZE_TERMENOLOGY
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <Loader loading={this.state.loading} />
                    <Toast ref={o => this.toast = o}
                        position={'bottom'}
                        positionValue={200}
                    />
                    <View style={{ marginLeft: 20, marginRight: 20, marginTop: 10 }}>
                        <Text style={{ fontSize: 18, color: 'black', marginTop: 15, fontWeight: 'bold' }}>Singular</Text>
                        <TextInput style={styles.input}
                            underlineColorAndroid="transparent"
                            placeholder="Singular"
                            placeholderTextColor="black"
                            autoCapitalize="none"
                            value={this.state.singular}
                            onChangeText={this._handleSingular} />

                        <Text style={{ fontSize: 18, color: 'black', marginTop: 15, fontWeight: 'bold' }}>Plural</Text>
                        <TextInput style={styles.input}
                            underlineColorAndroid="transparent"
                            placeholder="Plural"
                            placeholderTextColor="black"
                            autoCapitalize="none"
                            value={this.state.plural}
                            onChangeText={this._handlePlural} />
                        {/* <View style={{flex:1,flexDirection:'row'}}> */}
                        {
                            isNotCustomizeTerminilogy ?
                                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                                    <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold', justifyContent: 'flex-start' }}>Data Type:</Text>
                                    {this.state.isUpdate ? <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold', position: 'absolute', end: 10 }}>
                                        {this.setSelectedDataTypeText()}</Text>
                                        : null
                                    }
                                </View>

                                : null
                        }
                        {
                            isNotCustomizeTerminilogy ?
                                <View style={{ height: 0.5, backgroundColor: 'gray', marginTop: 10, marginBottom: 10 }} />
                                : null
                        }


                    </View>
                    {
                        isNotCustomizeTerminilogy ?
                            this.state.isUpdate ?
                                <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 20, marginRight: 20 }}>
                                    <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold', justifyContent: 'flex-start' }}>Visible:</Text>
                                    {/* <Text style={{fontSize:15,color:'black',fontWeight:'bold',position:'absolute',end:10}}>Data Type:</Text>  */}
                                    <View style={styles.container}>
                                        <Switch
                                            onValueChange={this._handleSwitch}
                                            value={this.state.ActionVisibility}
                                        />
                                    </View>
                                </View> :
                                <FlatList
                                    style={styles.list}
                                    data={this.state.listData}
                                    extraData={this.state.listData}
                                    renderItem={this._renderItem}
                                    keyExtractor={(item, index) => `${index}`}
                                    ItemSeparatorComponent={(sectionId, rowId) => (
                                        <View key={rowId} style={styles.separator} />
                                    )}
                                />
                            : null

                    }


                </View>
            </SafeAreaView>

        )
    }
    _handleSwitch = (value) => {
        this.setState({
            ActionVisibility: value

        })
    }

    _renderItem = ({ item, index }) => {
        // var items = this.state.listData
        return (
            <View>
                <TouchableOpacity
                    onPress={() => this._setSelectedItem(item, index)} >
                    <View style={{
                        height: 40,
                        backgroundColor: '#E0E0E0',
                        marginStart: 20,
                        marginEnd: 20,
                        borderRadius: 5,
                        marginTop: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderColor: '#757575',
                        borderWidth: 1
                    }}>
                        <Text style={{ color: '#757575', position: 'absolute', start: 10, fontSize: 18 }} >{item.name}</Text>
                        {
                            item.isSelected ? <Image
                                style={{ height: 20, width: 20, position: 'absolute', end: 10, }}
                                source={require("../img/check_icon.png")}
                            /> : null
                        }
                    </View>
                </TouchableOpacity>
            </View>



        );
    };
    _setSelectedItem = (item, index) => {
        // console.log("Object is", item)
        for (i = 0; i < this.state.listData.length; i++) {
            if (index == i) {
                this.state.listData[i].isSelected = true
            } else {
                this.state.listData[i].isSelected = false
            }
        }
        this.setState({
            selectedAction: item.value,
            listData: this.state.listData
        })
    }
}



const styles = StyleSheet.create({
    imageViewHeader: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,
        marginLeft: 15,
        marginRight: 10,
    },
    imageView: {
        alignItems: 'center',
        width: 32,
        height: 32
    },
    input: {
        height: 40,
        marginTop: 10,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingStart: 8,
        paddingEnd: 8,
    },
    inputGray: {
        height: 45,
        marginTop: 10,
        backgroundColor: 'gray',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingStart: 8,
        paddingEnd: 8,
        flex: 1,
        flexDirection: 'row'
    },
    buttonText: {
        color: '#0E72F1',
        fontSize: 20,
        marginRight: 10
    },
    container: {
        position: 'absolute', end: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

});

