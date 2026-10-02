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
