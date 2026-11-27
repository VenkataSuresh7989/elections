<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import pollingData from '../data/polling_data.json'

const searchHistoryKey = 'elections-user-search-history'

const officers = pollingData.map((record, index) => ({
  id: index,
  groupNo: record['Group No.'],
  pollingStationNo: record['Polling Station No.'],
  allottedMandal: record['Allotted Mandal'],
  gpName: record['Gp name'],
  role: record['Role / Designation in Poll'],
  officerName: record['Officer Name'],
  officialDesignation: record['Official Designation'],
  mobileNumber: record['Mobile Number'],
  counter: record.counter,
  collectMaterials: record['collect material s'],
  driverName: record['Driver Name'],
  vehicleNo: record['Vehicle No.']
}))

const detailFields = (officer) => [
  { label: 'Group No.', value: officer.groupNo },
  { label: 'Polling Station No.', value: officer.pollingStationNo },
  { label: 'Allotted Mandal', value: officer.allottedMandal },
  { label: 'Gp name', value: officer.gpName },
  { label: 'Role / Designation in Poll', value: officer.role },
  { label: 'Officer Name', value: officer.officerName },
  { label: 'Official Designation', value: officer.officialDesignation },
  { label: 'Mobile Number', value: officer.mobileNumber },
  { label: 'counter', value: officer.counter },
  { label: 'Collect Materials', value: officer.collectMaterials },
  { label: 'Driver Name', value: officer.driverName },
  { label: 'Vehicle No.', value: officer.vehicleNo }
]

const displayValue = (value) => value === null || value === undefined || value === ''
  ? 'Not provided'
  : value

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
})

const formatDateTime = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : dateTimeFormatter.format(date)
}

// Pre-index records by mobile number for instant O(1) lookup performance
const mobileIndex = new Map()
for (const record of officers) {
  const cleanPhone = String(record.mobileNumber || '').replace(/\D/g, '')
  if (!mobileIndex.has(cleanPhone)) {
    mobileIndex.set(cleanPhone, [])
  }
  mobileIndex.get(cleanPhone).push(record)
}

const searchInput = ref('')
const activeQuery = ref('')
const hasSearched = ref(false)
const showAssignment = ref(false)
const showUserStatus = ref(false)
const validationError = ref('')
const searchHistory = ref([])
const searchHistoryError = ref('')
const recentSearchHistory = computed(() => [...searchHistory.value].reverse())
const searchHistoryQuery = ref('')
const filteredSearchHistory = computed(() => {
  const query = searchHistoryQuery.value.trim().toLowerCase()
  if (!query) return recentSearchHistory.value
  return recentSearchHistory.value.filter((record) => [
    record.mobileNumber,
    record.officerNames.join(', '),
    record.dateTime
  ].some((value) => value.toLowerCase().includes(query)))
})

const isValidSearchRecord = (record) => record &&
  typeof record.mobileNumber === 'string' &&
  typeof record.dateTime === 'string' &&
  Array.isArray(record.officerNames) &&
  record.officerNames.every((name) => typeof name === 'string')

const loadSearchHistory = () => {
  let savedHistory
  try {
    savedHistory = window.localStorage.getItem(searchHistoryKey)
  } catch (error) {
    console.error('Unable to access saved user search history.', error)
    searchHistoryError.value = 'Saved search history could not be accessed in this browser.'
    return
  }

  if (!savedHistory) return

  let parsedHistory
  try {
    parsedHistory = JSON.parse(savedHistory)
  } catch (error) {
    console.error('Unable to parse saved user search history.', error)
    searchHistoryError.value = 'Saved search history is unreadable.'
    return
  }

  if (!Array.isArray(parsedHistory)) {
    console.error('Saved user search history is not a list.')
    searchHistoryError.value = 'Saved search history has an invalid format.'
    return
  }

  searchHistory.value = parsedHistory.filter(isValidSearchRecord)
  if (searchHistory.value.length !== parsedHistory.length) {
    console.error('Some saved user search records have an invalid format.')
    searchHistoryError.value = 'Some saved search records could not be displayed.'
  }
}

const saveSearchHistory = () => {
  try {
    window.localStorage.setItem(searchHistoryKey, JSON.stringify(searchHistory.value))
    searchHistoryError.value = ''
  } catch (error) {
    console.error('Unable to save user search history.', error)
    searchHistoryError.value = 'Search history could not be saved in this browser.'
  }
}

const handleDialogKeydown = (event) => {
  if (event.key === 'Escape' && showUserStatus.value) {
    showUserStatus.value = false
  }
}

onMounted(() => {
  loadSearchHistory()
  document.addEventListener('keydown', handleDialogKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDialogKeydown)
})

const handleInput = (event) => {
  validationError.value = ''
  searchInput.value = event.target.value.replace(/\D/g, '').slice(0, 10)
}

const filteredRecords = computed(() => {
  if (!hasSearched.value || !activeQuery.value) return []
  return mobileIndex.get(activeQuery.value) || []
})

const getDetails = () => {
  const cleaned = searchInput.value.trim()
  if (!cleaned) {
    validationError.value = 'Please enter a 10-digit mobile number.'
    return
  }
  if (cleaned.length < 10) {
    validationError.value = 'Mobile number must be 10 digits.'
    return
  }
  validationError.value = ''
  activeQuery.value = cleaned
  const matchingRecords = mobileIndex.get(activeQuery.value) || []
  const isSaved = searchHistory.value.some((record) => record.mobileNumber === activeQuery.value)
  if (!isSaved) {
    searchHistory.value = [
      ...searchHistory.value,
      {
        mobileNumber: activeQuery.value,
        officerNames: [...new Set(matchingRecords.map((record) => displayValue(record.officerName)))],
        dateTime: new Date().toISOString()
      }
    ]
    saveSearchHistory()
  }
  hasSearched.value = true
  showAssignment.value = true
  showUserStatus.value = false
}

const openUserStatus = () => {
  searchHistoryQuery.value = ''
  showUserStatus.value = true
}

const backToSearch = () => {
  showAssignment.value = false
}

const resetSearch = () => {
  searchInput.value = ''
  activeQuery.value = ''
  hasSearched.value = false
  showAssignment.value = false
  showUserStatus.value = false
  validationError.value = ''
}


</script>

<template>
  <div class="directory-page" :class="{ 'show-assignment': showAssignment }">
    <div class="container page-container">
      <section class="page-intro">
        <div>
          <div class="eyebrow"><span></span> PERSONNEL DIRECTORY</div>
          <h1>Staff Dispatch  <span>Lookup</span></h1>
          <button
            v-if="searchHistory.length || searchHistoryError"
            type="button"
            class="user-status-button mobile-user-status-button"
            :aria-expanded="showUserStatus"
            aria-controls="user-status"
            @click="openUserStatus"
          >
            <i class="bi bi-person-check"></i> Officer Status
          </button>
          <p>Find your assignment and deployment information using your registered mobile number.</p>
        </div>
        <div class="roster-count">
          <span class="count-icon"><i class="bi bi-people-fill"></i></span>
          <span><strong>{{ officers.length }}</strong><small>Roster records</small></span>
        </div>
      </section>

      <div class="row g-4 directory-content" :class="{ 'show-assignment': showAssignment }">
        <div class="col-12 col-lg-4 search-column">
          <section class="panel-card search-panel">
            <form @submit.prevent="getDetails" novalidate>
              <label for="searchInput" class="field-label">Registered mobile number</label>
              <div class="phone-control" :class="{ 'has-error': validationError }">
                <i class="bi bi-phone"></i>
                <input
                  id="searchInput"
                  type="tel"
                  inputmode="numeric"
                  :value="searchInput"
                  @input="handleInput"
                  maxlength="10"
                  autocomplete="off"
                  placeholder="Enter 10-digit Mobile Number"
                  :aria-invalid="Boolean(validationError)"
                  aria-describedby="search-help"
                />
                <button
                  v-if="searchInput"
                  type="button"
                  class="clear-button"
                  @click="resetSearch"
                  aria-label="Clear search"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <p id="search-help" class="input-help" :class="{ 'input-error': validationError }">
                <i :class="validationError ? 'bi bi-exclamation-circle' : 'bi bi-lock'"></i>
                {{ validationError || 'Use the mobile number registered with your polling officer record.' }}
              </p>

              <div class="form-actions">
                <button type="submit" class="search-button">
                  <i class="bi bi-search"></i>
                  Find my details
                </button>
                <button type="button" class="reset-button" @click="resetSearch" aria-label="Reset search">
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>
            </form>

            <div class="privacy-note">
              <i class="bi bi-shield-check"></i>
              <span>Your details are shown only when your search matches the roster.</span>
            </div>
          </section>
        </div>

        <div class="col-12 col-lg-8 details-column">
          <section class="panel-card details-panel h-100">
            <button type="button" class="mobile-back-button" @click="backToSearch">
              <i class="bi bi-arrow-left"></i>
              Back to search
            </button>
            <div class="details-heading">
              <span v-if="hasSearched && filteredRecords.length" class="result-count">
                {{ filteredRecords.length }} {{ filteredRecords.length === 1 ? 'record' : 'records' }}
              </span>
              <button
                v-if="searchHistory.length || searchHistoryError"
                type="button"
                class="user-status-button desktop-user-status-button"
                :aria-expanded="showUserStatus"
                aria-controls="user-status"
                @click="openUserStatus"
              >
                <i class="bi bi-person-check"></i> Officer Status
              </button>
            </div>

            <div v-if="!hasSearched" class="empty-state">
              <div class="empty-art"><i class="bi bi-person-vcard"></i></div>
              <h3>Your assignment will appear here</h3>
              <p>Enter your registered mobile number to view your polling station, role, and transport details.</p>
            </div>

            <div v-else-if="filteredRecords.length === 0" class="empty-state">
              <div class="empty-art no-result-art"><i class="bi bi-person-x"></i></div>
              <h3>No matching officer found</h3>
              <p>
                We couldn't find a roster record for <strong>{{ activeQuery }}</strong>.
                Check the number and try again.
              </p>
              <button type="button" class="try-again-button" @click="resetSearch">
                <i class="bi bi-arrow-counterclockwise"></i> Try another number
              </button>
            </div>

            <div v-else class="records-list">
              <article
                v-for="officer in filteredRecords"
                :key="officer.id"
                class="record-card"
              >
                <div class="record-topline">
                  <span><i class="bi bi-check-circle-fill"></i> MATCHED ROSTER RECORD</span>
                </div>
                <div class="detail-grid">
                  <div
                    v-for="field in detailFields(officer)"
                    :key="field.label"
                    class="detail-tile"
                  >
                    <span class="detail-label">{{ field.label }}</span>
                    <a
                      v-if="field.label === 'Mobile Number' && field.value"
                      :href="`tel:${field.value}`"
                      class="detail-value phone-link"
                    >{{ displayValue(field.value) }}</a>
                    <span v-else class="detail-value">{{ displayValue(field.value) }}</span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div v-if="showUserStatus" class="user-status-backdrop" role="presentation">
      <section
        id="user-status"
        class="user-status-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-status-title"
      >
        <header class="user-status-modal-header">
          <div class="user-status-modal-actions">
            <label class="user-status-search">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input
                v-model="searchHistoryQuery"
                type="search"
                aria-label="Search user status table"
                placeholder="Search records"
              />
            </label>
            <button
              type="button"
              class="user-status-close"
              aria-label="Close user status"
              @click="showUserStatus = false"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </header>

        <p v-if="searchHistoryError" class="user-status-error" role="alert">
          {{ searchHistoryError }}
        </p>

        <div v-if="recentSearchHistory.length" class="user-status-table-wrap">
          <table class="user-status-table">
            <thead>
              <tr>
                <th scope="col">Officer name</th>
                <th scope="col">Date and time</th>                
                <th scope="col">Searched mobile number</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in filteredSearchHistory" :key="record.mobileNumber">                
                <td>{{ record.officerNames.length ? record.officerNames.join(', ') : 'No matching officer found' }}</td>
                <td><time>{{ formatDateTime(record.dateTime) }}</time></td>
                <td>{{ record.mobileNumber }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="!filteredSearchHistory.length" class="user-status-empty">
            No search records match "{{ searchHistoryQuery }}".
          </p>
        </div>
        <p v-else class="user-status-empty">No successful mobile searches have been saved.</p>

        <p class="user-status-storage-note">Search records are saved in this browser.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.directory-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 1.25rem 0 4rem;
  background: linear-gradient(135deg, #f8faff 0%, #edf4ff 55%, #f2faf7 100%);
}

.page-container {
  max-width: 1180px;
}

.page-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.eyebrow,
.section-kicker {
  color: #5575b8;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.8rem;
}

.eyebrow span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3478f6;
}

.page-intro h1 {
  margin: 0;
  color: #17243b;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 1.08;
}

.page-intro h1 span {
  color: #3478f6;
}

.page-intro p {
  max-width: 570px;
  margin: 0.8rem 0 0;
  color: #738098;
  font-size: 0.98rem;
}

.roster-count {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e6ebf4;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  white-space: nowrap;
}

.count-icon,
.heading-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  color: #3478f6;
  background: #edf3ff;
  font-size: 1.1rem;
}

.roster-count > span:last-child {
  display: grid;
  gap: 0.08rem;
}

.roster-count strong {
  color: #1d2b45;
  font-size: 1.05rem;
  line-height: 1;
}

.roster-count small {
  color: #8792a6;
  font-size: 0.7rem;
}

.panel-card {
  overflow: hidden;
  border: 1px solid #e9edf4;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 40px rgba(30, 50, 90, 0.055);
}

.search-panel {
  display: flex;
  align-self: flex-start;
  flex-direction: column;
  padding: 1.6rem;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.panel-heading h2 {
  margin: 0.15rem 0 0;
  color: #1c2940;
  font-size: 1.08rem;
  font-weight: 750;
  letter-spacing: -0.025em;
}

.details-icon {
  color: #249b78;
  background: #e9f8f2;
}

.field-label {
  display: block;
  margin: 0.25rem 0 0.55rem;
  color: #3a4860;
  font-size: 0.78rem;
  font-weight: 700;
}

.phone-control {
  display: flex;
  align-items: center;
  min-height: 54px;
  padding: 0 0.85rem;
  border: 1px solid #dfe5ef;
  border-radius: 13px;
  background: #fbfcfe;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.phone-control:focus-within {
  border-color: #76a3ff;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(52, 120, 246, 0.11);
}

.phone-control.has-error {
  border-color: #e77b7b;
}

.phone-control > i {
  color: #8794aa;
  font-size: 1.1rem;
}

.phone-control input {
  width: 100%;
  min-width: 0;
  padding: 0.8rem 0.7rem;
  border: 0;
  outline: 0;
  color: #1c2940;
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
}

.phone-control input::placeholder {
  color: #a4adbc;
}

.clear-button,
.reset-button {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  color: #7d899d;
  background: transparent;
}

.clear-button {
  width: 30px;
  height: 30px;
  border-radius: 8px;
}

.clear-button:hover {
  color: #35445c;
  background: #eef2f8;
}

.input-help {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  min-height: 2.25rem;
  margin: 0.6rem 0 0.5rem;
  color: #8a95a8;
  font-size: 0.72rem;
  line-height: 1.5;
}

.input-help i {
  margin-top: 0.1rem;
}

.input-error {
  color: #c14949;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
}

.search-button {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 50px;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, #3478f6, #245bd2);
  box-shadow: 0 7px 14px rgba(52, 120, 246, 0.2);
  font-size: 0.85rem;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.search-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(52, 120, 246, 0.27);
}

.reset-button {
  width: 50px;
  border: 1px solid #e3e8f0;
  border-radius: 12px;
  background: #fff;
  font-size: 1.05rem;
}

.reset-button:hover {
  color: #3478f6;
  background: #f5f8ff;
}

.privacy-note {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 1.25rem;
  padding-top: 0;
  color: #8b96a8;
  font-size: 0.7rem;
  line-height: 1.5;
}

.privacy-note i {
  color: #27a77c;
  font-size: 0.95rem;
}

.details-panel {  
  padding: 1.25rem 0.5rem;
}

.details-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eef1f6;
}

.user-status-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 42px;
  padding: 0.55rem 1rem;
  border: 0;
  border-radius: 11px;
  color: #fff;
  background: linear-gradient(135deg, #3478f6, #245bd2);
  box-shadow: 0 7px 16px rgba(52, 120, 246, 0.25);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.mobile-user-status-button {
  display: none;
}

.user-status-button:hover,
.user-status-button[aria-expanded="true"] {
  color: #fff;
  background: linear-gradient(135deg, #2869e5, #1d4fb8);
  box-shadow: 0 9px 20px rgba(52, 120, 246, 0.33);
  transform: translateY(-1px);
}

.user-status-button:focus-visible {
  outline: 3px solid rgba(52, 120, 246, 0.3);
  outline-offset: 3px;
}

.user-status-backdrop {
  position: fixed;
  z-index: 1100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(19, 31, 52, 0.52);
}

.user-status-modal {
  display: flex;
  flex-direction: column;
  width: min(820px, 100%);
  max-height: min(82vh, 720px);
  overflow: hidden;
  border: 1px solid #e6ebf4;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(14, 29, 55, 0.24);
}

.user-status-modal-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem;
  border-bottom: 1px solid #eef1f6;
}

.user-status-modal-header h2 {
  margin: 0.2rem 0 0;
  color: #1c2940;
  font-size: 1.15rem;
  font-weight: 750;
}

.user-status-modal-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
}

.user-status-search {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.user-status-search > i {
  position: absolute;
  left: 0.75rem;
  color: #8794aa;
  font-size: 0.85rem;
  pointer-events: none;
}

.user-status-search input {
  width: 100%;
  min-width: 0;
  min-height: 46px;
  padding: 0.6rem 0.75rem 0.6rem 2.2rem;
  border: 1px solid #dfe5ef;
  border-radius: 12px;
  outline: 0;
  color: #29364d;
  background: #fbfcfe;
  font: inherit;
  font-size: 0.85rem;
}

.user-status-search input:focus {
  border-color: #76a3ff;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(52, 120, 246, 0.1);
}

.user-status-close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid #dc3545;
  border-radius: 12px;
  color: #fff;
  background: #dc3545;
}

.user-status-close:hover {
  border-color: #b02a37;
  color: #fff;
  background: #b02a37;
}

.user-status-error {
  margin: 0;
  padding: 0.8rem 1.25rem;
  color: #a63d3d;
  background: #fff5f5;
  font-size: 0.78rem;
}

.user-status-table-wrap {
  max-height: min(55vh, 460px);
  overflow: auto;
}

.user-status-table {
  width: 100%;
  min-width: 620px;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.user-status-table th,
.user-status-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #eef1f6;
  color: #344158;
  font-size: 0.78rem;
  vertical-align: top;
}

.user-status-table th {
  position: sticky;
  z-index: 1;
  top: 0;
  color: #65728a;
  background: #f6f8fc;
  font-size: 0.68rem;
  font-weight: 750;
  white-space: nowrap;
}

.user-status-table td:first-child {
  font-weight: 700;
  white-space: nowrap;
}

.user-status-empty,
.user-status-storage-note {
  margin: 0;
  padding: 1rem 1.25rem;
  color: #8994a6;
  font-size: 0.78rem;
}

.user-status-storage-note {
  padding-top: 0.65rem;
  border-top: 1px solid #eef1f6;
  font-size: 0.68rem;
}

.result-count {
  padding: 0.42rem 0.75rem;
  border: 1px solid #d8f0e5;
  border-radius: 999px;
  color: #21835f;
  background: #effaf5;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}

.empty-state {
  display: flex;  
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.empty-art {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  margin-bottom: 1.1rem;
  border: 1px solid #e4ecfc;
  border-radius: 24px;
  color: #3478f6;
  background: linear-gradient(145deg, #f3f7ff, #eaf1ff);
  font-size: 1.8rem;
}

.no-result-art {
  border-color: #f4e3e3;
  color: #cc6666;
  background: #fff5f5;
}

.empty-state h3 {
  margin: 0;
  color: #26334a;
  font-size: 1rem;
  font-weight: 750;
}

.empty-state p {
  max-width: 370px;
  margin: 0.5rem 0 0;
  color: #8994a6;
  font-size: 0.8rem;
  line-height: 1.65;
}

.try-again-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid #dce7fa;
  border-radius: 10px;
  color: #3478f6;
  background: #f7faff;
  font-size: 0.76rem;
  font-weight: 700;
}

.try-again-button:hover {
  background: #edf4ff;
}

.records-list {
  display: grid;
  gap: 1rem;
  padding-top: 1.25rem;
}

.record-card {
  padding: 1.1rem;
  border: 1px solid #e8edf4;
  border-radius: 16px;
  background: #fff;
}

.record-topline {
  margin-bottom: 0.85rem;
  color: #8591a5;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.record-topline i {
  margin-right: 0.25rem;
  color: #25a477;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.detail-tile {
  min-width: 0;
  padding: 0.8rem 0.85rem;
  border: 1px solid #edf0f5;
  border-radius: 11px;
  background: #f9fafc;
}

.detail-label {
  display: block;
  margin-bottom: 0.35rem;
  color: #8994a7;
  font-size: 0.66rem;
  font-weight: 600;
}

.detail-value {
  display: block;
  overflow-wrap: anywhere;
  color: #29364d;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.4;
}

.phone-link {
  color: #3478f6;
  text-decoration: none;
}

.phone-link:hover {
  text-decoration: underline;
}

@media (max-width: 991.98px) {
  .search-panel {
    min-height: auto !important;
  }

  .privacy-note {
    margin-top: 1rem;
  }
}

@media (max-width: 767.98px) {
  .mobile-user-status-button {
    display: inline-flex;
    margin-top: 0.75rem;
  }

  .desktop-user-status-button {
    display: none;
  }

  .directory-page:not(.show-assignment) {
    display: block;
  }

  .directory-page:not(.show-assignment) .page-container {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 6rem);
  }

  .directory-content:not(.show-assignment) {
    flex: 1;
    align-items: center;
  }

  .directory-content:not(.show-assignment) .details-column,
  .directory-content.show-assignment .search-column {
    display: none;
  }

  .mobile-back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: .25rem;
    padding: 0.55rem 0.8rem;
    border: 1px solid #dce7fa;
    border-radius: 10px;
    color: #3478f6;
    background: #f7faff;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .directory-page {
    padding: 2rem 0;
  }

  .page-intro {
    align-items: flex-start;
  }

  .roster-count {
    display: none;
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-card {
    border-radius: 18px;
  }
}

@media (min-width: 768px) {
  .mobile-back-button {
    display: none;
  }
}

@media (max-width: 420px) {
  .page-intro h1 {
    font-size: 2rem;
  }

  .user-status-modal-header {
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .user-status-modal-header h2 {
    font-size: 0.72rem;
  }

  .user-status-search {
    width: auto;
  }

  .search-panel,
  .details-panel {
    padding: .8rem;
  }

  .detail-grid {
    gap: 0.5rem;
  }

  .detail-tile {
    padding: 0.7rem;
  }

  .detail-label {
    font-size: 0.62rem;
  }

  .detail-value {
    font-size: 0.74rem;
  }
}
</style>