'use strict';

const Effect = function Effect(option) {
    this.target;
    this.option = {
        minSize: 10,
        maxSize: 50,
        _document: document,
        documentWidth: () => {
            return document.documentElement.clientWidth
        },
        documentHeight: () => {
            return document.documentElement.clientHeight
        },
        target: "body",
        text: '&#10052',
        rotate: 0, // 회전
        color: "#fff",
        time: 300,
        anitime: 1000,
        glitter: false,
        move_direction: "left",
        move: 200, //흔들림 방향
        delay: 10000,
        speed: 10,
        easing: "linear",
        count: 10,
    };
    this.list = [];
    this.run = false;
    this.style = { position: "absolute" }; // 프라이빗 설정


    function init() {
        console.log(this);

        const uuid = `effect-${this.uuid()}`;// 아이디 생성
        this._uuid = uuid;

        const opt = this.option;
        console.log(opt);

        this.rootObject = opt._document.createElement("div");//루트
        opt._document.getElementById(opt.target);

        this.rootObject.classList.add(uuid);

        console.log(`Create new Effect ${uuid}`);

        console.log(opt._document.head);

        this.rootStyle = opt._document.createElement("style");//루트 스타일
        opt._document.head.appendChild(this.rootStyle);
        this.styleUpdate();// 스타일 업데이트

        for (let i = 0; i < opt.count; i++) {
            this.flake();
        }
    }

    Object.assign(this.option, option); // 병합
    init.call(this);
    return this;
}

/**
 * 고유아이디 생성 uuid
 * @returns 
 */
Effect.prototype.uuid = function () {
    const e = () => ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    return `${e()}-${e()}${e()}${e()}`;
}

Effect.prototype.styleUpdate = function () {
    const default_style = Object.keys(document.body.style);
    const style_key = Object.keys(this.option).filter(o => default_style.includes(o));

    style_key.forEach(o => {
        this.style[o] = this.option[o];
    });// 스타일 맵핑

    const style = Object.keys(this.style).map(o => `${o}:${this.style[o]}`).join(";");
    this.rootStyle.innerHTML = `.${this._uuid}.flake{${style}}`;
}

Effect.prototype.css = function (tag, value) {
    if (arguments.length == 1) {
        return this.style[tag];
    }

    this.style[tag] = value;
    this.styleUpdate();
    return this;
}

/**
 * 
 * @returns 
 */
Effect.prototype.data = function () {
    const a = arguments, b = a.length;
    if (!(b - 1)) return this
        .rootObject
        .getAttribute("data-" + a[0]);
    else this
        .rootObject
        .setAttribute("data-" + a[0], a[1]);
    return this;
};

/**
 * 엘리먼트 생성
 */
Effect.prototype.flake = function () {
    const opt = this.option;
    const obj = opt._document.createElement("div");

    this.rootObject.appendChild(obj);
    obj.classList.add(this._uuid);
    obj.classList.add("flake");
    obj.innerHTML = opt.text;

    // ("font-size", opt.minSize + Math.random() * opt.maxSize)
    const style = {
        "font-size": opt.minSize + Math.random() * opt.maxSize,
    };



    const element = { element: obj, style };
    const index = this.list.push(element);

    return { element, index };
}

Effect.prototype.move = function () {
    const opt = this.option;

    this.list.forEach(o => {
        const { element, obj } = o;

    });
}

/**
 * 애니메이션 조작부분
 */
Effect.prototype.loop = function () {


    if (this.run) {
        requestAnimationFrame(this.loop);
    }
}