module.exports = {
    extends: ["../.eslintrc.cjs"],
    settings: {
        "import/resolver": {
            typescript: {
                project: "./tsconfig.json",
                alwaysTryTypes: true
            },
            node: {
                extensions: ['.js', '.ts', '.tsx', '.json']
            }
        }
    }
};
