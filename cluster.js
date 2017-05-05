"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class Cluster {
    constructor(opts) {
        // http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI_launch_latest.html
        this.amiIds = {
            'us-east-1': 'ami-275ffe31',
            'us-east-2': 'ami-62745007',
            'us-west-1': 'ami-689bc208',
            'us-west-2': 'ami-62d35c02',
            'eu-west-1': 'ami-95f8d2f3',
            'eu-west-2': 'ami-bf9481db',
            'eu-central-1': 'ami-085e8a67',
            'ap-northeast-1': 'ami-f63f6f91',
            'ap-southeast-1': 'ami-b4ae1dd7',
            'ap-southeast-2': 'ami-fbe9eb98',
            'ca-central-1': 'ami-ee58e58a'
        };
        if (opts.id) {
            this._id = opts.id;
            this._securityGroup = opts.security_group || this.requireSecurityGroup();
        }
        else {
            this.capacity = opts.capacity || 1;
            this.instance_type = opts.instance_type || 't2.micro';
            this.key_name = opts.key_name || 'ecs-instance';
            this.region = opts.region || 'ap-southeast-2';
            this.size = opts.size || 1;
            this.max_size = opts.max_size || this.size + 1;
            this.min_size = opts.min_size || 1;
            this.max_memory_threshold = opts.max_memory_threshold || 80;
        }
        // we always need a vpc and at least one subnet
        this.vpcId = opts.vpcId || this.requireVpcId();
        this.subnets = opts.subnets || this.requireSubnets();
        this.protocol = _.castArray(opts.protocol) || ['HTTP'];
        this.certificate = opts.certificate;
        if (!this.certificate && _.includes(this.protocol, 'HTTPS')) {
            this.requireCertificate();
        }
    }
    requireVpcId() {
        throw new TypeError('Cluster requires a VPC Id');
    }
    requireCertificate() {
        throw new TypeError('Cluster requires a Certificate ARN for HTTPS');
    }
    requireSubnets() {
        throw new TypeError('Cluster requires at least one Subnet Id');
    }
    requireSecurityGroup() {
        throw new TypeError('Cluster requires a Security Group for mapping the Load Balancer');
    }
    ami() {
        return this.amiIds[this.region];
    }
    get name() {
        return 'Cluster';
    }
    get id() {
        if (this._id) {
            return this._id;
        }
        else {
            return { 'Ref': 'ContainerlessCluster' };
        }
    }
    get securityGroup() {
        if (this._securityGroup) {
            return this._securityGroup;
        }
        else {
            return { 'Ref': 'ContainerlessSecurityGroup' };
        }
    }
    get elbRole() {
        return { 'Ref': 'ContainerlessELBRole' };
    }
    generate() {
        if (this._id)
            return {};
        return {
            'ContainerlessInstanceProfile': {
                'Type': 'AWS::IAM::InstanceProfile',
                'Properties': {
                    'Path': '/',
                    'Roles': [
                        { 'Ref': 'ContainerlessInstanceRole' }
                    ]
                }
            },
            'ContainerlessCluster': {
                'Type': 'AWS::ECS::Cluster',
                'DependsOn': 'ContainerlessELBRole'
            },
            'ContainerlessLaunchConfiguration': {
                'Type': 'AWS::AutoScaling::LaunchConfiguration',
                'DependsOn': ['ContainerlessInstanceProfile', 'ContainerlessSecurityGroup'],
                'Properties': {
                    'AssociatePublicIpAddress': true,
                    'IamInstanceProfile': {
                        'Ref': 'ContainerlessInstanceProfile'
                    },
                    'ImageId': this.ami(),
                    'InstanceType': this.instance_type,
                    'KeyName': this.key_name,
                    'SecurityGroups': [
                        {
                            'Ref': 'ContainerlessSecurityGroup'
                        }
                    ],
                    'UserData': {
                        'Fn::Base64': {
                            'Fn::Sub': '#!/bin/bash -xe\nyum install -y aws-cfn-bootstrap\necho ECS_CLUSTER=${ContainerlessCluster} >> /etc/ecs/ecs.config\n\n# /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --region ${AWS::Region}\n\n/opt/aws/bin/cfn-signal -e 0 --stack ${AWS::StackName} --resource ContainerlessAutoScalingGroup --region ${AWS::Region}\n'
                        }
                    }
                }
            },
            'ContainerlessInstanceRole': {
                'Type': 'AWS::IAM::Role',
                'Properties': {
                    'AssumeRolePolicyDocument': {
                        'Statement': [
                            {
                                'Action': [
                                    'sts:AssumeRole'
                                ],
                                'Effect': 'Allow',
                                'Principal': {
                                    'Service': [
                                        'ec2.amazonaws.com'
                                    ]
                                }
                            }
                        ]
                    },
                    'Path': '/',
                    'Policies': [
                        {
                            'PolicyDocument': {
                                'Statement': [
                                    {
                                        'Action': [
                                            'ecs:CreateCluster',
                                            'ecs:DeregisterContainerInstance',
                                            'ecs:DiscoverPollEndpoint',
                                            'ecs:Poll',
                                            'ecs:RegisterContainerInstance',
                                            'ecs:StartTelemetrySession',
                                            'ecs:Submit*',
                                            'ecr:BatchCheckLayerAvailability',
                                            'ecr:BatchGetImage',
                                            'ecr:GetDownloadUrlForLayer',
                                            'ecr:GetAuthorizationToken',
                                            'logs:CreateLogStream',
                                            'logs:PutLogEvents'
                                        ],
                                        'Effect': 'Allow',
                                        'Resource': '*'
                                    }
                                ]
                            },
                            'PolicyName': 'ecs-service-instance'
                        }
                    ]
                },
            },
            'ContainerlessSecurityGroup': {
                'Properties': {
                    'GroupDescription': 'ECS Public Security Group',
                    'VpcId': this.vpcId
                },
                'Type': 'AWS::EC2::SecurityGroup'
            },
            'ContainerlessSecurityGroupDynamicPorts': {
                'Type': 'AWS::EC2::SecurityGroupIngress',
                'Properties': {
                    'IpProtocol': 'tcp',
                    'FromPort': 31000,
                    'ToPort': 61000,
                    'GroupId': {
                        'Ref': 'ContainerlessSecurityGroup'
                    },
                    'SourceSecurityGroupId': {
                        'Ref': 'ContainerlessSecurityGroup'
                    }
                }
            },
            'ContainerlessSecurityGroupHTTP': {
                'Type': 'AWS::EC2::SecurityGroupIngress',
                'Properties': {
                    'CidrIp': '0.0.0.0/0',
                    'IpProtocol': 'tcp',
                    'FromPort': '80',
                    'ToPort': '80',
                    'GroupId': {
                        'Ref': 'ContainerlessSecurityGroup'
                    }
                },
            },
            'ContainerlessSecurityGroupHTTPS': {
                'Type': 'AWS::EC2::SecurityGroupIngress',
                'Properties': {
                    'CidrIp': '0.0.0.0/0',
                    'IpProtocol': 'tcp',
                    'FromPort': '443',
                    'ToPort': '443',
                    'GroupId': {
                        'Ref': 'ContainerlessSecurityGroup'
                    }
                }
            },
            'ContainerlessELBRole': {
                'Type': 'AWS::IAM::Role',
                'Properties': {
                    'AssumeRolePolicyDocument': {
                        'Statement': [
                            {
                                'Effect': 'Allow',
                                'Principal': {
                                    'Service': [
                                        'ecs.amazonaws.com'
                                    ]
                                },
                                'Action': [
                                    'sts:AssumeRole'
                                ]
                            }
                        ]
                    },
                    'Path': '/',
                    'Policies': [
                        {
                            'PolicyName': 'elb-role-policy',
                            'PolicyDocument': {
                                'Statement': [
                                    {
                                        'Effect': 'Allow',
                                        'Resource': '*',
                                        'Action': [
                                            'elasticloadbalancing:DeregisterInstancesFromLoadBalancer',
                                            'elasticloadbalancing:DeregisterTargets',
                                            'elasticloadbalancing:Describe*',
                                            'elasticloadbalancing:RegisterInstancesWithLoadBalancer',
                                            'elasticloadbalancing:RegisterTargets',
                                            'ec2:Describe*',
                                            'ec2:AuthorizeSecurityGroupIngress'
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            'ContainerlessAutoScalingGroup': {
                'Type': 'AWS::AutoScaling::AutoScalingGroup',
                'CreationPolicy': {
                    'ResourceSignal': {
                        'Timeout': 'PT5M'
                    }
                },
                'UpdatePolicy': {
                    'AutoScalingReplacingUpdate': {
                        'WillReplace': 'true'
                    },
                    'AutoScalingRollingUpdate': {
                        'MinInstancesInService': 1,
                        'MaxBatchSize': 1,
                        'PauseTime': 'PT15M',
                        'WaitOnResourceSignals': 'true'
                    }
                },
                'Properties': {
                    'DesiredCapacity': this.capacity,
                    'LaunchConfigurationName': {
                        'Ref': 'ContainerlessLaunchConfiguration'
                    },
                    'MaxSize': this.max_size,
                    'MinSize': this.min_size,
                    'VPCZoneIdentifier': this.subnets
                }
            },
            'MemoryReservationScaleUpPolicy': {
                'Type': 'AWS::AutoScaling::ScalingPolicy',
                'Properties': {
                    'AdjustmentType': 'PercentChangeInCapacity',
                    'AutoScalingGroupName': {
                        'Ref': 'ContainerlessAutoScalingGroup'
                    },
                    'Cooldown': '300',
                    'ScalingAdjustment': '30'
                }
            },
            'MemoryReservationHighAlert': {
                'Type': 'AWS::CloudWatch::Alarm',
                'Properties': {
                    'EvaluationPeriods': '1',
                    'Statistic': 'Maximum',
                    'Threshold': this.max_memory_threshold,
                    'AlarmDescription': 'Alarm if CPU too high or metric disappears indicating instance is down',
                    'Period': '60',
                    'AlarmActions': [
                        { 'Ref': 'MemoryReservationScaleUpPolicy' }
                    ],
                    'Namespace': 'AWS/ECS',
                    'Dimensions': [
                        {
                            'Name': 'ClusterName',
                            'Value': {
                                'Ref': 'ContainerlessCluster'
                            }
                        }
                    ],
                    'ComparisonOperator': 'GreaterThanThreshold',
                    'MetricName': 'MemoryReservation'
                }
            }
        };
    }
}
exports.Cluster = Cluster;
