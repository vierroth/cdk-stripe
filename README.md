This collection of [CDK](https://docs.aws.amazon.com/cdk/api/v2/) constructs allows you to manage your [Stripe](https://stripe.com) resources programmatically, enabling tighter integration with [CDK](https://docs.aws.amazon.com/cdk/api/v2/) and giving you all the benefits of infrastructure as code together with [Stripe](https://stripe.com) large feature set.

The constructs provided by this library work in the same way any native AWS CDK constructs do, and expose all of the parameters that the [Stripe API](https://docs.stripe.com/api) exposes.

## Usage

### Installation

The package is available on [NPM](https://www.npmjs.com/package/@flit/cdk-stripe) and can be installed using your package manager of choice:

```bash
npm i @flit/cdk-stripe
```

```bash
pnpm add @flit/cdk-stripe
```

```bash
yarn add @flit/cdk-stripe
```

### Setup

To get started you will have to get your [stripe secret key](https://docs.stripe.com/keys), then go into the [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) and create a new secret containing the [stripe secret key](https://docs.stripe.com/keys):

All constructs will require this secret to be passed as `apiSecret` parameter.

### Example

You can now use the Stripe constructs as you would any native [AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/) application.
