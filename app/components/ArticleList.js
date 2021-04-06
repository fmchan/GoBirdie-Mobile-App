import React from "react";
import { TouchableOpacity, AsyncStorage, List, ListItem, Text, View, Dimensions, StyleSheet, FlatList, Image } from 'react-native';
import { Icon } from 'native-base';

const deviceWidth = Dimensions.get("window").width;

export default class ArticleList extends React.Component {
	constructor(props) {
    	super(props);
    	this.state = {
    		path_articles:null,
    		bookmark_article_ids:[],
    		like_article_ids:[],
    	};
    	this._retrievePath();
    	this._retrieveBookmarkArticleIds();
    	this._retrieveLikeArticleIds();
    }
  _retrievePath = async () => {
    try {
      const value = await AsyncStorage.getItem('@birdie:paths');
      if (value !== null) {
        paths = JSON.parse(value);
        this.setState({path_articles:paths.articles});
      }
    } catch (error) {
      console.error(error);
    }
  };
	_retrieveBookmarkArticleIds = async () => {
		try {
		  const value = await AsyncStorage.getItem('@birdie:bookmarks.article_ids');
		  if (value !== null) {
		    this.setState({
		    	bookmark_article_ids:JSON.parse(value),
		    }, () => {
				console.log(this.state.bookmark_article_ids);
	    	});
		  }
		} catch (error) {
		  console.error(error);
		}
	};

	_bookmarkArticle(article, bookmarked) {
		console.log(bookmarked);
		this._bookmark('articles', article, bookmarked);
		this._bookmarkArticleId(article.id, bookmarked);
		//this._bookmark('place_ids', place.id, bookmarked);
		return !bookmarked;
	}

	async _bookmark(field, i, bookmarked) {
		var arr = [];
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

	async _bookmarkArticleId(id, bookmarked) {
		article_ids = this.state.bookmark_article_ids;
	    if(bookmarked)
	    	article_ids.unshift(id);
	    else
	    	article_ids = article_ids.filter(e => e !== id);
		this.setState({
			bookmark_article_ids:article_ids,
		}, () => {
			console.log(article_ids);
	    });
		try {
		  	await AsyncStorage.setItem('@birdie:bookmarks.article_ids', JSON.stringify(article_ids));
		} catch (error) {
		  console.error(error);
		}
	};

	_retrieveLikeArticleIds = async () => {
		try {
		  const value = await AsyncStorage.getItem('@birdie:likes.article_ids');
		  if (value !== null) {
		    this.setState({
		    	like_article_ids:JSON.parse(value),
		    });
		  }
		} catch (error) {
		  console.error(error);
		}
	};

	async _likeArticleId(id, liked) {
		article_ids = this.state.like_article_ids;
	    if(liked)
	    	article_ids.unshift(id);
	    else
	    	article_ids = article_ids.filter(e => e !== id);
		this.setState({
			like_article_ids:article_ids,
		}, () => {
			console.log(article_ids);
	    });
		try {
		  	await AsyncStorage.setItem('@birdie:likes.article_ids', JSON.stringify(article_ids));
		} catch (error) {
		  console.error(error);
		}
	};

	operateHeart(id, liked, heart) {
		fetch("https://gobirdie.hk/app/admin3s/api/articles/"+id+"/heart", {
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
	      this._likeArticleId(id, liked);
	    },
	    (error) => {
	      console.error(error);
	      /*this.setState({
	        isLoaded: true,
	      });*/
	    }
	  );
	  return liked? (++heart): (--heart);
	}

	_keyExtractor = (item, index) => item.id;

	_renderItem = ({item}) => {
	item.bookmarked = this.state.bookmark_article_ids.includes(item.id);
	item.liked = this.state.like_article_ids.includes(item.id);
	return (
	<View
	  id={item.id}
	  title={item.title}
	  style={{
	    margin: 8,
	    width: deviceWidth/2 - 24,
	    //maxWidth: deviceWidth/2-20,
	    height: deviceWidth/2,
	    //backgroundColor: '#CCC',
	    marginBottom: 15,
	  }}
	>
	<TouchableOpacity
		   onPress={() =>
		    this.props.navigation.navigate("ArticleDetail", {
		      item: {type: 'A', data: item, image_path: this.state.path_articles, bookmarked: item.bookmarked, liked: item.liked}
		    })}>
	<Image
	      style={{borderRadius: 8, width: deviceWidth/2 - 24, height: deviceWidth/2 * 9/16}}
	      source={{ uri: this.state.path_articles+item.photo }}
	      onError={e => {
	        console.error(e);
	      }}
	    />
	</TouchableOpacity>
	<TouchableOpacity style={{position: 'absolute', right: 8, top: 8}} onPress={() => item.bookmarked = this._bookmarkArticle(item, !item.bookmarked)}>
		{ !item.bookmarked && <Icon type="FontAwesome" name="bookmark-o" style={{color: 'white', fontSize: 25}} /> }
		{ item.bookmarked && <Icon type="FontAwesome" name="bookmark" style={{color: '#ffb701', fontSize: 25}} /> }
	</TouchableOpacity>
	<Text numberOfLines={2} style={{marginTop: 10, height: 50, fontSize: 18}}
	   onPress={() =>
	    this.props.navigation.navigate("ArticleDetail", {
	      item: {type: 'A', data: item, image_path: this.state.path_articles, bookmarked: item.bookmarked, liked: item.liked}
	    })
	  }>{item.title}</Text>
	  <View style={{color: '#CCC', marginTop: 10, flex: 1, flexDirection: 'row'}}>
	    <Text style={{color: '#999'}}>{item.date}</Text>
	    <TouchableOpacity
	    	style={{position: 'absolute', right: 0}}
	    	onPress={() => item.heart = this.operateHeart(item.id, item.liked = !item.liked, item.heart)}>
		    <Text style={{color: '#999'}}>
		    { !item.liked && <Icon type="Entypo" name="heart-outlined" style={{color: '#999', fontSize: 14}} /> }
		    { item.liked && <Icon type="Entypo" name="heart" style={{color: '#ffb701', fontSize: 14}} /> }
		    {item.heart}</Text>
		</TouchableOpacity>
	  </View>
	</View>
	)};

	render() {
		if(this.state.path_articles != null) {
	    return (
		<FlatList
		  numColumns={2}
		  onEndReachedThreshold={0}
		  onEndReached={({ distanceFromEnd }) => {
		    console.debug('on end reached ', distanceFromEnd);
		  }}
		  contentContainerStyle={styles.list}
		  data={this.props.data}
		  keyExtractor={this._keyExtractor}
		  renderItem={this._renderItem}
		/>
		);
		} else return (<Text>no list</Text>);
	}
}

const styles = StyleSheet.create({
  list: {
    margin: 8,
    justifyContent: 'center',
    flexDirection: 'column',
  },
});
