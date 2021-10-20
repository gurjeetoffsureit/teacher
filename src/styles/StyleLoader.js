import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    footer:
    {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#8E8E8E'
    },
    activityIndicator: {
        // color: "#4799EB",
        marginLeft: 8
    },
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 100,
        width: 100,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    mainContainer: {
        backgroundColor: '#E7E7E7'
    },
    textElement: {
        color: 'black', 
        fontSize: 15, 
        padding: 2, 
        textAlign: 'center'
    }

});
