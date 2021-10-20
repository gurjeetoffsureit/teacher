import React from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';
import StyleLoader from '../styles/StyleLoader';

const FlatListFooterLoader = props => {
  const {
    isFetchingFromServer,
  } = props;


  return (
    <View style={isFetchingFromServer ? StyleLoader.footer : { height: 0 }}>
      {
        isFetchingFromServer ?
          <ActivityIndicator style={StyleLoader.activityIndicator} />
          :
          null
      }
    </View>
  )
}

export default FlatListFooterLoader;