import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';
import { AppProvider } from '@/store/app-context';

function App(props) {
  useEffect(() => {});

  useDidShow(() => {});

  useDidHide(() => {});

  return (
    <AppProvider>
      {props.children}
    </AppProvider>
  );
}

export default App;
