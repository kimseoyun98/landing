# Landing

이롬넷 랜딩 페이지 프로토타입 모음

## 프로젝트 구성

| 페이지 | 설명 | 포트 |
|--------|------|------|
| P1 | 지구본 + 커튼 텍스트 애니메이션 | 5173 |
| P1-1 | 라이트모드 지구본 + 영상 원 | 5176 |
| P1-2 | 3D 허니컴 글로브 | 5177 |
| P2 | 핀테크 스타일 히어로 | 5174 |
| P3 | 파트너스 / 스탯 섹션 | 5175 |

## 실행

```bash
npm install

# 개별 실행
npm run dev:p1
npm run dev:p1-1
npm run dev:p2
npm run dev:p3

# 전체 동시 실행
npm run dev:p1 & npm run dev:p2 & npm run dev:p3
```

## Globe GIF Exporter

지구본 애니메이션을 GIF로 내보내는 도구

🌐 **[kimseoyun98.github.io/landing](https://kimseoyun98.github.io/landing)**

**기능**
- 육지 / 바다 색상 및 투명도 커스텀
- 배경색 선택
- Seamless loop (처음과 끝이 이어지는 GIF)
- 회전 속도 조절
- FPS / 크기 설정

## 기술 스택

- React + TypeScript
- Three.js (3D 글로브)
- Framer Motion
- Vite
