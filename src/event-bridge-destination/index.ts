import { Construct } from "constructs";
import { CustomResource, Names, Stack } from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";

import { StripeProps } from "../stripe-props";
import { Provider } from "./provider";

export interface EventBridgeDestinationProps extends StripeProps {
	/**
	 * The destination`s name.
	 * @default generated name
	 */
	readonly name?: string;
	/**
	 * An optional description of what the event destination is used for.
	 * @default no description
	 */
	readonly description?: string;
	/**
	 * The list of events to enable for this endpoint.
	 */
	readonly enabledEvents: (
		| "account.application.authorized"
		| "account.application.deauthorized"
		| "account.external_account.created"
		| "account.external_account.deleted"
		| "account.external_account.updated"
		| "account.updated"
		| "application_fee.created"
		| "application_fee.refund.updated"
		| "application_fee.refunded"
		| "balance.available"
		| "billing_portal.configuration.created"
		| "billing_portal.configuration.updated"
		| "billing_portal.session.created"
		| "billing.alert.triggered"
		| "billing.credit_balance_transaction.created"
		| "billing.credit_grant.created"
		| "billing.credit_grant.updated"
		| "billing.meter.created"
		| "billing.meter.deactivated"
		| "billing.meter.reactivated"
		| "billing.meter.updated"
		| "capability.updated"
		| "cash_balance.funds_available"
		| "charge.captured"
		| "charge.dispute.closed"
		| "charge.dispute.created"
		| "charge.dispute.funds_reinstated"
		| "charge.dispute.funds_withdrawn"
		| "charge.dispute.updated"
		| "charge.expired"
		| "charge.failed"
		| "charge.pending"
		| "charge.refund.updated"
		| "charge.refunded"
		| "charge.succeeded"
		| "charge.updated"
		| "checkout.session.async_payment_failed"
		| "checkout.session.async_payment_succeeded"
		| "checkout.session.completed"
		| "checkout.session.expired"
		| "climate.order.canceled"
		| "climate.order.created"
		| "climate.order.delayed"
		| "climate.order.delivered"
		| "climate.order.product_substituted"
		| "climate.product.created"
		| "climate.product.pricing_updated"
		| "coupon.created"
		| "coupon.deleted"
		| "coupon.updated"
		| "credit_note.created"
		| "credit_note.updated"
		| "credit_note.voided"
		| "customer_cash_balance_transaction.created"
		| "customer.created"
		| "customer.deleted"
		| "customer.discount.created"
		| "customer.discount.deleted"
		| "customer.discount.updated"
		| "customer.source.created"
		| "customer.source.deleted"
		| "customer.source.expiring"
		| "customer.source.updated"
		| "customer.subscription.created"
		| "customer.subscription.deleted"
		| "customer.subscription.paused"
		| "customer.subscription.pending_update_applied"
		| "customer.subscription.pending_update_expired"
		| "customer.subscription.resumed"
		| "customer.subscription.trial_will_end"
		| "customer.subscription.updated"
		| "customer.tax_id.created"
		| "customer.tax_id.deleted"
		| "customer.tax_id.updated"
		| "customer.updated"
		| "entitlements.active_entitlement_summary.updated"
		| "file.created"
		| "financial_connections.account.created"
		| "financial_connections.account.deactivated"
		| "financial_connections.account.disconnected"
		| "financial_connections.account.reactivated"
		| "financial_connections.account.refreshed_balance"
		| "financial_connections.account.refreshed_ownership"
		| "financial_connections.account.refreshed_transactions"
		| "identity.verification_session.canceled"
		| "identity.verification_session.created"
		| "identity.verification_session.processing"
		| "identity.verification_session.redacted"
		| "identity.verification_session.requires_input"
		| "identity.verification_session.verified"
		| "invoice_payment.paid"
		| "invoice.created"
		| "invoice.deleted"
		| "invoice.finalization_failed"
		| "invoice.finalized"
		| "invoice.marked_uncollectible"
		| "invoice.overdue"
		| "invoice.overpaid"
		| "invoice.paid"
		| "invoice.payment_action_required"
		| "invoice.payment_failed"
		| "invoice.payment_succeeded"
		| "invoice.sent"
		| "invoice.upcoming"
		| "invoice.updated"
		| "invoice.voided"
		| "invoice.will_be_due"
		| "invoiceitem.created"
		| "invoiceitem.deleted"
		| "issuing_authorization.created"
		| "issuing_authorization.request"
		| "issuing_authorization.updated"
		| "issuing_card.created"
		| "issuing_card.updated"
		| "issuing_cardholder.created"
		| "issuing_cardholder.updated"
		| "issuing_dispute.closed"
		| "issuing_dispute.created"
		| "issuing_dispute.funds_reinstated"
		| "issuing_dispute.funds_rescinded"
		| "issuing_dispute.submitted"
		| "issuing_dispute.updated"
		| "issuing_personalization_design.activated"
		| "issuing_personalization_design.deactivated"
		| "issuing_personalization_design.rejected"
		| "issuing_personalization_design.updated"
		| "issuing_token.created"
		| "issuing_token.updated"
		| "issuing_transaction.created"
		| "issuing_transaction.purchase_details_receipt_updated"
		| "issuing_transaction.updated"
		| "mandate.updated"
		| "payment_intent.amount_capturable_updated"
		| "payment_intent.canceled"
		| "payment_intent.created"
		| "payment_intent.partially_funded"
		| "payment_intent.payment_failed"
		| "payment_intent.processing"
		| "payment_intent.requires_action"
		| "payment_intent.succeeded"
		| "payment_link.created"
		| "payment_link.updated"
		| "payment_method.attached"
		| "payment_method.automatically_updated"
		| "payment_method.detached"
		| "payment_method.updated"
		| "payout.canceled"
		| "payout.created"
		| "payout.failed"
		| "payout.paid"
		| "payout.reconciliation_completed"
		| "payout.updated"
		| "person.created"
		| "person.deleted"
		| "person.updated"
		| "plan.created"
		| "plan.deleted"
		| "plan.updated"
		| "price.created"
		| "price.deleted"
		| "price.updated"
		| "product.created"
		| "product.deleted"
		| "product.updated"
		| "promotion_code.created"
		| "promotion_code.updated"
		| "quote.accepted"
		| "quote.canceled"
		| "quote.created"
		| "quote.finalized"
		| "quote.will_expire"
		| "radar.early_fraud_warning.created"
		| "radar.early_fraud_warning.updated"
		| "refund.created"
		| "refund.failed"
		| "refund.updated"
		| "reporting.report_run.failed"
		| "reporting.report_run.succeeded"
		| "reporting.report_type.updated"
		| "review.closed"
		| "review.opened"
		| "setup_intent.canceled"
		| "setup_intent.created"
		| "setup_intent.requires_action"
		| "setup_intent.setup_failed"
		| "setup_intent.succeeded"
		| "sigma.scheduled_query_run.created"
		| "source.canceled"
		| "source.chargeable"
		| "source.failed"
		| "source.mandate_notification"
		| "source.refund_attributes_required"
		| "source.transaction.created"
		| "source.transaction.updated"
		| "subscription_schedule.aborted"
		| "subscription_schedule.canceled"
		| "subscription_schedule.completed"
		| "subscription_schedule.created"
		| "subscription_schedule.expiring"
		| "subscription_schedule.released"
		| "subscription_schedule.updated"
		| "tax_rate.created"
		| "tax_rate.updated"
		| "tax.settings.updated"
		| "terminal.reader.action_failed"
		| "terminal.reader.action_succeeded"
		| "test_helpers.test_clock.advancing"
		| "test_helpers.test_clock.created"
		| "test_helpers.test_clock.deleted"
		| "test_helpers.test_clock.internal_failure"
		| "test_helpers.test_clock.ready"
		| "topup.canceled"
		| "topup.created"
		| "topup.failed"
		| "topup.reversed"
		| "topup.succeeded"
		| "transfer.created"
		| "transfer.reversed"
		| "transfer.updated"
		| "data.object is a transfer"
	)[];
}

/**
 * @category Constructs
 */
export class EventBridgeDestination extends CustomResource {
	public readonly eventBus;
	public readonly eventBridgeDestinationName = this.getAttString(
		"eventBridgeDestinationName",
	);
	public readonly eventSourceName = this.getAttString("eventSourceName");

	constructor(
		scope: Construct,
		id: string,
		props: EventBridgeDestinationProps,
	) {
		const generatedName = `${Names.uniqueResourceName(scope, {
			maxLength: 80 - id.length,
			allowedSpecialCharacters: "-",
			separator: "-",
		})}-${id}`;

		super(scope, id, {
			resourceType: "Custom::StripeEventBridgeDestination",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				name: props.name || generatedName,
				description: props.description || "",
				enabledEvents: props.enabledEvents,
				accountId: Stack.of(scope).account,
				region: Stack.of(scope).region,
			},
		});

		this.eventBus = new EventBus(this, "EventBus", {
			eventSourceName: this.getAttString("eventSourceName"),
		});
	}
}
