import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

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
  premio_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug, nombre, telefono, dni, correo, premio_id }: RegistroClienteRequest = await req.json();

    console.log('Registro cliente request:', { slug, nombre, telefono, premio_id });

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
        estado: 'activo',
        premio_id: premio_id || null
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

    // Get premio details if premio_id was provided
    let premioInfo = '';
    if (premio_id) {
      const { data: premio } = await supabaseAdmin
        .from('premios')
        .select('descripcion, detalle_premio')
        .eq('id', premio_id)
        .single();
      
      if (premio) {
        premioInfo = `
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="color: #2e7d32; margin-top: 0;">🎁 ¡Has elegido un premio increíble!</h3>
            <p style="color: #333; font-size: 16px; margin: 10px 0;">
              <strong>${premio.descripcion}</strong>
            </p>
            ${premio.detalle_premio ? `<p style="color: #666; font-size: 14px; margin: 5px 0;">${premio.detalle_premio}</p>` : ''}
            <p style="color: #555; font-size: 14px; margin-top: 10px;">
              ¡Comparte tu código para alcanzar este premio más rápido!
            </p>
          </div>
        `;
      }
    }

    // Send email with Resend
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');

      if (resendApiKey && correo) {
        const resend = new Resend(resendApiKey);

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "RedFreska <onboarding@resend.dev>",
          to: [correo],
          subject: `¡Bienvenido a ${restaurante.nombre}! 🎉`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
              <h1 style="color: #333; margin-bottom: 10px;">¡Hola ${nombre}!</h1>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Bienvenido a <strong>${restaurante.nombre}</strong>. ¡Estamos felices de tenerte con nosotros!
              </p>
              
              ${premioInfo}
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #333; font-size: 14px; margin-bottom: 10px;">Tu código de referido es:</p>
                <p style="color: #000; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">${codigoReferido}</p>
              </div>
              
              <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h3 style="color: #e65100; margin-top: 0;">💪 ¡Comparte y gana!</h3>
                <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 10px 0;">
                  Cada vez que un amigo use tu código de referido y consuma en nuestro restaurante, 
                  <strong>¡estarás más cerca de ganar increíbles premios!</strong>
                </p>
                <ul style="color: #666; font-size: 15px; line-height: 1.8; margin: 15px 0;">
                  <li>Comparte tu código con amigos y familiares</li>
                  <li>Ellos disfrutan en ${restaurante.nombre}</li>
                  <li>Tú acumulas conversiones y ganas premios</li>
                </ul>
                <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 15px 0;">
                  <strong style="color: #e65100;">¿Qué esperas?</strong> Entre más compartas, más rápido alcanzarás tus premios.
                </p>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin-top: 30px;">
                ¡Gracias por unirte a nuestra comunidad!
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 20px;">
                El equipo de ${restaurante.nombre}
              </p>
            </div>
          `,
        });

        if (emailError) {
          console.error('Resend error:', emailError);
        } else {
          console.log('Email sent successfully:', emailData);
        }
      } else {
        console.warn('Resend API key not configured or email not provided, skipping email');
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails
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
