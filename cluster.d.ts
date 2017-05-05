import { Resource } from './resource';
export declare class Cluster implements Resource {
    amiIds: any;
    subnets: string;
    vpcId: string;
    certificate: string;
    protocol: Array<string>;
    private _id;
    private _securityGroup;
    private capacity;
    private instance_type;
    private key_name;
    private max_size;
    private min_size;
    private region;
    private size;
    private max_memory_threshold;
    constructor(opts: any);
    requireVpcId(): void;
    requireCertificate(): void;
    requireSubnets(): void;
    requireSecurityGroup(): void;
    ami(): any;
    readonly name: string;
    readonly id: string | {
        'Ref': string;
    };
    readonly securityGroup: string | {
        'Ref': string;
    };
    readonly elbRole: {
        'Ref': string;
    };
    generate(): {} | {
        'ContainerlessInstanceProfile': {
            'Type': string;
            'Properties': {
                'Path': string;
                'Roles': {
                    'Ref': string;
                }[];
            };
        };
        'ContainerlessCluster': {
            'Type': string;
            'DependsOn': string;
        };
        'ContainerlessLaunchConfiguration': {
            'Type': string;
            'DependsOn': string[];
            'Properties': {
                'AssociatePublicIpAddress': boolean;
                'IamInstanceProfile': {
                    'Ref': string;
                };
                'ImageId': any;
                'InstanceType': string;
                'KeyName': string;
                'SecurityGroups': {
                    'Ref': string;
                }[];
                'UserData': {
                    'Fn::Base64': {
                        'Fn::Sub': string;
                    };
                };
            };
        };
        'ContainerlessInstanceRole': {
            'Type': string;
            'Properties': {
                'AssumeRolePolicyDocument': {
                    'Statement': {
                        'Action': string[];
                        'Effect': string;
                        'Principal': {
                            'Service': string[];
                        };
                    }[];
                };
                'Path': string;
                'Policies': {
                    'PolicyDocument': {
                        'Statement': {
                            'Action': string[];
                            'Effect': string;
                            'Resource': string;
                        }[];
                    };
                    'PolicyName': string;
                }[];
            };
        };
        'ContainerlessSecurityGroup': {
            'Properties': {
                'GroupDescription': string;
                'VpcId': string;
            };
            'Type': string;
        };
        'ContainerlessSecurityGroupDynamicPorts': {
            'Type': string;
            'Properties': {
                'IpProtocol': string;
                'FromPort': number;
                'ToPort': number;
                'GroupId': {
                    'Ref': string;
                };
                'SourceSecurityGroupId': {
                    'Ref': string;
                };
            };
        };
        'ContainerlessSecurityGroupHTTP': {
            'Type': string;
            'Properties': {
                'CidrIp': string;
                'IpProtocol': string;
                'FromPort': string;
                'ToPort': string;
                'GroupId': {
                    'Ref': string;
                };
            };
        };
        'ContainerlessSecurityGroupHTTPS': {
            'Type': string;
            'Properties': {
                'CidrIp': string;
                'IpProtocol': string;
                'FromPort': string;
                'ToPort': string;
                'GroupId': {
                    'Ref': string;
                };
            };
        };
        'ContainerlessELBRole': {
            'Type': string;
            'Properties': {
                'AssumeRolePolicyDocument': {
                    'Statement': {
                        'Effect': string;
                        'Principal': {
                            'Service': string[];
                        };
                        'Action': string[];
                    }[];
                };
                'Path': string;
                'Policies': {
                    'PolicyName': string;
                    'PolicyDocument': {
                        'Statement': {
                            'Effect': string;
                            'Resource': string;
                            'Action': string[];
                        }[];
                    };
                }[];
            };
        };
        'ContainerlessAutoScalingGroup': {
            'Type': string;
            'CreationPolicy': {
                'ResourceSignal': {
                    'Timeout': string;
                };
            };
            'UpdatePolicy': {
                'AutoScalingReplacingUpdate': {
                    'WillReplace': string;
                };
                'AutoScalingRollingUpdate': {
                    'MinInstancesInService': number;
                    'MaxBatchSize': number;
                    'PauseTime': string;
                    'WaitOnResourceSignals': string;
                };
            };
            'Properties': {
                'DesiredCapacity': number;
                'LaunchConfigurationName': {
                    'Ref': string;
                };
                'MaxSize': number;
                'MinSize': number;
                'VPCZoneIdentifier': string;
            };
        };
        'MemoryReservationScaleUpPolicy': {
            'Type': string;
            'Properties': {
                'AdjustmentType': string;
                'AutoScalingGroupName': {
                    'Ref': string;
                };
                'Cooldown': string;
                'ScalingAdjustment': string;
            };
        };
        'MemoryReservationHighAlert': {
            'Type': string;
            'Properties': {
                'EvaluationPeriods': string;
                'Statistic': string;
                'Threshold': number;
                'AlarmDescription': string;
                'Period': string;
                'AlarmActions': {
                    'Ref': string;
                }[];
                'Namespace': string;
                'Dimensions': {
                    'Name': string;
                    'Value': {
                        'Ref': string;
                    };
                }[];
                'ComparisonOperator': string;
                'MetricName': string;
            };
        };
    };
}
