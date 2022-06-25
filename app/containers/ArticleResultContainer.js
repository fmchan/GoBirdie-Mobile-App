import React from 'react';
import { ActivityIndicator, StyleSheet, Image, View, Text } from 'react-native';
import { Container } from "native-base";

import moment from "moment";

import CategoryMenu from "../components/CategoryMenu";
import DateMenu from "../components/DateMenu";
import ArticleList from "../components/ArticleList";

export default class ArticleResultContainer extends React.Component {
  constructor(props) {
    super(props);

    const param = this.props.navigation.state.params;
    console.log(param.text);

    this.state = {
      error: null,
      isLoaded: false,
      articles: [],
      currentPage: 0,
      currentFilter: 0,
      text: param.text,
      categories: [],
      chosenDate: null,
    };
    this.setDate = this.setDate.bind(this);
  }

  componentDidMount() {
   this.fetchArticles();
   this.fetchCategories();
  }

  fetchArticles() {
    var { currentFilter, currentPage, text, chosenDate } = this.state;

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
               + (text != ''? ("&search=" + text) : "");
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

  static navigationOptions = ({ navigation }) => {
    return {
      title: '搜尋結果 ('+ navigation.getParam('text', 'N/A') +')',
    };
  };

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
    <Container>
      <CategoryMenu categories={categories} currentPage={this.state.currentPage} onMenuPress={this.onMenuPress}/>
      <DateMenu currentFilter={this.state.currentFilter} onFilterPress={this.onFilterPress} setDate={this.setDate} onRef={ref => (this.dateMenu = ref)} />

      { articles.length > 0 &&
      <ArticleList data={articles} navigation={this.props.navigation} />
      }
    </Container>
    );
    }
  }
}
const styles = StyleSheet.create({
});