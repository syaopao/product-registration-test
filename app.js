const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwz2Fi7rCIG8I1ayVh2C0LxxtHVqOARPEWXSUXWccrbhGF6ttWP7gElOl5ofejGZT71/exec';
// ==============================
// Google ログイン
// ==============================

const GOOGLE_CLIENT_ID = '656446276650-coa5rruu2bd1peg75modl245o4bba8up.apps.googleusercontent.com';

let googleIdToken = '';

window.addEventListener('load', () => {
  if (!window.google || !google.accounts || !google.accounts.id) {
    console.error('Google Identity Services の読み込みに失敗しました。');
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredentialResponse,
  });

  const buttonElement = document.getElementById('googleLoginButton');

  if (buttonElement) {
    google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
    });
  }
});

async function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) {
    alert('Googleログインに失敗しました。');
    return;
  }

  googleIdToken = response.credential;

  try {
    const gasResponse = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'login',
        idToken: googleIdToken
      })
    });

    const result = await gasResponse.json();

    if (!result.ok) {
      throw new Error(result.message || 'ログイン確認に失敗しました。');
    }

   console.log('ログイン成功:', result.user);

const loginScreen =
  document.getElementById('loginScreen');

const appContent =
  document.getElementById('appContent');

if (loginScreen) {
  loginScreen.classList.add('hidden');
}

if (appContent) {
  appContent.classList.remove('hidden');
}
    

  } catch (error) {
    console.error(error);
    googleIdToken = '';
    alert('ログイン失敗: ' + error.message);
  }
}



// 共通状態・定数・DOM参照
let barcodeScanner = null;
    let dragSrc = null;
    let touchDragEl = null;
    let touchTimer = null;
    let touchDropTarget = null;
    let suppressThumbClick = false;
    let lightboxImageRef = null;
    let editingDraftId = '';
    let isSending = false;
    let stopSendingRequested = false;
    let draftPreviewUrls = [];
    let lastSavedSnapshot = '';
    let autosaveTimer = null;
    let restoringAutosave = false;
    let lastToastTap = 0;
    let productCameraStream = null;
    let isCapturingProductPhoto = false;
    let captureReleaseTimer = null;  // タイムアウト保険用
    let shutterAudioContext = null;
    const KEEP_SETTING_KEY = 'product-registration-keep-settings';
    const LAST_CONTROL_NUMBER_KEY = 'product-registration-last-control-number';
    const PREVIOUS_FIELDS_KEY = 'product-registration-previous-fields';
    const STAFF_OPTIONS_KEY = 'product-registration-staff-options';
    const SHEET_OPTIONS_KEY = 'product-registration-sheet-options';
    const CATEGORY_OPTIONS_KEY = 'product-registration-category-options';
    const ACCESSORY_OPTIONS_KEY = 'product-registration-accessory-options';
    const GOOGLE_SETTINGS_KEY = 'product-registration-google-settings';
    const LOT_OPTIONS_KEY = 'product-registration-lot-options';
    const LOT_FIXED_KEY = 'product-registration-lot-fixed';
    const AUTOSAVE_DRAFT_ID = '__current_autosave__';
    const AUTOSAVE_DELAY_MS = 900;
    const IMAGE_MAX_SIZE = 1280;
    const IMAGE_JPEG_QUALITY = 0.94;
    const THUMBNAIL_MAX_SIZE = 800;
    const THUMBNAIL_JPEG_QUALITY = 0.92;
    const SHOW_IMAGE_PREVIEWS = true;
    const imageState = { productImages: [] };
    const form = document.getElementById('registrationForm');
    const controlNumberInput = form.elements.controlNumber;
    const lotNumberInput = form.elements.lotNumber;
    const staffNameSelect = document.getElementById('staffNameSelect');
    const sheetNameSelect = document.getElementById('sheetNameSelect');
    const lotNumberOptions = document.getElementById('lotNumberOptions');
    const nextControlNumberRow = document.getElementById('nextControlNumberRow');
    const useNextControlNumberButton = document.getElementById('useNextControlNumberButton');
    const formView = document.getElementById('formView');
    const listView = document.getElementById('listView');
    const formTitle = document.getElementById('formTitle');
    const appHeaderTitle = document.getElementById('appHeaderTitle');
    const headerActions = document.getElementById('headerActions');
    const menuButton = document.getElementById('menuButton');
    const settingsDrawer = document.getElementById('settingsDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerCloseButton = document.getElementById('drawerCloseButton');
    const staffSettingsList = document.getElementById('staffSettingsList');
    const newStaffNameInput = document.getElementById('newStaffNameInput');
    const addStaffButton = document.getElementById('addStaffButton');
    const lotSettingsList = document.getElementById('lotSettingsList');
    const newLotNumberInput = document.getElementById('newLotNumberInput');
    const addLotButton = document.getElementById('addLotButton');
    const fixLotNumberCheckbox = document.getElementById('fixLotNumberCheckbox');
    const sheetSettingsList = document.getElementById('sheetSettingsList');
    const newSheetNameInput = document.getElementById('newSheetNameInput');
    const addSheetButton = document.getElementById('addSheetButton');
    const categorySettingsList = document.getElementById('categorySettingsList');
    const newCategoryNameInput = document.getElementById('newCategoryNameInput');
    const addCategoryButton = document.getElementById('addCategoryButton');
    const accessorySettingsList = document.getElementById('accessorySettingsList');
    const newAccessoryNameInput = document.getElementById('newAccessoryNameInput');
    const addAccessoryButton = document.getElementById('addAccessoryButton');
    const spreadsheetIdInput = document.getElementById('spreadsheetIdInput');
    const driveFolderIdInput = document.getElementById('driveFolderIdInput');
    const saveGoogleSettingsButton = document.getElementById('saveGoogleSettingsButton');
    const copyPreviousFieldsButton = document.getElementById('copyPreviousFieldsButton');
    const resetCopiedFieldsButton = document.getElementById('resetCopiedFieldsButton');
    const message = document.getElementById('message');
    const listMessage = document.getElementById('listMessage');
    const toastMessage = document.getElementById('toastMessage');
    const saveDraftButton = document.getElementById('saveDraftButton');
    const newButton = document.getElementById('newButton');
    const showListButton = document.getElementById('showListButton');
    const sendSelectedButton = document.getElementById('sendSelectedButton');
    const stopSendingButton = document.getElementById('stopSendingButton');
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');
    const selectAllButton = document.getElementById('selectAllButton');
    const backToFormButton = document.getElementById('backToFormButton');
    const draftList = document.getElementById('draftList');
    const barcodeSelect = document.getElementById('barcodeSelect');
    const categorySelect = document.getElementById('categorySelect');
    const classificationInput = document.getElementById('classificationInput');
    const classificationAutocomplete = document.getElementById('classificationAutocomplete');
    const classificationSuggestions = document.getElementById('classificationSuggestions');
    const CLASSIFICATION_OPTIONS = [
      '2DS','3DS LL','3DS','64 DD','64','DS i','DS Lite','DS','New 2DS LL','New 3DS LL','New 3DS',
      'Nintendo Switch Lite','Nintendo Switch','PSP Go','PSP','SP','PS1','PS2','PS3','PS4','PS5',
      'Xbox One S','Xbox One X','Xbox One','アドバンス','カラー','ゲームボーイ','デジタル・エディション',
      'ポケット','ミクロ','メガドライブ','メガドライブ2','通常版'
    ];
    const colorField = document.getElementById('colorField');
    const colorInput = document.getElementById('colorInput');
    const productTitleField = document.getElementById('productTitleField');
    const productTitleInput = document.getElementById('productTitleInput');
    const barcodeSection = document.getElementById('barcodeUploaderSection');
    const barcodeNumber = document.getElementById('barcodeNumber');
    const barcodeCharCount = document.getElementById('barcodeCharCount');
    const barcodeMessage = document.getElementById('barcodeMessage');
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmText = document.getElementById('confirmText');
    const confirmCancelButton = document.getElementById('confirmCancelButton');
    const confirmOkButton = document.getElementById('confirmOkButton');
    const accessorySelect = document.getElementById('accessorySelect');
    const accessoryButton = accessorySelect.querySelector('.multi-button');
    const accessoryMenu = accessorySelect.querySelector('.multi-menu');
    const accessorySummary = document.getElementById('accessorySummary');
    const productCameraInput = document.getElementById('productCameraInput');
    const cameraDialog = document.getElementById('cameraDialog');
    const productCameraVideo = document.getElementById('productCameraVideo');
    const productCameraCanvas = document.getElementById('productCameraCanvas');
    const productCameraCount = document.getElementById('productCameraCount');
    const captureProductCameraButton = document.getElementById('captureProductCameraButton');
    const closeProductCameraButton = document.getElementById('closeProductCameraButton');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxRotateLeft = document.getElementById('lightboxRotateLeft');
    const lightboxRotateRight = document.getElementById('lightboxRotateRight');
    let dbApi = null;

// アプリ内設定・アコーディオン・前回コピー/引継ぎ
    function initLocalSettings() {
      if (!localStorage.getItem(STAFF_OPTIONS_KEY)) localStorage.setItem(STAFF_OPTIONS_KEY, JSON.stringify(['さち', 'えび', 'ぺぺ']));
      if (!localStorage.getItem(SHEET_OPTIONS_KEY)) localStorage.setItem(SHEET_OPTIONS_KEY, JSON.stringify(['リサーチ一覧', 'テスト']));
      if (!localStorage.getItem(CATEGORY_OPTIONS_KEY)) localStorage.setItem(CATEGORY_OPTIONS_KEY, JSON.stringify(['ソフト', '本体', '周辺機器', 'アクセサリー', 'その他']));
      if (!localStorage.getItem(ACCESSORY_OPTIONS_KEY)) localStorage.setItem(ACCESSORY_OPTIONS_KEY, JSON.stringify(['ケースあり', '説明書', 'ハガキ', '帯', 'シール（ ステッカー ）', 'カード', 'チラシ']));
      renderStaffOptions();
      renderSheetOptions();
      renderCategoryOptions();
      renderAccessoryOptions();
      renderLotOptions();
      fixLotNumberCheckbox.checked = getLotFixed();
      renderStaffSettings();
      renderSheetSettings();
      renderCategorySettings();
      renderAccessorySettings();
      renderLotSettings();
      loadGoogleConnectionSettings();
      setAppHeader('商品登録', true);
    }

    function readStringList(key) {
      try {
        const values = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(values) ? values.map(value => String(value || '').trim()).filter(Boolean) : [];
      } catch (error) { return []; }
    }
    function writeStringList(key, values) {
      const unique = Array.from(new Set((values || []).map(value => String(value || '').trim()).filter(Boolean)));
      localStorage.setItem(key, JSON.stringify(unique));
      return unique;
    }
    function getStaffOptions() { return readStringList(STAFF_OPTIONS_KEY); }
    function getSheetOptions() { return readStringList(SHEET_OPTIONS_KEY); }
    function getCategoryOptions() { return readStringList(CATEGORY_OPTIONS_KEY); }
    function getAccessoryOptions() { return readStringList(ACCESSORY_OPTIONS_KEY); }
    function getLotOptions() { return readStringList(LOT_OPTIONS_KEY); }
    function getLotFixed() { return localStorage.getItem(LOT_FIXED_KEY) === '1'; }

    function renderSelectOptions(select, values) {
      const current = select.value;
      select.innerHTML = '<option value="">選択してください</option>';
      values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.append(option);
      });
      if (current && values.includes(current)) select.value = current;
    }
    function renderStaffOptions() { renderSelectOptions(staffNameSelect, getStaffOptions()); }
    function renderSheetOptions() { renderSelectOptions(sheetNameSelect, getSheetOptions()); }
    function renderCategoryOptions() {
      renderSelectOptions(categorySelect, getCategoryOptions());
      updateCategorySection();
    }
    function renderAccessoryOptions(selectedValues) {
      const selected = new Set(Array.isArray(selectedValues) ? selectedValues : getSelectedAccessories());
      accessoryMenu.innerHTML = '';
      getAccessoryOptions().forEach(value => {
        const label = document.createElement('label');
        label.className = 'multi-option';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = value;
        input.checked = selected.has(value);
        label.append(input, document.createTextNode(value));
        accessoryMenu.append(label);
      });
      updateAccessorySummary();
    }
    function renderLotOptions() {
      lotNumberOptions.innerHTML = '';
      getLotOptions().forEach(lot => { const option = document.createElement('option'); option.value = lot; lotNumberOptions.append(option); });
    }
    function renderStaffSettings() {
      staffSettingsList.innerHTML = '';
      const values = getStaffOptions();
      if (!values.length) staffSettingsList.innerHTML = '<div class="hint">登録者がありません。</div>';
      values.forEach(name => staffSettingsList.append(createSettingRow(name, () => {
        writeStringList(STAFF_OPTIONS_KEY, getStaffOptions().filter(value => value !== name));
        if (staffNameSelect.value === name) staffNameSelect.value = '';
        renderStaffOptions(); renderStaffSettings();
      })));
    }
    function renderSheetSettings() {
      sheetSettingsList.innerHTML = '';
      const values = getSheetOptions();
      if (!values.length) sheetSettingsList.innerHTML = '<div class="hint">シート名がありません。</div>';
      values.forEach(name => sheetSettingsList.append(createSettingRow(name, () => {
        writeStringList(SHEET_OPTIONS_KEY, getSheetOptions().filter(value => value !== name));
        if (sheetNameSelect.value === name) sheetNameSelect.value = '';
        renderSheetOptions(); renderSheetSettings();
      })));
    }
    function renderCategorySettings() {
      categorySettingsList.innerHTML = '';
      const values = getCategoryOptions();
      if (!values.length) categorySettingsList.innerHTML = '<div class="hint">カテゴリーがありません。</div>';
      values.forEach(name => categorySettingsList.append(createSettingRow(name, () => {
        writeStringList(CATEGORY_OPTIONS_KEY, getCategoryOptions().filter(value => value !== name));
        if (categorySelect.value === name) categorySelect.value = '';
        renderCategoryOptions(); renderCategorySettings();
      })));
    }
    function renderAccessorySettings() {
      accessorySettingsList.innerHTML = '';
      const values = getAccessoryOptions();
      if (!values.length) accessorySettingsList.innerHTML = '<div class="hint">付属品候補がありません。</div>';
      values.forEach(name => accessorySettingsList.append(createSettingRow(name, () => {
        const selected = getSelectedAccessories().filter(value => value !== name);
        writeStringList(ACCESSORY_OPTIONS_KEY, getAccessoryOptions().filter(value => value !== name));
        renderAccessoryOptions(selected);
        renderAccessorySettings();
        handleFormChanged();
      })));
    }
    function renderLotSettings() {
      lotSettingsList.innerHTML = '';
      const values = getLotOptions();
      if (!values.length) lotSettingsList.innerHTML = '<div class="hint">ロットNo候補はまだありません。</div>';
      values.forEach(lot => lotSettingsList.append(createSettingRow(lot, () => {
        writeStringList(LOT_OPTIONS_KEY, getLotOptions().filter(value => value !== lot));
        renderLotOptions(); renderLotSettings();
      })));
    }
    function createSettingRow(text, onDelete) {
      const row = document.createElement('div'); row.className = 'setting-row';
      const label = document.createElement('span'); label.textContent = text;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'danger'; button.textContent = '削除'; button.addEventListener('click', onDelete);
      row.append(label, button); return row;
    }
    function addStaffFromSettings() {
      const value = String(newStaffNameInput.value || '').trim(); if (!value) return;
      writeStringList(STAFF_OPTIONS_KEY, [...getStaffOptions(), value]); newStaffNameInput.value = ''; renderStaffOptions(); renderStaffSettings();
    }
    function addSheetFromSettings() {
      const value = String(newSheetNameInput.value || '').trim(); if (!value) return;
      writeStringList(SHEET_OPTIONS_KEY, [...getSheetOptions(), value]); newSheetNameInput.value = ''; renderSheetOptions(); renderSheetSettings();
    }
    function addCategoryFromSettings() {
      const value = String(newCategoryNameInput.value || '').trim(); if (!value) return;
      writeStringList(CATEGORY_OPTIONS_KEY, [...getCategoryOptions(), value]); newCategoryNameInput.value = ''; renderCategoryOptions(); renderCategorySettings();
    }
    function addAccessoryFromSettings() {
      const value = String(newAccessoryNameInput.value || '').trim(); if (!value) return;
      const selected = getSelectedAccessories();
      writeStringList(ACCESSORY_OPTIONS_KEY, [...getAccessoryOptions(), value]);
      newAccessoryNameInput.value = '';
      renderAccessoryOptions(selected);
      renderAccessorySettings();
    }
    function addLotFromSettings() {
      const value = String(newLotNumberInput.value || '').trim(); if (!value) return; addLotOption(value, false); newLotNumberInput.value = '';
    }
    function addLotOption(value, moveToTop = false) {
      const lot = String(value || '').trim(); if (!lot) return;
      let values = getLotOptions().filter(item => item !== lot); values = moveToTop ? [lot, ...values] : [...values, lot];
      writeStringList(LOT_OPTIONS_KEY, values); renderLotOptions(); renderLotSettings();
    }
    function getGoogleConnectionSettings() {
      try {
        const value = JSON.parse(localStorage.getItem(GOOGLE_SETTINGS_KEY) || '{}');
        return {
          spreadsheetId: String(value.spreadsheetId || '').trim(),
          driveFolderId: String(value.driveFolderId || '').trim(),
        };
      } catch (error) {
        return { spreadsheetId: '', driveFolderId: '' };
      }
    }
    function isGasRuntime() {
      return !!(window.google && google.script && google.script.run);
    }
    function applyGoogleConnectionSettings(settings) {
      const safe = settings || {};
      spreadsheetIdInput.value = String(safe.spreadsheetId || '').trim();
      driveFolderIdInput.value = String(safe.driveFolderId || '').trim();
      localStorage.setItem(GOOGLE_SETTINGS_KEY, JSON.stringify({
        spreadsheetId: spreadsheetIdInput.value,
        driveFolderId: driveFolderIdInput.value,
      }));
    }
    function loadGoogleConnectionSettings() {
      const localSettings = getGoogleConnectionSettings();
      applyGoogleConnectionSettings(localSettings);
      if (!isGasRuntime()) return;
      google.script.run
        .withSuccessHandler(settings => applyGoogleConnectionSettings(settings))
        .withFailureHandler(error => {
          console.warn('Google接続設定の読込に失敗しました。', error);
        })
        .getConnectionSettings();
    }
    function saveGoogleConnectionSettings() {
      const settings = {
        spreadsheetId: String(spreadsheetIdInput.value || '').trim(),
        driveFolderId: String(driveFolderIdInput.value || '').trim(),
      };
      localStorage.setItem(GOOGLE_SETTINGS_KEY, JSON.stringify(settings));
      if (!isGasRuntime()) {
        showToast('Google接続設定をこの端末に保存しました。', 'success');
        return;
      }
      saveGoogleSettingsButton.disabled = true;
      google.script.run
        .withSuccessHandler(saved => {
          applyGoogleConnectionSettings(saved);
          showToast('Google接続設定をScript Propertiesへ保存しました。', 'success');
          saveGoogleSettingsButton.disabled = false;
        })
        .withFailureHandler(error => {
          showToast('Google接続設定の保存に失敗しました: ' + (error && error.message ? error.message : String(error)), 'error');
          saveGoogleSettingsButton.disabled = false;
        })
        .saveConnectionSettings(settings);
    }
    function buildItemKey(lotNumber, controlNumber) {
      if (!String(lotNumber || '').trim() || !String(controlNumber || '').trim()) return '';
      return `${sanitizeFileName(lotNumber)}_${sanitizeFileName(controlNumber)}`.replace(/_+/g, '_');
    }
    function setAppHeader(title, showActions) {
      appHeaderTitle.textContent = title;
      headerActions.classList.toggle('hidden', !showActions);
    }

    function getDrawerSections() {
      return Array.from(settingsDrawer.querySelectorAll('.drawer-section'));
    }

    function closeAllDrawerSections(exceptSection = null) {
      getDrawerSections().forEach(section => {
        if (section !== exceptSection) section.open = false;
      });
    }

    function setupDrawerAccordion() {
      getDrawerSections().forEach(section => {
        section.open = false;
        section.addEventListener('toggle', () => {
          if (!section.open) return;
          closeAllDrawerSections(section);
          requestAnimationFrame(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
      });
    }

    function resetDrawerAccordion() {
      closeAllDrawerSections();
      const content = settingsDrawer.querySelector('.drawer-content');
      if (content) content.scrollTop = 0;
    }

    function openSettingsDrawer() {
      resetDrawerAccordion();
      settingsDrawer.classList.add('open');
      settingsDrawer.setAttribute('aria-hidden', 'false');
      drawerOverlay.classList.remove('hidden');
      menuButton.setAttribute('aria-expanded', 'true');
      document.body.classList.add('drawer-open');
      renderStaffSettings();
      renderSheetSettings();
      renderCategorySettings();
      renderAccessorySettings();
      renderLotSettings();
      loadGoogleConnectionSettings();
    }

    function closeSettingsDrawer() {
      settingsDrawer.classList.remove('open');
      settingsDrawer.setAttribute('aria-hidden', 'true');
      drawerOverlay.classList.add('hidden');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('drawer-open');
      resetDrawerAccordion();
    }

    function getKeepSettings() {
      try {
        return JSON.parse(localStorage.getItem(KEEP_SETTING_KEY) || '{}');
      } catch (error) {
        return {};
      }
    }

    function loadKeepSettings() {
      const settings = getKeepSettings();
      document.querySelectorAll('[data-keep-field]').forEach(input => {
        input.checked = !!settings[input.dataset.keepField];
      });
    }

    function saveKeepSettings() {
      const settings = {};
      document.querySelectorAll('[data-keep-field]').forEach(input => {
        settings[input.dataset.keepField] = input.checked;
      });
      localStorage.setItem(KEEP_SETTING_KEY, JSON.stringify(settings));
    }

    function getKeptValues() {
      const settings = getKeepSettings();
      const values = {};
      ['sheetName', 'staffName', 'lotNumber', 'category', 'classification', 'itemCondition', 'operationCheck'].forEach(name => {
        if (settings[name] && form[name]) values[name] = form[name].value;
      });
      if (getLotFixed() && form.lotNumber) values.lotNumber = form.lotNumber.value;
      if (settings.barcode && form.barcode && form.barcode.value === '有り') values.barcode = '有り';
      if (settings.accessories) values.accessories = getSelectedAccessories();
      return values;
    }

    function applyKeptValues(values) {
      Object.keys(values || {}).forEach(name => {
        if (name === 'accessories') {
          setSelectedAccessories(values.accessories || []);
        } else if (form[name]) {
          form[name].value = values[name];
        }
      });
      loadKeepSettings();
    }

    function buildPreviousFields(payload) {
      return {
        sheetName: payload.sheetName,
        staffName: payload.staffName,
        lotNumber: payload.lotNumber,
        category: payload.category,
        classification: payload.classification,
        barcode: payload.barcode,
        itemCondition: payload.itemCondition,
        operationCheck: payload.operationCheck,
        accessories: payload.accessories || [],
      };
    }

    function savePreviousFields(payload) {
      const values = buildPreviousFields(payload || collectFormPayload());
      const hasValue = Object.keys(values).some(key => {
        if (key === 'barcode') return false;
        const value = values[key];
        return Array.isArray(value) ? value.length > 0 : String(value || '').trim();
      });
      if (hasValue) localStorage.setItem(PREVIOUS_FIELDS_KEY, JSON.stringify(values));
    }

    function getPreviousFields() {
      try {
        return JSON.parse(localStorage.getItem(PREVIOUS_FIELDS_KEY) || '{}');
      } catch (error) {
        return {};
      }
    }

    function copyPreviousFields() {
      const values = getPreviousFields();
      if (!Object.keys(values).length) {
        showMessage('コピーできる前回の入力内容がありません。', 'error');
        return;
      }
      applyKeptValues(values);
      updateBarcodeSection();
      updateBarcodeCharCount();
      updateCategorySection();
      handleFormChanged();
      showMessage('前回の入力内容をコピーしました。', 'success');
    }

    function resetCopiedFields() {
      ['sheetName', 'staffName', 'lotNumber', 'category', 'classification', 'itemCondition', 'operationCheck'].forEach(name => {
        if (form[name]) form[name].value = '';
      });
      if (form.barcode) form.barcode.value = '無し';
      clearAccessories();
      updateBarcodeSection();
      updateBarcodeCharCount();
      updateCategorySection();
      handleFormChanged();
      showMessage('コピー対象の項目をリセットしました。', 'success');
    }

    function getCurrentSnapshot() {
      const payload = collectFormPayload();
      return JSON.stringify({
        ...payload,
        productImages: imageState.productImages.map(image => ({ name: image.name, size: image.size, rotation: getImageRotation(image) })),
      });
    }

    function hasUnsavedChanges() {
      return getCurrentSnapshot() !== lastSavedSnapshot;
    }

// 下書き保存・保存一覧・一括送信（GASでは本送信／ローカルではモック）
    async function saveCurrentDraft() {
      clearMessage();
      const payload = collectFormPayload();
      const validationError = validate(payload);
      if (validationError) {
        showMessage(validationError.message, 'error');
        scrollToValidationTarget(validationError);
        return false;
      }
      showMessage('保存中...', '');
      saveDraftButton.disabled = true;
      try {
        const now = new Date().toISOString();
        const draftId = editingDraftId || createId();
        const existing = editingDraftId ? await dbApi.getMeta(editingDraftId) : null;
        const draft = {
          draftId,
          sheetName: payload.sheetName,
          staffName: payload.staffName,
          lotNumber: payload.lotNumber,
          controlNumber: payload.controlNumber,
          category: payload.category,
          color: payload.color,
          classification: payload.classification,
          productTitle: payload.productTitle,
          barcode: payload.barcode,
          barcodeNumber: payload.barcodeNumber,
          productImages: imageState.productImages.map(image => ({
            id: image.id || createId(),
            name: image.name,
            type: image.type,
            size: image.size,
            blob: image.blob,
            thumbBlob: image.thumbBlob || null,
            rotation: getImageRotation(image),
          })),
          itemCondition: payload.itemCondition,
          operationCheck: payload.operationCheck,
          damageDetails: payload.damageDetails,
          accessories: payload.accessories,
          notes: payload.notes,
          status: 'saved',
          errorMessage: '',
          createdAt: existing && existing.createdAt ? existing.createdAt : now,
          updatedAt: now,
        };
        await dbApi.put(draft);
        await clearAutosaveDraft();
        editingDraftId = draftId;
        formTitle.textContent = '商品登録 - 編集中';
        setAppHeader('商品登録', true);
        saveDraftButton.textContent = '編集を保存';
        document.getElementById('restoreNotice').classList.add('hidden');
        lastSavedSnapshot = getCurrentSnapshot();
        saveLastControlNumber(payload.controlNumber);
        savePreviousFields(payload);
        updateNextControlNumberSuggestion();
        await updateDraftCountBadge();
        showMessage('保存しました。登録に進めます。', 'success');
        return true;
      } catch (err) {
        showMessage('保存に失敗しました: ' + (err && err.message ? err.message : String(err)), 'error');
        return false;
      } finally {
        saveDraftButton.disabled = false;
      }
    }

    function collectFormPayload() {
      const formData = new FormData(form);
      return {
        draftId: editingDraftId || '',
        sheetName: valueOf(formData, 'sheetName'),
        staffName: valueOf(formData, 'staffName'),
        lotNumber: valueOf(formData, 'lotNumber'),
        controlNumber: valueOf(formData, 'controlNumber'),
        category: valueOf(formData, 'category'),
        color: valueOf(formData, 'color'),
        classification: valueOf(formData, 'classification'),
        productTitle: valueOf(formData, 'productTitle'),
        barcode: valueOf(formData, 'barcode'),
        barcodeNumber: valueOf(formData, 'barcodeNumber'),
        productImages: imageState.productImages,
        itemCondition: valueOf(formData, 'itemCondition'),
        operationCheck: valueOf(formData, 'operationCheck'),
        damageDetails: valueOf(formData, 'damageDetails'),
        accessories: getSelectedAccessories(),
        notes: valueOf(formData, 'notes'),
      };
    }

    function scheduleAutosave() {
      if (restoringAutosave || isSending) return;
      clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(saveAutosaveDraft, AUTOSAVE_DELAY_MS);
    }

    async function saveAutosaveDraft() {
      const payload = collectFormPayload();
      if (!hasAutosaveContent(payload)) {
        await clearAutosaveDraft();
        return;
      }

      const now = new Date().toISOString();
      await dbApi.put({
        draftId: AUTOSAVE_DRAFT_ID,
        sourceDraftId: editingDraftId || '',
        sheetName: payload.sheetName,
        staffName: payload.staffName,
        lotNumber: payload.lotNumber,
        controlNumber: payload.controlNumber,
        category: payload.category,
        color: payload.color,
        classification: payload.classification,
        productTitle: payload.productTitle,
        barcode: payload.barcode,
        barcodeNumber: payload.barcodeNumber,
        productImages: payload.productImages,
        itemCondition: payload.itemCondition,
        operationCheck: payload.operationCheck,
        damageDetails: payload.damageDetails,
        accessories: payload.accessories,
        notes: payload.notes,
        status: 'autosaved',
        errorMessage: '',
        createdAt: now,
        updatedAt: now,
      });
    }

    function hasAutosaveContent(payload) {
      return [
        payload.sheetName,
        payload.staffName,
        payload.lotNumber,
        payload.controlNumber,
        payload.category,
        payload.color,
        payload.classification,
        payload.productTitle,
        payload.barcodeNumber,
        payload.itemCondition,
        payload.operationCheck,
        payload.damageDetails,
        payload.notes,
      ].some(value => String(value || '').trim())
        || (payload.accessories || []).length > 0
        || (payload.productImages || []).length > 0;
    }

    async function clearAutosaveDraft() {
      clearTimeout(autosaveTimer);
      await dbApi.remove(AUTOSAVE_DRAFT_ID).catch(() => {});
    }

    async function promptRecoverAutosave() {
      const draft = await dbApi.getMeta(AUTOSAVE_DRAFT_ID).catch(() => null);
      if (!draft) return;

      const photoCount = (draft.productImages || []).length;
      const itemKey = buildItemKey(draft.lotNumber, draft.controlNumber);
      const controlNumber = draft.controlNumber ? `\n管理番号: ${draft.controlNumber}` : '';
      const lotNumber = draft.lotNumber ? `\nロットNo: ${draft.lotNumber}` : '';
      const photos = photoCount ? `\n撮影済み写真: ${photoCount}枚` : '';
      const shouldRestore = await askConfirm(`前回編集中の商品があります。復元しますか？${lotNumber}${controlNumber}${photos}`);

      if (shouldRestore) {
        await restoreAutosaveDraft(await dbApi.get(AUTOSAVE_DRAFT_ID));
      } else {
        showMessage('復元せずに新規入力を開始できます。入力すると一時保存は新しい内容に更新されます。', '');
      }
    }

    async function restoreAutosaveDraft(draft) {
      restoringAutosave = true;
      try {
        revokeImageUrls('productImages');
        editingDraftId = draft.sourceDraftId || '';
        form.sheetName.value = draft.sheetName || '';
        form.staffName.value = draft.staffName || '';
        form.lotNumber.value = draft.lotNumber || '';
        form.controlNumber.value = draft.controlNumber || '';
        form.category.value = draft.category || '';
        form.color.value = draft.color || '';
        form.classification.value = draft.classification || '';
        form.productTitle.value = draft.productTitle || '';
        form.barcode.value = draft.barcode || '無し';
        form.barcodeNumber.value = draft.barcodeNumber || '';
        updateBarcodeCharCount();
        form.itemCondition.value = draft.itemCondition || '';
        form.operationCheck.value = draft.operationCheck || '';
        form.damageDetails.value = draft.damageDetails || '';
        form.notes.value = draft.notes || '';
        setSelectedAccessories(draft.accessories || []);
        imageState.productImages = (draft.productImages || []).map(image => ({
          ...image,
          previewUrl: image.thumbBlob ? URL.createObjectURL(image.thumbBlob) : '',
        }));
        updateBarcodeSection();
        updateCategorySection();
        renderPreview('productImages');
        const isRestoringNew = !editingDraftId;
        formTitle.textContent = isRestoringNew ? '商品登録' : '商品登録 - 編集中';
        setAppHeader('商品登録', true);
        document.getElementById('restoreNotice').classList.toggle('hidden', !isRestoringNew);
        saveDraftButton.textContent = editingDraftId ? '編集を保存' : '保存';
        listView.classList.add('hidden');
        formView.classList.remove('hidden');
        lastSavedSnapshot = getCurrentSnapshot();
        showToast('前回編集中の商品を復元しました。', 'success');
      } finally {
        restoringAutosave = false;
      }
    }

    async function showDraftList() {
      clearMessage();
      closeSettingsDrawer();
      setAppHeader('保存一覧', false);
      clearListMessage();
      formView.classList.add('hidden');
      listView.classList.remove('hidden');
      await renderDraftList();
    }

    async function renderDraftList() {
      clearDraftPreviewUrls();
      const drafts = (await dbApi.getAll())
        .filter(draft => draft.draftId !== AUTOSAVE_DRAFT_ID);
      updateDraftCountBadge(drafts.length);
      draftList.innerHTML = '';
      if (!drafts.length) {
        draftList.innerHTML = '<section><div class="hint">保存されている商品はありません。</div></section>';
        syncSendingControls();
        return;
      }
      for (const draft of drafts) {
        const card = document.createElement('section');
        card.className = 'draft-card';
        const head = document.createElement('div');
        head.className = 'draft-head';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'draft-check';
        checkbox.dataset.draftId = draft.draftId;
        checkbox.disabled = isSending || draft.status === 'sending';
        checkbox.addEventListener('change', syncSendingControls);
        const photo = document.createElement('div');
        photo.className = 'draft-photo';
        const firstImage = (draft.productImages || [])[0];
        if (firstImage && firstImage.thumbBlob) {
          const previewUrl = URL.createObjectURL(firstImage.thumbBlob);
          draftPreviewUrls.push(previewUrl);
          const img = document.createElement('img');
          img.src = previewUrl;
          img.alt = '商品画像';
          applyImageRotationStyle(img, firstImage);
          photo.append(img);
        } else {
          photo.textContent = (draft.productImages || []).length ? '写真あり' : '写真なし';
        }
        const body = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'draft-title';
        title.textContent = buildItemKey(draft.lotNumber, draft.controlNumber) || draft.controlNumber || '管理番号なし';
        const meta = document.createElement('div');
        meta.className = 'draft-meta';
        [
          draft.staffName ? `担当 ${draft.staffName}` : '担当未設定',
          draft.lotNumber ? `ロット ${draft.lotNumber}` : 'ロット未設定',
          draft.classification || '分類未設定',
          `写真 ${(draft.productImages || []).length}枚`,
        ].forEach(text => {
          const chip = document.createElement('span');
          chip.className = 'meta-chip';
          chip.textContent = text;
          meta.append(chip);
        });
        body.append(title, meta);
        if (draft.errorMessage) {
          const error = document.createElement('div');
          error.className = 'message error';
          error.textContent = draft.errorMessage;
          body.append(error);
        }
        head.append(checkbox, photo, body);
        const actions = document.createElement('div');
        actions.className = 'row-actions';
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'secondary';
        editButton.textContent = '編集する';
        editButton.disabled = isSending;
        editButton.addEventListener('click', () => loadDraftForEdit(draft.draftId));
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'danger';
        deleteButton.textContent = '削除';
        deleteButton.disabled = isSending;
        deleteButton.addEventListener('click', async () => {
          if (!await askConfirm(`${buildItemKey(draft.lotNumber, draft.controlNumber) || draft.controlNumber || 'この商品'}を削除しますか？`)) return;
          await dbApi.remove(draft.draftId);
          await updateDraftCountBadge();
          await renderDraftList();
        });
        actions.append(editButton, deleteButton);
        card.append(head, actions);
        draftList.append(card);
      }
      syncSendingControls();
    }

    async function loadDraftForEdit(draftId) {
      const draft = await dbApi.get(draftId);
      if (!draft) {
        showListMessage('保存データが見つかりませんでした。', 'error');
        return;
      }
      await clearAutosaveDraft();
      revokeImageUrls('productImages');
      editingDraftId = draft.draftId;
      form.sheetName.value = draft.sheetName || '';
      form.staffName.value = draft.staffName || '';
      form.lotNumber.value = draft.lotNumber || '';
      form.controlNumber.value = draft.controlNumber || '';
      form.category.value = draft.category || '';
      form.color.value = draft.color || '';
      form.classification.value = draft.classification || '';
      form.productTitle.value = draft.productTitle || '';
      form.barcode.value = draft.barcode || '無し';
      form.barcodeNumber.value = draft.barcodeNumber || '';
      updateBarcodeCharCount();
      form.itemCondition.value = draft.itemCondition || '';
      form.operationCheck.value = draft.operationCheck || '';
      form.damageDetails.value = draft.damageDetails || '';
      form.notes.value = draft.notes || '';
      setSelectedAccessories(draft.accessories || []);
      imageState.productImages = (draft.productImages || []).map(image => ({
        ...image,
        previewUrl: image.thumbBlob ? URL.createObjectURL(image.thumbBlob) : '',
      }));
      updateBarcodeSection();
      updateBarcodeCharCount();
      updateCategorySection();
      renderPreview('productImages');
      formTitle.textContent = '商品登録 - 編集中';
        setAppHeader('商品登録', true);
      saveDraftButton.textContent = '編集を保存';
      document.getElementById('restoreNotice').classList.add('hidden');
      listView.classList.add('hidden');
      formView.classList.remove('hidden');
      lastSavedSnapshot = getCurrentSnapshot();
      showMessage('保存データを編集中です。', 'success');
    }

    async function startNewRegistration() {
      if (hasUnsavedChanges()) {
        const shouldSave = await askConfirm('まだ保存していない変更があります。保存してから登録に進みますか？');
        if (!shouldSave) return;
        const saved = await saveCurrentDraft();
        if (!saved) return;
      }
      await resetForNextRegistration();
    }

    async function resetForNextRegistration() {
      await stopBarcodeScan(false);
      await clearAutosaveDraft();
      savePreviousFields(collectFormPayload());
      const keptValues = getKeptValues();
      const previousControlNumber = String(form.controlNumber.value || '').trim();
      editingDraftId = '';
      form.reset();
      revokeImageUrls('productImages');
      imageState.productImages = [];
      renderPreview('productImages');
      clearAccessories();
      applyKeptValues(keptValues);
      updateBarcodeSection();
      updateBarcodeCharCount();
      updateCategorySection();
      formTitle.textContent = '商品登録';
      setAppHeader('商品登録', true);
      saveDraftButton.textContent = '保存';
      document.getElementById('restoreNotice').classList.add('hidden');
      listView.classList.add('hidden');
      formView.classList.remove('hidden');
      clearMessage();
      if (previousControlNumber) saveLastControlNumber(previousControlNumber);
      updateControlNumberPlaceholder();
      updateNextControlNumberSuggestion();
      scrollToFormTop();
      lastSavedSnapshot = getCurrentSnapshot();
    }

    function showCurrentForm() {
      clearListMessage();
      setAppHeader('商品登録', true);
      listView.classList.add('hidden');
      formView.classList.remove('hidden');
      scrollToFormTop();
    }

    function saveLastControlNumber(value) {
      const controlNumber = String(value || '').trim();
      if (controlNumber) localStorage.setItem(LAST_CONTROL_NUMBER_KEY, controlNumber);
    }

    function getLastControlNumber() {
      return localStorage.getItem(LAST_CONTROL_NUMBER_KEY) || '';
    }

    function updateControlNumberPlaceholder() {
      if (controlNumberInput.value) return;
      const lastControlNumber = getLastControlNumber();
      controlNumberInput.placeholder = lastControlNumber
        ? `前回の登録番号: ${lastControlNumber}`
        : '';
    }

    function getNextControlNumber() {
      const lastControlNumber = getLastControlNumber();
      const match = String(lastControlNumber || '').match(/^(.*?)(\d+)$/);
      if (!match) return '';
      const prefix = match[1];
      const numberPart = match[2];
      const nextNumber = String(Number(numberPart) + 1).padStart(numberPart.length, '0');
      return `${prefix}${nextNumber}`;
    }

    function updateNextControlNumberSuggestion() {
      const nextControlNumber = getNextControlNumber();
      const shouldShow = !!nextControlNumber && !String(controlNumberInput.value || '').trim();
      nextControlNumberRow.classList.toggle('hidden', !shouldShow);
      useNextControlNumberButton.textContent = nextControlNumber ? `${nextControlNumber}を使う` : '';
    }

    function useNextControlNumber() {
      const nextControlNumber = getNextControlNumber();
      if (!nextControlNumber) return;
      controlNumberInput.value = nextControlNumber;
      updateNextControlNumberSuggestion();
      handleFormChanged();
      controlNumberInput.blur();
      useNextControlNumberButton.blur();
    }

    async function updateDraftCountBadge(count) {
      let draftCount = count;
      if (draftCount === undefined) {
        try {
          draftCount = await dbApi.countSaved();
        } catch (error) {
          draftCount = 0;
        }
      }
      showListButton.textContent = draftCount ? `保存一覧 ${draftCount}` : '保存一覧';
    }

    function scrollToFormTop() {
      const scroll = () => {
        const scrollingElement = document.scrollingElement || document.documentElement || document.body;
        if (scrollingElement) scrollingElement.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        formTitle.scrollIntoView({ block: 'start', behavior: 'smooth' });
      };
      requestAnimationFrame(scroll);
      setTimeout(scroll, 80);
      setTimeout(scroll, 250);
    }

    function scrollToValidationTarget(validationError) {
      const target = getValidationTarget(validationError && validationError.field);
      if (!target) return;
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        setTimeout(() => target.focus({ preventScroll: true }), 250);
      });
    }

    function getValidationTarget(fieldName) {
      if (fieldName === 'productImages') {
        return document.querySelector('[data-uploader="productImages"] .drop-zone');
      }
      if (fieldName === 'accessories') {
        return accessoryButton;
      }
      return fieldName && form[fieldName] ? form[fieldName] : null;
    }


    async function selectAllDrafts() {
      const checks = draftList.querySelectorAll('.draft-check:not(:disabled)');
      const allChecked = Array.from(checks).every(input => input.checked);
      checks.forEach(input => {
        input.checked = !allChecked;
      });
      syncSendingControls();
    }

    async function deleteSelectedDrafts() {
      if (isSending) return;
      const selectedIds = Array.from(draftList.querySelectorAll('.draft-check:checked')).map(input => input.dataset.draftId);
      if (!selectedIds.length) {
        showListMessage('消去する商品を選択してください。', 'error');
        return;
      }
      if (!await askConfirm(`選択した${selectedIds.length}件の商品を消去しますか？`)) return;
      await Promise.all(selectedIds.map(id => dbApi.remove(id)));
      await updateDraftCountBadge();
      await renderDraftList();
      showListOnlyToast(`${selectedIds.length}件を消去しました。`, 'success');
    }

    async function sendSelectedDrafts() {
      if (isSending) return;
      let selectedIds = Array.from(draftList.querySelectorAll('.draft-check:checked')).map(input => input.dataset.draftId);
      if (!selectedIds.length) {
        showListMessage('送信する商品を選択してください。', 'error');
        return;
      }
      const selectedDrafts = await Promise.all(selectedIds.map(id => dbApi.getMeta(id)));
      selectedIds = selectedDrafts
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt || a.updatedAt || 0).getTime() - new Date(b.createdAt || b.updatedAt || 0).getTime())
        .map(draft => draft.draftId);
      if (!selectedIds.length) {
        showListMessage('送信できる商品がありません。', 'error');
        return;
      }
      if (!await askConfirm(`選択した${selectedIds.length}件の商品を送信しますか？`)) return;
      isSending = true;
      stopSendingRequested = false;
      syncSendingControls();
      let successCount = 0;
      let failCount = 0;
      let stoppedCount = 0;
      for (let index = 0; index < selectedIds.length; index++) {
        if (stopSendingRequested) {
          stoppedCount = selectedIds.length - index;
          break;
        }
        const draftId = selectedIds[index];
        const draft = await dbApi.get(draftId);
        if (!draft) continue;
        await dbApi.updateMeta({ ...draft, status: 'sending', errorMessage: '', updatedAt: new Date().toISOString() });
        await renderDraftList();
        showListMessage(`送信中 ${index + 1} / ${selectedIds.length}: ${buildItemKey(draft.lotNumber, draft.controlNumber) || draft.controlNumber}`, '');
        try {
          await submitDraft(draft);
          addLotOption(draft.lotNumber, true);
          savePreviousFields(draft);
          await dbApi.remove(draftId);
          successCount++;
        } catch (error) {
          failCount++;
          const latest = await dbApi.getMeta(draftId);
          if (latest) {
            await dbApi.updateMeta({
              ...latest,
              status: 'failed',
              errorMessage: error && error.message ? error.message : '送信に失敗しました。',
              updatedAt: new Date().toISOString(),
            });
          }
        }
        await renderDraftList();
      }
      isSending = false;
      stopSendingRequested = false;
      syncSendingControls();
      await renderDraftList();
      if (stoppedCount) showListOnlyToast(`送信を停止しました。成功${successCount}件、失敗${failCount}件、未送信${stoppedCount}件。未送信分は保存一覧に残っています。`, 'error');
      else if (failCount) showListOnlyToast(`送信完了: 成功${successCount}件、失敗${failCount}件。失敗分は保存一覧に残っています。`, 'error');
      else showListOnlyToast(`送信完了: ${successCount}件登録しました。`, 'success');
    }

    function requestStopSending() {
      if (!isSending) return;
      stopSendingRequested = true;
      stopSendingButton.disabled = true;
      stopSendingButton.textContent = '停止中...';
      showListMessage('送信停止を受け付けました。現在送信中の商品が終わったら停止します。', 'error');
    }

    function syncSendingControls() {
      const hasSelection = !!draftList.querySelector('.draft-check:checked');
      sendSelectedButton.classList.toggle('hidden', isSending || !hasSelection);
      stopSendingButton.classList.toggle('hidden', !isSending);
      stopSendingButton.disabled = stopSendingRequested;
      stopSendingButton.textContent = stopSendingRequested ? '停止中...' : '停止';
      deleteSelectedButton.classList.toggle('hidden', isSending || !hasSelection);
      deleteSelectedButton.disabled = isSending;
      selectAllButton.disabled = isSending;
      showListButton.disabled = isSending;
    }

    async function submitDraft(draft) {
      await callSubmitRegistration(await draftToSubmitPayload(draft));
    }

    async function draftToSubmitPayload(draft) {
      const productImages = [];
      for (let index = 0; index < (draft.productImages || []).length; index++) {
        productImages.push(await imageToPayloadImage(draft.productImages[index], draft.lotNumber, draft.controlNumber, index));
      }
      return {
        draftId: draft.draftId,
        sheetName: draft.sheetName,
        staffName: draft.staffName,
        lotNumber: draft.lotNumber,
        controlNumber: draft.controlNumber,
        category: draft.category,
        color: draft.color,
        classification: draft.classification,
        productTitle: draft.productTitle,
        barcode: draft.barcode,
        barcodeNumber: draft.barcodeNumber,
        productImages,
        itemCondition: draft.itemCondition,
        operationCheck: draft.operationCheck,
        damageDetails: draft.damageDetails,
        accessories: draft.accessories,
        notes: draft.notes,
      };
    }

    async function imageToPayloadImage(image, lotNumber, controlNumber, index) {
      if (!(image.blob instanceof Blob)) {
        throw new Error('画像データが見つかりません。');
      }
      const submitBlob = await rotateImageBlob(image.blob, getImageRotation(image));
      return {
        name: buildImageFileName(lotNumber, controlNumber, submitBlob.type || image.type, index),
        type: submitBlob.type || image.type,
        size: submitBlob.size,
        dataUrl: await blobToDataUrl(submitBlob),
      };
    }

    function buildImageFileName(lotNumber, controlNumber, mimeType, index) {
      const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
      const itemKey = buildItemKey(lotNumber, controlNumber) || sanitizeFileName(controlNumber) || 'item';
      return `${itemKey}_${index + 1}.${ext}`;
    }

    function blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('画像を送信用に変換できませんでした。'));
        reader.readAsDataURL(blob);
      });
    }

   

async function callSubmitRegistration(payload) {
  if (!googleIdToken) {
    throw new Error('Googleログインが必要です。');
  }

  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'submitRegistration',
      idToken: googleIdToken,
      payload: payload
    })
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.message || 'GAS送信に失敗しました。');
  }

  return result;
}



// 起動処理・イベント配線
    function init() {
      initLocalSettings();
      setupDrawerAccordion();
      loadKeepSettings();
      updateControlNumberPlaceholder();
      updateNextControlNumberSuggestion();
      updateDraftCountBadge();
      controlNumberInput.addEventListener('focus', () => {
        controlNumberInput.placeholder = '';
      });
      controlNumberInput.addEventListener('input', updateNextControlNumberSuggestion);
      controlNumberInput.addEventListener('blur', () => {
        updateControlNumberPlaceholder();
        updateNextControlNumberSuggestion();
      });
      useNextControlNumberButton.addEventListener('click', useNextControlNumber);
      copyPreviousFieldsButton.addEventListener('click', copyPreviousFields);
      resetCopiedFieldsButton.addEventListener('click', resetCopiedFields);
      menuButton.addEventListener('click', openSettingsDrawer);
      drawerCloseButton.addEventListener('click', closeSettingsDrawer);
      drawerOverlay.addEventListener('click', closeSettingsDrawer);
      addStaffButton.addEventListener('click', addStaffFromSettings);
      newStaffNameInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addStaffFromSettings(); } });
      addLotButton.addEventListener('click', addLotFromSettings);
      newLotNumberInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addLotFromSettings(); } });
      addSheetButton.addEventListener('click', addSheetFromSettings);
      newSheetNameInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addSheetFromSettings(); } });
      addCategoryButton.addEventListener('click', addCategoryFromSettings);
      newCategoryNameInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addCategoryFromSettings(); } });
      addAccessoryButton.addEventListener('click', addAccessoryFromSettings);
      newAccessoryNameInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addAccessoryFromSettings(); } });
      saveGoogleSettingsButton.addEventListener('click', saveGoogleConnectionSettings);
      fixLotNumberCheckbox.addEventListener('change', () => localStorage.setItem(LOT_FIXED_KEY, fixLotNumberCheckbox.checked ? '1' : '0'));
      barcodeSelect.addEventListener('change', updateBarcodeSection);
      barcodeNumber.addEventListener('input', updateBarcodeCharCount);
      categorySelect.addEventListener('change', updateCategorySection);
      classificationInput.addEventListener('focus', () => renderClassificationSuggestions(classificationInput.value));
      classificationInput.addEventListener('input', () => renderClassificationSuggestions(classificationInput.value));
      classificationInput.addEventListener('keydown', handleClassificationKeydown);
      document.querySelectorAll('[data-keep-field]').forEach(input => input.addEventListener('change', saveKeepSettings));
      form.addEventListener('input', handleFormChanged);
      form.addEventListener('change', handleFormChanged);
      updateBarcodeSection();
      updateBarcodeCharCount();
      updateCategorySection();
      lastSavedSnapshot = getCurrentSnapshot();
      document.addEventListener('dragover', preventWindowDrop);
      document.addEventListener('drop', preventWindowDrop);
      document.getElementById('startBarcodeScanButton').addEventListener('click', toggleBarcodeScan);
      document.getElementById('barcodeImageInput').addEventListener('change', scanBarcodeImageFile);
      document.getElementById('clearBarcodeButton').addEventListener('click', () => {
        barcodeNumber.value = '';
        updateBarcodeCharCount();
        showBarcodeMessage('バーコード番号をクリアしました。');
      });
      accessoryButton.addEventListener('click', () => {
        const expanded = accessoryButton.getAttribute('aria-expanded') === 'true';
        const willOpen = !expanded;
        accessoryButton.setAttribute('aria-expanded', String(willOpen));
        accessoryMenu.classList.toggle('hidden', !willOpen);
        if (willOpen) positionAccessoryMenu();
      });
      window.addEventListener('resize', () => {
        if (!accessoryMenu.classList.contains('hidden')) positionAccessoryMenu();
      });
      window.addEventListener('scroll', () => {
        if (!accessoryMenu.classList.contains('hidden')) positionAccessoryMenu();
      }, { passive: true });
      accessoryMenu.addEventListener('change', event => { if (event.target && event.target.matches('input[type="checkbox"]')) updateAccessorySummary(); });
      document.addEventListener('click', event => {
        if (!accessorySelect.contains(event.target)) {
          accessoryButton.setAttribute('aria-expanded', 'false');
          accessoryMenu.classList.add('hidden');
        }
        if (!classificationAutocomplete.contains(event.target)) {
          closeClassificationSuggestions();
        }
      });
      document.querySelectorAll('[data-uploader]').forEach(setupUploader);
      form.addEventListener('submit', event => event.preventDefault());
      saveDraftButton.addEventListener('click', saveCurrentDraft);
      newButton.addEventListener('click', startNewRegistration);
      showListButton.addEventListener('click', showDraftList);
      sendSelectedButton.addEventListener('click', sendSelectedDrafts);
      stopSendingButton.addEventListener('click', requestStopSending);
      deleteSelectedButton.addEventListener('click', deleteSelectedDrafts);
      selectAllButton.addEventListener('click', selectAllDrafts);
      backToFormButton.addEventListener('click', showCurrentForm);
      document.getElementById('cameraLabel').addEventListener('click', startProductCamera);
      captureProductCameraButton.addEventListener('click', captureProductCameraFrame);
      closeProductCameraButton.addEventListener('click', stopProductCamera);
      productCameraInput.addEventListener('change', async () => {
        await addFiles('productImages', productCameraInput.files);
        productCameraInput.value = '';
      });
      document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
      lightboxRotateLeft.addEventListener('click', event => {
        event.stopPropagation();
        rotateLightboxImage(-1);
      });
      lightboxRotateRight.addEventListener('click', event => {
        event.stopPropagation();
        rotateLightboxImage(1);
      });
      lightbox.addEventListener('click', event => {
        if (event.target === lightbox) closeLightbox();
      });
      toastMessage.addEventListener('dblclick', clearToast);
      toastMessage.addEventListener('touchend', handleToastTouchEnd);
      confirmDialog.addEventListener('click', event => {
        if (event.target === confirmDialog) closeConfirmDialog(false);
      });
      setTimeout(updateDraftCountBadge, 0);
      setTimeout(promptRecoverAutosave, 0);
    }

    function positionAccessoryMenu() {
      accessoryMenu.classList.remove('open-up');
      const rect = accessoryButton.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const spaceBelow = viewportHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const desiredHeight = Math.min(360, Math.max(180, accessoryMenu.scrollHeight || 360));
      if (spaceBelow < desiredHeight && spaceAbove > spaceBelow) {
        accessoryMenu.classList.add('open-up');
      }
    }


    function handleFormChanged() {
      saveKeepSettings();
      scheduleAutosave();
    }


    function askConfirm(text) {
      confirmText.textContent = text;
      confirmDialog.classList.remove('hidden');
      confirmOkButton.focus();

      return new Promise(resolve => {
        confirmResolver = resolve;
        confirmCancelButton.onclick = () => closeConfirmDialog(false);
        confirmOkButton.onclick = () => closeConfirmDialog(true);
      });
    }

    function closeConfirmDialog(result) {
      if (!confirmResolver) return;
      const resolve = confirmResolver;
      confirmResolver = null;
      confirmDialog.classList.add('hidden');
      confirmCancelButton.onclick = null;
      confirmOkButton.onclick = null;
      resolve(result);
    }

    dbApi = createDraftDb();
    init();
