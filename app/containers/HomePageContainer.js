import * as React from "react";
import { TouchableOpacity, ActivityIndicator, AsyncStorage, StatusBar, Platform, Content, Text, View, StyleSheet, Image, ScrollView } from 'react-native';
import { Input, Item, Separator, Icon, Button } from 'native-base';
import { SafeAreaView } from 'react-navigation';
import Slideshow from 'react-native-slideshow';
import { Col, Row, Grid } from 'react-native-easy-grid';

import ArticleList from "../components/ArticleList";
import PlaceList from "../components/PlaceList";

export default class HomePageContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      articles: [],
      places: [],
      slides: [],
      categories2D: [],
      paths: null,
    };
    //console.log('Height on: ', Platform.OS, StatusBar.currentHeight);
  }

  componentDidMount() {
    this.fetchHome();
  }

  async _storePaths(paths) {
    try {
      await AsyncStorage.setItem('@birdie:paths', JSON.stringify(paths));
    } catch (error) {
      console.error(error);
    }
  };
  async _storeFacilities(facilities) {
    try {
      await AsyncStorage.setItem('@birdie:facilities', JSON.stringify(facilities));
    } catch (error) {
      console.error(error);
    }
  };

  fetchHome() {
    fetch("http:\/\/34.80.70.229:7000\/api\/home",
    {
      headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) return;
          console.log(result.data);

          paths = result.data.paths;
          this._storePaths(paths);
          this._storeFacilities(result.data.facilities);

          slides = [];
          result.data.banners.forEach(function (el, index) {
           var image = paths.banners + el.photo;
           slides.push({
             id: el.id,
             title: el.title,
             url: image,
           });
          });

          var categories2D = [], size = 5;

          while (result.data.category_places.length > 0)
              categories2D.push(result.data.category_places.splice(0, size));

          this.setState({
            isLoaded: true,
            articles: result.data.highlight_articles,
            places: result.data.highlight_places,
            slides: slides,
            categories2D: categories2D,
            paths: paths,
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

  handleSlides = ({image, index}) => {
    console.log(index);
  };


  render() {
    if (!this.state.isLoaded) {
      return <ActivityIndicator />;
    } else {
    const { slides, categories2D, articles, places, paths } = this.state;
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.container}>
            <View style={{margin:15}}>
              <Item searchBar rounded style={{backgroundColor:"#ededed", padding:15}}
              onPress={() => this.props.navigation.navigate("PlaceSearch")}>
                <Icon name="ios-search" />
                <TouchableOpacity onPress={() => this.props.navigation.navigate("PlaceSearch")}>
                <Input placeholder="搜尋好去處" editable={false} />
                </TouchableOpacity>
              </Item>
            </View>
            <ScrollView>
            { slides &&
              <Slideshow dataSource={slides} onPress={this.handleSlides} />
            }
            { paths && categories2D &&
            <Grid>
              {
                categories2D.map((row, j) => (
                  <Row key={j} style={{ marginTop: 15 }}>
                  {
                    row.map((s, i) => (
                      <Col key={i} style={{ height: 90 }}
                      onPress={() =>
                        this.props.navigation.navigate("PlaceListPage", {
                          currentPage: s.id
                        })
                      }
                      >
                        <Image style={{ flex: 1 }} resizeMode="contain"
                        source={{ uri: paths.category_places + s.icon }} 
                        onError={e => {
                          console.error(e);
                        }}/>
                        <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
                        <Text style={{ fontSize: 18, textAlign: 'center' }}>{s.name}</Text>
                        </View>
                      </Col>
                    ))
                  }
                  </Row>
                ))
              }
            </Grid>
            }
            <Separator bordered />
            <Text style={styles.header}>精選活動</Text>
            { paths && articles &&
            <ArticleList data={articles} navigation={this.props.navigation} />
            }
            <View style={{ paddingHorizontal:15, paddingBottom:15 }}>
            <Button bordered rounded style={{ width: '100%', justifyContent:'center', alignItems:'center'}}
            onPress={() =>
              this.props.navigation.navigate("HighlightPage", {
                type: 'A', title: '精選活動'
            })}
            >
              <Text>顯示更多</Text>
            </Button>
            </View>
            <Separator bordered />
            <Text style={styles.header}>推介好去處</Text>
            { paths && places &&
            <PlaceList data={places} navigation={this.props.navigation} />
            }
            <View style={{ padding:15 }}>
            <Button bordered rounded style={{ width: '100%', justifyContent:'center', alignItems:'center'}}
            onPress={() =>
              this.props.navigation.navigate("HighlightPage", {
                type: 'P', title: '推介好去處'
            })}
            >
              <Text>顯示更多</Text>
            </Button>
            </View>
            </ScrollView>
          </View>
        </SafeAreaView>
    );
    }
  }

}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  header: {
    color: '#7d5114',
    fontWeight: 'bold',
    fontSize: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
});