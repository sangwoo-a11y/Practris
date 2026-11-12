# 직접 쌓는 빌드 학습

기존의 텍스트 진행 카드 대신 실제 게임 보드에서 이동·회전·드롭하여 배치하는 과정입니다. 각 과정은 선택한 변형의 한 가지 유효한 배치 순서를 가르칩니다. 다른 위치의 배치는 현재 단계에서 재시도하며, 이전 수로 돌아갈 수 있습니다.

## 과정 범위

- TKI 3: 빈 보드부터 첫 bag을 놓고 T-spin Double을 완성합니다.
- DT Cannon: 첫 bag 토대 → 두 번째 bag TSD → 다음 T로 TST. 보드는 단계 사이에도 그대로 이어집니다.
- C-Spin: 빈 보드에서 첫 bag의 토대를 쌓는 입문 과정입니다. 이 과정의 완료 표시는 전체 TST→TSD 공격 완료가 아닙니다.
- Albatross Special: 첫 bag Air TSD → 두 번째 bag TST까지 이어지는 과정입니다. 이후 bag의 추가 공격은 포함하지 않습니다.
- PCO: 첫 bag 형태를 준비하고, I와 다음 bag의 세 미노로 4줄 PC를 완성합니다.

모든 과정은 합법적인 7-bag 순서이며 미노를 복제하지 않습니다. 직접 따라 할 위치와 그 배치의 역할을 현재 단계에 표시합니다. PC·T-spin 판정, 실제 줄 지우기, 각 배치까지의 조작 경로를 테스트합니다.

## 변형 선택

32개 과정을 선택할 수 있습니다. 좌우 반전과 같은 형태의 합법적인 bag 순서 차이는 선택지에 명시하며, 모두 다른 이름의 정형 빌드라고 부르지 않습니다.

- TKI: 기본형 / Castle Top / Fonzie × 좌우 2방향 × bag 순서 2가지 = 12개.
- DT / C-Spin 토대 / Albatross: 각 좌우 2방향 × bag 순서 2가지 = 각 4개.
- PCO: 기존 마무리 / I·T·L 마무리 × 좌우 2방향 × bag 순서 2가지 = 8개.

순서 변형은 같은 bag 안에서 독립적인 배치의 순서를 바꾸고 모든 중간 상태의 진입 가능성과 줄 지우기를 다시 검사했습니다. 반전은 S/Z·J/L도 교환하고 SRS 경로를 새로 구했습니다. TKI의 세 형태는 실제 블록 지형이 다르고 PCO의 두 마무리는 두 번째 bag 조합과 최종 배치가 다릅니다. C-Spin 과정은 여전히 첫 bag 토대만 다룹니다.

`node scripts/compile-course-variants.mjs`로 변형을 재생성합니다. `course-variants.js`에 검증된 배치와 조작 경로가 있으며, 원래 한 가지 과정은 `course-data.js`에 남아 있습니다. 사용자는 변형 선택, 다른 변형, 완료 후 다시 쌓기로 이동합니다. 주소는 `#learn/tki/1-r-0`처럼 변형까지 저장합니다.

## 배치 자료

보드 좌표는 공개 오프너 도식의 사실적 배치 정보를 읽어 자체 형식으로 변환했습니다. 외부 엔진이나 UI 코드는 포함하지 않았고, 배치 순서·회전 경로·클리어 검사는 Practris 엔진으로 새로 계산했습니다.

- TKI / DT / PCO 도식 교차 확인: [AndrewEmets/TetrisWorkout, openers.js](https://github.com/AndrewEmets/TetrisWorkout/blob/4f3d94974deb9e37643be3014b62fab76968b6b7/js/openers.js)
- TKI Castle Top·Fonzie / C-Spin 첫 bag / Albatross 도식: [quijadajose/FOUR.LOL-DOJO, openers.ts](https://github.com/quijadajose/FOUR.LOL-DOJO/blob/main/src/lessons/openers.ts)
- 각 자료가 명시하는 도식 출처: [four.lol TKI](https://four.lol/openers/tki), [DT Cannon](https://four.lol/methods/dt-cannon), [Triple Double](https://four.lol/methods/triple-double#opening-c-spin), [Albatross](https://four.lol/openers/albatross), [PC opener](https://four.lol/perfect-clears/opener)

Hard Drop와 four.lol 사이트 원문을 직접 읽었다는 의미는 아닙니다. 실제 수록 도형은 위 공개 저장소의 좌표와 엔진 검증을 기준으로 합니다.
