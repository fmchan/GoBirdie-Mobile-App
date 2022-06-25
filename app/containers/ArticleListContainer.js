import * as React from "react";
import { ActivityIndicator, TouchableOpacity, StatusBar, Platform, Text, View, StyleSheet } from 'react-native';
import { Item, Input, Icon } from "native-base";
import { SafeAreaView } from 'react-navigation';

import moment from "moment";

import CategoryMenu from "../components/CategoryMenu";
import DateMenu from "../components/DateMenu";
import ArticleList from "../components/ArticleList";

export default class ArticleListContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      articles: [],
      currentPage: 0,
      currentFilter: 0,
      categories: [],
      chosenDate: null,
    };
    this.setDate = this.setDate.bind(this);
    this._list = React.createRef();
    console.log('Height on: ', Platform.OS, StatusBar.currentHeight);
  }

  componentDidMount() {
   this.fetchArticles();
   this.fetchCategories();
   console.log('componentDidMount');

   this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        console.log('willFocusSubscription');
        if (this._list != null && this._list.current != null) {
          this._list.current._retrieveBookmarkArticleIds();
          this._list.current._retrieveLikeArticleIds();
        }
      }
   );
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }
  fetchArticles() {
    var { currentFilter, currentPage, search, chosenDate } = this.state;

    var display = null;
    if(currentFilter == 1)
      display = moment(new Date()).add(1, 'day');
    else if(currentFilter == 2)
      display = moment(new Date()).add(2, 'day');
    else if(currentFilter == 3)
      display = moment().endOf('isoWeek').subtract(1, 'day');
    else if(currentFilter == 4) {
      //console.log("chosenDate:"+chosenDate);
      display = moment(chosenDate);
    }

    //console.log("id:" + currentFilter + ",display:" + display.format('YYYY-MM-DD'));

    var params = (currentPage != 0? ("&categories=" + currentPage) : "")
               + (display != null? ("&display=" + display.format('YYYY-MM-DD')) : "")
    console.log('?'+params.substr(1));
    fetch("https://gobirdie.hk/app/admin3s/api/articles?" + params.substr(1))
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
    fetch("https://gobirdie.hk/app/admin3s/api/category_articles")
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

  setDate(chosenDate) {
    console.log("chosenDate:"+chosenDate);
    this.setState({
      chosenDate,
      currentFilter: 4,
    }, () => {
     this.fetchArticles();
    });
  }

  onMenuPress = (id) => {
    //this.setState({refreshing: true});
    this.setState({
    	currentPage: id,
      refreshing: false,
     }, () => {
     this.fetchArticles();
    });
   }
   onFilterPress = (id) => {
    if(id != 4) {
      this.dateMenu.resetDate();
    }
   	this.setState({
   		currentFilter: id,
   		refreshing: false,
      chosenDate: null,
   	}, () => {
     this.fetchArticles();
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
            onPress={() => this.props.navigation.navigate("ArticleSearch")}>
              <Icon name="ios-search" />
              <TouchableOpacity onPress={() => this.props.navigation.navigate("ArticleSearch")}>
              <Input placeholder="輸入關鍵字" editable={false} />
              </TouchableOpacity>
            </Item>
          </View>
          <CategoryMenu categories={categories} currentPage={this.state.currentPage} onMenuPress={this.onMenuPress}/>
          <DateMenu currentFilter={this.state.currentFilter} onFilterPress={this.onFilterPress} setDate={this.setDate} onRef={ref => (this.dateMenu = ref)} />

          { articles.length > 0 &&
          <ArticleList data={articles} navigation={this.props.navigation} ref={this._list} />
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