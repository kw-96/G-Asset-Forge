import './App.css';

import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import Editor from './components/Editor';
import { WelcomeScreen } from './components/WelcomeScreen';
import { appEventEmitter } from './events';
import { en, type SupportedLocale, zh } from './locale';

const messageMap = {
  zh,
  en,
};

const getLocale = (): SupportedLocale => {
  const locale =
    localStorage.getItem('g-asset-forge-locale') || navigator.language;
  return locale.startsWith('zh') ? 'zh' : 'en';
};

function App() {
  const [locale, setLocale] = useState(getLocale());
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // 检查用户是否已经使用过应用(暂时始终设置为首次使用)
    // const hasUsedApp = localStorage.getItem('g-asset-forge-used');
    const hasUsedApp = false;

    // 恢复正常的欢迎页面逻辑
    if (hasUsedApp) {
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  }, []); // 空依赖数组，只在组件挂载时执行一次

  useEffect(() => {
    const localeChangeHandler = (locale: SupportedLocale) => {
      setLocale(locale);
    };
    appEventEmitter.on('localeChange', localeChangeHandler);
    return () => {
      appEventEmitter.off('localeChange', localeChangeHandler);
    };
  });

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  return (
    <IntlProvider locale={locale} messages={messageMap[locale]}>
      <div className="g-asset-forge">
        {showWelcome ? (
          <WelcomeScreen onComplete={handleWelcomeComplete} />
        ) : (
          <Editor />
        )}
      </div>
    </IntlProvider>
  );
}

export default App;
