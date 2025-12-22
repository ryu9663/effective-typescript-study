# Effective TypeScript 미션 상세 가이드

이 문서는 각 주차별 미션을 CLI 프로그램으로 구현하기 위한 상세 가이드입니다.

---

## 📋 전체 구조

### CLI 메인 메뉴
```
=== Effective TypeScript Study ===
주차를 선택하세요:
1. WEEK 1: Inventory System
2. WEEK 2: Generic Repository
3. WEEK 3: Order State Machine
4. WEEK 4: Payment Gateway
exit: 종료

> _
```

---

## 🗓️ WEEK 1: Inventory System (상품 재고 관리)

### 🎯 학습 목표
- `readonly` 속성으로 불변성 보장
- 구조적 타이핑과 잉여 속성 체크
- `any` 타입 사용 금지

### 📥 입력 명령어

| 명령어 | 형식 | 설명 |
|--------|------|------|
| `add` | `add <id> <name> <price> <category>` | 상품 등록 |
| `get` | `get <id>` | 상품 조회 |
| `list` | `list` | 전체 목록 조회 |
| `help` | `help` | 도움말 |
| `back` | `back` | 메인 메뉴로 |

### 📤 출력 예시

#### ✅ 성공 케이스

**1. 상품 등록**
```
> add PROD-001 노트북 1500000 electronics

✅ 상품이 등록되었습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID       : PROD-001
이름     : 노트북
가격     : 1,500,000원
카테고리 : electronics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**2. 상품 조회**
```
> get PROD-001

{ 
  id: 'PROD-001', 
  name: '노트북', 
  price: 1500000, 
  category: 'electronics' 
}
```

**3. 전체 목록 조회**
```
> list

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
총 2개의 상품
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1] PROD-001 | 노트북 | 1,500,000원 | electronics
[2] PROD-002 | 마우스 | 50,000원 | electronics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### ❌ 실패 케이스

**1. 중복 ID 등록 시도**
```
> add PROD-001 키보드 100000 electronics

❌ 오류: 이미 존재하는 상품 ID입니다.
```

**2. 존재하지 않는 상품 조회**
```
> get PROD-999

undefined
```

**3. 잘못된 형식**
```
> add PROD-001 노트북

❌ 오류: 인자가 부족합니다. 형식: add <id> <name> <price> <category>
```

### 🔍 검증 조건

#### REQ-001: 상품 등록
- [x] 4개의 인자 모두 필수 (id, name, price, category)
- [x] price는 숫자로 변환 가능해야 함
- [x] 동일 ID 재등록 시 에러 발생

#### REQ-002: 상품 조회
- [x] 존재하는 ID → Product 객체 반환
- [x] 존재하지 않는 ID → undefined 반환

#### REQ-003: 전체 목록 조회
- [x] readonly 배열 반환
- [x] 반환된 배열 수정 시도 시 TypeScript 컴파일 에러

#### REQ-004: 불변성
```typescript
type Product = {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
};

const product: Product = { id: 'P1', name: 'A', price: 100, category: 'C' };
product.price = 200;  // ❌ 컴파일 에러: Cannot assign to 'price' because it is a read-only property
```

#### REQ-005: 타입 안전성
```typescript
// ❌ 금지: any 사용
function addProduct(product: any) { ... }

// ✅ 올바름: 명시적 타입
function addProduct(product: Product): void { ... }
```

### 💻 핵심 타입 정의
```typescript
type Product = {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
};

class Inventory {
  private products: Map<string, Product> = new Map();
  
  addProduct(product: Product): void {
    if (this.products.has(product.id)) {
      throw new Error("이미 존재하는 상품 ID입니다.");
    }
    this.products.set(product.id, product);
  }
  
  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }
  
  getAllProducts(): readonly Product[] {
    return Array.from(this.products.values());
  }
}
```

---

## 🗓️ WEEK 2: Generic Repository (제네릭 저장소)

### 🎯 학습 목표
- 제네릭 타입 `<T extends Entity>` 사용
- `Partial<T>`, `keyof T` 활용
- 타입 안전한 배열 조작

### 📥 입력 명령어

| 명령어 | 형식 | 설명 |
|--------|------|------|
| `create` | `create <type>` | Repository 생성 (type: product/order/user) |
| `save` | `save <type> <json>` | 엔티티 저장 |
| `find` | `find <type> <id>` | ID로 조회 |
| `findby` | `findby <type> <json>` | 부분 쿼리 검색 |
| `list` | `list <type> [sortBy] [order]` | 전체 조회 + 정렬 |
| `pluck` | `pluck <type> <field>` | 특정 필드만 추출 |

### 📤 출력 예시

#### ✅ 성공 케이스

**1. 저장**
```
> save product {"id":"P1","name":"노트북","price":1500000,"category":"electronics"}

✅ 저장 완료: P1
```

**2. 부분 쿼리 검색**
```
> findby product {"category":"electronics","price":1500000}

검색 결과: 1건
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[
  { 
    id: 'P1', 
    name: '노트북', 
    price: 1500000, 
    category: 'electronics' 
  }
]
```

**3. 정렬된 목록 조회**
```
> list product price desc

가격 내림차순 정렬
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1] P1 | 노트북 | 1,500,000원
[2] P2 | 마우스 | 50,000원
[3] P3 | 키보드 | 30,000원
```

**4. 필드 추출 (pluck)**
```
> pluck product name

추출된 필드: name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
['노트북', '마우스', '키보드']
타입: string[]
```

#### ❌ 실패 케이스

**1. 존재하지 않는 필드로 검색**
```typescript
// TypeScript 컴파일 에러
repo.findBy({ invalidField: "value" });
// ❌ Error: Object literal may only specify known properties
```

**2. 잘못된 정렬 키**
```typescript
// TypeScript 컴파일 에러
repo.findAll("nonExistentField", "asc");
// ❌ Error: Argument of type '"nonExistentField"' is not assignable to parameter of type 'keyof Product'
```

**3. 잘못된 pluck 키**
```typescript
// TypeScript 컴파일 에러
pluck(products, "invalidKey");
// ❌ Error: Argument of type '"invalidKey"' is not assignable to parameter of type 'keyof Product'
```

### 🔍 검증 조건

#### REQ-101: 범용 저장소
```typescript
interface Entity {
  id: string;
}

class Repository<T extends Entity> {
  // T는 반드시 id: string 속성을 가져야 함
}

// ✅ 올바름
interface Product extends Entity {
  id: string;
  name: string;
  price: number;
}

// ❌ 컴파일 에러
interface InvalidType {
  name: string;  // id 속성 없음
}
const repo = new Repository<InvalidType>();  // Error!
```

#### REQ-102: 타입 안전한 검색
```typescript
findBy(query: Partial<T>): T[] {
  // Partial<T>는 T의 모든 속성을 선택적으로 만듦
  // 예: Partial<Product> = { id?: string; name?: string; price?: number; category?: string }
}

// ✅ 올바름
repo.findBy({ category: "electronics" });
repo.findBy({ price: 50000, category: "electronics" });

// ❌ 컴파일 에러
repo.findBy({ invalidField: "value" });
```

#### REQ-103: 함수형 유틸리티
```typescript
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const products: Product[] = [...];
const names = pluck(products, "name");  // 타입: string[]
const prices = pluck(products, "price");  // 타입: number[]
```

#### REQ-104: 정렬 기능
```typescript
findAll(sortBy?: keyof T, order?: 'asc' | 'desc'): T[] {
  // keyof T는 T의 모든 키를 유니온 타입으로 만듦
  // 예: keyof Product = "id" | "name" | "price" | "category"
}

// ✅ 올바름
repo.findAll("price", "desc");
repo.findAll("name", "asc");

// ❌ 컴파일 에러
repo.findAll("invalidKey", "asc");
```

### 💻 핵심 타입 정의
```typescript
interface Entity {
  id: string;
}

class Repository<T extends Entity> {
  private items: Map<string, T> = new Map();
  
  save(item: T): void {
    this.items.set(item.id, item);
  }
  
  findById(id: string): T | undefined {
    return this.items.get(id);
  }
  
  findBy(query: Partial<T>): T[] {
    return Array.from(this.items.values()).filter(item => {
      return Object.entries(query).every(([key, value]) => {
        return item[key as keyof T] === value;
      });
    });
  }
  
  findAll(sortBy?: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    const items = Array.from(this.items.values());
    if (!sortBy) return items;
    
    return items.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return order === 'asc' ? result : -result;
    });
  }
  
  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}
```

---

## 🗓️ WEEK 3: Order State Machine (주문 상태 관리)

### 🎯 학습 목표
- Discriminated Union 타입 활용
- 타입 시스템으로 불가능한 상태 방지
- 타입 안전한 상태 전이 함수

### 📥 입력 명령어

| 명령어 | 형식 | 설명 |
|--------|------|------|
| `create` | `create <orderId>` | 주문 생성 (pending) |
| `pay` | `pay <orderId> <method>` | 결제 처리 (pending → paid) |
| `ship` | `ship <orderId> <tracking>` | 배송 시작 (paid → shipped) |
| `deliver` | `deliver <orderId>` | 배송 완료 (shipped → delivered) |
| `cancel` | `cancel <orderId> <reason>` | 주문 취소 |
| `status` | `status <orderId>` | 주문 상태 조회 |

### 📤 출력 예시

#### ✅ 성공 케이스

**1. 주문 생성**
```
> create ORD-001

✅ 주문이 생성되었습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
상태      : pending (결제 대기 중)
주문 ID   : ORD-001
생성 시각 : 2024-12-13T15:30:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**2. 결제 처리**
```
> pay ORD-001 card

✅ 결제가 완료되었습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
상태      : paid (결제 완료)
주문 ID   : ORD-001
결제 수단 : card
결제 시각 : 2024-12-13T15:32:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**3. 배송 시작**
```
> ship ORD-001 TRACK-12345

✅ 배송이 시작되었습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
상태       : shipped (배송 중)
주문 ID    : ORD-001
운송장번호 : TRACK-12345
배송 시각  : 2024-12-13T15:35:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**4. 배송 완료**
```
> deliver ORD-001

✅ 배송이 완료되었습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
상태       : delivered (배송 완료)
주문 ID    : ORD-001
완료 시각  : 2024-12-13T16:00:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**5. 주문 취소**
```
> cancel ORD-002 고객 요청

✅ 주문이 취소되었습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
상태      : cancelled
주문 ID   : ORD-002
취소 사유 : 고객 요청
취소 시각 : 2024-12-13T15:40:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### ❌ 실패 케이스 (타입 시스템이 방지)

**1. 결제 없이 배송 시도**
```typescript
const pendingOrder: PendingOrder = { ... };
shipOrder(pendingOrder, "TRACK-123");
// ❌ TypeScript 컴파일 에러:
// Argument of type 'PendingOrder' is not assignable to parameter of type 'PaidOrder'
```

**2. 배송 완료 후 되돌리기 시도**
```typescript
const deliveredOrder: DeliveredOrder = { ... };
shipOrder(deliveredOrder, "TRACK-456");
// ❌ TypeScript 컴파일 에러:
// Argument of type 'DeliveredOrder' is not assignable to parameter of type 'PaidOrder'
```

**3. 취소된 주문 복구 시도**
```typescript
const cancelledOrder: CancelledOrder = { ... };
payOrder(cancelledOrder, "card");
// ❌ TypeScript 컴파일 에러:
// Argument of type 'CancelledOrder' is not assignable to parameter of type 'PendingOrder'
```

### 🔍 검증 조건

#### REQ-201: 주문 상태 정의 (Discriminated Union)
```typescript
type PendingOrder = {
  status: 'pending';  // discriminant
  orderId: string;
  items: string[];
  createdAt: string;
};

type PaidOrder = {
  status: 'paid';
  orderId: string;
  items: string[];
  createdAt: string;
  paidAt: string;      // ⭐ paid 상태에서만 존재
  paymentMethod: string;
};

type ShippedOrder = {
  status: 'shipped';
  orderId: string;
  items: string[];
  createdAt: string;
  paidAt: string;
  paymentMethod: string;
  shippedAt: string;
  trackingNumber: string;  // ⭐ shipped 상태에서만 존재
};

type DeliveredOrder = {
  status: 'delivered';
  orderId: string;
  items: string[];
  createdAt: string;
  paidAt: string;
  paymentMethod: string;
  shippedAt: string;
  trackingNumber: string;
  deliveredAt: string;  // ⭐ delivered 상태에서만 존재
};

type CancelledOrder = {
  status: 'cancelled';
  orderId: string;
  createdAt: string;
  cancelledAt: string;
  cancelReason: string;
};

type Order = 
  | PendingOrder 
  | PaidOrder 
  | ShippedOrder 
  | DeliveredOrder 
  | CancelledOrder;
```

#### REQ-202: 상태 전이 규칙

**허용되는 전이 (✅)**
```typescript
// pending → paid
function payOrder(order: PendingOrder, method: string): PaidOrder {
  return {
    ...order,
    status: 'paid',
    paidAt: new Date().toISOString(),
    paymentMethod: method,
  };
}

// paid → shipped
function shipOrder(order: PaidOrder, trackingNumber: string): ShippedOrder {
  return {
    ...order,
    status: 'shipped',
    shippedAt: new Date().toISOString(),
    trackingNumber,
  };
}

// shipped → delivered
function deliverOrder(order: ShippedOrder): DeliveredOrder {
  return {
    ...order,
    status: 'delivered',
    deliveredAt: new Date().toISOString(),
  };
}

// pending/paid → cancelled
function cancelOrder(
  order: PendingOrder | PaidOrder, 
  reason: string
): CancelledOrder {
  return {
    status: 'cancelled',
    orderId: order.orderId,
    createdAt: order.createdAt,
    cancelledAt: new Date().toISOString(),
    cancelReason: reason,
  };
}
```

**금지되는 전이 (❌ 컴파일 에러)**
```typescript
// pending → shipped (결제 없이 배송 불가)
const pending: PendingOrder = { ... };
shipOrder(pending, "TRACK-123");  // ❌ Error!

// delivered → shipped (배송 완료 후 되돌릴 수 없음)
const delivered: DeliveredOrder = { ... };
shipOrder(delivered, "TRACK-456");  // ❌ Error!

// cancelled → paid (취소 후 복구 불가)
const cancelled: CancelledOrder = { ... };
payOrder(cancelled, "card");  // ❌ Error!
```

#### REQ-203: 타입 안전한 상태 처리

**타입 좁히기 (Type Narrowing)**
```typescript
function processOrder(order: Order): void {
  switch (order.status) {
    case 'pending':
      // 이 블록에서 order는 PendingOrder 타입
      console.log(order.orderId);
      // console.log(order.trackingNumber);  // ❌ Error: trackingNumber 없음
      break;
      
    case 'shipped':
      // 이 블록에서 order는 ShippedOrder 타입
      console.log(order.trackingNumber);  // ✅ OK
      console.log(order.paidAt);          // ✅ OK
      break;
      
    case 'cancelled':
      // 이 블록에서 order는 CancelledOrder 타입
      console.log(order.cancelReason);
      // console.log(order.paidAt);  // ❌ Error: paidAt 없음
      break;
  }
}
```

### 💻 핵심 구현
```typescript
class OrderManager {
  private orders: Map<string, Order> = new Map();
  
  createOrder(orderId: string): PendingOrder {
    const order: PendingOrder = {
      status: 'pending',
      orderId,
      items: [],
      createdAt: new Date().toISOString(),
    };
    this.orders.set(orderId, order);
    return order;
  }
  
  payOrder(orderId: string, paymentMethod: string): PaidOrder {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("주문을 찾을 수 없습니다.");
    if (order.status !== 'pending') {
      throw new Error("결제 대기 중인 주문만 결제할 수 있습니다.");
    }
    
    const paidOrder: PaidOrder = {
      ...order,
      status: 'paid',
      paidAt: new Date().toISOString(),
      paymentMethod,
    };
    this.orders.set(orderId, paidOrder);
    return paidOrder;
  }
  
  shipOrder(orderId: string, trackingNumber: string): ShippedOrder {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("주문을 찾을 수 없습니다.");
    if (order.status !== 'paid') {
      throw new Error("결제 완료된 주문만 배송할 수 있습니다.");
    }
    
    const shippedOrder: ShippedOrder = {
      ...order,
      status: 'shipped',
      shippedAt: new Date().toISOString(),
      trackingNumber,
    };
    this.orders.set(orderId, shippedOrder);
    return shippedOrder;
  }
  
  // ... deliverOrder, cancelOrder 구현
}
```

---

## 🗓️ WEEK 4: Payment Gateway (결제 API 연동)

### 🎯 학습 목표
- `unknown` 타입 안전하게 처리
- 타입 가드 (Type Guard) 구현
- 타입 단언 (`as`) 사용 금지

### 📥 입력 명령어

| 명령어 | 형식 | 설명 |
|--------|------|------|
| `process` | `process <amount> <method>` | 결제 처리 |
| `mock` | `mock <scenario>` | 모의 응답 테스트 (success/fail/invalid) |

### 📤 출력 예시

#### ✅ 성공 케이스

**1. 결제 성공**
```
> process 50000 card

🔄 외부 결제 API 호출 중...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
수신된 데이터 (unknown 타입):
{
  "success": true,
  "transactionId": "TXN-2024-001",
  "amount": 50000,
  "method": "card",
  "timestamp": "2024-12-13T15:30:00Z"
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 타입 가드 검증 중...
✅ PaymentSuccess 타입으로 확인됨

✅ 결제 성공
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
거래 ID   : TXN-2024-001
금액      : 50,000원
결제 수단 : card
처리 시각 : 2024-12-13T15:30:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**2. 결제 실패**
```
> mock fail

🔄 모의 실패 응답 생성 중...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
수신된 데이터 (unknown 타입):
{
  "success": false,
  "errorCode": "INSUFFICIENT_FUNDS",
  "errorMessage": "잔액 부족",
  "timestamp": "2024-12-13T15:30:00Z"
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 타입 가드 검증 중...
✅ PaymentFailure 타입으로 확인됨

❌ 결제 실패
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
에러 코드 : INSUFFICIENT_FUNDS
에러 메시지: 잔액 부족
처리 시각  : 2024-12-13T15:30:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### ❌ 실패 케이스 (타입 가드가 감지)

**1. null/undefined 응답**
```
> mock invalid

🔄 모의 잘못된 응답 생성 중...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
수신된 데이터 (unknown 타입):
null
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 타입 가드 검증 중...
❌ 타입 가드 실패: 응답이 null 또는 undefined입니다.
```

**2. 객체가 아닌 응답**
```
수신된 데이터 (unknown 타입):
"error string"

🔍 타입 가드 검증 중...
❌ 타입 가드 실패: 응답이 객체가 아닙니다. (타입: string)
```

**3. 필수 필드 누락**
```
수신된 데이터 (unknown 타입):
{
  "success": true,
  "amount": 50000
  // transactionId 누락!
}

🔍 타입 가드 검증 중...
❌ 타입 가드 실패: 필수 필드 'transactionId'가 누락되었습니다.
```

**4. 필드 타입 불일치**
```
수신된 데이터 (unknown 타입):
{
  "success": true,
  "transactionId": 12345,  // ❌ 숫자 (string이어야 함)
  "amount": 50000,
  "method": "card",
  "timestamp": "2024-12-13T15:30:00Z"
}

🔍 타입 가드 검증 중...
❌ 타입 가드 실패: 'transactionId' 필드의 타입이 올바르지 않습니다. (예상: string, 실제: number)
```

### 🔍 검증 조건

#### REQ-301: 결제 API 연동
```typescript
async function processPayment(
  amount: number, 
  method: string
): Promise<PaymentResult> {
  // 외부 API 호출 (타입이 보장되지 않음)
  const response: unknown = await fetch('/payment/process', {
    method: 'POST',
    body: JSON.stringify({ amount, method })
  }).then(res => res.json());
  
  // ⭐ unknown 타입을 타입 가드로 검증
  if (isPaymentSuccess(response)) {
    return { type: 'success', data: response };
  } else if (isPaymentFailure(response)) {
    return { type: 'failure', data: response };
  } else {
    throw new Error("알 수 없는 응답 형식");
  }
}
```

#### REQ-302: 타입 가드 구현

**타입 정의**
```typescript
type PaymentSuccess = {
  success: true;
  transactionId: string;
  amount: number;
  method: string;
  timestamp: string;
};

type PaymentFailure = {
  success: false;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
};
```

**타입 가드 함수 (✅ 올바른 구현)**
```typescript
function isPaymentSuccess(data: unknown): data is PaymentSuccess {
  // 1. null/undefined 체크
  if (data == null) {
    return false;
  }
  
  // 2. 객체 타입 검증
  if (typeof data !== 'object') {
    return false;
  }
  
  // 3. 필수 필드 존재 여부
  if (!('success' in data)) {
    return false;
  }
  
  // 4. success 필드 타입 검증
  if (typeof (data as any).success !== 'boolean') {
    return false;
  }
  
  // 5. success === true인 경우의 필수 필드 검증
  if ((data as any).success !== true) {
    return false;
  }
  
  const obj = data as any;
  
  return (
    'transactionId' in obj && typeof obj.transactionId === 'string' &&
    'amount' in obj && typeof obj.amount === 'number' &&
    'method' in obj && typeof obj.method === 'string' &&
    'timestamp' in obj && typeof obj.timestamp === 'string'
  );
}

function isPaymentFailure(data: unknown): data is PaymentFailure {
  if (data == null || typeof data !== 'object') {
    return false;
  }
  
  const obj = data as any;
  
  return (
    'success' in obj && obj.success === false &&
    'errorCode' in obj && typeof obj.errorCode === 'string' &&
    'errorMessage' in obj && typeof obj.errorMessage === 'string' &&
    'timestamp' in obj && typeof obj.timestamp === 'string'
  );
}
```

**❌ 금지되는 패턴**
```typescript
// ❌ 타입 단언 사용 금지
function processPayment(response: unknown): PaymentSuccess {
  return response as PaymentSuccess;  // 위험! 런타임 검증 없음
}

// ❌ any 타입 사용 금지
function processPayment(response: any): void {
  console.log(response.transactionId);  // 타입 안전성 상실
}
```

#### REQ-303: 에러 처리

**모든 예외 케이스 처리**
```typescript
function safeProcessPayment(data: unknown): string {
  // 케이스 1: null/undefined
  if (data == null) {
    return "❌ 응답이 null 또는 undefined입니다.";
  }
  
  // 케이스 2: 객체가 아님 (string, number, array 등)
  if (typeof data !== 'object') {
    return `❌ 응답이 객체가 아닙니다. (타입: ${typeof data})`;
  }
  
  // 케이스 3: 배열인 경우
  if (Array.isArray(data)) {
    return "❌ 응답이 배열입니다. 객체가 필요합니다.";
  }
  
  // 케이스 4: success 필드 누락
  if (!('success' in data)) {
    return "❌ 필수 필드 'success'가 누락되었습니다.";
  }
  
  // 케이스 5: success 필드 타입 불일치
  if (typeof (data as any).success !== 'boolean') {
    return "❌ 'success' 필드의 타입이 boolean이 아닙니다.";
  }
  
  // 케이스 6-7: 타입 가드로 정확한 타입 확인
  if (isPaymentSuccess(data)) {
    return `✅ 결제 성공: ${data.transactionId}`;
  } else if (isPaymentFailure(data)) {
    return `❌ 결제 실패: [${data.errorCode}] ${data.errorMessage}`;
  } else {
    return "❌ 알 수 없는 응답 형식입니다.";
  }
}
```

### 💻 핵심 구현
```typescript
class PaymentGateway {
  // 외부 API 시뮬레이션
  async callExternalAPI(
    amount: number, 
    method: string
  ): Promise<unknown> {
    // 실제로는 fetch를 사용하지만, 여기서는 랜덤 응답 생성
    const random = Math.random();
    
    if (random > 0.7) {
      // 성공 응답
      return {
        success: true,
        transactionId: `TXN-${Date.now()}`,
        amount,
        method,
        timestamp: new Date().toISOString(),
      };
    } else if (random > 0.4) {
      // 실패 응답
      return {
        success: false,
        errorCode: "INSUFFICIENT_FUNDS",
        errorMessage: "잔액 부족",
        timestamp: new Date().toISOString(),
      };
    } else if (random > 0.2) {
      // 잘못된 형식 (배열)
      return ["error"];
    } else {
      // null
      return null;
    }
  }
  
  async processPayment(
    amount: number, 
    method: string
  ): Promise<PaymentResult> {
    const response: unknown = await this.callExternalAPI(amount, method);
    
    // 타입 가드로 안전하게 처리
    if (isPaymentSuccess(response)) {
      return {
        type: 'success',
        message: `결제 성공: ${response.transactionId}`,
        data: response,
      };
    } else if (isPaymentFailure(response)) {
      return {
        type: 'failure',
        message: `결제 실패: [${response.errorCode}] ${response.errorMessage}`,
        data: response,
      };
    } else {
      return {
        type: 'error',
        message: this.getErrorMessage(response),
      };
    }
  }
  
  private getErrorMessage(data: unknown): string {
    if (data == null) {
      return "응답이 null 또는 undefined입니다.";
    }
    if (typeof data !== 'object') {
      return `응답이 객체가 아닙니다. (타입: ${typeof data})`;
    }
    if (Array.isArray(data)) {
      return "응답이 배열입니다.";
    }
    return "알 수 없는 응답 형식입니다.";
  }
}

type PaymentResult = 
  | { type: 'success'; message: string; data: PaymentSuccess }
  | { type: 'failure'; message: string; data: PaymentFailure }
  | { type: 'error'; message: string };
```

---

## 🚀 구현 순서 가이드

### 1단계: 프로젝트 구조 생성
```
mission-template/
├── src/
│   ├── index.ts           # 메인 CLI 진입점
│   ├── week1/
│   │   ├── types.ts       # Product, Inventory 타입
│   │   └── cli.ts         # WEEK 1 CLI 처리
│   ├── week2/
│   │   ├── types.ts       # Entity, Repository 타입
│   │   └── cli.ts         # WEEK 2 CLI 처리
│   ├── week3/
│   │   ├── types.ts       # Order 상태 타입들
│   │   └── cli.ts         # WEEK 3 CLI 처리
│   └── week4/
│       ├── types.ts       # Payment 타입, 타입 가드
│       └── cli.ts         # WEEK 4 CLI 처리
├── package.json
└── tsconfig.json
```

### 2단계: 각 주차별 구현
1. types.ts 먼저 작성 (타입 정의)
2. 비즈니스 로직 구현 (클래스/함수)
3. cli.ts 작성 (명령어 파싱 및 처리)
4. index.ts에 메뉴 통합

### 3단계: 테스트
- 각 명령어를 직접 실행하며 검증
- 에러 케이스도 반드시 테스트
- TypeScript 컴파일 에러가 예상대로 발생하는지 확인

---

## 📝 체크리스트

### WEEK 1
- [ ] Product 타입의 모든 필드가 readonly
- [ ] any 타입 사용하지 않음
- [ ] 동일 ID 재등록 시 에러 발생
- [ ] getAllProducts()가 readonly 배열 반환

### WEEK 2
- [ ] Repository<T extends Entity> 제약 조건 작동
- [ ] findBy()가 Partial<T> 사용
- [ ] 존재하지 않는 필드 검색 시 컴파일 에러
- [ ] pluck() 반환 타입이 T[K][]로 정확히 추론
- [ ] sortBy가 keyof T 사용

### WEEK 3
- [ ] 5가지 주문 상태 모두 정의
- [ ] Discriminated Union (status 필드로 구분)
- [ ] pending → shipped 시도 시 컴파일 에러
- [ ] shipped 상태는 trackingNumber 필수
- [ ] cancelled 상태에서 다른 상태로 전이 불가

### WEEK 4
- [ ] API 응답을 unknown으로 받음
- [ ] as 타입 단언 사용하지 않음
- [ ] isPaymentSuccess, isPaymentFailure 타입 가드 구현
- [ ] null/undefined/배열/잘못된 필드 모두 처리
- [ ] 타입 가드 실패 시 명확한 에러 메시지

---

## 💡 핵심 학습 포인트

### WEEK 1: readonly와 불변성
- **왜 중요한가?** 데이터가 실수로 변경되는 것을 컴파일 타임에 방지
- **실무 적용:** Redux state, React props, API 응답 객체

### WEEK 2: 제네릭과 타입 연산자
- **왜 중요한가?** 코드 재사용성 + 타입 안전성 동시 확보
- **실무 적용:** ORM, API 클라이언트, 유틸리티 함수

### WEEK 3: Discriminated Union
- **왜 중요한가?** 불가능한 상태를 타입 시스템으로 원천 차단
- **실무 적용:** 상태 머신, 폼 단계, API 응답 처리

### WEEK 4: unknown과 타입 가드
- **왜 중요한가?** 외부 데이터를 안전하게 처리
- **실무 적용:** API 연동, JSON 파싱, 사용자 입력 검증

---

**이제 각 주차의 구현을 시작하세요!** 🚀
