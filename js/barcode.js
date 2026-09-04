// 登録フォームUI・バーコード・付属品・入力検証
    function renderClassificationSuggestions(query = '') {
      const normalized = String(query || '').trim().toLowerCase();
      const matches = normalized
        ? CLASSIFICATION_OPTIONS.filter(value => value.toLowerCase().includes(normalized))
        : CLASSIFICATION_OPTIONS.slice();

      classificationSuggestions.innerHTML = '';
      if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'autocomplete-empty';
        empty.textContent = '候補なし（そのまま手入力できます）';
        classificationSuggestions.appendChild(empty);
      } else {
        matches.forEach(value => {
          const option = document.createElement('button');
          option.type = 'button';
          option.className = 'autocomplete-option';
          option.setAttribute('role', 'option');
          option.textContent = value;
          option.addEventListener('pointerdown', event => event.preventDefault());
          option.addEventListener('click', () => selectClassification(value));
          classificationSuggestions.appendChild(option);
        });
      }
      classificationSuggestions.classList.remove('hidden');
      classificationInput.setAttribute('aria-expanded', 'true');
    }

    function selectClassification(value) {
      classificationInput.value = value;
      classificationInput.dispatchEvent(new Event('input', { bubbles: true }));
      classificationInput.dispatchEvent(new Event('change', { bubbles: true }));
      closeClassificationSuggestions();
      classificationInput.focus();
    }

    function closeClassificationSuggestions() {
      classificationSuggestions.classList.add('hidden');
      classificationInput.setAttribute('aria-expanded', 'false');
    }

    function handleClassificationKeydown(event) {
      if (event.key === 'Escape') {
        closeClassificationSuggestions();
        return;
      }
      if (event.key === 'ArrowDown' && classificationSuggestions.classList.contains('hidden')) {
        event.preventDefault();
        renderClassificationSuggestions(classificationInput.value);
      }
    }


    function updateCategorySection() {
      const needsColor = categorySelect.value && categorySelect.value !== 'ソフト';
      colorField.classList.toggle('hidden', !needsColor);
      colorInput.required = needsColor;
      if (!needsColor) colorInput.value = '';
    }

    function updateBarcodeSection() {
      const visible = barcodeSelect.value === '有り';
      barcodeSection.classList.toggle('hidden', !visible);
      productTitleField.classList.remove('hidden');
      productTitleInput.required = false;
      barcodeNumber.required = visible;
      if (!visible) {
        barcodeNumber.value = '';
        updateBarcodeCharCount();
        stopBarcodeScan(false);
        showBarcodeMessage('カメラで読めない場合は写真から読み取り、それでも難しい場合は手入力してください。');
      }
    }

    function toggleBarcodeScan() {
      if (barcodeScanner) stopBarcodeScan(true);
      else startBarcodeScan();
    }

    async function startBarcodeScan() {
      if (!window.Html5Qrcode || !window.Html5QrcodeSupportedFormats) {
        showBarcodeMessage('この端末では読み取り機能を読み込めませんでした。手入力してください。', 'error');
        return;
      }
      showBarcodeMessage('カメラ起動中...');
      if (barcodeScanner) await stopBarcodeScan(false);
      document.getElementById('startBarcodeScanButton').textContent = 'カメラ停止';
      document.getElementById('startBarcodeScanButton').classList.add('secondary');
      barcodeScanner = new Html5Qrcode('barcodeReader', { formatsToSupport: getBarcodeFormats() });
      barcodeScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 300, height: 90 }, aspectRatio: 1.777 },
        async decodedText => {
          barcodeNumber.value = decodedText;
          updateBarcodeCharCount();
          showBarcodeMessage(`読み取り成功: ${decodedText}`, 'success');
          await stopBarcodeScan(false);
        },
        () => {}
      ).catch(error => {
        showBarcodeMessage(`カメラを起動できませんでした。手入力してください。${error}`, 'error');
      });
    }

    async function stopBarcodeScan(showStoppedMessage = true) {
      if (!barcodeScanner) {
        if (showStoppedMessage) showBarcodeMessage('カメラは起動していません。');
        return;
      }
      await barcodeScanner.stop().catch(() => {});
      await barcodeScanner.clear();
      barcodeScanner = null;
      const btn = document.getElementById('startBarcodeScanButton');
      if (btn) { btn.innerHTML = 'カメラで<br>読み取る'; btn.classList.remove('secondary'); }
      if (showStoppedMessage) showBarcodeMessage('カメラを停止しました。');
    }

    async function scanBarcodeImageFile(event) {
      const file = event.target.files && event.target.files[0];
      event.target.value = '';
      if (!file) return;
      if (!window.Html5Qrcode || !window.Html5QrcodeSupportedFormats) {
        showBarcodeMessage('この端末では写真読み取り機能を読み込めませんでした。手入力してください。', 'error');
        return;
      }
      await stopBarcodeScan(false);
      showBarcodeMessage('写真から読み取り中...');
      const imageScanner = new Html5Qrcode('barcodeReader', { formatsToSupport: getBarcodeFormats() });
      imageScanner.scanFile(file, true)
        .then(decodedText => {
          barcodeNumber.value = decodedText;
          updateBarcodeCharCount();
          showBarcodeMessage(`写真から読み取り成功: ${decodedText}`, 'success');
        })
        .catch(() => {
          showBarcodeMessage('写真から読み取れませんでした。手入力してください。', 'error');
        })
        .finally(async () => {
          await imageScanner.clear().catch(() => {});
        });
    }

    function getBarcodeFormats() {
      return [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
      ];
    }

    function getSelectedAccessories() {
      return Array.from(accessoryMenu.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
    }

    function setSelectedAccessories(values) {
      const selected = Array.isArray(values)
        ? values
        : String(values || '').split(',').map(value => value.trim()).filter(Boolean);
      accessoryMenu.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = selected.includes(input.value);
      });
      updateAccessorySummary();
    }

    function updateAccessorySummary() {
      const selected = getSelectedAccessories();
      accessorySummary.textContent = selected.length ? selected.join('、') : '選択してください';
    }

    function clearAccessories() {
      accessoryMenu.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = false;
      });
      updateAccessorySummary();
      accessoryButton.setAttribute('aria-expanded', 'false');
      accessoryMenu.classList.add('hidden');
    }

    function validate(payload) {
      if (!payload.sheetName) return { message: 'シート名を入力してください。', field: 'sheetName' };
      if (!payload.staffName) return { message: '登録担当者を入力してください。', field: 'staffName' };
      if (!payload.lotNumber) return { message: 'ロットNoを入力してください。', field: 'lotNumber' };
      if (!payload.controlNumber) return { message: '管理番号を入力してください。', field: 'controlNumber' };
      if (!payload.category) return { message: 'カテゴリーを選択してください。', field: 'category' };
      if (payload.category !== 'ソフト' && !payload.color) return { message: 'ソフト以外の場合はカラーを入力してください。', field: 'color' };
      if (!payload.classification) return { message: '分類を入力してください。', field: 'classification' };
      if (payload.barcode === '有り' && !payload.barcodeNumber) return { message: 'バーコード番号を入力してください。', field: 'barcodeNumber' };
      if (payload.productImages.length === 0) return { message: '商品画像を追加してください。', field: 'productImages' };
      if (!payload.itemCondition) return { message: '商品状態を選択してください。', field: 'itemCondition' };
      if (!payload.operationCheck) return { message: '動作確認を選択してください。', field: 'operationCheck' };
      return null;
    }

    function valueOf(formData, key) {
      return String(formData.get(key) || '').trim();
    }

    function createId() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return `draft_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }

    function sanitizeFileName(value) {
      return String(value || 'item')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[\\/:*?"<>|#%{}~&()（）]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 120) || 'item';
    }

    function statusLabel(status) {
      const labels = { saved: '保存済み', sending: '送信中', failed: '送信失敗', sent: '送信済み' };
      return labels[status] || '保存済み';
    }

    function formatDate(value) {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function showMessage(text, type) {
      message.textContent = text;
      message.className = `message ${type || ''}`;
      showToast(text, type);
    }

    function clearMessage() {
      message.textContent = '';
      message.className = 'message';
      clearToast();
    }

    function showListMessage(text, type) {
      listMessage.textContent = text;
      listMessage.className = `message ${type || ''}`;
      showToast(text, type);
    }

    function showListOnlyToast(text, type) {
      listMessage.textContent = '';
      listMessage.className = 'message';
      showToast(text, type);
    }

    function clearListMessage() {
      listMessage.textContent = '';
      listMessage.className = 'message';
      clearToast();
    }

    function showToast(text, type) {
      toastMessage.textContent = text;
      toastMessage.className = type || '';
    }

    function clearToast() {
      toastMessage.textContent = '';
      toastMessage.className = '';
    }

    function handleToastTouchEnd() {
      if (!toastMessage.textContent) return;
      const now = Date.now();
      if (now - lastToastTap < 420) {
        clearToast();
        lastToastTap = 0;
        return;
      }
      lastToastTap = now;
    }

    function showBarcodeMessage(text, type = '') {
      barcodeMessage.textContent = text;
      barcodeMessage.className = type ? `hint message ${type}` : 'hint';
    }

    function updateBarcodeCharCount() {
      const count = Array.from(barcodeNumber.value.trim()).length;
      barcodeCharCount.textContent = `${count} / 13桁`;
      barcodeCharCount.classList.toggle('valid', count === 13);
    }
