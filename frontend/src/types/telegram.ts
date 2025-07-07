// Определение типов для Telegram WebApp
declare global {
  interface Window {
    Telegram: TelegramWebApp;
  }
}

export interface TelegramWebApp {
  WebApp: {
    ready: () => void;
    expand: () => void;
    close: () => void;
    BackButton: {
      show: () => void;
      hide: () => void;
      onClick: (cb: () => void) => void;
    };
    MainButton: {
      show: () => void;
      hide: () => void;
      setText: (text: string) => void;
      onClick: (cb: () => void) => void;
      enable: () => void;
      disable: () => void;
      showProgress: (leaveActive: boolean) => void;
      hideProgress: () => void;
    };
    themeParams: {
      bg_color: string;
      text_color: string;
      button_color: string;
      button_text_color: string;
    };
    initData: string;
    initDataUnsafe: {
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
      };
    };
  };
}

export default {}; 