<template>
  <main class="maintenance-wrapper">
    <div class="maintenance-card">
      <!-- Top Tricolor Accent Bar -->
      <div class="tricolor-bar" aria-hidden="true">
        <span class="saffron"></span>
        <span class="white"></span>
        <span class="green"></span>
      </div>

      <div class="card-body">
        <!-- Civic Ballot Emblem -->
        <div class="emblem-wrap" aria-hidden="true">
          <svg
            width="52"
            height="52"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Ballot Box -->
            <rect
              x="12"
              y="28"
              width="40"
              height="26"
              rx="4"
              fill="#EFF6FF"
              stroke="#1E3A8A"
              stroke-width="2.5"
            />
            <!-- Ballot Slot -->
            <rect x="22" y="33" width="20" height="3.5" rx="1.75" fill="#1E3A8A" />
            <!-- Ballot Paper -->
            <path
              d="M25 33V15C25 13.8954 25.8954 13 27 13H37C38.1046 13 39 13.8954 39 15V33"
              fill="#FFFFFF"
              stroke="#1E3A8A"
              stroke-width="2.5"
            />
            <!-- Checkmark on Ballot -->
            <path
              d="M29 22.5L31.5 25L36 19.5"
              stroke="#138808"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <!-- Portal Badge -->
        <span class="portal-badge">Local Body Elections Portal (PBL)</span>

        <!-- Heading & Brief Message -->
        <h1>Under Maintenance</h1>
        <p>
          We are currently performing scheduled updates to improve portal performance.
          Please check back shortly.
        </p>

        <!-- Refresh Action -->
        <button type="button" class="refresh-btn" @click="refreshPage">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          Refresh Page
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
const refreshPage = () => {
  window.location.reload();
};
</script>

<style scoped>
.maintenance-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f4f6f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;
  color: #1e293b;
}

.maintenance-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.07);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  text-align: center;
}

.tricolor-bar {
  display: flex;
  height: 5px;
  width: 100%;
}

.tricolor-bar .saffron {
  flex: 1;
  background-color: #ff9933;
}

.tricolor-bar .white {
  flex: 1;
  background-color: #ffffff;
}

.tricolor-bar .green {
  flex: 1;
  background-color: #138808;
}

.card-body {
  padding: 40px 32px;
}

.emblem-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  margin-bottom: 18px;
}

.portal-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #1e3a8a;
  background-color: #eff6ff;
  padding: 5px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}

h1 {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

p {
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.6;
  color: #475569;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #1e3a8a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 11px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.refresh-btn:hover {
  background-color: #172554;
}

.refresh-btn:active {
  transform: scale(0.98);
}
</style>