export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const SERVICE_KEY = "5a7663f39e3181997a9b6b9e3d2d5231b5f77ab847f55da0f01bd31632e44037";
  const { nx, ny } = req.query;
  if (!nx || !ny) return res.status(400).json({ error: "nx, ny 필요" });

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const pad = (n) => String(n).padStart(2, "0");

  // 발표 시간 계산
  const hours = [23, 20, 17, 14, 11, 8, 5, 2];
  let baseHour = 23;
  let baseDate = new Date(now);
  const curHour = now.getHours();
  for (const h of hours) { if (curHour >= h) { baseHour = h; break; } }
  if (curHour < 2) { baseDate.setDate(baseDate.getDate() - 1); baseHour = 23; }

  const baseDateStr = `${baseDate.getFullYear()}${pad(baseDate.getMonth()+1)}${pad(baseDate.getDate())}`;
  const baseTime    = `${pad(baseHour)}00`;
  const todayStr    = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`
    + `?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=2000&dataType=JSON`
    + `&base_date=${baseDateStr}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // 응답 텍스트 확인 후 JSON 파싱
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return res.status(500).json({ error: "기상청 응답 파싱 실패", raw: text.slice(0, 200) });
    }

    const resultCode = data?.response?.header?.resultCode;
    if (resultCode && resultCode !== "00") {
      return res.status(500).json({ error: `기상청 오류: ${data?.response?.header?.resultMsg}` });
    }

    const items = data?.response?.body?.items?.item ?? [];

    const todayTemps = items
      .filter(i => i.fcstDate === todayStr && i.category === "TMP")
      .map(i => Number(i.fcstValue));
    const calcMax = todayTemps.length > 0 ? Math.max(...todayTemps) : null;
    const calcMin = todayTemps.length > 0 ? Math.min(...todayTemps) : null;

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ ...data, calcMax, calcMin, todayStr });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
