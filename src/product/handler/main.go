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
		product, err := Stripe.V1Products.Create(ctx, &stripe.ProductCreateParams{
			Name:   stripe.String(event.ResourceProperties["name"].(string)),
			Active: stripe.Bool(event.ResourceProperties["active"].(bool)),
		})
		if err != nil {
			Logger.Error("Error creating product", slog.Any("error", err))
			return cfn.Response{}, err
		}

		return cfn.Response{
			Status:             "SUCCESS",
			StackID:            event.StackID,
			RequestID:          event.RequestID,
			LogicalResourceID:  event.LogicalResourceID,
			PhysicalResourceID: product.ID,
			Data: map[string]any{
				"featureId":   product.ID,
				"featureName": product.Name,
			},
		}, nil

	case cfn.RequestUpdate:
		product, err := Stripe.V1Products.Update(ctx, event.PhysicalResourceID, &stripe.ProductUpdateParams{
			Name:   stripe.String(event.ResourceProperties["name"].(string)),
			Active: stripe.Bool(event.ResourceProperties["active"].(bool)),
		})
		if err != nil {
			Logger.Error("Error updating product", slog.Any("error", err))
			return cfn.Response{}, err
		}

		return cfn.Response{
			Status:             "SUCCESS",
			StackID:            event.StackID,
			RequestID:          event.RequestID,
			LogicalResourceID:  event.LogicalResourceID,
			PhysicalResourceID: event.PhysicalResourceID,
			Data: map[string]any{
				"featureId":   product.ID,
				"featureName": product.Name,
			},
		}, nil

	case cfn.RequestDelete:
		_, err := Stripe.V1Products.Delete(ctx, event.PhysicalResourceID, &stripe.ProductDeleteParams{})
		if err != nil {
			Logger.Error("Error deleting product", slog.Any("error", err))
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
