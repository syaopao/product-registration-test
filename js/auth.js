const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwz2Fi7rCIG8I1ayVh2C0LxxtHVqOARPEWXSUXWccrbhGF6ttWP7gElOl5ofejGZT71/exec';

// ==============================
// Google ログイン + 30日ログイン保持
// ==============================

const GOOGLE_CLIENT_ID = '656446276650-coa5rruu2bd1peg75modl245o4bba8up.apps.googleusercontent.com';


const SESSION_STORAGE_KEY = 'product-registration-session-token';
const SESSION_LAST_CHECK_KEY = 'product-registration-session-last-check';
const SESSION_CHECK_CACHE_MS = 10 * 60 * 1000;

let googleIdToken = '';
let sessionToken = '';

window.addEventListener('load', async () => {
  const savedSessionToken =
    localStorage.getItem(SESSION_STORAGE_KEY) || '';

  if (savedSessionToken) {
    const lastCheckedAt =
      Number(
        localStorage.getItem(
          SESSION_LAST_CHECK_KEY
        ) || 0
      );

    const isRecent =
      lastCheckedAt &&
      Date.now() - lastCheckedAt <
        SESSION_CHECK_CACHE_MS;

    if (isRecent) {
      sessionToken = savedSessionToken;
      showAppAfterLogin(null);
      return;
    }

    const restored =
      await tryRestoreSession(
        savedSessionToken
      );

    if (restored) return;
  }

  initGoogleLoginButton();
});


function initGoogleLoginButton() {
  if (
    !window.google ||
    !google.accounts ||
    !google.accounts.id
  ) {
    setTimeout(
      initGoogleLoginButton,
      500
    );
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback:
      handleGoogleCredentialResponse,
  });

  const buttonElement =
    document.getElementById(
      'googleLoginButton'
    );

  if (buttonElement) {
    buttonElement.innerHTML = '';

    google.accounts.id.renderButton(
      buttonElement,
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      }
    );
  }
}


async function handleGoogleCredentialResponse(
  response
) {
  if (
    !response ||
    !response.credential
  ) {
    alert(
      'Googleログインに失敗しました。'
    );
    return;
  }

  googleIdToken =
    response.credential;

  try {
    const gasResponse =
      await fetch(
        GAS_WEB_APP_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'text/plain;charset=utf-8'
          },
          body:
            JSON.stringify({
              action: 'login',
              idToken:
                googleIdToken
            })
        }
      );

    const result =
      await gasResponse.json();

    if (!result.ok) {
      throw new Error(
        result.message ||
        'ログイン確認に失敗しました。'
      );
    }

    if (
      !result.sessionToken
    ) {
      throw new Error(
        'セッショントークンを取得できませんでした。'
      );
    }

    sessionToken =
      result.sessionToken;

    localStorage.setItem(
      SESSION_STORAGE_KEY,
      sessionToken
    );

    localStorage.setItem(
      SESSION_LAST_CHECK_KEY,
      String(Date.now())
    );

    showAppAfterLogin(
      result.user
    );

  } catch (error) {
    console.error(error);

    googleIdToken = '';
    sessionToken = '';

    localStorage.removeItem(
      SESSION_STORAGE_KEY
    );

    localStorage.removeItem(
      SESSION_LAST_CHECK_KEY
    );

    alert(
      'ログイン失敗: ' +
      error.message
    );
  }
}


async function tryRestoreSession(
  savedToken
) {
  try {
    const response =
      await fetch(
        GAS_WEB_APP_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'text/plain;charset=utf-8'
          },
          body:
            JSON.stringify({
              action:
                'checkSession',
              sessionToken:
                savedToken
            })
        }
      );

    const result =
      await response.json();

    if (!result.ok) {
      throw new Error(
        result.message ||
        'セッションが無効です。'
      );
    }

    sessionToken =
      savedToken;

    localStorage.setItem(
      SESSION_LAST_CHECK_KEY,
      String(Date.now())
    );

    showAppAfterLogin(
      result.user
    );

    return true;

  } catch (error) {
    console.log(
      '保存済みログインは利用できません:',
      error.message
    );

    sessionToken = '';

    localStorage.removeItem(
      SESSION_STORAGE_KEY
    );

    localStorage.removeItem(
      SESSION_LAST_CHECK_KEY
    );

    return false;
  }
}


function showAppAfterLogin(
  user
) {
  if (user) {
    console.log(
      'ログイン済み:',
      user
    );
  }

  const loginScreen =
    document.getElementById(
      'loginScreen'
    );

  const appContent =
    document.getElementById(
      'appContent'
    );

  if (loginScreen) {
    loginScreen.classList.add(
      'hidden'
    );
  }

  if (appContent) {
    appContent.classList.remove(
      'hidden'
    );
  }
}


