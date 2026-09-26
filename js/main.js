/**
 * StandardsBridge | Frontend Application Logic
 * Brand Standards Intelligence Platform for UK Hospitality Franchisors
 */

(function () {
  'use strict';

  // Constants
  const STORAGE_KEY = 'standardsbridgePilotRequests';
  const LEGACY_STORAGE_KEY = 'standardsbridge_pilot_requests';

  // DOM Elements - Navigation
  const siteHeader = document.getElementById('siteHeader');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  // DOM Elements - Modals
  const pilotModal = document.getElementById('pilotModal');
  const closePilotModalBtn = document.getElementById('closePilotModal');
  const openPilotButtons = document.querySelectorAll('.open-pilot-modal');

  const legalModal = document.getElementById('legalModal');
  const closeLegalModalBtn = document.getElementById('closeLegalModal');
  const closeLegalFooterBtn = document.getElementById('closeLegalFooterBtn');
  const openLegalButtons = document.querySelectorAll('.open-legal-modal');
  const legalModalTitle = document.getElementById('legalModalTitle');
  const legalModalBody = document.getElementById('legalModalBody');

  // DOM Elements - Forms
  const inlinePilotForm = document.getElementById('inlinePilotForm');
  const inlineSuccessMessage = document.getElementById('inlineSuccessMessage');

  const modalPilotForm = document.getElementById('modalPilotForm');
  const modalSuccessMessage = document.getElementById('modalSuccessMessage');

  // DOM Elements - FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');

  /* ==========================================================================
     1. STORAGE MANAGEMENT (localStorage only, no backend/API/database)
     ========================================================================== */

  /**
   * Retrieves all submissions safely from browser localStorage.
   * @returns {Array<Object>} List of submitted requests.
   */
  function getSubmissions() {
    try {
      let data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        data = localStorage.getItem(LEGACY_STORAGE_KEY);
      }
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('StandardsBridge: Unable to parse localStorage records', e);
      return [];
    }
  }

  /**
   * Appends a new submission to browser localStorage.
   * Never overwrites or deletes previous entries.
   * @param {Object} submission - The pilot inquiry object.
   * @returns {boolean} Success status.
   */
  function saveSubmission(submission) {
    try {
      const currentList = getSubmissions();
      // Append new submission
      currentList.push(submission);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
      return true;
    } catch (e) {
      console.error('StandardsBridge: Error writing to localStorage', e);
      return false;
    }
  }

  /* ==========================================================================
     2. FORM VALIDATION & HANDLING
     ========================================================================== */

  /**
   * Validates pilot inquiry form fields according to business specifications:
   * - Full Name: Required, minimum 2 characters
   * - Phone Number: Valid phone format, no alphabetic characters allowed
   * - Email: Valid email with @ and domain extension
   * - Organisation Name: Required
   */
  function validateField(inputEl, errorEl, fieldType) {
    const value = inputEl.value.trim();
    let errorMessage = '';

    if (fieldType === 'name') {
      if (!value) {
        errorMessage = 'Full Name is required.';
      } else if (value.length < 2) {
        errorMessage = 'Please enter at least 2 characters.';
      } else if (/[0-9]/.test(value)) {
        errorMessage = 'Name should not contain numbers.';
      }
    } else if (fieldType === 'org') {
      if (!value) {
        errorMessage = 'Organisation Name is required.';
      } else if (value.length < 2) {
        errorMessage = 'Please enter your franchise organisation name.';
      }
    } else if (fieldType === 'email') {
      // Must contain valid email format with @ and domain extension (.co.uk, .com, etc.)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!value) {
        errorMessage = 'Email address is required.';
      } else if (!emailRegex.test(value)) {
        errorMessage = 'Please enter a valid email address with domain (e.g. name@domain.co.uk).';
      }
    } else if (fieldType === 'phone') {
      // Strictly no alphabets allowed, valid phone format with optional +, spaces, hyphens, parentheses, 7-16 digits
      const hasAlphabets = /[a-zA-Z]/.test(value);
      const digitsOnly = value.replace(/\D/g, '');

      if (!value) {
        errorMessage = 'Phone number is required.';
      } else if (hasAlphabets) {
        errorMessage = 'Phone number must not contain letters.';
      } else if (digitsOnly.length < 7 || digitsOnly.length > 16) {
        errorMessage = 'Please enter a valid telephone number (7 to 16 digits).';
      }
    }

    const parentGroup = inputEl.closest('.form-group');
    if (errorMessage) {
      if (parentGroup) parentGroup.classList.add('has-error');
      if (errorEl) errorEl.textContent = errorMessage;
      return false;
    } else {
      if (parentGroup) parentGroup.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  }

  /**
   * Binds real-time validation and submission handler to a pilot request form.
   */
  function setupFormHandler(formEl, successEl, prefix) {
    if (!formEl) return;

    const nameInput = formEl.querySelector(`[name="fullName"]`);
    const orgInput = formEl.querySelector(`[name="organisationName"]`);
    const emailInput = formEl.querySelector(`[name="email"]`);
    const phoneInput = formEl.querySelector(`[name="phone"]`);

    const nameError = document.getElementById(`error-${prefix}-name`);
    const orgError = document.getElementById(`error-${prefix}-org`);
    const emailError = document.getElementById(`error-${prefix}-email`);
    const phoneError = document.getElementById(`error-${prefix}-phone`);

    // Live validation on blur and input
    if (nameInput) {
      nameInput.addEventListener('blur', () => validateField(nameInput, nameError, 'name'));
      nameInput.addEventListener('input', () => {
        if (nameInput.closest('.form-group').classList.contains('has-error')) {
          validateField(nameInput, nameError, 'name');
        }
      });
    }

    if (orgInput) {
      orgInput.addEventListener('blur', () => validateField(orgInput, orgError, 'org'));
      orgInput.addEventListener('input', () => {
        if (orgInput.closest('.form-group').classList.contains('has-error')) {
          validateField(orgInput, orgError, 'org');
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('blur', () => validateField(emailInput, emailError, 'email'));
      emailInput.addEventListener('input', () => {
        if (emailInput.closest('.form-group').classList.contains('has-error')) {
          validateField(emailInput, emailError, 'email');
        }
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('blur', () => validateField(phoneInput, phoneError, 'phone'));
      phoneInput.addEventListener('input', (e) => {
        // Disallow alphabets in real-time
        if (/[a-zA-Z]/.test(e.target.value)) {
          e.target.value = e.target.value.replace(/[a-zA-Z]/g, '');
        }
        if (phoneInput.closest('.form-group').classList.contains('has-error')) {
          validateField(phoneInput, phoneError, 'phone');
        }
      });
    }

    // Submit handler
    formEl.addEventListener('submit', function (event) {
      event.preventDefault();

      const isNameValid = validateField(nameInput, nameError, 'name');
      const isOrgValid = validateField(orgInput, orgError, 'org');
      const isEmailValid = validateField(emailInput, emailError, 'email');
      const isPhoneValid = validateField(phoneInput, phoneError, 'phone');

      if (!isNameValid || !isOrgValid || !isEmailValid || !isPhoneValid) {
        // Prevent submission and focus first invalid input
        if (!isNameValid) nameInput.focus();
        else if (!isOrgValid) orgInput.focus();
        else if (!isEmailValid) emailInput.focus();
        else if (!isPhoneValid) phoneInput.focus();
        return;
      }

      // Capture exact timestamp
      const now = new Date();
      const submissionRecord = {
        id: 'REQ-' + Date.now().toString(36).toUpperCase(),
        fullName: nameInput.value.trim(),
        organisationName: orgInput.value.trim(),
        email: emailInput.value.trim(),
        emailAddress: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        phoneNumber: phoneInput.value.trim(),
        submissionDateTime: now.toISOString(),
        'Submission Date/Time': now.toISOString(),
        submissionFormattedUK: now.toLocaleString('en-GB', {
          timeZone: 'Europe/London',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      };

      // Save to localStorage (appended, never overwritten)
      saveSubmission(submissionRecord);

      // Display required success message:
      // "Thank you. Your pilot request has been submitted successfully."
      if (successEl) {
        successEl.style.display = 'flex';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form fields
      formEl.reset();
      [nameInput, orgInput, emailInput, phoneInput].forEach(inp => {
        if (inp && inp.closest('.form-group')) {
          inp.closest('.form-group').classList.remove('has-error');
        }
      });
    });
  }

  /* ==========================================================================
     3. MODAL MANAGEMENT
     ========================================================================== */

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first input or button
    const focusable = modalEl.querySelector('input, button:not(.modal-close)');
    if (focusable) focusable.focus();
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setupModals() {
    // Pilot Modal triggers
    openPilotButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // Hide success message from previous submissions if any
        if (modalSuccessMessage) modalSuccessMessage.style.display = 'none';
        openModal(pilotModal);
      });
    });

    if (closePilotModalBtn) {
      closePilotModalBtn.addEventListener('click', () => closeModal(pilotModal));
    }

    // Legal Modal
    openLegalButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const type = btn.getAttribute('data-modal');
        if (type === 'privacy') {
          legalModalTitle.textContent = 'Privacy Policy';
          legalModalBody.innerHTML = `
            <h3>1. Introduction &amp; UK GDPR Scope</h3>
            <p>StandardsBridge Intelligence ("StandardsBridge", "we", "our") is dedicated to safeguarding operational and commercial data. This policy outlines our handling of pilot inquiries and system telemetry under the UK Data Protection Act 2018 and UK GDPR.</p>
            <h3>2. Data Collection During Pilot Inquiries</h3>
            <p>When you submit a pilot request, the details entered (Full Name, Organisation Name, Business Email Address, and Phone Number) are stored locally within your browser's persistent storage (<code class="code-inline">localStorage</code>) for pilot evaluation records.</p>
            <h3>3. Enterprise Operational Data Isolation</h3>
            <p>During live pilot engagements, StandardsBridge functions as an independent analytical layer. We ingest anonymised POS, inventory, and shift telemetry without storing unencrypted customer credit information or unnecessary employee PII.</p>
            <h3>4. Confidentiality &amp; Non-Disclosure</h3>
            <p>All estate metrics, brand compliance ratings, and operational anomaly data remain the proprietary property of the respective franchisor organisation.</p>
            <h3>5. Contact Us</h3>
            <p>For any privacy or data governance inquiries, contact Aarati Khanal, Founder &amp; Key Innovator, London, United Kingdom.</p>
          `;
        } else {
          legalModalTitle.textContent = 'Terms & Conditions';
          legalModalBody.innerHTML = `
            <h3>1. Agreement to Terms</h3>
            <p>These terms govern the use of the StandardsBridge Intelligence marketing platform and participation in the UK Franchisor Early Adopter Pilot Program.</p>
            <h3>2. Non-Disruptive Intelligence Layer</h3>
            <p>StandardsBridge connects to existing hospitality management infrastructure (POS, inventory, rota, hygiene) strictly as an analytical layer. StandardsBridge does not alter or replace underlying transactional records in third-party systems.</p>
            <h3>3. Pilot Evaluation Criteria</h3>
            <p>Pilot access is provided to eligible multi-site hospitality franchisors operating within the United Kingdom. Participation is subject to mutual agreement on site footprint and API/data compatibility.</p>
            <h3>4. Intellectual Property</h3>
            <p>The StandardsBridge Brand Standards Intelligence platform, including predictive algorithms, anomaly detection routines, and estate benchmarking methodologies, are proprietary intellectual property.</p>
            <h3>5. Governing Law</h3>
            <p>These terms and any pilot agreements are governed exclusively by the laws of England and Wales.</p>
          `;
        }
        openModal(legalModal);
      });
    });

    if (closeLegalModalBtn) {
      closeLegalModalBtn.addEventListener('click', () => closeModal(legalModal));
    }

    if (closeLegalFooterBtn) {
      closeLegalFooterBtn.addEventListener('click', () => closeModal(legalModal));
    }

    // Close on backdrop click
    [pilotModal, legalModal].forEach(modal => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(pilotModal);
        closeModal(legalModal);
        closeMobileDrawer();
      }
    });
  }

  /* ==========================================================================
     5. FAQ ACCORDION
     ========================================================================== */

  function setupFaqAccordion() {
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const body = item.querySelector('.faq-body');

      if (!trigger || !body) return;

      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          const otherBody = otherItem.querySelector('.faq-body');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherBody) otherBody.style.display = 'none';
        });

        // Toggle current item
        if (!isActive) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          body.style.display = 'block';
        }
      });
    });
  }

  /* ==========================================================================
     6. NAVIGATION, MOBILE DRAWER & SCROLL SPY
     ========================================================================== */

  function toggleMobileDrawer() {
    if (!mobileDrawer || !mobileMenuToggle) return;
    const isOpen = mobileDrawer.classList.contains('open');
    if (isOpen) {
      closeMobileDrawer();
    } else {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      mobileMenuToggle.classList.add('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileDrawer() {
    if (!mobileDrawer || !mobileMenuToggle) return;
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileMenuToggle.classList.remove('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function setupNavigation() {
    // Mobile hamburger click
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', toggleMobileDrawer);
    }

    // Close drawer when clicking mobile nav links
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileDrawer();
      });
    });

    // Sticky header shadow on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }, { passive: true });

    // Active navigation scroll-spy
    window.addEventListener('scroll', () => {
      let currentSection = '';
      const scrollPos = window.scrollY + 140;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  /* ==========================================================================
     7. INITIALIZATION
     ========================================================================== */

  function init() {
    setupFormHandler(inlinePilotForm, inlineSuccessMessage, 'inline');
    setupFormHandler(modalPilotForm, modalSuccessMessage, 'modal');
    setupModals();
    setupFaqAccordion();
    setupNavigation();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
