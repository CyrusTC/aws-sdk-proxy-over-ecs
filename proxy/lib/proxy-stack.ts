import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export class ProxyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, "ProxyVPC", {
      ipAddresses: ec2.IpAddresses.cidr("10.2.0.0/16"),
      maxAzs: 3,
      natGateways: 1,
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, "ProxyCluster", {
      vpc: vpc,
    });

    // Create Fargate Service with NLB
    const squidService = new ecs_patterns.NetworkLoadBalancedFargateService(
      this,
      "SquidProxy",
      {
        cluster: cluster,
        memoryLimitMiB: 512,
        cpu: 256,
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry("ubuntu/squid:latest"),
          containerPort: 3128,
        },
        listenerPort: 3128,
        publicLoadBalancer: true,
        desiredCount: 2,
      }
    );

    // Add security group rule to allow proxy traffic
    squidService.service.connections.allowFromAnyIpv4(
      ec2.Port.tcp(3128),
      "Allow proxy access"
    );

    // Output the NLB DNS name
    new cdk.CfnOutput(this, "ProxyEndpoint", {
      value: squidService.loadBalancer.loadBalancerDnsName,
      description: "Proxy endpoint URL",
    });
  }
}
