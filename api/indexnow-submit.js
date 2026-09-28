export default async function handler(req, res) {
  const key = "5um9283163dfe4cfc879f377fb0e03d95";
  const payload = {
    host: "axiva.com.br",
    key,
    keyLocation: "https://axiva.com.br/" + key + ".txt",
    urlList: [
      "https://axiva.com.br/",
      "https://axiva.com.br/crm",
      "https://axiva.com.br/invest"
    ]
  };

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const body = await response.text();
    res.status(response.status).json({
      ok: response.status === 200 || response.status === 202,
      status: response.status,
      body
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}
