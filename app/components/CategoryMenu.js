import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";

export default class CategoryMenu extends React.Component {
	render() {
	const { onMenuPress, currentPage, categories } = this.props;
	return (
	  <View style={{height:60, borderWidth: 1, borderColor: "#e9e9e9"}}>
	  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
	  {
	    categories.length > 0 && categories.map((item, key) => {
	      return (
	      <View style={currentPage == item.id ? styles.activeMenuItem : styles.menuItem} key={key}>
	        <Text style={currentPage == item.id ? styles.activeMenuItemText : styles.menuItemText} button onPress={() => onMenuPress(item.id)}>{item.name}</Text>
	      </View>
	      );
	    })
	  }
	  </ScrollView>
	  </View>
	)}
}

const styles = StyleSheet.create({
  menuItem: {
    padding: 17,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: "white",
  },
  activeMenuItem: {
    padding: 17,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#ffb701',
  },

  menuItemText: {
    fontSize: 17,
    color: "#919191"
  },
  activeMenuItemText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "black"
  },
});