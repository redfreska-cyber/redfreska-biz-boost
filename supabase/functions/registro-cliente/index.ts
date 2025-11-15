import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegistroClienteRequest {
  slug: string;
  nombre: string;
  telefono: string;
  dni?: string;
  correo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug, nombre, telefono, dni, correo }: RegistroClienteRequest = await req.json();

    console.log('Registro cliente request:', { slug, nombre, telefono });

    // Validate inputs
    if (!slug || !nombre || !telefono) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos: slug, nombre y teléfono son obligatorios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get restaurante by slug
    const { data: restaurante, error: restauranteError } = await supabaseAdmin
      .from('restaurantes')
      .select('id, nombre')
      .eq('slug', slug)
      .maybeSingle();

    if (restauranteError) {
      console.error('Error fetching restaurante:', restauranteError);
      return new Response(
        JSON.stringify({ error: 'Error al buscar el restaurante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!restaurante) {
      return new Response(
        JSON.stringify({ error: 'Restaurante no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique referral code
    const codigoReferido = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Insert new cliente
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .insert({
        restaurante_id: restaurante.id,
        nombre,
        telefono,
        correo: correo || null,
        codigo_referido: codigoReferido,
        estado: 'activo'
      })
      .select()
      .single();

    if (clienteError) {
      console.error('Error creating cliente:', clienteError);
      return new Response(
        JSON.stringify({ error: 'Error al registrar cliente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Cliente created successfully:', cliente.id);

    // Send WhatsApp message
    try {
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

      if (twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber) {
        const mensaje = `¡Hola ${nombre}! 🎉\n\nBienvenido a ${restaurante.nombre}.\n\nTu código de referido es: *${codigoReferido}*\n\nComparte este código con tus amigos y gana premios increíbles cuando consuman en nuestro restaurante.\n\n¡Gracias por unirte!`;

        const whatsappNumber = telefono.startsWith('+') ? telefono : `+51${telefono}`;

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioWhatsAppNumber,
            To: `whatsapp:${whatsappNumber}`,
            Body: mensaje,
          }),
        });

        if (!twilioResponse.ok) {
          const errorText = await twilioResponse.text();
          console.error('Twilio error:', errorText);
        } else {
          console.log('WhatsApp message sent successfully');
        }
      } else {
        console.warn('Twilio credentials not configured, skipping WhatsApp message');
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp:', whatsappError);
      // Don't fail the request if WhatsApp fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
          codigo_referido: cliente.codigo_referido,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in registro-cliente function:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
