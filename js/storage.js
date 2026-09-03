// IndexedDB（下書き・画像保存）
    function createDraftDb() {
      const dbName = 'product-registration-drafts';
      const draftStoreName = 'drafts';
      const imageStoreName = 'draftImages';
      let dbPromise = null;
      function open() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName, 2);
          request.onupgradeneeded = () => {
            const db = request.result;
            let draftStore;
            if (!db.objectStoreNames.contains(draftStoreName)) {
              draftStore = db.createObjectStore(draftStoreName, { keyPath: 'draftId' });
              draftStore.createIndex('createdAt', 'createdAt');
              draftStore.createIndex('updatedAt', 'updatedAt');
              draftStore.createIndex('status', 'status');
            } else {
              draftStore = request.transaction.objectStore(draftStoreName);
            }
            let imageStore;
            if (!db.objectStoreNames.contains(imageStoreName)) {
              imageStore = db.createObjectStore(imageStoreName, { keyPath: 'imageKey' });
              imageStore.createIndex('draftId', 'draftId');
            } else {
              imageStore = request.transaction.objectStore(imageStoreName);
            }
            if (request.oldVersion < 2 && draftStore && imageStore) {
              migrateLegacyImages_(draftStore, imageStore);
            }
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        return dbPromise;
      }
      async function store(storeName, mode) {
        const db = await open();
        return db.transaction(storeName, mode).objectStore(storeName);
      }
      async function put(draft) {
        await deleteStoredImagesForDraft_(draft.draftId);
        const db = await open();
        const tx = db.transaction([draftStoreName, imageStoreName], 'readwrite');
        const done = transactionToPromise(tx);
        const drafts = tx.objectStore(draftStoreName);
        const images = tx.objectStore(imageStoreName);
        const draftToStore = stripDraftImages_(draft);
        (draft.productImages || []).forEach((image, index) => {
          if (!(image.blob instanceof Blob)) return;
          const meta = draftToStore.productImages[index];
          images.put({
            imageKey: buildDraftImageKey_(draft.draftId, meta.id),
            draftId: draft.draftId,
            id: meta.id,
            name: meta.name || `${draft.draftId}_${index + 1}.jpg`,
            type: meta.type || 'image/jpeg',
            size: meta.size || image.blob.size || 0,
            blob: image.blob,
            thumbBlob: image.thumbBlob || null,
            rotation: meta.rotation,
          });
        });
        drafts.put(draftToStore);
        return done;
      }
      async function get(draftId) {
        const draftStore = await store(draftStoreName, 'readonly');
        const draft = await requestToPromise(draftStore.get(draftId));
        if (!draft) return null;
        return hydrateDraftImages_(draft);
      }
      async function getMeta(draftId) {
        const draftStore = await store(draftStoreName, 'readonly');
        return requestToPromise(draftStore.get(draftId));
      }
      async function updateMeta(draft) {
        const draftStore = await store(draftStoreName, 'readwrite');
        return requestToPromise(draftStore.put(stripDraftImages_(draft)));
      }
      async function remove(draftId) {
        await deleteStoredImagesForDraft_(draftId);
        const db = await open();
        const tx = db.transaction(draftStoreName, 'readwrite');
        const done = transactionToPromise(tx);
        const drafts = tx.objectStore(draftStoreName);
        drafts.delete(draftId);
        return done;
      }
      async function getAll() {
        const draftStore = await store(draftStoreName, 'readonly');
        const drafts = await requestToPromise(draftStore.getAll());
        return drafts.sort((a, b) => new Date(a.createdAt || a.updatedAt || 0).getTime() - new Date(b.createdAt || b.updatedAt || 0).getTime());
      }
      async function countSaved() {
        const drafts = await getAll();
        return drafts.filter(draft => draft.draftId !== AUTOSAVE_DRAFT_ID).length;
      }
      async function getFirstImage(draft) {
        const firstImage = draft && (draft.productImages || [])[0];
        if (!firstImage) return null;
        const imageStore = await store(imageStoreName, 'readonly');
        const stored = await requestToPromise(imageStore.get(buildDraftImageKey_(draft.draftId, firstImage.id)));
        return stored ? { ...firstImage, blob: stored.blob, thumbBlob: stored.thumbBlob || null } : null;
      }
      async function hydrateDraftImages_(draft) {
        const productImages = [];
        for (const image of draft.productImages || []) {
          const images = await store(imageStoreName, 'readonly');
          const stored = await requestToPromise(images.get(buildDraftImageKey_(draft.draftId, image.id)));
          productImages.push({
            ...image,
            blob: stored && stored.blob,
            thumbBlob: stored && stored.thumbBlob,
          });
        }
        return { ...draft, productImages };
      }
      function stripDraftImages_(draft) {
        return {
          ...draft,
          productImages: (draft.productImages || []).map(image => ({
            id: image.id || createId(),
            name: image.name,
            type: image.type || 'image/jpeg',
            size: image.size || (image.blob && image.blob.size) || 0,
            thumbBlob: image.thumbBlob || null,
            hasThumbnail: !!image.thumbBlob,
            rotation: getImageRotation(image),
          })),
        };
      }
      function deleteImagesForDraft_(images, draftId) {
        return new Promise((resolve, reject) => {
          const index = images.index('draftId');
          const request = index.openCursor(IDBKeyRange.only(draftId));
          request.onsuccess = event => {
            const cursor = event.target.result;
            if (!cursor) {
              resolve();
              return;
            }
            cursor.delete();
            cursor.continue();
          };
          request.onerror = () => reject(request.error);
        });
      }
      async function deleteStoredImagesForDraft_(draftId) {
        const db = await open();
        const tx = db.transaction(imageStoreName, 'readwrite');
        const done = transactionToPromise(tx);
        const images = tx.objectStore(imageStoreName);
        await deleteImagesForDraft_(images, draftId);
        return done;
      }
      function migrateLegacyImages_(drafts, images) {
        const request = drafts.openCursor();
        request.onsuccess = event => {
          const cursor = event.target.result;
          if (!cursor) return;
          const draft = cursor.value;
          const productImages = (draft.productImages || []).map((image, index) => {
            const id = image.id || createId();
            if (image.blob instanceof Blob) {
              images.put({
                imageKey: buildDraftImageKey_(draft.draftId, id),
                draftId: draft.draftId,
                id,
                name: image.name || `${draft.draftId}_${index + 1}.jpg`,
                type: image.type || 'image/jpeg',
                size: image.size || image.blob.size || 0,
                blob: image.blob,
                thumbBlob: image.thumbBlob || null,
                rotation: getImageRotation(image),
              });
            }
            return {
              id,
              name: image.name,
              type: image.type || 'image/jpeg',
              size: image.size || (image.blob && image.blob.size) || 0,
              rotation: getImageRotation(image),
            };
          });
          cursor.update({ ...draft, productImages });
          cursor.continue();
        };
      }
      function buildDraftImageKey_(draftId, imageId) {
        return `${draftId}:${imageId}`;
      }
      return { put, get, getMeta, updateMeta, remove, getAll, countSaved, getFirstImage };
    }

    function requestToPromise(request) {
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    function transactionToPromise(transaction) {
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    }
