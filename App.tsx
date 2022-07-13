import React, {useState} from 'react';
import {Button, SafeAreaView, ScrollView, StatusBar, Text, View} from 'react-native';
import CodePush, {
  DownloadProgress,
  DownloadProgressCallback,
  LocalPackage,
  RemotePackage,
  SyncStatusChangedCallback,
} from 'react-native-code-push';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const App = () => {
  const [localPackage, setLocalPackage] = useState<LocalPackage | null>();
  const [remotePackage, setRemotePackage] = useState<RemotePackage | null>();
  const [progressState, setProgress] = useState<string>('');
  const [logBook, setLog] = useState<string[]>([]);

  CodePush.notifyAppReady();

  const onGetCurrentVersionButtonPress = () => {
    CodePush.getUpdateMetadata().then(update => {
      setLocalPackage(update ? update : null);
      log('LocalUpdateMetadata');
      log(JSON.stringify(update));
    });
  };

  const onSyncStatusChange: SyncStatusChangedCallback = (syncStatus: CodePush.SyncStatus) => {
    switch (syncStatus) {
      case CodePush.SyncStatus.AWAITING_USER_ACTION:
        log('AWAITING_USER_ACTION');
        break;
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        log('CHECKING_FOR_UPDATE');
        break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        log('DOWNLOADING_PACKAGE');
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        log('INSTALLING_UPDATE');
        break;
      case CodePush.SyncStatus.SYNC_IN_PROGRESS:
        log('SYNC_IN_PROGRESS');
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        log('UNKNOWN_ERROR');
        break;
      case CodePush.SyncStatus.UPDATE_IGNORED:
        log('UPDATE_IGNORED');
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        log('UPDATE_INSTALLED');
        break;
      case CodePush.SyncStatus.UP_TO_DATE:
        log('UP_TO_DATE');
        break;
    }
  };

  const downloadProgressCallback: DownloadProgressCallback = (progress: DownloadProgress) => {
    setProgress(progress.receivedBytes + ' / ' + progress.totalBytes);
  };

  const onSyncButtonPress = () => {
    log('onSyncButtonPress');
    CodePush.sync(undefined, onSyncStatusChange, downloadProgressCallback)
      .then(
        result => {
          log('Result: ' + result.toString());
        },
        error => {
          log('Error: ' + JSON.stringify(error));
        },
      )
      .catch(error => {
        log('Catch: ' + JSON.stringify(error));
      });
  };

  const onSyncImidiateButtonPress = () => {
    log('onSyncImidiateButtonPress');
    CodePush.sync({installMode: CodePush.InstallMode.IMMEDIATE}, onSyncStatusChange, downloadProgressCallback);
  };

  const onSyncWithDialogButtonPress = () => {
    log('onSyncWithDialogButtonPress');
    CodePush.sync({updateDialog: {}}, onSyncStatusChange, downloadProgressCallback);
  };

  const onCheckForUpdate = () => {
    log('onCheckForUpdate');
    CodePush.checkForUpdate().then(
      (remotePackageResponse: RemotePackage | null) => {
        log('THEN: onCheckForUpdate', JSON.stringify(remotePackage));
        setRemotePackage(remotePackageResponse);
      },
      error => {
        log('ERROR: ' + error);
      },
    );
  };

  const downloadRemotePackage = () => {
    remotePackage?.download(downloadProgressCallback).then(
      localPackageResponse => {
        setLocalPackage(localPackageResponse);
      },
      error => {
        log('DOWNLOADING ERROR: ' + error);
      },
    );
  };

  const installLocalPackage = () => {
    localPackage?.install(CodePush.InstallMode.ON_NEXT_RESTART).then(_ => {
      log('Installation done');
    });
  };

  const log = (value: string, obj?: any | undefined) => {
    if (obj) {
      let objectString = JSON.stringify(obj);
      console.log('[CodePush][MY]' + value + objectString);
      setLog([value + objectString, ...logBook]);
    } else {
      console.log('[CodePush][MY]' + value);
      setLog([value, ...logBook]);
    }
  };

  const onGetConfig = () => {
    const nativeConfig = CodePush.getConfiguration();
    log('', nativeConfig);
  };

  return (
    <SafeAreaView>
      <StatusBar barStyle={'light-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{backgroundColor: Colors.lighter}}>
          <Text>Some which should be updated via code push 202111</Text>
          <Text>Label: "{localPackage?.label}"</Text>
          <Text>isPending: "{localPackage?.isPending?.toString()}"</Text>
          <Text>failedInstall: "{localPackage?.failedInstall?.toString()}"</Text>
          <Text>isFirstRun: "{localPackage?.isFirstRun?.toString()}"</Text>
          <Text>RemotePackage</Text>
          <Text>Label: "{remotePackage?.label}"</Text>
          <Text>isPending: "{remotePackage?.isPending?.toString()}"</Text>
          <Text>failedInstall: "{remotePackage?.failedInstall?.toString()}"</Text>
          <Text>isFirstRun: "{remotePackage?.isFirstRun?.toString()}"</Text>
          <Button title="Get get local config" onPress={onGetConfig} />
          <Button title="Get Local Update Metadata" onPress={onGetCurrentVersionButtonPress} />
          <Button title="CodePush.sync();" onPress={onSyncButtonPress} />
          <Button title="CodePush.sync({updateDialog: {}});" onPress={onSyncWithDialogButtonPress} />
          <Button
            title="CodePush.sync({installMode: CodePush.InstallMode.IMMEDIATE});"
            onPress={onSyncImidiateButtonPress}
          />
          <Button title="CodePush.checkForUpdate()" onPress={onCheckForUpdate} />
          <Button title="Download remote package" onPress={downloadRemotePackage} />
          <Button title="Install remote package" onPress={installLocalPackage} />
          <Button title="Restart" onPress={() => CodePush.restartApp()} />

          <Text>{progressState}</Text>

          <Text>
            <React.Fragment>{JSON.stringify(logBook, null, 2)}</React.Fragment>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
