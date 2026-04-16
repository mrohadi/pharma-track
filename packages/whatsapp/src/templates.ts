/**
 * Template registry — central place to define the template names and
 * parameter shapes we use. Keeps the adapter call sites typesafe.
 *
 * Template names must match what's registered in Meta Business Manager.
 * The mock adapter doesn't validate names, but production will 400 if
 * the name is unknown or the param count mismatches.
 */

export const TEMPLATES = {
  /**
   * Address collection — sent to a patient after their order is created.
   * Body params:
   *   {{1}} = patient first name
   *   {{2}} = pharmacy name
   * Button URL suffix: the token for /address/[token]
   */
  ADDRESS_COLLECTION: 'address_collection_v1',

  /**
   * Address reminder — 15 min after first message if no response.
   * Same params as ADDRESS_COLLECTION.
   */
  ADDRESS_REMINDER: 'address_reminder_v1',

  /**
   * Delivery OTP — sent before delivery so patient can confirm identity.
   * Body params:
   *   {{1}} = patient first name
   *   {{2}} = 6-digit OTP
   */
  DELIVERY_OTP: 'delivery_otp_v1',
} as const;

export type TemplateName = (typeof TEMPLATES)[keyof typeof TEMPLATES];
