import * as React from "react";
import { Slider, ScrollView, Dimensions, AsyncStorage, ActivityIndicator, StyleSheet, Image, View } from 'react-native';
import { Accordion, Container, Left, Right, Separator, Header, Content, List, ListItem, Text, Radio } from 'native-base';
import RangeSlider from 'rn-range-slider';

const win = Dimensions.get('window');

const dataArray = [
  { title: "First Element", content: "Lorem ipsum dolor sit amet" },
  { title: "Second Element", content: "Lorem ipsum dolor sit amet" },
  { title: "Third Element", content: "Lorem ipsum dolor sit amet" }
];

export default class PlaceAdvanceSearchContainer extends React.Component {
  constructor(props) {
    super(props);

    const param = this.props.navigation.state.params;
    //console.log(param.gps);

  this.state = {
      error: null,
      isLoaded: true,
      facilities: [],
      facilityId: null,
      districts: [],
      areas: [],
      hours: [],
    };
  }

  _renderHeader(item, expanded) {
    return (
      <View style={{
        flexDirection: "row",
        padding: 10,
        justifyContent: "space-between",
        alignItems: "center" ,
        backgroundColor: "#A9DAD6" }}>
      <Text style={{ fontWeight: "600" }}>
          {" "}{item.title}
        </Text>
        {expanded
          ? <Icon style={{ fontSize: 18 }} name="remove-circle" />
          : <Icon style={{ fontSize: 18 }} name="add-circle" />}
      </View>
    );
  }
  _renderContent(item) {
    return (
      <Text
        style={{
          backgroundColor: "#e3f1f1",
          padding: 10,
          fontStyle: "italic",
        }}
      >
        {item.content}
      </Text>
    );
  }

  fetchData() {
    fetch("http://34.80.70.229:7000/api/advance",
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
            districts: result.data.districts,
            hours: result.data.hours,
            areas: result.data.areas,
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
    this.getFacilities();
    this.fetchData();
  }

  _facilityChange(id) {
    this.setState({
      facilityId: id,
    });
    console.log(id);
  }
// #E86C00 // #F4B815
  render() {
    if (!this.state.isLoaded || this.state.facilities.length == 0) {
      return <ActivityIndicator />;
    } else {
    const { facilities, districts, areas, hours } = this.state;
    return (
      <Container>
      <ScrollView style={{ flex: 1, flexDirection: 'column' }}>
      <List>
          <Accordion
            dataArray={dataArray}
            animation={true}
            expanded={true}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
          />
        <RangeSlider
            style={{width: 160, height: 80}}
            gravity={'center'}
            min={200}
            max={1000}
            step={20}
            selectionColor="#3df"
            blankColor="#f618"
            onValueChanged={(low, high, fromUser) => {
                this.setState({rangeLow: low, rangeHigh: high})
            }}/>
        />
          <Separator bordered style={{height:50}}>
            <Text style={styles.header}>設施配套</Text>
          </Separator>
            {
              facilities.length > 0 && facilities.map((item, key) => {
                return (
                  <ListItem key={item.id} selected={this.state.facilityId == item.id}
                  onPress={() => this._facilityChange(item.id)}>
                    <Left>
                      <Text>{item.name}</Text>
                    </Left>
                    <Right>
                      <Radio
                        selected={this.state.facilityId == item.id}
                        onPress={() => this._facilityChange(item.id)}
                        color={"#999"}
                        selectedColor={"#ffb701"}
                      />
                    </Right>
                  </ListItem>
                );
              })
            }
      </List>
      </ScrollView>
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