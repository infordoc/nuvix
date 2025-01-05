import { Exclude, Expose } from "class-transformer";
import { Document } from "mongoose";
import BaseModel, { BaseListModel } from "src/core/models/base.model";


@Exclude()
export class PaymentMethodModel extends BaseModel {
  /**
   * Payment method ID from the payment provider
   */
  @Expose() providerMethodId: string;
  /**
   * Client secret hash for payment setup
   */
  @Expose() clientSecret: string;
  /**
   * User ID from the payment provider.
   */
  @Expose() providerUserId: string;
  /**
   * ID of the Team.
   */
  @Expose() userId: string;
  /**
   * Expiry month of the payment method.
   */
  @Expose() expiryMonth: number;
  /**
   * Expiry year of the payment method.
   */
  @Expose() expiryYear: number;
  /**
   * Last 4 digit of the payment method
   */
  @Expose() last4: string;
  /**
   * Payment method brand
   */
  @Expose() brand: string;
  /**
   * Name of the owner
   */
  @Expose() name: string;
  /**
   * Mandate ID of the payment method
   */
  @Expose() mandateId: string;
  /**
   * Country of the payment method
   */
  @Expose() country: string;
  /**
   * Last payment error associated with the payment method.
   */
  @Expose() lastError: string;
  /**
   * True when it&#039;s the default payment method.
   */
  @Expose() default: boolean;
  /**
   * True when payment method has expired.
   */
  @Expose() expired: boolean;
  /**
   * True when payment method has failed to process multiple times.
   */
  @Expose() failed: boolean;

  constructor(data: Partial<PaymentMethodModel | Document>) {
    super(data);
  }
}


export class PaymentMethodListModel extends BaseListModel {

  paymentMethods: PaymentMethodModel[];

  constructor(data: Partial<PaymentMethodListModel | { paymentMethods: Document[] } | any>) {
    super();
    this.paymentMethods = (data.paymentMethods || []).map((paymentMethod) => new PaymentMethodModel(paymentMethod));
    this.total = data.total || this.paymentMethods.length;
  }
}