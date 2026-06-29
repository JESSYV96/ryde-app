import { Money } from './Money';
import { descriptionFor, type PaymentKind } from './PaymentKind';

// Optional push metadata. When present it travels through the Stripe session
// metadata so the stateless webhook can notify the company's device on payment.
export interface PushIntent {
  expoPushToken: string;
  title?: string;
  body?: string;
}

export interface PaymentLinkRequestProps {
  rentalId: string;
  kind: PaymentKind;
  money: Money;
  customerEmail: string;
  customerName: string;
  vehicleLabel: string;
  push?: PushIntent;
}

// A request to charge a customer for a rental. Encapsulates the money, the
// customer contact and the (optional) push intent that should fire on payment.
export class PaymentLinkRequest {
  readonly rentalId: string;
  readonly kind: PaymentKind;
  readonly money: Money;
  readonly customerEmail: string;
  readonly customerName: string;
  readonly vehicleLabel: string;
  readonly push?: PushIntent;

  constructor(props: PaymentLinkRequestProps) {
    if (!props.rentalId) {
      throw new Error('rentalId is required');
    }
    if (!props.customerEmail) {
      throw new Error('customerEmail is required');
    }
    this.rentalId = props.rentalId;
    this.kind = props.kind;
    this.money = props.money;
    this.customerEmail = props.customerEmail;
    this.customerName = props.customerName;
    this.vehicleLabel = props.vehicleLabel;
    this.push = props.push;
  }

  description(): string {
    return descriptionFor(this.kind, this.vehicleLabel);
  }
}
