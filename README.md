# GPS Art Walk (GPS 아트 워크 웹앱)

위치 기반 실시간 GPS 아트 드로잉 및 러닝 코스 웹 애플리케이션입니다.
걷거나 달리면서 지도 위에 그림을 그리거나, 원하는 모양의 도로 코스를 자동으로 생성하여 따라 걸을 수 있습니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Leaflet](https://img.shields.io/badge/map-Leaflet%201.9.4-brightgreen.svg)
![OSM](https://img.shields.io/badge/tiles-OpenStreetMap-orange.svg)
![Routing](https://img.shields.io/badge/API-OSRM%20Public%20API-informational.svg)

---

## 🌟 주요 기능

1. **자유 그리기 (Free Draw)**
   - GPS를 켜고 이동한 궤적이 실시간으로 지도 위에 선으로 그려집니다.
   - 이동 경로 및 실시간 현재 좌표(위도/경도)가 표시됩니다.

2. **경로 따라가기 (Follow Route)**
   - 지도 위에 손가락이나 마우스로 원하는 밑그림을 직접 그립니다.
   - 드로잉 완료 시 **OSRM Map Matching API**를 통해 실제 주변 도로망에 자동으로 스냅(정렬)됩니다.
   - `시작` 버튼을 누르고 생성된 도로 밑그림을 따라 산책/러닝을 즐길 수 있습니다.

3. **자동 모양 만들기 (Auto Shape)**
   - 10종의 다양한 프리셋 모양 지원:
     - 🐶 강아지 (기본 2.0km)
     - 🐱 고양이 (기본 1.5km)
     - 🦖 공룡 (기본 3.0km)
     - 🐦 새 (기본 2.5km)
     - ❤️ 하트 (기본 1.5km)
     - ⭐ 별 (기본 2.0km)
     - 🚗 자동차 (기본 2.0km)
     - 🐟 물고기 (기본 1.5km)
     - 🏠 집 (기본 1.5km)
     - 👑 왕관 (기본 2.0km)
   - 최대 허용 거리(0.5km ~ 10.0km) 슬라이더 조절 기능.
   - 지도 중심 기준으로 **OSRM Route API**를 호출하여 최적의 실제 도로 코스를 자동 생성합니다.

4. **데이터 보존 (Persistence)**
   - 브라우저 로컬 스토리지(`localStorage`)를 통해 새로고침이나 브라우저 재방문 시에도 작업 중이던 코스와 이동 경로를 복원합니다.

5. **비용 0원 & 크로스 플랫폼 지원**
   - 유료 지도 API 키 없이 순수 오픈소스 기술(Leaflet, OpenStreetMap, OSRM)로 동작합니다.
   - 스마트폰 모바일 브라우저(크롬, 사파리, 삼성인터넷) 및 PC 데스크톱 브라우저에 모두 최적화된 반응형 3D UI를 제공합니다.

---

## 🛠️ 기술 스택

- **Map Engine**: [Leaflet.js 1.9.4](https://leafletjs.com/) (하위 호환성 및 모바일 터치 최적화)
- **Map Tiles**: [OpenStreetMap (OSM)](https://www.openstreetmap.org/)
- **Routing & Snapping**: [Project OSRM Public API](https://project-osrm.org/) (Match v1 & Route v1)
- **Location Tracking**: HTML5 Geolocation API (`navigator.geolocation.watchPosition`)
- **Frontend**: Vanilla JavaScript (ES5/ES6), Responsive CSS3 (3D Glassmorphism), Semantic HTML5
- **Native Android Code**: 기존 Android 네이티브 소스코드는 `/app` 디렉터리에 그대로 보존되어 있습니다.

---

## 🚀 실행 방법

### 방법 1: 웹 서버로 즉시 실행
별도의 빌드 과정 없이 정적 웹 서버(VS Code Live Server, Python 등)로 바로 구동할 수 있습니다.
```bash
# Python 내장 웹 서버 실행 예시 (포트 8000)
python -m http.server 8000
```
브라우저에서 `http://localhost:8000` 접속

### 방법 2: GitHub Pages 배포 (모바일에서 바로 접속)
1. GitHub 저장소(`https://github.com/kiuza1004/gps_art_walk`)로 이동합니다.
2. **Settings** -> **Pages** 메뉴 진입.
3. **Build and deployment** -> Branch를 `main` / `/(root)` 로 선택 후 **Save**를 클릭합니다.
4. 배포 완료 후 제공되는 URL (`https://kiuza1004.github.io/gps_art_walk/`)로 스마트폰에서 바로 접속하여 GPS 아트를 이용할 수 있습니다.

---

## 📱 조작 가이드

- **시작**: GPS 트래킹을 시작하여 이동 경로를 기록합니다.
- **종료**: 현재 진행 중인 GPS 기록을 중지합니다.
- **초기화**: 그려진 가이드 선 및 GPS 이동 경로를 모두 지웁니다.
- **내 위치**: 지도의 중심을 현재 스마트폰/PC의 GPS 위치로 즉시 이동합니다.
