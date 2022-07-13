import {AppRegistry} from 'react-native';
import CodePush from 'react-native-code-push';
import App from './App';
import {name as appName} from './app.json';

const codePushOptions = {checkFrequency: CodePush.CheckFrequency.MANUAL};
AppRegistry.registerComponent(appName, () => CodePush(codePushOptions)(App));
