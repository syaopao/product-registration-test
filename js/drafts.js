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

