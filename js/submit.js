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
  if (!sessionToken) {
    throw new Error('ログインが必要です。');
  }

  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'submitRegistration',
      sessionToken: sessionToken,
      payload: payload
    })
  });

  const result = await response.json();

  if (!result.ok) {
    const message = String(result.message || '');

    if (
      message.includes('セッション') ||
      message.includes('ログインの有効期限')
    ) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionToken = '';
    }

    throw new Error(result.message || 'GAS送信に失敗しました。');
  }

  return result;
}




