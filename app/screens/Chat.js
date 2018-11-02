import React, { Component } from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { GiftedChat, Send } from "react-native-gifted-chat";

import Chatkit from "@pusher/chatkit-client";

import randomstring from "random-string";

import * as mime from "react-native-mime-types";

import { Permissions, ImagePicker, DocumentPicker } from "expo";
import { Ionicons } from "@expo/vector-icons";

import DownloadsModal from "../components/DownloadsModal";

const CHATKIT_TOKEN_PROVIDER_ENDPOINT = "YOUR TEST TOKEN PROVIDER ENDPOINT";
const CHATKIT_INSTANCE_LOCATOR = "YOUR INSTANCE LOCATOR ID";

const CHAT_SERVER = "YOUR_NGROK_URL/rooms";

export default class Chat extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;

    return {
      headerTitle: `Chat with ${params.friends_username}`,
      headerRight: (
        <TouchableOpacity onPress={() => params.viewFiles()}>
          <View style={styles.buttonContainer}>
            <Ionicons name="ios-folder-open" size={25} color="#FFF" />
          </View>
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: "#333"
      },
      headerTitleStyle: {
        color: "#FFF"
      }
    };
  };

  state = {
    messages: [],
    files: [],
    is_initialized: false,
    is_loading: false,
    is_modal_visible: false,
    show_load_earlier: false,
    is_picking_file: false
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const user_id = navigation.getParam("user_id");
    const username = navigation.getParam("username");
    const friends_username = navigation.getParam("friends_username");

    const members = [username, friends_username];
    members.sort();

    this.user_id = user_id;
    this.username = username;
    this.room_name = members.join("-");

    this.attachment = null;
  }

  async componentDidMount() {
    const { navigation } = this.props;

    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    const username = navigation.getParam("username");

    const tokenProvider = new Chatkit.TokenProvider({
      url: CHATKIT_TOKEN_PROVIDER_ENDPOINT
    });

    const chatManager = new Chatkit.ChatManager({
      instanceLocator: CHATKIT_INSTANCE_LOCATOR,
      userId: this.user_id,
      tokenProvider: tokenProvider
    });

    try {
      let currentUser = await chatManager.connect();
      this.currentUser = currentUser;

      let response = await fetch(CHAT_SERVER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: this.user_id,
          room_name: this.room_name
        })
      });

      if (response.ok) {
        let room = await response.json();

        this.room_id = room.id;
        await this.currentUser.subscribeToRoom({
          roomId: room.id,
          hooks: {
            onMessage: this.onReceive
          }
        });

        await this.setState({
          is_initialized: true
        });
      }
    } catch (err) {
      console.log("error with chat manager: ", err);
    }

    this.props.navigation.setParams({
      viewFiles: this.viewFiles
    });
  }

  viewFiles = async () => {
    this.setState({
      is_modal_visible: true
    });
  };

  onReceive = async data => {
    let { message, file } = await this.getMessageAndFile(data);

    if (file) {
      const { id, name, link, type } = file;
      await this.setState(previousState => ({
        files: previousState.files.concat({
          id: id,
          name: name,
          link: link,
          type: type
        })
      }));
    }

    await this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, message)
    }));

    if (this.state.messages.length > 9) {
      this.setState({
        show_load_earlier: true
      });
    }
  };

  onSend([message]) {
    let msg = {
      text: message.text,
      roomId: this.room_id
    };

    this.setState({
      is_sending: true
    });

    if (this.attachment) {
      let filename = this.attachment.name
        ? this.attachment.name
        : randomstring() + ".jpg";
      let type = this.attachment.file_type
        ? this.attachment.file_type
        : "image/jpeg";

      msg.attachment = {
        file: {
          uri: this.attachment.uri,
          type: type,
          name: `${filename}`
        },
        name: `${filename}`,
        fetchRequired: true,
        type: this.attachment.type
      };
    }

    this.currentUser.sendMessage(msg).then(() => {
      this.attachment = null;

      this.setState({
        is_sending: false
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {(this.state.is_loading || !this.state.is_initialized) && (
          <ActivityIndicator
            size="small"
            color="#0064e1"
            style={styles.loader}
          />
        )}

        {this.state.is_initialized && (
          <GiftedChat
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: this.user_id
            }}
            renderActions={this.renderCustomActions}
            loadEarlier={this.state.show_load_earlier}
            onLoadEarlier={this.loadEarlierMessages}
            renderSend={this.renderSend}
          />
        )}

        <DownloadsModal
          is_visible={this.state.is_modal_visible}
          files={this.state.files}
          closeModal={this.closeModal}
        />
      </View>
    );
  }

  renderSend = props => {
    if (this.state.is_sending) {
      return (
        <ActivityIndicator
          size="small"
          color="#0064e1"
          style={[styles.loader, styles.sendLoader]}
        />
      );
    }

    return <Send {...props} />;
  };

  getMessageAndFile = async ({ id, senderId, text, attachment, createdAt }) => {
    let file_data = null;
    let msg_data = {
      _id: id,
      text: text,
      createdAt: new Date(createdAt),
      user: {
        _id: senderId,
        name: senderId,
        avatar:
          "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
      }
    };

    if (attachment) {
      const { link, type } = attachment;

      if (type === "image") {
        msg_data.image = link;
      } else {
        msg_data.text += `\nsee attached: ${link}\n`;
      }

      file_data = { id, link, type };
    }

    return {
      message: msg_data,
      file: file_data
    };
  };

  loadEarlierMessages = async () => {
    this.setState({
      is_loading: true
    });

    const earliest_message_id = Math.min(
      ...this.state.messages.map(m => parseInt(m._id))
    );

    try {
      let messages = await this.currentUser.fetchMessages({
        roomId: this.room_id,
        initialId: earliest_message_id,
        direction: "older",
        limit: 10
      });

      if (!messages.length) {
        this.setState({
          show_load_earlier: false
        });
      }

      let earlier_messages = [];
      let files = [];
      await this.asyncForEach(messages, async msg => {
        let { message, file } = await this.getMessageAndFile(msg);

        earlier_messages.push(message);
        if (file) {
          files.push(file);
        }
      });

      await this.setState(previousState => ({
        messages: previousState.messages.concat(earlier_messages),
        files: previousState.files.concat(files)
      }));
    } catch (err) {
      console.log("error occured while trying to load older messages", err);
    }

    await this.setState({
      is_loading: false
    });
  };

  asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  closeModal = () => {
    this.setState({
      is_modal_visible: false
    });
  };

  renderCustomActions = () => {
    if (!this.state.is_picking_file) {
      let icon_color = this.attachment ? "#0064e1" : "#808080";

      return (
        <View style={styles.customActionsContainer}>
          <TouchableOpacity onPress={this.openFilePicker}>
            <View style={styles.buttonContainer}>
              <Ionicons name="md-attach" size={23} color={icon_color} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.openImagePicker}>
            <View style={styles.buttonContainer}>
              <Ionicons name="md-image" size={23} color={icon_color} />
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ActivityIndicator size="small" color="#0064e1" style={styles.loader} />
    );
  };

  openFilePicker = async () => {
    let file = await DocumentPicker.getDocumentAsync();

    await this.setState({
      is_picking_file: true
    });

    if (file.type == "success") {
      this.attachment = {
        name: file.name,
        uri: file.uri,
        type: "file",
        file_type: mime.contentType(file.name)
      };

      Alert.alert("Success", "File attached!");
    }

    await this.setState({
      is_picking_file: false
    });
  };

  openImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    await this.setState({
      is_picking_file: true
    });

    if (!result.cancelled) {
      this.attachment = {
        uri: result.uri,
        type: result.type
      };

      Alert.alert("Success", "File attached!");
    }

    await this.setState({
      is_picking_file: false
    });
  };
}

const styles = {
  container: {
    flex: 1
  },
  buttonContainer: {
    padding: 10
  },
  customActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  loader: {
    paddingTop: 20
  },
  sendLoader: {
    marginRight: 10,
    marginBottom: 10
  }
};
