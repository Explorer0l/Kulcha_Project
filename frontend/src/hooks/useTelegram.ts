import { useEffect } from 'react';
import '../types/telegram'; // Импортируем типы Telegram

function useTelegram() {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  const showBackButton = () => {
    if (tg) {
      tg.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (tg) {
      tg.BackButton.hide();
    }
  };

  const setBackButtonCallback = (cb: () => void) => {
    if (tg) {
      tg.BackButton.onClick(cb);
    }
  };

  const showMainButton = (text: string) => {
    if (tg) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (tg) {
      tg.MainButton.hide();
    }
  };

  const setMainButtonCallback = (cb: () => void) => {
    if (tg) {
      tg.MainButton.onClick(cb);
    }
  };

  const enableMainButton = () => {
    if (tg) {
      tg.MainButton.enable();
    }
  };

  const disableMainButton = () => {
    if (tg) {
      tg.MainButton.disable();
    }
  };

  const showMainButtonLoader = () => {
    if (tg) {
      tg.MainButton.showProgress(false);
    }
  };

  const hideMainButtonLoader = () => {
    if (tg) {
      tg.MainButton.hideProgress();
    }
  };

  const getUser = () => tg?.initDataUnsafe?.user;

  return {
    tg,
    showBackButton,
    hideBackButton,
    setBackButtonCallback,
    showMainButton,
    hideMainButton,
    setMainButtonCallback,
    enableMainButton,
    disableMainButton,
    showMainButtonLoader,
    hideMainButtonLoader,
    getUser,
  };
}

export default useTelegram; 