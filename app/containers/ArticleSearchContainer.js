import React from 'react';
import { AsyncStorage, StyleSheet, Image, View, ScrollView } from 'react-native';
import { Container, Header, Left, Right, Item, Input, Icon, Body, Card, CardItem, Separator, Text, Button } from "native-base";

import RecommendList from "../components/RecommendList";

export default class ArticleSearchContainer extends React.Component {
  constructor(props) {
    super(props);

  	this.state = {
      isLoaded: false,
      hotKeywords:[],
      places:[],
      search: '',
      recentSearches:[],
    }
  }
  componentDidMount() {
    this.fetchHotKeywords();
    this.fetchRecommendPlaces();
    this._retrieveRecentSearches();
  }
  fetchHotKeywords() {
    fetch("http://34.80.70.229:7000/api/hot_keyword_articles")
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) return;
          //console.log(result.data);
          this.setState({
            isLoaded: true,
            hotKeywords: result.data,
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
  fetchRecommendPlaces() {
    fetch("http://34.80.70.229:7000/api/recommend_places?type=A")
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) return;
          //console.log(result.data);
          this.setState({
            isLoaded: true,
            places: result.data,
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

  async _addRecentSearches(text) {
    searches = this.state.recentSearches;
    searches.unshift(text);
    searches = searches.filter((x, i, a) => a.indexOf(x) == i);
    searches = searches.slice(0,8);
    this.setState({
      recentSearches:searches,
    }, () => {
      console.log(searches);
      });
    try {
        await AsyncStorage.setItem('@birdie:searches.articles', JSON.stringify(searches));
    } catch (error) {
      console.error(error);
    }
  };

  _retrieveRecentSearches = async () => {
    try {
      const value = await AsyncStorage.getItem('@birdie:searches.articles');
      if (value !== null) {
        this.setState({
          recentSearches:JSON.parse(value),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  searchSubmit = text => {
    //text.persist();
    console.log(text.nativeEvent.text);
    this._addRecentSearches(text.nativeEvent.text);
    this.props.navigation.navigate("ArticleResult", {text: text.nativeEvent.text});
  }
  searchHotKeyword = text => {
    this.props.navigation.navigate("ArticleResult", {text: text});
  }
  render() {
    const { search, hotKeywords, places, recentSearches } = this.state;
    return (
      <Container>
        <Header noShadow transparent>
          <Left>
            <Button transparent onPress={() => this.props.navigation.pop()}>
              <Icon style={{color:"black"}} type="Ionicons" name="ios-arrow-back" />
            </Button>
          </Left>
          <Body />
          <Right />
        </Header>
        <View style={{marginHorizontal:15, marginBottom:15}}>
          <Item searchBar rounded style={{backgroundColor:"#ededed"}}>
            <Icon name="ios-search" />
            <Input placeholder="輸入關鍵字" returnKeyType='search' onSubmitEditing={this.searchSubmit} />
          </Item>
        </View>
        <ScrollView>
        <Card>
          <Separator bordered />
          <CardItem header>
            <Text style={styles.header}>熱門搜尋</Text>
          </CardItem>
          <CardItem>
            <Body style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
            {
              hotKeywords.map((item, key) => {
                return (
                <Text style={styles.filterItem} button key={key} onPress={() => this.searchHotKeyword(item.keyword)}>{item.keyword}</Text>
                )
              })
            }
            </Body>
          </CardItem>
          <Separator bordered />
          <CardItem header>
            <Text style={styles.header}>你可能想去</Text>
          </CardItem>
          <CardItem>
            <RecommendList places={places} navigation={this.props.navigation} />
          </CardItem>
          <Separator bordered />
          <CardItem header>
            <Text style={styles.header}>最近搜尋</Text>
          </CardItem>
          <CardItem>
            <Body style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
            {
              recentSearches.map((item, key) => {
                return (
                <Text style={styles.filterItem} button key={key} onPress={() => this.searchHotKeyword(item)}>{item}</Text>
                )
              })
            }
            </Body>
          </CardItem>
       </Card>
       </ScrollView>
      </Container>
    );
  }
}
const styles: any = StyleSheet.create({
  header: {
    color: '#7d5114',
    fontWeight: 'bold'
  },
  filterItem: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    margin:5,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: "#d4d4d4",
    fontSize: 18,
    borderRadius:15,
    color: "#8a8a8a",
  },
});