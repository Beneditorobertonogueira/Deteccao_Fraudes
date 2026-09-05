import { useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Search, Link2, AlertTriangle, Loader2, Info } from "lucide-react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700;1,500&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

  .vg-root {
    --paper: #EDE8DC;
    --paper-dim: #E2DCCC;
    --ink: #1C2430;
    --ink-soft: #4A5060;
    --navy: #10192A;
    --navy-soft: #1B2740;
    --line: #C7BEA6;
    --red: #9C3A2C;
    --red-bg: #F3E2DA;
    --amber: #96692B;
    --amber-bg: #F1E6D2;
    --green: #2C6B4C;
    --green-bg: #DEE9DF;
    --info: #2C5B7A;
    font-family: 'IBM Plex Sans', sans-serif;
    background: var(--navy);
    color: var(--ink);
    min-height: 100%;
  }
  .vg-headline { font-family: 'Fraunces', serif; }
  .vg-mono { font-family: 'IBM Plex Mono', monospace; }
  .vg-paper {
    background: var(--paper);
    border: 1px solid var(--line);
  }
  .vg-btn {
    background: var(--ink);
    color: var(--paper);
    transition: transform 0.12s ease, background 0.12s ease;
  }
  .vg-btn:hover { background: var(--navy-soft); }
  .vg-btn:active { transform: scale(0.98); }
  .vg-textarea {
    background: #F7F4EB;
    border: 1px solid var(--line);
    color: var(--ink);
  }
  .vg-textarea:focus { outline: 2px solid var(--ink); outline-offset: 1px; }
  .vg-tag {
    border: 1px solid var(--line);
  }
  .vg-flag-row { border-top: 1px solid var(--line); }
  .vg-flag-row:first-child { border-top: none; }
  .vg-stamp {
    border: 3px solid currentColor;
    border-radius: 999px;
    transform: rotate(-4deg);
  }
`;

const BRANDS = {
  "banco do brasil": ["bb.com.br"],
  bb: ["bb.com.br"],
  bradesco: ["bradesco.com.br"],
  itau: ["itau.com.br"],
  caixa: ["caixa.gov.br"],
  nubank: ["nubank.com.br"],
  santander: ["santander.com.br"],
  "banco inter": ["bancointer.com.br"],
  "c6 bank": ["c6bank.com.br"],
  sicredi: ["sicredi.com.br"],
  sicoob: ["sicoob.com.br"],
  pagbank: ["pagbank.com.br"],
  pagseguro: ["pagseguro.com.br"],
  correios: ["correios.com.br"],
  "receita federal": ["gov.br"],
  inss: ["gov.br"],
  detran: ["gov.br"],
  denatran: ["gov.br"],
  senatran: ["gov.br"],
  "auxilio brasil": ["gov.br"],
  "bolsa familia": ["gov.br"],
  serasa: ["serasa.com.br"],
  spc: ["spcbrasil.org.br"],
  picpay: ["picpay.com"],
  "mercado livre": ["mercadolivre.com.br", "mercadolibre.com"],
  "mercado pago": ["mercadopago.com.br", "mercadopago.com"],
  "casas bahia": ["casasbahia.com.br"],
  magalu: ["magazineluiza.com.br"],
  "magazine luiza": ["magazineluiza.com.br"],
  amazon: ["amazon.com.br", "amazon.com"],
  shopee: ["shopee.com.br"],
  ifood: ["ifood.com.br"],
  uber: ["uber.com"],
  "99": ["99app.com"],
  vivo: ["vivo.com.br"],
  claro: ["claro.com.br"],
  tim: ["tim.com.br"],
  oi: ["oi.com.br"],
  whatsapp: ["whatsapp.com"],
  instagram: ["instagram.com"],
  facebook: ["facebook.com"],
  netflix: ["netflix.com"],
  spotify: ["spotify.com"],
  apple: ["apple.com"],
  microsoft: ["microsoft.com", "live.com", "outlook.com"],
  google: ["google.com", "gmail.com"],
  "gov.br": ["gov.br"],
};

function norm(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const OTP_WORDS = ["código de verificação", "código de autenticação", "use o código", "seu código é", "authentication code", "verification code", "código de acesso"];
const POINTS_RE = /pont[ou]|milhas|cashback|vantagens|resgat|milheiro/i;

const ALLOWED_TLD_RE = /\.(gov\.br|com\.br|org\.br|net\.br|edu\.br|jus\.br|leg\.br|mil\.br|mp\.br|def\.br|com|org|net|edu)$/i;
const SHORTENERS = ["bit.ly", "tinyurl.com", "is.gd", "t.co", "cutt.ly", "shorturl.at", "encurtador.com.br", "rebrand.ly"];
const URGENCY_WORDS = ["urgente", "imediatamente", "última chance", "últimas horas", "hoje mesmo", "bloqueado", "bloqueada", "suspensa", "suspenso", "vai expirar", "expira hoje", "confirme agora", "não perca", "ação necessária", "somente hoje"];
const DATA_WORDS = ["senha", "cvv", "código de verificação", "chave pix", "cpf", "dados bancários", "cartão de crédito", "token"];
const TOOGOOD_WORDS = ["prêmio", "sorteio", "herança", "você ganhou", "foi selecionado", "restituição", "dinheiro fácil"];
const MONEY_REQUEST_WORDS = ["faça um pix", "faz um pix", "me manda", "me empresta", "empresta dinheiro", "transferência", "transfere", "deposite", "deposita", "me deve", "preciso de dinheiro", "preciso urgente de"];
const ISOLATION_WORDS = ["não conta", "não fala pra", "não avisa", "mantenha em sigilo", "só entre nós", "não comenta com ninguém", "guarda segredo"];
const NUMBER_CHANGE_WORDS = ["número novo", "troquei de número", "caiu na privada", "quebrei o celular", "perdi o celular", "celular quebrou", "esse é meu número"];
const DEVICE_RELEASE_WORDS = ["libere seu android", "libere seu iphone", "libere seu celular", "libere seu computador", "libere o dispositivo", "liberar dispositivo", "autorize seu dispositivo", "autorizar seu dispositivo", "atualize seu aplicativo", "atualizar módulo de segurança", "instale o módulo de segurança", "instalar módulo de segurança"];

function extractUrls(text) {
  const withPrefix = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi) || [];
  const bareDomainRaw = text.match(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|com\.br|org|org\.br|net|gov\.br|gov|info|xyz|top|online|site|club|vip|click|app|link|co|me|io|cc|tv|cyou|sbs|icu)(?:\/[^\s]*)?\b/gi) || [];
  const bareDomain = bareDomainRaw.filter((bd) => !withPrefix.some((wp) => wp.includes(bd)));
  return [...new Set([...withPrefix, ...bareDomain])];
}

function analyzeUrl(raw) {
  const flags = [];
  let score = 0;
  let url;
  try {
    url = new URL(raw.startsWith("http") ? raw : "http://" + raw);
  } catch {
    return { flags: [{ label: "URL malformada — não foi possível interpretar o endereço", weight: "warn" }], score: 15 };
  }
  const host = url.hostname.toLowerCase();

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    flags.push({ label: "O endereço usa um número IP em vez de um domínio — comum em phishing", weight: "high" });
    score += 55;
  }
  if (raw.includes("@")) {
    flags.push({ label: "O link contém '@', técnica usada para disfarçar o destino real", weight: "high" });
    score += 55;
  }
  const isShortener = SHORTENERS.some((s) => host.includes(s));
  if (isShortener) {
    flags.push({ label: "Encurtador de link — esconde o destino final", weight: "warn" });
    score += 20;
  }
  const suspiciousTld = !ALLOWED_TLD_RE.test(host);
  if (suspiciousTld) {
    flags.push({ label: `Domínio de topo (".${host.split(".").slice(-1)[0]}") incomum para instituições/empresas brasileiras`, weight: "warn" });
    score += 15;
  }
  const subCount = host.split(".").length;
  if (subCount > 4) {
    flags.push({ label: "Domínio com muitos subníveis, técnica comum para disfarçar a marca imitada", weight: "warn" });
    score += 10;
  }

  const hostLabels = host.split(".");
  for (const [brand, officialDomains] of Object.entries(BRANDS)) {
    const brandKey = brand.replace(/[^a-z0-9]/g, "");
    if (brandKey.length < 2) continue;
    const isOfficial = officialDomains.some((d) => host === d || host.endsWith("." + d));
    const matches = brandKey.length <= 3
      ? hostLabels.includes(brandKey)
      : host.replace(/[^a-z0-9]/g, "").includes(brandKey);
    if (matches && !isOfficial) {
      flags.push({ label: `Menciona "${brand}" mas o domínio não é o oficial (${officialDomains[0]})`, weight: "high" });
      score += 55;
      break;
    }
  }

  if (flags.length === 0) {
    flags.push({ label: "Nenhum sinal técnico óbvio de fraude encontrado no endereço", weight: "ok" });
  }

  return { flags, score: Math.min(score, 100), host };
}

function analyzeText(text, hasLink) {
  const lower = norm(text);
  const flags = [];
  let score = 0;

  const urgency = URGENCY_WORDS.filter((w) => lower.includes(norm(w)));
  if (urgency.length) {
    flags.push({ label: `Linguagem de urgência artificial ("${urgency[0]}")`, weight: "warn" });
    score += 12 * Math.min(urgency.length, 2);
  }
  const hasSuspensionThreat = /(suspens(a|o|ao)|cancelamento|bloqueio|restricao)/i.test(lower) && /(conta|cartao|cnh|cadastro|acesso|documento)/i.test(lower);
  if (hasSuspensionThreat && hasLink) {
    flags.push({ label: `Ameaça de suspensão/bloqueio de conta, cartão ou documento + link — padrão comum de phishing, mesmo sem nenhuma marca reconhecida no domínio`, weight: "high" });
    score += 55;
  } else if (hasSuspensionThreat) {
    flags.push({ label: `Ameaça de suspensão/bloqueio de conta, cartão ou documento`, weight: "warn" });
    score += 15;
  }
  const dataAsk = DATA_WORDS.filter((w) => lower.includes(norm(w)));
  if (dataAsk.length) {
    flags.push({ label: `Pede diretamente dado sensível ("${dataAsk[0]}")`, weight: "high" });
    score += 55;
  }
  const tooGood = TOOGOOD_WORDS.filter((w) => lower.includes(norm(w)));
  if (tooGood.length) {
    flags.push({ label: `Promessa vantajosa demais ("${tooGood[0]}")`, weight: "warn" });
    score += 22;
  }
  const money = MONEY_REQUEST_WORDS.filter((w) => lower.includes(norm(w)));
  const isolation = ISOLATION_WORDS.filter((w) => lower.includes(norm(w)));
  const numberChange = NUMBER_CHANGE_WORDS.filter((w) => lower.includes(norm(w)));
  if (money.length && (isolation.length || numberChange.length)) {
    flags.push({ label: `Padrão de "golpe do parente/conhecido": pede dinheiro e ${isolation.length ? "pede sigilo" : "avisa troca de número"}`, weight: "high" });
    score += 55;
  } else if (money.length) {
    flags.push({ label: `Pedido direto de transferência/dinheiro ("${money[0]}")`, weight: "warn" });
    score += 15;
  }
  const deviceRelease = DEVICE_RELEASE_WORDS.filter((w) => lower.includes(norm(w)));
  if (deviceRelease.length) {
    flags.push({ label: `Pede para "liberar"/"atualizar" celular ou app — bancos nunca solicitam isso por SMS/link ("${deviceRelease[0]}")`, weight: "high" });
    score += 55;
  }
  const hasDigitReply = /\(?[12]\)?[^a-z0-9]{0,15}(confirma|bloque|cancel|autoriz)/i.test(lower);
  const hasTransactionContext = /r\$|transacao|compra de|debito de|debito no valor/i.test(lower);
  if (hasDigitReply && hasTransactionContext) {
    flags.push({ label: `Pede para responder com um número (1/2) pra "confirmar" ou "bloquear" uma transação — golpe clássico de SMS, o objetivo é validar que seu número está ativo`, weight: "high" });
    score += 55;
  }
  const otpMatch = OTP_WORDS.some((w) => lower.includes(norm(w))) && /\b\d{4,8}\b/.test(text);
  if (otpMatch) {
    const mentionedBrand = Object.keys(BRANDS).find((b) => lower.includes(norm(b)));
    flags.push({
      label: mentionedBrand
        ? `Código de verificação da ${mentionedBrand} — nunca compartilhe com ninguém, nem quem ligar dizendo ser suporte`
        : `Código de verificação — nunca compartilhe com ninguém, nem quem ligar dizendo ser suporte`,
      weight: "info",
    });
    score += 5;
  }
  const phoneMatches = text.match(/\b\d{10,15}\b/g) || [];
  const oddPhone = phoneMatches.find((p) => ![10, 11, 12, 13].includes(p.length));
  if (oddPhone) {
    flags.push({
      label: `Número de telefone com formato incomum (${oddPhone.length} dígitos) — evite retornar a ligação sem confirmar; pode ser spoofing ou golpe do tipo "wangiri"`,
      weight: "info",
    });
    score += 10;
  }
  const hasPoints = POINTS_RE.test(lower);
  const hasBigNumber = /\d{2,3}[.,]\d{3}|\b\d{2,}\s*mil\b/i.test(text);
  if (hasPoints && hasLink && hasBigNumber) {
    flags.push({ label: `Padrão de "golpe dos pontos/milhas": quantidade chamativa de pontos + link para "resgatar" — golpe de SMS bem documentado no Brasil`, weight: "high" });
    score += 55;
  } else if (hasPoints && hasLink) {
    flags.push({ label: `Oferta de pontos/cashback com link — confirme direto no app oficial antes de clicar`, weight: "warn" });
    score += 15;
  }
  if (flags.length === 0) {
    flags.push({ label: "Nenhum padrão de engenharia social óbvio no texto", weight: "ok" });
  }
  return { flags, score: Math.min(score, 100) };
}

function verdictFromScore(score) {
  if (score >= 55) return { key: "alto_risco", label: "SINAIS FORTES DE RISCO — confirme antes de agir", color: "var(--red)", bg: "var(--red-bg)", Icon: ShieldAlert };
  if (score >= 25) return { key: "atencao", label: "SINAIS DE ATENÇÃO — verifique com cautela", color: "var(--amber)", bg: "var(--amber-bg)", Icon: ShieldQuestion };
  return { key: "confiavel", label: "SEM SINAIS EVIDENTES — na dúvida, confirme", color: "var(--green)", bg: "var(--green-bg)", Icon: ShieldCheck };
}

export default function VerificadorGolpes() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aiText, setAiText] = useState(null);
  const [aiError, setAiError] = useState(false);

  function handleClear() {
    setInput("");
    setResult(null);
    setAiText(null);
    setAiError(false);
  }

  async function handleAnalyze() {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setAiText(null);
    setAiError(false);

    const urls = extractUrls(input);
    const urlAnalyses = urls.map((u) => ({ url: u, ...analyzeUrl(u) }));
    const textAnalysis = analyzeText(input, urls.length > 0);

    const urlScore = urlAnalyses.length ? Math.max(...urlAnalyses.map((a) => a.score)) : 0;
    const weighted = urlAnalyses.length
      ? Math.round(urlScore * 0.55 + textAnalysis.score * 0.45)
      : textAnalysis.score;
    // Um sinal de alta confiança (ex: domínio de marca falsificado, IP no lugar de domínio,
    // pedido de "liberar" dispositivo) não pode ser diluído pela média com sinais mais fracos.
    const combinedScore = Math.max(urlScore, textAnalysis.score, weighted);

    const localResult = { urlAnalyses, textAnalysis, combinedScore };
    setResult(localResult);

    try {
      const heuristicSummary = [
        ...urlAnalyses.flatMap((a) => a.flags.map((f) => f.label)),
        ...textAnalysis.flags.map((f) => f.label),
      ].join("; ");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Você é um analista de segurança digital brasileiro. Analise a mensagem abaixo, que um usuário recebeu e suspeita ser golpe. Sinais técnicos já detectados por heurística: ${heuristicSummary || "nenhum"}.

Mensagem original:
"""
${input}
"""

Responda APENAS com um JSON válido, sem markdown, sem texto fora do JSON, no formato:
{"veredito": "confiavel" | "atencao" | "alto_risco", "explicacao": "2-3 frases em português explicando o motivo, direto ao ponto", "sinais_adicionais": ["sinal 1", "sinal 2"]}`,
            },
          ],
        }),
      });
      const data = await response.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");
      if (textBlock) {
        const clean = textBlock.text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setAiText(parsed);
      } else {
        setAiError(true);
      }
    } catch (e) {
      setAiError(true);
    } finally {
      setLoading(false);
    }
  }

  const finalScore = aiText
    ? { confiavel: 10, atencao: 40, alto_risco: 80 }[aiText.veredito] ?? result?.combinedScore ?? 0
    : result?.combinedScore ?? 0;
  const verdict = result ? verdictFromScore(finalScore) : null;
  const VerdictIcon = verdict?.Icon;

  return (
    <div className="vg-root w-full min-h-screen flex flex-col items-center px-4 py-8">
      <style>{STYLE}</style>

      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--paper-dim)" }}>
          <Search size={16} />
          <span className="vg-mono text-xs tracking-wide" style={{ color: "#8A93A6" }}>protótipo · análise assistida por IA</span>
        </div>
        <h1 className="vg-headline text-3xl mb-1" style={{ color: "var(--paper)" }}>Verificador de golpes</h1>
        <p className="text-sm mb-6" style={{ color: "#A9B1C2" }}>
          Cole um link ou o texto de uma mensagem suspeita. Combina checagem técnica do endereço com leitura do conteúdo pela IA.
        </p>

        <div className="vg-paper rounded-sm p-4 mb-4">
          <textarea
            className="vg-textarea w-full rounded-sm p-3 text-sm vg-mono resize-none"
            rows={5}
            placeholder="Ex: Ola, seu cartao foi bloqueado, clique aqui pra regularizar: http://bradesco-seguro.top/confirmar"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <button
              className="vg-btn flex-1 rounded-sm py-2.5 text-sm flex items-center justify-center gap-2"
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
              {loading ? "Analisando..." : "Analisar"}
            </button>
            <button
              className="rounded-sm py-2.5 px-4 text-sm"
              style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--ink)" }}
              onClick={handleClear}
              disabled={loading || (!input && !result)}
            >
              Limpar
            </button>
          </div>
        </div>

        {result && verdict && (
          <div className="vg-paper rounded-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div
                className="vg-stamp vg-headline flex items-center gap-2 px-4 py-2 text-sm"
                style={{ color: verdict.color }}
              >
                <VerdictIcon size={20} />
                {verdict.label}
              </div>
              <div className="text-right">
                <div className="vg-mono text-2xl" style={{ color: verdict.color }}>{finalScore}</div>
                <div className="vg-mono text-[10px]" style={{ color: "var(--ink-soft)" }}>score de risco /100</div>
              </div>
            </div>

            {aiText && (
              <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--line)" }}>
                <div className="vg-mono text-[10px] mb-1" style={{ color: "var(--ink-soft)" }}>LEITURA DA IA</div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{aiText.explicacao}</p>
              </div>
            )}
            {aiError && (
              <div className="mb-4 pb-4 flex items-start gap-2" style={{ borderBottom: "1px solid var(--line)" }}>
                <Info size={14} style={{ marginTop: 2, color: "var(--ink-soft)", flexShrink: 0 }} />
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  A camada de IA não respondeu — veredito abaixo baseado apenas nas checagens técnicas.
                </p>
              </div>
            )}

            <div className="vg-mono text-[10px] mb-1" style={{ color: "var(--ink-soft)" }}>SINAIS DETECTADOS</div>
            <div>
              {[...result.urlAnalyses.flatMap((a) => a.flags), ...result.textAnalysis.flags, ...(aiText?.sinais_adicionais || []).map((s) => ({ label: s, weight: "warn" }))].map((f, i) => (
                <div key={i} className="vg-flag-row flex items-start gap-2 py-2 text-sm">
                  {f.weight === "high" && <AlertTriangle size={14} style={{ color: "var(--red)", marginTop: 2, flexShrink: 0 }} />}
                  {f.weight === "warn" && <AlertTriangle size={14} style={{ color: "var(--amber)", marginTop: 2, flexShrink: 0 }} />}
                  {f.weight === "ok" && <ShieldCheck size={14} style={{ color: "var(--green)", marginTop: 2, flexShrink: 0 }} />}
                  {f.weight === "info" && <Info size={14} style={{ color: "var(--info)", marginTop: 2, flexShrink: 0 }} />}
                  <span style={{ color: "var(--ink)" }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="vg-mono text-[10px] text-center leading-relaxed" style={{ color: "#6B7386" }}>
          Protótipo educativo — não substitui a confirmação pelo canal oficial da instituição.<br />
          Para denunciar phishing: antispam.br · cartilha.cert.br
        </p>

        <div className="vg-paper rounded-sm p-4 mt-4">
          <div className="vg-mono text-[10px] mb-2" style={{ color: "var(--ink-soft)" }}>VERIFICAR EMPRESA</div>
          <p className="text-sm mb-3" style={{ color: "var(--ink)" }}>
            Suspeita de uma empresa (concessionária, loja, prestador)? Confirme o CNPJ direto na fonte oficial — nunca pelo telefone que veio na mensagem suspeita.
          </p>
          <a
            href="https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/cnpjreva_solicitacao.asp"
            target="_blank"
            rel="noopener noreferrer"
            className="vg-btn w-full rounded-sm py-2.5 text-sm flex items-center justify-center gap-2 no-underline"
          >
            Consultar CNPJ na Receita Federal
          </a>
          <p className="vg-mono text-[10px] mt-2" style={{ color: "var(--ink-soft)" }}>
            Precisa do número de CNPJ (14 dígitos) — encontre no site oficial da empresa, numa nota fiscal, ou buscando o nome dela no Google.
          </p>
        </div>
      </div>
    </div>
  );
}
