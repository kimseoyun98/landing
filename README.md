# Eromnet Hero — 구면 투영 글로브

`landing` 레포에 있던 여러 프로토타입 중, 구면(orthographic) 투영으로 회전하는
화폐 글리프 지구본("구면 투영" 탭)만 이 브랜치(`EromhpHero`)에 남겼습니다.
컨트롤 패널에서 확정한 값(육지 주황/바다 검정/투명도 100%/요소 크기 69%/글자
굵기 800/선명도 100%/채움 114%/선 두께 0 등)을 `globe-export.html` 안의
`PARAMS`로 고정하고, 뷰포트 전체를 채우는 fullscreen Hero 배경으로 렌더링합니다.

## 실행

`globe-export.html`은 별도 빌드 없이 여는 정적 HTML/Canvas 파일입니다.
`public/earth-mask.jpg`를 fetch할 수 있어야 하므로, 정적 서버로 열어주세요.

```bash
npx serve .
# 이후 브라우저에서 http://localhost:3000/globe-export.html 접속
```

**기능**
- 화폐 글리프($ € £ ¥ ₩ ₹)가 지구본 표면에 흩뿌려진 형태로, 구면 투영·18° 틸트로 회전
- 뷰포트 전체 채움(fullscreen), 창 크기에 반응
- 드래그 = 축 굴리기, 더블클릭 = 기울기 리셋
- 도시 연결 아크, 글리프 깜박임 표시
- 색상/크기/굵기 등은 `PARAMS` 객체에 고정값으로 하드코딩 (컨트롤 패널 없음)

## GitHub Pages 배포용 빌드

로컬 이미지 경로(`EARTH_URL`)를 base64로 인라인한 단일 파일을 만듭니다.

```bash
npm run build:deploy
# → index.deploy.html 생성
```

## 기술 스택

- 순수 HTML + Canvas 2D (프레임워크 없음)
