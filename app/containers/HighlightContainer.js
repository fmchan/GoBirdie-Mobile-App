import * as React from "react";
import { ActivityIndicator, StyleSheet, Image, View} from 'react-native';
import ArticleList from "../components/ArticleList";
import PlaceList from "../components/PlaceList";

export default class HighlightContainer extends React.Component {
  constructor(props) {
    super(props);

    const param = this.props.navigation.state.params;
    //console.log(param.gps);

	this.state = {
      error: null,
      isLoaded: false,
      type: param.type,
      data: [],
	  };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', 'List'),
    };
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    fetch("https://gobirdie.hk/app/admin3s/api/" + (this.state.type == 'A'? 'highlight_articles': 'highlight_places'),
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
    const { data, type } = this.state;
    return (
      <View>
      { type == 'P' && data.length > 0 &&
      <PlaceList data={data} navigation={this.props.navigation} />
      }
      { type == 'A' && data.length > 0 &&
      <ArticleList data={data} navigation={this.props.navigation} />
      }
      </View>
    );
    }
  }
}
const styles: any = StyleSheet.create({
});