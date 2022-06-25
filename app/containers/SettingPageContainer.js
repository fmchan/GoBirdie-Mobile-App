import * as React from "react";
import { Updates, Notifications } from 'expo';
import { Dimensions, AsyncStorage, ActivityIndicator, StyleSheet, Image, View, ScrollView, Switch } from 'react-native';
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
      isPush: true,
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', '菜單'),
    };
  };

  componentDidMount() {
    this.getPushStatus();
    this.fetchData();
  }

  fetchData() {
    fetch("https://gobirdie.hk/app/admin3s/api/pages",
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
  getPushStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('@birdie:isPush');
      console.log('storage of push?'+value);
      this.setState({isPush:(value != null && value == "0")?false:true},()=>{
        console.log('state of isPush?'+this.state.isPush);
      });
    } catch (error) {
      console.error(error);
    }
  };
  toggleSwitch = async () => {
    let token = await Notifications.getExpoPushTokenAsync();
    const oldState = this.state.isPush;
    var data = (oldState)? {token: token, disable: true}: {token: token};

    await fetch("https://gobirdie.hk/app/admin3s/api/subscribe",
    {
      method: 'POST', 
      headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    }
      )
      .then(res => res.json())
      .then(
        (result) => {
          if(!result.success) {console.log('no'); return};
          console.log(result);

          this.setState({ isPush: !oldState }, 
            async () => {
              await AsyncStorage.setItem('@birdie:isPush', (oldState)?"0":"1");
              console.log('state of isPush?'+this.state.isPush);
          });

        },
        (error) => {
          console.error(error);
        }
      )

  };

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
            <ListItem>
              <Left>
              <Text>推送通知</Text>
              </Left>
              <Right>
                <Switch
                  onValueChange={() => this.toggleSwitch()}
                  value={this.state.isPush}
                />
              </Right>
            </ListItem>
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
const styles = StyleSheet.create({
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