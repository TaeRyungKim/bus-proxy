export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const SERVICE_KEY = "5a7663f39e3181997a9b6b9e3d2d5231b5f77ab847f55da0f01bd31632e44037";
  const { nx, ny } = req.query;

  if (!nx || !ny) {
    return res.status(400).json({ error: "nx, ny 파라미터가 필요합니다" });
  }

  // 기준 시간 계산 (기상청은 02,05,08,11,14,17,20,23시 발표)
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const hours = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseHour = hours[0];
  for (const h of hours) {
    if (now.getHours() >= h) baseHour = h;
  }
  // 현재 시각이 발표 시간보다 이르면 이전 발표 시간 사용
  if (now.getHours() < 2) {
    now.setDate(now.getDate() - 1);
    baseHour = 23;
  }

  const pad = (n) => String(n).padStart(2, "0");
  const baseDate = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  const baseTime = `${pad(baseHour)}00`;

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`
    + `?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=1000&dataType=JSON`
    + `&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
