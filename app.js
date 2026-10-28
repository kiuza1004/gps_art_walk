/**
 * GPS Art Walk — Argon Edition
 * Full-Screen Zen Map Mode + Saved Course Vault + Zero-Flicker Theme Switcher
 * Cost: $0 (100% Free Open-Source Stack)
 */

// --- 1. 상수 및 10종 도형 카탈로그 ---
const Mode = {
  FREE_DRAW: 'FREE_DRAW',
  FOLLOW_ROUTE: 'FOLLOW_ROUTE'
};

const VAULT_STORAGE_KEY = 'gps_art_saved_vault_v1';

const SHAPE_CATALOG = [
  {
    id: 0,
    icon: '🐶',
    name: '강아지',
    title: '🐶 스코티시 테리어 (강아지)',
    desc: '쫑긋 솟은 삼각형 귀와 45도 당근형 꼬리, 각진 주둥이가 특징인 아가타 스타일 실루엣',
    idealKm: 2.5,
    points: [[-0.5, -0.6], [-0.5, -0.1], [-0.8, 0.2], [-0.5, 0.3], [-0.4, 0.4], [0.2, 0.4], [0.3, 0.8], [0.5, 0.7], [0.7, 0.4], [0.6, 0.2], [0.4, 0.2], [0.3, -0.1], [0.3, -0.6], [0.1, -0.6], [0.1, -0.2], [-0.3, -0.2], [-0.3, -0.6], [-0.5, -0.6]]
  },
  {
    id: 1,
    icon: '🐱',
    name: '고양이',
    title: '🐱 길고양이 스탠딩 (고양이)',
    desc: '유연하게 말아 올린 꼬리와 뾰족한 두 귀가 살아있는 고양이 측면 실루엣',
    idealKm: 2.0,
    points: [[-0.5,-0.5], [-0.6,-0.1], [-0.9,0.4], [-0.7,0.5], [-0.5,0.2], [-0.3,0.4], [0.3,0.4], [0.4,0.8], [0.6,0.6], [0.8,0.7], [0.9,0.4], [0.7,0.2], [0.6,-0.1], [0.7,-0.5], [0.5,-0.5], [0.4,-0.2], [-0.2,-0.2], [-0.3,-0.5], [-0.5,-0.5]]
  },
  {
    id: 2,
    icon: '🦖',
    name: '공룡',
    title: '🦖 티라노사우루스 (공룡)',
    desc: '긴 꼬리와 강인한 턱, 짧은 앞발의 특징을 살린 다이내믹 공룡 코스',
    idealKm: 3.5,
    points: [[-0.6,-0.7], [-0.6,-0.2], [-0.9,0.1], [-0.9,0.3], [-0.5,0.1], [-0.3,0.5], [-0.1,0.8], [0.4,0.8], [0.7,0.9], [0.9,0.7], [0.9,0.5], [0.4,0.5], [0.5,0.3], [0.3,0.3], [0.1,0.1], [0.1,-0.3], [-0.1,-0.3], [-0.1,-0.1], [-0.3,-0.1], [-0.4,-0.7], [-0.6,-0.7]]
  },
  {
    id: 3,
    icon: '🐦',
    name: '새',
    title: '🐦 비상하는 파랑새 (새)',
    desc: '활짝 편 날개와 날렵한 부리, 꼬리깃을 형상화한 대칭형 비행 실루엣',
    idealKm: 2.5,
    points: [[-0.8,0.0], [-0.4,0.2], [-0.2,0.6], [0.0,0.2], [0.4,0.3], [0.8,0.1], [0.6,-0.1], [0.2,-0.1], [0.0,-0.4], [-0.2,-0.1], [-0.6,-0.2], [-0.8,0.0]]
  },
  {
    id: 4,
    icon: '❤️',
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
    icon: '⭐',
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
    icon: '🚗',
    name: '자동차',
    title: '🚗 클래식 쿠페 (자동차)',
    desc: '격자형 도시 블록과 가장 높은 일치율을 보이는 반듯한 자동차 측면 실루엣',
    idealKm: 2.5,
    points: [[-0.8,-0.4], [-0.8,0.0], [-0.5,0.0], [-0.3,0.5], [0.3,0.5], [0.5,0.0], [0.8,0.0], [0.8,-0.4], [0.5,-0.4], [0.5,-0.6], [0.3,-0.6], [0.3,-0.4], [-0.3,-0.4], [-0.3,-0.6], [-0.5,-0.6], [-0.5,-0.4], [-0.8,-0.4]]
  },
  {
    id: 7,
    icon: '🐟',
    name: '물고기',
    title: '🐟 황금 잉어 (물고기)',
    desc: '유선형 몸통과 지느러미, 꼬리가 조화를 이루는 수변 공원 추천 코스',
    idealKm: 2.0,
    points: [[-0.8,-0.4], [-0.8,0.4], [-0.4,0.0], [0.0,0.5], [0.6,0.3], [0.8,0.0], [0.6,-0.3], [0.0,-0.5], [-0.4,0.0], [-0.8,-0.4]]
  },
  {
    id: 8,
    icon: '🏠',
    name: '집',
    title: '🏠 스위트 홈 (집)',
    desc: '박공지붕과 반듯한 벽면으로 구성되어 아파트 단지 주변에서 걷기 좋은 코스',
    idealKm: 2.0,
    points: [[-0.6,-0.6], [-0.6,0.0], [-0.8,0.0], [0.0,0.7], [0.8,0.0], [0.6,0.0], [0.6,-0.6], [-0.6,-0.6]]
  },
  {
    id: 9,
    icon: '👑',
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
let isZenMode = false;
let watchId = null;
let isSnapping = false;

let activeShapeType = 0;
let activeMaxLengthKm = 2.5;
let activeRotationDeg = 0;

let trackPoints = [];
let guidePoints = [];
let idealShapeCoords = [];

let timerInterval = null;
let startTimeMs = 0;
let simInterval = null;

// Leaflet 객체
let map = null;
let baseTileLayer = null;
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
const modeTabBtns = document.querySelectorAll('.mode-tab[data-mode]');
const themeBtns = document.querySelectorAll('.theme-btn');

// 미니 HUD & Zen 모드 버튼
const miniHudBar = document.getElementById('miniHudBar');
const miniCourseTitle = document.getElementById('miniCourseTitle');
const miniDistanceText = document.getElementById('miniDistanceText');
const btnMiniQuickTrack = document.getElementById('btnMiniQuickTrack');
const btnMiniOpenVault = document.getElementById('btnMiniOpenVault');
const btnExpandUi = document.getElementById('btnExpandUi');
const btnCollapseUi = document.getElementById('btnCollapseUi');
const btnOnlyMapToggle = document.getElementById('btnOnlyMapToggle');

// 코스 정보 & 도안 비교 바
const shapeInfoBar = document.getElementById('shapeInfoBar');
const tvCurrentShape = document.getElementById('tvCurrentShape');
const tvMatchScore = document.getElementById('tvMatchScore');
const btnSaveCourseQuick = document.getElementById('btnSaveCourseQuick');
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

// 스튜디오 모달
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

// 코스 보관함 (Vault) 모달
const btnOpenVault = document.getElementById('btnOpenVault');
const vaultCountBadge = document.getElementById('vaultCountBadge');
const savedCoursesModal = document.getElementById('savedCoursesModal');
const courseNameInput = document.getElementById('courseNameInput');
const btnConfirmSaveCourse = document.getElementById('btnConfirmSaveCourse');
const savedCoursesList = document.getElementById('savedCoursesList');
const btnVaultClose = document.getElementById('btnVaultClose');

const alertModal = document.getElementById('alertModal');
const alertModalMessage = document.getElementById('alertModalMessage');
const btnAlertClose = document.getElementById('btnAlertClose');

// --- 4. 초기화 ---
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  initEvents();
  updateStudioPreview(0);
  updateVaultBadgeCount();
  requestCurrentLocation(true);
  loadDrawingData();
});

function initMap() {
  const defaultCenter = [37.5665, 126.9780];

  map = L.map('mapView', {
    center: defaultCenter,
    zoom: 16,
    zoomControl: false
  });

  // 단일 표준 OSM 타일 레이어를 영구 유지 (테마 변경 시 레이어를 지우지 않고 CSS 필터만 바꿔 타일 소실 원천 차단)
  baseTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  setMapTheme('osm');

  L.control.scale({
    imperial: false,
    metric: true,
    position: 'bottomleft'
  }).addTo(map);

  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 150);

  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });
}

// 타일 레이어 재로딩 없이 즉각 필터만 전환하여 지도가 지워지는 현상 100% 방지
function setMapTheme(themeKey) {
  mapContainer.classList.remove('map-theme-light', 'map-theme-night');
  if (themeKey === 'light') {
    mapContainer.classList.add('map-theme-light');
  } else if (themeKey === 'dark') {
    mapContainer.classList.add('map-theme-night');
  }
}

// --- 5. 지도만 보기 모드 (Zen Mode) 제어 ---
function setZenMode(enable) {
  isZenMode = enable;
  document.body.classList.toggle('zen-mode', enable);
  miniHudBar.style.display = enable ? 'flex' : 'none';

  if (btnOnlyMapToggle) {
    btnOnlyMapToggle.innerHTML = enable ? '<span>⚙️ 메뉴 보기</span>' : '<span>🗺️ 지도만 보기</span>';
  }
  syncMiniHudInfo();
}

function syncMiniHudInfo() {
  const courseName = shapeInfoBar.style.display !== 'none'
    ? tvCurrentShape.textContent
    : (currentMode === Mode.FOLLOW_ROUTE ? '밑그림 코스' : '자유 그리기');
  miniCourseTitle.textContent = courseName;

  const totalKm = calculatePathDistanceKm(trackPoints);
  miniDistanceText.textContent = `${totalKm.toFixed(2)} km`;

  if (isTracking) {
    btnMiniQuickTrack.textContent = '⏹️ 정지';
    btnMiniQuickTrack.classList.add('tracking');
  } else {
    btnMiniQuickTrack.textContent = '🚶 시작';
    btnMiniQuickTrack.classList.remove('tracking');
  }
}

function initEvents() {
  // 지도 테마 전환 (일반 / 밝은배경 / 나이트)
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setMapTheme(btn.dataset.theme);
    });
  });

  // 메뉴 접기 / 펼치기 (지도만 보기 모드)
  btnCollapseUi.addEventListener('click', () => setZenMode(true));
  btnExpandUi.addEventListener('click', () => setZenMode(false));
  btnOnlyMapToggle.addEventListener('click', () => setZenMode(!isZenMode));

  // 미니 바에서 바로 시작/정지
  btnMiniQuickTrack.addEventListener('click', () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  });

  // 모드 탭 전환
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

  spinnerMode.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'AUTO_SHAPE') {
      showAutoShapeDialog();
    } else {
      setActiveModeTab(val);
      switchMode(val);
    }
  });

  // 도형 카드 선택
  shapeCards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index, 10);
      shapeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      shapeSelect.value = String(idx);
      updateStudioPreview(idx);
    });
  });

  // 거리 슬라이더
  seekBar.addEventListener('input', (e) => {
    const km = (parseInt(e.target.value, 10) / 10).toFixed(1);
    tvDistance.textContent = `목표 외곽 둘레: ${km} km`;
    const mins = Math.round(parseFloat(km) * 12);
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

  // 길 재매칭
  btnRematchRoad.addEventListener('click', () => {
    if (isTracking) stopTracking();
    generateShape(activeShapeType, activeMaxLengthKm, activeRotationDeg);
  });

  // 도안 비교 토글
  btnToggleCompare.addEventListener('click', () => {
    const isShowing = compareBar.style.display !== 'none';
    compareBar.style.display = isShowing ? 'none' : 'block';
    btnToggleCompare.classList.toggle('active', !isShowing);
  });

  compareTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      compareTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      applyCompareView(e.target.dataset.view);
    });
  });

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

  shapeRotateSlider.addEventListener('change', (e) => {
    activeRotationDeg = parseInt(e.target.value, 10);
    shapeRotateVal.textContent = `${activeRotationDeg}°`;
    generateShape(activeShapeType, activeMaxLengthKm, activeRotationDeg);
  });
  shapeRotateSlider.addEventListener('input', (e) => {
    shapeRotateVal.textContent = `${e.target.value}°`;
  });

  // 코스 보관함 (Vault) 열기 / 저장
  btnOpenVault.addEventListener('click', openVaultModal);
  btnMiniOpenVault.addEventListener('click', openVaultModal);
  btnSaveCourseQuick.addEventListener('click', () => {
    openVaultModal();
    courseNameInput.focus();
  });
  btnConfirmSaveCourse.addEventListener('click', saveCurrentCourseToVault);
  btnVaultClose.addEventListener('click', () => {
    savedCoursesModal.style.display = 'none';
  });

  // 시뮬레이션 및 GPX
  btnSimulate.addEventListener('click', toggleSimulation);
  btnExportGpx.addEventListener('click', exportCourseToGpx);

  // 하단 컨트롤
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

// --- 6. 스튜디오 모달 SVG 프리뷰 ---
function updateStudioPreview(shapeIdx) {
  const item = SHAPE_CATALOG[shapeIdx] || SHAPE_CATALOG[0];
  previewShapeTitle.textContent = item.title;
  previewShapeDesc.textContent = item.desc;

  const svgPoints = item.points.map(p => `${p[0].toFixed(3)},${(-p[1]).toFixed(3)}`).join(' ');
  shapePreviewPolygon.setAttribute('points', svgPoints);

  const startPt = item.points[0];
  shapePreviewStart.setAttribute('cx', String(startPt[0]));
  shapePreviewStart.setAttribute('cy', String(-startPt[1]));

  const sliderVal = Math.round(item.idealKm * 10);
  seekBar.value = String(sliderVal);
  tvDistance.textContent = `목표 외곽 둘레: ${item.idealKm.toFixed(1)} km`;
  tvEstTime.textContent = `약 ${Math.round(item.idealKm * 12)}분 소요`;
}

// --- 7. 모드 전환 ---
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
  syncMiniHudInfo();
}

function updateButtonStates() {
  btnStart.disabled = isTracking;
  btnStop.disabled = !isTracking;
  modeTabBtns.forEach(btn => { btn.disabled = isTracking; });
  syncMiniHudInfo();
}

function updateStatus(msg) {
  tvStatus.textContent = msg;
}

function showAlert(msg) {
  alertModalMessage.textContent = msg;
  alertModal.style.display = 'flex';
}

// --- 8. 내 위치 및 GPS 실시간 트래킹 ---
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
      tvCoords.textContent = `LAT ${latitude.toFixed(5)} · LNG ${longitude.toFixed(5)}`;
    },
    (err) => {
      if (!initial) {
        showAlert(`현재 위치를 가져올 수 없습니다: ${err.message}`);
      } else {
        tvCoords.textContent = '서울 시청 기준 (GPS 허용 시 내 위치 이동)';
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

  // 기록 시작 시 자동으로 위아래 메뉴창을 접어 지도만 보며 걸을 수 있도록 전환
  setZenMode(true);

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const pt = { lat: latitude, lng: longitude };

      trackPoints.push(pt);
      updateTrackPolyline();
      updateMyLocationMarker([latitude, longitude]);
      map.panTo([latitude, longitude]);

      tvCoords.textContent = `LAT ${latitude.toFixed(5)} · LNG ${longitude.toFixed(5)}`;
      updateTelemetryStats();
    },
    (err) => {
      console.warn('GPS Watch Error:', err);
      updateStatus('GPS 신호 수신 대기 중...');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );

  removeDrawingListeners();
  updateStatus('🚶 실시간 GPS 아트 기록 중...');
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

// --- 9. 텔레메트리 계산 ---
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
  syncMiniHudInfo();
}

function updateTelemetryStats() {
  const totalKm = calculatePathDistanceKm(trackPoints);
  const kcal = Math.round(totalKm * 55);
  statDistance.innerHTML = `${totalKm.toFixed(2)} <small>km</small>`;
  statCalories.innerHTML = `${kcal} <small>kcal</small>`;
  syncMiniHudInfo();
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

// --- 10. 폴리라인 & 마커 렌더링 ---
function updateTrackPolyline() {
  removeTrackPolyline();
  if (trackPoints.length < 2) return;

  const latlngs = trackPoints.map(p => [p.lat, p.lng]);

  trackCasingPolyline = L.polyline(latlngs, {
    color: '#002B36',
    weight: 12,
    opacity: 0.7,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);

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

    guideCasingPolyline = L.polyline(latlngs, {
      color: '#1A000D',
      weight: 11,
      opacity: 0.75,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    guidePolyline = L.polyline(latlngs, {
      color: '#FF0055',
      weight: 6,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    const startPoint = latlngs[0];
    const flagIcon = L.divIcon({
      className: 'start-flag-marker',
      html: '<div class="start-flag-bubble">🚩 출발·도착점</div>',
      iconSize: [96, 32],
      iconAnchor: [48, 32]
    });
    startPointMarker = L.marker(startPoint, { icon: flagIcon, zIndexOffset: 900 }).addTo(map);

    renderWaypointDirectionBadges(latlngs);

    map.fitBounds(guidePolyline.getBounds().pad(0.18));
    btnSimulate.style.display = 'flex';
    btnExportGpx.style.display = 'flex';
  } else {
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
  syncMiniHudInfo();
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

// --- 11. 수동 밑그림 & 보행 도로 스냅 ---
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
          tvCurrentShape.textContent = `직접 그린 코스 (${distKm}km)`;
          tvMatchScore.textContent = '보행길 스냅';
          shapeInfoBar.style.display = 'flex';
          updateStatus(`실제 보행길 스냅 완료 (${distKm}km) — [💾 코스 저장]이 가능합니다`);
          saveDrawingData();
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

// --- 12. 자동 도형 코스 생성 ---
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

  const rotatedBasePoints = item.points.map(p => rotatePoint(p[0], p[1], rotationDeg));

  let totalLengthRaw = 0;
  for (let i = 0; i < rotatedBasePoints.length - 1; i++) {
    const dx = rotatedBasePoints[i + 1][0] - rotatedBasePoints[i][0];
    const dy = rotatedBasePoints[i + 1][1] - rotatedBasePoints[i][1];
    totalLengthRaw += Math.hypot(dx, dy);
  }
  const scale = totalLengthRaw > 0 ? maxLengthKm / totalLengthRaw : 1.0;

  const anchorPoints = rotatedBasePoints.map(p => {
    const dLat = (p[1] * scale) / 111.32;
    const dLon = (p[0] * scale) / (111.32 * Math.cos(center.lat * Math.PI / 180));
    return { lat: center.lat + dLat, lng: center.lng + dLon };
  });

  // 원본 도안의 모든 꼭짓점을 손실 없이 그대로 보존
  idealShapeCoords = anchorPoints.map(p => ({ lat: p.lat, lng: p.lng }));

  updateStatus(`⚡ [${item.name}] 도안을 주변 실제 보행 도로망에 매칭 중...`);

  let routingAnchors = anchorPoints;
  if (anchorPoints.length > 45) {
    routingAnchors = [];
    const step = (anchorPoints.length - 1) / 40;
    for (let i = 0; i < 40; i++) {
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

          tvCurrentShape.textContent = `${item.icon} ${item.name} (${distanceKm}km)`;
          tvMatchScore.textContent = `일치도 ${matchScore}%`;
          shapeInfoBar.style.display = 'flex';
          updateStatus(`✅ 코스 완성! [💾 코스 저장] 또는 [🗺️ 지도만 보기]로 걸으세요`);
          syncMiniHudInfo();
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
    tvCurrentShape.textContent = `${item.icon} ${item.name} (${maxLengthKm.toFixed(1)}km)`;
    tvMatchScore.textContent = `원본 100%`;
    shapeInfoBar.style.display = 'flex';
    updateStatus(`외곽 코스 생성 완료 — 🚩 출발점에서 시작하세요`);
    syncMiniHudInfo();
    saveDrawingData();
  }
}

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

// --- 13. 도안 비교 뷰 ---
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

// --- 14. 나만의 코스 보관함 (별도 저장 및 불러오기) ---
function getSavedVaultCourses() {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function setSavedVaultCourses(list) {
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(list));
  updateVaultBadgeCount();
}

function updateVaultBadgeCount() {
  const list = getSavedVaultCourses();
  if (vaultCountBadge) {
    vaultCountBadge.textContent = String(list.length);
  }
}

function openVaultModal() {
  // 기본 추천 이름 자동 입력
  if (guidePoints.length >= 2) {
    const item = SHAPE_CATALOG[activeShapeType] || SHAPE_CATALOG[0];
    const distKm = calculatePathDistanceKm(guidePoints).toFixed(1);
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    courseNameInput.value = `${item.icon} ${item.name} 코스 (${distKm}km) - ${dateStr}`;
  } else {
    courseNameInput.value = '';
  }

  renderVaultList();
  savedCoursesModal.style.display = 'flex';
}

function saveCurrentCourseToVault() {
  if (guidePoints.length < 2 && trackPoints.length < 2) {
    showAlert('저장할 코스가 없습니다. 먼저 도형 코스를 생성하거나 밑그림을 그려주세요.');
    return;
  }

  const item = SHAPE_CATALOG[activeShapeType] || SHAPE_CATALOG[0];
  const ptsToSave = guidePoints.length >= 2 ? guidePoints : trackPoints;
  const distKm = calculatePathDistanceKm(ptsToSave).toFixed(2);
  const customName = courseNameInput.value.trim() || `${item.icon} ${item.name} 코스 (${distKm}km)`;

  const newEntry = {
    id: 'course_' + Date.now(),
    title: customName,
    shapeType: activeShapeType,
    maxLengthKm: activeMaxLengthKm,
    rotationDeg: activeRotationDeg,
    distanceKm: distKm,
    matchText: tvMatchScore.textContent || '보관됨',
    createdAt: new Date().toLocaleString('ko-KR'),
    guidePoints: ptsToSave,
    idealShapeCoords: idealShapeCoords
  };

  const list = getSavedVaultCourses();
  list.unshift(newEntry);
  setSavedVaultCourses(list);
  renderVaultList();
  updateStatus(`💾 [${customName}] 코스가 보관함에 저장되었습니다!`);
}

function renderVaultList() {
  const list = getSavedVaultCourses();
  savedCoursesList.innerHTML = '';

  if (list.length === 0) {
    savedCoursesList.innerHTML = '<div class="vault-empty">아직 저장된 코스가 없습니다.<br>마음에 드는 코스가 나왔을 때 [💾 현재 코스 저장]을 눌러 보관해 두세요!</div>';
    return;
  }

  list.forEach(course => {
    const row = document.createElement('div');
    row.className = 'vault-item';
    row.innerHTML = `
      <div class="vault-item-info">
        <div class="vault-item-title">${escapeHtml(course.title)}</div>
        <div class="vault-item-meta">총 ${course.distanceKm}km · ${course.matchText || ''} · ${course.createdAt}</div>
      </div>
      <div class="vault-item-actions">
        <button type="button" class="btn-vault-load" data-id="${course.id}">📍 불러오기</button>
        <button type="button" class="btn-vault-del" data-id="${course.id}">🗑️</button>
      </div>
    `;

    row.querySelector('.btn-vault-load').addEventListener('click', () => {
      loadCourseFromVault(course.id);
    });
    row.querySelector('.btn-vault-del').addEventListener('click', () => {
      deleteCourseFromVault(course.id);
    });

    savedCoursesList.appendChild(row);
  });
}

function loadCourseFromVault(courseId) {
  const list = getSavedVaultCourses();
  const found = list.find(c => c.id === courseId);
  if (!found) return;

  stopSimulation();
  if (isTracking) stopTracking();

  activeShapeType = typeof found.shapeType === 'number' ? found.shapeType : 0;
  activeMaxLengthKm = found.maxLengthKm || 2.5;
  activeRotationDeg = found.rotationDeg || 0;

  guidePoints = Array.isArray(found.guidePoints) ? found.guidePoints : [];
  idealShapeCoords = Array.isArray(found.idealShapeCoords) ? found.idealShapeCoords : [];

  updateGuidePolyline(true, idealShapeCoords);

  tvCurrentShape.textContent = found.title;
  tvMatchScore.textContent = found.matchText || '보관 코스';
  shapeInfoBar.style.display = 'flex';
  savedCoursesModal.style.display = 'none';

  // 코스를 불러온 뒤 지도만 보며 바로 걸을 수 있도록 안내
  syncMiniHudInfo();
  saveDrawingData();
  updateStatus(`📂 [${found.title}] 코스를 불러왔습니다!`);
}

function deleteCourseFromVault(courseId) {
  const list = getSavedVaultCourses().filter(c => c.id !== courseId);
  setSavedVaultCourses(list);
  renderVaultList();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- 15. 가상 걷기 시뮬레이터 (그려진 도안·코스의 모든 정점을 100% 오차 없이 추종) ---
function buildSmoothSimulationPath(sourcePoints, targetFrames = 140) {
  if (!sourcePoints || sourcePoints.length < 2) return sourcePoints || [];
  // 원본 코스의 모든 꼭짓점을 100% 유지하면서 긴 직선 구간만 부드럽게 분할하여 정밀 추종 보장
  const totalDist = calculatePathDistanceKm(sourcePoints);
  if (totalDist <= 0) return sourcePoints.slice();

  const stepDistKm = totalDist / targetFrames;
  const dense = [sourcePoints[0]];

  for (let i = 0; i < sourcePoints.length - 1; i++) {
    const p1 = sourcePoints[i];
    const p2 = sourcePoints[i + 1];
    const segKm = haversineKm(p1, p2);

    if (segKm > stepDistKm) {
      const subSteps = Math.min(20, Math.floor(segKm / stepDistKm));
      for (let s = 1; s <= subSteps; s++) {
        const r = s / (subSteps + 1);
        dense.push({
          lat: p1.lat + (p2.lat - p1.lat) * r,
          lng: p1.lng + (p2.lng - p1.lng) * r
        });
      }
    }
    // 원래 도안/코스의 정점을 절대 건너뛰지 않고 반드시 포함
    dense.push(p2);
  }
  return dense;
}

function toggleSimulation() {
  if (simInterval) {
    stopSimulation();
    updateStatus('코스 시뮬레이션 종료');
    return;
  }

  // 현재 활성화된 비교 탭이 '원본 도안만(origin)'이면 원본 도안 외곽선을, 아니면 그려진 가이드 코스를 100% 동일하게 추종
  const activeTab = document.querySelector('.compare-tab.active');
  const isOriginOnlyView = activeTab && activeTab.dataset.view === 'origin';
  const baseTargetPoints = (isOriginOnlyView && idealShapeCoords.length >= 2)
    ? idealShapeCoords
    : guidePoints;

  if (baseTargetPoints.length < 2) {
    showAlert('먼저 도형 코스를 생성하거나 보관함에서 불러와 주세요.');
    return;
  }

  if (isTracking) stopTracking();
  trackPoints = [];
  removeTrackPolyline();
  resetTelemetry();
  startTelemetryTimer();

  // 시뮬레이션 시 위아래 메뉴창을 접어 전체 화면 지도로 감상
  setZenMode(true);

  btnSimulate.classList.add('simulating');
  btnSimulate.innerHTML = '<span>⏹️ 정지</span>';
  updateStatus('🏃 가상 보행 시뮬레이션 진행 중...');

  const simPath = buildSmoothSimulationPath(baseTargetPoints, 150);
  const total = simPath.length;
  const pointsPerTick = Math.max(1, Math.ceil(total / 120));

  // 출발점(0번 정점)부터 즉시 시작하여 첫 구간 누락 방지
  trackPoints.push(simPath[0]);
  updateMyLocationMarker([simPath[0].lat, simPath[0].lng]);
  let currentIdx = 1;

  simInterval = setInterval(() => {
    const nextIdx = Math.min(total - 1, currentIdx + pointsPerTick - 1);

    // 중간 정점을 단 하나도 건너뛰지 않고 순서대로 모두 누적하여 그려진 도안과 100% 일치 보장
    for (let i = currentIdx; i <= nextIdx; i++) {
      trackPoints.push(simPath[i]);
    }
    currentIdx = nextIdx + 1;

    const headPt = trackPoints[trackPoints.length - 1];
    updateTrackPolyline();
    updateMyLocationMarker([headPt.lat, headPt.lng]);
    tvCoords.textContent = `SIM LAT ${headPt.lat.toFixed(5)} · LNG ${headPt.lng.toFixed(5)}`;
    updateTelemetryStats();

    if (currentIdx >= total) {
      stopSimulation();
      updateStatus('🎉 코스 완주 시뮬레이션 완료! 그려진 도안과 100% 일치합니다');
    }
  }, 45);
}

function stopSimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
  stopTelemetryTimer();
  btnSimulate.classList.remove('simulating');
  btnSimulate.innerHTML = '<span>▶️ 시뮬레이션</span>';
}

// --- 16. GPX 내보내기 ---
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

// --- 17. 초기화 및 로컬 데이터 복원 ---
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
  syncMiniHudInfo();
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
    syncMiniHudInfo();
  } catch (e) {
    console.error('Failed to load drawing data:', e);
  }
}

function clearSavedData() {
  localStorage.removeItem('gps_art_drawing_data');
}
