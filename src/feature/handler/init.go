package main

import (
	"context"
	"log"
	"log/slog"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

var (
	Logger         *slog.Logger
	SecretsManager *secretsmanager.Client
)

func init() {
	Logger = slog.New(slog.NewJSONHandler(os.Stdout, nil))

	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(os.Getenv("AWS_REGION")))
	if err != nil {
		Logger.Error("Unable to configure aws services", slog.Any("error", err))
		log.Fatal()
	}

	SecretsManager = secretsmanager.NewFromConfig(cfg)
}
