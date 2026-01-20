// // // class C {
// // //   vals = [1, 2, 3];
// // //   logSquares() {
// // //     console.log("디스", this);
// // //     for (const val of this.vals) {
// // //       console.log(val * val);
// // //     }
// // //   }
// // // }

// // // const c = new C();
// // // const method = c.logSquares;
// // // method();
declare function makeButton(config: { text: string; onClick: () => void }): any;

class ResetButton {
  // 클래스 필드 + 화살표 함수: this가 항상 인스턴스로 고정됨
  onClick = () => {
    console.log("Resetting", this);
  };

  render() {
    return makeButton({ text: "Reset", onClick: this.onClick });
  }
}
interface KeyboardEvent {
  key: string;
}
interface HTMLElementEventMap {
  keydown: KeyboardEvent;
}

interface HTMLElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  ): void;
}

function addKeyListener(
  el: HTMLElement,
  fn: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener("keydown", function (e) {
    fn.call(this, e);
  });
}

// type ClickHandler = (this: void, e: Event) => void; // this 쓰면 안 됨

// const handler: ClickHandler = (e) => {
//   console.log(e.type);
// };

// const handler2: ClickHandler = function (this: void, e) {
//   console.log(e.type);
// };

// const bad: ClickHandler = (e) => {
//   console.log(this);
// };

/**
 * 인사
 */
function greeting() {
  console.log("hi");
}
