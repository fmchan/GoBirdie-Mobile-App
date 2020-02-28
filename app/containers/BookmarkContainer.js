import * as React from "react";
import { AsyncStorage, ActivityIndicator, TouchableOpacity, StatusBar, Platform, Text, View, StyleSheet } from 'react-native';
import { H2 } from "native-base";
import { SafeAreaView } from 'react-navigation';

import CategoryMenu from "../components/CategoryMenu";
import PlaceList from "../components/PlaceList";
import ArticleList from "../components/ArticleList";

export default class BookmarkContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      data: [],
      currentPage: 1,
      categories: [{"id":1, "name":"好去處"},{"id":2, "name":"情報"}],
    };

    console.log('Height on: ', Platform.OS, StatusBar.currentHeight);
  }

  fetchData = async (cat) => {
    try {
      const value = await AsyncStorage.getItem('@birdie:bookmarks.' + cat);
      if (value !== null) {
        this.setState({
          isLoaded: true,
          data: JSON.parse(value),
        });
      } else
        this.setState({
          isLoaded: true,
        });
    } catch (error) {
      console.error(error);
    }
  }

  componentDidMount() {
   this.fetchData('places');
   this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({
          isLoaded: false,
        }, () => {
         if (this.state.currentPage == 1) this.fetchData('places');
         else if (this.state.currentPage == 2) this.fetchData('articles');
        });
      }
    );
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  onMenuPress = (id) => {
    //this.setState({refreshing: true});
    this.setState({
      data: [],
    	currentPage: id,
      refreshing: false,
     }, () => {
       if (id == 1) this.fetchData('places');
       else if (id == 2) this.fetchData('articles');
    });
   }

  render() {
    if (!this.state.isLoaded) {
      return <ActivityIndicator />;
    } else {
    const { data, categories, currentPage } = this.state;
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.container}>
          <H2 style={{ margin:15, textAlign: 'center' }}>書籤</H2>
          <CategoryMenu categories={categories} currentPage={currentPage} onMenuPress={this.onMenuPress}/>
          { currentPage == 1 && data.length > 0 &&
          <PlaceList data={data} navigation={this.props.navigation} />
          }
          { currentPage == 2 && data.length > 0 &&
          <ArticleList data={data} navigation={this.props.navigation} />
          }
          </View>
        </SafeAreaView>
    );
    }
  }

}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
});