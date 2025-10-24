// Theme Management System with Career Subjects Control
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle');
    this.themeIcon = document.getElementById('themeIcon');
    this.themeText = document.getElementById('themeText');
    this.currentTheme = this.getStoredTheme() || this.getSystemPreference();
    
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
    this.updateParticleColors(this.currentTheme);
    this.updateCareerSubjects(this.currentTheme);
  }

  getStoredTheme() {
    return localStorage.getItem('skillora-theme');
  }

  getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.updateToggleButton(theme);
    this.saveTheme(theme);
    this.updateParticleColors(theme);
    this.updateCareerSubjects(theme);
  }

  updateToggleButton(theme) {
    if (this.themeIcon && this.themeText) {
      if (theme === 'dark') {
        this.themeIcon.className = 'fas fa-sun';
        this.themeText.textContent = 'Light Mode';
      } else {
        this.themeIcon.className = 'fas fa-moon';
        this.themeText.textContent = 'Dark Mode';
      }
    }
  }

  // Update career subjects based on theme
  updateCareerSubjects(theme) {
    const interviwerList = document.getElementById('interviwer-subjects');
    const interviweeList = document.getElementById('interviwee-subjects');
    const sidebarTitle = document.getElementById('sidebar-title');
    
    if (interviwerList && interviweeList && sidebarTitle) {
      if (theme === 'dark') {
        // Dark mode: Show interviwee Subjects
        interviwerList.style.display = 'none';
        interviweeList.style.display = 'block';
        sidebarTitle.textContent = 'interviwee Subjects';
      } else {
        // Light mode: Show interviwer Subjects
        interviweeList.style.display = 'none';
        interviwerList.style.display = 'block';
        sidebarTitle.textContent = 'interviwer Subjects';
      }
    }
  }

  updateParticleColors(theme) {
    if (window.particlesArray && window.colors) {
      window.colors = theme === 'dark' ? { dark: "#00faff", light: "#ff8800" } : { dark: "#00faff", light: "#ff8800" };
    }
  }

  saveTheme(theme) {
    localStorage.setItem('skillora-theme', theme);
    this.currentTheme = theme;
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  setupEventListeners() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// Game functionality
class GameManager {
  constructor() {
    this.currentQuestion = 0;
    this.score = 0;
    this.questions = [];
    this.init();
  }

  init() {
    this.loadQuestions();
    this.setupEventListeners();
  }

  loadQuestions() {
    // Sample questions - in a real app, these would come from an API
    this.questions = [
      {
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Hyper Transfer Markup Language",
          "Home Tool Markup Language"
        ],
        correct: 0
      },
      {
        question: "Which of the following is a JavaScript framework?",
        options: [
          "React",
          "Laravel",
          "Django",
          "Flask"
        ],
        correct: 0
      },
      {
        question: "What does CSS stand for?",
        options: [
          "Cascading Style Sheets",
          "Computer Style Sheets",
          "Creative Style System",
          "Colorful Style Sheets"
        ],
        correct: 0
      },
      {
        question: "Which language is used for web styling?",
        options: [
          "CSS",
          "HTML",
          "JavaScript",
          "Python"
        ],
        correct: 0
      },
      {
        question: "What is the purpose of JavaScript in web development?",
        options: [
          "To add interactivity to web pages",
          "To structure web content",
          "To style web pages",
          "To manage databases"
        ],
        correct: 0
      }
    ];

    this.displayQuestion();
  }

  displayQuestion() {
    if (this.currentQuestion >= this.questions.length) {
      this.showResults();
      return;
    }

    const question = this.questions[this.currentQuestion];
    const questionElement = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const progressElement = document.getElementById('progress');
    const questionCountElement = document.getElementById('question-count');

    if (questionElement) {
      questionElement.textContent = question.question;
    }

    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => this.selectOption(index);
        optionsContainer.appendChild(button);
      });
    }

    if (progressElement) {
      const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
      progressElement.style.width = `${progress}%`;
    }

    if (questionCountElement) {
      questionCountElement.textContent = `Question ${this.currentQuestion + 1} of ${this.questions.length}`;
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.disabled = true;
    }
  }

  selectOption(selectedIndex) {
    const question = this.questions[this.currentQuestion];
    const options = document.querySelectorAll('.option-btn');
    const nextBtn = document.getElementById('next-btn');

    options.forEach((option, index) => {
      option.disabled = true;
      if (index === question.correct) {
        option.classList.add('correct');
      } else if (index === selectedIndex && index !== question.correct) {
        option.classList.add('incorrect');
      }
    });

    if (selectedIndex === question.correct) {
      this.score++;
    }

    if (nextBtn) {
      nextBtn.disabled = false;
    }
  }

  nextQuestion() {
    this.currentQuestion++;
    this.displayQuestion();
  }

  showResults() {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.innerHTML = `
        <div class="game-header">
          <h1>Quiz Completed!</h1>
          <p>Your score: ${this.score} out of ${this.questions.length}</p>
          <button class="game-btn" onclick="location.reload()">Restart Quiz</button>
        </div>
      `;
    }
  }

  setupEventListeners() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme manager
  window.themeManager = new ThemeManager();
  
  // Initialize game manager if on game page
  if (document.getElementById('game-container')) {
    window.gameManager = new GameManager();
  }
  
  // Particle animation
  const canvas = document.getElementById("particles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particlesArray;

    // Particle colors based on theme
    window.colors = { 
      dark: "#00faff", 
      light: "#ff8800" 
    };
    
    // Set initial theme
    let theme = document.documentElement.getAttribute('data-theme') || 'light';

    // resize
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 3.5;
        this.speedX = (Math.random() - 0.5) * 1;
        this.speedY = (Math.random() - 0.5) * 1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = window.colors[theme];
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    function init() {
      particlesArray = [];
      for (let i = 0; i < 80; i++) {
        particlesArray.push(new Particle());
      }
      window.particlesArray = particlesArray;
    }

    function animate() {
      // Set canvas background to match body background
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--background');
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let p of particlesArray) {
        p.update();
        p.draw();
      }
      requestAnimationFrame(animate);
    }

    // Update particle colors when theme changes
    window.updateParticleColors = function(newTheme) {
      theme = newTheme;
    };

    // Initialize particles and animation
    init();
    animate();
  }

  // Review page functionality
  const stars = document.querySelectorAll('#starRating i');
  const ratingText = document.getElementById('rating-text');
  const ratingValue = document.getElementById('rating-value');
  
  if (stars.length > 0) {
    const ratingDescriptions = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    
    stars.forEach(star => {
      star.addEventListener('click', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        
        stars.forEach((s, index) => {
          if (index < rating) {
            s.classList.remove('far');
            s.classList.add('fas', 'active');
          } else {
            s.classList.remove('fas', 'active');
            s.classList.add('far');
          }
        });
        
        if (ratingText) ratingText.textContent = ratingDescriptions[rating];
        if (ratingValue) ratingValue.value = rating;
      });
      
      star.addEventListener('mouseover', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        
        stars.forEach((s, index) => {
          if (index < rating) {
            s.classList.add('hover');
          } else {
            s.classList.remove('hover');
          }
        });
      });
      
      star.addEventListener('mouseout', function() {
        stars.forEach(s => {
          s.classList.remove('hover');
        });
      });
    });
    
    const reviewForm = document.getElementById('reviewForm');
    const successMessage = document.getElementById('successMessage');
    
    if (reviewForm) {
      reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (ratingValue && ratingValue.value === '') {
          alert('Please select a rating');
          return;
        }
        
        if (successMessage) {
          successMessage.style.display = 'block';
        }
        
        setTimeout(function() {
          if (reviewForm) reviewForm.reset();
          if (successMessage) successMessage.style.display = 'none';
          
          stars.forEach(star => {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
          });
          
          if (ratingText) ratingText.textContent = 'Select a rating';
          if (ratingValue) ratingValue.value = '';
        }, 3000);
      });
    }
  }

  // FAQ functionality
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
      question.addEventListener('click', () => {
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        item.classList.toggle('active');
      });
    }
  });

  // Subscription FAQ functionality
  const subscriptionFaqItems = document.querySelectorAll('.subscription-faq-item');
  
  subscriptionFaqItems.forEach(item => {
    const question = item.querySelector('.subscription-faq-question');
    
    if (question) {
      question.addEventListener('click', () => {
        subscriptionFaqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        item.classList.toggle('active');
      });
    }
  });

  // Subscription functionality
  const subscribeButtons = document.querySelectorAll('.btn-subscribe');
  
  subscribeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const planCard = this.closest('.plan-card');
      const planName = planCard.querySelector('.plan-name').textContent;
      const planPrice = planCard.querySelector('.plan-price').textContent;
      
      alert(`You've selected the ${planName} plan at ${planPrice}/month. You would now be redirected to our secure payment page.`);
    });
  });

  // Contact form functionality
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('name')?.value,
        email: document.getElementById('email')?.value,
        subject: document.getElementById('subject')?.value,
        message: document.getElementById('message')?.value
      };
      
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        alert('Please fill in all fields');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      console.log('Form submitted:', formData);
      alert('Thank you for your message! We will get back to you soon.');
      contactForm.reset();
    });
  }

  // Evaluation form functionality
  const evaluationForm = document.getElementById('evaluationForm');
  if (evaluationForm) {
    // Update range values in real-time
    const technicalSlider = document.getElementById('technical-skills');
    const technicalValue = document.getElementById('technical-value');
    const communicationSlider = document.getElementById('communication');
    const communicationValue = document.getElementById('communication-value');
    const problemSolvingSlider = document.getElementById('problem-solving');
    const problemSolvingValue = document.getElementById('problem-solving-value');
    
    if (technicalSlider && technicalValue) {
      technicalSlider.addEventListener('input', function() {
        technicalValue.textContent = this.value;
      });
    }
    
    if (communicationSlider && communicationValue) {
      communicationSlider.addEventListener('input', function() {
        communicationValue.textContent = this.value;
      });
    }
    
    if (problemSolvingSlider && problemSolvingValue) {
      problemSolvingSlider.addEventListener('input', function() {
        problemSolvingValue.textContent = this.value;
      });
    }
    
    evaluationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        technicalSkills: document.getElementById('technical-skills')?.value,
        communication: document.getElementById('communication')?.value,
        problemSolving: document.getElementById('problem-solving')?.value,
        overallImpression: document.getElementById('overall-impression')?.value,
        recommendation: document.getElementById('recommendation')?.value
      };
      
      console.log('Evaluation submitted:', formData);
      alert('Evaluation submitted successfully!');
      evaluationForm.reset();
      
      // Reset range values
      if (technicalValue) technicalValue.textContent = '5';
      if (communicationValue) communicationValue.textContent = '5';
      if (problemSolvingValue) problemSolvingValue.textContent = '5';
    });
  }

  // Get started button functionality
  const getStartedBtn = document.querySelector('.banner-content button');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function() {
      window.location.href = 'interviwer.html';
    });
  }
});

// Navigation functions
function toggleSecondBar() {
  const secondBar = document.getElementById('second-bar');
  const arrow = document.querySelector('.click-toggle i');
  
  if (secondBar && arrow) {
    secondBar.classList.toggle('hidden');
    
    if (secondBar.classList.contains('hidden')) {
      arrow.classList.remove('fa-angle-down');
      arrow.classList.add('fa-angle-up');
    } else {
      arrow.classList.remove('fa-angle-up');
      arrow.classList.add('fa-angle-down');
    }
  }
}

function toggleSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.classList.toggle('active');
    
    if (searchInput.classList.contains('active')) {
      searchInput.focus();
    }
  }
}

function toggleLogin() {
  alert('Login functionality would be implemented here.');
}

function toggleSignup() {
  alert('Signup functionality would be implemented here.');
}

function openSidebar() {
  const sidebar = document.getElementById('career-sidebar');
  if (sidebar) {
    sidebar.classList.add('active');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('career-sidebar');
  if (sidebar) {
    sidebar.classList.remove('active');
  }
}

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
  const sidebar = document.getElementById('career-sidebar');
  const careerBtn = document.querySelector('.btn.career');
  
  if (sidebar && careerBtn) {
    if (!sidebar.contains(event.target) && 
        event.target !== careerBtn && 
        !careerBtn.contains(event.target)) {
      closeSidebar();
    }
  }
});

// FAQ toggle function
function toggleFAQ(element) {
  const answer = element.nextElementSibling;
  const icon = element.querySelector('i');
  
  if (answer && icon) {
    answer.classList.toggle('active');
    
    if (answer.classList.contains('active')) {
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    } else {
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  }
}

function openGoogleMaps() {
  window.open('https://maps.google.com/?q=Latifabad,Hyderabad,Sindh,Pakistan', '_blank');
}


// Initialize AOS
    AOS.init({
      duration: 800, // default animation duration
      once: true, // whether animation should happen only once
      offset: 100, // offset (in px) from the original trigger point
    });