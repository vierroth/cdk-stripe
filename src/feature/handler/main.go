package main

import (
	"context"
	"errors"
	"log/slog"

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

	switch event.RequestType {
	case cfn.RequestCreate:
		feature, err := Stripe.V1EntitlementsFeatures.Create(ctx, &stripe.EntitlementsFeatureCreateParams{
			Name:      stripe.String(event.ResourceProperties["name"].(string)),
			LookupKey: stripe.String(event.ResourceProperties["lookupKey"].(string)),
		})
		if err != nil {
			Logger.Error("Error creating feature", slog.Any("error", feature))
			return cfn.Response{}, err
		}

		return cfn.Response{
			PhysicalResourceID: feature.ID,
			Data: map[string]any{
				"featureName": feature.Name,
			},
		}, nil

	case cfn.RequestUpdate:
		feature, err := Stripe.V1EntitlementsFeatures.Update(ctx, event.PhysicalResourceID, &stripe.EntitlementsFeatureUpdateParams{
			Name: stripe.String(event.ResourceProperties["name"].(string)),
		})
		if err != nil {
			Logger.Error("Error creating feature", slog.Any("error", feature))
			return cfn.Response{}, err
		}

		return cfn.Response{
			PhysicalResourceID: event.PhysicalResourceID,
			Data: map[string]any{
				"featureName": feature.Name,
			},
		}, nil

	case cfn.RequestDelete:
		feature, err := Stripe.V1EntitlementsFeatures.Update(ctx, event.PhysicalResourceID, &stripe.EntitlementsFeatureUpdateParams{
			Active: stripe.Bool(false),
		})
		if err != nil {
			Logger.Error("Error creating feature", slog.Any("error", feature))
			return cfn.Response{}, err
		}

		return cfn.Response{
			PhysicalResourceID: event.PhysicalResourceID,
		}, nil

	default:
		return cfn.Response{}, errors.New("Invalid reqeust type")
	}
}

func main() {
	lambda.Start(handleRequest)
}
