import React from 'react';
import {
  View,
  Modal,
  ActivityIndicator
} from 'react-native';
import StyleLoader from '../styles/StyleLoader'

const Loader = props => {
  const {
    loading,
  } = props;

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      onRequestClose={() => { console.log('close modal') }}>
      <View style={StyleLoader.modalBackground}>
        <View style={StyleLoader.activityIndicatorWrapper}>
          <ActivityIndicator
            animating={loading} />
        </View>
      </View>
    </Modal>

  )
}

export default Loader;