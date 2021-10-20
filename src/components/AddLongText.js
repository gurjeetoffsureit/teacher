import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform, Image, SafeAreaView
} from 'react-native';
import StorageConstant from '../constants/StorageConstant'
import API from '../constants/ApiConstant';
import TeacherAssitantManager from '../Singletons/TeacherAssitantManager';
import { Keyboard } from 'react-native';
import StyleTeacherApp from '../styles/StyleTeacherApp'
import BreadCrumbConstant from "../constants/BreadCrumbConstant";
export default class AddLongText extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            userId: TeacherAssitantManager.getInstance().getUserID(),
            longText: this.props.navigation.state.params.item.actionValue,
            isUpdate: false,
            previousData: this.props.navigation.state.params.item.data
        }
    }

    handlelongText = (text) => {
        this.setState({ longText: text })
    }

    componentDidMount() {
        this.props.navigation.setParams({
            onAdd: this.onAddPress,
            moveToPreviousScreen: this.moveToPreviousScreen
        })
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: '' + ` ${navigation.state.params.screenTitle}`,
            gestureEnabled: false,
            headerTitleStyle: StyleTeacherApp.headerTitleStyle,
            headerStyle: StyleTeacherApp.headerStyle,

            headerLeft: ()=><TouchableOpacity onPress={() => params.moveToPreviousScreen()}>
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
            headerRight:  () => <TouchableOpacity 
                onPress={() => params.onAdd()}>
                <Text style={StyleTeacherApp.headerRightButtonText}>
                    {navigation.state.params.headerRight}
                </Text>
            </TouchableOpacity>
        }
    }

    onAddPress = () => {
        Keyboard.dismiss

        //if (this.state.longText.trim() != '') {
        var item = {
            _id: this.state.previousData._id,
            dataType: this.state.previousData.dataType,
            actionValue: this.state.longText
        }
        this.props.navigation.state.params.onGoBack(item, true);
        // }
        // else{
        //     this.props.navigation.state.params.onGoBack();
        // }
        this.props.navigation.goBack();

    }

    moveToPreviousScreen = () => {
        Keyboard.dismiss;

        this.props.navigation.state.params.onGoBack(this.state.previousData);
        this.props.navigation.goBack();

    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }} >
                    <TextInput style={styles.longInputType}
                        multiline
                        underlineColorAndroid="transparent"
                        placeholder={"Add " + this.props.navigation.state.params.screenTitle}
                        placeholderTextColor="black"
                        autoCapitalize="none"
                        value={this.state.longText}
                        onChangeText={this.handlelongText} />
                </View>
            </SafeAreaView>

        )
    }
}

const styles = StyleSheet.create({
    textInputStyle: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    RightHeaderbuttonText: {
        color: '#0E72F1',
        fontSize: 20,
        marginRight: 10
    },
    longInputType: {
        fontSize: 16,
        margin: 10,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        flex: 1,
        textAlignVertical: "top",
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
    },
});