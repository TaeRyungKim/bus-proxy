export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const SERVICE_KEY = "5a7663f39e3181997a9b6b9e3d2d5231b5f77ab847f55da0f01bd31632e44037";
  const { routeId } = req.query;

  if (!routeId) return res.status(400).json({ error: "routeId 필요" });

  const stationUrl = `https://apis.data.go.kr/6410000/busrouteservice/v2/getBusRouteStationListv2`
    + `?serviceKey=${SERVICE_KEY}&routeId=${routeId}&format=json`;

  const locationUrl = `https://apis.data.go.kr/6410000/buslocationservice/v2/getBusLocationListv2`
    + `?serviceKey=${SERVICE_KEY}&routeId=${routeId}&format=json`;

  try {
    // 정류장 목록 + 버스 위치 동시 요청
    const [stRes, locRes] = await Promise.all([
      fetch(stationUrl),
      fetch(locationUrl),
    ]);

    const stText  = await stRes.text();
    const locText = await locRes.text();

    const stData  = JSON.parse(stText);
    const locData = JSON.parse(locText);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ stations: stData, locations: locData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
