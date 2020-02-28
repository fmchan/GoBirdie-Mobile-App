import React from "react";
import { AsyncStorage, TouchableOpacity, List, ListItem, Text, View, Dimensions, StyleSheet, ScrollView, Image } from 'react-native';
import { Icon, H3 } from 'native-base';

const deviceWidth = Dimensions.get("window").width;

export default class RecommendList extends React.Component {
	constructor(props) {
    	super(props);
    	this.state = {
    		path_places:null
    	};
    	this._retrievePath();
    }

	_retrievePath = async () => {
		try {
		  const value = await AsyncStorage.getItem('@birdie:paths');
		  if (value !== null) {
		    paths = JSON.parse(value);
		    this.setState({path_places:paths.places});
		  }
		} catch (error) {
		  console.error(error);
		}
	};

	render() {
		if(this.state.path_places != null) {
		const { places } = this.props;
	    return (
		<ScrollView horizontal={true}>
        {
          places.map((item, key) => {
	        categories = [];
	        item.categories.forEach(function (el, index) {
	          categories.push(el.name);
	        });
            return (

            <TouchableOpacity key={key} style={{paddingRight:10}}
            	onPress={() =>
			    this.props.navigation.navigate("PlaceDetail", {
			      item: {type: 'P', data: item, image_path: this.state.path_places}
			    })}>
              <Image
                style={{borderRadius: 8, width: deviceWidth/2 - 24, height: deviceWidth/2 * 9/16}}
                source={{ uri: this.state.path_places+item.photo }}
                onError={e => {
                  console.error(e);
                }}
              />
              <View style={{width: deviceWidth/2 - 24}}>
	              <H3 numberOfLines={1} style={{paddingVertical:10}}>{item.title}</H3>
	              <Text numberOfLines={1} style={{color:'#999', fontSize:15}}>{categories.join("/")}</Text>
              </View>
            </TouchableOpacity>
            )
          })
        }
		</ScrollView>
		);
		} else return (<Text>no list</Text>);
	}
}

const styles = StyleSheet.create({
  list: {
  },
});
