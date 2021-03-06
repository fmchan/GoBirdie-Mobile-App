import React from 'react';
import * as Font from "expo-font";

import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

import { Image, View, Text, ActivityIndicator } from 'react-native';
//import * as Linking from 'expo-linking';
import { Root } from "native-base";
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import MapPage from "./app/containers/MapPageContainer";
import HomePage from "./app/containers/HomePageContainer";
import SettingPage from "./app/containers/SettingPageContainer";
import TextPage from "./app/containers/TextPageContainer";
import PlaceListPage from "./app/containers/PlaceListContainer";
import ArticleListPage from "./app/containers/ArticleListContainer";
import DetailPage from "./app/containers/DetailPageContainer";
import ArticleSearch from "./app/containers/ArticleSearchContainer";
import ArticleResult from "./app/containers/ArticleResultContainer";
import PlaceSearch from "./app/containers/PlaceSearchContainer";
import PlaceResult from "./app/containers/PlaceResultContainer";
import Bookmark from "./app/containers/BookmarkContainer";
import HighlightPage from "./app/containers/HighlightContainer";
import PlaceAdvanceSearch from "./app/containers/PlaceAdvanceSearchContainer";

const Placeholder = ({ text }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{text}</Text>
  </View>
);

class A extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Home!',
  };

  render() {
    return <Placeholder text="A!" />;
  }
}

class B extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Settings!',
  };

  render() {
    return <Placeholder text="B!" />;
  }
}

let PlacePage = createStackNavigator({ 
  PlaceListPage: { screen: PlaceListPage, navigationOptions: {header: null} },
  PlaceSearch: { screen: PlaceSearch, navigationOptions: {header: null} },
  PlaceAdvanceSearch: { screen: PlaceAdvanceSearch },
  PlaceResult: { screen: PlaceResult },
  PlaceDetail: { screen: DetailPage, path: 'detail', navigationOptions: {header: null} },
  MapPage: { screen: MapPage }
});
let ArticlePage = createStackNavigator({
  ArticleListPage: { screen: ArticleListPage, navigationOptions: {header: null} },
  ArticleSearch: { screen: ArticleSearch, navigationOptions: {header: null} },
  ArticleResult: { screen: ArticleResult },
  ArticleDetail: { screen: DetailPage, path: 'detail', navigationOptions: {header: null} },
  MapPage: { screen: MapPage }
});
let Home = createStackNavigator({
  HomePage: { screen: HomePage, navigationOptions: {header: null} },
  ArticleSearch: { screen: ArticleSearch, navigationOptions: {header: null} },
  ArticleResult: { screen: ArticleResult },
  HighlightPage: { screen: HighlightPage },
  Detail: { screen: DetailPage, path: 'detail', navigationOptions: {header: null} },
});
let Menu = createStackNavigator({ 
  SettingPage: { screen: SettingPage, navigationOptions: {header: null} },
  TextPage: { screen: TextPage },
});

const path = `./assets/icons/`;

const RootPage = createAppContainer(createBottomTabNavigator({
  Place: {
    screen: PlacePage,
    navigationOptions: {
      title: '?????????',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconActive = `icon1_c-01.png`;
        const iconInactive = `icon1-01.png`;
        return <Image style={{ width:40, height:40 }} source={focused? require(path + iconActive): require(path + iconInactive)} />;
      },
    },
  },
  Article: {
    screen: ArticlePage,
    navigationOptions: {
      title: '??????',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconActive = `icon2_c-01.png`;
        const iconInactive = `icon2-01.png`;
        return <Image style={{ width:40, height:40 }} source={focused? require(path + iconActive): require(path + iconInactive)} />;
      },
    },
  },
  Home: {
    screen: Home,
    navigationOptions: {
      title: '??????',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconActive = `icon5_c-01.png`;
        const iconInactive = `icon5-01.png`;
        return <Image style={{ width:40, height:40 }} source={focused? require(path + iconActive): require(path + iconInactive)} />;
     },
    },
  },
  Bookmark: {
    screen: Bookmark,
    navigationOptions: {
      title: '??????',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconActive = `icon3_c-01.png`;
        const iconInactive = `icon3-01.png`;
        return <Image style={{ width:40, height:40 }} source={focused? require(path + iconActive): require(path + iconInactive)} />;
      },
    },
  },
  Menu: {
    screen: Menu,
    navigationOptions: {
      title: '??????',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconActive = `icon4_c-01.png`;
        const iconInactive = `icon4-01.png`;
        return <Image style={{ width:40, height:40 }} source={focused? require(path + iconActive): require(path + iconInactive)} />;
      },
    },
  },
},
{
  initialRouteName: "Home",
  tabBarOptions:{
    activeTintColor: 'black',
    inactiveTintColor: 'gray',
    labelStyle: {
      fontSize: 18,
      //fontSize: ScreenUtil.scale(14),
    },
    style: {
      height: 70,
      //borderTopWidth: 1,
      //borderTopColor: 'red'
    },
  }
}));

//let redirectUrl = Linking.makeUrl('path/into/app', { hello: 'world', goodbye: 'now' });

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      expoPushToken : '',
      notification: {},
      loading: true 
    };
  }

  subscribe(token) {
    fetch("https://gobirdie.hk/app/admin3s/api/subscribe",
    {
      method: 'POST', 
      headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({token:token}),
    }
      )
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) return;
          console.log(result);
        },
        (error) => {
          console.error(error);
        }
      )
  }

  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      let token = await Notifications.getExpoPushTokenAsync();
      this.setState({expoPushToken: token}, () => {
        console.log(token);
        this.subscribe(token);
      });
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  };

  /*urlRedirect(url) {
      if(!url) return;
      // parse and redirect to new url
      let { path, queryParams } = Linking.parse(url);
      console.log(`Linked to app with path: ${path} and data: ${JSON.stringify(queryParams)}`);
      this.props.navigation.replace(path, queryParams);
  }*/
  componentDidMount() {
    this.registerForPushNotificationsAsync();

    Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
    });
    this.setState({ loading: false });

    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    /*this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );*/
    //Linking.getInitialURL().then(this.urlRedirect);
  }

  render() {
    if (this.state.loading) {
      return <ActivityIndicator />;
    }
    return (
      <Root>
        <RootPage />
      </Root>
    );
  }
}