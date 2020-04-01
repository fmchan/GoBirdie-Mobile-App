import * as React from "react";
import { ActivityIndicator, AsyncStorage, Linking, StatusBar, Platform, View, StyleSheet, Image, ScrollView, Share, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Button, List, ListItem, Text, Icon, Left, Body, Right, Switch, H2, Card, CardItem, Separator, Thumbnail } from 'native-base';
import { SearchBar } from 'react-native-elements';
import Slideshow from 'react-native-image-slider-show-razzium';
import { Col, Row, Grid } from 'react-native-easy-grid';
import HTML from 'react-native-render-html';
import Modal, { ModalContent } from 'react-native-modals';

import ArticleList from "../components/ArticleList";
import RecommendList from "../components/RecommendList";

export default class DetailPageContainer extends React.Component {
  constructor(props) {
    super(props);
    const param = this.props.navigation.state.params;
    //console.log(param.item.image_path);
    //console.log(this.props.navigation.state);

    this.state = {
      error: null,
      isLoaded: false,
      type: param.item.type,
      data: null,
      images: [],
      tags: [],
      image_path: param.item.image_path,
      shortData: param.item.data,
      bookmarked: param.item.bookmarked,
      liked: param.item.liked,
      modalTransport: false,
    };
  }

  componentDidMount() {
   this.fetchData(this.state.type, this.state.shortData.id, this.state.image_path);
   this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        param = this.props.navigation.state.params;
        console.log(param);
        if(param.item.id != this.state.shortData.id)
          this.setState({
            error: null,
            isLoaded: false,
            type: param.item.type,
            data: null,
            images: [],
            tags: [],
            image_path: param.item.image_path,
            shortData: param.item.data,
            bookmarked: param.item.bookmarked,
            liked: param.item.liked,
          }, () => {
            this.fetchData(this.state.type, this.state.shortData.id, this.state.image_path);
          });
      }
    );
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }


  fetchData(type, id, image_path) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type','text/plain; charset=UTF-8');
    fetch("http://34.80.70.229:7000/api/"+(type == 'A'? 'articles': 'places')+"/"+id, myHeaders)
      .then(result => result.json())
      .then(
        (result) => {
          console.log(result);
          data = result.data;
          images = [];
          data.slides.forEach(function (el, index) {
           var image = image_path + "/" + el;
           console.log(image);
           images.push({url:image});
          });
          tags = [];
          data.tags.forEach(function (el, index) {
           tags.push(el.name);
          });
          this.setState({
            isLoaded: true,
            data: data,
            images: images,
            tags: tags
          }, () => {
            if(type == 'P')
              this._setLikeById('place_ids', id);
          });
          //console.log(this.state.data);
          //console.log(this.state.images);
        },
        (error) => {
          console.error(error);
          this.setState({
            isLoaded: true,
          });
        }
      )
  }

  onShare = async () => {
    try {
      console.log("share");
      const result = await Share.share({
        message: 'Birdle | This is a share test.',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  _bookmarkButton(type, data, bookmarked) {
    console.log(bookmarked);
    this._bookmark(type == 'A'? 'articles': 'places', data, bookmarked, false);
    this._bookmark(type == 'A'? 'article_ids': 'place_ids', data.id, bookmarked, true);
    this.setState({
      bookmarked: !bookmarked,
    });
  }

  async _bookmark(field, i, bookmarked, isId) {
    try {
      const value = await AsyncStorage.getItem('@birdie:bookmarks.'+field);
      if (value !== null) {
        arr = JSON.parse(value);
        if(bookmarked)
          arr.unshift(i);
        else
          arr = isId? arr.filter(e => e !== i): arr.filter(e => e.id !== i.id);
      } else if(bookmarked) {
        arr = [i];
      }
      await AsyncStorage.setItem('@birdie:bookmarks.'+field, JSON.stringify(arr));
    } catch (error) {
      console.error(error);
    }
  };

  async _setLikeById(field, id) {
    try {
      const value = await AsyncStorage.getItem('@birdie:likes.'+field);
      if (value !== null) {
        this.setState({
          liked:JSON.parse(value).includes(this.state.data.id),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  async _likeId(field, id, liked) {
    try {
      const value = await AsyncStorage.getItem('@birdie:likes.'+field);
      if (value !== null) {
        arr = JSON.parse(value);
      if(liked)
        arr.unshift(id);
      else
        arr = arr.filter(e => e !== id);
      } else if(liked) {
        arr = [id];
      }
      await AsyncStorage.setItem('@birdie:likes.'+field, JSON.stringify(arr));
    } catch (error) {
      console.error(error);
    }
  };

  operateHeart(type, id, liked, heart) {
    fetch("http://34.80.70.229:7000/api/"+(type == 'A'? 'articles': 'places')+"/"+id+"/heart", {
      method: 'POST', 
      headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({add:liked}),
    })
    .then(res => res.json())
    .then(
      (result) => {
        if(!result.success) return;
        console.log(result.data);
        this._likeId(type == 'A'? 'article_ids': 'place_ids', id, liked);
        data = this.state.data;
        data.heart = liked? (++heart): (--heart);
        this.setState({
          data: data,
          liked: liked,
        });
      },
      (error) => {
        console.error(error);
        /*this.setState({
          isLoaded: true,
        });*/
      }
    );
  }

  render() {
    if (!this.state.isLoaded) {
      return <ActivityIndicator />;
    } else {
      const { type, shortData, data, images, tags, bookmarked, liked } = this.state;
      const list = [
        {
          title: data.telephone,
          icon: 'phone',
          type: 'Entypo'
        },
        {
          title: data.opening,
          icon: 'md-time',
          type: 'Ionicons',
          color: 'grey'
        },
        {
          title: data.fee,
          icon: 'attach-money',
          type: 'MaterialIcons',
          color: 'grey'
        },
        {
          title: tags.join("/"),
          icon: 'price-tag',
          type: 'Entypo',
          color: 'grey'
        },
        {
          title: data.email,
          icon: 'mail-outline',
          type: 'MaterialIcons'
        },
        {
          title: data.website,
          icon: 'link',
          type: 'Entypo'
        },
      ];
      return (
        <ScrollView showsVerticalScrollIndicator={false}>

          { images.length > 0 &&
            <Slideshow dataSource={images}/>
          }
            <Button transparent onPress={() => this.props.navigation.pop()}
              style={{position: 'absolute', left: 8, top: 25}} >
              <Icon style={{color:"white"}} type="Ionicons" name="ios-arrow-back" />
            </Button>
          <H2 style={{padding:20, color: '#434343'}}>{data.title}</H2>

          <Grid style={{paddingBottom:10}}>
            <Col style={{ height: 80 }}
            onPress={() =>
              Linking.openURL(`tel:${data.telephone}`)
            }
            >
              <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
              <Image style={{ width:50, flex: 1 }} resizeMode="contain"
                source={require('../../assets/details/phone.png')} />
              <Text style={{ fontSize: 18, textAlign: 'center' }}>致電</Text>
              </View>
            </Col>
            <Col style={{ height: 80 }}
                  onPress={() =>
                    this.props.navigation.navigate("MapPage", {
                      gps: data.gps, address: data.address,
                  })}>
              <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
              <Image style={{ width:50, flex: 1 }} resizeMode="contain"
                source={require('../../assets/details/location.png')} />
              <Text style={{ fontSize: 18, textAlign: 'center' }}>地圖</Text>
              </View>
            </Col>
            <Col style={{ height: 80 }}
              onPress={this.onShare}
            >
            <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
              <Image style={{ width:50, flex: 1 }} resizeMode="contain"
                source={require('../../assets/details/share.png')} />
              <Text style={{ fontSize: 18, textAlign: 'center' }}>分享</Text>
              </View>
            </Col>
            <Col style={{ height: 80 }}
              onPress={() => this.operateHeart(type, data.id, !liked, data.heart)}
            >
            <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
              {liked && <Image style={{ width:50, flex: 1 }} resizeMode="contain"
                source={require('../../assets/details/like.png')} /> }
              {!liked && <Image style={{ width:50, flex: 1 }} resizeMode="contain"
                source={require('../../assets/details/like-o.png')} /> }
              <Text style={{ fontSize: 18, textAlign: 'center' }}>{data.heart}</Text>
              </View>
            </Col>
            <Col style={{ height: 80 }}
              onPress={() => this._bookmarkButton(type, shortData, bookmarked)}
            >
              <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
              {bookmarked && <Image style={{ width:50, flex: 1 }} resizeMode="contain"
                source={require('../../assets/details/bookmark.png')} /> }
              {!bookmarked && <Image style={{ width:50, flex: 1 }} resizeMode="contain"
                source={require('../../assets/details/bookmark-o.png')} /> }
              <Text style={{ fontSize: 18, textAlign: 'center' }}>收藏</Text>
              </View>
            </Col>
          </Grid>
          <Separator bordered />
          <List>
            <ListItem icon noBorder style={{height:80}}>
              <Left style={styles.left}>
                <Icon type='Entypo' name='location-pin' style={styles.icon} />
              </Left>
              <Body>
                <Text numberOfLines={1}>{data.address}</Text>
                <Text note numberOfLines={1}>{data.transport_short}</Text>
              </Body>
              <Right style={{ width:90 }}>
                <Button transparent 
                title="Show Modal"
                onPress={() => {
                  this.setState({ modalTransport: true });
                }}
                style={{ marginTop:15, flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                   <Image style={{ width:70, height:70 }} 
                source={require('../../assets/details/traffic.png')} />
                    <Text style={{ width:85, fontSize:12 }} >交通資訊</Text>
                </Button>
                <Modal
                  visible={this.state.modalTransport}
                  onTouchOutside={() => {
                    this.setState({ modalTransport: false });
                  }}
                >
                  <ModalContent>
                    <Text>{data.transport_long}</Text>
                  </ModalContent>
                </Modal>
              </Right>
            </ListItem>
          { list.map((item, i) => (
            <ListItem icon key={i} noBorder>
              <Left style={styles.left}>
                { item.icon &&
                <Icon type={item.type} name={item.icon} style={styles.icon} />
                }
              </Left>
              <Body>
                <Text style={{ color: item.color}}>{item.title ? item.title : "N/A"}</Text>
              </Body>
            </ListItem>
            ))
          }
          </List>

          <Card>
            <CardItem header>
              <Text style={styles.icon}>介紹</Text>
            </CardItem>
            <CardItem>
            <HTML html={data.content} tagsStyles={ {p: { fontSize: 20, lineHeight: 28 }} } imagesMaxWidth={Dimensions.get('window').width - 40} />
            </CardItem>
            {/*<CardItem footer>
              <Button bordered rounded style={{width: '100%', justifyContent:'center', alignItems:'center'}}>
                <Text>顯示更多</Text>
              </Button>
            </CardItem>*/}
         </Card>

         { data.articles.length > 0 && <Text style={styles.header}>相關活動</Text> }
         { data.articles.length > 0 &&
          <ArticleList data={data.articles} navigation={this.props.navigation} />
         }
         { data.places.length > 0 && <Text style={styles.header}>相關好去處</Text> }
         { data.places.length > 0 &&
          <CardItem>
            <RecommendList places={data.places} navigation={this.props.navigation} />
          </CardItem>
        }

        </ScrollView>
      );
    }
  }

}

const styles: any = StyleSheet.create({
  left: { width: 50 },
  icon: {
    color: '#7a5211'
  },
  grid: {
    backgroundColor: 'powderblue'
  },
  head: {
    fontSize: 20
  },
  header: {
    color: '#7d5114',
    fontWeight: 'bold',
    fontSize: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
});