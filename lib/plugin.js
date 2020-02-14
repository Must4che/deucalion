'use strict';

const { plugin: fastify } = require('@promster/fastify');
const { createMiddleware: express } = require('@promster/express');
const { createPlugin: hapi } = require('@promster/hapi');
const util = require('./util');

const plugins = {
    fastify: {
        name: 'fastify',
        create: () => fastify
    },
    express: {
        name: 'express',
        create: () => express
    },
    hapi: {
        name: 'hapi',
        create: () => hapi
    }
};
const { fastify: fastifyPlugin, express: expressPlugin, hapi: hapiPlugin } = plugins;

const setDefault = (self) => {
    util.removeAttributes(self);
    util.applySettings(self, fastifyPlugin);
};
/*
  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
 | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
 | |     ______   | || |   _____      | || |      __      | || |    _______   | || |    _______   | |
 | |   .' ___  |  | || |  |_   _|     | || |     /  \     | || |   /  ___  |  | || |   /  ___  |  | |
 | |  / .'   \_|  | || |    | |       | || |    / /\ \    | || |  |  (__ \_|  | || |  |  (__ \_|  | |
 | |  | |         | || |    | |   _   | || |   / ____ \   | || |   '.___`-.   | || |   '.___`-.   | |
 | |  \ `.___.'\  | || |   _| |__/ |  | || | _/ /    \ \_ | || |  |`\____) |  | || |  |`\____) |  | |
 | |   `._____.'  | || |  |________|  | || ||____|  |____|| || |  |_______.'  | || |  |_______.'  | |
 | |              | || |              | || |              | || |              | || |              | |
 | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
*/
class Plugin {
    constructor() {
        setDefault(this);
    }

    setup(name = '') {
        switch (name) {
            case 'express':
                util.applySettings(this, expressPlugin);
                break;
            case 'hapi':
                util.applySettings(this, hapiPlugin);
                break;
            default:
                util.applySettings(this, fastifyPlugin);
        }
    }
}

module.exports = new Plugin();
