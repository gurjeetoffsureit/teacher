import { StyleSheet, Platform, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({

    justifyContentCenter: {
        justifyContent: "center"
    },

    alignItemsCenter: {
        alignItems: "center",
    },

    flexDirectionRow: {
        flexDirection: 'row'
    },

    width60Per: { width: '60%' },
    marginLeft14: { marginLeft: 14 },

    //Navifation Section
    leftImageViewHeader: {
        // height: 20,
        // width: 20,
        marginLeft: 13,
        // backgroundColor:'red'
        //  marginTop: 12
    },
    rightImageViewHeader: {
        height: 20,
        width: 20,
        marginLeft: 0,
        marginRight: 15,
    },
    headerLeftButtonText: {
        color: '#0E72F1',
        fontSize: 16,
        // marginTop: 12,
        marginLeft: 2,
    },
    headerRightButtonText: {
        color: '#0E72F1',
        fontSize: 16,
        marginRight: 15
    },

    //help to set title of screen in center
    headerTitleStyle: {
        width: '100%',
        // height:44,
        textAlign: 'center',
        fontSize: 16,
        // alignSelf:"center"
        // backgroundColor:'red'

    },

    headerStyle: {
        // height: 80,
        // alignContent:"center"
    },

    //Next Screen Navigation Indicator e.g, on home Screen[student:0               >]
    nextScreenArrowNavigationImageContainer: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20
    },
    nextScreenArrowNavigationImage: {
        justifyContent: "center",
        alignItems: "center",
        height: 16,
        width: 16
    },
});
