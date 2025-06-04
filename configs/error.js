class LFException {
    constructor(status) {
        this.status = status
        this.name = status.name

        let err = {}
        Error.captureStackTrace(err)
        this.stack = err.stack
    }

    getResult() {
        return {
            code: 402 /* LOGIC_FAILED 공유 번호 */,
            error_id: this.status.id,
            message: this.status.message,
        }
    }
}

module.exports = LFException