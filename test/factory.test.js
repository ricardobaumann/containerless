"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_typescript_1 = require("mocha-typescript");
const chai_1 = require("chai");
const factory_1 = require("../factory");
describe('', () => {
    let FactoryTest = class FactoryTest {
        constructor() {
            this.tag = 'tag-123abc';
            this.opts = {
                repository: 'blah/vtha',
                service: 'blah-vtha-dev',
                cluster: {
                    id: 'arn:aws:ecs:ap-southeast-2:005213230316:cluster/vtha-ECSCluster-1A5ZYNUN7X46N',
                    security_group: 'sg-abcdef',
                    vpcId: 'vpc-1',
                    subnets: [
                        'subnet-12359e64',
                        'subnet-b442c0d0',
                        'subnet-a2b967fb'
                    ],
                },
                applications: {
                    'app-1': {
                        url: '/',
                        port: 1111
                    }
                }
            };
        }
        before() {
            this.resources = factory_1.prepare(this.tag, this.opts);
        }
        has_resources() {
            chai_1.expect(this.resources).to.have.any;
            chai_1.expect(this.resources).to.have.length(3);
        }
        has_service() {
            let service = this.resources[0];
            chai_1.expect(service).to.have.property('name');
            chai_1.expect(service).to.have.property('port');
            chai_1.expect(service).to.have.property('url');
        }
        service_name() {
            let service = this.resources[0];
            chai_1.expect(service.name).to.eq('BlahVthaDevApp1');
        }
        has_cluster() {
            let cluster = this.resources[1];
            chai_1.expect(cluster).to.have.property('id');
            chai_1.expect(cluster).to.have.property('vpcId');
            chai_1.expect(cluster).to.have.property('subnets');
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], FactoryTest.prototype, "has_resources", null);
    __decorate([
        mocha_typescript_1.test
    ], FactoryTest.prototype, "has_service", null);
    __decorate([
        mocha_typescript_1.test
    ], FactoryTest.prototype, "service_name", null);
    __decorate([
        mocha_typescript_1.test
    ], FactoryTest.prototype, "has_cluster", null);
    FactoryTest = __decorate([
        mocha_typescript_1.suite
    ], FactoryTest);
});
