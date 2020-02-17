'use strict';

const { getContentType: getContentTypeFastify, getSummary: getSummaryFastify } = require('@promster/fastify');
const { getContentType: getContentTypeExpress, getSummary: getSummaryExpress } = require('@promster/express');
const { getContentType: getContentTypeHapi, getSummary: getSummaryHapi } = require('@promster/hapi');
const { getContentType: getContentTypeMarblejs, getSummary: getSummaryMarblejs } = require('@promster/marblejs');

const plugin = require('./plugin');
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
class Helper {
    static getSummary() {
        switch (plugin.name) {
            case 'fastify':
                return getSummaryFastify;
            case 'express':
                return getSummaryExpress;
            case 'hapi':
                return getSummaryHapi;
            case 'marblejs':
                return getSummaryMarblejs;
            default:
                return getSummaryExpress;
        }
    }

    static getContentType() {
        switch (plugin.name) {
            case 'fastify':
                return getContentTypeFastify;
            case 'express':
                return getContentTypeExpress;
            case 'hapi':
                return getContentTypeHapi;
            case 'marblejs':
                return getContentTypeMarblejs;
            default:
                return getContentTypeExpress;
        }
    }
}

module.exports = Helper;
