cat > /mnt/user-data/outputs/bus-proxy/api/route.js << 'EOF'
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const SERVICE_KEY = "5a7663f39e3181997a9b6b9e3d2d5231b5f77ab847f55da0f01bd31632e44037";
  const { routeId } = req.query;

  if (!routeId) return res.status(400).json({ error: "routeId 필요" });

  const url = `https://apis.data.go.kr/6410000/busrouteservice/v2/getBusRouteStationListv2`
    + `?serviceKey=${SERVICE_KEY}&routeId=${routeId}&format=json`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
EOF
echo "done"
