# Eromnet Hero — 구면 투영 글로브

`landing` 레포에 있던 여러 프로토타입 중, 구면(orthographic) 투영으로 회전하는
화폐 글리프 지구본("구면 투영" 탭)만 이 브랜치(`EromhpHero`)에 남겼습니다.

## 실행

`globe-export.html`은 별도 빌드 없이 여는 정적 HTML/Canvas 파일입니다.
`public/earth-mask.jpg`를 fetch할 수 있어야 하므로, 정적 서버로 열어주세요.

```bash
npx serve .
# 이후 브라우저에서 http://localhost:3000/globe-export.html 접속
```

**기능**
- 화폐 글리프($ € £ ¥ ₩ ₹)가 지구본 표면에 흩뿌려진 형태로, 구면 투영·18° 틸트로 회전
- 전체보기에서 드래그 = 축 굴리기 (Shift+드래그 = 이동, 더블클릭 = 리셋)
- 도시 연결 아크 on/off, 글리프 깜박임 on/off
- 육지/바다 색상·투명도, 배경색, 글자 스타일(Stroke/Filled/Tinted), 회전 속도 커스텀

## GitHub Pages 배포용 빌드

로컬 이미지 경로(`EARTH_URL`)를 base64로 인라인한 단일 파일을 만듭니다.

```bash
npm run build:deploy
# → index.deploy.html 생성
```

## 기술 스택

- 순수 HTML + Canvas 2D (프레임워크 없음)
