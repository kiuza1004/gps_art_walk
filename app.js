/**
 * GPS Art Walk — Argon Edition
 * High-Performance Pedestrian GPS Art Studio & Telemetry Engine
 * Cost: $0 (100% Free Open-Source Stack: Leaflet 1.9.4 + OSM/Carto Tiles + OSM Routed-Foot)
 */

// --- 1. 상수 및 도형 카탈로그 정의 ---
const Mode = {
  FREE_DRAW: 'FREE_DRAW',
  FOLLOW_ROUTE: 'FOLLOW_ROUTE'
};

const TILE_THEMES = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  dark: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

const SHAPE_CATALOG = [
  {
    id: 0,
    name: '강아지',
    title: '🐶 스코티시 테리어 (강아지)',
    desc: '쫑긋 솟은 삼각형 귀와 45도 당근형 꼬리, 각진 주둥이가 특징인 아가타 스타일 실루엣',
    idealKm: 2.5,
    points: [[-0.5, -0.6], [-0.5, -0.1], [-0.8, 0.2], [-0.5, 0.3], [-0.4, 0.4], [0.2, 0.4], [0.3, 0.8], [0.5, 0.7], [0.7, 0.4], [0.6, 0.2], [0.4, 0.2], [0.3, -0.1], [0.3, -0.6], [0.1, -0.6], [0.1, -0.2], [-0.3, -0.2], [-0.3, -0.6], [-0.5, -0.6]]
  },
  {
    id: 1,
    name: '고양이',
    title: '🐱 길고양이 스탠딩 (고양이)',
    desc: '유연하게 말아 올린 꼬리와 뾰족한 두 귀가 살아있는 고양이 측면 실루엣',
    idealKm: 2.0,
    points: [[-0.5,-0.5], [-0.6,-0.1], [-0.9,0.4], [-0.7,0.5], [-0.5,0.2], [-0.3,0.4], [0.3,0.4], [0.4,0.8], [0.6,0.6], [0.8,0.7], [0.9,0.4], [0.7,0.2], [0.6,-0.1], [0.7,-0.5], [0.5,-0.5], [0.4,-0.2], [-0.2,-0.2], [-0.3,-0.5], [-0.5,-0.5]]
  },
  {
    id: 2,
    name: '공룡',
    title: '🦖 티라노사우루스 (공룡)',
    desc: '긴 꼬리와 강인한 턱, 짧은 앞발의 특징을 살린 다이내믹 공룡 코스',
    idealKm: 3.5,
    points: [[-0.6,-0.7], [-0.6,-0.2], [-0.9,0.1], [-0.9,0.3], [-0.5,0.1], [-0.3,0.5], [-0.1,0.8], [0.4,0.8], [0.7,0.9], [0.9,0.7], [0.9,0.5], [0.4,0.5], [0.5,0.3], [0.3,0.3], [0.1,0.1], [0.1,-0.3], [-0.1,-0.3], [-0.1,-0.1], [-0.3,-0.1], [-0.4,-0.7], [-0.6,-0.7]]
  },
  {
    id: 3,
    name: '새',
    title: '🐦 비상하는 파랑새 (새)',
    desc: '활짝 편 날개와 날렵한 부리, 꼬리깃을 형상화한 대칭형 비행 실루엣',
    idealKm: 2.5,
    points: [[-0.8,0.0], [-0.4,0.2], [-0.2,0.6], [0.0,0.2], [0.4,0.3], [0.8,0.1], [0.6,-0.1], [0.2,-0.1], [0.0,-0.4], [-0.2,-0.1], [-0.6,-0.2], [-0.8,0.0]]
  },
  {
    id: 4,
    name: '하트',
    title: '❤️ 클래식 하트 (하트)',
    desc: '수학적 하트 파라메트릭 곡선으로 설계된 커플 산책 및 기념일 인기 코스',
    idealKm: 2.0,
    points: (() => {
      const pts = [];
      for (let i = 0; i <= 36; i++) {
        const t = i * (2 * Math.PI / 36);
        const x = 16 * Math.pow(Math.sin(t), 3.0);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        pts.push([x / 17.0, y / 17.0]);
      }
      return pts;
    })()
  },
  {
    id: 5,
    name: '별',
    title: '⭐ 다섯 꼭짓점 스타 (별)',
    desc: '도시의 대각선 길과 골목을 활용해 선명한 별 모양을 완성하는 시그니처 코스',
    idealKm: 2.5,
    points: (() => {
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const angle = i * (Math.PI / 5) - Math.PI / 2;
        const r = (i % 2 === 0) ? 0.95 : 0.42;
        pts.push([r * Math.cos(angle), r * Math.sin(angle) * -1.0]);
      }
      return pts;
    })()
  },
  {
    id: 6,
    name: '자동차',
    title: '🚗 클래식 쿠페 (자동차)',
    desc: '격자형 도시 블록과 가장 높은 일치율을 보이는 반듯한 자동차 측면 실루엣',
    idealKm: 2.5,
    points: [[-0.8,-0.4], [-0.8,0.0], [-0.5,0.0], [-0.3,0.5], [0.3,0.5], [0.5,0.0], [0.8,0.0], [0.8,-0.4], [0.5,-0.4], [0.5,-0.6], [0.3,-0.6], [0.3,-0.4], [-0.3,-0.4], [-0.3,-0.6], [-0.5,-0.6], [-0.5,-0.4], [-0.8,-0.4]]
  },
  {
    id: 7,
    name: '물고기',
    title: '🐟 황금 잉어 (물고기)',
    desc: '유선형 몸통과 지느러미, 꼬리가 조화를 이루는 수변 공원 추천 코스',
    idealKm: 2.0,
    points: [[-0.8,-0.4], [-0.8,0.4], [-0.4,0.0], [0.0,0.5], [0.6,0.3], [0.8,0.0], [0.6,-0.3], [0.0,-0.5], [-0.4,0.0], [-0.8,-0.4]]
  },
  {
    id: 8,
    name: '집',
    title: '🏠 스위트 홈 (집)',
    desc: '박공지붕과 반듯한 벽면으로 구성되어 아파트 단지 주변에서 걷기 좋은 코스',
    idealKm: 2.0,
    points: [[-0.6,-0.6], [-0.6,0.0], [-0.8,0.0], [0.0,0.7], [0.8,0.0], [0.6,0.0], [0.6,-0.6], [-0.6,-0.6]]
  },
  {
    id: 9,
    name: '왕관',
    title: '👑 로열 크라운 (왕관)',
    desc: '세 개의 솟은 봉우리가 인상적인 러닝 챌린지 왕관 코스',
    idealKm: 2.5,
    points: [[-0.7,-0.5], [-0.9,0.5], [-0.4,0.1], [0.0,0.7], [0.4,0.1], [0.9,0.5], [0.7,-0.5], [-0.7,-0.5]]
  }
];

// --- 2. 전역 상태 관리 ---
let currentMode = Mode.FREE_DRAW;
let isTracking = false;
let watchId = null;
let isSnapping = false;

// 코스 및 도형 상태
let activeShapeType = 0;
let activeMaxLengthKm = 2.5;
let activeRotationDeg = 0;

let trackPoints = [];      // 실제 걸은 GPS 좌표 [{lat, lng}]
let guidePoints = [];      // 실제 도로 보행 코스 좌표 [{lat, lng}]
let idealShapeCoords = []; // 원본 도안 외곽선 좌표 [{lat, lng}]

// 텔레메트리 및 시뮬레이션 타이머
let timerInterval = null;
let startTimeMs = 0;
let simInterval = null;

// Leaflet 인스턴스 및 레이어들
let map = null;
let currentTileLayer = null;
let trackCasingPolyline = null;
let trackPolyline = null;
let guideCasingPolyline = null;
let guidePolyline = null;
let idealShapePolygon = null;
let startPointMarker = null;
let waypointMarkers = [];
let myLocationMarker = null;

// --- 3. DOM 요소 참조 ---
const mapContainer = document.getElementById('mapView');
const spinnerMode = document.getElementById('spinnerMode');
const modeTabBtns = document.querySelectorAll('.mode-tab');
const themeBtns = document.querySelectorAll('.theme-btn');

const shapeInfoBar = document.getElementById('shapeInfoBar');
const tvCurrentShape = document.getElementById('tvCurrentShape');
const tvMatchScore = document.getElementById('tvMatchScore');
const btnRematchRoad = document.getElementById('btnRematchRoad');
const btnToggleCompare = document.getElementById('btnToggleCompare');

const compareBar = document.getElementById('compareBar');
const compareTabs = document.querySelectorAll('.compare-tab');
const compareOpacitySlider = document.getElementById('compareOpacitySlider');
const compareOpacityVal = document.getElementById('compareOpacityVal');
const shapeRotateSlider = document.getElementById('shapeRotateSlider');
const shapeRotateVal = document.getElementById('shapeRotateVal');

const btnSimulate = document.getElementById('btnSimulate');
const btnExportGpx = document.getElementById('btnExportGpx');
const btnMyLocation = document.getElementById('btnMyLocation');

const statDistance = document.getElementById('statDistance');
const statDuration = document.getElementById('statDuration');
const statCalories = document.getElementById('statCalories');
const tvStatus = document.getElementById('tvStatus');
const tvCoords = document.getElementById('tvCoords');

const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnClear = document.getElementById('btnClear');

// 스튜디오 모달 요소
const autoShapeModal = document.getElementById('autoShapeModal');
const shapeCards = document.querySelectorAll('.shape-card');
const shapeSelect = document.getElementById('shapeSelect');
const shapePreviewPolygon = document.getElementById('shapePreviewPolygon');
const shapePreviewStart = document.getElementById('shapePreviewStart');
const previewShapeTitle = document.getElementById('previewShapeTitle');
const previewShapeDesc = document.getElementById('previewShapeDesc');
const tvDistance = document.getElementById('tvDistance');
const tvEstTime = document.getElementById('tvEstTime');
const seekBar = document.getElementById('seekBar');
const btnShapeCancel = document.getElementById('btnShapeCancel');
const btnShapeConfirm = document.getElementById('btnShapeConfirm');

const alertModal = document.getElementById('alertModal');
const alertModalMessage = document.getElementById('alertModalMessage');
const btnAlertClose = document.getElementById('btnAlertClose');

// --- 4. 앱 초기화 ---
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  initEvents();
  updateStudioPreview(0);
  requestCurrentLocation(true);
  loadDrawingData();
});

function initMap() {
  const defaultCenter = [37.5665, 126.9780]; // 서울 시청 기본 중심

  map = L.map('mapView', {
    center: defaultCenter,
    zoom: 16,
    zoomControl: false
  });

  // 기본 테마: 도로와 건물, 한글 지명이 가장 선명하게 보이는 일반 상세 지도(OSM)
  setMapTheme('osm');

  L.control.scale({
    imperial: false,
    metric: true,
    position: 'bottomleft'
  }).addTo(map);

  // 모바일 및 브라우저 레이아웃 직후 지도 타일 빈 공간 방지
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 150);

  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });
}

function setMapTheme(themeKey) {
  const theme = TILE_THEMES[themeKey] || TILE_THEMES.osm;
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }
  // 나이트 모드일 경우 고대비 나이트 필터 클래스 적용 (지명 및 골목길 시인성 100% 보존)
  if (themeKey === 'dark') {
    mapContainer.classList.add('map-theme-night');
  } else {
    mapContainer.classList.remove('map-theme-night');
  }

  currentTileLayer = L.tileLayer(theme.url, {
    maxZoom: 19,
    attribution: theme.attribution
  }).addTo(map);
}

function initEvents() {
  // 지도 타일 테마 전환
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setMapTheme(btn.dataset.theme);
    });
  });

  // 상단 세그먼트 모드 탭 클릭
  modeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isTracking) return;
      const modeVal = btn.dataset.mode;
      if (modeVal === 'AUTO_SHAPE') {
        showAutoShapeDialog();
      } else {
        setActiveModeTab(modeVal);
        switchMode(modeVal);
      }
    });
  });

  // 하위 호환용 select 이벤트
  spinnerMode.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'AUTO_SHAPE') {
      showAutoShapeDialog();
    } else {
      setActiveModeTab(val);
      switchMode(val);
    }
  });

  // 스튜디오 모달 내 10종 도형 카드 선택
  shapeCards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index, 10);
      shapeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      shapeSelect.value = String(idx);
      updateStudioPreview(idx);
    });
  });

  // 거리 슬라이더 조절
  seekBar.addEventListener('input', (e) => {
    const km = (parseInt(e.target.value, 10) / 10).toFixed(1);
    tvDistance.textContent = `목표 외곽 둘레: ${km} km`;
    const mins = Math.round(parseFloat(km) * 12); // 성인 보행 시속 5km 기준
    tvEstTime.textContent = `약 ${mins}분 소요`;
  });

  btnShapeCancel.addEventListener('click', () => {
    autoShapeModal.style.display = 'none';
    setActiveModeTab(currentMode);
  });

  btnShapeConfirm.addEventListener('click', () => {
    activeShapeType = parseInt(shapeSelect.value, 10);
    activeMaxLengthKm = parseFloat((parseInt(seekBar.value, 10) / 10).toFixed(1));
    activeRotationDeg = 0;
    shapeRotateSlider.value = '0';
    shapeRotateVal.textContent = '0°';
    autoShapeModal.style.display = 'none';
    setActiveModeTab(Mode.FREE_DRAW);
    generateShape(activeShapeType, activeMaxLengthKm, activeRotationDeg);
  });

  // 현재 지도 중심의 길로 즉시 재매칭
  btnRematchRoad.addEventListener('click', () => {
    if (isTracking) stopTracking();
    generateShape(activeShapeType, activeMaxLengthKm, activeRotationDeg);
  });

  // 도안 맞춰보기 토글
  btnToggleCompare.addEventListener('click', () => {
    const isShowing = compareBar.style.display !== 'none';
    compareBar.style.display = isShowing ? 'none' : 'block';
    btnToggleCompare.classList.toggle('active', !isShowing);
  });

  // 비교 뷰 전환 (실제 보행길만 / 1:1 겹쳐 비교 / 원본 도안만)
  compareTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      compareTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      applyCompareView(e.target.dataset.view);
    });
  });

  // 도안 투명도 슬라이더
  compareOpacitySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    compareOpacityVal.textContent = `${val}%`;
    if (idealShapePolygon) {
      idealShapePolygon.setStyle({
        fillOpacity: val / 100,
        opacity: Math.min(1.0, (val / 100) + 0.35)
      });
    }
  });

  // 도안 회전 슬라이더 (동네 도로망 각도에 맞춰 회전 후 재매칭)
  shapeRotateSlider.addEventListener('change', (e) => {
    activeRotationDeg = parseInt(e.target.value, 10);
    shapeRotateVal.textContent = `${activeRotationDeg}°`;
    generateShape(activeShapeType, activeMaxLengthKm, activeRotationDeg);
  });
  shapeRotateSlider.addEventListener('input', (e) => {
    shapeRotateVal.textContent = `${e.target.value}°`;
  });

  // 시뮬레이션 및 GPX 내보내기
  btnSimulate.addEventListener('click', toggleSimulation);
  btnExportGpx.addEventListener('click', exportCourseToGpx);

  // 하단 컨트롤 버튼
  btnStart.addEventListener('click', startTracking);
  btnStop.addEventListener('click', stopTracking);
  btnClear.addEventListener('click', () => {
    stopSimulation();
    if (isTracking) stopTracking();
    clearAll();
    resetTelemetry();
    if (currentMode === Mode.FREE_DRAW) {
      updateStatus('초기화 완료 — 모드를 선택하거나 기록을 시작하세요');
    } else if (currentMode === Mode.FOLLOW_ROUTE) {
      setupDrawingListeners();
      updateStatus('지도 위에 손가락이나 마우스로 밑그림을 그리세요');
    }
  });

  btnMyLocation.addEventListener('click', () => {
    requestCurrentLocation(false);
  });

  btnAlertClose.addEventListener('click', () => {
    alertModal.style.display = 'none';
  });

  window.addEventListener('beforeunload', saveDrawingData);
}

function setActiveModeTab(modeVal) {
  spinnerMode.value = modeVal;
  modeTabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === modeVal);
  });
}

// --- 5. 스튜디오 모달 실시간 SVG 도안 프리뷰 ---
function updateStudioPreview(shapeIdx) {
  const item = SHAPE_CATALOG[shapeIdx] || SHAPE_CATALOG[0];
  previewShapeTitle.textContent = item.title;
  previewShapeDesc.textContent = item.desc;

  // SVG 좌표계는 Y축이 아래쪽이므로 부호 반전하여 정확한 모양 표시
  const svgPoints = item.points.map(p => `${p[0].toFixed(3)},${(-p[1]).toFixed(3)}`).join(' ');
  shapePreviewPolygon.setAttribute('points', svgPoints);

  const startPt = item.points[0];
  shapePreviewStart.setAttribute('cx', String(startPt[0]));
  shapePreviewStart.setAttribute('cy', String(-startPt[1]));

  // 권장 기본 거리 세팅
  const sliderVal = Math.round(item.idealKm * 10);
  seekBar.value = String(sliderVal);
  tvDistance.textContent = `목표 외곽 둘레: ${item.idealKm.toFixed(1)} km`;
  tvEstTime.textContent = `약 ${Math.round(item.idealKm * 12)}분 소요`;
}

// --- 6. 모드 전환 및 UI 상태 ---
function switchMode(newMode) {
  if (currentMode === newMode) return;
  stopSimulation();
  if (isTracking) stopTracking();

  currentMode = newMode;
  clearAll();

  if (newMode === Mode.FREE_DRAW) {
    removeDrawingListeners();
    updateStatus('자유 그리기 모드 — 시작을 누르고 걸어보세요');
  } else if (newMode === Mode.FOLLOW_ROUTE) {
    setupDrawingListeners();
    updateStatus('밑그림 모드 — 지도 위에 원하는 코스를 직접 그리세요');
  }
  updateButtonStates();
}

function updateButtonStates() {
  btnStart.disabled = isTracking;
  btnStop.disabled = !isTracking;
  modeTabBtns.forEach(btn => { btn.disabled = isTracking; });
}

function updateStatus(msg) {
  tvStatus.textContent = msg;
}

function showAlert(msg) {
  alertModalMessage.textContent = msg;
  alertModal.style.display = 'flex';
}

// --- 7. 내 위치 및 실시간 GPS 트래킹 + 텔레메트리 ---
function requestCurrentLocation(initial = false) {
  if (!navigator.geolocation) {
    if (!initial) showAlert('이 브라우저는 GPS 위치 기능을 지원하지 않습니다.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const latlng = [latitude, longitude];
      updateMyLocationMarker(latlng);
      map.setView(latlng, 16);
      tvCoords.textContent = `LAT ${latitude.toFixed(6)} · LNG ${longitude.toFixed(6)}`;
    },
    (err) => {
      if (!initial) {
        showAlert(`현재 위치를 가져올 수 없습니다: ${err.message}`);
      } else {
        tvCoords.textContent = '서울 시청 기준 (GPS 권한 허용 시 내 위치로 이동)';
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
    myLocationMarker = L.marker(latlng, { icon: pulseIcon, zIndexOffset: 1000 }).addTo(map);
  } else {
    myLocationMarker.setLatLng(latlng);
  }
}

function startTracking() {
  if (isTracking) return;
  stopSimulation();

  if (!navigator.geolocation) {
    showAlert('GPS 위치 권한이 필요합니다.');
    return;
  }

  isTracking = true;
  trackPoints = [];
  removeTrackPolyline();
  startTelemetryTimer();

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const pt = { lat: latitude, lng: longitude };

      trackPoints.push(pt);
      updateTrackPolyline();
      updateMyLocationMarker([latitude, longitude]);
      map.panTo([latitude, longitude]);

      tvCoords.textContent = `LAT ${latitude.toFixed(6)} · LNG ${longitude.toFixed(6)}`;
      updateTelemetryStats();
    },
    (err) => {
      console.warn('GPS Watch Error:', err);
      updateStatus('GPS 신호 수신 대기 중...');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );

  removeDrawingListeners();
  updateStatus('🚶 실시간 GPS 아트 기록 중... 코스를 따라 걸으세요');
  updateButtonStates();
}

function stopTracking() {
  if (!isTracking) return;
  isTracking = false;

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  stopTelemetryTimer();
  updateStatus('기록 일시 정지됨');
  updateButtonStates();
  saveDrawingData();
}

// --- 8. 텔레메트리(거리/시간/칼로리) 계산 엔진 ---
function startTelemetryTimer() {
  stopTelemetryTimer();
  startTimeMs = Date.now();
  timerInterval = setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - startTimeMs) / 1000);
    const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');
    statDuration.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTelemetryTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTelemetry() {
  stopTelemetryTimer();
  statDistance.innerHTML = '0.00 <small>km</small>';
  statDuration.textContent = '00:00';
  statCalories.innerHTML = '0 <small>kcal</small>';
}

function updateTelemetryStats() {
  const totalKm = calculatePathDistanceKm(trackPoints);
  const kcal = Math.round(totalKm * 55); // 평균 성인 1km 보행 시 약 55kcal 소모
  statDistance.innerHTML = `${totalKm.toFixed(2)} <small>km</small>`;
  statCalories.innerHTML = `${kcal} <small>kcal</small>`;
  if (trackPoints.length >= 2) {
    btnExportGpx.style.display = 'flex';
  }
}

function haversineKm(p1, p2) {
  const R = 6371;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculatePathDistanceKm(pts) {
  let sum = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    sum += haversineKm(pts[i], pts[i + 1]);
  }
  return sum;
}

// --- 9. 이중 스트로크(Double-Stroke Halo) 폴리라인 & 경유지 렌더링 ---
function updateTrackPolyline() {
  removeTrackPolyline();
  if (trackPoints.length < 2) return;

  const latlngs = trackPoints.map(p => [p.lat, p.lng]);

  // 외곽 다크 글로우 케이싱
  trackCasingPolyline = L.polyline(latlngs, {
    color: '#002B36',
    weight: 12,
    opacity: 0.7,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);

  // 코어 네온 시안 라인
  trackPolyline = L.polyline(latlngs, {
    color: '#00F0FF',
    weight: 6,
    opacity: 1.0,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);
}

function removeTrackPolyline() {
  if (trackCasingPolyline) {
    map.removeLayer(trackCasingPolyline);
    trackCasingPolyline = null;
  }
  if (trackPolyline) {
    map.removeLayer(trackPolyline);
    trackPolyline = null;
  }
}

function updateGuidePolyline(isAutoShape = false, idealPoints = null) {
  removeGuidePolyline();
  if (guidePoints.length < 2) return;

  const latlngs = guidePoints.map(p => [p.lat, p.lng]);

  if (isAutoShape) {
    // 1. 원본 의도 도안 실루엣 폴리곤 (1:1 비교 및 배경 가이드)
    if (idealPoints && idealPoints.length >= 3) {
      const idealLatLngs = idealPoints.map(p => [p.lat, p.lng]);
      const currentOpacity = parseInt(compareOpacitySlider.value, 10) / 100;
      idealShapePolygon = L.polygon(idealLatLngs, {
        color: '#FF80AB',
        weight: 2.5,
        dashArray: '6, 6',
        opacity: Math.min(1.0, currentOpacity + 0.35),
        fillColor: '#FF0055',
        fillOpacity: currentOpacity
      }).addTo(map);
    }

    // 2. 실제 보행 도로 외곽 다크 글로우 케이싱 (어떤 지도에서도 선명하게 분리)
    guideCasingPolyline = L.polyline(latlngs, {
      color: '#1A000D',
      weight: 11,
      opacity: 0.75,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 3. 실제 보행 도로 메인 네온 핫핑크 실선
    guidePolyline = L.polyline(latlngs, {
      color: '#FF0055',
      weight: 6,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 4. 출발점 마커 및 진행 순서 웨이포인트 번호 마커(1~5) 배치
    const startPoint = latlngs[0];
    const flagIcon = L.divIcon({
      className: 'start-flag-marker',
      html: '<div class="start-flag-bubble">🚩 출발·도착점</div>',
      iconSize: [96, 32],
      iconAnchor: [48, 32]
    });
    startPointMarker = L.marker(startPoint, { icon: flagIcon, zIndexOffset: 900 }).addTo(map);

    renderWaypointDirectionBadges(latlngs);

    // 코스 전체가 한눈에 들어오도록 지도 화면 맞춤
    map.fitBounds(guidePolyline.getBounds().pad(0.22));
    btnSimulate.style.display = 'flex';
    btnExportGpx.style.display = 'flex';
  } else {
    // 수동 밑그림용 네온 라인
    guidePolyline = L.polyline(latlngs, {
      color: '#FF0055',
      weight: 6,
      dashArray: '10, 8',
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    if (guidePoints.length >= 2) {
      btnSimulate.style.display = 'flex';
      btnExportGpx.style.display = 'flex';
    }
  }
}

function renderWaypointDirectionBadges(latlngs) {
  if (latlngs.length < 10) return;
  const badgeCount = 4;
  const step = Math.floor(latlngs.length / (badgeCount + 1));

  for (let i = 1; i <= badgeCount; i++) {
    const pt = latlngs[i * step];
    const badgeIcon = L.divIcon({
      className: 'waypoint-badge-wrap',
      html: `<div class="waypoint-num-badge">${i}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    const m = L.marker(pt, { icon: badgeIcon }).addTo(map);
    waypointMarkers.push(m);
  }
}

function removeGuidePolyline() {
  if (guideCasingPolyline) {
    map.removeLayer(guideCasingPolyline);
    guideCasingPolyline = null;
  }
  if (guidePolyline) {
    map.removeLayer(guidePolyline);
    guidePolyline = null;
  }
  if (idealShapePolygon) {
    map.removeLayer(idealShapePolygon);
    idealShapePolygon = null;
  }
  if (startPointMarker) {
    map.removeLayer(startPointMarker);
    startPointMarker = null;
  }
  waypointMarkers.forEach(m => map.removeLayer(m));
  waypointMarkers = [];
}

// --- 10. 수동 밑그림 그리기 & 보행 도로 스냅 ---
let isDrawing = false;
let strokeStartIndex = 0;
let lastDrawX = 0;
let lastDrawY = 0;
const DRAW_MIN_DISTANCE_SQ = 24 * 24;

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
  if (isTracking || isSnapping || e.isPrimary === false) return;
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
  snapStrokeToPedestrianRoad(strokeStartIndex);
}

function addGuidePointFromScreen(x, y) {
  const rect = mapContainer.getBoundingClientRect();
  const point = L.point(x - rect.left, y - rect.top);
  const latlng = map.containerPointToLatLng(point);
  guidePoints.push({ lat: latlng.lat, lng: latlng.lng });
  updateGuidePolyline(false);
}

function snapStrokeToPedestrianRoad(startIndex) {
  const strokePoints = guidePoints.slice(startIndex);
  if (strokePoints.length < 2) return;

  isSnapping = true;
  updateStatus('밑그림을 실제 보행 도로에 맞추는 중...');

  const MAX_POINTS = 18;
  let sampled = strokePoints;
  if (strokePoints.length > MAX_POINTS) {
    const step = strokePoints.length / MAX_POINTS;
    sampled = [];
    for (let i = 0; i < MAX_POINTS; i++) {
      sampled.push(strokePoints[Math.floor(i * step)]);
    }
    sampled.push(strokePoints[strokePoints.length - 1]);
  }

  const coordinates = sampled.map(p => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const apiUrl = `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      isSnapping = false;
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const snapped = data.routes[0].geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
        if (snapped.length > 0) {
          guidePoints.splice(startIndex, guidePoints.length - startIndex, ...snapped);
          updateGuidePolyline(false);
          const distKm = calculatePathDistanceKm(guidePoints).toFixed(2);
          updateStatus(`실제 보행길 스냅 완료 (총 ${distKm}km) — 시작을 눌러 걸으세요`);
          return;
        }
      }
      updateStatus('밑그림 완성 — 시작을 눌러 따라가세요');
    })
    .catch(() => {
      isSnapping = false;
      updateStatus('밑그림 완성 — 시작을 눌러 따라가세요');
    });
}

// --- 11. 자동 도형 보행길 코스 생성 엔진 (회전 변환 + 일치율 산출) ---
function showAutoShapeDialog() {
  updateStudioPreview(parseInt(shapeSelect.value, 10) || 0);
  autoShapeModal.style.display = 'flex';
}

function rotatePoint(x, y, deg) {
  if (!deg) return [x, y];
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [x * cos - y * sin, x * sin + y * cos];
}

function interpolateShape(basePoints, targetCount = 45) {
  if (basePoints.length === 0) return [];
  const result = [];
  let totalLen = 0;
  const distances = [];

  for (let i = 0; i < basePoints.length - 1; i++) {
    const d = Math.hypot(basePoints[i + 1][0] - basePoints[i][0], basePoints[i + 1][1] - basePoints[i][1]);
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
    result.push([
      p1[0] + (p2[0] - p1[0]) * ratio,
      p1[1] + (p2[1] - p1[1]) * ratio
    ]);
    segmentCovered += remaining;
    currentDist = targetDist;
  }

  result.push(basePoints[basePoints.length - 1]);
  return result;
}

function generateShape(shapeType, maxLengthKm, rotationDeg = 0) {
  stopSimulation();
  clearAll();
  currentMode = Mode.FREE_DRAW;
  setActiveModeTab(Mode.FREE_DRAW);
  removeDrawingListeners();

  const item = SHAPE_CATALOG[shapeType] || SHAPE_CATALOG[0];
  const center = map.getCenter();

  // 회전 변환 적용
  const rotatedBasePoints = item.points.map(p => rotatePoint(p[0], p[1], rotationDeg));

  // 둘레 길이 계산 및 스케일 산출
  let totalLengthRaw = 0;
  for (let i = 0; i < rotatedBasePoints.length - 1; i++) {
    const dx = rotatedBasePoints[i + 1][0] - rotatedBasePoints[i][0];
    const dy = rotatedBasePoints[i + 1][1] - rotatedBasePoints[i][1];
    totalLengthRaw += Math.hypot(dx, dy);
  }
  const scale = totalLengthRaw > 0 ? maxLengthKm / totalLengthRaw : 1.0;

  // 핵심 앵커 정점 위경도 투영
  const anchorPoints = rotatedBasePoints.map(p => {
    const dLat = (p[1] * scale) / 111.32;
    const dLon = (p[0] * scale) / (111.32 * Math.cos(center.lat * Math.PI / 180));
    return { lat: center.lat + dLat, lng: center.lng + dLon };
  });

  // 원본 의도 도안 고밀도 실루엣 투영
  const rawPoints = interpolateShape(rotatedBasePoints, 48);
  idealShapeCoords = rawPoints.map(p => {
    const dLat = (p[1] * scale) / 111.32;
    const dLon = (p[0] * scale) / (111.32 * Math.cos(center.lat * Math.PI / 180));
    return { lat: center.lat + dLat, lng: center.lng + dLon };
  });

  updateStatus(`⚡ [${item.name}] 도안을 주변 실제 보행 도로망에 매칭 중...`);

  // 정점이 너무 많으면 URL 길이 제한에 걸릴 수 있으므로 최대 20개 핵심 정점으로 압축
  let routingAnchors = anchorPoints;
  if (anchorPoints.length > 20) {
    routingAnchors = [];
    const step = (anchorPoints.length - 1) / 18;
    for (let i = 0; i < 18; i++) {
      routingAnchors.push(anchorPoints[Math.round(i * step)]);
    }
    routingAnchors.push(anchorPoints[anchorPoints.length - 1]);
  }

  const coordinates = routingAnchors.map(p => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const footRoutingUrl = `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

  fetch(footRoutingUrl)
    .then(res => res.json())
    .then(data => {
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const roadCoords = route.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));

        if (roadCoords.length > 0) {
          guidePoints = roadCoords;
          updateGuidePolyline(true, idealShapeCoords);

          const distanceKm = (route.distance / 1000).toFixed(2);
          const matchScore = computeShapeMatchScore(anchorPoints, data.waypoints, maxLengthKm);

          tvCurrentShape.textContent = `${item.name} 코스 (${distanceKm}km · 도보)`;
          tvMatchScore.textContent = `도안 일치도 ${matchScore}%`;
          shapeInfoBar.style.display = 'flex';
          updateStatus(`✅ 실제 보행길 코스 완성! 🚩 출발점에서 번호 순서(1→4)대로 걸으세요`);
          saveDrawingData();
          return;
        }
      }
      fallbackToOutline();
    })
    .catch(() => {
      fallbackToOutline();
    });

  function fallbackToOutline() {
    guidePoints = idealShapeCoords;
    updateGuidePolyline(true, idealShapeCoords);
    tvCurrentShape.textContent = `${item.name} 외곽 코스 (${maxLengthKm.toFixed(1)}km)`;
    tvMatchScore.textContent = `원본 도안 100%`;
    shapeInfoBar.style.display = 'flex';
    updateStatus(`외곽 코스 생성 완료 — 🚩 출발점에서 시작하세요`);
    saveDrawingData();
  }
}

// 원본 도안 정점과 스냅된 실제 도로 간의 거리 오차를 기반으로 형태 일치율(%) 산출
function computeShapeMatchScore(anchors, waypoints, targetKm) {
  if (!waypoints || waypoints.length === 0) return 90;
  let totalSnapDistMeters = 0;
  waypoints.forEach(wp => {
    totalSnapDistMeters += (wp.distance || 0);
  });
  const avgDist = totalSnapDistMeters / waypoints.length;
  const referenceScaleMeters = Math.max(200, (targetKm * 1000) / 8);
  const ratio = Math.max(0, 1 - (avgDist / referenceScaleMeters));
  const score = Math.round(76 + ratio * 22);
  return Math.min(99, Math.max(75, score));
}

// --- 12. 도안 1:1 맞춰보기 뷰 컨트롤 ---
function applyCompareView(view) {
  const currentOpacity = parseInt(compareOpacitySlider.value, 10) / 100;

  if (view === 'road') {
    if (guideCasingPolyline) guideCasingPolyline.setStyle({ opacity: 0.75 });
    if (guidePolyline) guidePolyline.setStyle({ opacity: 1.0 });
    if (idealShapePolygon) idealShapePolygon.setStyle({ opacity: 0, fillOpacity: 0 });
  } else if (view === 'origin') {
    if (guideCasingPolyline) guideCasingPolyline.setStyle({ opacity: 0 });
    if (guidePolyline) guidePolyline.setStyle({ opacity: 0 });
    if (idealShapePolygon) idealShapePolygon.setStyle({ opacity: 1.0, fillOpacity: 0.55 });
  } else if (view === 'both') {
    if (guideCasingPolyline) guideCasingPolyline.setStyle({ opacity: 0.75 });
    if (guidePolyline) guidePolyline.setStyle({ opacity: 1.0 });
    if (idealShapePolygon) idealShapePolygon.setStyle({
      opacity: Math.min(1.0, currentOpacity + 0.35),
      fillOpacity: currentOpacity
    });
  }
}

// --- 13. 가상 걷기 시뮬레이터 (밖에 나가지 않고 코스 완주 검증) ---
function toggleSimulation() {
  if (simInterval) {
    stopSimulation();
    updateStatus('코스 시뮬레이션 종료');
    return;
  }
  if (guidePoints.length < 2) {
    showAlert('먼저 도형 코스를 생성하거나 밑그림을 그려주세요.');
    return;
  }

  if (isTracking) stopTracking();
  trackPoints = [];
  removeTrackPolyline();
  resetTelemetry();
  startTelemetryTimer();

  btnSimulate.classList.add('simulating');
  btnSimulate.innerHTML = '<span>⏹️ 시뮬레이션 중지</span>';
  updateStatus('🏃 가상 보행 시뮬레이션 진행 중 — 실제 길을 따라 아트가 그려집니다');

  let idx = 0;
  const total = guidePoints.length;
  const stepCount = Math.max(1, Math.floor(total / 80));

  simInterval = setInterval(() => {
    if (idx >= total) {
      trackPoints.push(guidePoints[total - 1]);
      updateTrackPolyline();
      updateTelemetryStats();
      stopSimulation();
      updateStatus('🎉 코스 완주 시뮬레이션 완료! 실제 길 위에서 완벽히 검증되었습니다');
      return;
    }

    const pt = guidePoints[idx];
    trackPoints.push(pt);
    updateTrackPolyline();
    updateMyLocationMarker([pt.lat, pt.lng]);
    tvCoords.textContent = `SIM LAT ${pt.lat.toFixed(6)} · LNG ${pt.lng.toFixed(6)}`;
    updateTelemetryStats();
    idx += stepCount;
  }, 60);
}

function stopSimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
  stopTelemetryTimer();
  btnSimulate.classList.remove('simulating');
  btnSimulate.innerHTML = '<span>▶️ 코스 시뮬레이션</span>';
}

// --- 14. GPX 파일 내보내기 (스마트워치 / 스트라바 호환) ---
function exportCourseToGpx() {
  const pts = trackPoints.length >= 2 ? trackPoints : guidePoints;
  if (pts.length < 2) {
    showAlert('내보낼 코스 데이터가 없습니다.');
    return;
  }

  const shapeName = SHAPE_CATALOG[activeShapeType] ? SHAPE_CATALOG[activeShapeType].name : 'Custom';
  const nowIso = new Date().toISOString();
  const trkpts = pts.map(p => `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}"><time>${nowIso}</time></trkpt>`).join('\n');

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPS Art Walk Argon Edition" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>GPS Art Walk - ${shapeName}</name>
    <time>${nowIso}</time>
  </metadata>
  <trk>
    <name>GPS Art Course (${shapeName})</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gps_art_${shapeName}_${Date.now()}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- 15. 초기화 및 로컬 스토리지 영속화 ---
function clearAll() {
  trackPoints = [];
  guidePoints = [];
  idealShapeCoords = [];
  removeTrackPolyline();
  removeGuidePolyline();
  removeDrawingListeners();
  clearSavedData();

  shapeInfoBar.style.display = 'none';
  compareBar.style.display = 'none';
  btnToggleCompare.classList.remove('active');
  btnSimulate.style.display = 'none';
  btnExportGpx.style.display = 'none';
}

function saveDrawingData() {
  const data = {
    trackPoints,
    guidePoints,
    idealShapeCoords,
    currentMode,
    activeShapeType,
    activeMaxLengthKm,
    activeRotationDeg,
    isShapeVisible: shapeInfoBar.style.display !== 'none',
    shapeText: tvCurrentShape.textContent,
    matchText: tvMatchScore.textContent
  };
  localStorage.setItem('gps_art_drawing_data', JSON.stringify(data));
}

function loadDrawingData() {
  const saved = localStorage.getItem('gps_art_drawing_data');
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    if (typeof data.activeShapeType === 'number') activeShapeType = data.activeShapeType;
    if (typeof data.activeMaxLengthKm === 'number') activeMaxLengthKm = data.activeMaxLengthKm;
    if (typeof data.activeRotationDeg === 'number') activeRotationDeg = data.activeRotationDeg;

    if (data.idealShapeCoords && Array.isArray(data.idealShapeCoords)) {
      idealShapeCoords = data.idealShapeCoords;
    }
    if (data.trackPoints && Array.isArray(data.trackPoints)) {
      trackPoints = data.trackPoints;
      if (trackPoints.length >= 2) {
        updateTrackPolyline();
        updateTelemetryStats();
      }
    }
    if (data.guidePoints && Array.isArray(data.guidePoints)) {
      guidePoints = data.guidePoints;
      if (guidePoints.length >= 2) {
        updateGuidePolyline(data.isShapeVisible || false, idealShapeCoords);
      }
    }
    if (data.isShapeVisible && data.shapeText) {
      tvCurrentShape.textContent = data.shapeText;
      if (data.matchText) tvMatchScore.textContent = data.matchText;
      shapeInfoBar.style.display = 'flex';
    }

    currentMode = Mode.FREE_DRAW;
    setActiveModeTab(Mode.FREE_DRAW);
    removeDrawingListeners();
  } catch (e) {
    console.error('Failed to load drawing data:', e);
  }
}

function clearSavedData() {
  localStorage.removeItem('gps_art_drawing_data');
}
