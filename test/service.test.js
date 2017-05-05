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
const cluster_1 = require("../cluster");
const service_1 = require("../service");
const _ = require("lodash");
describe('with an existing cluster and a load balanced container', () => {
    let ServiceTest = class ServiceTest {
        constructor() {
            this.cluster = {
                id: 'arn:aws:ecs:ap-southeast-2:005213230316:cluster/vtha-ECSCluster-1A5ZYNUN7X46N',
                security_group: 'sg-abcdef',
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
            this.opts = {
                service: 'blah-vtha-dev',
                name: 'app-1',
                repository: 'blah/vtha',
                tag: 'tag-1',
                url: '/',
                port: 1111,
                environment: [
                    { blah: 'vtha' }
                ]
            };
        }
        before() {
            let cluster = new cluster_1.Cluster(this.cluster);
            this.service = new service_1.Service(cluster, this.opts);
            this.resources = this.service.generate();
        }
        service_name() {
            chai_1.expect(this.service.name).to.eql('BlahVthaDevApp1');
        }
        service_resource() {
            let result = _.get(this.resources, 'BlahVthaDevApp1.Type');
            chai_1.expect(result).to.eql('AWS::ECS::Service');
        }
        task_definition_resource_type() {
            let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Type');
            chai_1.expect(result).to.eql('AWS::ECS::TaskDefinition');
        }
        task_definition_resource() {
            let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Name');
            chai_1.expect(result).to.eql('BlahVthaDevApp1');
        }
        environment_variables() {
            let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Environment');
            chai_1.expect(result).to.eql([{ Name: 'blah', Value: 'vtha' }]);
        }
        port_mappings() {
            let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].PortMappings');
            chai_1.expect(result).to.eql([{ 'ContainerPort': 1111 }]);
        }
        service_role() {
            let result = _.get(this.resources, 'BlahVthaDevApp1.Properties.Role.Ref');
            chai_1.expect(result).to.eql('ContainerlessELBRole');
        }
        service_load_balancers() {
            let result = _.get(this.resources, 'BlahVthaDevApp1.Properties.LoadBalancers');
            chai_1.expect(result).to.not.be.empty;
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_name", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_resource", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "task_definition_resource_type", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "task_definition_resource", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "environment_variables", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "port_mappings", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_role", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_load_balancers", null);
    ServiceTest = __decorate([
        mocha_typescript_1.suite
    ], ServiceTest);
});
describe('new cluster and container without load balancer', () => {
    let ServiceTest = class ServiceTest {
        constructor() {
            this.cluster = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
            this.opts = {
                service: 'blah-vtha-dev',
                name: 'app-1',
                repository: 'blah/vtha',
                tag: 'tag-1',
            };
        }
        before() {
            let cluster = new cluster_1.Cluster(this.cluster);
            this.service = new service_1.Service(cluster, this.opts);
            this.resources = this.service.generate();
        }
        service_name() {
            chai_1.expect(this.service.name).to.eql('BlahVthaDevApp1');
        }
        service_load_balancers() {
            let result = _.get(this.resources, 'BlahVthaDevApp1.Properties.LoadBalancers');
            chai_1.expect(result).to.be.empty;
        }
        service_role_undefined() {
            let result = _.get(this.resources, 'BlahVthaDevApp1.Properties.Role');
            chai_1.expect(result).to.be.undefined;
        }
        environment_variables() {
            let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Environment');
            chai_1.expect(result).to.be.empty;
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_name", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_load_balancers", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_role_undefined", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "environment_variables", null);
    ServiceTest = __decorate([
        mocha_typescript_1.suite
    ], ServiceTest);
});
