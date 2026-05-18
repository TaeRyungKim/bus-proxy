export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const SERVICE_KEY = "5a7663f39e3181997a9b6b9e3d2d5231b5f77ab847f55da0f01bd31632e44037";
  const STATION_ID  = "206000540"; // 삼평교 07496 (수서 방향)

  const url = `https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalListv2?serviceKey=${SERVICE_KEY}&stationId=${STATION_ID}&format=json`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    if (text.trim().startsWith("<")) {
      res.setHeader("Content-Type", "application/xml");
      res.status(200).send(text);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(text);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
