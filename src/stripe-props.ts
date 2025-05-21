import { ISecret } from "aws-cdk-lib/aws-secretsmanager";

export interface StripeProps {
	/**
	 * This secret is required to allow the construct to create and manage the resource on your behalf,
	 * it should only contain the stipe secret key.
	 */
	readonly apiSecret: ISecret;
}
