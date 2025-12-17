// // // interface User {
// // //   address?: {
// // //     street: number;
// // //   };
// // // }

// // // const user: User = {
// // //   address: {
// // //     street: "123 Main St" as unknown as number,
// // //   },
// // // };

// // // const hasAddress = !!user.address;

// // // if (!!user.address) {
// // //   console.log(user.address.street);
// // // }

// // // const names = ["Alice", "Bob"];
// // // // Cannot read property 'toUpperCase' of undefined
// // // console.log(names[2].toUpperCase());

// // // interface Vector2D { x: number; y: number; }
// // // function calculateLength(v: Vector2D) { ... }

// // // interface NamedVector extends Vector2D { name: string; }

// // // // OK - 구조적 타이핑(x,y가 있으면 Vector2D 라고 생각한다.
// // // const v: NamedVector = { x: 3, y: 4, name: "zee" }
// // // calculateLength(v)

// // // interface Vector3D { x:number; y:number; z:number; }

// // // // OK - 구조적 타이핑(x,y가 있으면 Vector2D 라고 생각한다.
// // // function normalize(v: Vector3D) {
// // //   const length = calculateLength(v)

// // // }

// // // // 잉여 속성 체크
// // // interface Vector2D { x: number; y: number; }

// // // interface Vector3D { x:number; y:number; z:number; }

// // // const vector:Vector3D = { x: 3, y: 4, z: 5 }
// // // // 잉여 속성 체크 - Object literal may only specify known properties, and 'z' does not exist in type 'Vector2D'.ts(2353)
// // // calculateLength(vector)

// // // const a = { x: 1, y: 2, z: 3 };
// // //   const b = { x: 1, y: 2, z: 3, w: 4 };
// // //   const c = JSON.parse("..."); // 런타임에서 x,y,z 있음

// // //   const v3:Vector3D = a; // OK
// // //   const v4:Vector3D = b; // OK
// // //   const v5:Vector3D = c; // OK

// // //   function calculateLengthL1(v: Vector3D) {
// // //   for (const axis of Object.keys(v)) {
// // //     const coord = v[axis];
// // //   }
// // // }

// // // function len(v: { x: number; y: number }) {
// // //   console.log(v.x, v.y);
// // // }

// // // const v33 = { x: 1, y: 2, z: 3 }
// // // len(v33); // JS에서 문제 없기 때문에 허용

// // interface BaseOption {
// //   id: number;
// //   name: string;
// //   labels: string[];
// // }

// // export interface GridOption extends BaseOption {
// //   tag: "grid";
// //   col: number;
// //   icons: string[];
// // }

// // export interface SelectOption extends BaseOption {
// //   tag: "select";
// //   prices: number[];
// // }

// // export interface ListOption extends BaseOption {
// //   tag: "list";
// //   maxCount: number;
// //   minCount: number;
// //   prices: number[];
// // }

// // export type OptionResponse = GridOption | SelectOption | ListOption; // 태그된 유니온

// // function isListOption(option: OptionResponse): option is ListOption {
// //   return option.tag === "list";
// // }
// // // let matchedOption: OptionResponse | null;
// // function a(matchedOption: OptionResponse | null) {
// //   if (matchedOption && isListOption(matchedOption)) {
// //     // as를 안쓰면 GridOption에 prices가 없다는 내용과 충돌
// //     const price = matchedOption.prices[0];
// //   }
// // }

// interface Vector3D {
//   x: number;
//   y: number;
//   z: number;
// }

// const a = {
//   x: 1,
//   y: 2,
//   z: 3,
// } as const;

// const isVector3D = (obj: any): obj is Vector3D => {
//   return (
//     typeof obj === "object" &&
//     obj !== null &&
//     typeof obj.x === "number" &&
//     typeof obj.y === "number" &&
//     typeof obj.z === "number"
//   );
// };
// function calculateLengthL1(v: Vector3D) {
//   for (const axis of Object.keys(v)) {
//     // Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Vector3D'. No index signature with a parameter of type 'string' was found on type 'Vector3D'.
//     if (axis === "x" || axis === "y" || axis === "z") {
//       const coord = v[axis];
//     }
//   }
// }

interface Person {
  firstName: string;
  lastName: string;
}

const formatName = (p: Person) => `${p.lastName}, ${p.firstName}`;
const formatNameAny = (p: any) => `${p.last}, ${p.first}`;
