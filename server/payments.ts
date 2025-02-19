import crypto from "crypto";

type PaymentType = "template" | "subscription";

interface PaymentDetails {
  type: PaymentType;
  amount: number;
  templateId?: string;
}

// PhonePe integration configuration
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const PHONEPE_API_KEY = process.env.PHONEPE_API_KEY!;
const PHONEPE_API_URL = process.env.NODE_ENV === "production" 
  ? "https://api.phonepe.com/apis/hermes/pg/v1"
  : "https://api-preprod.phonepe.com/apis/hermes/pg/v1";

// Helper function to generate unique transaction IDs
function generateTransactionId() {
  return `TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// Helper function to generate PhonePe checksum
function generateChecksum(payload: string, salt: string) {
  const data = payload + "/pg/v1/pay" + salt;
  return crypto.createHash('sha256').update(data).digest('hex') + "###1";
}

export async function initiatePhonePePayment(userId: number, details: PaymentDetails) {
  try {
    const transactionId = generateTransactionId();
    const callbackUrl = `${process.env.APP_URL}/api/payments/callback`;

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: userId.toString(),
      amount: details.amount * 100, // Convert to paise
      redirectUrl: callbackUrl,
      redirectMode: "POST",
      callbackUrl: callbackUrl,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = generateChecksum(base64Payload, PHONEPE_API_KEY);

    const response = await fetch(`${PHONEPE_API_URL}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({
        request: base64Payload
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store payment details for verification during callback
      // TODO: Implement payment tracking in storage
      return {
        success: true,
        paymentUrl: data.data.instrumentResponse.redirectInfo.url,
        transactionId
      };
    } else {
      throw new Error(data.message || 'Payment initiation failed');
    }
  } catch (error) {
    console.error('PhonePe payment initiation error:', error);
    throw new Error('Failed to initiate payment');
  }
}

export async function verifyPhonePePayment(transactionId: string, merchantId: string) {
  try {
    const checksum = generateChecksum(merchantId, PHONEPE_API_KEY);
    
    const response = await fetch(
      `${PHONEPE_API_URL}/status/${merchantId}/${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': merchantId
        }
      }
    );

    const data = await response.json();

    if (data.success && data.code === 'PAYMENT_SUCCESS') {
      return {
        success: true,
        transactionId: data.data.merchantTransactionId,
        amount: data.data.amount / 100, // Convert from paise to rupees
        paymentId: data.data.transactionId
      };
    }

    return {
      success: false,
      message: data.message || 'Payment verification failed'
    };
  } catch (error) {
    console.error('PhonePe payment verification error:', error);
    throw new Error('Failed to verify payment');
  }
}
