import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type Recipient = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("NOTIFICATION_FROM") || "Sistema de Privilegios <onboarding@resend.dev>";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendKey || !supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Configure RESEND_API_KEY, SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY." }, 500);
    }

    const authorization = request.headers.get("Authorization") || "";
    const token = authorization.replace("Bearer ", "");
    if (!token) {
      return jsonResponse({ error: "Login obrigatorio." }, 401);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const userEmail = userData?.user?.email;

    if (userError || !userEmail) {
      return jsonResponse({ error: "Sessao invalida." }, 401);
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("usuarios_autorizados")
      .select("perfil,ativo")
      .ilike("email", userEmail)
      .maybeSingle();

    if (adminError || !adminUser?.ativo || adminUser.perfil !== "admin") {
      return jsonResponse({ error: "Somente administradores podem enviar notificacoes." }, 403);
    }

    const body = await request.json();
    const monthKey = String(body.monthKey || "");
    const monthLabel = String(body.monthLabel || "");
    const recipients = Array.isArray(body.recipients) ? body.recipients as Recipient[] : [];
    const validRecipients = recipients.filter((item) => item.email && item.subject && item.message);

    if (!validRecipients.length) {
      return jsonResponse({ error: "Nenhum destinatario valido." }, 400);
    }

    const results = await Promise.all(validRecipients.map((recipient) => sendEmail({
      resendKey,
      fromEmail,
      to: recipient.email,
      subject: recipient.subject,
      text: recipient.message,
      html: messageToHtml(recipient.name, monthLabel, recipient.message)
    })));

    const errors = results
      .filter((result) => !result.ok)
      .map((result) => ({ email: result.email, error: result.error }));

    await supabase.from("envios_notificacoes").insert({
      mes: monthKey || "sem-mes",
      mes_descricao: monthLabel || monthKey || "Sem mes",
      enviado_por: userEmail,
      total_destinatarios: validRecipients.length,
      total_enviados: results.filter((result) => result.ok).length,
      total_erros: errors.length,
      erros: errors
    });

    return jsonResponse({
      sent: results.filter((result) => result.ok).length,
      failed: errors.length,
      errors
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Erro inesperado." }, 500);
  }
});

async function sendEmail(input: {
  resendKey: string;
  fromEmail: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: input.fromEmail,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      return { ok: false, email: input.to, error: detail || response.statusText };
    }

    return { ok: true, email: input.to };
  } catch (error) {
    return {
      ok: false,
      email: input.to,
      error: error instanceof Error ? error.message : "Falha no envio."
    };
  }
}

function messageToHtml(name: string, monthLabel: string, message: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1f2522; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Designacoes - ${escapeHtml(monthLabel)}</h2>
      <p style="margin: 0 0 12px;">Ola, ${escapeHtml(name)}.</p>
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; background: #f6f8f6; border: 1px solid #d9ded8; border-radius: 8px; padding: 12px;">${escapeHtml(message)}</pre>
    </div>
  `;
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
