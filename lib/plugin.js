'use strict';

const { createMiddleware: express } = require('@promster/express');
const { plugin: fastify } = require('@promster/fastify');
const { createPlugin: hapi } = require('@promster/hapi');
const { createMiddleware: marblejs } = require('@promster/marblejs');
const util = require('./util');

const plugins = {
    express: {
        name: 'express',
        create: () => express
    },
    fastify: {
        name: 'fastify',
        create: () => fastify
    },
    hapi: {
        name: 'hapi',
        create: () => hapi
    },
    marblejs: {
        name: 'marblejs',
        create: () => marblejs
    }
};
const { fastify: fastifyPlugin, express: expressPlugin, hapi: hapiPlugin, marblejs: marblejsPlugin } = plugins;

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
            case 'fastify':
                util.applySettings(this, fastifyPlugin);
                break;
            case 'hapi':
                util.applySettings(this, hapiPlugin);
                break;
            case 'marblejs':
                util.applySettings(this, marblejsPlugin);
                break;
            default:
                util.applySettings(this, expressPlugin);
        }
        return this;
    }
}

module.exports = new Plugin();
