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

