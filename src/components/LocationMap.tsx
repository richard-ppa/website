"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface LocationMapProps {
  /** Marker latitude */
  lat: number;
  /** Marker longitude */
  lng: number;
  /** Initial zoom level — used when `fitBoundsTo` is not supplied. */
  zoom?: number;
  /** Optional initial map center [lat, lng]. Defaults to the marker location. */
  center?: [number, number];
  /**
   * Optional list of [lat, lng] points (in addition to the marker) the
   * initial view should include. When provided, the map auto-zooms to fit
   * all of them — responsive across container widths.
   */
  fitBoundsTo?: Array<[number, number]>;
  label?: string;
  className?: string;
}

export function LocationMap({ lat, lng, zoom = 15, center, fitBoundsTo, label, className }: LocationMapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      map = L.map(ref.current, {
        center: center ?? [lat, lng],
        zoom,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      if (fitBoundsTo && fitBoundsTo.length > 0) {
        const points: Array<[number, number]> = [[lat, lng], ...fitBoundsTo];
        map.fitBounds(points, { padding: [40, 40] });
      }

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      const markerHtml = `
        <div class="ppa-map-marker">
          <span class="ppa-map-marker-pulse" aria-hidden="true"></span>
          <span class="ppa-map-marker-badge">
            <img src="/icon.svg" alt="" class="ppa-map-marker-icon" />
          </span>
        </div>
      `;
      const icon = L.divIcon({
        className: "ppa-map-marker-wrap",
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([lat, lng], { icon, title: label, alt: label || "Plane Place Aviation" }).addTo(map);
      if (label) {
        marker.bindPopup(
          `<div style="font-family:inherit;font-size:13px;line-height:1.5;color:#111827;">${label}</div>`,
          { closeButton: false, className: "ppa-map-popup" }
        );
      }
    })();

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [lat, lng, zoom, label]);

  return (
    <div
      ref={ref}
      className={className ?? "h-[420px] w-full"}
      role="application"
      aria-label={label ? `Map showing ${label}` : "Map"}
    />
  );
}
