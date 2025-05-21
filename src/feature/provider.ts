import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { Provider as AwsProvider } from "aws-cdk-lib/custom-resources";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { join } from "path";

import { LambdaBase, LambdaRole } from "../lambda-base";

export class Provider extends AwsProvider {
	constructor(scope: Construct, id: string) {
		super(scope, id, {
			onEventHandler: new LambdaBase(scope, `${id}Handler`, {
				entry: join(__dirname, "./handler").replace("/dist/", "/src/"),
			}),
			role: new LambdaRole(scope, `${id}HandlerRole`),
		});
	}
	static getOrCreate(scope: Construct, apiSecret: ISecret) {
		const stack = Stack.of(scope);
		const id = "_StripeFeatureProvider";
		const provider =
			(stack.node.tryFindChild(id) as Provider) || new Provider(stack, id);

		apiSecret.grantRead(provider.onEventHandler);

		return provider.serviceToken;
	}
}
