import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  kind?: 'driver' | 'passenger' | 'origin' | 'destination';
}

@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  template: `<div class="leaflet-host" #host></div>`,
  styles: [`
    :host {
      display: block;
      min-height: 360px;
      height: 100%;
    }

    .leaflet-host {
      width: 100%;
      min-height: inherit;
      height: 100%;
      border-radius: var(--app-radius-lg);
      overflow: hidden;
      background: var(--app-bg-soft);
    }
  `],
})
export class LeafletMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() markers: MapMarker[] = [];
  @Input() center: [number, number] = [-8.839, 13.289];
  @Input() zoom = 12;

  @ViewChild('host', { static: true }) private readonly host!: ElementRef<HTMLElement>;

  private leaflet?: typeof import('leaflet');
  private map?: import('leaflet').Map;
  private layer?: import('leaflet').LayerGroup;

  async ngAfterViewInit(): Promise<void> {
    this.leaflet = await import('leaflet');
    this.map = this.leaflet.map(this.host.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      zoomControl: false,
    });

    this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.leaflet.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.layer = this.leaflet.layerGroup().addTo(this.map);
    this.renderMarkers();
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['markers'] && this.map) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private renderMarkers(): void {
    if (!this.leaflet || !this.map || !this.layer) {
      return;
    }

    this.layer.clearLayers();
    const points = this.markers.length > 0 ? this.markers : [{ lat: this.center[0], lng: this.center[1], label: 'Luanda' }];

    points.forEach((marker) => {
      const color = marker.kind === 'driver' ? '#10b981' : marker.kind === 'destination' ? '#2563eb' : '#f59e0b';
      this.leaflet!.circleMarker([marker.lat, marker.lng], {
        radius: 9,
        color: '#071018',
        weight: 3,
        fillColor: color,
        fillOpacity: 1,
      }).bindPopup(marker.label).addTo(this.layer!);
    });

    const bounds = this.leaflet.latLngBounds(points.map((marker) => [marker.lat, marker.lng]));
    this.map.fitBounds(bounds.pad(0.25), { maxZoom: 14 });
  }
}
