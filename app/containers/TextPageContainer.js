import * as React from "react";
import { Dimensions, ActivityIndicator, StyleSheet, Image, View } from 'react-native';
import { Left, Right, Icon, Separator, Header, Content, List, ListItem, Text } from 'native-base';

const win = Dimensions.get('window');

export default class TextPageContainer extends React.Component {
  constructor(props) {
    super(props);

    const param = this.props.navigation.state.params;
    //console.log(param.gps);

  this.state = {
      error: null,
      isLoaded: true,
      item: param.item,
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', 'List'),
    };
  };

  componentDidMount() {
  }

  render() {
    if (!this.state.isLoaded) {
      return <ActivityIndicator />;
    } else {
    const { item } = this.state;
    return (
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 20, lineHeight: 30, }}>{item.content}</Text>
      </View>
    );
    }
  }
}
const styles = StyleSheet.create({
});