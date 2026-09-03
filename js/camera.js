// ==========================================
// 画像追加・カメラ・プレビュー・回転・ライトボックス
// ==========================================


// ==========================================
// 画像アップロード
// ==========================================

function setupUploader(root) {
  const key = root.dataset.uploader;
  const dropZone = root.querySelector('.drop-zone');

  root
    .querySelectorAll(`[data-file-input="${key}"]`)
    .forEach(input => {
      input.addEventListener('change', async () => {
        await addFiles(key, input.files);
        input.value = '';
      });
    });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }

      dropZone.classList.add('dragging');
    });
  });

  ['dragleave', 'dragend'].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();

      dropZone.classList.remove('dragging');
    });
  });

  dropZone.addEventListener('drop', async event => {
    event.preventDefault();
    event.stopPropagation();

    dropZone.classList.remove('dragging');

    await addFiles(
      key,
      getDroppedFiles(event)
    );
  });
}


function preventWindowDrop(event) {
  event.preventDefault();
  event.stopPropagation();
}


function getDroppedFiles(event) {
  const dataTransfer = event.dataTransfer;

  if (!dataTransfer) {
    return [];
  }

  if (
    dataTransfer.items &&
    dataTransfer.items.length
  ) {
    return Array.from(dataTransfer.items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter(Boolean);
  }

  return Array.from(
    dataTransfer.files || []
  );
}


// ==========================================
// 商品カメラ起動
// ==========================================

async function startProductCamera() {
  await unlockShutterSound();

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    showMessage(
      'この端末では軽量カメラを起動できません。写真選択を使ってください。',
      'error'
    );

    productCameraInput.click();
    return;
  }

  await stopProductCamera(false);

  try {
    productCameraStream =
      await navigator.mediaDevices.getUserMedia({
        audio: false,

        video: {
          facingMode: {
            ideal: 'environment',
          },

          width: {
            ideal: 1920,
          },

          height: {
            ideal: 1440,
          },

          frameRate: {
            ideal: 15,
            max: 24,
          },
        },
      });

    setupProductCameraZoom();

    productCameraVideo.srcObject =
      productCameraStream;

    updateProductCameraCount();

    cameraDialog.classList.remove(
      'hidden'
    );

    await productCameraVideo.play();

    showMessage(
      '軽量カメラを起動しました。',
      ''
    );
  } catch (error) {
    await stopProductCamera(false);

    showMessage(
      '軽量カメラを起動できませんでした。写真選択を使ってください。',
      'error'
    );
  }
}


// ==========================================
// 商品撮影
// ==========================================

async function captureProductCameraFrame() {
  if (isCapturingProductPhoto) {
    return;
  }

  if (
    !productCameraVideo.videoWidth ||
    !productCameraVideo.videoHeight
  ) {
    showMessage(
      'カメラ映像の準備中です。少し待ってから撮影してください。',
      'error'
    );

    return;
  }

  isCapturingProductPhoto = true;

  captureProductCameraButton.classList.add(
    'capturing'
  );

  // タイムアウト保険：
  // 3秒でフラグを強制解除してボタンを復活
  clearTimeout(captureReleaseTimer);

  captureReleaseTimer = setTimeout(() => {
    isCapturingProductPhoto = false;

    captureProductCameraButton.classList.remove(
      'capturing'
    );
  }, 3000);

  const expectedCount =
    imageState.productImages.length + 1;

  try {
    await playShutterSound();

    updateProductCameraCount(
      expectedCount
    );

    const sourceSize = Math.min(
      productCameraVideo.videoWidth,
      productCameraVideo.videoHeight
    );

    const sourceX = Math.max(
      0,
      Math.round(
        (
          productCameraVideo.videoWidth -
          sourceSize
        ) / 2
      )
    );

    const sourceY = Math.max(
      0,
      Math.round(
        (
          productCameraVideo.videoHeight -
          sourceSize
        ) / 2
      )
    );

    const outputSize = Math.max(
      1,
      Math.round(
        Math.min(
          IMAGE_MAX_SIZE,
          sourceSize
        )
      )
    );

    productCameraCanvas.width =
      outputSize;

    productCameraCanvas.height =
      outputSize;

    const ctx =
      productCameraCanvas.getContext(
        '2d',
        {
          alpha: false,
        }
      );

    ctx.drawImage(
      productCameraVideo,

      sourceX,
      sourceY,
      sourceSize,
      sourceSize,

      0,
      0,
      outputSize,
      outputSize
    );

    const blob = await canvasToBlob(
      productCameraCanvas,
      'image/jpeg',
      IMAGE_JPEG_QUALITY
    );

    const thumbnailBlob =
      await createThumbnailFromCanvas(
        productCameraCanvas
      );

    const file = makeImageFile(
      blob,
      `camera_${Date.now()}.jpg`
    );

    file.thumbnailBlob =
      thumbnailBlob;

    await addFiles(
      'productImages',
      [file]
    );

    updateProductCameraCount();

    // メモリ節約
    productCameraCanvas.width = 1;
    productCameraCanvas.height = 1;

    showMessage(
      `撮影しました。現在 ${imageState.productImages.length} 枚です。`,
      'success'
    );
  } catch (error) {
    updateProductCameraCount();

    showMessage(
      '撮影画像を作成できませんでした。',
      'error'
    );
  } finally {
    // 保険タイマーをキャンセル
    clearTimeout(captureReleaseTimer);

    isCapturingProductPhoto = false;

    captureProductCameraButton.classList.remove(
      'capturing'
    );
  }
}


// ==========================================
// 商品カメラ停止
// ==========================================

async function stopProductCamera(
  showMessageOnStop = true
) {
  if (productCameraStream) {
    productCameraStream
      .getTracks()
      .forEach(track => {
        track.stop();
      });

    productCameraStream = null;
  }

  productCameraVideo.srcObject = null;

  cameraDialog.classList.add(
    'hidden'
  );

  // ズーム状態リセット
  productCameraZoomTrack = null;

  productCameraZoomCapabilities =
    null;

  productCameraZoomValue = 1;

  // ピンチ状態リセット
  productCameraPinchStartDistance =
    0;

  productCameraPinchStartZoom = 1;

  productCameraPinchZoomBusy =
    false;

  productCameraPendingPinchZoom =
    null;

  const zoomControls =
    document.getElementById(
      'cameraZoomControls'
    );

  if (zoomControls) {
    zoomControls.classList.add(
      'hidden'
    );
  }

  if (showMessageOnStop) {
    showMessage(
      'カメラを閉じました。',
      ''
    );
  }
}


// ==========================================
// 撮影枚数表示
// ==========================================

function updateProductCameraCount(
  nextCount
) {
  const count =
    Number.isFinite(
      Number(nextCount)
    )
      ? Number(nextCount)
      : imageState.productImages.length;

  productCameraCount.textContent =
    `撮影 ${count}`;
}


// ==========================================
// Canvas → Blob
// ==========================================

function canvasToBlob(
  canvas,
  type,
  quality
) {
  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error(
                '画像を作成できませんでした。'
              )
            );
          }
        },
        type,
        quality
      );
    }
  );
}


// ==========================================
// シャッター音
// ==========================================

async function getShutterAudioContext() {
  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (
    !shutterAudioContext ||
    shutterAudioContext.state ===
      'closed'
  ) {
    shutterAudioContext =
      new AudioContextClass();
  }

  if (
    shutterAudioContext.state ===
    'suspended'
  ) {
    await shutterAudioContext
      .resume()
      .catch(() => {});
  }

  return shutterAudioContext;
}


async function unlockShutterSound() {
  try {
    const audioContext =
      await getShutterAudioContext();

    if (!audioContext) {
      return;
    }

    const source =
      audioContext.createBufferSource();

    source.buffer =
      audioContext.createBuffer(
        1,
        1,
        audioContext.sampleRate
      );

    const gain =
      audioContext.createGain();

    gain.gain.value = 0.0001;

    source.connect(gain);
    gain.connect(
      audioContext.destination
    );

    source.start();
  } catch (error) {
    // Audio unlock は best effort
  }
}


async function playShutterSound() {
  try {
    const audioContext =
      await getShutterAudioContext();

    if (!audioContext) {
      return;
    }

    const now =
      audioContext.currentTime;

    playShutterClick(
      audioContext,
      now,
      0.00,
      0.034,
      1.0
    );

    playShutterClick(
      audioContext,
      now,
      0.052,
      0.046,
      0.9
    );
  } catch (error) {
    // 音が失敗しても撮影は続行
  }
}


function playShutterClick(
  audioContext,
  startTime,
  offset,
  duration,
  volume
) {
  const sampleRate =
    audioContext.sampleRate;

  const bufferSize = Math.max(
    1,
    Math.floor(
      sampleRate * duration
    )
  );

  const buffer =
    audioContext.createBuffer(
      1,
      bufferSize,
      sampleRate
    );

  const data =
    buffer.getChannelData(0);

  for (
    let index = 0;
    index < bufferSize;
    index++
  ) {
    const fade =
      1 - index / bufferSize;

    data[index] =
      (
        Math.random() * 2 -
        1
      ) * fade;
  }

  const noise =
    audioContext.createBufferSource();

  noise.buffer = buffer;

  const filter =
    audioContext.createBiquadFilter();

  filter.type = 'highpass';

  filter.frequency.setValueAtTime(
    1400,
    startTime + offset
  );

  const gain =
    audioContext.createGain();

  gain.gain.setValueAtTime(
    0.0001,
    startTime + offset
  );

  gain.gain.exponentialRampToValueAtTime(
    volume,
    startTime +
      offset +
      0.004
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime +
      offset +
      duration
  );

  noise.connect(filter);
  filter.connect(gain);

  gain.connect(
    audioContext.destination
  );

  noise.start(
    startTime + offset
  );

  noise.stop(
    startTime +
      offset +
      duration
  );
}


// ==========================================
// Blob → File
// ==========================================

function makeImageFile(
  blob,
  name
) {
  try {
    return new File(
      [blob],
      name,
      {
        type:
          blob.type ||
          'image/jpeg',
      }
    );
  } catch (error) {
    blob.name = name;
    return blob;
  }
}


// ==========================================
// サムネイル作成
// ==========================================

async function createThumbnailFromCanvas(
  sourceCanvas
) {
  const scale = Math.min(
    1,
    THUMBNAIL_MAX_SIZE /
      Math.max(
        sourceCanvas.width,
        sourceCanvas.height
      )
  );

  const width = Math.max(
    1,
    Math.round(
      sourceCanvas.width *
        scale
    )
  );

  const height = Math.max(
    1,
    Math.round(
      sourceCanvas.height *
        scale
    )
  );

  const thumbnailCanvas =
    document.createElement(
      'canvas'
    );

  thumbnailCanvas.width =
    width;

  thumbnailCanvas.height =
    height;

  const ctx =
    thumbnailCanvas.getContext(
      '2d',
      {
        alpha: false,
      }
    );

  ctx.drawImage(
    sourceCanvas,
    0,
    0,
    width,
    height
  );

  const blob = await canvasToBlob(
    thumbnailCanvas,
    'image/jpeg',
    THUMBNAIL_JPEG_QUALITY
  );

  thumbnailCanvas.width = 1;
  thumbnailCanvas.height = 1;

  return blob;
}


async function createThumbnailFromImageBlob(
  blob
) {
  let bitmap = null;

  try {
    bitmap =
      await createImageBitmap(
        blob,
        {
          resizeWidth:
            THUMBNAIL_MAX_SIZE,

          resizeHeight:
            THUMBNAIL_MAX_SIZE,

          resizeQuality: 'high',

          imageOrientation:
            'from-image',
        }
      );
  } catch (error) {
    bitmap =
      await createImageBitmap(
        blob
      );
  }

  try {
    const scale = Math.min(
      1,
      THUMBNAIL_MAX_SIZE /
        Math.max(
          bitmap.width,
          bitmap.height
        )
    );

    const width = Math.max(
      1,
      Math.round(
        bitmap.width * scale
      )
    );

    const height = Math.max(
      1,
      Math.round(
        bitmap.height * scale
      )
    );

    const thumbnailCanvas =
      document.createElement(
        'canvas'
      );

    thumbnailCanvas.width =
      width;

    thumbnailCanvas.height =
      height;

    const ctx =
      thumbnailCanvas.getContext(
        '2d',
        {
          alpha: false,
        }
      );

    ctx.drawImage(
      bitmap,
      0,
      0,
      width,
      height
    );

    const thumbnailBlob =
      await canvasToBlob(
        thumbnailCanvas,
        'image/jpeg',
        THUMBNAIL_JPEG_QUALITY
      );

    thumbnailCanvas.width = 1;
    thumbnailCanvas.height = 1;

    return thumbnailBlob;
  } finally {
    if (
      bitmap &&
      bitmap.close
    ) {
      bitmap.close();
    }
  }
}


// ==========================================
// 画像追加
// ==========================================

async function addFiles(
  key,
  fileList
) {
  const files = Array.from(
    fileList || []
  ).filter(
    file =>
      file.type.startsWith(
        'image/'
      )
  );

  if (!files.length) {
    return;
  }

  const images = [];

  for (
    let index = 0;
    index < files.length;
    index++
  ) {
    images.push(
      await createImageEntry(
        files[index],
        index
      )
    );
  }

  const existing =
    imageState[key];

  const deduped =
    images.filter(
      img =>
        !existing.some(
          existingImage =>
            existingImage.name ===
              img.name &&
            existingImage.size ===
              img.size
        )
    );

  images
    .filter(
      img =>
        !deduped.includes(img)
    )
    .forEach(
      revokeImageUrl
    );

  imageState[key].push(
    ...deduped
  );

  renderPreview(key);

  scheduleAutosave();

  showMessage(
    '写真を追加しました。続けて入力し、保存してください。',
    'success'
  );
}


// ==========================================
// 画像データ作成
// ==========================================

async function createImageEntry(
  file,
  index
) {
  const name =
    file.name ||
    `image_${index + 1}.jpg`;

  const thumbnailBlob =
    file.thumbnailBlob ||
    file.thumbBlob ||
    await createThumbnailFromImageBlob(
      file
    ).catch(() => null);

  return {
    id: createId(),

    name,

    type:
      file.type ||
      'image/jpeg',

    size: file.size,

    blob: file,

    thumbBlob:
      thumbnailBlob,

    previewUrl:
      thumbnailBlob
        ? URL.createObjectURL(
            thumbnailBlob
          )
        : '',

    rotation: 0,
  };
}


// ==========================================
// 画像プレビュー
// ==========================================

function renderPreview(key) {
  const preview =
    document.querySelector(
      `[data-preview="${key}"]`
    );

  preview.innerHTML = '';

  imageState[key].forEach(
    (image, index) => {
      const item =
        document.createElement(
          'div'
        );

      item.className = 'thumb';

      item.draggable = true;

      item.dataset.index =
        index;

      item.addEventListener(
        'contextmenu',
        event =>
          event.preventDefault()
      );

      const img =
        document.createElement(
          'div'
        );

      img.className =
        'thumb-image';

      img.style.display =
        'grid';

      img.style.placeItems =
        'center';

      img.style.padding =
        '6px';

      img.style.color =
        '#30475c';

      img.style.fontSize =
        '12px';

      img.style.fontWeight =
        '800';

      img.style.textAlign =
        'center';

      if (
        SHOW_IMAGE_PREVIEWS &&
        image.previewUrl
      ) {
        img.style.backgroundImage =
          `url("${image.previewUrl}")`;

        img.style.backgroundSize =
          'cover';

        img.style.backgroundPosition =
          'center';

        img.textContent = '';
      } else {
        img.textContent =
          `写真${index + 1}`;
      }

      applyImageRotationStyle(
        img,
        image
      );

      item.addEventListener(
        'click',
        event => {
          if (
            event.target.closest(
              'button'
            ) ||
            suppressThumbClick
          ) {
            return;
          }

          if (image.previewUrl) {
            openLightbox(
              key,
              index
            );
          } else {
            showMessage(
              '写真選択の画像はメモリ節約のためサムネイルを表示しません。',
              ''
            );
          }
        }
      );

      const remove =
        document.createElement(
          'button'
        );

      remove.type = 'button';

      remove.className =
        'remove';

      remove.textContent =
        '×';

      remove.addEventListener(
        'click',
        event => {
          event.stopPropagation();

          const removed =
            imageState[key].splice(
              index,
              1
            )[0];

          revokeImageUrl(
            removed
          );

          renderPreview(key);

          scheduleAutosave();

          showMessage(
            '写真を削除しました。変更を残すには保存してください。',
            ''
          );
        }
      );

      item.addEventListener(
        'dragstart',
        event => {
          event.dataTransfer.effectAllowed =
            'move';

          item.classList.add(
            'dragging'
          );

          dragSrc = index;
        }
      );

      item.addEventListener(
        'dragend',
        () => {
          item.classList.remove(
            'dragging'
          );

          preview
            .querySelectorAll(
              '.thumb'
            )
            .forEach(
              thumb =>
                thumb.classList.remove(
                  'drag-over'
                )
            );

          dragSrc = null;
        }
      );

      item.addEventListener(
        'dragover',
        event => {
          event.preventDefault();

          event.dataTransfer.dropEffect =
            'move';

          item.classList.add(
            'drag-over'
          );
        }
      );

      item.addEventListener(
        'dragleave',
        () =>
          item.classList.remove(
            'drag-over'
          )
      );

      item.addEventListener(
        'drop',
        event => {
          event.preventDefault();

          item.classList.remove(
            'drag-over'
          );

          if (
            dragSrc !== null &&
            dragSrc !== index
          ) {
            const arr =
              imageState[key];

            const moved =
              arr.splice(
                dragSrc,
                1
              )[0];

            arr.splice(
              index,
              0,
              moved
            );

            renderPreview(key);

            scheduleAutosave();

            showMessage(
              '写真の順番を変更しました。変更を残すには保存してください。',
              ''
            );
          }
        }
      );

      item.addEventListener(
        'touchstart',
        event => {
          if (
            event.target.closest(
              'button'
            )
          ) {
            return;
          }

          touchTimer =
            setTimeout(() => {
              dragSrc = index;

              item.classList.add(
                'dragging'
              );

              touchDragEl =
                item;

              suppressThumbClick =
                true;
            }, 400);
        },
        {
          passive: true,
        }
      );

      item.addEventListener(
        'touchmove',
        event => {
          if (!touchDragEl) {
            return;
          }

          event.preventDefault();

          const touch =
            event.touches[0];

          const elements =
            document.elementsFromPoint(
              touch.clientX,
              touch.clientY
            );

          const target =
            elements.find(
              element =>
                element.classList.contains(
                  'thumb'
                ) &&
                element !==
                  touchDragEl
            );

          preview
            .querySelectorAll(
              '.thumb'
            )
            .forEach(
              thumb =>
                thumb.classList.remove(
                  'drag-over'
                )
            );

          if (target) {
            target.classList.add(
              'drag-over'
            );

            touchDropTarget =
              parseInt(
                target.dataset.index,
                10
              );
          } else {
            touchDropTarget =
              null;
          }
        },
        {
          passive: false,
        }
      );

      item.addEventListener(
        'touchend',
        () => {
          clearTimeout(
            touchTimer
          );

          if (
            touchDragEl &&
            touchDropTarget !==
              null &&
            touchDropTarget !==
              dragSrc
          ) {
            const arr =
              imageState[key];

            const moved =
              arr.splice(
                dragSrc,
                1
              )[0];

            arr.splice(
              touchDropTarget,
              0,
              moved
            );

            renderPreview(key);

            showMessage(
              '写真の順番を変更しました。変更を残すには保存してください。',
              ''
            );
          }

          preview
            .querySelectorAll(
              '.thumb'
            )
            .forEach(
              thumb =>
                thumb.classList.remove(
                  'drag-over'
                )
            );

          if (touchDragEl) {
            touchDragEl.classList.remove(
              'dragging'
            );
          }

          touchDragEl = null;
          dragSrc = null;
          touchDropTarget = null;

          setTimeout(() => {
            suppressThumbClick =
              false;
          }, 120);
        }
      );

      item.append(
        img,
        remove
      );

      preview.append(
        item
      );
    }
  );
}


// ==========================================
// 画像回転
// ==========================================

async function rotateImage(
  key,
  index,
  direction
) {
  const image =
    imageState[key][index];

  if (!image) {
    return;
  }

  image.rotation =
    normalizeRotation(
      getImageRotation(
        image
      ) +
        (
          direction ||
          1
        ) *
          90
    );

  renderPreview(key);

  scheduleAutosave();

  showMessage(
    '写真の向きを変更しました。変更を残すには保存してください。',
    ''
  );
}


async function rotateImageBlob(
  blob,
  rotation
) {
  const degrees =
    normalizeRotation(
      rotation
    );

  if (!degrees) {
    return blob;
  }

  const bitmap =
    await createImageBitmap(
      blob
    );

  const canvas =
    document.createElement(
      'canvas'
    );

  const sideways =
    degrees === 90 ||
    degrees === 270;

  canvas.width =
    sideways
      ? bitmap.height
      : bitmap.width;

  canvas.height =
    sideways
      ? bitmap.width
      : bitmap.height;

  const ctx =
    canvas.getContext(
      '2d'
    );

  ctx.translate(
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.rotate(
    degrees *
      Math.PI /
      180
  );

  ctx.drawImage(
    bitmap,
    -bitmap.width / 2,
    -bitmap.height / 2
  );

  if (bitmap.close) {
    bitmap.close();
  }

  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        result => {
          if (!result) {
            reject(
              new Error(
                '画像を回転できませんでした。'
              )
            );

            return;
          }

          resolve(result);
        },

        'image/jpeg',

        IMAGE_JPEG_QUALITY
      );
    }
  );
}


function getImageRotation(
  image
) {
  return normalizeRotation(
    image &&
    Number.isFinite(
      Number(
        image.rotation
      )
    )
      ? Number(
          image.rotation
        )
      : 0
  );
}


function normalizeRotation(
  value
) {
  return (
    (
      Math.round(
        Number(value) || 0
      ) %
        360
    ) +
    360
  ) % 360;
}


function applyImageRotationStyle(
  element,
  image
) {
  element.style.transform =
    `rotate(${getImageRotation(image)}deg)`;
}


// ==========================================
// Object URL 解放
// ==========================================

function revokeImageUrl(
  image
) {
  if (
    image &&
    image.previewUrl
  ) {
    URL.revokeObjectURL(
      image.previewUrl
    );

    image.previewUrl = '';
  }
}


function revokeImageUrls(
  key
) {
  imageState[key].forEach(
    revokeImageUrl
  );
}


function clearDraftPreviewUrls() {
  draftPreviewUrls.forEach(
    url =>
      URL.revokeObjectURL(
        url
      )
  );

  draftPreviewUrls = [];
}


// ==========================================
// ライトボックス
// ==========================================

function openLightbox(
  key,
  index
) {
  const image =
    imageState[key] &&
    imageState[key][index];

  if (
    !image ||
    !image.previewUrl
  ) {
    return;
  }

  lightboxImageRef = {
    key,
    index,
  };

  lightboxImg.src =
    image.previewUrl;

  applyImageRotationStyle(
    lightboxImg,
    image
  );

  lightbox.classList.remove(
    'hidden'
  );
}


function closeLightbox() {
  lightbox.classList.add(
    'hidden'
  );

  lightboxImg.src = '';

  lightboxImg.style.transform =
    '';

  lightboxImageRef = null;
}


async function rotateLightboxImage(
  direction
) {
  if (!lightboxImageRef) {
    return;
  }

  await rotateImage(
    lightboxImageRef.key,
    lightboxImageRef.index,
    direction
  );

  const image =
    imageState[
      lightboxImageRef.key
    ][
      lightboxImageRef.index
    ];

  if (
    image &&
    image.previewUrl
  ) {
    lightboxImg.src =
      image.previewUrl;

    applyImageRotationStyle(
      lightboxImg,
      image
    );
  }
}


// ==========================================
// カメラズーム
//
// 対応操作
// ・スライダー
// ・－ / ＋ ボタン
// ・マウスホイール
// ・スマホ2本指ピンチ
// ==========================================

let productCameraZoomTrack =
  null;

let productCameraZoomCapabilities =
  null;

let productCameraZoomValue =
  1;


// ==========================================
// ピンチズーム状態
// ==========================================

let productCameraPinchStartDistance =
  0;

let productCameraPinchStartZoom =
  1;

let productCameraPinchZoomBusy =
  false;

let productCameraPendingPinchZoom =
  null;


// ==========================================
// ズーム初期設定
// ==========================================

async function setupProductCameraZoom() {
  const controls =
    document.getElementById(
      'cameraZoomControls'
    );

  const slider =
    document.getElementById(
      'cameraZoomSlider'
    );

  const valueLabel =
    document.getElementById(
      'cameraZoomValue'
    );

  const maxLabel =
    document.getElementById(
      'cameraZoomMax'
    );

  const zoomOutButton =
    document.getElementById(
      'cameraZoomOutButton'
    );

  const zoomInButton =
    document.getElementById(
      'cameraZoomInButton'
    );

  const monitor =
    document.querySelector(
      '.camera-monitor'
    );

  if (
    !controls ||
    !slider ||
    !valueLabel ||
    !maxLabel ||
    !productCameraStream
  ) {
    return;
  }

  const tracks =
    productCameraStream.getVideoTracks();

  if (!tracks.length) {
    controls.classList.add(
      'hidden'
    );

    return;
  }

  productCameraZoomTrack =
    tracks[0];

  // getCapabilities 非対応端末
  if (
    !productCameraZoomTrack
      .getCapabilities
  ) {
    controls.classList.add(
      'hidden'
    );

    return;
  }

  const capabilities =
    productCameraZoomTrack
      .getCapabilities();

  // カメラ側がズーム非対応
  if (!capabilities.zoom) {
    controls.classList.add(
      'hidden'
    );

    return;
  }

  productCameraZoomCapabilities =
    capabilities.zoom;

  const min =
    Number(
      productCameraZoomCapabilities
        .min
    ) || 1;

  const max =
    Number(
      productCameraZoomCapabilities
        .max
    ) || min;

  const step =
    Number(
      productCameraZoomCapabilities
        .step
    ) || 0.1;

  const settings =
    productCameraZoomTrack
      .getSettings
      ? productCameraZoomTrack
          .getSettings()
      : {};

  productCameraZoomValue =
    Number(
      settings.zoom
    ) || min;

  // スライダー設定
  slider.min =
    String(min);

  slider.max =
    String(max);

  slider.step =
    String(step);

  slider.value =
    String(
      productCameraZoomValue
    );

  valueLabel.textContent =
    `${productCameraZoomValue.toFixed(1)}x`;

  maxLabel.textContent =
    `${max.toFixed(1)}x`;

  controls.classList.remove(
    'hidden'
  );


  // ========================================
  // スライダー操作
  // ========================================

  slider.oninput =
    async () => {
      await setProductCameraZoom(
        Number(
          slider.value
        )
      );
    };


  // ========================================
  // － ボタン
  // ========================================

  zoomOutButton.onclick =
    async () => {
      await changeProductCameraZoom(
        -1
      );
    };


  // ========================================
  // ＋ ボタン
  // ========================================

  zoomInButton.onclick =
    async () => {
      await changeProductCameraZoom(
        1
      );
    };


  // ========================================
  // マウスホイールズーム
  // ========================================

  if (
    monitor &&
    !monitor.dataset
      .zoomWheelReady
  ) {
    monitor.dataset.zoomWheelReady =
      '1';

    monitor.addEventListener(
      'wheel',

      async event => {
        if (
          !productCameraZoomTrack ||
          !productCameraZoomCapabilities
        ) {
          return;
        }

        event.preventDefault();

        // 上へ回す → 拡大
        if (
          event.deltaY < 0
        ) {
          await changeProductCameraZoom(
            1
          );
        } else {
          // 下へ回す → 縮小
          await changeProductCameraZoom(
            -1
          );
        }
      },

      {
        passive: false,
      }
    );
  }


  // ========================================
  // スマホ2本指ピンチズーム
  // ========================================

  if (
    monitor &&
    !monitor.dataset
      .zoomPinchReady
  ) {
    monitor.dataset.zoomPinchReady =
      '1';


    // --------------------------------------
    // 2本指を置いた瞬間
    // --------------------------------------

    monitor.addEventListener(
      'touchstart',

      event => {
        if (
          event.touches.length !==
            2 ||
          !productCameraZoomCapabilities
        ) {
          return;
        }

        event.preventDefault();

        productCameraPinchStartDistance =
          getProductCameraTouchDistance(
            event.touches
          );

        productCameraPinchStartZoom =
          productCameraZoomValue;
      },

      {
        passive: false,
      }
    );


    // --------------------------------------
    // 2本指を動かした時
    // --------------------------------------

    monitor.addEventListener(
      'touchmove',

      event => {
        if (
          event.touches.length !==
            2 ||
          !productCameraZoomCapabilities ||
          !productCameraPinchStartDistance
        ) {
          return;
        }

        event.preventDefault();

        const currentDistance =
          getProductCameraTouchDistance(
            event.touches
          );

        if (
          !currentDistance
        ) {
          return;
        }

        const scale =
          currentDistance /
          productCameraPinchStartDistance;

        const targetZoom =
          productCameraPinchStartZoom *
          scale;

        queueProductCameraPinchZoom(
          targetZoom
        );
      },

      {
        passive: false,
      }
    );


    // --------------------------------------
    // 指を離した時
    // --------------------------------------

    monitor.addEventListener(
      'touchend',

      event => {
        if (
          event.touches.length <
          2
        ) {
          productCameraPinchStartDistance =
            0;

          productCameraPinchStartZoom =
            productCameraZoomValue;
        }
      }
    );


    // --------------------------------------
    // Android等でタッチキャンセルされた時
    // --------------------------------------

    monitor.addEventListener(
      'touchcancel',

      () => {
        productCameraPinchStartDistance =
          0;

        productCameraPinchStartZoom =
          productCameraZoomValue;
      }
    );
  }
}


// ==========================================
// ＋ / － / ホイール用ズーム変更
// ==========================================

async function changeProductCameraZoom(
  direction
) {
  if (
    !productCameraZoomCapabilities
  ) {
    return;
  }

  const min =
    Number(
      productCameraZoomCapabilities
        .min
    ) || 1;

  const max =
    Number(
      productCameraZoomCapabilities
        .max
    ) || min;

  const nativeStep =
    Number(
      productCameraZoomCapabilities
        .step
    ) || 0.1;

  // 小さすぎるstepだと押しても分かりにくいため
  // 最低0.1倍ずつ動かす
  const step =
    Math.max(
      nativeStep,
      0.1
    );

  const nextValue =
    productCameraZoomValue +
    step *
      direction;

  await setProductCameraZoom(
    Math.min(
      max,
      Math.max(
        min,
        nextValue
      )
    )
  );
}


// ==========================================
// 実際にカメラへズーム値を反映
// ==========================================

async function setProductCameraZoom(
  value
) {
  if (
    !productCameraZoomTrack ||
    !productCameraZoomCapabilities
  ) {
    return;
  }

  const min =
    Number(
      productCameraZoomCapabilities
        .min
    ) || 1;

  const max =
    Number(
      productCameraZoomCapabilities
        .max
    ) || min;

  const requestedValue =
    Number(value);

  if (
    !Number.isFinite(
      requestedValue
    )
  ) {
    return;
  }

  const zoomValue =
    Math.min(
      max,
      Math.max(
        min,
        requestedValue
      )
    );

  try {
    await productCameraZoomTrack
      .applyConstraints({
        advanced: [
          {
            zoom:
              zoomValue,
          },
        ],
      });

    productCameraZoomValue =
      zoomValue;

    const slider =
      document.getElementById(
        'cameraZoomSlider'
      );

    const valueLabel =
      document.getElementById(
        'cameraZoomValue'
      );

    if (slider) {
      slider.value =
        String(
          productCameraZoomValue
        );
    }

    if (valueLabel) {
      valueLabel.textContent =
        `${productCameraZoomValue.toFixed(1)}x`;
    }
  } catch (error) {
    console.warn(
      'カメラズーム変更に失敗しました:',
      error
    );
  }
}


// ==========================================
// 2本指の距離を取得
// ==========================================

function getProductCameraTouchDistance(
  touches
) {
  if (
    !touches ||
    touches.length < 2
  ) {
    return 0;
  }

  const x =
    touches[0].clientX -
    touches[1].clientX;

  const y =
    touches[0].clientY -
    touches[1].clientY;

  return Math.hypot(
    x,
    y
  );
}


// ==========================================
// ピンチズーム要求をまとめる
//
// touchmoveは非常に高速で発生するため、
// applyConstraintsを無制限に同時実行しないようにする
// ==========================================

function queueProductCameraPinchZoom(
  value
) {
  productCameraPendingPinchZoom =
    value;

  if (
    productCameraPinchZoomBusy
  ) {
    return;
  }

  applyProductCameraPendingPinchZoom();
}


// ==========================================
// ピンチズームを順番に適用
// ==========================================

async function applyProductCameraPendingPinchZoom() {
  productCameraPinchZoomBusy =
    true;

  try {
    while (
      productCameraPendingPinchZoom !==
      null
    ) {
      const value =
        productCameraPendingPinchZoom;

      // 最新値を受け取ったので一旦空にする
      productCameraPendingPinchZoom =
        null;

      await setProductCameraZoom(
        value
      );
    }
  } finally {
    productCameraPinchZoomBusy =
      false;
  }
}


// ==========================================
// 確認ダイアログ用
// ==========================================

let confirmResolver = null;
