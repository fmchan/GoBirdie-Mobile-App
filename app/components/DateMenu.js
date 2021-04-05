import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { DatePicker } from 'native-base';

export default class DateMenu extends React.Component {
  constructor(props) {
    super(props);
    this.datepick = React.createRef();
  }
  filter = [
      {"id":0,"name":'全部'},
      {"id":1,"name":'明天'},
      {"id":2,"name":'後天'},
      {"id":3,"name":'週未'},
      {"id":4,"name":'指定時間'},
  ];

  resetDate() {
    //console.log(this.datepick.current);
    if(this.datepick.current != null) {
      this.datepick.current.setState({chosenDate:null})
    }
  }

  componentDidMount() {
    this.props.onRef(this);
  }

	render() {
	const { onFilterPress, currentFilter, setDate } = this.props;
	return (
    <View style={{height:55}}>
    <ScrollView horizontal={true} style={styles.filterView} showsHorizontalScrollIndicator={false}>
    <Text style={styles.filterLabel}>日期</Text>
    {
      this.filter.length > 0 && this.filter.map((item, key) => {
        if(item.id == 4) return (
         <DatePicker
          ref={this.datepick}
          key={item.id} 
          //defaultDate={new Date()}
          locale={"zh_hk"}
          timeZoneOffsetInMinutes={undefined}
          modalTransparent={false}
          animationType={"fade"}
          androidMode={"default"}
          placeHolderText="指定時間"
          textStyle={styles.activeFilterItem}
          placeHolderTextStyle={styles.filterItem}
          onDateChange={setDate}
          disabled={false}
          style={{backgroundColor: 'black'}}
          />
        );
        return (
        <Text style={currentFilter == item.id ? styles.activeFilterItem : styles.filterItem} button onPress={() => onFilterPress(item.id)} key={key}>{item.name}</Text>
        );
      })
    }
    </ScrollView>
    </View>
	)}
}

const styles = StyleSheet.create({
  filterView: {
    borderBottomWidth: 1,
    borderColor: "#e9e9e9",
  },
  filterItem: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    margin:10,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: "#d4d4d4",
    fontSize: 18,
    borderRadius:15,
    color: "#8a8a8a",
  },
  activeFilterItem: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    margin:10,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: "#ffb701",
    fontSize: 18,
    fontWeight: "bold",
    borderRadius:15,
    color: "black",
  },
  filterLabel: {
    padding: 5,
    margin:10,
    fontWeight: "bold",
    color: "#785015",
    fontSize: 18,
  }
});