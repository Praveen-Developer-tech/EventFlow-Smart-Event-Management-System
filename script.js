// Enhanced Event Management System JavaScript

class EventManager {
  constructor() {
    this.events = this.loadEvents()
    this.currentDeleteId = null
    this.currentEditId = null
    this.currentDate = new Date()
    this.currentView = "month"
    this.init()
  }

  init() {
    // Initialize theme
    this.initTheme()

    // Initialize based on current page
    const currentPage = window.location.pathname.split("/").pop() || "index.html"

    switch (currentPage) {
      case "index.html":
      case "":
        this.initHomePage()
        break
      case "create-event.html":
        this.initCreateEventPage()
        break
      case "view-events.html":
        this.initViewEventsPage()
        break
      case "calendar.html":
        this.initCalendarPage()
        break
      case "edit-event.html":
        this.initEditEventPage()
        break
      case "contact.html":
        this.initContactPage()
        break
    }

    // Initialize mobile navigation
    this.initMobileNav()
  }

  // Theme Management
  initTheme() {
    const themeToggle = document.getElementById("themeToggle")
    const savedTheme = localStorage.getItem("theme") || "light"

    document.documentElement.setAttribute("data-theme", savedTheme)
    this.updateThemeIcon(savedTheme)

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme")
        const newTheme = currentTheme === "dark" ? "light" : "dark"

        document.documentElement.setAttribute("data-theme", newTheme)
        localStorage.setItem("theme", newTheme)
        this.updateThemeIcon(newTheme)
        this.showNotification(`Switched to ${newTheme} mode`, "success")
      })
    }
  }

  updateThemeIcon(theme) {
    const themeIcon = document.querySelector(".theme-icon")
    if (themeIcon) {
      themeIcon.textContent = theme === "dark" ? "☀️" : "🌙"
    }
  }

  // Mobile Navigation
  initMobileNav() {
    const hamburger = document.querySelector(".hamburger")
    const navMenu = document.querySelector(".nav-menu")

    if (hamburger && navMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active")
        navMenu.classList.toggle("active")
      })

      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active")
          navMenu.classList.remove("active")
        })
      })
    }
  }

  // Home Page Initialization
  initHomePage() {
    this.animateOnScroll()
    this.displayStats()
  }

  // Create Event Page Initialization
  initCreateEventPage() {
    const eventForm = document.getElementById("eventForm")
    if (eventForm) {
      eventForm.addEventListener("submit", (e) => this.handleEventSubmit(e))

      const inputs = eventForm.querySelectorAll("input, textarea, select")
      inputs.forEach((input) => {
        input.addEventListener("blur", () => this.validateField(input))
        input.addEventListener("input", () => this.clearError(input))
      })

      const dateInput = document.getElementById("eventDate")
      if (dateInput) {
        const today = new Date().toISOString().split("T")[0]
        dateInput.setAttribute("min", today)
      }
    }

    this.initModal()
  }

  // Edit Event Page Initialization
  initEditEventPage() {
    const urlParams = new URLSearchParams(window.location.search)
    const eventId = urlParams.get("id")

    if (eventId) {
      this.loadEventForEdit(eventId)
    } else {
      window.location.href = "view-events.html"
      return
    }

    const editForm = document.getElementById("editEventForm")
    if (editForm) {
      editForm.addEventListener("submit", (e) => this.handleEditSubmit(e))

      const inputs = editForm.querySelectorAll("input, textarea, select")
      inputs.forEach((input) => {
        input.addEventListener("blur", () => this.validateField(input))
        input.addEventListener("input", () => this.clearError(input))
      })
    }

    this.initModal()
  }

  // View Events Page Initialization
  initViewEventsPage() {
    this.displayEvents()
    this.displayStats()
    this.initSearch()
    this.initFilter()
    this.initDeleteModal()
    this.initExportImport()
  }

  // Calendar Page Initialization
  initCalendarPage() {
    this.initCalendarControls()
    this.renderCalendar()
    this.initEventDetailsModal()
  }

  // Contact Page Initialization
  initContactPage() {
    const contactForm = document.getElementById("contactForm")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => this.handleContactSubmit(e))

      const inputs = contactForm.querySelectorAll("input, textarea")
      inputs.forEach((input) => {
        input.addEventListener("blur", () => this.validateContactField(input))
        input.addEventListener("input", () => this.clearError(input))
      })
    }
  }

  // Event Management Methods
  loadEvents() {
    const events = localStorage.getItem("events")
    return events ? JSON.parse(events) : []
  }

  saveEvents() {
    localStorage.setItem("events", JSON.stringify(this.events))
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  addEvent(eventData) {
    const event = {
      id: this.generateId(),
      ...eventData,
      category: eventData.eventCategory || "other",
      priority: eventData.eventPriority || "medium",
      createdAt: new Date().toISOString(),
    }
    this.events.push(event)
    this.saveEvents()
    return event
  }

  updateEvent(id, eventData) {
    const eventIndex = this.events.findIndex((event) => event.id === id)
    if (eventIndex !== -1) {
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        ...eventData,
        category: eventData.eventCategory || "other",
        priority: eventData.eventPriority || "medium",
        updatedAt: new Date().toISOString(),
      }
      this.saveEvents()
      return this.events[eventIndex]
    }
    return null
  }

  deleteEvent(id) {
    this.events = this.events.filter((event) => event.id !== id)
    this.saveEvents()
  }

  getEvent(id) {
    return this.events.find((event) => event.id === id)
  }

  // Form Validation (keeping existing validation methods)
  validateField(field) {
    const value = field.value.trim()
    const fieldName = field.name
    let isValid = true
    let errorMessage = ""

    this.clearError(field)

    switch (fieldName) {
      case "eventName":
        if (!value) {
          errorMessage = "Event name is required"
          isValid = false
        } else if (value.length < 3) {
          errorMessage = "Event name must be at least 3 characters"
          isValid = false
        }
        break

      case "eventDate":
        if (!value) {
          errorMessage = "Event date is required"
          isValid = false
        } else {
          const selectedDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (selectedDate < today) {
            errorMessage = "Event date cannot be in the past"
            isValid = false
          }
        }
        break

      case "eventTime":
        if (!value) {
          errorMessage = "Event time is required"
          isValid = false
        }
        break

      case "eventLocation":
        if (!value) {
          errorMessage = "Event location is required"
          isValid = false
        } else if (value.length < 3) {
          errorMessage = "Location must be at least 3 characters"
          isValid = false
        }
        break
    }

    if (!isValid) {
      this.showError(field, errorMessage)
    } else {
      field.classList.add("success")
    }

    return isValid
  }

  validateContactField(field) {
    const value = field.value.trim()
    const fieldName = field.name
    let isValid = true
    let errorMessage = ""

    this.clearError(field)

    switch (fieldName) {
      case "contactName":
        if (!value) {
          errorMessage = "Name is required"
          isValid = false
        } else if (value.length < 2) {
          errorMessage = "Name must be at least 2 characters"
          isValid = false
        }
        break

      case "contactEmail":
        if (!value) {
          errorMessage = "Email is required"
          isValid = false
        } else if (!this.isValidEmail(value)) {
          errorMessage = "Please enter a valid email address"
          isValid = false
        }
        break

      case "contactMessage":
        if (!value) {
          errorMessage = "Message is required"
          isValid = false
        } else if (value.length < 10) {
          errorMessage = "Message must be at least 10 characters"
          isValid = false
        }
        break
    }

    if (!isValid) {
      this.showError(field, errorMessage)
    } else {
      field.classList.add("success")
    }

    return isValid
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  showError(field, message) {
    field.classList.add("error")
    field.classList.remove("success")
    const errorElement = document.getElementById(field.name + "Error")
    if (errorElement) {
      errorElement.textContent = message
    }
  }

  clearError(field) {
    field.classList.remove("error", "success")
    const errorElement = document.getElementById(field.name + "Error")
    if (errorElement) {
      errorElement.textContent = ""
    }
  }

  // Form Submission Handlers
  handleEventSubmit(e) {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)
    const eventData = {}

    for (const [key, value] of formData.entries()) {
      eventData[key] = value.trim()
    }

    const inputs = form.querySelectorAll("input[required], textarea[required]")
    let isFormValid = true

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false
      }
    })

    if (isFormValid) {
      const submitBtn = form.querySelector('button[type="submit"]')
      submitBtn.classList.add("loading")
      submitBtn.disabled = true

      setTimeout(() => {
        this.addEvent(eventData)
        this.showSuccessModal()
        form.reset()

        submitBtn.classList.remove("loading")
        submitBtn.disabled = false

        inputs.forEach((input) => {
          input.classList.remove("success", "error")
        })

        this.showNotification("Event created successfully!", "success")
      }, 1000)
    }
  }

  handleEditSubmit(e) {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)
    const eventData = {}

    for (const [key, value] of formData.entries()) {
      if (key !== "eventId") {
        eventData[key] = value.trim()
      }
    }

    const eventId = document.getElementById("eventId").value
    const inputs = form.querySelectorAll("input[required], textarea[required]")
    let isFormValid = true

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false
      }
    })

    if (isFormValid) {
      const submitBtn = form.querySelector('button[type="submit"]')
      submitBtn.classList.add("loading")
      submitBtn.disabled = true

      setTimeout(() => {
        this.updateEvent(eventId, eventData)
        this.showSuccessModal()

        submitBtn.classList.remove("loading")
        submitBtn.disabled = false

        this.showNotification("Event updated successfully!", "success")
      }, 1000)
    }
  }

  handleContactSubmit(e) {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)
    const contactData = {}

    for (const [key, value] of formData.entries()) {
      contactData[key] = value.trim()
    }

    const inputs = form.querySelectorAll("input, textarea")
    let isFormValid = true

    inputs.forEach((input) => {
      if (!this.validateContactField(input)) {
        isFormValid = false
      }
    })

    if (isFormValid) {
      const submitBtn = form.querySelector('button[type="submit"]')
      submitBtn.classList.add("loading")
      submitBtn.disabled = true

      setTimeout(() => {
        this.showNotification(
          `Thank you, ${contactData.contactName}! Your message has been sent successfully.`,
          "success",
        )
        form.reset()

        submitBtn.classList.remove("loading")
        submitBtn.disabled = false

        inputs.forEach((input) => {
          input.classList.remove("success", "error")
        })
      }, 1000)
    }
  }

  // Load Event for Editing
  loadEventForEdit(eventId) {
    const event = this.getEvent(eventId)
    if (!event) {
      this.showNotification("Event not found", "error")
      window.location.href = "view-events.html"
      return
    }

    document.getElementById("eventId").value = event.id
    document.getElementById("eventName").value = event.eventName
    document.getElementById("eventDate").value = event.eventDate
    document.getElementById("eventTime").value = event.eventTime
    document.getElementById("eventLocation").value = event.eventLocation
    document.getElementById("eventDescription").value = event.eventDescription || ""
    document.getElementById("eventCategory").value = event.category || "other"
    document.getElementById("eventPriority").value = event.priority || "medium"
  }

  // Enhanced Events Display
  displayEvents(eventsToShow = null) {
    const container = document.getElementById("eventsContainer")
    const noEventsMessage = document.getElementById("noEventsMessage")

    if (!container) return

    const events = eventsToShow || this.events

    if (events.length === 0) {
      container.innerHTML = ""
      if (noEventsMessage) {
        noEventsMessage.style.display = "block"
      }
      return
    }

    if (noEventsMessage) {
      noEventsMessage.style.display = "none"
    }

    const sortedEvents = events.sort((a, b) => {
      const dateA = new Date(`${a.eventDate} ${a.eventTime}`)
      const dateB = new Date(`${b.eventDate} ${b.eventTime}`)
      return dateA - dateB
    })

    container.innerHTML = sortedEvents.map((event) => this.createEventCard(event)).join("")

    // Add event listeners
    container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventId = e.target.dataset.eventId
        this.showDeleteModal(eventId)
      })
    })

    container.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventId = e.target.dataset.eventId
        window.location.href = `edit-event.html?id=${eventId}`
      })
    })
  }

  createEventCard(event) {
    const eventDate = new Date(`${event.eventDate} ${event.eventTime}`)
    const now = new Date()
    const isPast = eventDate < now
    const category = event.category || "other"
    const priority = event.priority || "medium"

    return `
      <div class="event-card ${isPast ? "past-event" : ""} category-${category} priority-${priority}">
        <div class="event-header">
          <h3 class="event-title">${this.escapeHtml(event.eventName)}</h3>
          <div class="event-actions">
            <button class="edit-btn" data-event-id="${event.id}">Edit</button>
            <button class="delete-btn" data-event-id="${event.id}">Delete</button>
          </div>
        </div>
        <div class="event-details">
          <div class="event-detail">
            <strong>📅 Date:</strong> ${this.formatDate(event.eventDate)}
          </div>
          <div class="event-detail">
            <strong>🕒 Time:</strong> ${this.formatTime(event.eventTime)}
          </div>
          <div class="event-detail">
            <strong>📍 Location:</strong> ${this.escapeHtml(event.eventLocation)}
          </div>
          ${
            event.eventDescription
              ? `
            <div class="event-description">
              <strong>Description:</strong><br>
              ${this.escapeHtml(event.eventDescription)}
            </div>
          `
              : ""
          }
        </div>
        <div class="event-meta">
          <span class="event-category ${category}">${category}</span>
          <span class="priority-indicator priority-${priority}">${priority.toUpperCase()}</span>
        </div>
        ${isPast ? '<div class="past-indicator">Past Event</div>' : ""}
      </div>
    `
  }

  // Statistics Display
  displayStats() {
    const statsContainer = document.querySelector(".stats-container")
    if (!statsContainer) return

    const totalEvents = this.events.length
    const upcomingEvents = this.events.filter((event) => {
      const eventDate = new Date(`${event.eventDate} ${event.eventTime}`)
      return eventDate > new Date()
    }).length

    const todayEvents = this.events.filter((event) => {
      const today = new Date().toISOString().split("T")[0]
      return event.eventDate === today
    }).length

    const categories = this.events.reduce((acc, event) => {
      const category = event.category || "other"
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    const mostPopularCategory = Object.keys(categories).reduce(
      (a, b) => (categories[a] > categories[b] ? a : b),
      "none",
    )

    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${totalEvents}</div>
        <div class="stat-label">Total Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${upcomingEvents}</div>
        <div class="stat-label">Upcoming Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${todayEvents}</div>
        <div class="stat-label">Today's Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${mostPopularCategory}</div>
        <div class="stat-label">Top Category</div>
      </div>
    `
  }

  // Enhanced Search and Filter
  initSearch() {
    const searchInput = document.getElementById("searchInput")
    const searchBtn = document.getElementById("searchBtn")

    if (searchInput && searchBtn) {
      const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim()
        const categoryFilter = document.getElementById("categoryFilter")?.value || ""
        const dateFilter = document.getElementById("filterDate")?.value || ""

        let filteredEvents = this.events

        if (query) {
          filteredEvents = filteredEvents.filter(
            (event) =>
              event.eventName.toLowerCase().includes(query) ||
              event.eventLocation.toLowerCase().includes(query) ||
              (event.eventDescription && event.eventDescription.toLowerCase().includes(query)),
          )
        }

        if (categoryFilter) {
          filteredEvents = filteredEvents.filter((event) => (event.category || "other") === categoryFilter)
        }

        if (dateFilter) {
          filteredEvents = filteredEvents.filter((event) => event.eventDate === dateFilter)
        }

        this.displayEvents(filteredEvents)
      }

      searchBtn.addEventListener("click", performSearch)
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          performSearch()
        }
      })

      searchInput.addEventListener("input", () => {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(performSearch, 300)
      })
    }
  }

  initFilter() {
    const categoryFilter = document.getElementById("categoryFilter")
    const filterDate = document.getElementById("filterDate")
    const clearFilter = document.getElementById("clearFilter")

    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => {
        this.initSearch() // Trigger search with new filter
      })
    }

    if (filterDate) {
      filterDate.addEventListener("change", () => {
        this.initSearch() // Trigger search with new filter
      })
    }

    if (clearFilter) {
      clearFilter.addEventListener("click", () => {
        if (filterDate) filterDate.value = ""
        if (categoryFilter) categoryFilter.value = ""
        const searchInput = document.getElementById("searchInput")
        if (searchInput) searchInput.value = ""
        this.displayEvents()
      })
    }
  }

  // Export/Import Functionality
  initExportImport() {
    const exportCSV = document.getElementById("exportCSV")
    const exportJSON = document.getElementById("exportJSON")
    const importBtn = document.getElementById("importBtn")
    const importFile = document.getElementById("importFile")

    if (exportCSV) {
      exportCSV.addEventListener("click", () => this.exportToCSV())
    }

    if (exportJSON) {
      exportJSON.addEventListener("click", () => this.exportToJSON())
    }

    if (importBtn && importFile) {
      importBtn.addEventListener("click", () => importFile.click())
      importFile.addEventListener("change", (e) => this.handleImport(e))
    }
  }

  exportToCSV() {
    if (this.events.length === 0) {
      this.showNotification("No events to export", "warning")
      return
    }

    const headers = ["Name", "Date", "Time", "Location", "Description", "Category", "Priority"]
    const csvContent = [
      headers.join(","),
      ...this.events.map((event) =>
        [
          `"${event.eventName}"`,
          event.eventDate,
          event.eventTime,
          `"${event.eventLocation}"`,
          `"${event.eventDescription || ""}"`,
          event.category || "other",
          event.priority || "medium",
        ].join(","),
      ),
    ].join("\n")

    this.downloadFile(csvContent, "events.csv", "text/csv")
    this.showNotification("Events exported to CSV successfully!", "success")
  }

  exportToJSON() {
    if (this.events.length === 0) {
      this.showNotification("No events to export", "warning")
      return
    }

    const jsonContent = JSON.stringify(this.events, null, 2)
    this.downloadFile(jsonContent, "events.json", "application/json")
    this.showNotification("Events exported to JSON successfully!", "success")
  }

  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  handleImport(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        let importedEvents = []

        if (file.name.endsWith(".json")) {
          importedEvents = JSON.parse(event.target.result)
        } else if (file.name.endsWith(".csv")) {
          const lines = event.target.result.split("\n")
          const headers = lines[0].split(",")

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(",")
              const event = {
                id: this.generateId(),
                eventName: values[0]?.replace(/"/g, "") || "",
                eventDate: values[1] || "",
                eventTime: values[2] || "",
                eventLocation: values[3]?.replace(/"/g, "") || "",
                eventDescription: values[4]?.replace(/"/g, "") || "",
                category: values[5] || "other",
                priority: values[6] || "medium",
                createdAt: new Date().toISOString(),
              }
              importedEvents.push(event)
            }
          }
        }

        if (importedEvents.length > 0) {
          this.events = [...this.events, ...importedEvents]
          this.saveEvents()
          this.displayEvents()
          this.displayStats()
          this.showNotification(`Successfully imported ${importedEvents.length} events!`, "success")
        } else {
          this.showNotification("No valid events found in the file", "warning")
        }
      } catch (error) {
        this.showNotification("Error importing file. Please check the format.", "error")
      }
    }

    reader.readAsText(file)
    e.target.value = "" // Reset file input
  }

  // Calendar Functionality
  initCalendarControls() {
    const prevMonth = document.getElementById("prevMonth")
    const nextMonth = document.getElementById("nextMonth")
    const monthView = document.getElementById("monthView")
    const weekView = document.getElementById("weekView")

    if (prevMonth) {
      prevMonth.addEventListener("click", () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1)
        this.renderCalendar()
      })
    }

    if (nextMonth) {
      nextMonth.addEventListener("click", () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1)
        this.renderCalendar()
      })
    }

    if (monthView && weekView) {
      monthView.addEventListener("click", () => {
        this.currentView = "month"
        monthView.classList.add("active")
        weekView.classList.remove("active")
        this.renderCalendar()
      })

      weekView.addEventListener("click", () => {
        this.currentView = "week"
        weekView.classList.add("active")
        monthView.classList.remove("active")
        this.renderCalendar()
      })
    }
  }

  renderCalendar() {
    const currentMonth = document.getElementById("currentMonth")
    if (currentMonth) {
      currentMonth.textContent = this.currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    }

    if (this.currentView === "month") {
      this.renderMonthView()
    } else {
      this.renderWeekView()
    }
  }

  renderMonthView() {
    const monthViewContainer = document.getElementById("monthViewContainer")
    const weekViewContainer = document.getElementById("weekViewContainer")

    if (monthViewContainer) monthViewContainer.style.display = "block"
    if (weekViewContainer) weekViewContainer.style.display = "none"

    const calendarDays = document.getElementById("calendarDays")
    if (!calendarDays) return

    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    calendarDays.innerHTML = ""

    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + i)

      const dayEvents = this.events.filter((event) => event.eventDate === currentDay.toISOString().split("T")[0])

      const isCurrentMonth = currentDay.getMonth() === month
      const isToday = currentDay.toDateString() === new Date().toDateString()
      const dayNumber = currentDay.getDate()

      const dayElement = document.createElement("div")
      dayElement.className = `calendar-day ${!isCurrentMonth ? "other-month" : ""} ${isToday ? "today" : ""}`

      dayElement.innerHTML = `
        <div class="day-number">${dayNumber}</div>
        <div class="day-events">
          ${dayEvents
            .slice(0, 3)
            .map(
              (event) => `
            <div class="calendar-event ${event.category || "other"}" data-event-id="${event.id}">
              ${this.escapeHtml(event.eventName)}
            </div>
          `,
            )
            .join("")}
          ${dayEvents.length > 3 ? `<div class="more-events">+${dayEvents.length - 3} more</div>` : ""}
        </div>
      `

      dayElement.addEventListener("click", () => {
        if (dayEvents.length > 0) {
          this.showDayEvents(currentDay, dayEvents)
        }
      })

      calendarDays.appendChild(dayElement)
    }

    // Add event listeners to calendar events
    calendarDays.querySelectorAll(".calendar-event").forEach((eventEl) => {
      eventEl.addEventListener("click", (e) => {
        e.stopPropagation()
        const eventId = e.target.dataset.eventId
        this.showEventDetails(eventId)
      })
    })
  }

  renderWeekView() {
    const monthViewContainer = document.getElementById("monthViewContainer")
    const weekViewContainer = document.getElementById("weekViewContainer")

    if (monthViewContainer) monthViewContainer.style.display = "none"
    if (weekViewContainer) weekViewContainer.style.display = "block"

    const weekDays = document.getElementById("weekDays")
    if (!weekDays) return

    // Get the start of the week (Sunday)
    const startOfWeek = new Date(this.currentDate)
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay())

    weekDays.innerHTML = ""

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek)
      currentDay.setDate(startOfWeek.getDate() + i)

      const dayEvents = this.events.filter((event) => event.eventDate === currentDay.toISOString().split("T")[0])

      const dayColumn = document.createElement("div")
      dayColumn.className = "week-day"

      // Create 24 hour slots
      for (let hour = 0; hour < 24; hour++) {
        const hourSlot = document.createElement("div")
        hourSlot.className = "week-hour"

        // Find events for this hour
        const hourEvents = dayEvents.filter((event) => {
          const eventHour = Number.parseInt(event.eventTime.split(":")[0])
          return eventHour === hour
        })

        hourEvents.forEach((event) => {
          const eventEl = document.createElement("div")
          eventEl.className = `week-event ${event.category || "other"}`
          eventEl.textContent = event.eventName
          eventEl.dataset.eventId = event.id
          eventEl.addEventListener("click", () => this.showEventDetails(event.id))
          hourSlot.appendChild(eventEl)
        })

        dayColumn.appendChild(hourSlot)
      }

      weekDays.appendChild(dayColumn)
    }
  }

  showDayEvents(date, events) {
    const modal = document.getElementById("eventDetailsModal")
    const content = document.getElementById("eventDetailsContent")

    if (!modal || !content) return

    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    content.innerHTML = `
      <h3>Events for ${dateStr}</h3>
      <div class="day-events-list">
        ${events
          .map(
            (event) => `
          <div class="day-event-item" data-event-id="${event.id}">
            <h4>${this.escapeHtml(event.eventName)}</h4>
            <p><strong>Time:</strong> ${this.formatTime(event.eventTime)}</p>
            <p><strong>Location:</strong> ${this.escapeHtml(event.eventLocation)}</p>
            ${event.eventDescription ? `<p><strong>Description:</strong> ${this.escapeHtml(event.eventDescription)}</p>` : ""}
            <span class="event-category ${event.category || "other"}">${event.category || "other"}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    `

    modal.style.display = "block"

    // Hide the edit/delete buttons for day view
    const editBtn = document.getElementById("editEventBtn")
    const deleteBtn = document.getElementById("deleteEventBtn")
    if (editBtn) editBtn.style.display = "none"
    if (deleteBtn) deleteBtn.style.display = "none"
  }

  showEventDetails(eventId) {
    const event = this.getEvent(eventId)
    if (!event) return

    const modal = document.getElementById("eventDetailsModal")
    const content = document.getElementById("eventDetailsContent")

    if (!modal || !content) return

    content.innerHTML = `
      <h3>${this.escapeHtml(event.eventName)}</h3>
      <div class="event-details-full">
        <p><strong>📅 Date:</strong> ${this.formatDate(event.eventDate)}</p>
        <p><strong>🕒 Time:</strong> ${this.formatTime(event.eventTime)}</p>
        <p><strong>📍 Location:</strong> ${this.escapeHtml(event.eventLocation)}</p>
        <p><strong>🏷️ Category:</strong> <span class="event-category ${event.category || "other"}">${event.category || "other"}</span></p>
        <p><strong>⚡ Priority:</strong> <span class="priority-indicator priority-${event.priority || "medium"}">${(event.priority || "medium").toUpperCase()}</span></p>
        ${event.eventDescription ? `<p><strong>📝 Description:</strong><br>${this.escapeHtml(event.eventDescription)}</p>` : ""}
      </div>
    `

    modal.style.display = "block"

    // Show edit/delete buttons and set up event listeners
    const editBtn = document.getElementById("editEventBtn")
    const deleteBtn = document.getElementById("deleteEventBtn")

    if (editBtn) {
      editBtn.style.display = "inline-block"
      editBtn.onclick = () => {
        modal.style.display = "none"
        window.location.href = `edit-event.html?id=${eventId}`
      }
    }

    if (deleteBtn) {
      deleteBtn.style.display = "inline-block"
      deleteBtn.onclick = () => {
        modal.style.display = "none"
        this.showDeleteModal(eventId)
      }
    }
  }

  initEventDetailsModal() {
    const modal = document.getElementById("eventDetailsModal")
    const closeBtn = modal?.querySelector(".close")

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeEventDetailsModal())
    }

    if (modal) {
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeEventDetailsModal()
        }
      })
    }
  }

  closeEventDetailsModal() {
    const modal = document.getElementById("eventDetailsModal")
    if (modal) {
      modal.style.display = "none"
    }
  }

  // Modal Management
  initModal() {
    const modal = document.getElementById("successModal")
    const closeBtn = modal?.querySelector(".close")

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal())
    }

    if (modal) {
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal()
        }
      })
    }
  }

  showSuccessModal() {
    const modal = document.getElementById("successModal")
    if (modal) {
      modal.style.display = "block"
    }
  }

  closeModal() {
    const modal = document.getElementById("successModal")
    if (modal) {
      modal.style.display = "none"
    }
  }

  // Delete Modal Management
  initDeleteModal() {
    const deleteModal = document.getElementById("deleteModal")
    const confirmDelete = document.getElementById("confirmDelete")
    const cancelDelete = document.getElementById("cancelDelete")

    if (confirmDelete) {
      confirmDelete.addEventListener("click", () => {
        if (this.currentDeleteId) {
          this.deleteEvent(this.currentDeleteId)
          this.displayEvents()
          this.displayStats()
          this.hideDeleteModal()
          this.currentDeleteId = null
          this.showNotification("Event deleted successfully!", "success")
        }
      })
    }

    if (cancelDelete) {
      cancelDelete.addEventListener("click", () => {
        this.hideDeleteModal()
        this.currentDeleteId = null
      })
    }

    if (deleteModal) {
      window.addEventListener("click", (e) => {
        if (e.target === deleteModal) {
          this.hideDeleteModal()
          this.currentDeleteId = null
        }
      })
    }
  }

  showDeleteModal(eventId) {
    this.currentDeleteId = eventId
    const modal = document.getElementById("deleteModal")
    if (modal) {
      modal.style.display = "block"
    }
  }

  hideDeleteModal() {
    const modal = document.getElementById("deleteModal")
    if (modal) {
      modal.style.display = "none"
    }
  }

  // Notification System
  showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 4000)
  }

  // Utility Methods
  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  formatTime(timeString) {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  // Animation on Scroll
  animateOnScroll() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }
      })
    }, observerOptions)

    document.querySelectorAll(".feature-card").forEach((card) => {
      card.style.opacity = "0"
      card.style.transform = "translateY(30px)"
      card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
      observer.observe(card)
    })
  }
}

// Initialize the Event Manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EventManager()
})

// Global functions for modal management
function closeModal() {
  const modal = document.getElementById("successModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function closeEventDetailsModal() {
  const modal = document.getElementById("eventDetailsModal")
  if (modal) {
    modal.style.display = "none"
  }
}
