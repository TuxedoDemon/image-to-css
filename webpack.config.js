import path from "path";

export default {
    entry: {
        "main": './src/main.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve('./javascript/'),
        clean: true,
    },
    mode: 'production',
};
