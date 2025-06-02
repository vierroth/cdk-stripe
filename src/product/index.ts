import { Construct } from "constructs";
import { CustomResource, Names } from "aws-cdk-lib";

import { StripeProps } from "../stripe-props";
import { Provider } from "./provider";

export interface ProductProps extends StripeProps {
	/**
	 * The product’s name, meant to be displayable to the customer.
	 * @default generated name
	 */
	readonly name?: string;
	/**
	 * Whether the product is currently available for purchase.
	 * @default true
	 */
	readonly active?: boolean;
}

/**
 * @category Constructs
 */
export class Product extends CustomResource {
	public readonly productName;
	public readonly productId = this.getAttString("productId");

	constructor(scope: Construct, id: string, props: ProductProps) {
		const generatedName = `${Names.uniqueResourceName(scope, {
			maxLength: 80 - id.length,
			allowedSpecialCharacters: "-",
			separator: "-",
		})}-${id}`;

		super(scope, id, {
			resourceType: "Custom::StripeFeature",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				name: props.name || generatedName,
				active: props.active || true,
			},
		});

		this.productName = props.name || generatedName;
	}
}
