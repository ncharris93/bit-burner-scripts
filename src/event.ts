import { NS } from '@ns';

const doc = document;

export const sendKeyboardEvent = async (ns: NS, keyOrCode: string) => {
  let keyCode = 0;
  let key = '';

  if ('string' === typeof keyOrCode && keyOrCode.length > 0) {
    key = keyOrCode.toLowerCase().substr(0, 1);
    keyCode = key.charCodeAt(0);
  } else if ('number' === typeof keyOrCode) {
    keyCode = keyOrCode;
    key = String.fromCharCode(keyCode);
  }

  if (!keyCode || key.length !== 1) {
    return;
  }

  const keyboardEvent = new KeyboardEvent('keydown', {
    key,
    keyCode,
  });

  doc.dispatchEvent(keyboardEvent);
  await ns.sleep(30);
};

export async function click(elem) {
  if (!elem) {
    return;
  }
  const e = elem[Object.keys(elem)[1]];
  const event = e.onClick || e.onMouseDown;
  event &&
    (await event({
      isTrusted: true,
    }));
}

export async function setSelectionValue(elem, newValue) {
  const e = elem[Object.keys(elem)[1]];
  const event = e.onChange;
  event &&
    (await event({
      target: { value: newValue },
    }));
}

/**
 * Wrap all event listeners with a custom function that injects
 * the "isTrusted" flag.
 *
 * This event wrapper crack is lifted from https://pastebin.com/7DuFYDpJ
 */
export function wrapEventListeners() {
  //@ts-expect-error:: adding this
  if (!doc._addEventListener) {
    //@ts-expect-error:: adding this
    doc._addEventListener = doc.addEventListener;

    doc.addEventListener = function (type, callback, options) {
      if ('undefined' === typeof options) {
        options = false;
      }
      let handler = false;

      // For this script, we only want to modify "keydown" events.
      if ('keydown' === type || 'click' === type || 'mousedown' === type || 'focus' === type) {
        handler = function (...args) {
          if (!args[0].isTrusted) {
            const hackedEv = {};

            for (const key in args[0]) {
              if ('isTrusted' === key) {
                hackedEv.isTrusted = true;
              } else if ('function' === typeof args[0][key]) {
                hackedEv[key] = args[0][key].bind(args[0]);
              } else {
                hackedEv[key] = args[0][key];
              }
            }

            args[0] = hackedEv;
          }

          return callback.apply(callback, args);
        };

        for (const prop in callback) {
          if ('function' === typeof callback[prop]) {
            handler[prop] = callback[prop].bind(callback);
          } else {
            handler[prop] = callback[prop];
          }
        }
      }

      if (!this.eventListeners) {
        this.eventListeners = {};
      }
      if (!this.eventListeners[type]) {
        this.eventListeners[type] = [];
      }
      this.eventListeners[type].push({
        listener: callback,
        useCapture: options,
        wrapped: handler,
      });

      return this._addEventListener(type, handler ? handler : callback, options);
    };
  }

  if (!doc._removeEventListener) {
    doc._removeEventListener = doc.removeEventListener;

    doc.removeEventListener = function (type, callback, options) {
      if ('undefined' === typeof options) {
        options = false;
      }

      if (!this.eventListeners) {
        this.eventListeners = {};
      }
      if (!this.eventListeners[type]) {
        this.eventListeners[type] = [];
      }

      for (let i = 0; i < this.eventListeners[type].length; i++) {
        if (this.eventListeners[type][i].listener === callback && this.eventListeners[type][i].useCapture === options) {
          if (this.eventListeners[type][i].wrapped) {
            callback = this.eventListeners[type][i].wrapped;
          }

          this.eventListeners[type].splice(i, 1);
          break;
        }
      }

      if (this.eventListeners[type].length == 0) {
        delete this.eventListeners[type];
      }

      return this._removeEventListener(type, callback, options);
    };
  }
}

/**
 * Revert the "wrapEventListeners" changes.
 */
export function unwrapEventListeners() {
  //@ts-expect-error :: we added this
  if (doc._addEventListener) {
    //@ts-expect-error :: we added this
    doc.addEventListener = doc._addEventListener;
    //@ts-expect-error :: we added this
    delete doc._addEventListener;
  }
  //@ts-expect-error :: we added this
  if (doc._removeEventListener) {
    //@ts-expect-error :: we added this
    doc.removeEventListener = doc._removeEventListener;
    //@ts-expect-error :: we added this
    delete doc._removeEventListener;
  }
  //@ts-expect-error :: we added this
  delete doc.eventListeners;
}

/** @param {NS} ns */
export function killDuplicates(ns: NS) {
  const scriptInfo = ns.getRunningScript();
  if (!scriptInfo) {
    return ns.print('No dupe to kill');
  }
  ns.ps()
    .filter((script) => script.filename === scriptInfo.filename && script.pid !== scriptInfo.pid)
    .forEach((script) => ns.kill(script.pid));
}
