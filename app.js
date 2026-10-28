/**
 * GPS Art Walk - Web Application
 * OpenStreetMap (Leaflet.js) + OSRM Routing + HTML5 Geolocation API
 */

// --- 상태 관리 ---
const Mode = {
  FREE_DRAW: 'FREE_DRAW',
  FOLLOW_ROUTE: 'FOLLOW_ROUTE'
};

let currentMode = Mode.FREE_DRAW;
let isTracking = false;
let watchId = null;
let isSnapping = false;

// 그리기 데이터
let trackPoints = []; // [{lat, lng}]
let guidePoints = []; // [{lat, lng}]

// Leaflet 객체
let map = null;
let trackPolyline = null;
let guidePolyline = null;
let guidePolygon = null;
let startPointMarker = null;
let myLocationMarker = null;

// DOM 요소
const mapContainer = document.getElementById('mapView');
const spinnerMode = document.getElementById('spinnerMode');
const tvCurrentShape = document.getElementById('tvCurrentShape');
const tvStatus = document.getElementById('tvStatus');
const tvCoords = document.getElementById('tvCoords');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnClear = document.getElementById('btnClear');
const btnMyLocation = document.getElementById('btnMyLocation');

// 모달 요소
const autoShapeModal = document.getElementById('autoShapeModal');
const shapeSelect = document.getElementById('shapeSelect');
const tvDistance = document.getElementById('tvDistance');
const seekBar = document.getElementById('seekBar');
const btnShapeCancel = document.getElementById('btnShapeCancel');
const btnShapeConfirm = document.getElementById('btnShapeConfirm');

const alertModal = document.getElementById('alertModal');
const alertModalMessage = document.getElementById('alertModalMessage');
const btnAlertClose = document.getElementById('btnAlertClose');

// 도형 이름
const SHAPE_NAMES = ["강아지", "고양이", "공룡", "새", "하트", "별", "자동차", "물고기", "집", "왕관"];

// --- 초기화 ---
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  initEvents();
  requestCurrentLocation(true);
  loadDrawingData();
});

function initMap() {
  // 서울 시청 기본 좌표
  const defaultCenter = [37.5665, 126.9780];
  
  map = L.map('mapView', {
    center: defaultCenter,
    zoom: 17,
    zoomControl: false // 깔끔한 모바일 UI를 위해 기본 줌 컨트롤 숨김
  });

  // OpenStreetMap 타일 레이어 (무료, API 키 불필요)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // 거리 척도(Scale Bar) 추가
  L.control.scale({
    imperial: false,
    metric: true,
    position: 'bottomleft'
  }).addTo(map);
}

function initEvents() {
  // 모드 변경 드롭다운
  spinnerMode.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'AUTO_SHAPE') {
      showAutoShapeDialog();
    } else {
      switchMode(val);
    }
  });

  // 버튼 이벤트
  btnStart.addEventListener('click', startTracking);
  btnStop.addEventListener('click', stopTracking);
  btnClear.addEventListener('click', () => {
    if (isTracking) stopTracking();
    clearAll();
    if (currentMode === Mode.FREE_DRAW) {
      updateStatus('준비 완료');
    } else if (currentMode === Mode.FOLLOW_ROUTE) {
      setupDrawingListeners();
      updateStatus('밑그림을 그리세요');
    }
  });

  btnMyLocation.addEventListener('click', () => {
    requestCurrentLocation(false);
  });

  // 자동 모양 모달 이벤트
  seekBar.addEventListener('input', (e) => {
    const km = (parseInt(e.target.value, 10) / 10).toFixed(1);
    tvDistance.textContent = `최대 허용 길이: ${km} km`;
  });

  btnShapeCancel.addEventListener('click', () => {
    autoShapeModal.style.display = 'none';
    spinnerMode.value = currentMode;
  });

  btnShapeConfirm.addEventListener('click', () => {
    const shapeType = parseInt(shapeSelect.value, 10);
    const maxLengthKm = parseFloat((parseInt(seekBar.value, 10) / 10).toFixed(1));
    autoShapeModal.style.display = 'none';
    generateShape(shapeType, maxLengthKm);
  });

  btnAlertClose.addEventListener('click', () => {
    alertModal.style.display = 'none';
  });

  // 창 닫거나 나갈 때 저장
  window.addEventListener('beforeunload', saveDrawingData);
}

// --- 모드 전환 ---
function switchMode(newMode) {
  if (currentMode === newMode) return;

  if (isTracking) {
    stopTracking();
  }

  currentMode = newMode;
  clearAll();

  if (newMode === Mode.FREE_DRAW) {
    removeDrawingListeners();
    updateStatus('준비 완료');
  } else if (newMode === Mode.FOLLOW_ROUTE) {
    setupDrawingListeners();
    updateStatus('밑그림을 그리세요');
  }

  updateButtonStates();
}

function updateButtonStates() {
  btnStart.disabled = isTracking;
  btnStop.disabled = !isTracking;
  spinnerMode.disabled = isTracking;
}

function updateStatus(msg) {
  tvStatus.textContent = msg;
}

function showAlert(msg) {
  alertModalMessage.textContent = msg;
  alertModal.style.display = 'flex';
}

// --- 내 위치 및 GPS 처리 ---
function requestCurrentLocation(initial = false) {
  if (!navigator.geolocation) {
    showAlert('이 브라우저는 위치 정보를 지원하지 않습니다.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const latlng = [latitude, longitude];
      
      updateMyLocationMarker(latlng);
      map.setView(latlng, 17);
      tvCoords.textContent = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`;
    },
    (err) => {
      if (!initial) {
        showAlert(`위치 정보를 가져올 수 없습니다: ${err.message}`);
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function updateMyLocationMarker(latlng) {
  if (!myLocationMarker) {
    const pulseIcon = L.divIcon({
      className: 'gps-pulse-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    myLocationMarker = L.marker(latlng, { icon: pulseIcon }).addTo(map);
  } else {
    myLocationMarker.setLatLng(latlng);
  }
}

// --- 트래킹 시작 / 중지 ---
function startTracking() {
  if (isTracking) return;
  if (!navigator.geolocation) {
    showAlert('위치 권한이 필요합니다.');
    return;
  }

  isTracking = true;
  trackPoints = [];
  removeTrackPolyline();

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const latlng = { lat: latitude, lng: longitude };
      
      trackPoints.push(latlng);
      updateTrackPolyline();
      updateMyLocationMarker([latitude, longitude]);
      map.panTo([latitude, longitude]);

      tvCoords.textContent = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`;
    },
    (err) => {
      console.error('GPS Watch Error:', err);
      updateStatus('위치 신호 수신 실패');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );

  if (currentMode === Mode.FREE_DRAW) {
    updateStatus('기록 중...');
  } else if (currentMode === Mode.FOLLOW_ROUTE) {
    removeDrawingListeners();
    updateStatus('경로 따라가기 중...');
  }
  updateButtonStates();
}

function stopTracking() {
  if (!isTracking) return;

  isTracking = false;
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  updateStatus('기록 종료');
  updateButtonStates();
}

// --- 폴리라인 렌더링 ---
function updateTrackPolyline() {
  removeTrackPolyline();
  if (trackPoints.length < 2) return;

  const latlngs = trackPoints.map(p => [p.lat, p.lng]);
  trackPolyline = L.polyline(latlngs, {
    color: '#2196F3',
    weight: 8,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);
}

function removeTrackPolyline() {
  if (trackPolyline) {
    map.removeLayer(trackPolyline);
    trackPolyline = null;
  }
}

function updateGuidePolyline(isAutoShape = false) {
  removeGuidePolyline();
  if (guidePoints.length < 2) return;

  const latlngs = guidePoints.map(p => [p.lat, p.lng]);

  if (isAutoShape) {
    // 외곽선 모양을 뚜렷하게 나타내기 위한 외곽선 폴리곤 및 굵은 테두리
    guidePolygon = L.polygon(latlngs, {
      color: '#FF6D00',
      weight: 6,
      opacity: 0.95,
      fillColor: '#FFB300',
      fillOpacity: 0.18,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 출발점 깃발 마커
    const startPoint = latlngs[0];
    const flagIcon = L.divIcon({
      className: 'start-flag-marker',
      html: '<div class="start-flag-bubble">🏁 출발</div>',
      iconSize: [60, 30],
      iconAnchor: [30, 30]
    });
    startPointMarker = L.marker(startPoint, { icon: flagIcon }).addTo(map);

    // 도형 전체가 화면에 꽉 차도록 지도 영역 자동 이동
    map.fitBounds(guidePolygon.getBounds().pad(0.2));
  } else {
    // 수동 밑그림용 점선 폴리라인
    guidePolyline = L.polyline(latlngs, {
      color: '#FF9800',
      weight: 5,
      dashArray: '10, 8',
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
  }

  if (guidePoints.length >= 2) {
    updateStatus('외곽 코스 준비 완료 - 시작을 눌러 따라가세요');
  }
}

function removeGuidePolyline() {
  if (guidePolyline) {
    map.removeLayer(guidePolyline);
    guidePolyline = null;
  }
  if (guidePolygon) {
    map.removeLayer(guidePolygon);
    guidePolygon = null;
  }
  if (startPointMarker) {
    map.removeLayer(startPointMarker);
    startPointMarker = null;
  }
}

// --- 터치 / 마우스 제스처 그리기 (밑그림) ---
let isDrawing = false;
let strokeStartIndex = 0;
let lastDrawX = 0;
let lastDrawY = 0;
const DRAW_MIN_DISTANCE_SQ = 25 * 25; // 불필요한 포인트 수집 방지

function setupDrawingListeners() {
  removeDrawingListeners();
  mapContainer.classList.add('drawing-active');

  mapContainer.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

function removeDrawingListeners() {
  mapContainer.classList.remove('drawing-active');
  mapContainer.removeEventListener('pointerdown', onPointerDown);
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  if (map) map.dragging.enable();
}

function onPointerDown(e) {
  if (isTracking || isSnapping) return;
  // 멀티 터치(줌 제스처) 방해 안함
  if (e.isPrimary === false) return;

  isDrawing = true;
  map.dragging.disable();

  strokeStartIndex = guidePoints.length;
  lastDrawX = e.clientX;
  lastDrawY = e.clientY;

  addGuidePointFromScreen(e.clientX, e.clientY);
}

function onPointerMove(e) {
  if (!isDrawing) return;

  const dx = e.clientX - lastDrawX;
  const dy = e.clientY - lastDrawY;
  if (dx * dx + dy * dy >= DRAW_MIN_DISTANCE_SQ) {
    lastDrawX = e.clientX;
    lastDrawY = e.clientY;
    addGuidePointFromScreen(e.clientX, e.clientY);
  }
}

function onPointerUp(e) {
  if (!isDrawing) return;
  isDrawing = false;
  map.dragging.enable();

  addGuidePointFromScreen(e.clientX, e.clientY);
  snapStrokeToRoad(strokeStartIndex);
}

function addGuidePointFromScreen(x, y) {
  const rect = mapContainer.getBoundingClientRect();
  const point = L.point(x - rect.left, y - rect.top);
  const latlng = map.containerPointToLatLng(point);
  guidePoints.push({ lat: latlng.lat, lng: latlng.lng });
  updateGuidePolyline();
}

// --- OSRM Match API: 밑그림을 도로망에 스냅 ---
function snapStrokeToRoad(startIndex) {
  const strokePoints = guidePoints.slice(startIndex);
  if (strokePoints.length < 2) return;

  isSnapping = true;
  updateStatus('도로에 맞추는 중...');

  // OSRM 데모 서버 부하 방지를 위해 최대 25개로 균등 샘플링
  const MAX_POINTS = 25;
  let sampled = strokePoints;
  if (strokePoints.length > MAX_POINTS) {
    const step = strokePoints.length / MAX_POINTS;
    sampled = [];
    for (let i = 0; i < MAX_POINTS; i++) {
      sampled.push(strokePoints[Math.floor(i * step)]);
    }
  }

  const coordinates = sampled.map(p => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const apiUrl = `https://router.project-osrm.org/match/v1/driving/${coordinates}?overview=full&geometries=geojson`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      isSnapping = false;
      if (data.code === 'Ok' && data.matchings && data.matchings.length > 0) {
        const snapped = [];
        data.matchings.forEach(m => {
          if (m.geometry && m.geometry.coordinates) {
            m.geometry.coordinates.forEach(c => {
              snapped.push({ lat: c[1], lng: c[0] });
            });
          }
        });

        if (snapped.length > 0) {
          guidePoints.splice(startIndex, guidePoints.length - startIndex, ...snapped);
          updateGuidePolyline();
          return;
        }
      }

      showAlert('도로 매칭에 실패하여 손으로 그린 원본 경로를 유지합니다.');
      if (guidePoints.length >= 2) updateStatus('밑그림 완성 - 시작을 눌러 따라가세요');
    })
    .catch(err => {
      isSnapping = false;
      console.warn('OSRM Match error:', err);
      showAlert(`네트워크 오류: ${err.message}`);
      if (guidePoints.length >= 2) updateStatus('밑그림 완성 - 시작을 눌러 따라가세요');
    });
}

// --- 자동 모양 생성 (Auto Shape) ---
function showAutoShapeDialog() {
  autoShapeModal.style.display = 'flex';
}

function interpolateShape(basePoints, targetCount = 60) {
  if (basePoints.length === 0) return [];
  const result = [];
  let totalLen = 0;
  const distances = [];

  for (let i = 0; i < basePoints.length - 1; i++) {
    const d = Math.hypot(basePoints[i+1][0] - basePoints[i][0], basePoints[i+1][1] - basePoints[i][1]);
    distances.push(d);
    totalLen += d;
  }

  if (totalLen === 0) return basePoints;

  const step = totalLen / (targetCount - 1);
  let currentDist = 0;
  let currentSegment = 0;
  let segmentCovered = 0;

  result.push(basePoints[0]);

  for (let i = 1; i < targetCount - 1; i++) {
    const targetDist = i * step;
    while (currentSegment < distances.length && currentDist + (distances[currentSegment] - segmentCovered) < targetDist) {
      currentDist += distances[currentSegment] - segmentCovered;
      currentSegment++;
      segmentCovered = 0;
    }
    if (currentSegment >= basePoints.length - 1) break;
    const remaining = targetDist - currentDist;
    const ratio = (segmentCovered + remaining) / distances[currentSegment];
    const p1 = basePoints[currentSegment];
    const p2 = basePoints[currentSegment + 1];
    const x = p1[0] + (p2[0] - p1[0]) * ratio;
    const y = p1[1] + (p2[1] - p1[1]) * ratio;
    result.push([x, y]);
    segmentCovered += remaining;
    currentDist = targetDist;
  }

  result.push(basePoints[basePoints.length - 1]);
  return result;
}

function generateShape(shapeType, maxLengthKm) {
  clearAll();
  currentMode = Mode.FREE_DRAW;
  spinnerMode.value = 'FREE_DRAW';
  removeDrawingListeners();

  const center = map.getCenter();
  const basePoints = [];
  let idealLengthKm = 2.0;

  switch (shapeType) {
    case 0: // 강아지
      idealLengthKm = 2.0;
      basePoints.push([-0.5, -0.6], [-0.5, -0.1], [-0.8, 0.2], [-0.5, 0.3], [-0.4, 0.4], [0.2, 0.4], [0.3, 0.8], [0.5, 0.7], [0.7, 0.4], [0.6, 0.2], [0.4, 0.2], [0.3, -0.1], [0.3, -0.6], [0.1, -0.6], [0.1, -0.2], [-0.3, -0.2], [-0.3, -0.6], [-0.5, -0.6]);
      break;
    case 1: // 고양이
      idealLengthKm = 1.5;
      basePoints.push([-0.5,-0.5], [-0.6,-0.1], [-0.9,0.4], [-0.7,0.5], [-0.5,0.2], [-0.3,0.4], [0.3,0.4], [0.4,0.8], [0.6,0.6], [0.8,0.7], [0.9,0.4], [0.7,0.2], [0.6,-0.1], [0.7,-0.5], [0.5,-0.5], [0.4,-0.2], [-0.2,-0.2], [-0.3,-0.5], [-0.5,-0.5]);
      break;
    case 2: // 공룡
      idealLengthKm = 3.0;
      basePoints.push([-0.6,-0.7], [-0.6,-0.2], [-0.9,0.1], [-0.9,0.3], [-0.5,0.1], [-0.3,0.5], [-0.1,0.8], [0.4,0.8], [0.7,0.9], [0.9,0.7], [0.9,0.5], [0.4,0.5], [0.5,0.3], [0.3,0.3], [0.1,0.1], [0.1,-0.3], [-0.1,-0.3], [-0.1,-0.1], [-0.3,-0.1], [-0.4,-0.7], [-0.6,-0.7]);
      break;
    case 3: // 새
      idealLengthKm = 2.5;
      basePoints.push([-0.8,0.0], [-0.4,0.2], [-0.2,0.6], [0.0,0.2], [0.4,0.3], [0.8,0.1], [0.6,-0.1], [0.2,-0.1], [0.0,-0.4], [-0.2,-0.1], [-0.6,-0.2], [-0.8,0.0]);
      break;
    case 4: // 하트
      idealLengthKm = 1.5;
      for (let i = 0; i <= 36; i++) {
        const t = i * (2 * Math.PI / 36);
        const x = 16 * Math.pow(Math.sin(t), 3.0);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        basePoints.push([x / 16.0, y / 16.0]);
      }
      break;
    case 5: // 별
      idealLengthKm = 2.0;
      for (let i = 0; i <= 10; i++) {
        const angle = i * (Math.PI / 5) - Math.PI / 2;
        const r = (i % 2 === 0) ? 1.0 : 0.4;
        basePoints.push([r * Math.cos(angle), r * Math.sin(angle) * -1.0]);
      }
      break;
    case 6: // 자동차
      idealLengthKm = 2.0;
      basePoints.push([-0.8,-0.4], [-0.8,0.0], [-0.5,0.0], [-0.3,0.5], [0.3,0.5], [0.5,0.0], [0.8,0.0], [0.8,-0.4], [0.5,-0.4], [0.5,-0.6], [0.3,-0.6], [0.3,-0.4], [-0.3,-0.4], [-0.3,-0.6], [-0.5,-0.6], [-0.5,-0.4], [-0.8,-0.4]);
      break;
    case 7: // 물고기
      idealLengthKm = 1.5;
      basePoints.push([-0.8,-0.4], [-0.8,0.4], [-0.4,0.0], [0.0,0.5], [0.6,0.3], [0.8,0.0], [0.6,-0.3], [0.0,-0.5], [-0.4,0.0], [-0.8,-0.4]);
      break;
    case 8: // 집
      idealLengthKm = 1.5;
      basePoints.push([-0.6,-0.6], [-0.6,0.0], [-0.8,0.0], [0.0,0.7], [0.8,0.0], [0.6,0.0], [0.6,-0.6], [-0.6,-0.6]);
      break;
    case 9: // 왕관
      idealLengthKm = 2.0;
      basePoints.push([-0.7,-0.5], [-0.9,0.5], [-0.4,0.1], [0.0,0.7], [0.4,0.1], [0.9,0.5], [0.7,-0.5], [-0.7,-0.5]);
      break;
  }

  // 외곽 실루엣을 뚜렷하게 유지하기 위한 균등 보간
  const rawPoints = interpolateShape(basePoints, 50);
  const finalLengthKm = Math.min(idealLengthKm, maxLengthKm);

  // 상대 좌표계 둘레 계산
  let totalLengthRaw = 0;
  for (let i = 0; i < rawPoints.length - 1; i++) {
    const dx = rawPoints[i+1][0] - rawPoints[i][0];
    const dy = rawPoints[i+1][1] - rawPoints[i][1];
    totalLengthRaw += Math.hypot(dx, dy);
  }

  const scale = totalLengthRaw > 0 ? finalLengthKm / totalLengthRaw : 1.0;

  // 지도 위경도로 투영하여 명확한 외곽 윤곽선 생성
  const idealGeoPoints = rawPoints.map(p => {
    const dLat = (p[1] * scale) / 111.32;
    const dLon = (p[0] * scale) / (111.32 * Math.cos(center.lat * Math.PI / 180));
    return { lat: center.lat + dLat, lng: center.lng + dLon };
  });

  // 복잡한 도로 우회로 인한 모양 왜곡을 방지하고 요청한 겉모양을 100% 유지하는 기본 외곽선 확정
  guidePoints = idealGeoPoints;
  updateGuidePolyline(true);

  tvCurrentShape.textContent = `외곽 모양: ${SHAPE_NAMES[shapeType]} (${finalLengthKm.toFixed(1)}km)`;
  tvCurrentShape.style.display = 'block';
  updateStatus(`외곽 모양 생성 완료 - 🏁 출발점에서 시작하세요`);
}

// --- 공통 헬퍼 ---
function clearAll() {
  trackPoints = [];
  guidePoints = [];
  removeTrackPolyline();
  removeGuidePolyline();
  removeDrawingListeners();
  clearSavedData();
  tvCurrentShape.style.display = 'none';
}

// --- 로컬 데이터 저장 및 복원 ---
function saveDrawingData() {
  const data = {
    trackPoints,
    guidePoints,
    currentMode
  };
  localStorage.setItem('gps_art_drawing_data', JSON.stringify(data));
}

function loadDrawingData() {
  const saved = localStorage.getItem('gps_art_drawing_data');
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    if (data.trackPoints && Array.isArray(data.trackPoints)) {
      trackPoints = data.trackPoints;
      if (trackPoints.length >= 2) updateTrackPolyline();
    }
    if (data.guidePoints && Array.isArray(data.guidePoints)) {
      guidePoints = data.guidePoints;
      if (guidePoints.length >= 2) updateGuidePolyline();
    }

    // 시작 시에는 자유 그리기 모드로 안전하게 초기화
    currentMode = Mode.FREE_DRAW;
    spinnerMode.value = 'FREE_DRAW';
    removeDrawingListeners();
    updateStatus('준비 완료');
  } catch (e) {
    console.error('Failed to load drawing data:', e);
  }
}

function clearSavedData() {
  localStorage.removeItem('gps_art_drawing_data');
}
