import { Construct } from "constructs";
import { Duration, Stack } from "aws-cdk-lib";
import { Architecture } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { GoFunction, GoFunctionProps } from "@aws-cdk/aws-lambda-go-alpha";

export class LambdaBase extends GoFunction {
	constructor(scope: Construct, id: string, props: GoFunctionProps) {
		super(scope, id, {
			architecture: Architecture.ARM_64,
			timeout: Duration.minutes(2),
			logRetention: RetentionDays.ONE_WEEK,
			role: new LambdaRole(scope, `${id}Role`),
			bundling: {
				environment: {
					GOWORK: "off",
				},
			},
			...props,
		});
	}
}

export class LambdaRole extends Role {
	constructor(scope: Construct, id: string) {
		super(scope, id, {
			assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
			inlinePolicies: {
				logging: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: [
								"logs:CreateLogGroup",
								"logs:CreateLogStream",
								"logs:PutLogEvents",
							],
							resources: [
								`arn:aws:logs:${Stack.of(scope).region}:${
									Stack.of(scope).account
								}:log-group:/aws/lambda/*`,
							],
						}),
					],
				}),
			},
		});
	}
}
