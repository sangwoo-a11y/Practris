# 퍼펙트 방식: 스킬 연습 전용

스킬 연습의 퍼펙트 설계에서 자유 풀이, PCO 기본형, PCO I 보류, MKO T 보류 PC를 선택합니다. 빌드 학습에는 퍼펙트 과정이나 진입 버튼이 없습니다.

## 실제 7-bag

모든 방식은 같은 방식으로 7종을 한 번씩 무작위로 섞습니다. 성공할 큐를 고르거나 검증된 예제 큐로 대체하지 않습니다. 같은 난수 입력이면 어떤 PC 방식을 선택하든 실제 큐는 같습니다. bag 경계에서는 같은 미노가 두 번 이어질 수 있습니다.

- 처음부터 설계: 빈 보드와 새로운 무작위 bag에서 시작합니다.
- 마무리만 연습: 준비된 지형과 새로운 무작위 bag에서 시작합니다. 예제의 I/T를 첫 미노로 강제하지 않습니다.
- PC 성공 후: 남은 큐, 홀드, 실제 bag 진행 위치를 그대로 유지해 이어갑니다.
- 다시 시작·다른 과제: 새 무작위 bag으로 시작합니다.

성공이나 정해진 수 안의 마무리가 필수는 아닙니다. 유효한 배치를 허용하며 NEXT는 5개만 표시합니다. 현재 bag에서 PC 경로를 찾지 못하면 그 사실을 표시하고 계속 연습할 수 있습니다.

## 방식과 추천

| 방식 | 토대 예시 | 마무리 |
| --- | --- | --- |
| PCO 기본형 | 첫 bag 7미노의 좌우 구조 | 실제 보드와 NEXT·홀드로 PC 탐색 |
| PCO I 보류 | I를 제외한 6미노 구조 | 실제 보드와 NEXT·홀드로 PC 탐색 |
| MKO T 보류 PC | T를 제외한 6미노 구조 | MKO 토대에서 PC를 노리는 분기 |

토대 중에는 현재 미노와 홀드로 실제로 놓을 수 있는 형태를 우선합니다. 같은 단계 안의 다른 순서를 사용할 수 있으며, 전체 예제 순서를 완성할 수 있어야만 한 수를 받아들이는 조건은 없습니다. 토대 이후에는 고정 예제의 3/4미노를 공급하지 않고 실제 큐로 공통 PC 탐색을 합니다. 형태 이탈도 실제 보드에서 PC 탐색으로 이어집니다.

후보 계산은 자체 BFS/DFS이며 외부 Solution Finder·PCF 엔진을 탑재한 것은 아닙니다. 범위와 한도는 [recommendations.md](recommendations.md)에 있습니다.

## 참고 예시와 출처

가이드북의 풀이 예시는 검증된 4줄 PC를 한 수씩 보여줍니다. 실제 무작위 NEXT와는 별개입니다. 각 방식의 방향·독립 순서 4개씩 총 12개 자료는 `node scripts/compile-perfect-methods.mjs`로 SRS 경로·실제 PC를 검증해 생성합니다.

도식의 사실적 좌표만 참조했으며 외부 엔진 코드를 포함하지 않았습니다.

- PCO I 보류 / MKO T 보류 PC: [AndrewEmets/TetrisWorkout, openers.js](https://github.com/AndrewEmets/TetrisWorkout/blob/4f3d94974deb9e37643be3014b62fab76968b6b7/js/openers.js)
- PCO 기본 토대: [quijadajose/FOUR.LOL-DOJO, openers.ts](https://github.com/quijadajose/FOUR.LOL-DOJO/blob/main/src/lessons/openers.ts)
