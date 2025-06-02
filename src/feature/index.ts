import { Construct } from "constructs";
import { CustomResource, Names } from "aws-cdk-lib";

import { StripeProps } from "../stripe-props";
import { Provider } from "./provider";

export interface FeatureProps extends StripeProps {
	/**
	 * The feature’s name, for your own purpose, not meant to be displayable to the customer.
	 * @default generated name
	 */
	readonly name?: string;
	/**
	 * A unique key you provide as your own system identifier. This may be up to 80 characters.
	 * @default generated lookup key
	 */
	readonly lookupKey?: string;
}

/**
 * @category Constructs
 */
export class Feature extends CustomResource {
	public readonly featureName;
	public readonly featureLookupKey;

	constructor(scope: Construct, id: string, props: FeatureProps) {
		const generatedLookupKey = `${Names.uniqueResourceName(scope, {
			maxLength: 80 - id.length,
			allowedSpecialCharacters: "-",
			separator: "-",
		})}-${id}`;

		super(scope, id, {
			resourceType: "Custom::StripeFeature",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				name: props.name || generatedLookupKey,
				lookupKey: props.lookupKey || generatedLookupKey,
			},
		});

		this.featureName = props.name || generatedLookupKey;
		this.featureLookupKey = props.lookupKey || generatedLookupKey;
	}
}
