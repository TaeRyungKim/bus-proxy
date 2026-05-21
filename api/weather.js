export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const SERVICE_KEY = "5a7663f39e3181997a9b6b9e3d2d5231b5f77ab847f55da0f01bd31632e44037";
  const { nx, ny } = req.query;
  if (!nx || !ny) return res.status(400).json({ error: "nx, ny 필요" });

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const pad = (n) => String(n).padStart(2, "0");

  // 발표 시간 계산 (02,05,08,11,14,17,20,23시)
  const hours = [23, 20, 17, 14, 11, 8, 5, 2];
  let baseHour = 23;
  let baseDate = new Date(now);
  const curHour = now.getHours();
  for (const h of hours) { if (curHour >= h) { baseHour = h; break; } }
  if (curHour < 2) { baseDate.setDate(baseDate.getDate()-1); baseHour = 23; }

  const baseDateStr = `${baseDate.getFullYear()}${pad(baseDate.getMonth()+1)}${pad(baseDate.getDate())}`;
  const baseTime    = `${pad(baseHour)}00`;
  const todayStr    = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;

  // 3일치 받으려면 numOfRows를 늘려야 함 (시간당 12개 항목 × 24시간 × 3일 = 864)
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`
    + `?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=2000&dataType=JSON`
    + `&base_date=${baseDateStr}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const items = data?.response?.body?.items?.item ?? [];

    // 오늘 TMP로 최고/최저 계산
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
