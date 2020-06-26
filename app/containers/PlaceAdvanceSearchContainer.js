import * as React from "react";
import { Slider, ScrollView, Dimensions, AsyncStorage, ActivityIndicator, StyleSheet, Image, View } from 'react-native';
import { Button, Icon, Accordion, Container, Left, Body, Right, Separator, Header, Content, List, ListItem, Text, Radio } from 'native-base';

const win = Dimensions.get('window');

export default class PlaceAdvanceSearchContainer extends React.Component {
  constructor(props) {
    super(props);

    const param = this.props.navigation.state.params;
    //console.log(param.gps);

  this.state = {
      error: null,
      isLoaded: true,
      path_facilities: null,
      facilities: [],
      facilityId: null,
      organizations: [],
      organizationId: null,
      accordions: []
    };
  }

  _renderHeader(i, expanded) {
    return (
      <View style={{
        flexDirection: "row",
        padding: 10,
        justifyContent: "space-between",
        alignItems: "center" }}>
      <Text style={{ fontWeight: "600" }}>
          {" "}{i.title}
        </Text>
        {expanded
          ? <Icon style={{color:"black"}} type="Ionicons" name="ios-arrow-down" />
          : <Icon style={{color:"black"}} type="Ionicons" name="ios-arrow-forward" />
        }
      </View>
    );
  }
  _renderContent = i => {
    return (
      <View>
      { 
        i.content.length > 0 && i.content.map((item, key) => {
          //console.log(item.id + ' == ' + i.selected);
          return (
            <ListItem key={item.id} selected={i.selected == item.id}
              onPress={() => this._accordionChange(key, i.title)}
              >
              <Left>
                <Text>{item.name}</Text>
              </Left>
              <Right>
                <Radio
                  selected={i.selected == item.id}
                  onPress={() => this._accordionChange(key, i.title)}
                  color={"#999"}
                  selectedColor={"#ffb701"}
                />
              </Right>
            </ListItem>
          );
        })
      }
      </View>
    );
  }

  fetchData() {
    fetch("https://gobirdie.hk/app/admin3s/api/advance",
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
            organizations: result.data.organizations,
            accordions: [
              { title: "地區", content: result.data.districts, selected:null },
              { title: "時間", content: result.data.hours, selected:null },
              { title: "空間", content: result.data.areas, selected:null }
            ],
          }, () => {
          console.log(this.state.districts);
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

  getFacilities = async () => {
    try {
      const value = await AsyncStorage.getItem('@birdie:facilities');
      if (value !== null) {
        this.setState({
          //isLoaded: true,
          facilities: JSON.parse(value),
        }, () => {
          console.log(value);
        });
      } /*else
        this.setState({
          isLoaded: true,
        }); */
    } catch (error) {
      console.error(error);
    }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', '篩選'),
    };
  };

  componentDidMount() {
    this._retrievePath();
    this.getFacilities();
    this.fetchData();
  }

  _facilityChange(id) {
    this.setState({
      facilityId: id,
    });
    console.log(id);
  }
  _organizationChange(id) {
    this.setState({
      organizationId: id,
    });
    console.log(id);
  }

  _accordionChange(key, title) {
    var arr = this.state.accordions;
    arr.forEach(function (a, index) {
      if(a.title == title && a.content != null && a.content[key] != null) {
        //console.log(a.content[key].id);
        a.selected = a.content[key].id;
      }
    });

    this.setState({
      accordions: arr,
    }, () => {
      console.log(this.state.accordions);
    });
  }

  _retrievePath = async () => {
    try {
      const value = await AsyncStorage.getItem('@birdie:paths');
      if (value !== null) {
        paths = JSON.parse(value);
        this.setState({
          path_facilities:paths.facilities
        }, () => {
          console.log('path_facilities: ' + this.state.path_facilities);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  searchSubmit = () => {
    var arr = this.state.accordions;
    var advanceSearch = [
      {field: "district", value: arr[0].selected},
      {field: "opening_hours", value: arr[1].selected},
      {field: "area", value: arr[2].selected},
      {field: "facilities", value: this.state.facilityId},
      {field: "organization", value: this.state.organizationId},
    ];

    this.props.navigation.navigate("PlaceResult", { advanceSearch: advanceSearch });
  }

// #E86C00 // #F4B815
  render() {
    if (!this.state.isLoaded || this.state.facilities.length == 0 || this.state.path_facilities == null) {
      return <ActivityIndicator />;
    } else {
    const { facilities, accordions, organizations } = this.state;
    return (
      <Container>
      <ScrollView style={{ flex: 1, flexDirection: 'column' }}>
      <List>
          <Separator bordered style={{height:50}}>
            <Text style={styles.header}>分類</Text>
          </Separator>
          <Accordion
            dataArray={accordions}
            animation={true}
            expanded={true}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
          />
          <Separator bordered style={{height:50}}>
            <Text style={styles.header}>設施配套</Text>
          </Separator>
            {
              facilities.length > 0 && facilities.map((item, key) => {
                //console.log('uri: ' + this.state.path_facilities+item.icon);
                return (
                  <ListItem key={item.id} selected={this.state.facilityId == item.id}
                  onPress={() => this._facilityChange(item.id)}>
                    <Left>
                      <Image style={{ width:35, height:40, marginRight:15 }}
                      source={{ uri: this.state.path_facilities+item.icon }} 
                      onError={e => {
                        console.error(e);
                      }}/>
                      <Text>{item.name}</Text>
                    </Left>

                    <Right>
                      <Radio
                        selected={this.state.facilityId == item.id}
                        onPress={() => this._facilityChange(item.id)}
                        color={"#999"}
                        selectedColor={"#F4B815"}
                      />
                    </Right>
                  </ListItem>
                );
              })
            }
          <Separator bordered style={{height:50}}>
            <Text style={styles.header}>經營類別</Text>
          </Separator>
            {
              organizations.length > 0 && organizations.map((item, key) => {
                return (
                  <ListItem key={item.id} selected={this.state.organizationId == item.id}
                  onPress={() => this._organizationChange(item.id)}>
                    <Left>
                      <Text>{item.name}</Text>
                    </Left>
                    <Right>
                      <Radio
                        selected={this.state.organizationId == item.id}
                        onPress={() => this._organizationChange(item.id)}
                        color={"#999"}
                        selectedColor={"#F4B815"}
                      />
                    </Right>
                  </ListItem>
                );
              })
            }
      </List>
      </ScrollView>
      <View style={{ paddingHorizontal:15, paddingVertical:10 }}>
        <Button bordered rounded style={{ width: '100%', justifyContent:'center', alignItems:'center'}}
        onPress={ this.searchSubmit }
        >
          <Text>搜尋</Text>
        </Button>
      </View>
      </Container>
    );
    }
  }
}
const styles: any = StyleSheet.create({
    header: {
      color: '#7d5114',
      fontWeight: 'bold',
      fontSize: 18
    },
});