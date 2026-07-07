import { NavigationArrow } from "phosphor-react-native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, type Region } from "react-native-maps";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";

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

const FALLBACK_REGION: Region = {
  latitude: 41.8781,
  longitude: -87.6298,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/**
 * The live-trip map: driver marker (heading-rotated) plus stop pins. The map
 * follows the driver as new pings arrive; stops are colored by completion.
 */
export function TripMap({
  driver,
  stops,
  style,
}: {
  driver?: DriverLocation | null;
  stops: MapStop[];
  style?: object;
}) {
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);

  const initialRegion: Region = driver
    ? { latitude: driver.lat, longitude: driver.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : stops[0]
      ? { latitude: stops[0].lat, longitude: stops[0].lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }
      : FALLBACK_REGION;

  // Follow the driver as location updates stream in.
  useEffect(() => {
    if (driver && mapRef.current) {
      mapRef.current.animateCamera(
        { center: { latitude: driver.lat, longitude: driver.lng } },
        { duration: 600 },
      );
    }
  }, [driver?.lat, driver?.lng]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      style={[{ flex: 1 }, style]}
      initialRegion={initialRegion}
      showsUserLocation={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {stops.map((stop) => (
        <Marker
          key={stop.id}
          coordinate={{ latitude: stop.lat, longitude: stop.lng }}
          title={stop.label}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={{ backgroundColor: stop.done ? colors.success : colors.card }}
            className="h-4 w-4 rounded-full border-2 border-foreground"
          />
        </Marker>
      ))}

      {driver ? (
        <Marker
          coordinate={{ latitude: driver.lat, longitude: driver.lng }}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={driver.heading ?? 0}
          title="Driver"
        >
          <View
            style={{ backgroundColor: colors.accent }}
            className="h-9 w-9 items-center justify-center rounded-full border-2 border-white"
          >
            <NavigationArrow size={18} color="#FFFFFF" weight="fill" />
          </View>
        </Marker>
      ) : null}
    </MapView>
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
