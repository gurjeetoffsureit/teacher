import React, { PureComponent } from 'react';
import {
  View,
  Modal,
  SafeAreaView, Text, TouchableOpacity, Image, FlatList,
  Dimensions, Platform, Linking, ScrollView
} from 'react-native';
import StyleLoader from '../styles/StyleLoader'
import TeacherAssitantManager from "../Singletons/TeacherAssitantManager";
import Loader from "./Loader";
import API from '../constants/ApiConstant';
const { width, height } = Dimensions.get("screen")
import RNIap, {
  initConnection,
  purchaseErrorListener, purchaseUpdatedListener,
  ProductPurchase, PurchaseError, finishTransaction,
  finishTransactionIOS, clearTransactionIOS, endConnection,
  flushFailedPurchasesCachedAsPendingAndroid, getSubscriptions,
  getProducts, requestSubscription
} from 'react-native-iap';

const data = [{
  name: "3 Months",
  price: "$ 3.99",
  tierValue: "com.lessonportal.tap3pro.tierOne",
},
{
  name: "6 Months",
  price: "$ 6.99",
  tierValue: "com.lessonportal.tap3pro.tierTwo"
},

{
  name: "1 Year",
  price: "$ 9.99",
  tierValue: "com.lessonportal.tap3pro.tierThree"
}]

const itemSkus = Platform.select({
  ios: [
    "com.lessonportal.tap3pro.tierOne",
    "com.lessonportal.tap3pro.tierTwo",
    "com.lessonportal.tap3pro.tierThree"
  ],
  android: [
    "com.lessonportal.tap3pro.tierone",
    "com.lessonportal.tap3pro.tiertwo",
    "com.lessonportal.tap3pro.tierthree"
  ]
});
const RESTORE = "Restore Subscription"
const CANCEL = "Cancel Subscription"

const VALUE_4 = width / 93.75
const VALUE_7 = width / 53.5714285714
const VALUE_8 = width / 46.875
const VALUE_10 = width / 37.5
const VALUE_13 = width / 28.8461538462
const VALUE_14 = width / 26.7857142857
const VALUE_15 = width / 25
const VALUE_16 = width / 23.4375
const VALUE_17 = width / 22.0588235294
const VALUE_18 = width / 20.8333333333
const VALUE_20 = width / 18.75
const VALUE_22 = width / 17.0454545455
const VALUE_37 = width / 10.1351351351
const VALUE_43 = width / 8.7209302326
const VALUE_44 = width / 8.5227272727
const VALUE_50 = width / 7.5
const VALUE_51 = width / 7.3529411765
const VALUE_84 = width / 4.4642857143
const VALUE_120 = width / 3.125
const VALUE_133 = width / 2.8195488722
const VALUE_216 = width / 1.7361111111
const VALUE_314 = width / 1.1942675159

export default class Subscription extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      subscription: undefined,
      isShowingMoreOptionView: false,
      tierValue: ""
    }

    this.isMount = true
  }

  async componentDidMount() {

    const result = await initConnection();
    if (Platform.OS == "android")
      await flushFailedPurchasesCachedAsPendingAndroid();
    else
      await clearTransactionIOS()

    this.initializeIAPListner()
    await this.getSubscriptionInforFromLocalStorage();

  }

  componentWillUnmount() {
    this.isMount = false
    if (Platform.OS == 'ios') {
      this.purchaseUpdateSubscription.remove()
      this.purchaseErrorSubscription.remove()
    }
    endConnection();
  }

  render() {
    const {
      isShowing,
      onPressBackBtn
    } = this.props;
    const { subscription, isShowingMoreOptionView } = this.state
    return (
      <Modal
        transparent={true}
        animationType={'slide'}
        visible={isShowing}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={{
          flex: 1,
          backgroundColor: '#295993'
        }}>
          <Loader loading={this.state.loading} />
          {/* <SafeAreaView style={{ flex: 1, backgroundColor: "#295993" }}> */}
          <View style={{
            height: VALUE_44, marginLeft: 0, marginRight: 0,
            flexDirection: "row",
            marginTop: VALUE_44,
          }}>
            <View style={{ marginRight: VALUE_16, width: VALUE_44, height: VALUE_44 }} />
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: VALUE_20, color: "white" }}>Teacher's Assistant Pro 3</Text>
            </View>
            <TouchableOpacity style={{ marginLeft: VALUE_16, width: VALUE_44, height: VALUE_44, justifyContent: "center" }}
              onPress={() => {
                // if (this.state.isShowingMoreOptionView) {
                //   this.setState({ isShowingMoreOptionView: false });
                //   return;
                // }
                onPressBackBtn && onPressBackBtn()
              }}
            >
              <Image style={{ width: VALUE_22, height: VALUE_22, }} source={require("../img/close.png")} />

            </TouchableOpacity>

          </View>

          {isShowingMoreOptionView ? <FlatList
            ListHeaderComponent={() => {
              return (
                this.renderLogoImage(VALUE_216, VALUE_216))
            }}
            ListFooterComponent={() => {
              return (this.renderFooter(subscription))
            }}
            data={data}
            contentContainerStyle={{ paddingTop: 0 }}
            numColumns={1}
            // keyExtractor={item => item.name}
            keyExtractor={(item, index) => `${index}`}
            renderItem={({ item }) => {
              return this.renderPlanButton(item)
            }}
          /> :
            <ScrollView>
              {this.renderLogoImage(VALUE_216, VALUE_216)}
              {this.renderInfoPoints("Import and Export Data")}
              {this.renderInfoPoints("Add Unlimited Students and Actions", { marginTop: VALUE_16 })}
              {this.renderInfoPoints("Receive World-Class Support", { marginTop: VALUE_16 })}
              {this.renderInfoPoints("And much more!", { marginTop: VALUE_16, marginBottom: VALUE_37 })}
              {this.renderPlanButton(data[2])}
              <Text
                style={{
                  fontSize: VALUE_18,
                  color: "#fff",
                  alignSelf: "center"
                }}
                onPress={() => {
                  if (this.isMount)
                    this.setState({ isShowingMoreOptionView: !isShowingMoreOptionView })
                }}
              >{"See more options"}</Text>
              {this.renderFooter(subscription, { marginTop: VALUE_17 })}
              {/* {this.renderButtons(RESTORE, { marginTop: VALUE_8, marginBottom: VALUE_4, })}
              {this.renderButtons(CANCEL, { marginTop: Platform.OS == "ios" && subscription && subscription.is_active ? VALUE_4 : VALUE_8 })}
              {this.renderPrivacyPolicyText({ marginTop: VALUE_4 })} */}
            </ScrollView>

          }

        </View>
      </Modal>
    )
  }

  renderFooter(subscription, privacyPoicyStyles = {}) {
    // return <>
    //   {this.renderButtons(RESTORE, { marginTop: VALUE_8, marginBottom: VALUE_4, })}
    //   {this.renderButtons(CANCEL, { marginTop: Platform.OS == "ios" && subscription && subscription.is_active ? VALUE_4 : VALUE_8 })}
    //   {this.renderPrivacyPolicyText(privacyPoicyStyles)}
    // </>;
    return <>
      {Platform.OS == "ios" && subscription && subscription.is_active && this.renderButtons(RESTORE, { marginTop: VALUE_8, marginBottom: VALUE_4, })}
      {subscription && subscription.is_active && this.renderButtons(CANCEL, { marginTop: Platform.OS == "ios" && subscription && subscription.is_active ? VALUE_4 : VALUE_8 })}
      {this.renderPrivacyPolicyText(privacyPoicyStyles)}
    </>;
  }

  renderPrivacyPolicyText(styles = {}) {
    return <Text style={[{
      fontSize: VALUE_16,
      color: "#fff",
      alignSelf: "center",
      marginBottom: VALUE_16,
      // marginTop: VALUE_17,
      marginLeft: VALUE_84,
      marginRight: VALUE_84,
      textAlign: "center",
      // ...styles,
    }, styles]} onPress={() => { Linking.openURL('https://www.termsfeed.com/live/6b3b538c-bf94-41f8-9072-08545678fd55') }}>{"See terms and conditions "} <Text onPress={() => { Linking.openURL('https://www.termsfeed.com/live/0d814545-aa22-4335-ba25-8ca30480c695') }}>Privacy Policy</Text></Text>;
  }

  renderInfoPoints(txt, styles) {
    return <View style={{ flexDirection: "row", marginLeft: VALUE_20, ...styles }}>
      <Image style={{ width: VALUE_20, height: VALUE_20, }} source={require("../img/ic_mark.png")} />
      <Text style={{ fontSize: VALUE_16, color: "white", marginLeft: VALUE_7 }}>{txt}</Text>
    </View>;
  }

  renderLogoImage(width = VALUE_120, height = VALUE_120,) {
    return <Image style={{
      width, height,
      alignSelf: "center", marginTop: VALUE_8, marginBottom: VALUE_10
    }} source={require("../img/icon_pro.png")} />;
  }

  renderPlanButton(item) {
    return (
      <TouchableOpacity style={{
        marginLeft: VALUE_16,
        marginBottom: VALUE_16,
        marginRight: VALUE_16,
        height: VALUE_133,
        // justifyContent: "center",
        backgroundColor: "#204D87",
        borderRadius: VALUE_15,
        alignItems: "center",
        borderWidth: 1,
        borderColor: 'white'
      }}
        onPress={() => {
          if (this.isMount)
            this.setState({
              loading: true
            }, () => {
              setTimeout(() => {
                this.onPressPayment(item.tierValue);
              }, 700);

            });

        }}
      >

        {item.name == "1 Year" && <Image style={{
          width: VALUE_43, height: VALUE_51,
          position: 'absolute', end: VALUE_20, top: -VALUE_7
        }} source={require("../img/ic_ribon.png")} />}
        <Text style={{ marginTop: VALUE_10, fontSize: VALUE_18, color: "#fff", }}>{item.name}</Text>

        <Text style={{ marginTop: VALUE_8, fontSize: VALUE_14, color: "#fff", }}>{item.price}</Text>

        <View style={{
          marginTop: VALUE_13,
          marginLeft: VALUE_10,
          marginBottom: VALUE_10,
          marginRight: VALUE_10,
          borderRadius: VALUE_8,
          backgroundColor: "#95B553",
          height: VALUE_50,
          width: VALUE_314,
          alignItems: "center", justifyContent: "center"
        }}>
          <Text style={{
            color: "#fff",
            paddingTop: VALUE_8,
            paddingRight: VALUE_14,
            paddingBottom: VALUE_8,
            paddingLeft: VALUE_14,
            fontSize: VALUE_16
          }}>"Try it FREE for 7 days"</Text>
        </View>
      </TouchableOpacity>
    );
  }

  async getSubscriptionInforFromLocalStorage() {
    await TeacherAssitantManager.getInstance().getUserSubscriptionData();
    let subscription = await TeacherAssitantManager.getInstance().getUserSubscriptionsDataToLocalDb();
    if (subscription) {
      if (this.isMount)
        this.setState({
          subscription
        });
    }
  }

  //initializeIAPListner
  initializeIAPListner() {

    this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      // console.log('purchaseUpdatedListener', purchase);
      // //Sentry.captureMessage(`6 exploreKandiid initializeIAPListner purchaseUpdatedListener ${purchase}`, //Sentry.Severity.Log)
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        // //Sentry.captureMessage(`7 exploreKandiid initializeIAPListner receipt ${JSON.stringify(receipt)}`, //Sentry.Severity.Log)

        try {
          // if (Platform.OS == "ios")
          if (Platform.OS === 'ios') {

            await finishTransaction(purchase, true);
            await finishTransactionIOS(purchase.transactionId);
            // await clearTransactionIOS()
          } else {
            await finishTransaction(purchase);
          }

          //Sentry.captureMessage(`8 exploreKandiid initializeIAPListner finishTransaction`, //Sentry.Severity.Log)
          //Sentry.captureMessage(`9 exploreKandiid initializeIAPListner is going to hit the api`, //Sentry.Severity.Log)
          this.postPurchaseDeatils(purchase);

        } catch (err) {
          //Sentry.captureMessage(`8 err exploreKandiid initializeIAPListner finishTransaction ${err} `, //Sentry.Severity.Log)
          // console.log("purchaseUpdateSubscription err", err)
          if (this.isMount)
            this.setState({
              loading: false
            }, () => {
              TeacherAssitantManager.getInstance().showAlert(err)
              // KDManager.showToastMessage(err.message, KDToastType.WARNING)
            })
        }           // again until you do this.
      }
    });

    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
      //Sentry.captureMessage(`exploreKandiid purchaseErrorListener ${error}`, //Sentry.Severity.Log)
      if (this.isMount)
        this.setState({
          loading: false
        }, () => { TeacherAssitantManager.getInstance().showAlert(error.message); })
      // console.warn('purchaseErrorListener', error);
    });

  }

  postPurchaseDeatils(purchase) {
    let body = {
      "platform": Platform.OS,
      "reciept_in": {
        ...purchase
      },
      "plan": purchase.productId.toLowerCase()
    };

    let stringfyBody = JSON.stringify(body);


    // let url = `${API.BASE_URL}${API.API_BUY_SUBSCRIPTION}`
    // console.log(url);
    TeacherAssitantManager.getInstance()._serviceMethod(`${API.BASE_URL}${API.API_BUY_SUBSCRIPTION}`, {
      method: 'POST',
      headers: {},
      body: stringfyBody
    }).then((responseJson) => {
      // console.log("response==" + JSON.stringify(responseJson));
      if (this.isMount)
        this.setState({
          loading: false
        }, async () => {
          if (Platform.OS == "android") {
            TeacherAssitantManager.getInstance().showAlert(responseJson.message);
            // return
          }


          if (responseJson.success) {
            // await TeacherAssitantManager.getInstance().getUserSubscriptionData()
            await this.getSubscriptionInforFromLocalStorage();
          }
          // else {
          //   TeacherAssitantManager.getInstance().showAlert(responseJson.message);
          // }
        });
    })
      .catch(error => {
        this.setLoading(error);
      });
  }

  getRestorePurchase() {

    TeacherAssitantManager.getInstance()._serviceMethod(`${API.BASE_URL}${API.API_BUY_SUBSCRIPTION_RETORE}`, {
      method: 'GET',
      headers: {},
    }).then((responseJson) => {
      // console.log("response==" + JSON.stringify(responseJson));
      if (this.isMount)
        this.setState({
          loading: false
        }, async () => {
          // if (Platform.OS == "android")
          TeacherAssitantManager.getInstance().showAlert(responseJson.message);
          if (responseJson.success) {
            await TeacherAssitantManager.getInstance()._saveUserSubscriptionsDataToLocalDb(responseJson.data)
          }
          //  else {
          //   //TeacherAssitantManager.getInstance().showAlert(responseJson.message);
          // }
        });
    })
      .catch(error => {
        this.setLoading(error);
      });
  }



  onPressPayment = async (tierValue) => {
    try {
      if (Platform.OS === "android") {
        const products = await getSubscriptions(itemSkus);
        // console.log("subscription>>>", products)
        tierValue = tierValue.toLowerCase()
      } else {
        const products = await getProducts(itemSkus);
      }

      let subscription = await requestSubscription(tierValue)
    } catch (error) {
      // console.log(error)
      // this.setLoading(error);
    }
  }

  renderButtons(textValue, styles = {}) {
    return <TouchableOpacity style={{
      height: VALUE_50,
      marginLeft: VALUE_16,
      marginBottom: VALUE_8,
      marginRight: VALUE_16,
      backgroundColor: "#fff",
      borderRadius: VALUE_7,
      alignItems: "center",
      justifyContent: 'center',
      backgroundColor: '#95B553',
      ...styles
    }}
      onPress={() => { this.onPressBtn(textValue) }}>
      <Text style={{
        color: "white", fontSize: VALUE_20,
      }}>{textValue}</Text>

    </TouchableOpacity>;
  }

  onPressBtn(textValue) {
    switch (textValue) {
      case RESTORE:
        this.getRestorePurchase()
        break;

      default:
        if (Platform.OS === "ios") {
          Linking.openURL('https://apps.apple.com/account/subscriptions')
          return
        }
        Linking.openURL('https://play.google.com/store/account/subscriptions?package=com.lessonportal.tap3pro')
        break;
    }
  }

  setLoading(error) {
    // console.log(">>>>>>error>>>>", error);
    if (this.isMount)
      this.setState({
        loading: false
      });
  }
}