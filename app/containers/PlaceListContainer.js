import * as React from "react";
import { ActivityIndicator, TouchableOpacity, StatusBar, Platform, Text, View, StyleSheet } from 'react-native';
import { Item, Input, Icon } from "native-base";
import { SafeAreaView } from 'react-navigation';

import CategoryMenu from "../components/CategoryMenu";
import PlaceList from "../components/PlaceList";

export default class PlaceListContainer extends React.Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    this.state = {
      error: null,
      isLoaded: false,
      articles: [],
      currentPage: navigation.getParam('currentPage') || 0,
      categories: [],
    };
    console.log('Height on: ', Platform.OS, StatusBar.currentHeight);
    this._list = React.createRef();
  }

  componentDidMount() {
   this.fetchPlaces();
   this.fetchCategories();
   this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        const { navigation } = this.props;
        this.setState({
          isLoaded: false,
          currentPage: navigation.getParam('currentPage') || 0,
        }, () => {
         this.fetchPlaces();
        });
        console.log('willFocusSubscription');
        if (this._list != null && this._list.current != null)
          this._list.current._retrieveBookmarkPlaceIds();
      }
    );
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  fetchPlaces() {
    var {currentPage, search } = this.state;

    var params = (currentPage != 0? ("&categories=" + currentPage) : "")
    console.log('?'+params.substr(1));
    fetch("https://gobirdie.hk/app/admin3s/api/places?" + params.substr(1))
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) return;
          //console.log(result.data);
          this.setState({
            isLoaded: true,
            articles: result.data,
          });
        },
        (error) => {
          console.error(error);
          this.setState({
            isLoaded: true,
          });
        }
      )
  }
  fetchCategories() {
    fetch("https://gobirdie.hk/app/admin3s/api/category_places")
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) return;
          //console.log(result.data);
          var menu = Array.from(result.data);
          menu.unshift({"id":0, "name":"全部"});
          this.setState({
            //isLoaded: true,
            categories: menu,
          });
        },
        (error) => {
          console.error(error);
          /*this.setState({
            isLoaded: true,
          });*/
        }
      )
  }

  onMenuPress = (id) => {
    //this.setState({refreshing: true});
    this.setState({
    	currentPage: id,
      refreshing: false,
     }, () => {
     this.fetchPlaces();
    });
   }

  render() {
    if (!this.state.isLoaded) {
      return <ActivityIndicator />;
    } else {
    const { articles, categories } = this.state;
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.container}>
          <View style={{margin:15}}>
            <Item searchBar rounded style={{backgroundColor:"#ededed", padding:15}}
            onPress={() => this.props.navigation.navigate("PlaceSearch")}>
              <Icon name="ios-search" />
              <TouchableOpacity onPress={() => this.props.navigation.navigate("PlaceSearch")}>
              <Input placeholder="輸入關鍵字" editable={false} />
              </TouchableOpacity>
            </Item>
          </View>
          <CategoryMenu categories={categories} currentPage={this.state.currentPage} onMenuPress={this.onMenuPress}/>
          { articles.length > 0 &&
          <PlaceList data={articles} navigation={this.props.navigation} ref={this._list} />
          }
          </View>
        </SafeAreaView>
    );
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
});