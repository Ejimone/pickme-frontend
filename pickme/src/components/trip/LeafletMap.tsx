import { useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

import { Text } from "@/components/ui/text";

export interface MapStop {
  id: string;
  lat: number;
  lng: number;
  label: string;
  done?: boolean;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  heading?: number | null;
}

/**
 * Free, key-less live map: Leaflet + OpenStreetMap tiles rendered in a WebView.
 * No Google/Apple API key or billing — works in Expo Go. The driver marker and
 * stop pins are updated in place via injected JS as new locations arrive.
 *
 * NOTE: OSM's public tile server is fine for development and light use. For
 * production traffic, point TILE_URL at a free-tier provider you control
 * (e.g. MapTiler/Stadia/your own) per OSM's usage policy.
 */
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function buildHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0;background:#e5e5e5}</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([40, -74], 13);
  L.tileLayer('${TILE_URL}', { maxZoom: 19 }).addTo(map);
  var driverMarker = null, viewerMarker = null, stopMarkers = [], followed = true;
  map.on('dragstart', function(){ followed = false; });

  function driverIcon(h){
    return L.divIcon({ className:'', iconSize:[30,30], iconAnchor:[15,15], html:
      '<div style="width:26px;height:26px;background:#276ef1;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;transform:rotate('+(h||0)+'deg)">'+
      '<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid #fff;margin-top:-2px"></div></div>' });
  }
  function bounds(){
    var pts = stopMarkers.map(function(m){return m.getLatLng();});
    if (driverMarker) pts.push(driverMarker.getLatLng());
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.35));
  }
  window.setStops = function(list){
    stopMarkers.forEach(function(m){ map.removeLayer(m); });
    stopMarkers = list.map(function(s){
      var m = L.circleMarker([s.lat, s.lng], { radius:8, weight:2, color:'#111',
        fillColor: s.done ? '#05a357' : '#ffffff', fillOpacity:1 }).addTo(map);
      if (s.label) m.bindTooltip(s.label, { direction:'top' });
      return m;
    });
    if (!driverMarker) bounds();
  };
  window.setDriver = function(lat, lng, h){
    if (!driverMarker) { driverMarker = L.marker([lat,lng], { icon: driverIcon(h) }).addTo(map); bounds(); }
    else { driverMarker.setLatLng([lat,lng]); driverMarker.setIcon(driverIcon(h)); }
    if (followed) map.setView([lat,lng], Math.max(map.getZoom(), 15), { animate:true });
  };
  window.setViewer = function(lat, lng){
    if (!viewerMarker) {
      viewerMarker = L.circleMarker([lat,lng], { radius:7, weight:3, color:'#ffffff',
        fillColor:'#111111', fillOpacity:1 }).addTo(map);
      viewerMarker.bindTooltip('You', { direction:'top' });
    } else { viewerMarker.setLatLng([lat,lng]); }
  };
  true;
</script>
</body>
</html>`;
}

export function LeafletMap({
  driver,
  viewer,
  stops,
  style,
}: {
  driver?: DriverLocation | null;
  /** The watcher's own position ("you are here" dot). */
  viewer?: { lat: number; lng: number } | null;
  stops: MapStop[];
  style?: object;
}) {
  const ref = useRef<WebView>(null);
  const ready = useRef(false);
  const html = useMemo(buildHtml, []);

  const stopsJson = JSON.stringify(
    stops.map((s) => ({ lat: s.lat, lng: s.lng, label: s.label, done: !!s.done })),
  );

  function pushStops() {
    ref.current?.injectJavaScript(`window.setStops && window.setStops(${stopsJson}); true;`);
  }
  function pushDriver() {
    if (driver) {
      ref.current?.injectJavaScript(
        `window.setDriver && window.setDriver(${driver.lat}, ${driver.lng}, ${driver.heading ?? 0}); true;`,
      );
    }
  }
  function pushViewer() {
    if (viewer) {
      ref.current?.injectJavaScript(
        `window.setViewer && window.setViewer(${viewer.lat}, ${viewer.lng}); true;`,
      );
    }
  }

  useEffect(() => {
    if (ready.current) pushStops();
  }, [stopsJson]);

  useEffect(() => {
    if (ready.current) pushDriver();
  }, [driver?.lat, driver?.lng, driver?.heading]);

  useEffect(() => {
    if (ready.current) pushViewer();
  }, [viewer?.lat, viewer?.lng]);

  return (
    <View style={[{ flex: 1 }, style]}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1, backgroundColor: "#e5e5e5" }}
        onLoadEnd={() => {
          ready.current = true;
          pushStops();
          pushDriver();
          pushViewer();
        }}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

/** Placeholder shown when there's no driver fix yet. */
export function TripMapWaiting() {
  return (
    <View className="flex-1 items-center justify-center bg-card-secondary">
      <Text variant="caption">Waiting for the driver's location…</Text>
    </View>
  );
}
