// College Live Attendance Integration for animutyam with Motivation, 75/85/90/95% Targets, Graphs & Polls
(function () {
  // Styles for modal animations and custom elements
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes animModalFadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .anim-modal-animate {
      animation: animModalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    #attendanceModalContainer {
      overflow-y: auto !important;
      overscroll-behavior: contain;
    }
    #attendanceModalCard {
      height: 90vh !important;
      max-height: 90vh !important;
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    #attendanceModalBody {
      flex: 1 1 0% !important;
      min-height: 0 !important;
      max-height: 100% !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
      display: block !important;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #94a3b8 !important;
      border-radius: 9999px !important;
      border: 2px solid #f1f5f9 !important;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #64748b !important;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background-color: #f1f5f9 !important;
    }
    .graph-bar-animate {
      transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    /* Hide Edge / IE native password reveal button & clear button */
    input[type="password"]::-ms-reveal,
    input[type="password"]::-ms-clear,
    input::-ms-reveal,
    input::-ms-clear {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      pointer-events: none !important;
    }
    /* Hide Chrome / WebKit native autofill preview button if clashing */
    input[type="password"]::-webkit-credentials-auto-fill-button,
    input::-webkit-credentials-auto-fill-button {
      visibility: hidden !important;
      display: none !important;
      pointer-events: none !important;
      position: absolute !important;
      right: 0 !important;
    }
    /* Hide cluttered sections to make website simple and clean */
    #progress-section,
    #growth-section {
      display: none !important;
    }
    header nav a,
    header nav button:not(#navAttendanceBtn) {
      display: none !important;
    }
    /* Explicit Emerald button styling so buttons are never white */
    .bg-emerald-600,
    .btn-attendance-emerald,
    #heroCheckAttendanceBtn,
    #navAttendanceBtn {
      background-color: #059669 !important;
      color: #ffffff !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    .hover\:bg-emerald-700:hover,
    .btn-attendance-emerald:hover,
    #heroCheckAttendanceBtn:hover,
    #navAttendanceBtn:hover {
      background-color: #047857 !important;
      color: #ffffff !important;
    }
    .active\:bg-emerald-800:active,
    .btn-attendance-emerald:active,
    #heroCheckAttendanceBtn:active,
    #navAttendanceBtn:active {
      background-color: #065f46 !important;
      color: #ffffff !important;
    }
    #heroCheckAttendanceBtn *,
    #navAttendanceBtn * {
      color: #ffffff !important;
    }
  `;
  document.head.appendChild(styleEl);

  // Community Poll state
  const POLL_STORAGE_KEY = 'anim_attendance_goal_poll';
  const defaultPollVotes = { '75': 38, '85': 62, '90': 27, '95': 14 };

  // Create Modal HTML
  const modalContainer = document.createElement('div');
  modalContainer.id = 'attendanceModalContainer';
  modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 hidden';
  modalContainer.innerHTML = `
    <div id="attendanceModalCard" class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[90vh] max-h-[90vh] flex flex-col min-h-0 overflow-hidden anim-modal-animate">
      
      <!-- Modal Header -->
      <div class="px-5 py-3.5 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 shadow-sm text-indigo-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Live College Attendance
              <span class="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Live Sync</span>
            </h3>
            <p class="text-xs text-indigo-200/80">Directly fetched from VIPT WebPros Portal</p>
          </div>
        </div>
        <button id="closeAttendanceModal" class="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Close">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Navigation Tabs (Shown when attendance is loaded) -->
      <div id="attendanceTabsNav" class="hidden px-5 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 text-xs font-semibold">
        <button data-tab="overview" class="att-tab-btn px-3 py-1.5 rounded-lg bg-white text-indigo-700 shadow-2xs border border-slate-200 font-bold transition-all cursor-pointer">
          📊 Summary & Targets
        </button>
        <button data-tab="graphs" class="att-tab-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer">
          📈 Subject Graphs
        </button>
        <button data-tab="simulator" class="att-tab-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer">
          🧮 What-If Planner
        </button>
        <button data-tab="poll" class="att-tab-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer">
          🗳️ Community Poll
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div id="attendanceModalBody" class="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-slate-50/50" style="overflow-y: auto !important; min-height: 0; flex: 1 1 0%;">
        
        <!-- Form Section -->
        <div id="attendanceFormSection" class="max-w-xl mx-auto space-y-5 py-2">
          <div class="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p class="font-bold text-sm text-indigo-950">Enter College Portal Credentials</p>
              <p class="text-indigo-700 mt-1">Use your official VIPT WebPros student roll number and password. Your live attendance records will be fetched and analyzed securely.</p>
            </div>
          </div>

          <form id="attendanceForm" class="space-y-4">
            <div>
              <label for="attRollNo" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Student Roll Number</label>
              <div class="relative">
                <input type="text" id="attRollNo" required placeholder="e.g. 25AC1R0095" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 text-sm font-semibold text-slate-800 uppercase tracking-wider outline-none transition-all placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 bg-white">
              </div>
            </div>

            <div>
              <label for="attPassword" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Portal Password</label>
              <div class="relative flex items-center">
                <input type="password" id="attPassword" required placeholder="Enter your portal password" class="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 bg-white">
                <button type="button" id="togglePasswordBtn" class="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer" title="Show/Hide Password">
                  <svg id="eyeIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" id="attRememberMe" class="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5">
                <span>Remember on this browser</span>
              </label>
              <span class="text-slate-400">🔒 Direct Portal Sync</span>
            </div>

            <!-- Error message container -->
            <div id="attendanceErrorMsg" class="hidden bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex items-center gap-2">
              <svg class="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span id="attendanceErrorText"></span>
            </div>

            <button type="submit" id="submitAttendanceBtn" class="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm tracking-wide shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span>Fetch Live Attendance</span>
              <svg id="btnSpinner" class="w-4 h-4 animate-spin hidden" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            </button>
          </form>
        </div>

        <!-- Result Section (Shown after successful fetch) -->
        <div id="attendanceResultSection" class="hidden space-y-6">
          
          <!-- Student Info Header -->
          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2.5">
                <h4 id="resStudentName" class="text-lg font-black text-slate-900 tracking-tight"></h4>
                <span id="resRollNo" class="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 font-mono"></span>
              </div>
              <p id="resCourseBranch" class="text-xs text-slate-500 font-medium mt-1"></p>
            </div>
            <div class="flex items-center gap-2 self-start sm:self-auto">
              <button id="refreshAttendanceBtn" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer" title="Refresh">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Refresh</span>
              </button>
              <button id="printAttendanceBtn" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer" title="Print Report">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                <span>Print</span>
              </button>
            </div>
          </div>

          <!-- TAB 1: OVERVIEW & TARGETS -->
          <div id="tabContentOverview" class="tab-pane space-y-6">
            
            <!-- Dynamic Motivational Banner -->
            <div id="motivationBanner" class="p-4 rounded-2xl border shadow-xs flex items-start gap-3.5 transition-all">
              <span id="motivationEmoji" class="text-3xl shrink-0 mt-0.5">🌟</span>
              <div>
                <h5 id="motivationTitle" class="text-sm font-extrabold tracking-tight"></h5>
                <p id="motivationQuote" class="text-xs mt-1 leading-relaxed"></p>
                <div class="mt-2 text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span id="motivationTip"></span>
                </div>
              </div>
            </div>

            <!-- Overall Summary Metrics -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <!-- Overall % Card -->
              <div id="overallPctCard" class="sm:col-span-2 p-4 rounded-2xl border bg-gradient-to-br flex flex-col justify-between">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Overall Attendance</span>
                  <span id="resStatusBadge" class="px-2.5 py-0.5 rounded-full text-xs font-extrabold border"></span>
                </div>
                <div class="my-2 flex items-baseline gap-2">
                  <span id="resOverallPct" class="text-4xl sm:text-5xl font-black tracking-tight"></span>
                  <span class="text-sm font-semibold text-slate-500">cumulative</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mt-1">
                  <div id="resOverallBar" class="h-full rounded-full transition-all duration-700"></div>
                </div>
              </div>

              <!-- Total Classes Card -->
              <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Classes Held</span>
                <span id="resHeldClasses" class="text-2xl sm:text-3xl font-black text-slate-800 my-1"></span>
                <span class="text-[11px] text-slate-500">Total hours conducted</span>
              </div>

              <!-- Attended Classes Card -->
              <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Attended / Missed</span>
                <div class="my-1 flex items-baseline gap-1.5">
                  <span id="resAttendedClasses" class="text-2xl sm:text-3xl font-black text-emerald-600"></span>
                  <span class="text-xs text-slate-400">/</span>
                  <span id="resMissedClasses" class="text-lg font-bold text-rose-500"></span>
                </div>
                <span class="text-[11px] text-slate-500">Attended vs Absent</span>
              </div>
            </div>

            <!-- TARGET ROADMAP MATRIX: 75%, 85%, 90%, 95% -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
                <div>
                  <h5 class="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    🎯 Attendance Milestone Roadmap
                    <span class="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Stat Calculator</span>
                  </h5>
                  <p class="text-xs text-slate-500 mt-0.5">Classes you must attend consecutively to reach or sustain each percentage milestone</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" id="targetRoadmapGrid">
                <!-- Rendered dynamically -->
              </div>
            </div>

            <!-- Subject-wise Table Card -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h5 class="text-xs font-bold uppercase tracking-wider text-slate-700">Subject-wise Attendance Table</h5>
                <span id="subjectCountBadge" class="text-[11px] font-semibold text-slate-500"></span>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th class="py-2.5 px-3 text-center w-10">#</th>
                      <th class="py-2.5 px-3">Subject Name</th>
                      <th class="py-2.5 px-3 text-center">Held</th>
                      <th class="py-2.5 px-3 text-center">Attended</th>
                      <th class="py-2.5 px-3 text-right">Percentage</th>
                      <th class="py-2.5 px-3 w-28">Progress</th>
                    </tr>
                  </thead>
                  <tbody id="resSubjectsTableBody" class="divide-y divide-slate-100 text-slate-700 font-medium"></tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- TAB 2: VISUAL SUBJECT GRAPHS -->
          <div id="tabContentGraphs" class="tab-pane hidden space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h5 class="text-sm font-extrabold text-slate-900 tracking-tight">Subject Attendance Visual Comparison</h5>
                  <p class="text-xs text-slate-500">Visual progress meter against the 75% university eligibility line</p>
                </div>
                <div class="flex items-center gap-3 text-[11px] font-semibold">
                  <span class="flex items-center gap-1 text-emerald-700"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> ≥75% Safe</span>
                  <span class="flex items-center gap-1 text-amber-700"><span class="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> 65-74% Alert</span>
                  <span class="flex items-center gap-1 text-rose-700"><span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> &lt;65% Critical</span>
                </div>
              </div>

              <!-- Graphs Container -->
              <div id="subjectGraphsContainer" class="space-y-4 pt-2">
                <!-- Dynamically rendered horizontal bars with 75% red marker -->
              </div>
            </div>
          </div>

          <!-- TAB 3: WHAT-IF ATTENDANCE PLANNER SIMULATOR -->
          <div id="tabContentSimulator" class="tab-pane hidden space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div>
                <h5 class="text-sm font-extrabold text-slate-900 tracking-tight">🧮 Interactive Attendance Planner</h5>
                <p class="text-xs text-slate-500 mt-0.5">Test future scenarios: See how attending or missing future classes impacts your final percentage</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <!-- Attend Future Classes Slider -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span class="flex items-center gap-1.5 text-emerald-700">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Next Classes I Attend:
                    </span>
                    <span id="simAttendVal" class="text-sm font-extrabold text-emerald-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">10 classes</span>
                  </div>
                  <input type="range" id="simAttendSlider" min="0" max="60" value="10" class="w-full accent-emerald-600 cursor-pointer">
                  <div class="flex justify-between text-[10px] text-slate-400">
                    <span>0</span>
                    <span>15</span>
                    <span>30</span>
                    <span>45</span>
                    <span>60 classes</span>
                  </div>
                </div>

                <!-- Miss Future Classes Slider -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span class="flex items-center gap-1.5 text-rose-700">
                      <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                      Next Classes I Miss:
                    </span>
                    <span id="simMissVal" class="text-sm font-extrabold text-rose-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">0 classes</span>
                  </div>
                  <input type="range" id="simMissSlider" min="0" max="30" value="0" class="w-full accent-rose-600 cursor-pointer">
                  <div class="flex justify-between text-[10px] text-slate-400">
                    <span>0</span>
                    <span>10</span>
                    <span>20</span>
                    <span>30 classes</span>
                  </div>
                </div>
              </div>

              <!-- Projected Result Box -->
              <div id="simResultBox" class="p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Projected Attendance</span>
                  <div class="flex items-baseline gap-2 mt-1">
                    <span id="simNewPct" class="text-4xl font-black"></span>
                    <span id="simPctDelta" class="text-xs font-bold px-2 py-0.5 rounded-full"></span>
                  </div>
                  <p id="simFormulaText" class="text-xs text-slate-500 mt-1 font-mono"></p>
                </div>
                <div id="simBadgeContainer" class="self-start sm:self-auto"></div>
              </div>
            </div>
          </div>

          <!-- TAB 4: STUDENT GOAL POLL -->
          <div id="tabContentPoll" class="tab-pane hidden space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h5 class="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    🗳️ Student Attendance Goal Poll
                    <span class="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Community Voice</span>
                  </h5>
                  <p class="text-xs text-slate-500 mt-0.5">What is your personal target for this semester? Vote and see where your batchmates stand!</p>
                </div>
                <span id="totalVotesCountBadge" class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg"></span>
              </div>

              <div id="pollOptionsContainer" class="space-y-3">
                <!-- Dynamically rendered poll voting cards -->
              </div>

              <p class="text-[11px] text-slate-400 text-center">💡 Voting is anonymous and reflects peer trends across VIPT pharmacy batches.</p>
            </div>
          </div>

          <!-- Switch User Button -->
          <div class="flex justify-between items-center pt-2">
            <button id="switchUserBtn" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Check another student</span>
            </button>
            <span id="resTimestamp" class="text-[11px] text-slate-400"></span>
          </div>

        </div>

      </div>

    </div>
  `;
  document.body.appendChild(modalContainer);

  // References
  const formSection = document.getElementById('attendanceFormSection');
  const resultSection = document.getElementById('attendanceResultSection');
  const tabsNav = document.getElementById('attendanceTabsNav');
  const form = document.getElementById('attendanceForm');
  const rollInput = document.getElementById('attRollNo');
  const pwdInput = document.getElementById('attPassword');
  const rememberCheckbox = document.getElementById('attRememberMe');
  const errorContainer = document.getElementById('attendanceErrorMsg');
  const errorText = document.getElementById('attendanceErrorText');
  const submitBtn = document.getElementById('submitAttendanceBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const togglePwdBtn = document.getElementById('togglePasswordBtn');
  const closeModalBtn = document.getElementById('closeAttendanceModal');
  const switchUserBtn = document.getElementById('switchUserBtn');
  const refreshBtn = document.getElementById('refreshAttendanceBtn');
  const printBtn = document.getElementById('printAttendanceBtn');

  // Simulator elements
  const simAttendSlider = document.getElementById('simAttendSlider');
  const simMissSlider = document.getElementById('simMissSlider');
  const simAttendVal = document.getElementById('simAttendVal');
  const simMissVal = document.getElementById('simMissVal');
  const simNewPct = document.getElementById('simNewPct');
  const simPctDelta = document.getElementById('simPctDelta');
  const simFormulaText = document.getElementById('simFormulaText');
  const simResultBox = document.getElementById('simResultBox');
  const simBadgeContainer = document.getElementById('simBadgeContainer');

  // Cached active attendance data
  let activeAttendanceData = null;

  // Load saved credentials
  const savedRoll = localStorage.getItem('anim_att_roll');
  const savedPwd = localStorage.getItem('anim_att_pwd');
  if (savedRoll) {
    rollInput.value = savedRoll;
    if (savedPwd) {
      pwdInput.value = savedPwd;
      rememberCheckbox.checked = true;
    }
  }

  // Toggle Password
  togglePwdBtn.addEventListener('click', () => {
    const isPwd = pwdInput.type === 'password';
    pwdInput.type = isPwd ? 'text' : 'password';
    togglePwdBtn.innerHTML = isPwd
      ? `<svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
         </svg>`
      : `<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
         </svg>`;
  });

  // Modal Controls
  function openModal(prefillRoll = null, prefillPwd = null) {
    modalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (prefillRoll) rollInput.value = prefillRoll.trim().toUpperCase();
    if (prefillPwd) pwdInput.value = prefillPwd.trim();

    if (!rollInput.value) {
      const pageSearchInput = document.querySelector('input[placeholder*="Roll"]');
      if (pageSearchInput && pageSearchInput.value && /25AC/i.test(pageSearchInput.value)) {
        rollInput.value = pageSearchInput.value.toUpperCase();
      }
    }
  }

  function closeModal() {
    modalContainer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  closeModalBtn.addEventListener('click', closeModal);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
      closeModal();
    }
  });

  switchUserBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    tabsNav.classList.add('hidden');
    formSection.classList.remove('hidden');
    errorContainer.classList.add('hidden');
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Tab switching
  const tabButtons = document.querySelectorAll('.att-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      tabButtons.forEach(b => {
        b.className = 'att-tab-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer';
      });
      btn.className = 'att-tab-btn px-3 py-1.5 rounded-lg bg-white text-indigo-700 shadow-2xs border border-slate-200 font-bold transition-all cursor-pointer';

      document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
      if (tabName === 'overview') document.getElementById('tabContentOverview').classList.remove('hidden');
      if (tabName === 'graphs') document.getElementById('tabContentGraphs').classList.remove('hidden');
      if (tabName === 'simulator') document.getElementById('tabContentSimulator').classList.remove('hidden');
      if (tabName === 'poll') document.getElementById('tabContentPoll').classList.remove('hidden');
    });
  });

  // Fetch Attendance Handler
  async function fetchAttendance(rollNo, password) {
    if (!rollNo || !password) {
      openModal(rollNo, password);
      return;
    }

    openModal(rollNo, password);
    formSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    tabsNav.classList.add('hidden');
    errorContainer.classList.add('hidden');
    submitBtn.disabled = true;
    btnSpinner.classList.remove('hidden');

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo: rollNo.trim().toUpperCase(), password: password.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch attendance from college portal.');
      }

      if (rememberCheckbox.checked) {
        localStorage.setItem('anim_att_roll', rollNo.trim().toUpperCase());
        localStorage.setItem('anim_att_pwd', password.trim());
      } else {
        localStorage.removeItem('anim_att_pwd');
      }

      activeAttendanceData = data;
      renderAttendance(data);
    } catch (err) {
      errorText.textContent = err.message || 'Error communicating with college portal.';
      errorContainer.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      btnSpinner.classList.add('hidden');
    }
  }

  // Render Attendance & Motivation & Targets
  function renderAttendance(data) {
    const student = data.student || {};
    const total = data.total || {};
    const subjects = data.subjects || [];

    document.getElementById('resStudentName').textContent = student.name || student.rollNo;
    document.getElementById('resRollNo').textContent = student.rollNo;
    document.getElementById('resCourseBranch').textContent = `${student.course || 'B.Pharm'} • ${student.branch || ''} • ${student.semester || ''}`;

    const pct = total.percentage;
    const isEligible = pct >= 75.0;
    const overallCard = document.getElementById('overallPctCard');
    const statusBadge = document.getElementById('resStatusBadge');
    const overallBar = document.getElementById('resOverallBar');

    document.getElementById('resOverallPct').textContent = `${pct.toFixed(2)}%`;
    document.getElementById('resHeldClasses').textContent = total.held;
    document.getElementById('resAttendedClasses').textContent = total.attended;
    document.getElementById('resMissedClasses').textContent = total.missed;

    if (isEligible) {
      overallCard.className = 'sm:col-span-2 p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white flex flex-col justify-between';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300';
      statusBadge.textContent = 'Eligible (≥ 75%)';
      overallBar.className = 'h-full rounded-full bg-emerald-500';
      overallBar.style.width = `${Math.min(100, pct)}%`;
      document.getElementById('resOverallPct').className = 'text-4xl sm:text-5xl font-black text-emerald-700 tracking-tight';
    } else {
      overallCard.className = 'sm:col-span-2 p-4 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/70 to-white flex flex-col justify-between';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300';
      statusBadge.textContent = 'Shortage (< 75%)';
      overallBar.className = 'h-full rounded-full bg-rose-500';
      overallBar.style.width = `${Math.min(100, pct)}%`;
      document.getElementById('resOverallPct').className = 'text-4xl sm:text-5xl font-black text-rose-700 tracking-tight';
    }

    // 1. DYNAMIC MOTIVATIONAL MESSAGES
    const motivationBanner = document.getElementById('motivationBanner');
    const motivationEmoji = document.getElementById('motivationEmoji');
    const motivationTitle = document.getElementById('motivationTitle');
    const motivationQuote = document.getElementById('motivationQuote');
    const motivationTip = document.getElementById('motivationTip');

    if (pct >= 90) {
      motivationBanner.className = 'p-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-white shadow-xs flex items-start gap-3.5';
      motivationEmoji.textContent = '👑';
      motivationTitle.className = 'text-sm font-extrabold text-indigo-950 tracking-tight';
      motivationTitle.textContent = 'Outstanding Academic Discipline!';
      motivationQuote.className = 'text-xs text-indigo-900/80 mt-1 leading-relaxed';
      motivationQuote.textContent = '"Success is nothing more than a few simple disciplines, practiced every day." You are maintaining elite consistency that sets you apart.';
      motivationTip.textContent = `Pro Tip: You have a comfortable buffer of ${total.safeBunks} safe classes. Keep this rhythm and focus on top exam grades!`;
    } else if (pct >= 85) {
      motivationBanner.className = 'p-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-white shadow-xs flex items-start gap-3.5';
      motivationEmoji.textContent = '🌟';
      motivationTitle.className = 'text-sm font-extrabold text-emerald-950 tracking-tight';
      motivationTitle.textContent = 'Safe, Strong & In Full Control!';
      motivationQuote.className = 'text-xs text-emerald-900/80 mt-1 leading-relaxed';
      motivationQuote.textContent = '"The secret of getting ahead is getting started." You have built a solid attendance foundation with zero exam stress.';
      motivationTip.textContent = `Goal Alert: Attend just a few more classes to break into the 90%+ Honors distinction!`;
    } else if (pct >= 75) {
      motivationBanner.className = 'p-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-white shadow-xs flex items-start gap-3.5';
      motivationEmoji.textContent = '💪';
      motivationTitle.className = 'text-sm font-extrabold text-blue-950 tracking-tight';
      motivationTitle.textContent = 'Eligible for Exams! Let\'s Strengthen Your Buffer';
      motivationQuote.className = 'text-xs text-blue-900/80 mt-1 leading-relaxed';
      motivationQuote.textContent = '"Consistency beats intensity every single time." You meet the mandatory 75% bar—aiming for 85% gives you total peace of mind.';
      motivationTip.textContent = `Smart Move: Attend the next lectures consistently to expand your safe bunks cushion.`;
    } else {
      motivationBanner.className = 'p-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/80 to-white shadow-xs flex items-start gap-3.5';
      motivationEmoji.textContent = '🔥';
      motivationTitle.className = 'text-sm font-extrabold text-amber-950 tracking-tight';
      motivationTitle.textContent = 'Comeback Mode Activated!';
      motivationQuote.className = 'text-xs text-amber-900/80 mt-1 leading-relaxed';
      motivationQuote.textContent = '"It does not matter how slowly you go as long as you do not stop." Every single class you attend starting today pulls your percentage straight up!';
      motivationTip.textContent = `Mission: Attend the next ${total.neededToReach75} consecutive classes to cross 75% and clear all shortage condonations.`;
    }

    // 2. RENDER 75%, 85%, 90%, 95% ROADMAP TARGETS
    renderTargetRoadmap(total.held, total.attended);

    // 3. RENDER SUBJECTS TABLE
    document.getElementById('subjectCountBadge').textContent = `${subjects.length} Subjects`;
    const tbody = document.getElementById('resSubjectsTableBody');
    tbody.innerHTML = '';

    subjects.forEach((subj) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition-colors';

      let barColor = 'bg-emerald-500';
      let tagColor = 'text-emerald-700 font-bold';
      if (subj.percentage < 65) {
        barColor = 'bg-rose-500';
        tagColor = 'text-rose-700 font-bold';
      } else if (subj.percentage < 75) {
        barColor = 'bg-amber-500';
        tagColor = 'text-amber-700 font-bold';
      }

      tr.innerHTML = `
        <td class="py-2.5 px-3 text-center font-mono text-slate-400">${subj.sno}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-800">${subj.name}</td>
        <td class="py-2.5 px-3 text-center text-slate-600">${subj.held}</td>
        <td class="py-2.5 px-3 text-center text-slate-800 font-semibold">${subj.attended}</td>
        <td class="py-2.5 px-3 text-right font-mono ${tagColor}">${subj.percentage.toFixed(2)}%</td>
        <td class="py-2.5 px-3">
          <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div class="h-full rounded-full ${barColor}" style="width: ${Math.min(100, subj.percentage)}%"></div>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // 4. RENDER VISUAL GRAPHS TAB
    renderSubjectGraphs(subjects);

    // 5. UPDATE SIMULATOR
    updateSimulator();

    // 6. RENDER POLL
    renderPoll();

    document.getElementById('resTimestamp').textContent = `Updated: ${data.timestamp || 'Just now'}`;

    formSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    tabsNav.classList.remove('hidden');
  }

  // 75%, 85%, 90%, 95% Target Calculations
  function renderTargetRoadmap(held, attended) {
    const grid = document.getElementById('targetRoadmapGrid');
    grid.innerHTML = '';

    const targets = [
      { target: 75, label: '75% Pass Bar', sub: 'Mandatory Exam Level', color: 'emerald', icon: '🛡️' },
      { target: 85, label: '85% Solid Guard', sub: 'Stress-free Buffer', color: 'blue', icon: '🎯' },
      { target: 90, label: '90% Distinction', sub: 'Honors Academic Level', color: 'indigo', icon: '⭐' },
      { target: 95, label: '95% Gold Star', sub: 'Elite Attendance', color: 'purple', icon: '👑' }
    ];

    targets.forEach(t => {
      const p = t.target / 100.0;
      const currentPct = (attended / held) * 100;
      const card = document.createElement('div');

      if (currentPct >= t.target) {
        // Target achieved - Calculate safe bunks buffer
        const safeBunks = Math.max(0, Math.floor((attended / p) - held));
        card.className = `p-4 rounded-xl border border-${t.color}-200 bg-gradient-to-b from-${t.color}-50/50 to-white flex flex-col justify-between`;
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between">
              <span class="text-base">${t.icon}</span>
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Achieved ✓</span>
            </div>
            <h6 class="text-xs font-black uppercase tracking-wider text-slate-800 mt-2">${t.label}</h6>
            <p class="text-[11px] text-slate-500">${t.sub}</p>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100">
            <span class="text-2xl font-black text-emerald-700">${safeBunks}</span>
            <span class="text-xs font-semibold text-slate-600 ml-1">bunks safe</span>
            <p class="text-[10px] text-slate-500 mt-0.5">You can miss up to ${safeBunks} classes & remain above ${t.target}%</p>
          </div>
        `;
      } else {
        // Target not yet achieved - Calculate consecutive classes to attend
        // (attended + X) / (held + X) >= p  =>  X = ceil((p*held - attended) / (1 - p))
        const needed = Math.max(1, Math.ceil((p * held - attended) / (1.0 - p)));
        const approxDays = Math.ceil(needed / 5); // Avg 5 lectures per day
        card.className = `p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between hover:border-${t.color}-300 transition-colors`;
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between">
              <span class="text-base">${t.icon}</span>
              <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Goal</span>
            </div>
            <h6 class="text-xs font-black uppercase tracking-wider text-slate-800 mt-2">${t.label}</h6>
            <p class="text-[11px] text-slate-500">${t.sub}</p>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100">
            <span class="text-2xl font-black text-indigo-700">+${needed}</span>
            <span class="text-xs font-semibold text-slate-600 ml-1">classes needed</span>
            <p class="text-[10px] text-indigo-600 font-medium mt-0.5">Attend next ${needed} classes consecutively (~${approxDays} days)</p>
          </div>
        `;
      }
      grid.appendChild(card);
    });
  }

  // Visual Horizontal Subject Graphs with 75% red line
  function renderSubjectGraphs(subjects) {
    const container = document.getElementById('subjectGraphsContainer');
    container.innerHTML = '';

    subjects.forEach(subj => {
      let barColor = 'bg-emerald-500';
      let textColor = 'text-emerald-700';
      if (subj.percentage < 65) {
        barColor = 'bg-rose-500';
        textColor = 'text-rose-700';
      } else if (subj.percentage < 75) {
        barColor = 'bg-amber-500';
        textColor = 'text-amber-700';
      }

      const row = document.createElement('div');
      row.className = 'space-y-1';
      row.innerHTML = `
        <div class="flex items-center justify-between text-xs font-medium">
          <span class="font-bold text-slate-800 truncate max-w-[280px] sm:max-w-md">${subj.sno}. ${subj.name}</span>
          <div class="flex items-center gap-2">
            <span class="text-slate-500 text-[11px]">(${subj.attended}/${subj.held})</span>
            <span class="font-mono font-bold ${textColor}">${subj.percentage.toFixed(1)}%</span>
          </div>
        </div>
        <!-- Bar track with 75% threshold line -->
        <div class="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/80">
          <div class="h-full rounded-full ${barColor} graph-bar-animate" style="width: ${Math.min(100, subj.percentage)}%"></div>
          <!-- 75% threshold guide marker -->
          <div class="absolute top-0 bottom-0 left-[75%] w-0.5 bg-rose-400 z-10" title="75% minimum eligibility line"></div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  // Interactive Simulator Logic
  function updateSimulator() {
    if (!activeAttendanceData || !activeAttendanceData.total) return;

    const baseHeld = activeAttendanceData.total.held;
    const baseAttended = activeAttendanceData.total.attended;

    const addAttend = parseInt(simAttendSlider.value, 10) || 0;
    const addMiss = parseInt(simMissSlider.value, 10) || 0;

    simAttendVal.textContent = `+${addAttend} classes`;
    simMissVal.textContent = `+${addMiss} classes`;

    const newAttended = baseAttended + addAttend;
    const newHeld = baseHeld + addAttend + addMiss;
    const newPct = (newAttended / newHeld) * 100;
    const originalPct = activeAttendanceData.total.percentage;
    const diff = newPct - originalPct;

    simNewPct.textContent = `${newPct.toFixed(2)}%`;
    simFormulaText.textContent = `Formula: (${newAttended} attended / ${newHeld} total classes)`;

    if (diff >= 0) {
      simPctDelta.textContent = `+${diff.toFixed(2)}% gain`;
      simPctDelta.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800';
    } else {
      simPctDelta.textContent = `${diff.toFixed(2)}% loss`;
      simPctDelta.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800';
    }

    if (newPct >= 75) {
      simResultBox.className = 'p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4';
      simNewPct.className = 'text-4xl font-black text-emerald-700';
      simBadgeContainer.innerHTML = `
        <div class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5">
          <span>✓ Safe Exam Eligibility</span>
        </div>
      `;
    } else {
      simResultBox.className = 'p-5 rounded-2xl border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4';
      simNewPct.className = 'text-4xl font-black text-rose-700';
      simBadgeContainer.innerHTML = `
        <div class="px-4 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5">
          <span>⚠️ Shortage Risk</span>
        </div>
      `;
    }
  }

  simAttendSlider.addEventListener('input', updateSimulator);
  simMissSlider.addEventListener('input', updateSimulator);

  // Student Community Poll Logic
  function getPollVotes() {
    try {
      const stored = localStorage.getItem(POLL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultPollVotes;
    } catch {
      return defaultPollVotes;
    }
  }

  function savePollVotes(votes) {
    try {
      localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(votes));
    } catch {}
  }

  function renderPoll() {
    const container = document.getElementById('pollOptionsContainer');
    container.innerHTML = '';
    const votes = getPollVotes();
    const myVote = localStorage.getItem('anim_user_my_goal_vote');
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

    document.getElementById('totalVotesCountBadge').textContent = `${totalVotes} Student Votes`;

    const pollOptions = [
      { key: '75', label: '75% Survival Minimum', desc: 'Just enough to clear condonation & sit for exams', icon: '🛡️' },
      { key: '85', label: '85% Balanced & Safe', desc: 'Cushion for personal days with solid attendance', icon: '🎯' },
      { key: '90', label: '90% Academic Honors', desc: 'Targeting faculty recommendation & distinction', icon: '⭐' },
      { key: '95', label: '95%+ Hall of Fame', desc: 'Never miss a theory or lab session', icon: '👑' }
    ];

    pollOptions.forEach(opt => {
      const count = votes[opt.key] || 0;
      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      const isSelected = myVote === opt.key;

      const card = document.createElement('div');
      card.className = `p-3.5 rounded-xl border ${isSelected ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200' : 'border-slate-200 bg-white hover:border-slate-300'} transition-all cursor-pointer`;
      card.innerHTML = `
        <div class="flex items-center justify-between text-xs mb-1.5">
          <div class="flex items-center gap-2">
            <span class="text-base">${opt.icon}</span>
            <span class="font-bold text-slate-900">${opt.label}</span>
            ${isSelected ? '<span class="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded">Your Goal</span>' : ''}
          </div>
          <div class="flex items-center gap-2 font-mono font-bold text-slate-700">
            <span>${pct}%</span>
            <span class="text-[11px] text-slate-400">(${count})</span>
          </div>
        </div>
        <p class="text-[11px] text-slate-500 mb-2">${opt.desc}</p>
        <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
          <div class="h-full rounded-full ${isSelected ? 'bg-indigo-600' : 'bg-slate-400'} graph-bar-animate" style="width: ${pct}%"></div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (myVote === opt.key) return;
        const currentVotes = getPollVotes();
        if (myVote && currentVotes[myVote]) {
          currentVotes[myVote] = Math.max(0, currentVotes[myVote] - 1);
        }
        currentVotes[opt.key] = (currentVotes[opt.key] || 0) + 1;
        savePollVotes(currentVotes);
        localStorage.setItem('anim_user_my_goal_vote', opt.key);
        renderPoll();
      });

      container.appendChild(card);
    });
  }

  // Refresh current attendance
  refreshBtn.addEventListener('click', () => {
    if (rollInput.value && pwdInput.value) {
      fetchAttendance(rollInput.value, pwdInput.value);
    }
  });

  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fetchAttendance(rollInput.value, pwdInput.value);
  });

  // INJECT PASSWORD BLANK BELOW ROLL NUMBER ON THE PAGE
  function injectPasswordBlankBelowRollNumber() {
    const pageRollInput = document.querySelector('input[placeholder*="Roll Number"]');
    if (!pageRollInput) return;

    const rollCard = pageRollInput.closest('.rounded-2xl');
    if (!rollCard) return;

    if (document.getElementById('heroPasswordWrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'heroPasswordWrapper';
    wrapper.className = 'mt-3 space-y-2';
    wrapper.innerHTML = `
      <div class="p-2 sm:p-2.5 bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-100/80 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100/60 transition-all flex items-center gap-2">
        <div class="pl-3 text-slate-400 shrink-0">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #059669 !important;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <input type="password" id="heroPasswordInput" placeholder="Enter Portal Password" class="w-full min-w-0 py-2.5 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none font-mono tracking-wide" autocomplete="off" spellcheck="false">
        <button type="button" id="heroTogglePwdBtn" class="p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-0 outline-none transition-colors cursor-pointer shrink-0" title="Show/Hide Password">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </button>
        <button type="button" id="heroCheckAttendanceBtn" class="btn-attendance-emerald inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white rounded-xl shadow-md transition-all shrink-0 cursor-pointer" style="background-color: #059669 !important; color: #ffffff !important; border: 0 !important; outline: none !important;">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="#ffffff" stroke-width="2.5" viewBox="0 0 24 24" style="color: #ffffff !important;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span class="whitespace-nowrap font-bold text-white" style="color: #ffffff !important;">Check Attendance</span>
        </button>
      </div>
      <div class="px-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>🔒 Secure WebPros portal login</span>
        <button type="button" id="heroOpenDetailsLink" class="text-indigo-600 hover:text-indigo-800 underline cursor-pointer">Detailed Attendance & Goals →</button>
      </div>
    `;

    rollCard.insertAdjacentElement('afterend', wrapper);

    const heroPwdInput = document.getElementById('heroPasswordInput');
    const heroToggleBtn = document.getElementById('heroTogglePwdBtn');
    const heroCheckBtn = document.getElementById('heroCheckAttendanceBtn');
    const heroOpenDetailsLink = document.getElementById('heroOpenDetailsLink');

    if (savedPwd) {
      heroPwdInput.value = savedPwd;
    }

    heroToggleBtn.addEventListener('click', () => {
      const isPwd = heroPwdInput.type === 'password';
      heroPwdInput.type = isPwd ? 'text' : 'password';
      heroToggleBtn.innerHTML = isPwd
        ? `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
           </svg>`
        : `<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
           </svg>`;
    });

    heroCheckBtn.addEventListener('mouseenter', () => {
      heroCheckBtn.style.setProperty('background-color', '#047857', 'important');
    });
    heroCheckBtn.addEventListener('mouseleave', () => {
      heroCheckBtn.style.setProperty('background-color', '#059669', 'important');
    });

    heroCheckBtn.addEventListener('click', () => {
      const roll = pageRollInput.value || rollInput.value;
      const pwd = heroPwdInput.value || pwdInput.value;
      if (!roll) {
        pageRollInput.focus();
        return;
      }
      if (!pwd) {
        heroPwdInput.focus();
        return;
      }
      fetchAttendance(roll, pwd);
    });

    heroPwdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        heroCheckBtn.click();
      }
    });

    heroPwdInput.addEventListener('input', () => {
      pwdInput.value = heroPwdInput.value;
    });

    heroOpenDetailsLink.addEventListener('click', () => {
      openModal(pageRollInput.value, heroPwdInput.value);
    });
  }

  // INJECT ATTENDANCE BUTTON INTO NAVBAR
  function injectNavElements() {
    // Cleanly place Live Attendance button in header right action container
    const headerRightContainer = document.querySelector('header .max-w-6xl > div:last-child') || document.querySelector('header nav');
    if (headerRightContainer && !document.getElementById('navAttendanceBtn')) {
      const navBtn = document.createElement('button');
      navBtn.id = 'navAttendanceBtn';
      navBtn.className = 'btn-attendance-emerald px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer';
      navBtn.setAttribute('style', 'background-color: #059669 !important; color: #ffffff !important; border: 0 !important; outline: none !important;');
      navBtn.innerHTML = `
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="#ffffff" stroke-width="2.5" viewBox="0 0 24 24" style="color: #ffffff !important;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="whitespace-nowrap font-bold" style="color: #ffffff !important;">Live Attendance</span>
      `;
      navBtn.addEventListener('mouseenter', () => {
        navBtn.style.setProperty('background-color', '#047857', 'important');
      });
      navBtn.addEventListener('mouseleave', () => {
        navBtn.style.setProperty('background-color', '#059669', 'important');
      });
      navBtn.addEventListener('click', () => {
        const pageRollInput = document.querySelector('input[placeholder*="Roll Number"]');
        const heroPwdInput = document.getElementById('heroPasswordInput');
        openModal(pageRollInput ? pageRollInput.value : null, heroPwdInput ? heroPwdInput.value : null);
      });
      headerRightContainer.prepend(navBtn);
    }

    injectPasswordBlankBelowRollNumber();
  }

  const observer = new MutationObserver(() => {
    injectPasswordBlankBelowRollNumber();
  });

  const rootEl = document.getElementById('root') || document.body;
  observer.observe(rootEl, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavElements);
  } else {
    injectNavElements();
  }
  setTimeout(injectNavElements, 300);
  setTimeout(injectNavElements, 1000);
  setTimeout(injectNavElements, 2500);

  window.openAttendanceModal = openModal;
})();
