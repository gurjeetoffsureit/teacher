import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import StyleLoader from '../styles/StyleLoader'

const SyncingLoader = props => {
  const {
    textmessage,
    isAsyncLoader,
  } = props;

  return (
    isAsyncLoader ?
      <View style={StyleLoader.mainContainer}>
        <Text style={StyleLoader.textElement}>
          {textmessage}
        </Text>
      </View>
      : null
  )
}


export default SyncingLoader;