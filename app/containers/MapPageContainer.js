import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import MapView from 'react-native-maps';

export default class MapPageContainer extends React.Component {
  constructor(props) {
    super(props);

    const param = this.props.navigation.state.params;
    console.log(param.gps);

	this.state = {
      mapRegion: {
        latitude: parseFloat(param.gps.split(",")[0]),
        longitude: parseFloat(param.gps.split(",")[1]),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      marker: {
        latitude: parseFloat(param.gps.split(",")[0]),
        longitude: parseFloat(param.gps.split(",")[1]),
      }
	  };
  }
  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('address', 'Map'),
    };
  };

  render() {
    return (
<View style={styles.absoluteFillObject}>
  <MapView style={styles.absoluteFillObject} region={this.state.mapRegion}>
  <MapView.Marker coordinate={this.state.marker} />
   </MapView>
   <Image
          source={require('../../assets/pin.png')}
          style={{width:0,height:0}}
        />
</View>
    );
  }
}
const styles: any = StyleSheet.create({
	absoluteFillObject : {
	  position: 'absolute',
	  left: 0,
	  right: 0,
	  top: 0,
	  bottom: 0,
	}
});