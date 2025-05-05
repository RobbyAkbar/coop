import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface NotificationPayload {
  customerName: string;
  amount: number;
  transactionId: string;
  paymentMethod: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { customerName, amount, transactionId, paymentMethod } = await req.json() as NotificationPayload;

    // Format the message
    const message = `*New Payment Received*\n\n` +
      `Customer: ${customerName}\n` +
      `Amount: Rp ${amount.toLocaleString()}\n` +
      `Transaction ID: ${transactionId}\n` +
      `Date: ${new Date().toLocaleString('id-ID')}\n` +
      `Payment Method: ${paymentMethod}`;

    // Send WhatsApp message using WhatsApp Business API
    const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: '62089666549850', // Format number to WhatsApp format
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});