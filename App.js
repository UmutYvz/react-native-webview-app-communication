import React from 'react';
import {SafeAreaView, Text, View, Platform} from 'react-native';
import StaticServer from 'react-native-static-server';
import WebView from 'react-native-webview';
import RNFS from 'react-native-fs';

class App extends React.Component {
  webViewRef = null;
  state = {
    url: null,
    captchaToken: null,
  };
  async componentDidMount() {
    fetch('CHALLANGE_GT_ENDPOINT')
      .then(response => response.json())
      .then(json => {
        this.setState({captchaToken: json.data.data});
        const params = JSON.stringify(json.data.data);
        const paramterForGeetest = `initializeGeetest(${params})`;
        this.webViewRef.injectJavaScript(paramterForGeetest);
      });
    moveAndroidFiles();
    let path = getPath();
    this.server = new StaticServer(8080, path);
    this.server.start().then(url => {
      this.setState({url});
    });
  }

  componentWillUnmount() {
    if (this.server && this.server.isRunning()) {
      this.server.stop();
    }
  }

  render() {
    if (!this.state.url) {
      return (
        <SafeAreaView>
          <Text>Hello World</Text>
        </SafeAreaView>
      );
    }

    const run = `onPress()`;
    return (
      <SafeAreaView>
        <View style={{height: '100%', width: '100%'}}>
          <Text onPress={() => this.webViewRef.injectJavaScript(run)}>
            Open to Catcpha
          </Text>
          <WebView
            ref={r => (this.webViewRef = r)}
            style={{flex: 1, marginBottom: 20, backgroundColor: 'transparent'}}
            source={{uri: this.state.url}}
            onMessage={e => console.log('e: ', JSON.parse(e.nativeEvent.data))}
          />
        </View>
      </SafeAreaView>
    );
  }
}

function getPath() {
  return Platform.OS === 'android'
    ? RNFS.DocumentDirectoryPath + '/www'
    : RNFS.MainBundlePath + '/www';
}

async function moveAndroidFiles() {
  if (Platform.OS === 'android') {
    await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/www');
    const files = ['www/index.html'];
    await files.forEach(async file => {
      await RNFS.copyFileAssets(file, RNFS.DocumentDirectoryPath + '/' + file);
    });
  }
}

export default App;
