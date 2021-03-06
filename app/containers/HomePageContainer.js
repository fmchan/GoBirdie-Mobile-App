import * as React from "react";
import { Notifications } from 'expo';
import { Vibration, TouchableOpacity, ActivityIndicator, AsyncStorage, StatusBar, Platform, Content, Text, View, StyleSheet, Image, ScrollView } from 'react-native';
import { Input, Item, Icon, Button } from 'native-base';
import { SafeAreaView } from 'react-navigation';
import Slideshow from 'react-native-image-slider-show-razzium';
import { Col, Row, Grid } from 'react-native-easy-grid';
import * as Linking from 'expo-linking';
import Separator from "../components/Separator";

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
    this.urlRedirect = this.urlRedirect.bind(this);
    this._listA = React.createRef();
    this._listP = React.createRef();
    //console.log('Height on: ', Platform.OS, StatusBar.currentHeight);
  }

  componentDidMount() {
    this.fetchHome();

    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );

    Linking.getInitialURL().then(this.urlRedirect);

    // listen for new url events coming from Expo
    Linking.addEventListener('url', event => {
        this.urlRedirect(event.url);
    });

   this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        console.log('willFocusSubscription');
        if (this._listA != null && this._listA.current != null) {
          this._listA.current._retrieveBookmarkArticleIds();
          this._listA.current._retrieveLikeArticleIds();
        }
        if (this._listP != null && this._listP.current != null)
          this._listP.current._retrieveBookmarkPlaceIds();
      }
   );

  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }
  _handleNotification = notification => {
    Vibration.vibrate()
    this.setState({ notification: notification }, () => {
      console.log(JSON.stringify(notification));
      if(notification.data != null)
        this.navigateDetail(notification.data.type, notification.data.link);
    });
  };

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

  navigateDetail(type, link) {
    if(type == 'A') {
      this.props.navigation.navigate("ArticleDetail", {
        item: {type: 'A', data: {id: link}, bookmarked: false, liked: false}
      })
    } else if(type == 'P') {
      this.props.navigation.navigate("PlaceDetail", {
        item: {type: 'P', data: {id: link}, bookmarked: false, liked: false}
      })
    } else if(type == 'E') {
      Linking.openURL(link);
    }
  }

  urlRedirect(url) {
      if(!url) return;
      // parse and redirect to new url
      let { path, queryParams } = Linking.parse(url);
      console.log(`Linked to app with path: ${path} and data: ${JSON.stringify(queryParams)}`);
      if (path != null)
        this.navigateDetail(queryParams.type, queryParams.id);
  }

  fetchHome() {
    fetch("https://gobirdie.hk/app/admin3s/api/home",
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
             caption: ' ',
             type: el.type,
             link: el.link,
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
    type = this.state.slides[index].type;
    link = this.state.slides[index].link;
    console.log(index, + ", " + type + ", " + link);
    this.navigateDetail(type, link);
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
                <Icon name="ios-search" style={{color:"black"}} />
                <TouchableOpacity onPress={() => this.props.navigation.navigate("PlaceSearch")}>
                <Input placeholder="???????????????" editable={false} />
                </TouchableOpacity>
              </Item>
            </View>
            <ScrollView>
            { slides &&
              <Slideshow 
                dataSource={slides} 
                onPress={this.handleSlides} 
                indicatorSize={0}
                titleStyle={{
                  zIndex: 1,
                  fontSize: 20, 
                  padding: 10,
                  color:'white', 
                  opacity: 1,
                  position: 'absolute',
                  left: 0,
                  top: -12,
                }} 
                captionStyle={{
                  flex: 1,
                  position: 'absolute',
                  left: 0,
                  top: -10,
                  opacity: 0.5,
                  backgroundColor: 'black',
                  height: 40,
                  width: '150%'
                }} />
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
            <Separator />
            <Text style={styles.header}>????????????</Text>
            { paths && articles &&
            <ArticleList data={articles} navigation={this.props.navigation} ref={this._listA} />
            }
            <View style={{ paddingHorizontal:15, paddingBottom:15 }}>
            <Button bordered rounded style={{ width: '100%', justifyContent:'center', alignItems:'center'}}
            onPress={() =>
              this.props.navigation.navigate("HighlightPage", {
                type: 'A', title: '????????????'
            })}
            >
              <Text>????????????</Text>
            </Button>
            </View>
            <Separator />
            <Text style={styles.header}>???????????????</Text>
            { paths && places &&
            <PlaceList data={places} navigation={this.props.navigation} ref={this._listP} />
            }
            <View style={{ padding:15 }}>
            <Button bordered rounded style={{ width: '100%', justifyContent:'center', alignItems:'center'}}
            onPress={() =>
              this.props.navigation.navigate("HighlightPage", {
                type: 'P', title: '???????????????'
            })}
            >
              <Text>????????????</Text>
            </Button>
            </View>
            </ScrollView>
          </View>
        </SafeAreaView>
    );
    }
  }

}

const styles = StyleSheet.create({
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