<main class="main-container">
  
  <h1 class="heading-tactical">Sistem Telemetri ve Tehdit Paneli</h1>

  <!-- 1. KARTLARDA PARLAYAN SAYILAR -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <div class="general-card">
      <span class="text-label">Ağ Durumu</span>
      <!-- Doğrudan text-arsenal-green kullanarak parlak yeşil yapıyoruz -->
      <p class="text-2xl font-mono font-bold text-arsenal-green drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">STABİL</p>
      <span class="text-[10px] font-mono text-arsenal-muted">0 PAKET KAYBI</span>
    </div>

    <div class="general-card">
      <span class="text-label">Aktif Tehdit</span>
      <!-- Kırmızı Lazer Vurgusu -->
      <p class="text-2xl font-mono font-bold text-arsenal-red drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">2 TESPİT</p>
      <span class="text-[10px] font-mono text-arsenal-muted">SEKTÖR-4 // KARANTİNADA</span>
    </div>

    <div class="general-card">
      <span class="text-label">Radar Senkronu</span>
      <!-- Mavi Siber Vurgu -->
      <p class="text-2xl font-mono font-bold text-arsenal-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">GÜNCEL</p>
      <span class="text-[10px] font-mono text-arsenal-muted">100Hz TARA</span>
    </div>

    <div class="general-card">
      <span class="text-label">Güç Ünitesi</span>
      <!-- Amber Uyarı -->
      <p class="text-2xl font-mono font-bold text-arsenal-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">%84.5</p>
      <span class="text-[10px] font-mono text-arsenal-muted">JENERATÖR DEVREDE</span>
    </div>
  </div>

  <!-- 2. TABLODA ROZETLER VE LED IŞIKLARI -->
  <div class="table-wrapper">
    <table class="tactical-table">
      <thead>
        <tr>
          <th>Birim Kodu</th>
          <th>Bölge</th>
          <th>Güvenlik Durumu</th>
          <th>Bağlantı</th>
          <th>Aksiyon</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold text-white">DRONE_SWARM_01</td>
          <td class="text-arsenal-muted">KUZEY VADİSİ</td>
          <td>
            <!-- Yeşil Parlayan Rozet + LED Noktası -->
            <span class="badge-green">
              <span class="status-dot-green"></span>
              DEVREDE
            </span>
          </td>
          <td class="text-arsenal-cyan font-mono">5G_SATELLITE</td>
          <td><button class="btn-primary py-1 px-3">Takip Et</button></td>
        </tr>

        <tr>
          <td class="font-bold text-white">RADAR_TOWER_09</td>
          <td class="text-arsenal-muted">DOĞU SIRTI</td>
          <td>
            <!-- Kırmızı Parlayan Rozet -->
            <span class="badge-red">
              <span class="status-dot-red"></span>
              BAĞLANTI KOPUK
            </span>
          </td>
          <td class="text-arsenal-muted font-mono">OFFLINE</td>
          <td><button class="btn-danger py-1 px-3">Yeniden Başlat</button></td>
        </tr>

        <tr>
          <td class="font-bold text-white">THERMAL_CAM_04</td>
          <td class="text-arsenal-muted">MERKEZ ÜSSÜ</td>
          <td>
            <!-- Amber Parlayan Rozet -->
            <span class="badge-amber">
              <span class="status-dot-amber"></span>
              BAKIM GEREKİYOR
            </span>
          </td>
          <td class="text-arsenal-amber font-mono">FIBER_OPTIC</td>
          <td><button class="btn-primary py-1 px-3">İncele</button></td>
        </tr>
      </tbody>
    </table>
  </div>

</main>