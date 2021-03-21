window.EFFECT = (function () {
  "use strict";

  const isArrayLike = (obj) =>
    obj != null && typeof obj[Symbol.iterator] === "function";
  const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
  const randomArrayItemSelect = (array) =>
    array[Math.floor(Math.random() * array.length)];

  const exception_style = ["font-size"];

  function selectArrayValue(o, correction = 50) {
    if (isArrayLike(o)) {
      switch (o.length) {
        case 1:
          return o[0];
        case 2:
          return randomNumberInRange(o[0] - correction, o[1] + correction);
        default:
          return randomArrayItemSelect(o);
      }
    } else {
      return o;
    }
  }
  function Effect(cfg) {
    this.option = {};
    this.elements = [];
    this.isPlaying = false;
    // this.minSize = cfg.count || 10;
    // this.maxSize = 50;
    this.size = cfg.size || [10, 30];
    this.count = cfg.count || 10;
    this.target = cfg.target || document.body;
    this.text = cfg.text || "&#10052";
    this.color = cfg.color || "#FFFFFF";
    this.position = "absolute";
    this.speed = cfg.speed || [1, 1]; //프레임당 이동거리
    this.delay = cfg.delay || [1, 100];
    this.location = cfg.location || [-1, -1, [-200, 200], [-200, 200]];
  }

  function init() {
    const uuid = `effect-${this.uuid()}`; // 아이디 생성
    this.uuid = uuid;

    this.rootObject = document.createElement("div"); //루트
    this.rootObject.classList.add(uuid);
    this.target.appendChild(this.rootObject);
    this.rootObject.setAttribute(
      "style",
      "width:100%;height:100%;margin:0;padding:0;overflow:hidden"
    );

    console.log(`Create new Effect ${uuid}`);

    this.rootStyle = document.createElement("style"); //루트 스타일
    document.head.appendChild(this.rootStyle);
    this.styleUpdate(); // 스타일 업데이트

    for (let i = 0; i < this.count; i++) {
      this.flake();
    }
    return this;
  }

  /**
   * 고유아이디 생성 uuid
   * @returns
   */
  Effect.prototype.uuid = function () {
    const e = () =>
      (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return `${e()}-${e()}${e()}${e()}`;
  };

  Effect.prototype.styleUpdate = function () {
    this.default_style = this.default_style || Object.keys(document.body.style);
    const style_key = Object.keys(this).filter((o) =>
      this.default_style.includes(o)
    );

    this.style = {};
    style_key.forEach((o) => {
      this.style[o] = this[o];
    }); // 스타일 맵핑

    const style = Object.keys(this.style)
      .map((o) => `${o}:${this[o]}`)
      .join(";");
    const img_size = selectArrayValue(this.size, -1);
    const img = `.${this.uuid}.flake img{width:${img_size}ex;height:${img_size}ex}`;
    this.rootStyle.innerHTML = `.${this.uuid}.flake{${style}} ${img}`;
  };

  Effect.prototype.css = function (tag, value) {
    if (arguments.length == 1) {
      return this.style[tag];
    }

    this.style[tag] = value;
    this.styleUpdate();
    return this;
  };

  /**
   *
   * @returns
   */
  Effect.prototype.data = function () {
    const a = arguments,
      b = a.length;
    if (!(b - 1)) return this.rootObject.getAttribute("data-" + a[0]);
    else this.rootObject.setAttribute("data-" + a[0], a[1]);
    return this;
  };

  /**
   * 엘리먼트 생성
   *
   * 엘리먼트 출발지 목적지 산정방식
   * location : [출발x,출발y,도착x,도착y];
   *
   * 전제조건
   *    출발x,y값은 array/integer 로 지정
   *    출발x,y값이 음수(-1)일경우, 시작포인트는 화면(뷰) 사이즈에서 렌덤포인트로 지정됨.
   *    출발x,y값이 array값이 지정되었을 경우, array범위 내에서 적용됨 (항목 길이가 2 이상일 경우,
   *        해당 배열의 값들 중에서 선별되어 지정됨)
   *
   *    도착x,y값이 음수(-)일 경우, 시작포인트에서 해당 죄표만큼 이동한 값으로 지정
   *    도착x,y값이 음수(-1)일경우, 도착포인트는 화면(뷰) 사이즈에서 렌덤포인트로 지정됨.
   *    도착x,y값이 array값이 지정되었을 경우, array범위 내에서 적용됨 (항목 길이가 2 이상일 경우,
   *        해당 배열의 값들 중에서 선별되어 지정됨)
   *
   * 엘리먼트 속도 산정방식
   * speed : speed | [x,y] | [x,[1~y]] | [[1~x],y] | [[1~x],[1~y]] | [function,function]
   *
   * 전제조건
   *    5가지 방식을 모두 처리하며, 각각 x,y의 프레임별 이동 거리 산정방식
   *    거리 산정방식에 의하여 각 프레임별 이동 거리와 이동 속도를 미리 연산시킴
   *
   */
  Effect.prototype.flake = function () {
    const obj = document.createElement("div");

    this.rootObject.appendChild(obj);
    obj.classList.add(this.uuid);
    obj.classList.add("flake");
    obj.innerHTML =
      typeof this.text === "string"
        ? this.text
        : randomArrayItemSelect(this.text);

    function getLocationValue(pos, clientSize) {
      // 해당하는 값을 지정하는 함수
      if (pos === -1) {
        const randPoint = Math.random() * clientSize;
        return randPoint;
      } else {
        return selectArrayValue(pos);
      }
    }

    const { documentElement } = document;
    const define_location = [-1, -1, -200, -200];
    for (let i = this.location.length; i < 4; i++) {
      this.location[i] = define_location[i];
    }
    const pos = this.location.map((o, i) =>
      getLocationValue(
        o,
        i % 2 ? documentElement.clientHeight : documentElement.clientWidth
      )
    );

    if (isArrayLike(this.location[2])) {
      // x좌표
      if ((this.location[2].length == 2, this.location[2][0] < 0)) {
        const value = randomNumberInRange(
          this.location[2][0],
          this.location[2][1]
        ); // 값 선택
        pos[2] = pos[0] + value;
      }
    }
    if (isArrayLike(this.location[3])) {
      // y좌표
      if ((this.location[3].length == 2, this.location[3][0] < 0)) {
        const value = randomNumberInRange(
          this.location[3][0],
          this.location[3][1]
        ); // 값 선택
        pos[3] = pos[1] + value;
      }
    }

    // 속도 연산
    let speeds = this.speed;
    if (isArrayLike(speeds)) {
      let x = selectArrayValue(speeds[0] || 1);
      let y = selectArrayValue(speeds[1] || 1);
      speeds = [x, y];
    } else {
      // 정수일경우
      speeds = [speeds, speeds];
    }

    const location = { x: [], y: [] };
    // 위치 미리 연산
    speeds.forEach((o, i) => {
      const loc = [Math.min(pos[i], pos[i + 2]), Math.max(pos[i], pos[i + 2])];
      if (!o) return; // 움직임 없음
      let postion = o > 0 ? loc[0] : loc[1];
      const target = o > 0 ? loc[1] : loc[0]; // 목표
      const lo = i % 2 ? "y" : "x";

      //   console.log(postion, target, pos, loc, lo);
      do {
        location[lo].push(postion);
        postion += o;
      } while (postion < target);
      if (pos[i] > pos[i + 2]) location[lo] = location[lo].reverse();
    });

    const delay = Math.floor(selectArrayValue(this.delay));

    const frameSize = Math.max(location.x.length, location.y.length); // 최대 프레임 크기
    const frameSleep =
      frameSize / Math.min(location.x.length, location.y.length); // 건너뛰어야 하는 시간
    const style = {
      "font-size": selectArrayValue(this.size, 0), // 폰트크기
      init: pos, // 초기값
      left: pos[0],
      top: pos[1],
      speed: speeds, // 프레임당 속도
      location,
      delay, // 시작전 딜레이
      frame: 0, // 프레임
      frameSize,
      frameSleep,
      frameTarget: location.x.length == frameSize ? "x" : "y",
      frameNTarget: location.x.length == frameSize ? "y" : "x",
    };

    const attribute = Object.keys(style)
      .filter(
        (o) => this.default_style.includes(o) || exception_style.includes(o)
      )
      .map((o) => `${o}:${style[o]}`)
      .join(";");
    obj.setAttribute("style", attribute);

    const element = { element: obj, style };
    const index = this.elements.push(element);

    return { element, index };
  };

  Effect.prototype.move = function () {
    this.elements.forEach((o) => {
      const { element, style } = o;
      const { delay, location, frameSize, frameTarget, frameNTarget } = style;
      let frame = style.frame;

      style.frame += 1; // 프레임카운트 증가
      if (delay > frame) {
        return;
      }

      frame = frame - delay;

      if (frameSize <= frame) {
        style.frame = 0;
      } else {
        // 프레임이 진행중
        style[frameTarget === "x" ? "left" : "top"] =
          location[frameTarget][frame];
        // 매인프레임
        const index = Math.floor(frame / style.frameSleep);
        style[frameNTarget === "x" ? "left" : "top"] =
          location[frameNTarget][index];
        // 보조 프레임
      }
      const attribute = Object.keys(style)
        .filter(
          (o) => this.default_style.includes(o) || exception_style.includes(o)
        )
        .map((o) => `${o}:${style[o]}`)
        .join(";");
      element.setAttribute("style", attribute);
    });
  };

  /**
   * 애니메이션 조작부분
   */
  Effect.prototype.loop = function () {
    requestAnimationFrame(this.loop.bind(this));
    this.move();
    // if (this.isPlaying) {
    // }
  };

  Effect.prototype.start = function () {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.loop();
    }
    return this;
  };

  return function (cfg) {
    const effect = new Effect(cfg || {});
    return init.call(effect).start();
  };
})();
