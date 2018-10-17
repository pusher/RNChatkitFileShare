import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Linking
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default class DownloadsList extends Component {
  render() {
    const { files } = this.props;

    return (
      <View>
        <FlatList
          data={files}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      </View>
    );
  }

  renderItem = ({ item }) => {
    return (
      <View style={styles.listItem}>
        <View style={styles.filenameContainer}>
          {item.type == "image" && (
            <Image
              style={styles.image}
              source={{ uri: item.link }}
              resizeMode={"contain"}
            />
          )}

          {item.type != "image" && (
            <Image
              style={styles.image}
              source={require("../../assets/placeholder.png")}
              resizeMode={"contain"}
            />
          )}

          <Text style={styles.filename}>{item.name.substr(0, 20)}...</Text>
        </View>

        <TouchableOpacity onPress={this.downloadFile.bind(this, item)}>
          <View style={[styles.buttonContainer, styles.buttonDownload]}>
            <Ionicons name="md-download" size={28} color="#4591f3" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  downloadFile = async item => {
    Linking.openURL(item.link);
  };
}

const styles = {
  list: {
    justifyContent: "center"
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  filenameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  filename: {
    paddingLeft: 10
  },
  image: {
    width: 50,
    height: 50
  },
  buttonContainer: {
    padding: 10
  },
  buttonDownload: {
    alignSelf: "center"
  }
};
