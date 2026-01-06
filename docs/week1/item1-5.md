# Item 1-5

## Item1: TS와 JS의 관계 이해하기

### TS는 JS의 런타임을 모델링한다.

JS에서 가능한 일은 TS에서도 원칙적으로 가능해야 한다

#### 객체는 언제나 확장/변경 가능

JS에서 객체는 런타임에 키 추가/삭제 가능하고, 참조를 공유하면 어디서든 바뀔 수 있다.

```js
const obj = { x: 1 };
obj.y = 2;
delete obj.x;
```

그래서 TS는 **어떤 객체는 정확히 이러한 키만 가진다**를 기본적으로 가정하지 않는다. (구조적 타이핑, [공식문서](https://www.typescriptlang.org/docs/handbook/type-compatibility.html))

```ts
function len(v: { x: number; y: number }) {
  console.log(v.x, v.y);
}

const v3 = { x: 1, y: 2, z: 3 };
len(v3); // JS에서 문제 없기 때문에 허용
```

#### 타입은 런타임에 존재하지 않는다.

예를들어 아래 코드는 컴파일되면 사라져서 런타임에는 존재하지 않는다.

```ts
interface User {
  name: string;
}
```

TS의 세계는 런타임을 모른다.

```ts
const names = ["Alice", "Bob"];
// Cannot read property 'toUpperCase' of undefined
console.log(names[2].toUpperCase());
```

TS는 JS에서의 런타임 에러를 발견하는 것을 보장하진 않는다.
아래서도 이어지지만, TS는 다음과 같은 패턴을 권장한다.

> 프로그램에서 런타임 타입 정보를 추가하거나 의존하거나, 타입 시스템 결과에 따라 다른 코드를 생성하는 대신, 런타임 메타데이터가 필요 없는 프로그래밍 패턴을 권장하십시오. ([참고](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals))

=> 런타임에 의존하지 않는 패턴

```ts
const names: [string, string] = ["Alice", "Bob"];
// Tuple type '[string, string]' of length '2' has no element at index '2'.ts(2493)
console.log(names[2].toUpperCase());
```

## Item2: TS 설정 이애하기

환경설정 이야기라 간단히 하고 넘어감

- noImplictAny: any 비허용 여부
- strictNullCheck는 null 체크인데 pnpm create vite, cra 등에서는 기본설정이 true임

  ```ts
  // strictNulCheck = false 일때 유효한 코드
  const x: number = null;
  // strictNulLCheck = true 일때 오류
  const x: number = null; // null은 number에 할당 할 수 없습니다.
  ```

## Item3: 코드 생성과 타입 체크는 관계가 없다.

TS의 세계는 런타임을 모른다.

- TS는 컴파일되어 JS가 된다.
- TS는 타입체크를 한다.

위 2가지 기능은 독립적이다. **즉 타입 에러가 나도 컴파일은 된다.**

### 타입 연산은 런타임에 영향을 주지 않는다.

- TS는 JS로 컴파일되면 제거된다.
- 경험: Swagger/OpenAPI 기반으로 개발할 때, 백엔드가 잘못된 타입을 내려준 적이 있었다. 급히 핫픽스로 배포 해야하는데, 타입에러때문에 빌드가 깨지고 배포가 안됨. => 개발 환경에서 실제 API 응답으로 테스트 했고, 런타임에는 문제가 없음을 확인한 뒤 as로 타입 오류만 우회해 배포했다. 타입 체크는 런타임에 영향을 주지 않기 때문에, '실제 실행이 안전한지'는 런타임 기준으로 확인할 수 있었다.
- as를 남발하면 `TS가 알고 있는 세계`와 `실제 런타임` 사이의 간극이 커진다. 그 간극이 커질수록 TS는 오류를 미리 잡는 역할을 못 한다.

### 런타임에서 타입체크 불가능

#### 타입스크립트는 간접 추론을 하지 않는다. (Readonly만 직접 추론)

객체의 값은 언제든 변경될 수 있다는 JS를 모델링

```ts
const hasAddress = !!user.address; // boolean

defaultValues: hasAddress
  ? {
      // 'user.address' is possibly 'undefined'
      receiver: user.address.receiver.name,
    }
  : undefined;
```

위 코드에서 hasAddress를 통해 user.address!==undefined임을 확인하지만, TS에서 user.address의 값은 undefined일 경우를 고려한다. 왜냐하면 JS에서 user.address = undefined를 통해 user.address를 바꾸는게 가능하기 때문이다.

위 문제를 해결하려면 변수를 통한 간접 추론을 하지 말고 직접 검사를 해야 한다.

```ts
defaultValues: !!user.address
  ? {
      receiver: user.address.receiver.name,
    }
  : undefined;
```

### 태그기법

런타임과 TS의 간극을 줄이는데 사용할 수 있는 스킬중 하나.

키오스크를 만들어야 하는 상황에서 옵션의 종류가 3가지가 있었음.

![이미지 예시](https://kr-components.s3.ap-northeast-2.amazonaws.com/image.png)

> 그리드 옵션은 컬럼수가 필요하고, 리스트 옵션은 최소 선택 개수, 최대 선택 개수가 내려온다.

```ts
interface BaseOption {
  id: number;
  name: string;
  labels: string[];
}

export interface GridOption extends BaseOption {
  tag: "grid";
  col: number;
  icons: string[];
}

export interface SelectOption extends BaseOption {
  tag: "select";
  prices: number[];
}

export interface ListOption extends BaseOption {
  tag: "list";
  maxCount: number;
  minCount: number;
  prices: number[];
}

export type OptionResponse = GridOption | SelectOption | ListOption; // 태그된 유니온

// Do Not

// matchedOption: OptionResponse | undefined
if (matchedOption) {
  // GridOption에 prices가 없다는 내용과 타입충돌을 방지하기 위해 as를 사용할 경우 오로지 개발자의 능력에 의존한다.
  const price = (matchedOption as ListOption).prices[selectedIndex];
}

// Do
function isListOption(option: OptionResponse): option is ListOption {
  return option.tag === "list";
}

if (matchedOption && isListOption(matchedOption)) {
  const price = matchedOption.prices[selectedIndex];
}
```

태그기법을 통해 런타임 동작이 아니라 실제 데이터 타입에 근거한 타입 검증가능

## Item4: 구조적 타이핑(덕 타이핑)

![발 3개 오리](https://kr-components.s3.ap-northeast-2.amazonaws.com/image3.png)

> 어떤 새가 오리처럼 울고, 오리처럼 날면 오리다. _발이 3개더라도_

### 구조적 타이핑

#### 최소 요구 조건만 만족하면 OK

```ts
interface Vector2D { x: number; y: number; }
function calculateLength(v: Vector2D) { ... }

interface NamedVector extends Vector2D { name: string; }

// OK - 구조적 타이핑(x,y가 있으면 Vector2D 라고 생각한다.
const v: NamedVector = { x: 3, y: 4, name: "zee" }
calculateLength(v)

interface Vector3D { x:number; y:number; z:number; }

// OK - 구조적 타이핑(x,y가 있으면 Vector2D 라고 생각한다.
function normalize(v: Vector3D) {
  const length = calculateLength(v)
  ...
}

```

calculateLength가 요구하는 건 `{x:number, y:number}` 뿐이고, `NamedVector`는 그걸 포함하니까 호환.

#### 구조적 타이핑의 부작용

```ts
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function calculateLengthL1(v: Vector3D) {
  for (const axis of Object.keys(v)) {
    // Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Vector3D'. No index signature with a parameter of type 'string' was found on type 'Vector3D'.
    const coord = v[axis];
  }
}
```

- TS는 런타임을 모른다.
- TS는 JS를 모델링한다. -> JS 객체 값은 언제든 바뀔 수 있다.
  - 런타임의 실제 객체가 아니라, `타입 시스템이 안전하게 가정하는 최소 보장`을 기준으로 해석 => 구조적 타이핑 때문에 v라는 참조가 실제 값보다 더 넓은 타입으로 보일 수 있음

##### 런타임 관점과 TS 관점 비교

```js
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function f(v: Vector3D) {
  ...
}
```

- 런타임: v는 항상 { x, y, z }를 가진다
- TS: v는 Vector3D의 구조를 만족하는 어떤 객체든 될 수 있다 (오리처럼 날고 오리처럼 울면 발이 3개여도 오리다.)

  ```ts
  const a = { x: 1, y: 2, z: 3 };
  const b = { x: 1, y: 2, z: 3, w: 4 };
  const c = JSON.parse("..."); // 런타임에서 x,y,z 있음

  const v3: Vector3D = a; // OK
  const v4: Vector3D = b; // OK
  const v5: Vector3D = c; // OK
  ```

TS 입장에서는 v가 x,y,z만 있는지 그 외 속성은 없는지 보장하지 못하기 때문에 axis가 'x|y|z' 라고 보장하지 못한다.

### 잉여 속성 체크

> TypeScript 1.6에서는 과도하거나 잘못 입력된 속성을 잡아내기 위해 객체 리터럴 할당에 대한 더욱 엄격한 검사를 시행합니다. 특히, 새로운 객체 리터럴을 변수에 할당하거나 비어 있지 않은 대상 타입의 인수로 전달할 때, 대상 타입에 존재하지 않는 속성을 객체 리터럴에 지정하면 오류가 발생합니다. [TS 공식문서](https://typescriptdocs.com/release-notes/TypeScript%201.6.html#stricter-object-literal-assignment-checks)

```ts
interface Vector2D { x: number; y: number; }
function calculateLength(v: Vector2D) { ... }

// 잉여 속성 체크 - Object literal may only specify known properties, and 'z' does not exist in type 'Vector2D'.ts(2353)
calculateLength({ x: 3, y: 4, z: 5 })
```

`{x:3, y:4, z:5}` 를 변수에 담아 전달하면 구조적 타이핑이 적용된다.

```ts
interface Vector2D { x: number; y: number; }
function calculateLength(v: Vector2D) { ... }

interface Vector3D { x:number; y:number; z:number; }

const vector:Vector3D = { x: 3, y: 4, z: 5 }

calculateLength(vector)
```

## Item5: any 지양하기

아래 내용 요약하면 any는 타입스크립트를 무효화한다.

- any를 쓰면 함수 매개변수에 넣을때 걸리지 않는다.

  ```ts
  function calculateAge(birthDate:Date):number{
    ...
  }

  let birthDate: any = '1990-01-11'

  calculate(birthDate) // Date 자리에 string이 들어간다.
  ```

- any를 쓰면 타입 추론이 안된다.
- any를 쓰면 Rename Symbol이 안된다.
- any는 리팩토링할때 버그를 감춘다.
- any는 타입설계를 감춘다.
- any는 타입시스템의 신뢰도를 떨어뜨린다.
