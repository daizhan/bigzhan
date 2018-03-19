module.exports = {
    apps : [{
        name: 'bigzhan',
        script: './server/bin/www',
        env: {
            'NODE_ENV': 'production',
            'NODE_PORT': '3000'
        },
        env_production : {
            'NODE_ENV': 'production',
            'NODE_PORT': '3000'
        },
        env_development: {
            'NODE_ENV': 'development',
            'NODE_PORT': '3000'
        },
        env_test: {
            'NODE_ENV': 'test',
            'NODE_PORT': '3000'
        }
    }]
}; 