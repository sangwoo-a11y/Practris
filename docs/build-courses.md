# 빌드 학습

빌드 학습은 Opener와 중반 T-spin 설계를 다룹니다. 퍼펙트 방식은 스킬 연습에만 있으며, 오른쪽 3열은 별도 과정 대신 6–3 전체 보드의 추천에 반영합니다.

## 과정 범위

| 과정 | 범위 | 기본 사례 수 |
| --- | --- | --- |
| TKI 3 | 첫 bag TSD, 기본형·Castle Top·Fonzie | 12 |
| DT Cannon | 토대 → Double → Triple | 4 |
| C-Spin | 첫 bag 토대만 | 4 |
| Albatross Special | 첫 Air TSD → 두 번째 bag TST | 4 |
| TSD 지붕 설계 | 쌓인 지형에 지붕을 만들고 Double | 12 |
| TST 진입로 설계 | 중반 벽·통로를 만들고 Triple | 4 |
| 스키밍 → TSD | 먼저 두 줄을 정리한 뒤 Double | 3 |

총 43개 기본 사례이며 방향·순서·높이를 자동으로 섞습니다. 같은 빌드의 덱 안에서는 같은 사례를 다시 꺼내지 않고, 모두 진행하면 같은 분류의 다음 빌드로 이어집니다. C-Spin 과정은 전체 TST→TSD 공격을 다루지 않습니다.

## 실제 연습: 무작위 bag

기본 방식은 무작위 bag 판단입니다. 7종을 한 번씩 섞은 bag을 한 번 뽑으며, 선택한 빌드가 가능한지에 따라 다시 뽑거나 순서를 바꾸지 않습니다. 성공 예제 큐로 되돌아가는 fallback도 없습니다. `designBagCourse`는 추첨된 큐를 분석해 순서를 설명할 수 있으면 설명하고, 불가능해도 같은 큐를 그대로 사용합니다.

현재 미노 또는 홀드로 실제로 도달할 수 있는 예제 위치가 있으면 그 위치를 안내합니다. 모든 미래가 완성 가능해야만 한 수를 허용하는 조건은 없습니다. 바로 맞는 위치가 없으면 그 사실을 표시합니다. 성공하지 않아도 유효한 위치에 미노를 고정해 계속 쌓거나 다른 과제로 넘어갈 수 있습니다.

유효한 배치는 모두 보존합니다. 같은 단계의 다른 목표 위치를 먼저 놓으면 그 순서로 진행하고, 형태 밖에 놓으면 형태 이탈을 안내한 뒤 실제 T-spin 목표를 계속 판정합니다. 완료는 실제 Double/Triple 공격 순서, 스키밍 이후 Double 또는 토대 칸 점유를 검사합니다. 단계 수만 채워서는 완료되지 않습니다.

## 고정 예제

사용자가 고정 예제 따라 쌓기를 선택한 경우에만 검증된 예제 순서로 위치·회전·진입을 따라갑니다. 이 모드는 실제 무작위 bag 연습과 구분됩니다. 예제의 방향과 독립 배치 순서는 SRS 경로와 줄 지우기를 검증했습니다.

## 연속 진행과 되돌리기

완료 1.8초 후 다음 사례로 이어지며 자동 넘김은 끌 수 있습니다. 되돌리기, 모드 변경, 닫기, 리셋은 예약과 이전 Worker를 취소합니다. 가이드북을 읽거나 탭이 가려진 동안에는 넘기지 않습니다. 되돌리기는 보드·큐·홀드·공격 진행·스키밍 진행·완료 수를 복원합니다.

## 배치 자료

도식의 사실적 좌표를 자체 형식으로 변환했으며 외부 엔진·UI 코드는 포함하지 않았습니다. 직접 Hard Drop/four.lol 원문을 조회했다는 의미는 아닙니다. 중반의 높이·가비지 변형은 Practris의 연습용 구성입니다.

- TKI / DT: [AndrewEmets/TetrisWorkout, openers.js](https://github.com/AndrewEmets/TetrisWorkout/blob/4f3d94974deb9e37643be3014b62fab76968b6b7/js/openers.js)
- TKI Castle Top·Fonzie / C-Spin / Albatross: [quijadajose/FOUR.LOL-DOJO, openers.ts](https://github.com/quijadajose/FOUR.LOL-DOJO/blob/main/src/lessons/openers.ts)

`node scripts/compile-course-variants.mjs`와 `node scripts/compile-midgame-courses.mjs`로 예제 자료를 재생성할 수 있습니다. 과거 퍼펙트·3열 독립 과정 주소는 각각 스킬 연습의 퍼펙트·6–3으로 이동합니다.
