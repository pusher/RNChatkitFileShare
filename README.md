# RNChatkitFileShare
A sample React Native app showing how to create a file-sharing app using Chatkit.

Full tutorial is available at: [https://pusher.com/tutorials/file-sharing-react-native](https://pusher.com/tutorials/file-sharing-react-native)

### Prerequisites

- [Expo](https://expo.io/)
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/en/)
- [Expo account](https://expo.io/)
- Expo [Android](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en) or [iOS client app](https://itunes.apple.com/us/app/expo-client/id982107779?mt=8)
- [Pusher Chatkit app instance](https://pusher.com/chatkit)
- [Ngrok account](https://ngrok.com/)


## Getting Started

1. Clone the repo:

```
git clone https://github.com/pusher/RNChatkitFileShare.git
```

2. Install the app dependencies:

```
cd RNChatkitFileShare
yarn install
```

3. Update Pusher config on `app/screens/Chat.js` file:

```
const CHATKIT_TOKEN_PROVIDER_ENDPOINT = "YOUR TEST TOKEN PROVIDER ENDPOINT";
const CHATKIT_INSTANCE_LOCATOR = "YOUR INSTANCE LOCATOR ID";
```

4. Install the server dependencies:

```
cd server
npm install
```

5. Run the server:

```
node server.js
```

6. [Download ngrok executable file](https://dashboard.ngrok.com/get-started).

7. Expose server using ngrok:


```
./ngrok authtoken YOUR_NGROK_AUTH_TOKEN
./ngrok http 3000
```

8. Copy the ngrok https URL and update the `CHAT_SERVER` in the `app/screens/Chat.js` file and `app/screens/Login.js` file:

```
// app/screens/Chat.js
const CHAT_SERVER = "YOUR_NGROK_HTTPS_URL/rooms";

// app/screens/Login.js
const CHAT_SERVER = "YOUR_NGROK_HTTPS_URL/users";
```

9. Run the app and open it in your Expo client app:

```
expo start
```


## Built With

* [React Native](http://facebook.github.io/react-native/)
* [Expo](https://expo.io/)
* [Pusher Chatkit](https://pusher.com/chatkit)

