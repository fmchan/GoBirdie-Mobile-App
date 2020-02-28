import React from "react";
import { TouchableOpacity, AsyncStorage, List, ListItem, Text, View, Dimensions, StyleSheet, FlatList, Image } from 'react-native';
import { Icon } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';

const deviceWidth = Dimensions.get("window").width;
const photoAllowSize = 4;

Array.prototype.fromArrayWithSize = function(size) {
	var a = new Array(size).fill(null);
	for (var i = 0; i<this.length; i++) {
		if(i==size) break;
		a[i] = this[i];
	}
	return a;
}

export default class PlaceList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			path_places:null,
			path_facilities:null,
			bookmark_place_ids:[],
		};
		this._retrievePath();
		this._retrievePlaceIds();
		//console.log(this.state.path_facilities);
	}
	getCatNames(cats) {
		categories = [];
		cats.forEach(function (el, index) {
			categories.push(el.name);
		});
		return categories;
	}

	_retrievePath = async () => {
		try {
		  const value = await AsyncStorage.getItem('@birdie:paths');
		  if (value !== null) {
		    paths = JSON.parse(value);
		    this.setState({
		    	path_places:paths.places,
		    	path_facilities:paths.facilities
		    });
		  }
		} catch (error) {
		  console.error(error);
		}
	};
	_retrievePlaceIds = async () => {
		try {
		  const value = await AsyncStorage.getItem('@birdie:bookmarks.place_ids');
		  if (value !== null) {
		    this.setState({
		    	bookmark_place_ids:JSON.parse(value),
		    });
		  }
		} catch (error) {
		  console.error(error);
		}
	};

	_bookmarkPlace(place, bookmarked) {
		console.log(bookmarked);
		this._bookmark('places', place, bookmarked);
		this._bookmarkPlaceId(place.id, bookmarked);
		//this._bookmark('place_ids', place.id, bookmarked);
		return !bookmarked;
	}

	async _bookmark(field, i, bookmarked) {
		try {
		  const value = await AsyncStorage.getItem('@birdie:bookmarks.'+field);
		  if (value !== null) {
		    arr = JSON.parse(value);
		    if(bookmarked)
		    	arr.unshift(i);
		    else
		    	arr = arr.filter(e => e.id !== i.id);
		  } else if(bookmarked) {
		  	arr = [i];
		  }
		  await AsyncStorage.setItem('@birdie:bookmarks.'+field, JSON.stringify(arr));
		} catch (error) {
		  console.error(error);
		}
	};

	async _bookmarkPlaceId(id, bookmarked) {
		place_ids = this.state.bookmark_place_ids;
	    if(bookmarked)
	    	place_ids.unshift(id);
	    else
	    	place_ids = place_ids.filter(e => e !== id);
		this.setState({
			bookmark_place_ids:place_ids,
		}, () => {
			console.log(place_ids);
	    });
		try {
		  	await AsyncStorage.setItem('@birdie:bookmarks.place_ids', JSON.stringify(place_ids));
		} catch (error) {
		  console.error(error);
		}
	};

	_keyExtractor = (item, index) => index.toString();

	_renderItem = ({item}) => {
	item.bookmarked = this.state.bookmark_place_ids.includes(item.id);
	return (
	<View style={{ paddingVertical: 20, paddingHorizontal: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 }}>
		<TouchableOpacity style={{position: 'absolute', right: 10, top: 20}} onPress={() => item.bookmarked = this._bookmarkPlace(item, !item.bookmarked)}>
			{ !item.bookmarked && <Icon type="FontAwesome" name="bookmark-o" style={{color: '#ffb701', fontSize: 25}} /> }
			{ item.bookmarked && <Icon type="FontAwesome" name="bookmark" style={{color: '#ffb701', fontSize: 25}} /> }
		</TouchableOpacity>
		<Text numberOfLines={1} style={{fontSize: 22, marginRight: 20}}
		   onPress={() =>
		    this.props.navigation.navigate("PlaceDetail", {
		   	  item: {type: 'P', data: item, image_path: this.state.path_places, bookmarked: item.bookmarked}
		    })
		  }>{item.title} <Icon type="Ionicons" name="ios-arrow-forward" style={{fontSize: 22}} /></Text>
		<Text note numberOfLines={1} style={{fontSize: 18, color: 'grey', marginVertical: 10}}>{this.getCatNames(item.categories).join("/")}</Text>
		<View style={{flex: 1, flexDirection: 'row'}}>
	      {
	        item.facilities.map((facility, key) => {
	        	//console.log('f: '+ this.state.path_facilities+facility.icon);
	          return (
	            <Image key={key} 
	            style={{ width:30, height:40, marginRight:10 }}
	            source={{ uri: this.state.path_facilities+facility.icon }} 
	            onError={e => {
	              console.error(e);
	            }}/>
	          );
	        })
	      }
		</View>
		<Text numberOfLines={1} style={{fontSize: 20, color: 'grey', marginTop: 10}}><Icon type="Entypo" name="location-pin" style={{fontSize: 20}} />{item.address}</Text>
		<Text numberOfLines={1} style={{fontSize: 20, marginVertical: 10}}><Icon type="Entypo" name="phone" style={{fontSize: 20}} />{item.telephone}</Text>
		<Grid>
	      { item.photos &&
	        item.photos.fromArrayWithSize(photoAllowSize).map((photo, key) => {
	        	if(photo == null)
	        		return (<Col key={key} style={styles.photo}></Col>);
	        	else
		          return (
					<Col key={key} style={styles.photo}>
		                <Image style={{ borderRadius: 8, flex: 1 }} 
		                source={{ uri: this.state.path_places+photo }} 
		                onError={e => {
		                  console.error(e);
		                }}/>
		            </Col>
		          );
	        })
	      }
		</Grid>
	</View>
	)};

	render() {
		if(this.state.path_places != null && this.state.path_facilities != null) {
	    return (
		<FlatList
		  onEndReachedThreshold={0}
		  onEndReached={({ distanceFromEnd }) => {
		    console.debug('on end reached ', distanceFromEnd);
		  }}
		  data={this.props.data}
		  keyExtractor={this._keyExtractor}
		  renderItem={this._renderItem}
		  //extraData={this.props}
		/>
		);
		} else return (<Text>no list</Text>);
	}
}

const styles = StyleSheet.create({
  photo: {
  	height: (deviceWidth - 20) / photoAllowSize, padding: 5
  }
});
