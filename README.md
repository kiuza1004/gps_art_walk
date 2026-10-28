# GPS Art Walk — Argon Edition

실시간 보행자 도로망 매칭(Pedestrian Road Matching)과 도안 검증 스튜디오를 결합한 차세대 GPS 아트 웹 애플리케이션입니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Edition](https://img.shields.io/badge/edition-ARGON-ff0055.svg)
![Leaflet](https://img.shields.io/badge/map-Leaflet%201.9.4-brightgreen.svg)
![Cost](https://img.shields.io/badge/cost-%240%20Free-00e676.svg)

---

## 🚀 Argon Edition 핵심 업그레이드 사항

1. **사이버 글래스모피즘(Cyber-Glassmorphism) UI & 3종 지도 테마 스위처**
   - **🌙 다크 테마 (CartoDB Dark Matter)**: 네온 핫핑크 코스와 시안 블루 GPS 궤적이 밤하늘의 네온사인처럼 빛나는 고대비 다크 모드
   - **☀️ 라이트 테마 (CartoDB Positron)**: 복잡한 지도 요소를 덜어내고 아트 라인만 돋보이게 하는 클린 백지도
   - **🗺️ 일반 테마 (OpenStreetMap Standard)**: 건물과 골목 정보를 상세히 보여주는 표준 보행 지도

2. **✨ GPS 아트 도안 스튜디오 (실시간 SVG 프리뷰 + 10종 비주얼 카드)**
   - 답답한 드롭다운 대신 10종 도형(강아지, 고양이, 공룡, 새, 하트, 별, 자동차, 물고기, 집, 왕관)을 한눈에 고르는 그리드 카드 UI
   - 도형 선택 즉시 모티브 설명(예: 스코티시 테리어 실루엣)과 **실시간 SVG 외곽선 및 출발점 프리뷰** 제공
   - 목표 둘레 거리 설정 시 성인 보행 속도 기준 **예상 소요 시간(분)** 자동 계산

3. **🔍 인터랙티브 도안 맞춰보기 + 도안 회전(0°~360°) & 길 재매칭**
   - **`실제 보행길만` / `1:1 겹쳐 비교` / `원본 도안만`** 3단 뷰 전환 및 실시간 투명도 슬라이더
   - **도안 회전 슬라이더 (`0° ~ 360°`)**: 동네의 도로망 방향(대각선 길, 격자 블록)에 맞춰 도안을 회전시켜 도로와의 일치율을 극대화
   - **`🔄 길 재매칭`**: 지도를 원하는 동네나 공원으로 이동한 뒤 원클릭으로 해당 위치의 보행길에 즉시 재매칭
   - **도안 일치도(`%`) 자동 산출**: 원본 정점과 스냅된 실제 도로 간의 오차를 계산하여 형태 보존율 표시

4. **이중 스트로크(Double-Stroke Halo) & 경유지 순서 번호 마커(`1`→`4`)**
   - 어떤 지도 배경 위에서도 선이 묻히지 않도록 다크 글로우 외곽 케이싱 + 네온 코어 라인 이중 렌더링
   - 초보자도 코스를 헷갈리지 않고 한 바퀴 완주할 수 있도록 진행 방향 순서대로 `🚩 출발점` 및 `1`~`4` 경유지 배지 표시

5. **🏃 가상 걷기 시뮬레이터 & 실시간 텔레메트리 HUD + GPX 내보내기**
   - **`▶️ 코스 시뮬레이션`**: 밖으로 나가기 전에 생성된 실제 보행길을 따라 가상으로 완주하며 그림이 완성되는 과정을 미리 검증
   - **실시간 텔레메트리**: 이동 거리(`km`), 소요 시간(`MM:SS`), 소모 칼로리(`kcal`) 실시간 계기판
   - **`📥 GPX 저장`**: 생성된 코스나 완주 기록을 표준 `.gpx` 파일로 다운로드하여 스마트워치 및 러닝 앱 연동 가능

---

## 🌐 라이브 서비스 접속

- **웹앱 주소**: **[https://kiuza1004.github.io/gps_art_walk/](https://kiuza1004.github.io/gps_art_walk/)**
- **GitHub 저장소**: [https://github.com/kiuza1004/gps_art_walk](https://github.com/kiuza1004/gps_art_walk)
