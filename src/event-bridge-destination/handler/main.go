package main

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/aws/aws-lambda-go/cfn"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
	"github.com/stripe/stripe-go/v82"
)

func handleRequest(ctx context.Context, event cfn.Event) (cfn.Response, error) {
	secretNameValue, err := SecretsManager.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{SecretId: aws.String(event.ResourceProperties["secretName"].(string))})
	if err != nil {
		Logger.Error("Error getting stripe secret key from secret manager", slog.Any("error", err))
		return cfn.Response{}, err
	}

	Stripe := stripe.NewClient(*secretNameValue.SecretString)

	enabledEvents := make([]*string, len(event.ResourceProperties["enabledEvents"].([]any)))
	for i, event := range event.ResourceProperties["enabledEvents"].([]any) {
		enabledEvents[i] = stripe.String(event.(string))
	}

	switch event.RequestType {
	case cfn.RequestCreate:
		destination, err := Stripe.V2CoreEventDestinations.Create(ctx, &stripe.V2CoreEventDestinationCreateParams{
			Type:         stripe.String("amazon_eventbridge"),
			EventPayload: stripe.String("snapshot"),

			Name:          stripe.String(event.ResourceProperties["name"].(string)),
			Description:   stripe.String(event.ResourceProperties["description"].(string)),
			EnabledEvents: enabledEvents,
			AmazonEventbridge: &stripe.V2CoreEventDestinationCreateAmazonEventbridgeParams{
				AwsAccountID: stripe.String(event.ResourceProperties["accountId"].(string)),
				AwsRegion:    stripe.String(event.ResourceProperties["region"].(string)),
			},
		})
		if err != nil {
			Logger.Error("Error creating event destination", slog.Any("error", err))
			return cfn.Response{}, err
		}

		_, eventSourceName, _ := strings.Cut(destination.AmazonEventbridge.AwsEventSourceArn, "/")

		return cfn.Response{
			Status:             "SUCCESS",
			StackID:            event.StackID,
			RequestID:          event.RequestID,
			LogicalResourceID:  event.LogicalResourceID,
			PhysicalResourceID: destination.ID,
			Data: map[string]any{
				"eventBridgeDestinationName": destination.Name,
				"eventSourceName":            eventSourceName,
			},
		}, nil

	case cfn.RequestUpdate:
		if event.ResourceProperties["accountId"].(string) != event.OldResourceProperties["accountId"].(string) ||
			event.ResourceProperties["region"].(string) != event.OldResourceProperties["region"].(string) {
			Logger.Error("Event bus cant be changed after destination creation", slog.Any("error", err))
			return cfn.Response{}, errors.New("Event bus cant be changed after destination creation")
		}

		destination, err := Stripe.V2CoreEventDestinations.Update(ctx, event.PhysicalResourceID, &stripe.V2CoreEventDestinationUpdateParams{
			Name:          stripe.String(event.ResourceProperties["name"].(string)),
			Description:   stripe.String(event.ResourceProperties["description"].(string)),
			EnabledEvents: enabledEvents,
		})
		if err != nil {
			Logger.Error("Error updating event destination", slog.Any("error", err))
			return cfn.Response{}, err
		}

		return cfn.Response{
			Status:             "SUCCESS",
			StackID:            event.StackID,
			RequestID:          event.RequestID,
			LogicalResourceID:  event.LogicalResourceID,
			PhysicalResourceID: event.PhysicalResourceID,
			Data: map[string]any{
				"eventBridgeDestinationName": destination.Name,
			},
		}, nil

	case cfn.RequestDelete:
		_, err := Stripe.V2CoreEventDestinations.Delete(ctx, event.PhysicalResourceID, &stripe.V2CoreEventDestinationDeleteParams{})
		if err != nil {
			Logger.Error("Error deleting event destination", slog.Any("error", err))
			return cfn.Response{}, err
		}

		return cfn.Response{
			Status:             "SUCCESS",
			StackID:            event.StackID,
			RequestID:          event.RequestID,
			LogicalResourceID:  event.LogicalResourceID,
			PhysicalResourceID: event.PhysicalResourceID,
		}, nil

	default:
		return cfn.Response{}, errors.New("Invalid reqeust type")
	}
}

func main() {
	lambda.Start(handleRequest)
}
