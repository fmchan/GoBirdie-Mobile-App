import * as React from "react";
import { Updates } from 'expo';
import { Dimensions, AsyncStorage, ActivityIndicator, StyleSheet, Image, View, ScrollView } from 'react-native';
import { Left, Right, Icon, Separator, Header, Content, List, ListItem, Text } from 'native-base';
import {expo} from '../../app.json'

const win = Dimensions.get('window');

export default class SettingPageContainer extends React.Component {
  constructor(props) {
    super(props);

    const param = this.props.navigation.state.params;
    //console.log(param.gps);

  this.state = {
      error: null,
      isLoaded: false,
      data: [],
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', '菜單'),
    };
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    fetch("http://34.80.70.229:7000/api/pages",
    {
      headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
      },
    }
      )
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) return;
          this.setState({
            isLoaded: true,
            data: result.data,
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

  render() {
    if (!this.state.isLoaded) {
      return <ActivityIndicator />;
    } else {
    const { data } = this.state;
    return (
      <ScrollView style={{ flex: 1, flexDirection: 'column' }}>
      <View style={{flex: 1,justifyContent: 'center', alignItems: 'center', paddingVertical:50}}>
        <Image style={styles.image} resizeMode={'contain'} source={require('../../assets/logo-01.png')} />
      </View>
          <List>
          <Separator bordered style={{height:50}}>
            <Text style={styles.header}>設置</Text>
          </Separator>
            <ListItem
            onPress={() => {
                    AsyncStorage.clear();
                    Updates.reload();
            }}
            >
              <Left>
              <Text>清除緩存</Text>
              </Left>
            </ListItem>
          <Separator bordered style={{height:50}}>
            <Text style={styles.header}>更多</Text>
          </Separator>
            {
              data.length > 0 && data.map((item, key) => {
                return (
            <ListItem key={item.id}
            onPress={() =>
                    this.props.navigation.navigate("TextPage", {
                      item: item, title: item.title
                  })}
            >
            <Left>
              <Text>{item.title}</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" 
                />
              </Right>
            </ListItem>
                );
              })
            }
            <ListItem>
              <Left>
              <Text>版本: {expo.version}</Text>
              </Left>
            </ListItem>
          </List>
      </ScrollView>
    );
    }
  }
}
const styles: any = StyleSheet.create({
    image: {
        width:win.width - 50,
        height:200,
    },
    header: {
      color: '#7d5114',
      fontWeight: 'bold',
      fontSize: 20
    },
});