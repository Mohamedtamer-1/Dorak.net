// EmailJS Configuration - Replace with your actual values
const EMAILJS_CONFIG = {
  serviceId: "service_l62avrt", // Your actual Service ID
  templateId: "template_wodrdhb", // Your template ID
  publicKey: "48UXqCoHHV2pt15nc", // Your public key
}

// Global variables
const selectedCompany = ""
const selectedBranch = ""
let currentAdmin = null

// Language Management
let currentLanguage = localStorage.getItem("language") || "en"

// Theme Management
let currentTheme = localStorage.getItem("theme") || "light"

// Enhanced Scroll Management for Auto-Hide Header
let lastScrollTop = 0
const scrollThreshold = 50
let isScrolling = false
let headerHeight = 0
let scrollTimer = null

// Toast Notification System
let toastContainer = null

// Admin credentials
const adminCredentials = {
  Water1Egypt: { password: "1234w", company: "water" },
  Electricity1Egypt: { password: "1234e", company: "electricity" },
  Test1Egypt: { password: "1234t", company: "test" },
  Telecom1Egypt: { password: "1234c", company: "telecom" },
  Gas1Egypt: { password: "1234g", company: "gas" },
  Internet1Egypt: { password: "1234i", company: "internet" },
}

// Initialize EmailJS when the script loads
function initializeEmailJS() {
  if (window.emailjs) {
    try {
      emailjs.init(EMAILJS_CONFIG.publicKey)
      console.log('✅ EmailJS initialized successfully')
      return true
    } catch (error) {
      console.error('❌ EmailJS initialization failed:', error)
      return false
    }
  } else {
    console.warn('⚠️ EmailJS library not loaded yet')
    return false
  }
}

// Test EmailJS connection
function testEmailJSConnection() {
  return new Promise((resolve) => {
    if (!window.emailjs) {
      console.log('❌ EmailJS not available')
      resolve({ available: false, message: 'EmailJS library not loaded' })
      return
    }
    
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
      console.log('❌ EmailJS not configured')
      resolve({ available: false, message: 'EmailJS not configured' })
      return
    }
    
    // Try to initialize if not already done
    if (!window.emailjs.isInitialized) {
      try {
        emailjs.init(EMAILJS_CONFIG.publicKey)
        window.emailjs.isInitialized = true
        console.log('✅ EmailJS initialized for testing')
      } catch (error) {
        console.log('❌ EmailJS initialization failed for testing:', error)
        resolve({ available: false, message: 'EmailJS initialization failed' })
        return
      }
    }
    
    console.log('✅ EmailJS connection test passed')
    resolve({ available: true, message: 'EmailJS ready' })
  })
}

// Utility functions
function goHome() {
  window.location.href = "index.html"
}

function startBooking() {
  window.location.href = "companies.html"
}

function bookAnother() {
  window.location.href = "companies.html"
}

function refreshStatus() {
  const refreshBtn = document.querySelector(".refresh-btn")
  if (refreshBtn) {
    refreshBtn.style.pointerEvents = "none"
    refreshBtn.style.transform = "rotate(360deg)"

    showToast("Refreshing", "Updating queue status...", "info", 2000)

    setTimeout(() => {
      refreshBtn.style.transform = "rotate(0deg)"
      refreshBtn.style.pointerEvents = "auto"
      updateQueueNumbers()
      showToast("Updated", "Queue status refreshed", "success", 2000)
    }, 1000)
  }
}

// Enhanced Status Updates with Real-time Feel
function updateQueueNumbers() {
  const currentServing = document.getElementById("currentServing")
  const yourNumber = document.getElementById("yourNumber")
  const peopleAhead = document.getElementById("peopleAhead")
  const estimatedWait = document.getElementById("estimatedWait")

  if (currentServing && yourNumber) {
    const current = Number.parseInt(currentServing.textContent)
    const your = Number.parseInt(yourNumber.textContent)

    // Animate number change
    const newCurrent = current + Math.floor(Math.random() * 3)
    animateNumberChange(currentServing, current, newCurrent)

    const ahead = Math.max(0, your - newCurrent)
    const wait = ahead * 10 // 10 minutes per person

    if (peopleAhead) animateNumberChange(peopleAhead, Number.parseInt(peopleAhead.textContent), ahead)
    if (estimatedWait) estimatedWait.textContent = wait

    // Show notification if it's almost your turn
    if (ahead <= 3 && ahead > 0) {
      showToast("Almost Your Turn!", `Only ${ahead} people ahead of you`, "warning")
    } else if (ahead === 0) {
      showToast("Your Turn!", "Please proceed to the service counter", "success")
      if (window.showConfetti) {
        window.showConfetti()
      }
    }
  }
}

function animateNumberChange(element, from, to) {
  const duration = 1000
  const startTime = performance.now()

  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const current = Math.round(from + (to - from) * progress)
    element.textContent = current

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// Enhanced Search with Debouncing
function setupSearch() {
  const searchInput = document.getElementById("branchSearch")
  if (searchInput) {
    let searchTimeout
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase()
        filterBranches(searchTerm)

        const visibleBranches = document.querySelectorAll('.branch-card:not([style*="display: none"])').length
        showToast("Search Results", `Found ${visibleBranches} branches`, "info", 2000)
      }, 300)
    })
  }
}

function filterByGovernorate(governorate) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  const branches = document.querySelectorAll(".branch-card")
  branches.forEach((branch) => {
    const branchGovernorate = branch.dataset.governorate
    if (governorate === "all" || branchGovernorate === governorate) {
      branch.style.display = "block"
    } else {
      branch.style.display = "none"
    }
  })
}

function filterBranches(searchTerm) {
  const branches = document.querySelectorAll(".branch-card")
  branches.forEach((branch) => {
    const branchName = branch.querySelector("h4").textContent.toLowerCase()
    const branchLocation = branch.querySelector("p").textContent.toLowerCase()

    if (branchName.includes(searchTerm) || branchLocation.includes(searchTerm)) {
      branch.style.display = "block"
    } else {
      branch.style.display = "none"
    }
  })
}

// Form validation
function validateNationalId(id) {
  return id && id.length === 14 && /^\d{14}$/.test(id)
}

function validatePhoneNumber(phone) {
  return phone && /^01[0-9]{9}$/.test(phone)
}

function validateEmail(email) {
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// REAL Email sending function using EmailJS
function sendConfirmationEmail(bookingData) {
  return new Promise((resolve, reject) => {
    console.log("📧 Starting email sending process...")
    console.log("EmailJS available:", !!window.emailjs)
    console.log("EmailJS initialized:", window.emailjs?.isInitialized)
    console.log("EmailJS config:", EMAILJS_CONFIG)
    
    // Check if EmailJS is loaded and configured
    if (!window.emailjs) {
      console.error("EmailJS library not loaded")
      reject(new Error("EmailJS library not loaded"))
      return
    }

    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
      console.error("EmailJS not configured properly")
      reject(new Error("Email service not configured"))
      return
    }

    // Initialize EmailJS if not already done
    if (!window.emailjs.isInitialized) {
      try {
        console.log("🔄 Initializing EmailJS...")
        emailjs.init(EMAILJS_CONFIG.publicKey)
        window.emailjs.isInitialized = true
        console.log('✅ EmailJS initialized during email sending')
      } catch (error) {
        console.error('❌ EmailJS initialization failed during email sending:', error)
        reject(error)
        return
      }
    }

    // Prepare email template parameters
    const templateParams = {
      to_email: bookingData.email,
      to_name: bookingData.fullName,
      queue_number: bookingData.queueNumber,
      service_type: bookingData.serviceType,
      company_name: bookingData.companyName,
      branch_name: bookingData.branchName,
      branch_address: bookingData.branchAddress || "N/A",
      phone_number: bookingData.phoneNumber,
      national_id: bookingData.nationalId,
      booking_time: bookingData.bookingTime,
      estimated_wait: bookingData.waitingTime,
      current_number: bookingData.currentNumber || "N/A",
      people_waiting: bookingData.peopleWaiting || "N/A",
    }

    console.log("📧 Sending email with params:", templateParams)
    console.log("Using service ID:", EMAILJS_CONFIG.serviceId)
    console.log("Using template ID:", EMAILJS_CONFIG.templateId)
    console.log("Using public key:", EMAILJS_CONFIG.publicKey)

    // Send email using EmailJS
    window.emailjs
      .send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams, EMAILJS_CONFIG.publicKey)
      .then(
        (response) => {
          console.log("✅ Email sent successfully:", response.status, response.text)
          resolve(true)
        },
        (error) => {
          console.error("❌ Failed to send email:", error)
          console.error("Error details:", {
            status: error.status,
            text: error.text,
            message: error.message,
            stack: error.stack
          })
          reject(error)
        },
      )
  })
}

// Enhanced Form Submission with REAL Email functionality
function handleBookingSubmission(e) {
  console.log("=== BOOKING SUBMISSION STARTED ===")
  console.log("Event object:", e)
  console.log("Event target:", e.target)

  try {
    e.preventDefault()
    e.stopPropagation()

    console.log("Form submission prevented, processing booking...")

    const form = e.target
    const submitBtn = form.querySelector(".submit-btn")

    if (!submitBtn) {
      console.error("Submit button not found")
      return
    }

    console.log("Submit button found:", submitBtn)

    const formData = new FormData(form)
    const bookingFormData = {
      fullName: formData.get("fullName")?.trim(),
      nationalId: formData.get("nationalId")?.trim(),
      phoneNumber: formData.get("phoneNumber")?.trim(),
      email: formData.get("email")?.trim(),
      serviceType: formData.get("serviceType")?.trim(),
    }

    console.log("Form data captured:", bookingFormData)

    if (typeof window.currentLanguage === "undefined") {
      window.currentLanguage = localStorage.getItem("language") || "en"
    }
    const currentLanguage = window.currentLanguage

    console.log("Current language:", currentLanguage)

    setLoadingState(submitBtn, true)

    const validationErrors = []

    if (!bookingFormData.fullName || bookingFormData.fullName.length < 2) {
      validationErrors.push(currentLanguage === "ar" ? "يرجى إدخال الاسم الكامل" : "Please enter your full name")
    }

    if (!validateNationalId(bookingFormData.nationalId)) {
      validationErrors.push(
        currentLanguage === "ar"
          ? "يرجى إدخال رقم هوية صحيح مكون من 14 رقماً"
          : "Please enter a valid 14-digit National ID",
      )
    }

    if (!validatePhoneNumber(bookingFormData.phoneNumber)) {
      validationErrors.push(
        currentLanguage === "ar" ? "يرجى إدخال رقم هاتف مصري صحيح" : "Please enter a valid Egyptian phone number",
      )
    }

    if (!validateEmail(bookingFormData.email)) {
      validationErrors.push(
        currentLanguage === "ar" ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address",
      )
    }

    if (!bookingFormData.serviceType) {
      validationErrors.push(currentLanguage === "ar" ? "يرجى اختيار نوع الخدمة" : "Please select a service type")
    }

    if (validationErrors.length > 0) {
      console.log("Validation errors:", validationErrors)
      showToast(currentLanguage === "ar" ? "خطأ في التحقق" : "Validation Error", validationErrors[0], "error")
      setLoadingState(submitBtn, false)
      return
    }

    console.log("Form validation passed, processing booking...")

    processBooking(bookingFormData, submitBtn)
  } catch (error) {
    console.error("Error in handleBookingSubmission:", error)
    console.error("Error stack:", error.stack)

    const currentLanguage = window.currentLanguage || localStorage.getItem("language") || "en"

    showToast(
      currentLanguage === "ar" ? "خطأ" : "Error",
      currentLanguage === "ar" ? "حدث خطأ غير متوقع" : "An unexpected error occurred",
      "error",
    )

    const submitBtn = document.querySelector(".submit-btn")
    if (submitBtn) {
      setLoadingState(submitBtn, false)
    }
  }
}

async function processBooking(formData, submitBtn) {
  try {
    // Get selection data
    const companyId = localStorage.getItem("selectedCompany")
    const branchId = localStorage.getItem("selectedBranch")

    console.log("Retrieved selection data:", { companyId, branchId })

    if (!companyId || !branchId) {
      throw new Error("Missing selection data")
    }

    // Load company and branch data
    if (!window.companies) {
      window.companies = loadCompaniesData()
    }

    const company = window.companies[companyId]
    const branch = company ? company.branches.find((b) => b.id == branchId) : null

    if (!company || !branch) {
      throw new Error("Invalid selection data")
    }

    const queueNumber = branch.currentNumber + branch.waiting + 1
    const waitingTime = branch.waiting * 10 // 10 minutes per person
    const currentTime = new Date()

    const bookingData = {
      ...formData,
      queueNumber,
      waitingTime,
      bookingTime: currentTime.toLocaleString(),
      bookingId: `DRK-${Date.now()}`,
      company: companyId,
      branch: branchId,
      companyName: currentLanguage === "ar" ? company.nameAr : company.name,
      branchName: currentLanguage === "ar" ? branch.nameAr : branch.name,
      branchAddress: `${branch.address}, ${branch.governorate}`,
      currentNumber: branch.currentNumber,
      peopleWaiting: branch.waiting,
      estimatedTime: currentTime.getTime() + waitingTime * 60000,
    }

    console.log("Booking data created:", bookingData)

    // Save booking data to localStorage first
    localStorage.setItem("bookingData", JSON.stringify(bookingData))
    console.log("Booking data saved to localStorage")

    // Update branch waiting count
    branch.waiting += 1
    saveCompaniesData()

    // Show initial success message
    showToast(
      currentLanguage === "ar" ? "نجح!" : "Success!",
      currentLanguage === "ar" ? "تم تأكيد حجزك بنجاح" : "Your booking has been confirmed successfully",
      "success",
      3000,
    )

    // Show confetti if available
    if (window.showConfetti) {
      window.showConfetti()
    }

    // Try to send email (but don't block redirect if it fails)
    let emailSent = false
    try {
      if (window.emailjs && EMAILJS_CONFIG.serviceId) {
        console.log("Attempting to send confirmation email...")

        // Test EmailJS connection first
        const emailTest = await testEmailJSConnection()
        if (!emailTest.available) {
          console.log("EmailJS not available:", emailTest.message)
          showToast(
            currentLanguage === "ar" ? "تنبيه" : "Notice",
            currentLanguage === "ar"
              ? `تم تأكيد الحجز (${emailTest.message})`
              : `Booking confirmed (${emailTest.message})`,
            "warning",
            2000,
          )
        } else {
          showToast(
            currentLanguage === "ar" ? "إرسال البريد" : "Sending Email",
            currentLanguage === "ar" ? "جاري إرسال بريد التأكيد..." : "Sending confirmation email...",
            "info",
            2000,
          )

          await sendConfirmationEmail(bookingData)
          emailSent = true

          showToast(
            currentLanguage === "ar" ? "تم إرسال البريد!" : "Email Sent!",
            currentLanguage === "ar"
              ? `تم إرسال بريد التأكيد إلى ${formData.email}`
              : `Confirmation email sent to ${formData.email}`,
            "success",
            3000,
          )
        }
      } else {
        console.log("EmailJS not available, skipping email")
        showToast(
          currentLanguage === "ar" ? "تنبيه" : "Notice",
          currentLanguage === "ar"
            ? "تم تأكيد الحجز (البريد الإلكتروني غير متاح)"
            : "Booking confirmed (email service unavailable)",
          "warning",
          2000,
        )
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      showToast(
        currentLanguage === "ar" ? "تحذير البريد" : "Email Warning",
        currentLanguage === "ar"
          ? "تم تأكيد الحجز ولكن فشل إرسال البريد الإلكتروني"
          : "Booking confirmed but email could not be sent",
        "error",
        3000,
      )
    }

    console.log("Booking process completed successfully, redirecting to status page...")

    // Always redirect to status page after a short delay
    setTimeout(
      () => {
        console.log("Redirecting to status.html...")
        // Ensure we're on the correct page before redirecting
        if (window.location.pathname.includes('booking.html')) {
          window.location.href = "status.html"
        } else {
          console.log("Not on booking page, using window.open or location.replace")
          try {
            window.location.replace("status.html")
          } catch (redirectError) {
            console.error("Redirect failed, trying alternative method:", redirectError)
            window.open("status.html", "_self")
          }
        }
      },
      emailSent ? 3500 : 2500,
    ) // Longer delay if email was sent to show success message
  } catch (error) {
    console.error("Error in booking process:", error)
    showToast(
      currentLanguage === "ar" ? "خطأ" : "Error",
      currentLanguage === "ar"
        ? "حدث خطأ أثناء معالجة حجزك. يرجى المحاولة مرة أخرى."
        : "An error occurred while processing your booking. Please try again.",
      "error",
      5000,
    )
  } finally {
    setLoadingState(submitBtn, false)
  }
}

// Enhanced Scroll Management for Auto-Hide Header
function toggleHeaderVisibility() {
  const header = document.querySelector(".header")
  if (!header) return

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  if (scrollTop > scrollThreshold) {
    header.classList.add("header-hidden")
    header.classList.remove("header-visible")
  } else {
    header.classList.remove("header-hidden")
    header.classList.add("header-visible")
  }
}

// Theme Management
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light"
  document.documentElement.setAttribute("data-theme", currentTheme)
  localStorage.setItem("theme", currentTheme)
  updateThemeToggle()

  // Add smooth transition effect
  document.body.style.transition = "all 0.3s ease"
  setTimeout(() => {
    document.body.style.transition = ""
  }, 300)

  // Show toast notification
  showToast("Theme Changed", `Switched to ${currentTheme} mode`, "success", 2000)
}

function updateThemeToggle() {
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    const sunIcon = themeToggle.querySelector(".fa-sun")
    const moonIcon = themeToggle.querySelector(".fa-moon")

    if (currentTheme === "dark") {
      themeToggle.title = "Switch to light mode"
      themeToggle.setAttribute("aria-label", "Switch to light mode")
      if (sunIcon) sunIcon.style.display = "inline-block"
      if (moonIcon) moonIcon.style.display = "none"
    } else {
      themeToggle.title = "Switch to dark mode"
      themeToggle.setAttribute("aria-label", "Switch to dark mode")
      if (sunIcon) sunIcon.style.display = "none"
      if (moonIcon) moonIcon.style.display = "inline-block"
    }
  }
}

// Language Management
function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "ar" : "en"
  document.documentElement.setAttribute("data-lang", currentLanguage)
  document.documentElement.setAttribute("dir", currentLanguage === "ar" ? "rtl" : "ltr")
  document.documentElement.setAttribute("lang", currentLanguage)
  localStorage.setItem("language", currentLanguage)

  updateLanguageContent()

  // Add smooth transition effect
  document.body.style.transition = "all 0.3s ease"
  setTimeout(() => {
    document.body.style.transition = ""
  }, 300)
}

function updateLanguageContent() {
  const elements = document.querySelectorAll("[data-en][data-ar]")
  elements.forEach((element) => {
    const content = element.getAttribute(`data-${currentLanguage}`)
    if (content) {
      if (element.tagName === "INPUT" && element.type !== "submit") {
        element.placeholder = content
      } else {
        element.textContent = content
      }
    }
  })

  // Update language toggle button text
  const languageToggle = document.getElementById("languageToggle")
  if (languageToggle) {
    const langText = languageToggle.querySelector(".lang-text")
    if (langText) {
      langText.textContent = currentLanguage === "en" ? "عربي" : "English"
    }
  }
}

// Form validation
function validateField(e) {
  const field = e.target
  const value = field.value.trim()

  // Remove existing validation
  field.classList.remove("valid", "invalid")
  const existingValidation = field.parentNode.querySelector(".form-validation")
  if (existingValidation) {
    existingValidation.remove()
  }

  let isValid = true
  let message = ""

  // Validation rules with Arabic support
  switch (field.name) {
    case "fullName":
      isValid = value.length >= 2 && /^[a-zA-Z\s\u0600-\u06FF]+$/.test(value)
      message = isValid
        ? currentLanguage === "ar"
          ? "اسم صحيح"
          : "Valid name"
        : currentLanguage === "ar"
          ? "يرجى إدخال اسم صحيح (أحرف فقط)"
          : "Please enter a valid name (letters only)"
      break

    case "nationalId":
      isValid = validateNationalId(value)
      message = isValid
        ? currentLanguage === "ar"
          ? "رقم هوية صحيح"
          : "Valid National ID"
        : currentLanguage === "ar"
          ? "رقم الهوية يجب أن يكون 14 رقماً بالضبط"
          : "National ID must be exactly 14 digits"
      break

    case "phoneNumber":
      isValid = validatePhoneNumber(value)
      message = isValid
        ? currentLanguage === "ar"
          ? "رقم هاتف صحيح"
          : "Valid phone number"
        : currentLanguage === "ar"
          ? "يرجى إدخال رقم هاتف مصري صحيح"
          : "Please enter a valid Egyptian phone number"
      break

    case "email":
      isValid = validateEmail(value)
      message = isValid
        ? currentLanguage === "ar"
          ? "بريد إلكتروني صحيح"
          : "Valid email"
        : currentLanguage === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح"
          : "Please enter a valid email address"
      break

    default:
      if (field.required && !value) {
        isValid = false
        message = currentLanguage === "ar" ? "هذا الحقل مطلوب" : "This field is required"
      }
  }

  // Apply validation styling
  if (value) {
    field.classList.add(isValid ? "valid" : "invalid")

    // Add validation message
    const validationDiv = document.createElement("div")
    validationDiv.className = `form-validation ${isValid ? "valid" : "invalid"}`

    validationDiv.innerHTML = `
            <i class="fas fa-${isValid ? "check" : "times"}"></i>
            <span>${message}</span>
        `
    field.parentNode.appendChild(validationDiv)
  }

  return isValid
}

// Admin functions
function handleAdminLogin(username, password) {
  if (adminCredentials[username] && adminCredentials[username].password === password) {
    currentAdmin = adminCredentials[username].company
    localStorage.setItem("currentAdmin", currentAdmin)
    showAdminDashboard()
  } else {
    showToast("Login Failed", "Invalid username or password", "error")
  }
}

function showAdminDashboard() {
  if (currentAdmin) {
    window.location.href = "admin-dashboard.html"
  } else {
    showToast("Access Denied", "Please log in as an admin", "error")
  }
}

function adminLogout() {
  currentAdmin = null
  localStorage.removeItem("currentAdmin")
  window.location.href = "index.html"
}

function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab")
  tabs.forEach((tab) => {
    tab.style.display = tab.id === tabId ? "block" : "none"
  })
}

function updateBranchNumber(branchId, newNumber) {
  const branch = window.companies[selectedCompany].branches.find((b) => b.id == branchId)
  if (branch) {
    branch.currentNumber = newNumber
    saveCompaniesData()
    showToast("Success", "Branch number updated", "success")
  } else {
    showToast("Error", "Branch not found", "error")
  }
}

function editBranch(branchId) {
  const branch = window.companies[selectedCompany].branches.find((b) => b.id == branchId)
  if (branch) {
    // Placeholder for branch editing logic
    showToast("Success", "Branch edited", "success")
  } else {
    showToast("Error", "Branch not found", "error")
  }
}

// Export functions for global access
window.goHome = goHome
window.startBooking = startBooking
window.selectCompany = selectCompany
window.selectBranch = selectBranch
window.bookAnother = bookAnother
window.refreshStatus = refreshStatus
window.filterByGovernorate = filterByGovernorate
window.toggleTheme = toggleTheme
window.initializeTheme = initializeTheme
window.closeToast = closeToast
window.handleAdminLogin = handleAdminLogin
window.showAdminDashboard = showAdminDashboard
window.adminLogout = adminLogout
window.showTab = showTab
window.updateBranchNumber = updateBranchNumber
window.editBranch = editBranch

function initializeTheme() {
  // Get saved theme or default to light
  currentTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", currentTheme)
  updateThemeToggle()

  // Setup theme toggle with proper event listener
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    // Remove any existing listeners to prevent duplicates
    themeToggle.removeEventListener("click", toggleTheme)
    themeToggle.addEventListener("click", toggleTheme)
  }
}

function initializeLanguage() {
  // Set initial language
  document.documentElement.setAttribute("data-lang", currentLanguage)
  document.documentElement.setAttribute("dir", currentLanguage === "ar" ? "rtl" : "ltr")
  document.documentElement.setAttribute("lang", currentLanguage)

  updateLanguageContent()

  // Setup language toggle
  const languageToggle = document.getElementById("languageToggle")
  if (languageToggle) {
    languageToggle.addEventListener("click", toggleLanguage)
  }
}

function initializeFormValidation() {
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input, select")
    inputs.forEach((input) => {
      input.addEventListener("input", validateField)
      input.addEventListener("blur", validateField)
    })
  })
}

function initializeMobileNav() {
  if (window.innerWidth <= 768) {
    const mobileNav = document.createElement("div")
    mobileNav.className = "mobile-nav"
    mobileNav.innerHTML = `
            <div class="mobile-nav-items">
                <div class="mobile-nav-item" onclick="goHome()">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                </div>
                <div class="mobile-nav-item" onclick="startBooking()">
                    <i class="fas fa-plus"></i>
                    <span>Book</span>
                </div>
                <div class="mobile-nav-item" onclick="refreshStatus()">
                    <i class="fas fa-sync-alt"></i>
                    <span>Refresh</span>
                </div>
                <div class="mobile-nav-item" onclick="window.location.href='status.html'">
                    <i class="fas fa-list"></i>
                    <span>Status</span>
                </div>
            </div>
        `
    document.body.appendChild(mobileNav)
  }
}

function initializeHeaderAutoHide() {
  const header = document.querySelector(".header")
  if (!header) return

  // Get header height for calculations
  headerHeight = header.offsetHeight

  let ticking = false

  function updateHeader() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Only hide header when scrolling down and past threshold
    if (scrollTop > scrollThreshold) {
      if (scrollTop > lastScrollTop && !isScrolling) {
        // Scrolling down - hide header completely
        header.classList.add("header-hidden")
        header.classList.remove("header-visible")
      } else if (scrollTop < lastScrollTop && !isScrolling) {
        // Scrolling up - show header
        header.classList.remove("header-hidden")
        header.classList.add("header-visible")
      }
    } else {
      // At top of page - always show header
      header.classList.remove("header-hidden")
      header.classList.add("header-visible")
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
    ticking = false
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateHeader)
      ticking = true
    }
  }

  // Throttled scroll event with passive listener for better performance
  window.addEventListener("scroll", requestTick, { passive: true })

  // Enhanced scroll start/end detection for smoother transitions
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer)
      }
      isScrolling = true

      scrollTimer = setTimeout(() => {
        isScrolling = false
        // Force update when scrolling stops
        requestTick()
      }, 150)
    },
    { passive: true },
  )

  // Initialize header state
  header.classList.add("header-visible")

  // Handle window resize
  window.addEventListener("resize", () => {
    headerHeight = header.offsetHeight
  })
}

function initializePageSpecific() {
  // Placeholder for page-specific initialization logic
}

function initializeToastContainer() {
  if (!document.querySelector(".toast-container")) {
    const toastContainer = document.createElement("div")
    toastContainer.className = "toast-container"
    document.body.appendChild(toastContainer)
  }
}

function initializeSmoothScrolling() {
  // Placeholder for smooth scrolling initialization logic
}

function initializeOfflineDetection() {
  // Placeholder for offline detection initialization logic
}

function loadBranches() {
  console.log("Loading branches...")

  const selectedCompany = localStorage.getItem("selectedCompany")
  if (!selectedCompany) {
    console.error("No company selected")
    showNoCompanyMessage()
    return
  }

  console.log("Selected company:", selectedCompany)

  // Load companies data
  window.companies = loadCompaniesData()
  const company = window.companies[selectedCompany]

  if (!company) {
    console.error("Company not found:", selectedCompany)
    showNoCompanyMessage()
    return
  }

  // Update page title with company name
  const companyTitle = document.getElementById("companyTitle")
  if (companyTitle) {
    const currentLang = document.documentElement.lang
    const companyName = currentLang === "ar" ? company.nameAr : company.name
    companyTitle.textContent = `${companyTitle.textContent} - ${companyName}`
  }

  // Get branches container
  const branchesContainer = document.getElementById("branchesContainer")
  if (!branchesContainer) {
    console.error("Branches container not found")
    return
  }

  // Clear existing content
  branchesContainer.innerHTML = ""

  // Create branch cards
  if (company.branches && company.branches.length > 0) {
    company.branches.forEach((branch) => {
      const branchCard = createBranchCard(branch, selectedCompany)
      branchesContainer.appendChild(branchCard)
    })
  } else {
    showNoBranchesMessage(branchesContainer)
  }
}

function createBranchCard(branch, companyId) {
  const card = document.createElement("div")
  card.className = "branch-card"
  card.dataset.governorate = branch.governorate
  card.dataset.branchId = branch.id
  card.onclick = () => selectBranch(companyId, branch.id)

  const currentLang = document.documentElement.lang
  const branchName = currentLang === "ar" ? branch.nameAr : branch.name

  card.innerHTML = `
    <div class="branch-header">
      <div class="branch-info">
        <h4>${branchName}</h4>
        <p><i class="fas fa-map-marker-alt"></i> ${branch.address}</p>
        <p><i class="fas fa-clock"></i> ${branch.workingHours}</p>
      </div>
      <div class="branch-status">
        <div class="status-badge available">
          <i class="fas fa-check-circle"></i>
          <span data-ar="متاح" data-en="Available">متاح</span>
        </div>
      </div>
    </div>
    <div class="branch-stats">
      <div class="stat">
        <span class="stat-number">${branch.currentNumber}</span>
        <span class="stat-label" data-ar="الرقم الحالي" data-en="Current Number">الرقم الحالي</span>
      </div>
      <div class="stat">
        <span class="stat-number">${branch.waiting}</span>
        <span class="stat-label" data-ar="في الانتظار" data-en="In Queue">في الانتظار</span>
      </div>
      <div class="stat">
        <span class="stat-number">${branch.estimatedTime}min</span>
        <span class="stat-label" data-ar="وقت الانتظار" data-en="Wait Time">وقت الانتظار</span>
      </div>
    </div>
    <div class="branch-actions">
      <button class="btn btn-primary" onclick="event.stopPropagation(); selectBranch('${companyId}', ${branch.id})">
        <i class="fas fa-calendar-plus"></i>
        <span data-ar="احجز موعد" data-en="Book Appointment">احجز موعد</span>
      </button>
    </div>
  `

  return card
}

function showNoCompanyMessage() {
  const branchesContainer = document.getElementById("branchesContainer")
  if (branchesContainer) {
    branchesContainer.innerHTML = `
      <div class="no-data-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3 data-ar="لم يتم اختيار خدمة" data-en="No Service Selected">لم يتم اختيار خدمة</h3>
        <p data-ar="يرجى العودة واختيار خدمة أولاً" data-en="Please go back and select a service first">يرجى العودة واختيار خدمة أولاً</p>
        <a href="companies.html" class="btn btn-primary" data-ar="اختيار خدمة" data-en="Select Service">اختيار خدمة</a>
      </div>
    `
  }
}

function showNoBranchesMessage(container) {
  container.innerHTML = `
    <div class="no-data-message">
      <i class="fas fa-map-marker-alt"></i>
      <h3 data-ar="لا توجد فروع متاحة" data-en="No Branches Available">لا توجد فروع متاحة</h3>
      <p data-ar="لا توجد فروع متاحة لهذه الخدمة حالياً" data-en="No branches are currently available for this service">لا توجد فروع متاحة لهذه الخدمة حالياً</p>
    </div>
  `
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== DOM Content Loaded ===")

  try {
    // Make selectCompany globally available
    window.selectCompany = selectCompany
    console.log("selectCompany function attached to window")

    // Initialize other functions safely
    if (typeof initializeTheme === "function") initializeTheme()
    if (typeof initializeLanguage === "function") initializeLanguage()
    if (typeof initializeFormValidation === "function") initializeFormValidation()
    if (typeof initializeMobileNav === "function") initializeMobileNav()
    if (typeof initializeHeaderAutoHide === "function") initializeHeaderAutoHide()
    if (typeof initializePageSpecific === "function") initializePageSpecific()
    if (typeof initializeToastContainer === "function") initializeToastContainer()
    if (typeof initializeSmoothScrolling === "function") initializeSmoothScrolling()
    if (typeof initializeOfflineDetection === "function") initializeOfflineDetection()
    if (typeof initializeEmailJS === "function") initializeEmailJS() // Initialize EmailJS here

    // Add backup click listeners to all company cards
    const companyCards = document.querySelectorAll(".provider-card[data-company]")
    console.log("Found company cards:", companyCards.length)

    companyCards.forEach((card, index) => {
      const companyId = card.getAttribute("data-company")
      console.log(`Setting up card ${index + 1}: ${companyId}`)

      // Remove existing onclick to avoid conflicts
      card.removeAttribute("onclick")

      // Add new click listener
      card.addEventListener("click", (event) => {
        console.log("Card clicked:", companyId)
        selectCompany(companyId, event)
      })

      // Add keyboard support
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          console.log("Card activated via keyboard:", companyId)
          selectCompany(companyId, event)
        }
      })

      // Visual feedback
      card.style.cursor = "pointer"
      card.style.transition = "all 0.2s ease"

      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)"
        this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
      })

      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)"
        this.style.boxShadow = ""
      })
    })

    console.log("Company selection setup complete")

    // Load branches if on branches page
    if (window.location.pathname.includes("branches.html") || document.getElementById("branchesContainer")) {
      console.log("On branches page, loading branches...")
      loadBranches()
    }
  } catch (error) {
    console.error("Error during initialization:", error)
  }
})

// Sample data with Test Company added
window.companies = loadCompaniesData()

// Function to load companies data from localStorage or use defaults
function loadCompaniesData() {
  const savedData = localStorage.getItem("companiesData")
  if (savedData) {
    return JSON.parse(savedData)
  }

  // Default data if nothing is saved
  return {
    electricity: {
      name: "Electricity Services",
      nameAr: "الكهرباء",
      fullName: "Egyptian Electricity Holding Company",
      icon: "fas fa-bolt",
      branches: [
        {
          id: 1,
          name: "Cairo Main Branch",
          nameAr: "فرع القاهرة الرئيسي",
          governorate: "cairo",
          address: "Downtown Cairo",
          currentNumber: 15,
          waiting: 8,
          estimatedTime: 80,
          workingHours: "8:00 AM - 4:00 PM",
        },
        {
          id: 2,
          name: "Giza Branch",
          nameAr: "فرع الجيزة",
          governorate: "giza",
          address: "Giza Center",
          currentNumber: 22,
          waiting: 5,
          estimatedTime: 50,
          workingHours: "8:00 AM - 4:00 PM",
        },
        {
          id: 3,
          name: "Alexandria Branch",
          nameAr: "فرع الإسكندرية",
          governorate: "alexandria",
          address: "Alexandria Downtown",
          currentNumber: 18,
          waiting: 12,
          estimatedTime: 120,
          workingHours: "8:00 AM - 3:00 PM",
        },
      ],
    },
    water: {
      name: "Water & Wastewater",
      nameAr: "المياه",
      fullName: "Water & Wastewater Services",
      icon: "fas fa-tint",
      branches: [
        {
          id: 4,
          name: "Cairo Water Services",
          nameAr: "خدمات مياه القاهرة",
          governorate: "cairo",
          address: "Nasr City",
          currentNumber: 12,
          waiting: 6,
          estimatedTime: 60,
          workingHours: "8:00 AM - 3:00 PM",
        },
        {
          id: 5,
          name: "Giza Water Branch",
          nameAr: "فرع مياه الجيزة",
          governorate: "giza",
          address: "Dokki",
          currentNumber: 8,
          waiting: 3,
          estimatedTime: 30,
          workingHours: "8:00 AM - 3:00 PM",
        },
        {
          id: 6,
          name: "Alexandria Water",
          nameAr: "مياه الإسكندرية",
          governorate: "alexandria",
          address: "Sidi Gaber",
          currentNumber: 25,
          waiting: 15,
          estimatedTime: 150,
          workingHours: "8:00 AM - 3:00 PM",
        },
      ],
    },
    gas: {
      name: "Natural Gas",
      nameAr: "الغاز الطبيعي",
      fullName: "Egyptian Natural Gas Company",
      icon: "fas fa-fire",
      branches: [
        {
          id: 7,
          name: "Cairo Gas Center",
          nameAr: "مركز غاز القاهرة",
          governorate: "cairo",
          address: "Heliopolis",
          currentNumber: 30,
          waiting: 10,
          estimatedTime: 100,
          workingHours: "9:00 AM - 5:00 PM",
        },
        {
          id: 8,
          name: "Giza Gas Services",
          nameAr: "خدمات غاز الجيزة",
          governorate: "giza",
          address: "Mohandessin",
          currentNumber: 14,
          waiting: 7,
          estimatedTime: 70,
          workingHours: "9:00 AM - 5:00 PM",
        },
        {
          id: 9,
          name: "Alexandria Gas",
          nameAr: "غاز الإسكندرية",
          governorate: "alexandria",
          address: "Smouha",
          currentNumber: 19,
          waiting: 9,
          estimatedTime: 90,
          workingHours: "9:00 AM - 5:00 PM",
        },
      ],
    },
    telecom: {
      name: "Telecommunications",
      nameAr: "الاتصالات",
      fullName: "Telecom Egypt Services",
      icon: "fas fa-phone",
      branches: [
        {
          id: 10,
          name: "Cairo Telecom Hub",
          nameAr: "مركز اتصالات القاهرة",
          governorate: "cairo",
          address: "Zamalek",
          currentNumber: 45,
          waiting: 20,
          estimatedTime: 200,
          workingHours: "8:00 AM - 6:00 PM",
        },
        {
          id: 11,
          name: "Giza Telecom",
          nameAr: "اتصالات الجيزة",
          governorate: "giza",
          address: "Agouza",
          currentNumber: 33,
          waiting: 12,
          estimatedTime: 120,
          workingHours: "8:00 AM - 6:00 PM",
        },
        {
          id: 12,
          name: "Alexandria Telecom",
          nameAr: "اتصالات الإسكندرية",
          governorate: "alexandria",
          address: "Gleem",
          currentNumber: 28,
          waiting: 8,
          estimatedTime: 80,
          workingHours: "8:00 AM - 6:00 PM",
        },
      ],
    },
    internet: {
      name: "Internet Services",
      nameAr: "الإنترنت",
      fullName: "Internet Service Providers",
      icon: "fas fa-wifi",
      branches: [
        {
          id: 13,
          name: "Cairo Internet Services",
          nameAr: "خدمات إنترنت القاهرة",
          governorate: "cairo",
          address: "New Cairo",
          currentNumber: 16,
          waiting: 4,
          estimatedTime: 40,
          workingHours: "9:00 AM - 5:00 PM",
        },
        {
          id: 14,
          name: "Giza Internet Center",
          nameAr: "مركز إنترنت الجيزة",
          governorate: "giza",
          address: "6th October",
          currentNumber: 21,
          waiting: 11,
          estimatedTime: 110,
          workingHours: "9:00 AM - 5:00 PM",
        },
        {
          id: 15,
          name: "Alexandria Internet",
          nameAr: "إنترنت الإسكندرية",
          governorate: "alexandria",
          address: "Montaza",
          currentNumber: 37,
          waiting: 18,
          estimatedTime: 180,
          workingHours: "9:00 AM - 6:00 PM",
        },
      ],
    },
    test: {
      name: "Test Company",
      nameAr: "شركة الاختبار",
      fullName: "Test Company Services",
      icon: "fas fa-flask",
      branches: [
        {
          id: 16,
          name: "Cairo Test Center",
          nameAr: "مركز اختبار القاهرة",
          governorate: "cairo",
          address: "Maadi",
          currentNumber: 5,
          waiting: 3,
          estimatedTime: 30,
          workingHours: "10:00 AM - 6:00 PM",
        },
        {
          id: 17,
          name: "Giza Test Branch",
          nameAr: "فرع اختبار الجيزة",
          governorate: "giza",
          address: "Sheikh Zayed",
          currentNumber: 12,
          waiting: 7,
          estimatedTime: 70,
          workingHours: "10:00 AM - 6:00 PM",
        },
        {
          id: 18,
          name: "Alexandria Test Office",
          nameAr: "مكتب اختبار الإسكندرية",
          governorate: "alexandria",
          address: "Stanley",
          currentNumber: 8,
          waiting: 2,
          estimatedTime: 20,
          workingHours: "10:00 AM - 6:00 PM",
        },
        {
          id: 19,
          name: "Luxor Test Center",
          nameAr: "مركز اختبار الأقصر",
          governorate: "luxor",
          address: "East Bank",
          currentNumber: 3,
          waiting: 1,
          estimatedTime: 10,
          workingHours: "9:00 AM - 4:00 PM",
        },
        {
          id: 20,
          name: "Aswan Test Branch",
          nameAr: "فرع اختبار أسوان",
          governorate: "aswan",
          address: "Corniche",
          currentNumber: 15,
          waiting: 9,
          estimatedTime: 90,
          workingHours: "9:00 AM - 4:00 PM",
        },
      ],
    },
  }
}

// Function to save companies data to localStorage
function saveCompaniesData() {
  localStorage.setItem("companiesData", JSON.stringify(window.companies))
}

// Enhanced Company Selection
function selectCompany(companyId, event) {
  console.log("=== Company Selection Started ===")
  console.log("Company ID:", companyId)
  console.log("Event:", event)

  try {
    // Prevent default behavior
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    // Simple validation
    if (!companyId) {
      console.error("No company ID provided")
      alert("Error: No company selected")
      return
    }

    console.log("Saving company selection...")

    // Save to localStorage
    localStorage.setItem("selectedCompany", companyId)
    localStorage.setItem("selectedCompanyTimestamp", Date.now().toString())

    console.log("Company saved to localStorage:", localStorage.getItem("selectedCompany"))

    // Visual feedback
    const card = event ? event.currentTarget : document.querySelector(`[data-company="${companyId}"]`)
    if (card) {
      card.style.opacity = "0.7"
      card.style.transform = "scale(0.98)"
      setTimeout(() => {
        card.style.opacity = "1"
        card.style.transform = "scale(1)"
      }, 200)
    }

    // Show confirmation
    alert(`Company "${companyId}" selected! Redirecting to branches...`)

    console.log("Attempting navigation...")

    // Simple navigation
    setTimeout(() => {
      try {
        window.location.href = "branches.html"
      } catch (navError) {
        console.error("Navigation failed:", navError)
        // Fallback
        window.location.assign("branches.html")
      }
    }, 500)
  } catch (error) {
    console.error("Error in selectCompany:", error)
    alert("Error selecting company. Please try again.")
  }
}

// Enhanced Branch Selection
function selectBranch(companyId, branchId) {
  try {
    // Save selected branch
    localStorage.setItem("selectedBranch", branchId)
    localStorage.setItem("selectedBranchTimestamp", Date.now().toString())

    console.log("Branch saved to localStorage:", localStorage.getItem("selectedBranch"))

    // Visual feedback
    const card = document.querySelector(`[data-branch-id="${branchId}"]`)
    if (card) {
      card.style.opacity = "0.7"
      card.style.transform = "scale(0.98)"
      setTimeout(() => {
        card.style.opacity = "1"
        card.style.transform = "scale(1)"
      }, 200)
    }

    // Navigate to booking page
    setTimeout(() => {
      window.location.href = "booking.html"
    }, 300)
  } catch (error) {
    console.error("Error selecting branch:", error)
    showToast("Error", "Failed to select branch. Please try again.", "error")
  }
}

function closeToast(toastElement) {
  if (toastElement && toastElement.parentNode) {
    toastElement.style.opacity = "0"
    toastElement.style.transform = "translateX(100%)"
    setTimeout(() => toastElement.remove(), 300)
  }
}

function createToastContainer() {
  if (toastContainer) return

  toastContainer = document.createElement("div")
  toastContainer.className = "toast-container"
  toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
    `
  document.body.appendChild(toastContainer)
}

function showToast(title, message, type, duration = 3000) {
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="closeToast(this.parentElement)">×</button>
    `
  toastContainer.appendChild(toast)

  setTimeout(() => closeToast(toast), duration)
}

function setLoadingState(element, isLoading) {
  if (!element) return

  if (isLoading) {
    element.disabled = true
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Processing...</span>'
  } else {
    element.disabled = false
    element.innerHTML =
      '<i class="fas fa-calendar-check"></i> <span data-en="Confirm Booking" data-ar="تأكيد الحجز">Confirm Booking</span>'
  }
}

// Main initialization function
function initializeApp() {
  console.log('🚀 Initializing Dorak.net application...')
  
  // Initialize EmailJS
  if (typeof initializeEmailJS === 'function') {
    initializeEmailJS()
  }
  
  // Initialize theme
  if (typeof updateThemeToggle === 'function') {
    updateThemeToggle()
  }
  
  // Initialize language
  if (typeof updateLanguageContent === 'function') {
    updateLanguageContent(currentLanguage)
  }
  
  // Create toast container
  createToastContainer()
  
  console.log('✅ App initialization completed')
}

// Initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  // Script loaded after DOM is ready
  initializeApp()
}

// Also initialize when window loads (backup)
window.addEventListener('load', function() {
  console.log('🔄 Window loaded, running backup initialization...')
  if (typeof initializeApp === 'function') {
    initializeApp()
  }
})
