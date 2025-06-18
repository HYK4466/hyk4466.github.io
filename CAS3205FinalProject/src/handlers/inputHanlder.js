export class InputHandler{

    /**
     * @type {Object.<string, boolean>}
     * @description 키 입력 상태를 저장하는 객체
     * @default {}
     * @private
     */
    #keys = {};

    constructor() {
        // 키 입력 이벤트 리스너 등록
        window.addEventListener('keydown', e => {
            this.#keys[e.code] = true;
        });

        window.addEventListener('keyup', e => {
            this.#keys[e.code] = false;
        });
    }

    /**
     * @param {string} keyCode - 키 코드
     * @returns {Object.<string, boolean>}
     * @description 현재 키 입력 상태를 반환
     */
    getKeyState(keyCode) {
        return this.#keys[keyCode];
    }

    getKeysState() {
        return this.#keys;
    }
}