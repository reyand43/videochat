class Pipeline {
    constructor() {
        this.pipeline = null;
    }
    setPipeline(newPipeline) {
        this.pipeline = newPipeline
        return this.pipeline
    }
    getPipeline() {
        return this.pipeline
    }
}

module.exports = Pipeline;