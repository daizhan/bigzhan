module.exports = {
    apps : [{
        name: 'bigzhan',
        script: './server/bin/www',
        env: {
            'NODE_ENV': 'production',
            'PORT': 3000
        },
        env_production : {
            'NODE_ENV': 'production',
            'PORT': 3000
        },
        env_development: {
            'NODE_ENV': 'development',
            'PORT': 3000
        },
        env_test: {
            'NODE_ENV': 'test',
            'PORT': 3000
        }
    }]
}; 
