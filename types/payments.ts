import { Relationship, Counterparty, WireCounterparty } from "./common"

export type PaymentStatus = "Pending" | "PendingReview" | "Rejected" | "Clearing" | "Sent" | "Canceled" | "Returned"

export type Payment = AchPayment | BookPayment | WirePayment | BillPayment

interface BasePaymentAttributes {
    /**
     * Date only. The date the resource was created.
     * RFC3339 format. For more information: https://en.wikipedia.org/wiki/ISO_8601#RFCs
     */
    createdAt: string

    /**
     * One of Pending, Rejected, Clearing, Sent, Canceled, Returned. See [ACH Status](https://developers.unit.co/#ach-status).
     */
    status: PaymentStatus

    /**
     * (Optional) More information about the status.
     */
    reason?: string

    /**
     * The direction in which the funds flow (either Debit or Credit).
     */
    direction: "Credit" | "Debit"

    /**
     * Payment description (maximum of 10 characters), also known as Company Entry Description, this will show up on statement of the counterparty.
     */
    description: string

    /**
     * The amount (cents) of the payment.
     */
    amount: number

    /**
     * See [Tags](https://developers.unit.co/#tags).
     */
    tags?: object
}

interface BasePaymentRelationships {
    /**
     * The Deposit Account of the customer.
     */
    account: Relationship

    /**
     * The Customer the deposit account belongs to. This relationship is only available if the account belongs to a single customer, business or individual.
     */
    customer?: Relationship

    /**
     * The list of Customers the deposit account belongs to. This relationship is only available if the account belongs to a multiple individual customers.
     */
    customers?: Relationship[]

    /**
     * The Book Transaction generated by this payment.
     */
    transaction?: Relationship
}

export interface AchPayment {
    /**
     * Identifier of the ACH payment resource.
     */
    id: string

    /**
     * Type of the payment resource. For originations the value is achPayment.
     */
    type: "achPayment"

    /**
     * JSON object representing the payment resource.
     */
    attributes: {

        /**
         * The party on the other side of the ACH payment.
         */
        counterparty: Counterparty

        /**
         * Optional, additional payment description (maximum of 50 characters), not all institutions present that.
         */
        addenda?: string

        /**
         * RFC3339 format. For more information: https://en.wikipedia.org/wiki/ISO_8601#RFCs
         * Optional, For Clearing, shows the date on which the payment will be settled.
         */
        settlementDate?: string
    } & BasePaymentAttributes

    /**
     * Describes relationships between the ACH payment and the originating deposit account and customer.
     */
    relationships: {
        /**
         * The Counterparty the payment to be made to.
         */
        counterparty: Relationship
    } & BasePaymentRelationships
}

export interface BookPayment {
    /**
     * 	Identifier of the book payment resource.
     */
    id: string

    /**
     * Type of the payment resource. The value is always bookPayment.
     */
    type: "bookPayment"

    /**
     * JSON object representing the payment resource.
     */
    attributes: BasePaymentAttributes

    /**
     * Describes relationships between the Book payment and the originating deposit account and customer.
     */
    relationships: {
        /**
         * The Counterparty account the payment to be made to.
         */
        counterpartyAccount: Relationship

        /**
         * The Customer the counterparty account belongs to. The customer is either a business or an individual, might be empty if there is more than one associated customer.
         */
        counterpartyCustomer: Relationship
    } & BasePaymentRelationships
}

export interface WirePayment {
    /**
     * Identifier of the Wire payment resource.
     */
    id: string

    /**
     * Type of the payment resource. For originations the value is wirePayment.
     */
    type: "wirePayment"

    /**
     * JSON object representing the payment resource.
     */
    attributes: {

        /**
         * The party on the other side of the Wire payment.
         */
        counterparty: WireCounterparty

    } & BasePaymentAttributes

    /**
     * Describes relationships between the Wire payment and the originating deposit account and customer.
     */
    relationships: BasePaymentRelationships
}

export interface BillPayment {
    /**
     * Identifier of the bill payment resource.
     */
    id: string

    /**
     * Type of the payment resource. The value is always billPayment.
     */
    type: "billPayment"

    /**
     * JSON object representing the payment resource.
     */
    attributes: Pick<BasePaymentAttributes, "createdAt" | "status" | "direction" | "description" | "amount" | "tags">

    /**
     * Describes relationships between the Wire payment and the originating deposit account and customer.
     */
    relationships: BasePaymentRelationships
}

export interface AchReceivedPayment {
    /**
     * Identifier of the received payment resource.
     */
    id: string

    /**
     * Type of the transaction resource. The value is always achReceivedPayment.
     */
    type: "achReceivedPayment"

    /**
     * 
     */
    attributes: {
        /**
         * The status of the Received Payment.
         * One of Pending, Advanced, Completed or Returned, see (ReceivedPayment Statuses)[https://docs.unit.co/received-ach/#statuses].
         * Common to all received payment types.
         */
        status: "Pending" | "Advanced" | "Completed" | "Returned"

        /**
         * Will be true if the received payment was or is being Advanced (has or has had the status Advanced).
         *  Common to all received payment types.
         */
        wasAdvanced: boolean

        /**
         * Shows the date on which the received ACH will be completed(settled or repaid).
         */
        completionDate: string

        /**
         * The reason if the received payment is Returned. See ACH return reasons.
         */
        returnReason?: string

        /**
         * Optional. Additional transaction description (maximum of 50 characters).
         */
        addenda?: string

        /**
         * The name by which the originator is known to the receiver.
         */
        companyName: string

        /**
         * The routing number of the party that originated the received ACH payment.
         */
        counterpartyRoutingNumber: string

        /**
         * The ACH Trace Number.
         */
        traceNumber: string

        /**
         * Optional. The 3-letter ACH Standard Entry Class (SEC) Code (e.g. WEB, CCD, PPD, etc.).
         */
        secCode?: string

    } & Pick<BasePaymentAttributes, "createdAt" | "amount" | "description" | "tags">


    /**
     * Describes relationships between the transaction resource and other resources (account, customer related transactions).
     */
    relationships: {
        /**
         * The transaction of the received payment, created due to advance or when the ACH is processed.
         */
        receivePaymentTransaction?: Relationship

        /**
         * The transaction that funded the Advance from the provisional credit operating account, if the received payment was advanced.
         */
        paymentAdvanceTransaction?: Relationship

        /**
         * The transaction that repaid the advance once the received payment is completed.
         */
        repayPaymentAdvanceTransaction?: Relationship
    } & Pick<BasePaymentRelationships, "account" | "customer">
}

export interface PatchPaymentRequest {
    type: "achPayment" | "bookPayment" | "achReceivedPayment"
    attributes: {
        tags: object
    }
}

export type CreatePaymentRequest = CreateWirePaymentRequest | CreateBookPaymentRequest | CreateInlinePaymentRequest | CreateLinkedPaymentRequest | CreateVerifiedPaymentRequest

export interface CreateWirePaymentRequest {
    type: "wirePayment"

    attributes: {
        /**
         * The amount (in cents).
         */
        amount: number

        /**
         * Payment description (maximum of 50 characters), this will show up on statement of the counterparty.
         */
        description: string

        /**
         * The party on the other side of the Wire payment.
         */
        counterparty: WireCounterparty

        /**
         * See Idempotency.
         */
        idempotencyKey?: string

        /**
         * See [Tags](https://developers.unit.co/#tags). Tags that will be copied to any transaction that this payment creates (see [Tag Inheritance](https://developers.unit.co/#tag-inheritance)).
         */
        tags?: object
    }

    relationships: {
        /**
         * The Deposit Account originating the payment.
         */
        account: Relationship
    }
}

export interface CreateBookPaymentRequest {
    type: "bookPayment"

    attributes: {
        /**
         * The amount (in cents).
         */
        amount: number

        /**
         * Debit or Credit
         */
        direction?: "Debit" | "Credit"

        /**
         * Payment description (maximum of 50 characters), this will show up on statement of the counterparty.
         */
        description: string

        /**
         * See Idempotency.
         */
        idempotencyKey?: string

        /**
         * See [Tags](https://developers.unit.co/#tags). Tags that will be copied to any transaction that this payment creates (see [Tag Inheritance](https://developers.unit.co/#tag-inheritance)).
         */
        tags?: object
    }

    relationships: {
        /**
         * The Deposit Account originating the payment.
         */
        account: Relationship

        /**
         * The Counterparty account the payment to be made to
         */
        counterpartyAccount: Relationship
    }
}

export interface CreateInlinePaymentRequest {
    type: "achPayment"

    attributes: {
        /**
         * The amount (in cents).
         */
        amount: number

        /**
         * The direction in which the funds flow.
         */
        direction: "Credit" | "Debit"

        /**
         * The party on the other side of the ACH payment.
         */
        counterparty: Counterparty

        /**
         * Payment description (maximum of 10 characters), also known as Company Entry Description, this will show up on statement of the counterparty.
         */
        description: string

        /**
         * Optional, additional payment description (maximum of 50 characters), not all institutions present that.
         */
        addenda?: string

        /**
         * See Idempotency.
         */
        idempotencyKey?: string

        /**
         * Optional, default is false. Verify the counterparty balance, if balance verification fails the payment will be rejected with reason set to CounterpartyInsufficientFunds
         */
        verifyCounterpartyBalance?: boolean

        /**
         * See [Tags](https://developers.unit.co/#tags). Tags that will be copied to any transaction that this payment creates (see [Tag Inheritance](https://developers.unit.co/#tag-inheritance)).
         */
        tags?: object
    }

    relationships: {
        /**
         * The Deposit Account originating the payment.
         */
        account: Relationship
    }

}

export interface CreateLinkedPaymentRequest {
    type: "achPayment"

    attributes: {
        /**
        * The amount (in cents).
        */
        amount: number

        /**
         * The direction in which the funds flow.
         */
        direction: "Credit" | "Debit"

        /**
        * Payment description (maximum of 10 characters), also known as Company Entry Description, this will show up on statement of the counterparty.
        */
        description: string

        /**
         * Optional, additional payment description (maximum of 50 characters), not all institutions present that.
         */
        addenda?: string

        /**
         * See Idempotency.
         */
        idempotencyKey?: string

        /**
         * Optional, default is false. Verify the counterparty balance, if balance verification fails the payment will be rejected with reason set to CounterpartyInsufficientFunds
         */
        verifyCounterpartyBalance?: boolean

        /**
         * See [Tags](https://developers.unit.co/#tags). Tags that will be copied to any transaction that this payment creates (see [Tag Inheritance](https://developers.unit.co/#tag-inheritance)).
         */
        tags?: object
    }

    relationships: {
        /**
         * The Deposit Account originating the payment.
         */
        account: Relationship

        /**
         * The Counterparty the payment to be made to.
         */
        counterparty: Relationship
    }
}

export interface CreateVerifiedPaymentRequest {
    type: "achPayment"

    attributes: {
        /**
         * The amount (in cents).
         */
        amount: number

        /**
         * The direction in which the funds flow.
         */
        direction: "Credit" | "Debit"

        /**
        * Payment description (maximum of 10 characters), also known as Company Entry Description, this will show up on statement of the counterparty.
        */
        description: string

        /**
         * See Idempotency.
         */
        idempotencyKey?: string

        /**
         * Name of the person or company that owns the counterparty bank account.
         */
        counterpartyName?: string

        /**
         * Optional, default is false. Verify the counterparty balance, if balance verification fails the payment will be rejected with reason set to CounterpartyInsufficientFunds
         */
        verifyCounterpartyBalance?: boolean

        /**
         * See [Create Plaid processor token API](https://plaid.com/docs/api/processors/).
         */
        plaidProcessorToken: string
    }

    relationships: {
        /**
         * The Deposit Account originating the payment.
         */
        account: Relationship
    }
}
