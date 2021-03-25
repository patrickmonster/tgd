(function (factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function () {
  "use strict";

  /**
   * The code was extracted from:
   * https://github.com/davidchambers/Base64.js
   */

  var chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  function InvalidCharacterError(message) {
    this.message = message;
  }

  InvalidCharacterError.prototype = new Error();
  InvalidCharacterError.prototype.name = "InvalidCharacterError";

  function polyfill(input) {
    var str = String(input).replace(/=+$/, "");
    if (str.length % 4 == 1) {
      throw new InvalidCharacterError(
        "'atob' failed: The string to be decoded is not correctly encoded."
      );
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = "";
      // get next character
      (buffer = str.charAt(idx++));
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer &&
      ((bs = bc % 4 ? bs * 64 + buffer : buffer),
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  }

  var atob =
    typeof window !== "undefined" && window.atob && window.atob.bind(window);
  //  || polyfill;
  var btoa =
    typeof window !== "undefined" && window.btoa && window.btoa.bind(window);

  function b64DecodeUnicode(str) {
    return decodeURIComponent(
      atob(str).replace(/(.)/g, function (m, p) {
        var code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
          code = "0" + code;
        }
        return "%" + code;
      })
    );
  }

  function b64EncodeUnicode(str) {
    return btoa(
      str.replace(/(.)/g, function (m, p) {
        var code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length <= 2) return p;
        else {
          code = encodeURIComponent(p);
          const out = [];
          for (let i = 0; i < code.length; i += 3) {
            out.push(unescape(`${code.substr(i, 3)}`));
          }
          return out.join("");
        }
      })
    );
  }

  function base64_url_decode(str) {
    var output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw "Illegal base64url string!";
    }

    try {
      return b64DecodeUnicode(output);
    } catch (err) {
      console.log(err);
      return atob(output);
    }
  }

  function base64_url_encode(str) {
    return b64EncodeUnicode(str).replaceAll("=", "");
  }

  function InvalidTokenError(message) {
    this.message = message;
  }

  InvalidTokenError.prototype = new Error();
  InvalidTokenError.prototype.name = "InvalidTokenError";

  function jwtDecode(token, options) {
    if (typeof token !== "string") {
      throw new InvalidTokenError("Invalid token specified");
    }

    options = options || {};
    var pos = options.header === true ? 0 : 1;
    try {
      const str = base64_url_decode(token.split(".")[pos]);
      console.log(str);
      return JSON.parse(str);
    } catch (e) {
      throw new InvalidTokenError("Invalid token specified: " + e.message);
    }
  }

  function jwtEncode(obj, options) {
    if (typeof obj !== "object") {
      throw new InvalidTokenError("Invalid token specified");
    }

    options = options || {};
    const defaultHeader = { alg: "HS256", typ: "JWT" };
    try {
      const header = base64_url_encode(
        JSON.stringify(options.header || defaultHeader)
      );
      const token = base64_url_encode(JSON.stringify(obj)); // 토큰
      const secret = base64_url_encode(options.secret || "secret"); // 서명
      if (options.header === false) return `${header}.${token}.${secret}`;
      else return `${token}.${secret}`; // 토큰발급
    } catch (e) {
      throw new InvalidTokenError("Invalid token specified: " + e.message);
    }
  }

  /*
   * Expose the function on the window object
   */

  //use amd or just through the window object.
  if (window) {
    if (typeof window.define == "function" && window.define.amd) {
      window.define("jwt_decode", function () {
        return jwtDecode;
      });
    } else if (window) {
      window.jwt_decode = jwtDecode;
    }

    if (typeof window.define == "function" && window.define.amd) {
      window.define("jwt_encode", function () {
        return jwtEncode;
      });
    } else if (window) {
      window.jwt_encode = jwtEncode;
    }
  }
});
//# sourceMappingURL=jwt-decode.js.map
