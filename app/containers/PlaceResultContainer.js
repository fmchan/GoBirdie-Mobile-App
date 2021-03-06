import React from 'react';
import { ActivityIndicator, StyleSheet, Image, View, Text } from 'react-native';
import { Container } from "native-base";

import CategoryMenu from "../components/CategoryMenu";
import PlaceList from "../components/PlaceList";

export default class PlaceResultContainer extends React.Component {
  constructor(props) {
    super(props);

    const param = this.props.navigation.state.params;
    console.log(param.text);

    this.state = {
      error: null,
      isLoaded: false,
      places: [],
      currentPage: 0,
      text: param.text != null? param.text: null,
      categories: [],
      advanceSearch: param.advanceSearch != null? param.advanceSearch: [],
    };
  }

  componentDidMount() {
   this.fetchPlaces();
   this.fetchCategories();
  }

  fetchPlaces() {
    var { currentFilter, currentPage, text, chosenDate, advanceSearch } = this.state;

    var params = (currentPage != 0? ("&categories=" + currentPage) : "")
               + (text != '' && text != null? ("&search=" + text) : "");
    if(advanceSearch.length > 0)
      advanceSearch.forEach(function (a, index) {
        if(a.value != null)
          params += "&" + a.field + "=" + a.value;
      });
    //params = params != null? params.substr(1): '';
    console.log('?'+params);
    fetch("https://gobirdie.hk/app/admin3s/api/places?" + params)
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
  fetchCategories() {
    fetch("https://gobirdie.hk/app/admin3s/api/category_places")
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) return;
          //console.log(result.data);
          var menu = Array.from(result.data);
          menu.unshift({"id":0, "name":"??????"});
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
      title: '???????????? ('+ navigation.getParam('text', '??????') + ')',
    };
  };

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
    const { places, categories } = this.state;
    return (
    <Container>
      <CategoryMenu categories={categories} currentPage={this.state.currentPage} onMenuPress={this.onMenuPress}/>
      { places.length > 0 &&
      <PlaceList data={places} navigation={this.props.navigation} />
      }
    </Container>
    );
    }
  }
}
const styles = StyleSheet.create({
});